import type { FastifyInstance } from "fastify";
import { AttendanceService } from "../services/attendance.service.js";

export async function attendanceRoutes(app: FastifyInstance) {
  const svc = new AttendanceService(app.db);

  // GET /attendance/today/:managerId — team today status
  app.get<{ Params: { managerId: string } }>("/today/:managerId", async (req) => {
    return svc.getTeamTodayStatus(req.params.managerId);
  });

  // GET /attendance/status/:employeeId — individual today
  app.get<{ Params: { employeeId: string } }>("/status/:employeeId", async (req) => {
    return svc.getTodayStatus(req.params.employeeId) ?? { status: "absent" };
  });

  // POST /attendance/check-in
  app.post<{ Body: { employeeId: string; status?: "present" | "remote" } }>("/check-in", {
    schema: {
      body: {
        type: "object",
        required: ["employeeId"],
        properties: {
          employeeId: { type: "string" },
          status: { type: "string", enum: ["present", "remote"] },
        },
      },
    },
  }, async (req) => {
    return svc.checkIn(req.body.employeeId, req.body.status ?? "present");
  });

  // POST /attendance/check-out
  app.post<{ Body: { employeeId: string } }>("/check-out", {
    schema: {
      body: {
        type: "object",
        required: ["employeeId"],
        properties: { employeeId: { type: "string" } },
      },
    },
  }, async (req) => {
    return svc.checkOut(req.body.employeeId);
  });

  // GET /attendance/monthly/:employeeId/:yearMonth
  app.get<{ Params: { employeeId: string; yearMonth: string } }>(
    "/monthly/:employeeId/:yearMonth",
    async (req) => {
      return svc.getMonthlyStats(req.params.employeeId, req.params.yearMonth);
    }
  );

  // GET /attendance/unpunched — for cron reminders
  app.get("/unpunched", async () => {
    return svc.getUnpunchedEmployees();
  });
}
