const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json() as Promise<T>;
}

export const api = {
  attendance: {
    checkIn: (employeeId: string, status: "present" | "remote" = "present") =>
      request<{ success: boolean; message: string; checkIn?: string }>("/api/attendance/check-in", {
        method: "POST",
        body: JSON.stringify({ employeeId, status }),
      }),
    checkOut: (employeeId: string) =>
      request<{ success: boolean; message: string }>("/api/attendance/check-out", {
        method: "POST",
        body: JSON.stringify({ employeeId }),
      }),
    teamToday: (managerId: string) =>
      request<Array<{ id: string; name: string; status: string; overtime_hours: number }>>(`/api/attendance/today/${managerId}`),
    monthly: (employeeId: string, yearMonth: string) =>
      request<{ work_days: number; total_overtime: number }>(`/api/attendance/monthly/${employeeId}/${yearMonth}`),
  },
  okr: {
    getAll: (quarter?: string) =>
      request<unknown[]>(`/api/okr${quarter ? `?quarter=${encodeURIComponent(quarter)}` : ""}`),
    updateKr: (krId: string, currentValue: number) =>
      request<{ success: boolean; avgProgress: number }>(`/api/okr/key-results/${krId}`, {
        method: "PATCH",
        body: JSON.stringify({ currentValue }),
      }),
    syncMetrics: () =>
      request<{ success: boolean }>("/api/okr/sync-metrics", { method: "POST" }),
  },
  ai: {
    insights: (managerId: string) =>
      request<Array<{ employeeId: string; level: string; message: string; factors: string[] }>>(`/api/ai/insights/${managerId}`),
    report: (managerId: string, yearMonth: string) =>
      request<{ report: string }>(`/api/ai/report/${managerId}/${yearMonth}`),
  },
  health: () => request<{ status: string }>("/health"),
};
