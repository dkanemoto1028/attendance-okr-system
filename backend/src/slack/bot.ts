import { App, type BlockAction, type ButtonAction } from "@slack/bolt";
import type Database from "better-sqlite3";
import { AttendanceService } from "../services/attendance.service.js";
import { OkrService } from "../services/okr.service.js";
import { AIService } from "../services/ai.service.js";

/**
 * Resolve Slack user ID to internal employee ID
 */
function getEmployeeBySlack(db: Database.Database, slackUserId: string) {
  return db.prepare("SELECT * FROM employees WHERE slack_user_id = ?").get(slackUserId) as
    | { id: string; name: string; manager_id: string | null }
    | undefined;
}

/**
 * Build check-in Block Kit message
 */
function buildCheckInBlocks(name: string) {
  return [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `おはようございます、*${name}*さん！ 🌅\n本日の勤務を開始してください。`,
      },
    },
    {
      type: "actions",
      block_id: "checkin_actions",
      elements: [
        {
          type: "button",
          text: { type: "plain_text", text: "✅ 出勤（オフィス）", emoji: true },
          style: "primary",
          action_id: "checkin_office",
          value: "present",
        },
        {
          type: "button",
          text: { type: "plain_text", text: "🏠 出勤（在宅）", emoji: true },
          action_id: "checkin_remote",
          value: "remote",
        },
        {
          type: "button",
          text: { type: "plain_text", text: "🌴 本日は休暇", emoji: true },
          action_id: "checkin_leave",
          value: "leave",
        },
      ],
    },
  ];
}

/**
 * Build leave request blocks
 */
function buildLeaveRequestBlocks() {
  return [
    {
      type: "section",
      text: { type: "mrkdwn", text: "📅 *休暇申請* — 申請内容を入力してください" },
    },
    {
      type: "input",
      block_id: "leave_type",
      label: { type: "plain_text", text: "休暇の種類" },
      element: {
        type: "static_select",
        action_id: "leave_type_select",
        options: [
          { text: { type: "plain_text", text: "有給休暇" }, value: "annual" },
          { text: { type: "plain_text", text: "病欠" }, value: "sick" },
          { text: { type: "plain_text", text: "特別休暇" }, value: "special" },
        ],
      },
    },
    {
      type: "input",
      block_id: "leave_start",
      label: { type: "plain_text", text: "開始日" },
      element: { type: "datepicker", action_id: "leave_start_date" },
    },
    {
      type: "input",
      block_id: "leave_end",
      label: { type: "plain_text", text: "終了日" },
      element: { type: "datepicker", action_id: "leave_end_date" },
    },
    {
      type: "input",
      block_id: "leave_reason",
      optional: true,
      label: { type: "plain_text", text: "理由（任意）" },
      element: { type: "plain_text_input", action_id: "leave_reason_input", multiline: true },
    },
  ];
}

export function registerSlackHandlers(slackApp: App, db: Database.Database) {
  const attendanceSvc = new AttendanceService(db);
  const okrSvc = new OkrService(db);
  const aiSvc = new AIService(db);

  // ── /attendance — 打刻メニュー
  slackApp.command("/attendance", async ({ command, ack, client }) => {
    await ack();
    const emp = getEmployeeBySlack(db, command.user_id);
    if (!emp) {
      await client.chat.postEphemeral({
        channel: command.channel_id,
        user: command.user_id,
        text: "⚠️ システムに登録されていません。管理者に連絡してください。",
      });
      return;
    }

    await client.chat.postEphemeral({
      channel: command.channel_id,
      user: command.user_id,
      blocks: buildCheckInBlocks(emp.name),
      text: "勤怠打刻",
    });
  });

  // ── /checkout — 退勤
  slackApp.command("/checkout", async ({ command, ack, client }) => {
    await ack();
    const emp = getEmployeeBySlack(db, command.user_id);
    if (!emp) return;

    const result = attendanceSvc.checkOut(emp.id);
    await client.chat.postEphemeral({
      channel: command.channel_id,
      user: command.user_id,
      text: result.message,
    });
  });

  // ── /leave — 休暇申請モーダル
  slackApp.command("/leave", async ({ command, ack, client }) => {
    await ack();
    await client.views.open({
      trigger_id: command.trigger_id,
      view: {
        type: "modal",
        callback_id: "leave_submit",
        title: { type: "plain_text", text: "休暇申請" },
        submit: { type: "plain_text", text: "申請する" },
        close: { type: "plain_text", text: "キャンセル" },
        private_metadata: command.user_id,
        blocks: buildLeaveRequestBlocks(),
      },
    });
  });

  // ── /mystatus — 自分の勤怠サマリー
  slackApp.command("/mystatus", async ({ command, ack, client }) => {
    await ack();
    const emp = getEmployeeBySlack(db, command.user_id);
    if (!emp) return;

    const yearMonth = new Date().toISOString().slice(0, 7);
    const monthly = attendanceSvc.getMonthlyStats(emp.id, yearMonth) as {
      total_overtime: number;
      leave_count: number;
    } | undefined;
    const balance = db.prepare(
      "SELECT * FROM leave_balances WHERE employee_id = ? AND year = ?"
    ).get(emp.id, new Date().getFullYear()) as {
      annual_used: number; annual_total: number;
    } | undefined;
    const okrs = okrSvc.getByOwner(emp.id);

    const remaining = balance ? balance.annual_total - balance.annual_used : "—";
    const overtime = monthly?.total_overtime?.toFixed(1) ?? "0.0";

    const blocks = [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `📊 *${emp.name}さんの勤怠サマリー* — ${yearMonth}`,
        },
      },
      { type: "divider" },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*残有給日数*\n🌴 ${remaining}日` },
          { type: "mrkdwn", text: `*今月の残業*\n⏰ ${overtime}h` },
        ],
      },
      ...(okrs.length > 0
        ? [
            { type: "divider" },
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `🎯 *Q2 OKR進捗*\n${okrs[0].objective}`,
              },
            },
          ]
        : []),
    ];

    await client.chat.postEphemeral({
      channel: command.channel_id,
      user: command.user_id,
      blocks,
      text: "勤怠サマリー",
    });
  });

  // ── /team-status — マネージャー向けチーム状況
  slackApp.command("/team-status", async ({ command, ack, client }) => {
    await ack();
    const emp = getEmployeeBySlack(db, command.user_id);
    if (!emp) return;

    const team = attendanceSvc.getTeamTodayStatus(emp.id) as Array<{
      name: string; status: string; overtime_hours: number;
    }>;

    if (!team.length) {
      await client.chat.postEphemeral({
        channel: command.channel_id,
        user: command.user_id,
        text: "チームメンバーが見つかりません",
      });
      return;
    }

    const statusEmoji: Record<string, string> = {
      present: "🟢", remote: "🔵", leave: "🌴", absent: "⚠️",
    };

    const lines = team.map(
      (m) => `${statusEmoji[m.status] ?? "❓"} *${m.name}* — ${
        { present: "出勤中", remote: "在宅勤務", leave: "有給休暇", absent: "未打刻" }[m.status] ?? m.status
      }${m.overtime_hours > 0 ? ` (残業${m.overtime_hours.toFixed(1)}h)` : ""}`
    );

    await client.chat.postEphemeral({
      channel: command.channel_id,
      user: command.user_id,
      blocks: [
        {
          type: "section",
          text: { type: "mrkdwn", text: `*チーム勤怠状況（本日）*\n${lines.join("\n")}` },
        },
      ],
      text: "チーム状況",
    });
  });

  // ── Button: 出勤（オフィス）
  slackApp.action("checkin_office", async ({ body, ack, client }) => {
    await ack();
    const emp = getEmployeeBySlack(db, body.user.id);
    if (!emp) return;
    const result = attendanceSvc.checkIn(emp.id, "present");
    await client.chat.postEphemeral({
      channel: (body as BlockAction).channel?.id ?? body.user.id,
      user: body.user.id,
      text: result.message,
    });
  });

  // ── Button: 出勤（在宅）
  slackApp.action("checkin_remote", async ({ body, ack, client }) => {
    await ack();
    const emp = getEmployeeBySlack(db, body.user.id);
    if (!emp) return;
    const result = attendanceSvc.checkIn(emp.id, "remote");
    await client.chat.postEphemeral({
      channel: (body as BlockAction).channel?.id ?? body.user.id,
      user: body.user.id,
      text: result.message,
    });
  });

  // ── Button: 休暇
  slackApp.action("checkin_leave", async ({ body, ack, client }) => {
    await ack();
    const emp = getEmployeeBySlack(db, body.user.id);
    if (!emp) return;
    const today = new Date().toISOString().split("T")[0];
    db.prepare(
      "INSERT OR IGNORE INTO attendance (id, employee_id, date, status, overtime_hours) VALUES (?, ?, ?, 'leave', 0)"
    ).run(`a_${emp.id}_${today}`, emp.id, today);
    await client.chat.postEphemeral({
      channel: (body as BlockAction).channel?.id ?? body.user.id,
      user: body.user.id,
      text: "🌴 本日の休暇を記録しました。良い休日を！",
    });
  });

  // ── Modal: 休暇申請送信
  slackApp.view("leave_submit", async ({ ack, view, client }) => {
    await ack();
    const slackUserId = view.private_metadata;
    const emp = getEmployeeBySlack(db, slackUserId);
    if (!emp) return;

    const values = view.state.values;
    const leaveType = values.leave_type?.leave_type_select?.selected_option?.value ?? "annual";
    const startDate = values.leave_start?.leave_start_date?.selected_date ?? "";
    const endDate = values.leave_end?.leave_end_date?.selected_date ?? "";
    const reason = values.leave_reason?.leave_reason_input?.value ?? "";

    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
    const id = `lr_${emp.id}_${Date.now()}`;

    db.prepare(`
      INSERT INTO leave_requests (id, employee_id, type, start_date, end_date, days, reason, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
    `).run(id, emp.id, leaveType, startDate, endDate, days, reason);

    // Notify manager
    if (emp.manager_id) {
      const manager = db.prepare("SELECT slack_user_id, name FROM employees WHERE id = ?").get(emp.manager_id) as
        | { slack_user_id: string; name: string }
        | undefined;

      if (manager?.slack_user_id) {
        const typeLabel = { annual: "有給休暇", sick: "病欠", special: "特別休暇", unpaid: "無給休暇" }[leaveType] ?? leaveType;
        await client.chat.postMessage({
          channel: manager.slack_user_id,
          text: `📋 ${emp.name}さんから休暇申請が届きました`,
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `📋 *休暇申請* — ${emp.name}さん\n種別: ${typeLabel}\n期間: ${startDate} 〜 ${endDate}（${days}日）${reason ? `\n理由: ${reason}` : ""}`,
              },
            },
            {
              type: "actions",
              elements: [
                { type: "button", text: { type: "plain_text", text: "✅ 承認" }, style: "primary", action_id: "leave_approve", value: id },
                { type: "button", text: { type: "plain_text", text: "❌ 却下" }, style: "danger", action_id: "leave_reject", value: id },
              ],
            },
          ],
        });
      }
    }
  });

  // ── Button: 休暇申請 承認
  slackApp.action<BlockAction<ButtonAction>>("leave_approve", async ({ body, action, ack, client }) => {
    await ack();
    const requestId = action.value;
    db.prepare("UPDATE leave_requests SET status = 'approved', updated_at = datetime('now') WHERE id = ?").run(requestId);

    const req = db.prepare(`
      SELECT lr.*, e.name, e.slack_user_id
      FROM leave_requests lr JOIN employees e ON e.id = lr.employee_id
      WHERE lr.id = ?
    `).get(requestId) as { name: string; slack_user_id?: string; start_date: string; end_date: string; days: number } | undefined;

    if (req?.slack_user_id) {
      await client.chat.postMessage({
        channel: req.slack_user_id,
        text: `✅ ${req.start_date}〜${req.end_date}（${req.days}日）の休暇申請が承認されました！`,
      });
    }
    await client.chat.postEphemeral({
      channel: body.channel?.id ?? body.user.id,
      user: body.user.id,
      text: `✅ ${req?.name}さんの申請を承認しました`,
    });
  });

  // ── Button: 休暇申請 却下
  slackApp.action<BlockAction<ButtonAction>>("leave_reject", async ({ body, action, ack, client }) => {
    await ack();
    const requestId = action.value;
    db.prepare("UPDATE leave_requests SET status = 'rejected', updated_at = datetime('now') WHERE id = ?").run(requestId);
    await client.chat.postEphemeral({
      channel: body.channel?.id ?? body.user.id,
      user: body.user.id,
      text: "❌ 申請を却下しました",
    });
  });
}

/**
 * Send morning check-in reminders (call from cron)
 */
export async function sendMorningReminders(slackApp: App, db: Database.Database) {
  const svc = new AttendanceService(db);
  const unpunched = svc.getUnpunchedEmployees() as Array<{
    id: string; name: string; slack_user_id?: string;
  }>;

  for (const emp of unpunched) {
    if (!emp.slack_user_id) continue;
    try {
      await slackApp.client.chat.postMessage({
        channel: emp.slack_user_id,
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `おはようございます、*${emp.name}*さん！\n打刻がまだのようです。出勤状況を教えてください。`,
            },
          },
          {
            type: "actions",
            block_id: "reminder_checkin",
            elements: [
              { type: "button", text: { type: "plain_text", text: "✅ 出勤（オフィス）" }, style: "primary", action_id: "checkin_office", value: "present" },
              { type: "button", text: { type: "plain_text", text: "🏠 在宅勤務" }, action_id: "checkin_remote", value: "remote" },
              { type: "button", text: { type: "plain_text", text: "🌴 本日は休暇" }, action_id: "checkin_leave", value: "leave" },
            ],
          },
        ],
        text: `打刻リマインダー — ${emp.name}さん`,
      });
    } catch (e) {
      console.error(`Failed to DM ${emp.name}:`, e);
    }
  }

  return { reminded: unpunched.length };
}
