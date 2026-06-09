"use client";

import { useState } from "react";
import { employees, leaveBalances, monthlyStats, COUNTRY_FLAGS } from "@/lib/mock-data";
import { cn, formatName } from "@/lib/utils";
import {
  CheckCircle,
  Clock,
  Download,
  Filter,
  Home,
  Umbrella,
  AlertCircle,
  Zap,
  UserCheck,
} from "lucide-react";
import { useLang } from "@/context/lang";

const weeks = [
  { date: "06/02", statuses: { e1: "present", e2: "present", e3: "present", e6: "present" } },
  { date: "06/03", statuses: { e1: "present", e2: "present", e3: "remote", e6: "present" } },
  { date: "06/04", statuses: { e1: "remote", e2: "overtime", e3: "present", e6: "present" } },
  { date: "06/05", statuses: { e1: "present", e2: "overtime", e3: "present", e6: "leave" } },
  { date: "06/06", statuses: { e1: "present", e2: "absent", e3: "present", e6: "remote" } },
  { date: "06/09", statuses: { e1: "present", e2: "absent", e3: "present", e6: "present" } },
];

type StatusKey = "present" | "remote" | "leave" | "absent" | "overtime";

const STATUS_CONFIG: Record<StatusKey, {
  bg: string;
  icon: React.ReactNode;
  dotColor: string;
}> = {
  present:  { bg: "bg-emerald-100 text-emerald-700", icon: <UserCheck size={14} />, dotColor: "bg-emerald-500" },
  remote:   { bg: "bg-blue-100 text-blue-700",       icon: <Home size={14} />,      dotColor: "bg-blue-500" },
  leave:    { bg: "bg-violet-100 text-violet-700",   icon: <Umbrella size={14} />,  dotColor: "bg-violet-500" },
  absent:   { bg: "bg-red-100 text-red-700",         icon: <AlertCircle size={14} />, dotColor: "bg-red-500" },
  overtime: { bg: "bg-amber-100 text-amber-700",     icon: <Zap size={14} />,       dotColor: "bg-amber-500" },
};

export default function AttendancePage() {
  const [tab, setTab] = useState<"calendar" | "leave">("calendar");
  const { t } = useLang();
  const myTeam = employees.filter((e) => ["e1", "e2", "e3", "e6"].includes(e.id));

  const STATUS_LABELS: Record<StatusKey, string> = {
    present:  t("present_short"),
    remote:   t("remote_short"),
    leave:    t("leave_short"),
    absent:   t("absent_short"),
    overtime: t("overtime_short"),
  };

  return (
    <div className="p-4 md:p-8 space-y-6 pt-16 md:pt-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Clock size={24} className="text-indigo-500" />
            {t("attendance_mgmt")}
          </h1>
          <p className="text-slate-500 text-sm mt-1">{t("attendance_subtitle")}</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 text-sm border border-slate-200 px-3 py-2 rounded-lg hover:bg-slate-50">
            <Filter size={15} /> {t("filter")}
          </button>
          <button className="flex items-center gap-2 text-sm bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700">
            <Download size={15} /> {t("export_csv")}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-fit">
        {(["calendar", "leave"] as const).map((tabKey) => (
          <button
            key={tabKey}
            onClick={() => setTab(tabKey)}
            className={cn(
              "px-4 py-1.5 text-sm rounded-md font-medium transition-colors",
              tab === tabKey ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            {tabKey === "calendar" ? t("attendance_calendar") : t("leave_balance")}
          </button>
        ))}
      </div>

      {tab === "calendar" && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <h2 className="font-semibold">2026 / 6 — {t("weekly_attendance")}</h2>
            {/* Legend */}
            <div className="flex flex-wrap gap-3 text-xs text-slate-500">
              {(Object.keys(STATUS_CONFIG) as StatusKey[]).map((k) => (
                <span key={k} className="flex items-center gap-1.5">
                  <span className={cn("w-5 h-5 rounded flex items-center justify-center", STATUS_CONFIG[k].bg)}>
                    {STATUS_CONFIG[k].icon}
                  </span>
                  {STATUS_LABELS[k]}
                </span>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs text-slate-400">
                  <th className="text-left px-6 py-3 font-medium w-44">{t("member")}</th>
                  {weeks.map((w) => (
                    <th key={w.date} className="text-center py-3 font-medium px-2 min-w-[56px]">{w.date}</th>
                  ))}
                  <th className="text-right px-6 py-3 font-medium">{t("monthly_overtime")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {myTeam.map((emp) => {
                  const stats = monthlyStats.find((s) => s.employeeId === emp.id);
                  return (
                    <tr key={emp.id} className="hover:bg-slate-50">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0">
                            {emp.avatar}
                          </div>
                          <div>
                            <div className="font-medium text-sm">{formatName(emp)}</div>
                            <div className="text-xs text-slate-400">{COUNTRY_FLAGS[emp.country]}</div>
                          </div>
                        </div>
                      </td>
                      {weeks.map((w) => {
                        const s = ((w.statuses as Record<string, string>)[emp.id] ?? "present") as StatusKey;
                        const cfg = STATUS_CONFIG[s];
                        return (
                          <td key={w.date} className="py-3 px-2 text-center">
                            <span
                              title={STATUS_LABELS[s]}
                              className={cn("inline-flex w-8 h-8 rounded-lg items-center justify-center mx-auto", cfg.bg)}
                            >
                              {cfg.icon}
                            </span>
                          </td>
                        );
                      })}
                      <td className="px-6 py-3 text-right">
                        <span className={cn("text-sm font-semibold", (stats?.overtimeHours ?? 0) > 30 ? "text-red-600" : "text-slate-700")}>
                          {stats?.overtimeHours ?? 0}h
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "leave" && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="font-semibold">{t("leave_balance")} — {t("team")}</h2>
          </div>
          <div className="divide-y divide-slate-50">
            {myTeam.map((emp) => {
              const bal = leaveBalances.find((l) => l.employeeId === emp.id);
              if (!bal) return null;
              const usedPct = Math.round((bal.used / bal.annual) * 100);
              const remaining = bal.annual - bal.used;
              return (
                <div key={emp.id} className="px-6 py-4 flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex items-center gap-3 md:w-44">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0">
                      {emp.avatar}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{emp.name}</div>
                      <div className="text-xs text-slate-400">{COUNTRY_FLAGS[emp.country]}</div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-500">{t("leave_usage_rate")} {usedPct}%</span>
                      <span className="font-medium">{bal.used} / {bal.annual} {t("days_remaining").includes("日") ? "日" : "days"}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={cn("h-full rounded-full", usedPct >= 60 ? "bg-emerald-500" : usedPct >= 30 ? "bg-amber-500" : "bg-red-400")}
                        style={{ width: `${usedPct}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right md:w-28">
                    <div className={cn("text-lg font-bold", remaining <= 3 ? "text-amber-600" : "text-slate-800")}>{remaining}</div>
                    <div className="text-xs text-slate-400">{t("days_remaining")}</div>
                  </div>
                  <div className="text-right md:w-28">
                    <div className="text-sm text-slate-600">{bal.sickUsed} / {bal.sick}</div>
                    <div className="text-xs text-slate-400">{t("sick_leave")}</div>
                  </div>
                  {remaining <= 5 && (
                    <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-1 rounded-full shrink-0">
                      {t("encourage_leave")}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Leave Request Panel */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5">
        <div className="flex items-center gap-3 mb-3">
          <CheckCircle size={18} className="text-indigo-600" />
          <h3 className="font-semibold text-indigo-900">{t("pending_approvals")}</h3>
        </div>
        <div className="space-y-2">
          {[
            { name: "Hanako Tanaka （田中 花子）", type: t("leave_short"), dates: "Jun 16 (Mon) – 17 (Tue)", days: 2 },
            { name: "Nguyen Van An", type: t("sick_leave"), dates: "Jun 12 (Thu)", days: 1 },
          ].map((req) => (
            <div key={req.name} className="flex items-center justify-between bg-white rounded-lg px-4 py-3 shadow-sm gap-3">
              <div className="min-w-0">
                <span className="text-sm font-medium">{req.name}</span>
                <span className="text-xs text-slate-500 ml-2 block md:inline">{req.type} · {req.dates} ({req.days}d)</span>
              </div>
              <div className="flex gap-2 shrink-0">
                <button className="text-xs bg-emerald-500 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-600">{t("approve")}</button>
                <button className="text-xs border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50">{t("reject")}</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
