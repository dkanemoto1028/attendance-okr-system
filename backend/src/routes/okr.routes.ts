import type { FastifyInstance } from "fastify";
import { OkrService } from "../services/okr.service.js";

export async function okrRoutes(app: FastifyInstance) {
  const svc = new OkrService(app.db);

  // GET /okr?quarter=Q2+2026
  app.get<{ Querystring: { quarter?: string } }>("/", async (req) => {
    return svc.getAll(req.query.quarter);
  });

  // GET /okr/owner/:ownerId
  app.get<{ Params: { ownerId: string } }>("/owner/:ownerId", async (req) => {
    return svc.getByOwner(req.params.ownerId);
  });

  // POST /okr
  app.post<{
    Body: {
      type: "company" | "team" | "individual";
      ownerId: string;
      ownerName: string;
      quarter: string;
      objective: string;
      parentId?: string;
    };
  }>("/", {
    schema: {
      body: {
        type: "object",
        required: ["type", "ownerId", "ownerName", "quarter", "objective"],
        properties: {
          type: { type: "string", enum: ["company", "team", "individual"] },
          ownerId: { type: "string" },
          ownerName: { type: "string" },
          quarter: { type: "string" },
          objective: { type: "string" },
          parentId: { type: "string" },
        },
      },
    },
  }, async (req) => {
    return svc.createOkr(req.body);
  });

  // POST /okr/:okrId/key-results
  app.post<{
    Params: { okrId: string };
    Body: { title: string; target: number; unit: string; linkedMetric?: string };
  }>("/key-results", {
    schema: {
      body: {
        type: "object",
        required: ["title", "target", "unit"],
        properties: {
          title: { type: "string" },
          target: { type: "number" },
          unit: { type: "string" },
          linkedMetric: { type: "string" },
        },
      },
    },
  }, async (req, reply) => {
    const body = req.body as { title: string; target: number; unit: string; linkedMetric?: string; okrId?: string };
    if (!body.okrId) return reply.code(400).send({ error: "okrId required" });
    return svc.addKeyResult(body.okrId, body);
  });

  // PATCH /okr/key-results/:krId
  app.patch<{ Params: { krId: string }; Body: { currentValue: number } }>(
    "/key-results/:krId",
    {
      schema: {
        body: {
          type: "object",
          required: ["currentValue"],
          properties: { currentValue: { type: "number" } },
        },
      },
    },
    async (req) => {
      return svc.updateKeyResult(req.params.krId, req.body.currentValue);
    }
  );

  // POST /okr/sync-metrics — sync attendance data into linked KRs
  app.post("/sync-metrics", async () => {
    svc.syncAttendanceMetrics(app.db);
    return { success: true, message: "勤怠データとOKRを同期しました" };
  });
}
