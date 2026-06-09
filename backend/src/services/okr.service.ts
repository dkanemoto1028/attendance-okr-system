import type Database from "better-sqlite3";
import { randomUUID } from "crypto";

export class OkrService {
  constructor(private db: Database.Database) {}

  getAll(quarter?: string) {
    const okrs = this.db.prepare(`
      SELECT o.*, GROUP_CONCAT(
        k.id || '|' || k.title || '|' || k.target || '|' || k.current_value || '|' || k.unit || '|' || COALESCE(k.linked_metric, '')
      ) as krs_raw
      FROM okrs o
      LEFT JOIN key_results k ON k.okr_id = o.id
      ${quarter ? "WHERE o.quarter = ?" : ""}
      GROUP BY o.id
      ORDER BY o.type DESC, o.owner_name
    `).all(...(quarter ? [quarter] : [])) as Array<Record<string, string>>;

    return okrs.map((o) => {
      const { krs_raw, ...rest } = o;
      return {
        ...rest,
        keyResults: krs_raw
          ? krs_raw.split(",").map((raw: string) => {
              const [id, title, target, current, unit, linkedMetric] = raw.split("|");
              return { id, title, target: Number(target), current: Number(current), unit, linkedMetric: linkedMetric || null };
            })
          : [],
      };
    });
  }

  getByOwner(ownerId: string) {
    return this.getAll().filter((o) => o["owner_id"] === ownerId);
  }

  updateKeyResult(krId: string, currentValue: number) {
    this.db.prepare(`
      UPDATE key_results SET current_value = ?, updated_at = datetime('now') WHERE id = ?
    `).run(currentValue, krId);

    // Auto-update OKR status based on avg progress
    const kr = this.db.prepare("SELECT okr_id FROM key_results WHERE id = ?").get(krId) as { okr_id: string } | undefined;
    if (!kr) return { success: false };

    const avgPct = this.calcOkrProgress(kr.okr_id);
    const status = avgPct >= 70 ? "on_track" : avgPct >= 40 ? "at_risk" : "off_track";
    this.db.prepare("UPDATE okrs SET status = ?, updated_at = datetime('now') WHERE id = ?").run(status, kr.okr_id);

    return { success: true, avgProgress: avgPct, status };
  }

  createOkr(data: {
    type: "company" | "team" | "individual";
    ownerId: string;
    ownerName: string;
    quarter: string;
    objective: string;
    parentId?: string;
  }) {
    const id = randomUUID();
    this.db.prepare(`
      INSERT INTO okrs (id, type, owner_id, owner_name, quarter, objective, parent_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, data.type, data.ownerId, data.ownerName, data.quarter, data.objective, data.parentId ?? null);
    return { id };
  }

  addKeyResult(okrId: string, data: {
    title: string;
    target: number;
    unit: string;
    linkedMetric?: string;
  }) {
    const id = randomUUID();
    this.db.prepare(`
      INSERT INTO key_results (id, okr_id, title, target, current_value, unit, linked_metric)
      VALUES (?, ?, ?, ?, 0, ?, ?)
    `).run(id, okrId, data.title, data.target, data.unit, data.linkedMetric ?? null);
    return { id };
  }

  private calcOkrProgress(okrId: string): number {
    const krs = this.db.prepare("SELECT target, current_value FROM key_results WHERE okr_id = ?").all(okrId) as Array<{ target: number; current_value: number }>;
    if (!krs.length) return 0;
    const avg = krs.reduce((sum, kr) => sum + Math.min((kr.current_value / kr.target) * 100, 100), 0) / krs.length;
    return Math.round(avg);
  }

  // Sync attendance metrics into linked KRs automatically
  syncAttendanceMetrics(db: Database.Database) {
    const linkedKrs = db.prepare(`
      SELECT k.id, k.okr_id, k.linked_metric, k.target, o.owner_id
      FROM key_results k JOIN okrs o ON o.id = k.okr_id
      WHERE k.linked_metric IS NOT NULL
    `).all() as Array<{ id: string; okr_id: string; linked_metric: string; target: number; owner_id: string }>;

    const yearMonth = new Date().toISOString().slice(0, 7);

    for (const kr of linkedKrs) {
      let value: number | null = null;

      if (kr.linked_metric === "overtime") {
        const stats = db.prepare(`
          SELECT COALESCE(SUM(overtime_hours), 0) as total
          FROM attendance WHERE employee_id = ? AND date LIKE ?
        `).get(kr.owner_id, `${yearMonth}%`) as { total: number } | undefined;
        value = stats?.total ?? null;
      } else if (kr.linked_metric === "leave_rate") {
        const bal = db.prepare(`
          SELECT annual_total, annual_used FROM leave_balances
          WHERE employee_id = ? AND year = ?
        `).get(kr.owner_id, new Date().getFullYear()) as { annual_total: number; annual_used: number } | undefined;
        if (bal) value = Math.round((bal.annual_used / bal.annual_total) * 100);
      } else if (kr.linked_metric === "attendance_rate") {
        const stats = db.prepare(`
          SELECT COUNT(*) as total,
                 SUM(CASE WHEN status IN ('present','remote') THEN 1 ELSE 0 END) as present
          FROM attendance WHERE date LIKE ?
        `).get(`${yearMonth}%`) as { total: number; present: number } | undefined;
        if (stats?.total) value = Math.round((stats.present / stats.total) * 100);
      }

      if (value !== null) {
        db.prepare("UPDATE key_results SET current_value = ?, updated_at = datetime('now') WHERE id = ?").run(value, kr.id);
      }
    }
  }
}
