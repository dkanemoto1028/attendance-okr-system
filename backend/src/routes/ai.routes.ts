import type { FastifyInstance } from "fastify";
import { AIService } from "../services/ai.service.js";

export async function aiRoutes(app: FastifyInstance) {
  const svc = new AIService(app.db);

  // GET /ai/insights/:managerId — team risk overview
  app.get<{ Params: { managerId: string } }>("/insights/:managerId", async (req) => {
    return svc.getTeamInsights(req.params.managerId);
  });

  // GET /ai/risk/:employeeId — individual risk score
  app.get<{ Params: { employeeId: string } }>("/risk/:employeeId", async (req) => {
    return svc.calculateRiskScore(req.params.employeeId);
  });

  // GET /ai/report/:managerId/:yearMonth — monthly narrative report
  app.get<{ Params: { managerId: string; yearMonth: string } }>(
    "/report/:managerId/:yearMonth",
    async (req) => {
      const report = svc.generateMonthlyReport(req.params.managerId, req.params.yearMonth);
      return { report };
    }
  );
}
