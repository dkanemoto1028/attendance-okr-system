import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { OkrStatus, RiskLevel } from "./mock-data";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getOkrStatusLabel(status: OkrStatus, t?: (key: string) => string) {
  const label = (key: string, fallback: string) => t ? t(key) : fallback;
  const map: Record<OkrStatus, { label: string; color: string }> = {
    on_track: { label: label("on_track", "順調"), color: "text-emerald-600 bg-emerald-50" },
    at_risk:  { label: label("at_risk",  "要注意"), color: "text-amber-600 bg-amber-50" },
    off_track: { label: label("off_track", "要改善"), color: "text-red-600 bg-red-50" },
  };
  return map[status];
}

export function getRiskColor(level: RiskLevel) {
  const map: Record<RiskLevel, string> = {
    low: "text-emerald-600 bg-emerald-50 border-emerald-200",
    medium: "text-amber-600 bg-amber-50 border-amber-200",
    high: "text-red-600 bg-red-50 border-red-200",
  };
  return map[level];
}

export function getProgressColor(pct: number) {
  if (pct >= 70) return "bg-emerald-500";
  if (pct >= 40) return "bg-amber-500";
  return "bg-red-500";
}

export function calcProgress(current: number, target: number) {
  return Math.min(Math.round((current / target) * 100), 100);
}

export function formatName(emp: { nameEn: string; name: string }): string {
  if (emp.nameEn === emp.name) return emp.nameEn;
  return `${emp.nameEn} （${emp.name}）`;
}
