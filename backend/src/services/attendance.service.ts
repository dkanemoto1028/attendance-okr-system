import type Database from "better-sqlite3";
import { randomUUID } from "crypto";

export class AttendanceService {
  constructor(private db: Database.Database) {}

  checkIn(employeeId: string, status: "present" | "remote" = "present") {
    const today = new Date().toISOString().split("T")[0];
    const now = new Date().toTimeString().slice(0, 5);
    const id = randomUUID();

    const existing = this.db
      .prepare("SELECT * FROM attendance WHERE employee_id = ? AND date = ?")
      .get(employeeId, today) as { check_in?: string } | undefined;

    if (existing?.check_in) {
      return { success: false, message: "既に打刻済みです", data: existing };
    }

    this.db
      .prepare(`
        INSERT INTO attendance (id, employee_id, date, check_in, status, overtime_hours)
        VALUES (?, ?, ?, ?, ?, 0)
        ON CONFLICT(employee_id, date) DO UPDATE SET
          check_in = excluded.check_in,
          status = excluded.status,
          updated_at = datetime('now')
      `)
      .run(id, employeeId, today, now, status);

    return { success: true, message: `✅ 出勤打刻完了！ ${now}`, checkIn: now, status };
  }

  checkOut(employeeId: string) {
    const today = new Date().toISOString().split("T")[0];
    const now = new Date().toTimeString().slice(0, 5);

    const record = this.db
      .prepare("SELECT * FROM attendance WHERE employee_id = ? AND date = ?")
      .get(employeeId, today) as { check_in?: string; check_out?: string } | undefined;

    if (!record?.check_in) {
      return { success: false, message: "出勤打刻が見つかりません" };
    }
    if (record.check_out) {
      return { success: false, message: "既に退勤済みです" };
    }

    const [inH, inM] = record.check_in.split(":").map(Number);
    const [outH, outM] = now.split(":").map(Number);
    const totalMinutes = (outH * 60 + outM) - (inH * 60 + inM);
    const workHours = totalMinutes / 60;
    const overtimeHours = Math.max(0, workHours - 8);

    this.db
      .prepare(`
        UPDATE attendance SET
          check_out = ?,
          overtime_hours = ?,
          updated_at = datetime('now')
        WHERE employee_id = ? AND date = ?
      `)
      .run(now, overtimeHours, employeeId, today);

    const msg = overtimeHours > 0
      ? `✅ 退勤打刻完了！ ${now}（残業 ${overtimeHours.toFixed(1)}h）`
      : `✅ 退勤打刻完了！ ${now} お疲れ様でした！`;

    return { success: true, message: msg, checkOut: now, overtimeHours };
  }

  getTodayStatus(employeeId: string) {
    const today = new Date().toISOString().split("T")[0];
    return this.db
      .prepare("SELECT * FROM attendance WHERE employee_id = ? AND date = ?")
      .get(employeeId, today);
  }

  getTeamTodayStatus(managerId: string) {
    const today = new Date().toISOString().split("T")[0];
    return this.db.prepare(`
      SELECT e.id, e.name, e.avatar, e.country,
             a.check_in, a.check_out, a.status, a.overtime_hours
      FROM employees e
      LEFT JOIN attendance a ON a.employee_id = e.id AND a.date = ?
      WHERE e.manager_id = ?
      ORDER BY e.name
    `).all(today, managerId);
  }

  getMonthlyStats(employeeId: string, yearMonth: string) {
    return this.db.prepare(`
      SELECT
        COUNT(*) as work_days,
        SUM(overtime_hours) as total_overtime,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_count,
        SUM(CASE WHEN status = 'leave' THEN 1 ELSE 0 END) as leave_count
      FROM attendance
      WHERE employee_id = ? AND date LIKE ?
    `).get(employeeId, `${yearMonth}%`);
  }

  getUnpunchedEmployees() {
    const today = new Date().toISOString().split("T")[0];
    return this.db.prepare(`
      SELECT e.id, e.name, e.slack_user_id, e.timezone
      FROM employees e
      LEFT JOIN attendance a ON a.employee_id = e.id AND a.date = ?
      WHERE a.id IS NULL OR (a.check_in IS NULL AND a.status NOT IN ('leave', 'holiday'))
    `).all(today);
  }
}
