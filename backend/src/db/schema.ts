import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createDb(dbPath?: string) {
  const resolvedPath = dbPath ?? path.join(__dirname, "../../data/peopleos.db");
  const db = new Database(resolvedPath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  return db;
}

export function runMigrations(db: Database.Database) {
  db.exec(`
    -- Employees
    CREATE TABLE IF NOT EXISTS employees (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      name_en TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      avatar TEXT NOT NULL,
      country TEXT NOT NULL CHECK(country IN ('JP','VN','KR','CO','CN')),
      department TEXT NOT NULL,
      role TEXT NOT NULL,
      manager_id TEXT REFERENCES employees(id),
      timezone TEXT NOT NULL DEFAULT 'Asia/Tokyo',
      slack_user_id TEXT UNIQUE,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Attendance Records
    CREATE TABLE IF NOT EXISTS attendance (
      id TEXT PRIMARY KEY,
      employee_id TEXT NOT NULL REFERENCES employees(id),
      date TEXT NOT NULL,
      check_in TEXT,
      check_out TEXT,
      status TEXT NOT NULL DEFAULT 'absent'
        CHECK(status IN ('present','remote','leave','absent','holiday')),
      overtime_hours REAL NOT NULL DEFAULT 0,
      note TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(employee_id, date)
    );

    -- Leave Balances
    CREATE TABLE IF NOT EXISTS leave_balances (
      id TEXT PRIMARY KEY,
      employee_id TEXT NOT NULL REFERENCES employees(id),
      year INTEGER NOT NULL,
      annual_total INTEGER NOT NULL DEFAULT 20,
      annual_used INTEGER NOT NULL DEFAULT 0,
      sick_total INTEGER NOT NULL DEFAULT 10,
      sick_used INTEGER NOT NULL DEFAULT 0,
      UNIQUE(employee_id, year)
    );

    -- Leave Requests
    CREATE TABLE IF NOT EXISTS leave_requests (
      id TEXT PRIMARY KEY,
      employee_id TEXT NOT NULL REFERENCES employees(id),
      approver_id TEXT REFERENCES employees(id),
      type TEXT NOT NULL CHECK(type IN ('annual','sick','special','unpaid')),
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      days INTEGER NOT NULL,
      reason TEXT,
      status TEXT NOT NULL DEFAULT 'pending'
        CHECK(status IN ('pending','approved','rejected')),
      slack_message_ts TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- OKRs
    CREATE TABLE IF NOT EXISTS okrs (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL CHECK(type IN ('company','team','individual')),
      owner_id TEXT NOT NULL,
      owner_name TEXT NOT NULL,
      quarter TEXT NOT NULL,
      objective TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'on_track'
        CHECK(status IN ('on_track','at_risk','off_track')),
      parent_id TEXT REFERENCES okrs(id),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Key Results
    CREATE TABLE IF NOT EXISTS key_results (
      id TEXT PRIMARY KEY,
      okr_id TEXT NOT NULL REFERENCES okrs(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      target REAL NOT NULL,
      current_value REAL NOT NULL DEFAULT 0,
      unit TEXT NOT NULL DEFAULT '%',
      linked_metric TEXT
        CHECK(linked_metric IN ('overtime','leave_rate','attendance_rate','oneonone') OR linked_metric IS NULL),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- AI Risk Scores (cached)
    CREATE TABLE IF NOT EXISTS ai_risk_scores (
      id TEXT PRIMARY KEY,
      employee_id TEXT NOT NULL REFERENCES employees(id),
      score INTEGER NOT NULL DEFAULT 0,
      level TEXT NOT NULL DEFAULT 'low' CHECK(level IN ('low','medium','high')),
      message TEXT,
      data TEXT,
      calculated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Indexes
    CREATE INDEX IF NOT EXISTS idx_attendance_employee_date ON attendance(employee_id, date);
    CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
    CREATE INDEX IF NOT EXISTS idx_leave_requests_employee ON leave_requests(employee_id, status);
    CREATE INDEX IF NOT EXISTS idx_okrs_owner ON okrs(owner_id);
    CREATE INDEX IF NOT EXISTS idx_key_results_okr ON key_results(okr_id);
  `);
}

export function seedData(db: Database.Database) {
  const count = (db.prepare("SELECT COUNT(*) as c FROM employees").get() as { c: number }).c;
  if (count > 0) return;

  const insertEmp = db.prepare(`
    INSERT OR IGNORE INTO employees (id, name, name_en, email, avatar, country, department, role, manager_id, timezone, slack_user_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const employees = [
    ["m1", "鈴木 一郎", "Ichiro Suzuki", "i.suzuki@company.com", "IS", "JP", "Engineering", "Manager", null, "Asia/Tokyo", "U_M1"],
    ["m2", "Sarah Kim", "Sarah Kim", "s.kim@company.com", "SK", "KR", "Design", "Manager", null, "Asia/Seoul", "U_M2"],
    ["m3", "Miguel Torres", "Miguel Torres", "m.torres@company.com", "MT", "CO", "Sales", "Manager", null, "America/Bogota", "U_M3"],
    ["e1", "田中 花子", "Hanako Tanaka", "h.tanaka@company.com", "HT", "JP", "Engineering", "Engineer", "m1", "Asia/Tokyo", "U_E1"],
    ["e2", "山田 太郎", "Taro Yamada", "t.yamada@company.com", "TY", "JP", "Engineering", "Engineer", "m1", "Asia/Tokyo", "U_E2"],
    ["e3", "Nguyen Van An", "Nguyen Van An", "n.an@company.com", "NA", "VN", "Engineering", "Engineer", "m1", "Asia/Ho_Chi_Minh", "U_E3"],
    ["e4", "Kim Ji-yeon", "Kim Ji-yeon", "j.kim@company.com", "KJ", "KR", "Design", "Designer", "m2", "Asia/Seoul", "U_E4"],
    ["e5", "Carlos Mendoza", "Carlos Mendoza", "c.mendoza@company.com", "CM", "CO", "Sales", "Sales Rep", "m3", "America/Bogota", "U_E5"],
    ["e6", "李 明", "Li Ming", "l.ming@company.com", "LM", "CN", "Engineering", "Engineer", "m1", "Asia/Shanghai", "U_E6"],
    ["e7", "Lê Thị Thu", "Le Thi Thu", "l.thu@company.com", "LT", "VN", "Design", "Designer", "m2", "Asia/Ho_Chi_Minh", "U_E7"],
    ["e8", "박 준호", "Park Junho", "j.park@company.com", "PJ", "KR", "Sales", "Sales Rep", "m3", "Asia/Seoul", "U_E8"],
  ];

  const insertMany = db.transaction(() => {
    for (const e of employees) insertEmp.run(...e);
  });
  insertMany();

  // Seed leave balances
  const insertBalance = db.prepare(`
    INSERT OR IGNORE INTO leave_balances (id, employee_id, year, annual_total, annual_used, sick_total, sick_used)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const balances = [
    ["lb1", "e1", 2026, 20, 8, 10, 1],
    ["lb2", "e2", 2026, 20, 15, 10, 3],
    ["lb3", "e3", 2026, 14, 6, 10, 0],
    ["lb4", "e4", 2026, 15, 2, 10, 2],
    ["lb5", "e5", 2026, 15, 12, 10, 0],
    ["lb6", "e6", 2026, 10, 1, 10, 0],
    ["lb7", "e7", 2026, 14, 3, 10, 4],
    ["lb8", "e8", 2026, 15, 5, 10, 1],
  ];
  const seedBalances = db.transaction(() => {
    for (const b of balances) insertBalance.run(...b);
  });
  seedBalances();

  // Seed today's attendance
  const today = new Date().toISOString().split("T")[0];
  const insertAtt = db.prepare(`
    INSERT OR IGNORE INTO attendance (id, employee_id, date, check_in, status, overtime_hours)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const attendance = [
    ["a1", "e1", today, "09:03", "present", 0],
    ["a2", "e3", today, "08:55", "present", 0],
    ["a3", "e5", today, "09:10", "remote", 0],
    ["a4", "e6", today, "09:00", "present", 0],
    ["a5", "m1", today, "08:45", "present", 0],
    ["a6", "m2", today, "09:30", "remote", 0],
    ["a7", "m3", today, "09:05", "present", 0],
  ];
  const seedAtt = db.transaction(() => {
    for (const a of attendance) insertAtt.run(...a);
  });
  seedAtt();

  // Seed OKRs
  db.prepare(`INSERT OR IGNORE INTO okrs (id, type, owner_id, owner_name, quarter, objective, status) VALUES
    ('okr-company-q2', 'company', 'company', 'Company', 'Q2 2026', 'グローバル組織の健全性と生産性を向上させる', 'on_track'),
    ('okr-eng-q2', 'team', 'm1', 'Engineering Team', 'Q2 2026', '開発チームの持続可能なペースで品質を高める', 'at_risk'),
    ('okr-e1-q2', 'individual', 'e1', '田中 花子', 'Q2 2026', '技術リードとしてチームの開発生産性に貢献する', 'on_track'),
    ('okr-e2-q2', 'individual', 'e2', '山田 太郎', 'Q2 2026', '新機能のリリースを通じてプロダクト価値を高める', 'off_track')
  `).run();

  db.prepare(`INSERT OR IGNORE INTO key_results (id, okr_id, title, target, current_value, unit, linked_metric) VALUES
    ('kr1', 'okr-company-q2', '全拠点有給消化率 60%以上', 60, 42, '%', 'leave_rate'),
    ('kr2', 'okr-company-q2', '平均月次残業時間 25h以下', 25, 18.3, 'h', 'overtime'),
    ('kr3', 'okr-company-q2', '全拠点勤怠システム利用率 95%以上', 95, 88, '%', 'attendance_rate'),
    ('kr4', 'okr-eng-q2', '週平均残業 5h以下', 5, 8.2, 'h', 'overtime'),
    ('kr5', 'okr-eng-q2', '1on1実施率 100%', 100, 75, '%', 'oneonone'),
    ('kr6', 'okr-eng-q2', 'スプリント完了率 90%以上', 90, 82, '%', null),
    ('kr7', 'okr-e1-q2', 'コードレビュー週3h確保', 3, 2.8, 'h', null),
    ('kr8', 'okr-e1-q2', '有給5日以上取得', 5, 2, '日', 'leave_rate'),
    ('kr9', 'okr-e1-q2', '技術勉強会 月2回開催', 6, 4, '回', null),
    ('kr10', 'okr-e2-q2', '月次残業 20h以下', 20, 42, 'h', 'overtime'),
    ('kr11', 'okr-e2-q2', 'バグ修正率 90%以上', 90, 65, '%', null),
    ('kr12', 'okr-e2-q2', '有給3日以上取得', 3, 0, '日', 'leave_rate')
  `).run();
}
