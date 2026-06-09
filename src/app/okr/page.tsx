"use client";

import { useState } from "react";
import { okrs, employees, monthlyStats, leaveBalances } from "@/lib/mock-data";
import { cn, getOkrStatusLabel, calcProgress, getProgressColor, formatName } from "@/lib/utils";
import { Target, ChevronDown, ChevronRight, TrendingUp, Link2 } from "lucide-react";
import { useLang } from "@/context/lang";
import { okrObjectiveI18n, krTitleI18n } from "@/lib/i18n-data";

export default function OkrPage() {
  const { t, tData } = useLang();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ "okr-company-q2": true, "okr-eng-q2": true });
  const toggle = (id: string) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const getLinkedValue = (metric?: string, ownerId?: string) => {
    if (!metric) return null;
    if (metric === "overtime") {
      const stats = monthlyStats.find((s) => s.employeeId === ownerId);
      if (!stats) return null;
      return { label: t("actual"), value: `${stats.overtimeHours}h` };
    }
    if (metric === "leave_rate") {
      const bal = leaveBalances.find((b) => b.employeeId === ownerId);
      if (!bal) return null;
      const rate = Math.round((bal.used / bal.annual) * 100);
      return { label: t("usage_rate"), value: `${rate}%` };
    }
    return null;
  };

  const grouped = {
    company: okrs.filter((o) => o.type === "company"),
    team: okrs.filter((o) => o.type === "team"),
    individual: okrs.filter((o) => o.type === "individual"),
  };

  return (
    <div className="p-4 md:p-8 space-y-6 pt-16 md:pt-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Target size={24} className="text-indigo-500" /> {t("okr_mgmt")}</h1>
          <p className="text-slate-500 text-sm mt-1">{t("okr_subtitle")}</p>
        </div>
        <button className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
          {t("add_okr")}
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">{t("company_okr")}</div>
          {grouped.company.map((okr) => (
            <OkrCard key={okr.id} okr={okr} expanded={expanded[okr.id]} onToggle={() => toggle(okr.id)}
              getLinkedValue={getLinkedValue} indent={0} t={t} tData={tData} />
          ))}
        </div>

        <div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1 mt-6">{t("team_okr")}</div>
          {grouped.team.map((okr) => (
            <OkrCard key={okr.id} okr={okr} expanded={expanded[okr.id]} onToggle={() => toggle(okr.id)}
              getLinkedValue={getLinkedValue} indent={1} t={t} tData={tData} />
          ))}
        </div>

        <div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1 mt-6">{t("individual_okr")}</div>
          {grouped.individual.map((okr) => {
            const emp = employees.find((e) => e.id === okr.ownerId);
            return (
              <div key={okr.id} className="mb-3">
                <div className="text-xs text-slate-500 mb-1 ml-6">{emp ? formatName(emp) : ""}</div>
                <OkrCard okr={okr} expanded={expanded[okr.id]} onToggle={() => toggle(okr.id)}
                  getLinkedValue={getLinkedValue} indent={2} t={t} tData={tData} />
              </div>
            );
          })}
        </div>
      </div>

      <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-indigo-300 hover:bg-indigo-50/30 transition-colors cursor-pointer">
        <Target size={24} className="mx-auto text-slate-300 mb-2" />
        <p className="text-sm text-slate-400">{t("add_individual_okr")}</p>
      </div>
    </div>
  );
}

function OkrCard({
  okr, expanded, onToggle, getLinkedValue, indent, t, tData,
}: {
  okr: (typeof okrs)[0];
  expanded: boolean;
  onToggle: () => void;
  getLinkedValue: (metric?: string, ownerId?: string) => { label: string; value: string } | null;
  indent: number;
  t: (key: string) => string;
  tData: (base: string, translations?: Partial<Record<string, string>>) => string;
}) {
  const statusInfo = getOkrStatusLabel(okr.status, t);
  const avgProgress = Math.round(
    okr.keyResults.reduce((sum, kr) => sum + calcProgress(kr.current, kr.target), 0) / okr.keyResults.length
  );
  const objective = tData(okr.objective, okrObjectiveI18n[okr.id]);

  return (
    <div className={cn("bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden", indent > 0 && "ml-6")}>
      <button onClick={onToggle} className="w-full px-6 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors text-left">
        {expanded ? <ChevronDown size={18} className="text-slate-400 shrink-0" /> : <ChevronRight size={18} className="text-slate-400 shrink-0" />}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs text-slate-400">{okr.quarter}</span>
            <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", statusInfo.color)}>{statusInfo.label}</span>
          </div>
          <div className="font-semibold text-sm truncate">{objective}</div>
        </div>
        <div className="text-right shrink-0">
          <div className={cn("text-2xl font-bold", getProgressColor(avgProgress).replace("bg-", "text-"))}>
            {avgProgress}%
          </div>
          <div className="text-xs text-slate-400">{t("overall_progress")}</div>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-slate-50 px-6 pb-5 pt-4 space-y-4">
          {okr.keyResults.map((kr) => {
            const pct = calcProgress(kr.current, kr.target);
            const linked = getLinkedValue(kr.linkedMetric, okr.ownerId);
            const krTitle = tData(kr.title, krTitleI18n[kr.id]);
            return (
              <div key={kr.id}>
                <div className="flex items-start justify-between mb-2 gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                      {kr.linkedMetric && <Link2 size={12} className="text-indigo-400 shrink-0" />}
                      {krTitle}
                    </div>
                    {linked && (
                      <div className="text-xs text-indigo-600 mt-0.5 flex items-center gap-1">
                        <TrendingUp size={11} />
                        {t("attendance_linked")} {linked.label}: {linked.value}
                      </div>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-sm font-semibold text-slate-800">{kr.current}{kr.unit}</span>
                    <span className="text-xs text-slate-400"> / {kr.target}{kr.unit}</span>
                    <div className={cn("text-xs font-medium", pct >= 70 ? "text-emerald-600" : pct >= 40 ? "text-amber-600" : "text-red-600")}>{pct}%</div>
                  </div>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={cn("h-full rounded-full transition-all duration-500", getProgressColor(pct))} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
