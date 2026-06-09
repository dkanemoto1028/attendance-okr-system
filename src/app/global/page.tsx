"use client";

import { globalStats, COUNTRY_FLAGS, COUNTRY_NAMES, Country } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { Globe, AlertTriangle, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useLang } from "@/context/lang";
import { complianceAlertI18n, globalAiCardI18n } from "@/lib/i18n-data";

const COUNTRY_COLORS: Record<Country, string> = {
  JP: "#6366f1",
  VN: "#10b981",
  KR: "#f59e0b",
  CO: "#3b82f6",
  CN: "#ef4444",
};

const CARD_COLORS = [
  { color: "bg-blue-50 border-blue-200", titleColor: "text-blue-800" },
  { color: "bg-amber-50 border-amber-200", titleColor: "text-amber-800" },
  { color: "bg-emerald-50 border-emerald-200", titleColor: "text-emerald-800" },
];

const CARD_COUNTRIES: Country[] = ["KR", "CN", "CO"];

export default function GlobalPage() {
  const { t, tData, lang } = useLang();

  const complianceAlerts = [
    { country: "KR" as Country, message: tData("週52時間超過の可能性 → 3名該当。韓国労働時間法への対応が必要です。", complianceAlertI18n["KR"]), severity: "high" },
    { country: "CN" as Country, message: tData("有給取得率が法定基準を下回る可能性があります（現在38% / 最低40%目安）。", complianceAlertI18n["CN"]), severity: "medium" },
  ];

  return (
    <div className="p-4 md:p-8 space-y-6 pt-16 md:pt-8">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Globe size={24} className="text-indigo-500" /> {t("global_view")}</h1>
        <p className="text-slate-500 text-sm mt-1">{t("global_subtitle")}</p>
      </div>

      {/* Country Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {globalStats.byCountry.map((c) => (
          <div key={c.country} className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
            <div className="text-2xl mb-1">{COUNTRY_FLAGS[c.country]}</div>
            <div className="text-sm font-semibold mb-3">{COUNTRY_NAMES[c.country]}</div>
            <div className="space-y-2 text-xs">
              <Row label={t("headcount")} value={`${c.headcount}`} />
              <Row label={t("attendance_rate")} value={`${c.attendanceRate}%`} good={c.attendanceRate >= 92} bad={c.attendanceRate < 88} />
              <Row label={t("avg_overtime")} value={`${c.avgOvertime}h`} bad={c.avgOvertime > 28} />
              <Row label={t("leave_rate")} value={`${c.leaveRate}%`} good={c.leaveRate >= 60} bad={c.leaveRate < 40} />
            </div>
            {c.complianceAlerts > 0 && (
              <div className="mt-3 flex items-center gap-1 text-xs text-red-600 bg-red-50 rounded-lg px-2 py-1.5">
                <AlertTriangle size={12} />
                {t("compliance_alert_label")} {c.complianceAlerts}{t("compliance_alerts_unit")}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Compliance Alerts */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
        <h2 className="font-semibold mb-4 flex items-center gap-2"><AlertTriangle size={18} className="text-amber-500" /> {t("compliance_title")}</h2>
        <div className="space-y-3">
          {complianceAlerts.map((alert) => (
            <div key={alert.country} className={cn("flex items-start gap-3 p-4 rounded-lg border", alert.severity === "high" ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200")}>
              <span className="text-xl mt-0.5">{COUNTRY_FLAGS[alert.country]}</span>
              <div className="flex-1">
                <div className="text-sm font-medium text-slate-800">{COUNTRY_NAMES[alert.country]}</div>
                <div className="text-xs text-slate-600 mt-0.5">{alert.message}</div>
              </div>
              <button className="text-xs text-indigo-600 font-medium hover:underline shrink-0">{t("view_detail_arrow")}</button>
            </div>
          ))}
        </div>
      </div>

      {/* Overtime Trend Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h2 className="font-semibold mb-6 flex items-center gap-2"><TrendingUp size={18} className="text-indigo-500" /> {t("monthly_overtime_trend")}</h2>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={globalStats.overtimeTrend} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} unit="h" />
            <Tooltip formatter={(v) => [`${v}h`]} />
            <Legend />
            {(Object.keys(COUNTRY_COLORS) as Country[]).map((c) => (
              <Line key={c} type="monotone" dataKey={c} name={`${COUNTRY_FLAGS[c]} ${c}`} stroke={COUNTRY_COLORS[c]} strokeWidth={2} dot={{ r: 3 }} />
            ))}
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-3 flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          <AlertTriangle size={13} />
          {tData(
            "🇰🇷 韓国の残業時間が継続的に高水準です。週52h制の遵守状況を確認してください。",
            {
              en: "🇰🇷 Korea overtime is consistently high. Please verify compliance with the 52h/week rule.",
              ko: "🇰🇷 한국의 잔업시간이 지속적으로 높은 수준입니다. 주 52시간제 준수 여부를 확인해 주세요.",
              vi: "🇰🇷 Tăng ca tại Hàn Quốc liên tục ở mức cao. Hãy kiểm tra tuân thủ quy tắc 52h/tuần.",
              zh: "🇰🇷 韩国加班时间持续偏高。请确认每周52小时制的遵守情况。",
              es: "🇰🇷 Las horas extra en Corea son consistentemente altas. Verifique el cumplimiento de la regla de 52h/semana.",
            }
          )}
        </div>
      </div>

      {/* OKR × Attendance Correlation */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h2 className="font-semibold mb-1">{t("ai_analysis")}</h2>
        <p className="text-xs text-slate-400 mb-4">{t("ai_analysis_sub")}</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {globalAiCardI18n.map((card, i) => (
            <div key={i} className={cn("rounded-xl border p-4", CARD_COLORS[i].color)}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{COUNTRY_FLAGS[CARD_COUNTRIES[i]]}</span>
                <span className={cn("text-sm font-semibold", CARD_COLORS[i].titleColor)}>
                  {tData("", card.title)}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mb-3">
                {tData("", card.desc)}
              </p>
              <button className="text-xs font-medium text-indigo-600 hover:underline">
                {tData("", card.action)} →
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, good, bad }: { label: string; value: string; good?: boolean; bad?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-slate-400">{label}</span>
      <span className={cn("font-semibold", good ? "text-emerald-600" : bad ? "text-red-500" : "text-slate-700")}>{value}</span>
    </div>
  );
}
