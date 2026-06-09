// Mock data for the People Management Platform

export type Country = "JP" | "VN" | "KR" | "CO" | "CN";
export type AttendanceStatus = "present" | "remote" | "leave" | "absent" | "holiday";
export type OkrStatus = "on_track" | "at_risk" | "off_track";
export type RiskLevel = "low" | "medium" | "high";

export interface Employee {
  id: string;
  name: string;
  nameEn: string;
  avatar: string;
  country: Country;
  department: string;
  role: string;
  managerId?: string;
}

export interface AttendanceRecord {
  employeeId: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: AttendanceStatus;
  overtimeHours: number;
  note?: string;
}

export interface LeaveBalance {
  employeeId: string;
  annual: number;
  used: number;
  sick: number;
  sickUsed: number;
}

export interface MonthlyStats {
  employeeId: string;
  month: string;
  workHours: number;
  overtimeHours: number;
  lateCount: number;
  absenceCount: number;
  leaveCount: number;
}

export interface OKR {
  id: string;
  type: "company" | "team" | "individual";
  ownerId: string;
  ownerName: string;
  quarter: string;
  objective: string;
  keyResults: KeyResult[];
  status: OkrStatus;
}

export interface KeyResult {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
  linkedMetric?: "overtime" | "leave_rate" | "attendance_rate" | "oneonone";
}

export interface HealthData {
  employeeId: string;
  device: string; // e.g. "Apple Watch", "Garmin", "Fitbit"
  heartRate: number; // bpm (resting, morning)
  bodyTemp: number; // °C
  sleepHours: number; // last night
  sleepQuality: "good" | "fair" | "poor"; // derived from sleep hours + interruptions
  steps: number;
  updatedAt: string; // "HH:MM"
}

export interface AIInsight {
  employeeId: string;
  type: "risk" | "achievement" | "suggestion";
  riskLevel: RiskLevel;
  message: string;
  actionLabel: string;
  data: Record<string, number | string>;
}

export const COUNTRY_FLAGS: Record<Country, string> = {
  JP: "🇯🇵",
  VN: "🇻🇳",
  KR: "🇰🇷",
  CO: "🇨🇴",
  CN: "🇨🇳",
};

export const COUNTRY_NAMES: Record<Country, string> = {
  JP: "Japan",
  VN: "Vietnam",
  KR: "Korea",
  CO: "Colombia",
  CN: "China",
};

export const employees: Employee[] = [
  { id: "e1", name: "田中 花子", nameEn: "Hanako Tanaka", avatar: "HT", country: "JP", department: "Engineering", role: "Engineer", managerId: "m1" },
  { id: "e2", name: "山田 太郎", nameEn: "Taro Yamada", avatar: "TY", country: "JP", department: "Engineering", role: "Engineer", managerId: "m1" },
  { id: "e3", name: "Nguyen Van An", nameEn: "Nguyen Van An", avatar: "NA", country: "VN", department: "Engineering", role: "Engineer", managerId: "m1" },
  { id: "e4", name: "김지연", nameEn: "Kim Ji-yeon", avatar: "KJ", country: "KR", department: "Design", role: "Designer", managerId: "m2" },
  { id: "e5", name: "Carlos Mendoza", nameEn: "Carlos Mendoza", avatar: "CM", country: "CO", department: "Sales", role: "Sales Rep", managerId: "m3" },
  { id: "e6", name: "李 明", nameEn: "Li Ming", avatar: "LM", country: "CN", department: "Engineering", role: "Engineer", managerId: "m1" },
  { id: "e7", name: "Lê Thị Thu", nameEn: "Le Thi Thu", avatar: "LT", country: "VN", department: "Design", role: "Designer", managerId: "m2" },
  { id: "e8", name: "박준호", nameEn: "Park Junho", avatar: "PJ", country: "KR", department: "Sales", role: "Sales Rep", managerId: "m3" },
  { id: "m1", name: "鈴木 一郎", nameEn: "Ichiro Suzuki", avatar: "IS", country: "JP", department: "Engineering", role: "Manager" },
  { id: "m2", name: "김사라", nameEn: "Sarah Kim", avatar: "SK", country: "KR", department: "Design", role: "Manager" },
  { id: "m3", name: "Miguel Torres", nameEn: "Miguel Torres", avatar: "MT", country: "CO", department: "Sales", role: "Manager" },
];

export const todayAttendance: Record<string, AttendanceStatus> = {
  e1: "present",
  e2: "absent",
  e3: "present",
  e4: "leave",
  e5: "remote",
  e6: "present",
  e7: "present",
  e8: "remote",
  m1: "present",
  m2: "remote",
  m3: "present",
};

export const leaveBalances: LeaveBalance[] = [
  { employeeId: "e1", annual: 20, used: 8, sick: 10, sickUsed: 1 },
  { employeeId: "e2", annual: 20, used: 15, sick: 10, sickUsed: 3 },
  { employeeId: "e3", annual: 14, used: 6, sick: 10, sickUsed: 0 },
  { employeeId: "e4", annual: 15, used: 2, sick: 10, sickUsed: 2 },
  { employeeId: "e5", annual: 15, used: 12, sick: 10, sickUsed: 0 },
  { employeeId: "e6", annual: 10, used: 1, sick: 10, sickUsed: 0 },
  { employeeId: "e7", annual: 14, used: 3, sick: 10, sickUsed: 4 },
  { employeeId: "e8", annual: 15, used: 5, sick: 10, sickUsed: 1 },
];

export const monthlyStats: MonthlyStats[] = [
  { employeeId: "e1", month: "2026-06", workHours: 152, overtimeHours: 8, lateCount: 0, absenceCount: 0, leaveCount: 2 },
  { employeeId: "e2", month: "2026-06", workHours: 168, overtimeHours: 42, lateCount: 2, absenceCount: 1, leaveCount: 0 },
  { employeeId: "e3", month: "2026-06", workHours: 160, overtimeHours: 18, lateCount: 0, absenceCount: 0, leaveCount: 1 },
  { employeeId: "e4", month: "2026-06", workHours: 140, overtimeHours: 2, lateCount: 1, absenceCount: 0, leaveCount: 5 },
  { employeeId: "e5", month: "2026-06", workHours: 155, overtimeHours: 12, lateCount: 0, absenceCount: 0, leaveCount: 3 },
  { employeeId: "e6", month: "2026-06", workHours: 172, overtimeHours: 31, lateCount: 1, absenceCount: 0, leaveCount: 0 },
  { employeeId: "e7", month: "2026-06", workHours: 148, overtimeHours: 5, lateCount: 0, absenceCount: 0, leaveCount: 2 },
  { employeeId: "e8", month: "2026-06", workHours: 158, overtimeHours: 14, lateCount: 0, absenceCount: 0, leaveCount: 2 },
];

export const okrs: OKR[] = [
  {
    id: "okr-company-q2",
    type: "company",
    ownerId: "company",
    ownerName: "Company",
    quarter: "Q2 2026",
    objective: "グローバル組織の健全性と生産性を向上させる",
    status: "on_track",
    keyResults: [
      { id: "kr1", title: "全拠点有給消化率 60%以上", target: 60, current: 42, unit: "%", linkedMetric: "leave_rate" },
      { id: "kr2", title: "平均月次残業時間 25h以下", target: 25, current: 18.3, unit: "h", linkedMetric: "overtime" },
      { id: "kr3", title: "全拠点勤怠システム利用率 95%以上", target: 95, current: 88, unit: "%", linkedMetric: "attendance_rate" },
    ],
  },
  {
    id: "okr-eng-q2",
    type: "team",
    ownerId: "m1",
    ownerName: "Engineering Team",
    quarter: "Q2 2026",
    objective: "開発チームの持続可能なペースで品質を高める",
    status: "at_risk",
    keyResults: [
      { id: "kr4", title: "週平均残業 5h以下", target: 5, current: 8.2, unit: "h", linkedMetric: "overtime" },
      { id: "kr5", title: "1on1実施率 100%", target: 100, current: 75, unit: "%", linkedMetric: "oneonone" },
      { id: "kr6", title: "スプリント完了率 90%以上", target: 90, current: 82, unit: "%" },
    ],
  },
  {
    id: "okr-e1-q2",
    type: "individual",
    ownerId: "e1",
    ownerName: "田中 花子",
    quarter: "Q2 2026",
    objective: "技術リードとしてチームの開発生産性に貢献する",
    status: "on_track",
    keyResults: [
      { id: "kr7", title: "コードレビュー週3h確保", target: 3, current: 2.8, unit: "h" },
      { id: "kr8", title: "有給5日以上取得", target: 5, current: 2, unit: "日", linkedMetric: "leave_rate" },
      { id: "kr9", title: "技術勉強会 月2回開催", target: 6, current: 4, unit: "回" },
    ],
  },
  {
    id: "okr-e2-q2",
    type: "individual",
    ownerId: "e2",
    ownerName: "山田 太郎",
    quarter: "Q2 2026",
    objective: "新機能のリリースを通じてプロダクト価値を高める",
    status: "off_track",
    keyResults: [
      { id: "kr10", title: "月次残業 20h以下", target: 20, current: 42, unit: "h", linkedMetric: "overtime" },
      { id: "kr11", title: "バグ修正率 90%以上", target: 90, current: 65, unit: "%" },
      { id: "kr12", title: "有給3日以上取得", target: 3, current: 0, unit: "日", linkedMetric: "leave_rate" },
    ],
  },
];

export const healthData: HealthData[] = [
  { employeeId: "m1", device: "Apple Watch", heartRate: 68, bodyTemp: 36.5, sleepHours: 6.8, sleepQuality: "good", steps: 9200, updatedAt: "07:30" },
  { employeeId: "e1", device: "Apple Watch", heartRate: 62, bodyTemp: 36.4, sleepHours: 7.2, sleepQuality: "good", steps: 8200, updatedAt: "07:45" },
  { employeeId: "e2", device: "Garmin", heartRate: 78, bodyTemp: 36.9, sleepHours: 4.8, sleepQuality: "poor", steps: 3100, updatedAt: "08:02" },
  { employeeId: "e3", device: "Fitbit", heartRate: 65, bodyTemp: 36.5, sleepHours: 6.9, sleepQuality: "good", steps: 7400, updatedAt: "07:30" },
  { employeeId: "e6", device: "Apple Watch", heartRate: 72, bodyTemp: 36.7, sleepHours: 5.5, sleepQuality: "fair", steps: 4500, updatedAt: "08:15" },
];

export const aiInsights: AIInsight[] = [
  {
    employeeId: "e2",
    type: "risk",
    riskLevel: "high",
    message: "山田さんの今月残業が42hと先月比+35%です。OKR目標（20h以下）を大幅に超過しており、コンディション維持のため1on1での状況確認をおすすめします。",
    actionLabel: "1on1をスケジュール",
    data: { overtime: 42, target: 20, increase: 35, okrProgress: 30 },
  },
  {
    employeeId: "e6",
    type: "risk",
    riskLevel: "medium",
    message: "李明さんの有給取得率が著しく低い状態が続いています（取得1日/上限10日）。中国の法定基準との乖離も確認が必要です。",
    actionLabel: "有給取得を促進",
    data: { leaveUsed: 1, leaveTotal: 10, rate: 10 },
  },
  {
    employeeId: "e1",
    type: "achievement",
    riskLevel: "low",
    message: "田中さんのOKR達成率が良好です。残業も8hと適正範囲で、コンディションと成果のバランスが取れています。",
    actionLabel: "詳細を見る",
    data: { okrProgress: 85, overtime: 8 },
  },
];

export const globalStats = {
  byCountry: [
    { country: "JP" as Country, headcount: 85, attendanceRate: 94, avgOvertime: 28, leaveRate: 62, complianceAlerts: 0 },
    { country: "VN" as Country, headcount: 72, attendanceRate: 91, avgOvertime: 22, leaveRate: 41, complianceAlerts: 0 },
    { country: "KR" as Country, headcount: 45, attendanceRate: 89, avgOvertime: 31, leaveRate: 55, complianceAlerts: 2 },
    { country: "CO" as Country, headcount: 28, attendanceRate: 96, avgOvertime: 18, leaveRate: 78, complianceAlerts: 0 },
    { country: "CN" as Country, headcount: 20, attendanceRate: 88, avgOvertime: 24, leaveRate: 38, complianceAlerts: 1 },
  ],
  overtimeTrend: [
    { month: "Jan", JP: 30, VN: 20, KR: 35, CO: 15, CN: 22 },
    { month: "Feb", JP: 28, VN: 22, KR: 32, CO: 16, CN: 25 },
    { month: "Mar", JP: 32, VN: 19, KR: 34, CO: 14, CN: 28 },
    { month: "Apr", JP: 27, VN: 21, KR: 30, CO: 17, CN: 23 },
    { month: "May", JP: 29, VN: 23, KR: 33, CO: 18, CN: 26 },
    { month: "Jun", JP: 28, VN: 22, KR: 31, CO: 18, CN: 24 },
  ],
};
