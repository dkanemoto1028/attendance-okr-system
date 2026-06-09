import type Database from "better-sqlite3";

interface RiskScore {
  employeeId: string;
  score: number;
  level: "low" | "medium" | "high";
  message: string;
  factors: string[];
}

export class AIService {
  constructor(private db: Database.Database) {}

  calculateRiskScore(employeeId: string): RiskScore {
    const yearMonth = new Date().toISOString().slice(0, 7);
    const prevMonth = this.getPrevMonth();
    const factors: string[] = [];
    let score = 0;

    // Factor 1: Overtime increase vs last month
    const currOvertime = (this.db.prepare(
      "SELECT COALESCE(SUM(overtime_hours), 0) as total FROM attendance WHERE employee_id = ? AND date LIKE ?"
    ).get(employeeId, `${yearMonth}%`) as { total: number }).total;

    const prevOvertime = (this.db.prepare(
      "SELECT COALESCE(SUM(overtime_hours), 0) as total FROM attendance WHERE employee_id = ? AND date LIKE ?"
    ).get(employeeId, `${prevMonth}%`) as { total: number }).total;

    if (prevOvertime > 0) {
      const increaseRate = ((currOvertime - prevOvertime) / prevOvertime) * 100;
      if (increaseRate > 30) {
        score += 30;
        factors.push(`残業時間が先月比 +${Math.round(increaseRate)}% 増加`);
      } else if (increaseRate > 15) {
        score += 15;
        factors.push(`残業時間が先月比 +${Math.round(increaseRate)}% 増加傾向`);
      }
    }
    if (currOvertime > 40) {
      score += 25;
      factors.push(`今月残業 ${currOvertime}h（高水準）`);
    }

    // Factor 2: Leave not taken (90+ days)
    const balance = this.db.prepare(
      "SELECT annual_used, annual_total FROM leave_balances WHERE employee_id = ? AND year = ?"
    ).get(employeeId, new Date().getFullYear()) as { annual_used: number; annual_total: number } | undefined;

    if (balance) {
      const leaveRate = (balance.annual_used / balance.annual_total) * 100;
      if (leaveRate < 20) {
        score += 25;
        factors.push(`有給消化率 ${Math.round(leaveRate)}%（低水準）`);
      } else if (leaveRate < 40) {
        score += 10;
        factors.push(`有給消化率 ${Math.round(leaveRate)}%（要注意）`);
      }
    }

    // Factor 3: Late count this month
    const lateCount = (this.db.prepare(
      "SELECT COUNT(*) as c FROM attendance WHERE employee_id = ? AND date LIKE ? AND status = 'absent'"
    ).get(employeeId, `${yearMonth}%`) as { c: number }).c;

    if (lateCount >= 3) {
      score += 20;
      factors.push(`今月の未打刻 ${lateCount}回`);
    } else if (lateCount >= 1) {
      score += 8;
      factors.push(`今月の未打刻 ${lateCount}回`);
    }

    const level: RiskScore["level"] = score >= 60 ? "high" : score >= 30 ? "medium" : "low";
    const message = this.generateMessage(level, factors, employeeId);

    // Cache the score
    this.db.prepare(`
      INSERT INTO ai_risk_scores (id, employee_id, score, level, message, data)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT DO NOTHING
    `).run(
      `risk_${employeeId}_${Date.now()}`,
      employeeId, score, level, message,
      JSON.stringify({ factors, currOvertime })
    );

    return { employeeId, score, level, message, factors };
  }

  private generateMessage(level: "low" | "medium" | "high", factors: string[], employeeId: string): string {
    const emp = this.db.prepare("SELECT name FROM employees WHERE id = ?").get(employeeId) as { name: string } | undefined;
    const name = emp?.name ?? "メンバー";

    if (level === "high") {
      return `${name}さんについて、${factors[0] ?? ""}など複数の要因が確認されています。1on1でのフォローをおすすめします。`;
    }
    if (level === "medium") {
      return `${name}さんの${factors[0] ?? "状況"}が続いています。確認してみましょう。`;
    }
    return `${name}さんのコンディションは良好です。`;
  }

  getTeamInsights(managerId: string) {
    const members = this.db.prepare(
      "SELECT id FROM employees WHERE manager_id = ?"
    ).all(managerId) as Array<{ id: string }>;

    return members.map((m) => this.calculateRiskScore(m.id))
      .filter((r) => r.level !== "low" || r.score > 0)
      .sort((a, b) => b.score - a.score);
  }

  generateMonthlyReport(managerId: string, yearMonth: string): string {
    const members = this.db.prepare(`
      SELECT e.name, e.country,
             COALESCE(SUM(a.overtime_hours), 0) as overtime,
             COALESCE(lb.annual_used, 0) as leave_used,
             COALESCE(lb.annual_total, 0) as leave_total
      FROM employees e
      LEFT JOIN attendance a ON a.employee_id = e.id AND a.date LIKE ?
      LEFT JOIN leave_balances lb ON lb.employee_id = e.id AND lb.year = ?
      WHERE e.manager_id = ?
      GROUP BY e.id
    `).all(`${yearMonth}%`, new Date().getFullYear(), managerId) as Array<{
      name: string; country: string; overtime: number; leave_used: number; leave_total: number;
    }>;

    const totalOvertime = members.reduce((s, m) => s + m.overtime, 0);
    const avgOvertime = members.length ? (totalOvertime / members.length).toFixed(1) : 0;
    const avgLeaveRate = members.length
      ? Math.round(members.reduce((s, m) => s + (m.leave_total ? m.leave_used / m.leave_total : 0), 0) / members.length * 100)
      : 0;

    return [
      `📊 ${yearMonth} チーム月次レポート`,
      ``,
      `【サマリー】`,
      `• メンバー数: ${members.length}名`,
      `• 平均残業時間: ${avgOvertime}h`,
      `• チーム有給消化率: ${avgLeaveRate}%`,
      ``,
      `【メンバー別ハイライト】`,
      ...members.map((m) => {
        const leaveRate = m.leave_total ? Math.round((m.leave_used / m.leave_total) * 100) : 0;
        const alerts = [];
        if (m.overtime > 30) alerts.push("⚠️ 残業高");
        if (leaveRate < 30) alerts.push("⚠️ 有給低");
        return `• ${m.name}（${m.country}）: 残業 ${m.overtime}h / 有給消化率 ${leaveRate}% ${alerts.join(" ")}`;
      }),
    ].join("\n");
  }

  private getPrevMonth(): string {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().slice(0, 7);
  }
}
