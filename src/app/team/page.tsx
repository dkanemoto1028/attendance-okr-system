"use client";

import { employees, okrs, monthlyStats, leaveBalances, todayAttendance, aiInsights, COUNTRY_FLAGS } from "@/lib/mock-data";
import { cn, getOkrStatusLabel, calcProgress, getProgressColor, getRiskColor, formatName } from "@/lib/utils";
import { Users, Target, Clock } from "lucide-react";
import { useLang } from "@/context/lang";
import { okrObjectiveI18n, aiInsightI18n } from "@/lib/i18n-data";

export default function TeamPage() {
  const { t, tData } = useLang();
  const myTeam = employees.filter((e) => e.managerId === "m1");

  const statusLabels = {
    present: { label: t("present"), dot: "bg-emerald-500" },
    remote:  { label: t("remote"),  dot: "bg-blue-500" },
    leave:   { label: t("leave"),   dot: "bg-violet-500" },
    absent:  { label: t("absent"),  dot: "bg-red-500 animate-pulse" },
  };

  return (
    <div className="p-4 md:p-8 space-y-6 pt-16 md:pt-8">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Users size={24} className="text-indigo-500" /> {t("team_detail")}</h1>
        <p className="text-slate-500 text-sm mt-1">{t("team_subtitle")}</p>
      </div>

      <div className="space-y-4">
        {myTeam.map((emp) => {
          const stats = monthlyStats.find((s) => s.employeeId === emp.id);
          const bal = leaveBalances.find((b) => b.employeeId === emp.id);
          const empOkr = okrs.find((o) => o.ownerId === emp.id);
          const status = todayAttendance[emp.id] ?? "absent";
          const insight = aiInsights.find((i) => i.employeeId === emp.id);
          const avgProgress = empOkr
            ? Math.round(empOkr.keyResults.reduce((s, kr) => s + calcProgress(kr.current, kr.target), 0) / empOkr.keyResults.length)
            : null;

          const sc = statusLabels[status as keyof typeof statusLabels] ?? statusLabels.absent;

          return (
            <div key={emp.id} className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
              <div className="flex flex-col md:flex-row md:items-start gap-5">
                {/* Avatar & Info */}
                <div className="flex items-center gap-3 md:w-52 shrink-0">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold">
                    {emp.avatar}
                  </div>
                  <div>
                    <div className="font-semibold">{formatName(emp)}</div>
                    <div className="text-xs text-slate-400">{emp.role} · {COUNTRY_FLAGS[emp.country]} {emp.country}</div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className={cn("w-1.5 h-1.5 rounded-full", sc.dot)} />
                      <span className="text-xs text-slate-500">{sc.label}</span>
                    </div>
                  </div>
                </div>

                {/* Attendance Stats */}
                <div className="grid grid-cols-3 gap-4 flex-1">
                  <Stat icon={<Clock size={14} />} label={t("overtime")} value={`${stats?.overtimeHours ?? 0}h`} warn={(stats?.overtimeHours ?? 0) > 30} />
                  <Stat icon={<span className="text-xs">🌴</span>} label={t("remaining_leave")} value={`${(bal?.annual ?? 0) - (bal?.used ?? 0)}${t("days_unit")}`} warn={(bal?.annual ?? 0) - (bal?.used ?? 0) <= 3} />
                  <Stat icon={<span className="text-xs">😷</span>} label={t("this_month_sick")} value={`${stats?.lateCount ?? 0}`} />
                </div>

                {/* OKR Progress */}
                <div className="md:w-52 shrink-0">
                  {empOkr && avgProgress !== null ? (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1 text-xs text-slate-500"><Target size={12} /> {t("okr_progress")}</div>
                        <span className={cn("text-xs font-medium px-1.5 py-0.5 rounded-full", getOkrStatusLabel(empOkr.status, t).color)}>
                          {getOkrStatusLabel(empOkr.status, t).label}
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-slate-800 mb-1">{avgProgress}%</div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full", getProgressColor(avgProgress))} style={{ width: `${avgProgress}%` }} />
                      </div>
                      <div className="text-xs text-slate-400 mt-1 truncate">
                        {tData(empOkr.objective, okrObjectiveI18n[empOkr.id])}
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 border-2 border-dashed border-slate-200 rounded-lg p-3 text-center">
                      {t("no_okr_set")}<br />
                      <button className="text-indigo-500 mt-1 hover:underline">{t("set_okr")}</button>
                    </div>
                  )}
                </div>
              </div>

              {/* AI Insight */}
              {insight && (
                <div className={cn("mt-4 text-xs rounded-lg border px-4 py-3 flex items-start gap-3", getRiskColor(insight.riskLevel))}>
                  <span className="shrink-0 mt-0.5">✦</span>
                  <div className="flex-1">
                    {tData(insight.message, aiInsightI18n[insight.employeeId]?.message)}
                  </div>
                  <button className="font-medium underline underline-offset-2 shrink-0">
                    {tData(insight.actionLabel, aiInsightI18n[insight.employeeId]?.actionLabel)}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Stat({ icon, label, value, warn }: { icon: React.ReactNode; label: string; value: string; warn?: boolean }) {
  return (
    <div className="bg-slate-50 rounded-lg p-3">
      <div className="flex items-center gap-1 text-xs text-slate-400 mb-1">{icon}{label}</div>
      <div className={cn("text-lg font-bold", warn ? "text-amber-600" : "text-slate-800")}>{value}</div>
    </div>
  );
}
