"use client";

import { employees, todayAttendance, leaveBalances, monthlyStats, okrs, aiInsights, healthData, COUNTRY_FLAGS } from "@/lib/mock-data";
import { cn, getOkrStatusLabel, getRiskColor, calcProgress, getProgressColor, formatName } from "@/lib/utils";
import { AlertTriangle, CheckCircle, TrendingUp, Users, Clock, Target, Heart, Thermometer, Moon, Activity } from "lucide-react";
import NotificationPanel from "@/components/NotificationPanel";
import { useLang } from "@/context/lang";
import { okrObjectiveI18n, krTitleI18n, aiInsightI18n } from "@/lib/i18n-data";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function Dashboard() {
  const { t, tData, lang } = useLang();
  const myTeam = employees.filter((e) => e.managerId === "m1");
  const presentCount = myTeam.filter((e) => todayAttendance[e.id] === "present").length;
  const remoteCount = myTeam.filter((e) => todayAttendance[e.id] === "remote").length;
  const leaveCount = myTeam.filter((e) => todayAttendance[e.id] === "leave").length;
  const absentCount = myTeam.filter((e) => todayAttendance[e.id] === "absent").length;

  const teamOkr = okrs.find((o) => o.id === "okr-eng-q2")!;
  const companyOkr = okrs.find((o) => o.id === "okr-company-q2")!;

  const statusConfig = {
    present: { label: t("present"), dot: "bg-emerald-500", text: "text-emerald-700 bg-emerald-50" },
    remote: { label: t("remote"), dot: "bg-blue-500", text: "text-blue-700 bg-blue-50" },
    leave: { label: t("leave"), dot: "bg-violet-500", text: "text-violet-700 bg-violet-50" },
    absent: { label: t("absent"), dot: "bg-red-500 animate-pulse", text: "text-red-700 bg-red-50" },
    holiday: { label: lang === "ja" ? "祝日" : "Holiday", dot: "bg-slate-400", text: "text-slate-600 bg-slate-100" },
  };

  const statusCards = [
    { key: "present", label: t("present"), value: presentCount, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
    { key: "remote", label: t("remote"), value: remoteCount, icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50" },
    { key: "leave", label: t("leave"), value: leaveCount, icon: Users, color: "text-violet-600", bg: "bg-violet-50" },
    { key: "absent", label: `${t("absent")} ⚠️`, value: absentCount, icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
  ];

  const ofLabel = lang === "ja"
    ? `チームメンバー ${myTeam.length}名中`
    : lang === "ko"
    ? `팀 멤버 ${myTeam.length}명 중`
    : lang === "zh"
    ? `团队成员 共${myTeam.length}人`
    : `${myTeam.length} ${t("of_count")} team`;

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 pt-16 md:pt-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">{t("greeting")}、鈴木さん 👋</h1>
          <p className="text-slate-500 text-sm mt-1">2026-06-09 (Mon) ｜ Engineering Team</p>
        </div>
        <NotificationPanel />
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statusCards.map((card) => (
          <div key={card.key} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">{card.label}</span>
              <div className={cn("p-2 rounded-lg", card.bg)}>
                <card.icon size={18} className={card.color} />
              </div>
            </div>
            <div className={cn("text-3xl font-bold mt-2", card.color)}>{card.value}</div>
            <div className="text-xs text-slate-400 mt-1">{ofLabel}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Team Attendance Table */}
        <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold flex items-center gap-2">
              <Clock size={18} className="text-indigo-500" /> {t("team_attendance")}
            </h2>
            <span className="text-xs text-slate-400">{t("realtime")}</span>
          </div>
          <table className="w-full">
            <thead>
              <tr className="text-xs text-slate-400 border-b border-slate-50">
                <th className="text-left px-6 py-3 font-medium">{t("member")}</th>
                <th className="text-left px-4 py-3 font-medium">{t("status")}</th>
                <th className="text-right px-4 py-3 font-medium">{t("overtime")}</th>
                <th className="text-right px-6 py-3 font-medium">{t("remaining_leave")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {myTeam.map((emp) => {
                const status = todayAttendance[emp.id] ?? "absent";
                const cfg = statusConfig[status as keyof typeof statusConfig] ?? statusConfig.absent;
                const balance = leaveBalances.find((l) => l.employeeId === emp.id);
                const stats = monthlyStats.find((s) => s.employeeId === emp.id);
                const remaining = balance ? balance.annual - balance.used : 0;
                const overtime = stats?.overtimeHours ?? 0;
                return (
                  <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                          {emp.avatar}
                        </div>
                        <div>
                          <div className="text-sm font-medium">{formatName(emp)}</div>
                          <div className="text-xs text-slate-400">{COUNTRY_FLAGS[emp.country]} {emp.country}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full", cfg.text)}>
                        <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={cn("text-sm font-medium", overtime > 30 ? "text-red-600" : overtime > 20 ? "text-amber-600" : "text-slate-700")}>
                        {overtime}h
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <span className={cn("text-sm font-medium", remaining <= 3 ? "text-amber-600" : "text-slate-700")}>
                        {remaining}{t("days_unit")}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* AI Insights */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-sm flex items-center gap-2">
                <span className="w-5 h-5 bg-violet-100 text-violet-600 rounded flex items-center justify-center text-xs">✦</span>
                {t("ai_insights")}
              </h2>
            </div>
            <div className="p-4 space-y-3">
              {aiInsights.map((insight) => {
                const emp = employees.find((e) => e.id === insight.employeeId);
                const i18n = aiInsightI18n[insight.employeeId];
                const message = tData(insight.message, i18n?.message);
                const action = tData(insight.actionLabel, i18n?.actionLabel);
                return (
                  <div key={insight.employeeId} className={cn("border rounded-lg p-3 text-xs", getRiskColor(insight.riskLevel))}>
                    <div className="font-medium mb-1">{emp ? formatName(emp) : ""}</div>
                    <p className="text-xs leading-relaxed opacity-90">{message}</p>
                    <button className="mt-2 text-xs font-medium underline underline-offset-2 opacity-80 hover:opacity-100">
                      {action}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Row: Overtime Chart + Team Health */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Overtime Bar Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
          <h2 className="font-semibold text-sm flex items-center gap-2 mb-4">
            <Activity size={16} className="text-amber-500" />
            {t("monthly_overtime")} (h)
          </h2>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={myTeam.map((emp) => {
              const s = monthlyStats.find((m) => m.employeeId === emp.id);
              return { name: emp.nameEn.split(" ")[0], hours: s?.overtimeHours ?? 0 };
            })} margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => [`${v}h`, t("overtime")]} />
              <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
                {myTeam.map((emp) => {
                  const s = monthlyStats.find((m) => m.employeeId === emp.id);
                  const h = s?.overtimeHours ?? 0;
                  return <Cell key={emp.id} fill={h > 30 ? "#ef4444" : h > 20 ? "#f59e0b" : "#6366f1"} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-3 mt-2 text-xs text-slate-400">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-indigo-500 inline-block" /> {t("normal")}</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-amber-500 inline-block" /> &gt;20h</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-red-500 inline-block" /> &gt;30h</span>
          </div>
        </div>

        {/* Team Health Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-sm flex items-center gap-2">
              <Heart size={16} className="text-rose-500" />
              {t("team_health")}
            </h2>
            <span className="text-xs text-slate-400">{t("wearable_sync")}</span>
          </div>
          <div className="divide-y divide-slate-50">
            {myTeam.map((emp) => {
              const hd = healthData.find((h) => h.employeeId === emp.id);
              if (!hd) return (
                <div key={emp.id} className="px-5 py-3 flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0">{emp.avatar}</div>
                  <span className="text-xs text-slate-400 flex-1">{emp.nameEn.split(" ")[0]}</span>
                  <span className="text-xs text-slate-300">— {t("no_device")}</span>
                </div>
              );
              const sleepOk = hd.sleepHours >= 6;
              const hrOk = hd.heartRate < 75;
              const tempOk = hd.bodyTemp <= 37.0;
              const allOk = sleepOk && hrOk && tempOk;
              return (
                <div key={emp.id} className="px-5 py-3 flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0">{emp.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate">{emp.nameEn.split(" ")[0]}</div>
                    <div className="text-xs text-slate-400">{hd.device}</div>
                  </div>
                  <div className="flex items-center gap-2 text-xs shrink-0">
                    <span className={cn("flex items-center gap-0.5", hrOk ? "text-slate-500" : "text-red-500 font-semibold")}>
                      <Heart size={11} /> {hd.heartRate}
                    </span>
                    <span className={cn("flex items-center gap-0.5", tempOk ? "text-slate-500" : "text-red-500 font-semibold")}>
                      <Thermometer size={11} /> {hd.bodyTemp}°
                    </span>
                    <span className={cn("flex items-center gap-0.5", sleepOk ? "text-slate-500" : "text-amber-500 font-semibold")}>
                      <Moon size={11} /> {hd.sleepHours}h
                    </span>
                    {!allOk && (
                      <span className="ml-1 px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded text-xs font-medium">{t("health_alert")}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* OKR Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[companyOkr, teamOkr].map((okr) => {
          const statusInfo = getOkrStatusLabel(okr.status, t);
          const objective = tData(okr.objective, okrObjectiveI18n[okr.id]);
          const typeLabel = okr.type === "company"
            ? (lang === "ja" ? "全社" : lang === "ko" ? "전사" : lang === "zh" ? "全司" : lang === "vi" ? "Công ty" : lang === "es" ? "Empresa" : "Company")
            : (lang === "ja" ? "チーム" : lang === "ko" ? "팀" : lang === "zh" ? "团队" : lang === "vi" ? "Nhóm" : lang === "es" ? "Equipo" : "Team");
          return (
            <div key={okr.id} className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0 mr-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Target size={16} className="text-indigo-500" />
                    <span className="text-xs text-slate-400">{okr.quarter} · {typeLabel}</span>
                  </div>
                  <h3 className="text-sm font-semibold leading-snug">{objective}</h3>
                </div>
                <span className={cn("text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap shrink-0", statusInfo.color)}>
                  {statusInfo.label}
                </span>
              </div>
              <div className="space-y-3">
                {okr.keyResults.map((kr) => {
                  const pct = calcProgress(kr.current, kr.target);
                  const krTitle = tData(kr.title, krTitleI18n[kr.id]);
                  return (
                    <div key={kr.id}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-600 flex-1 mr-2 truncate">{krTitle}</span>
                        <span className="font-medium text-slate-800 whitespace-nowrap">{kr.current}{kr.unit} / {kr.target}{kr.unit}</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full transition-all", getProgressColor(pct))} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
