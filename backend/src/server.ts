import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import { App as SlackApp, LogLevel } from "@slack/bolt";
import { createDb, runMigrations, seedData } from "./db/schema.js";
import { attendanceRoutes } from "./routes/attendance.routes.js";
import { okrRoutes } from "./routes/okr.routes.js";
import { aiRoutes } from "./routes/ai.routes.js";
import { registerSlackHandlers, sendMorningReminders } from "./slack/bot.js";
import type Database from "better-sqlite3";

// ── Fastify type augmentation for db
declare module "fastify" {
  interface FastifyInstance {
    db: Database.Database;
  }
}

async function build() {
  // ── Database
  const db = createDb(process.env.DATABASE_URL);
  runMigrations(db);
  seedData(db);
  console.log("✅ Database ready");

  // ── Fastify
  const app = Fastify({ logger: { level: "info" } });

  await app.register(cors, {
    origin: process.env.FRONTEND_URL ?? "http://localhost:3000",
    credentials: true,
  });

  // Attach db to fastify instance
  app.decorate("db", db);

  // ── Routes
  await app.register(attendanceRoutes, { prefix: "/api/attendance" });
  await app.register(okrRoutes, { prefix: "/api/okr" });
  await app.register(aiRoutes, { prefix: "/api/ai" });

  // Health check
  app.get("/health", async () => ({ status: "ok", timestamp: new Date().toISOString() }));

  // ── Slack Bot (Socket Mode — no public URL needed for development)
  const isSlackConfigured =
    process.env.SLACK_BOT_TOKEN &&
    process.env.SLACK_SIGNING_SECRET &&
    process.env.SLACK_APP_TOKEN &&
    !process.env.SLACK_BOT_TOKEN.includes("your-bot-token");

  if (isSlackConfigured) {
    const slackApp = new SlackApp({
      token: process.env.SLACK_BOT_TOKEN,
      signingSecret: process.env.SLACK_SIGNING_SECRET,
      socketMode: true,
      appToken: process.env.SLACK_APP_TOKEN,
      logLevel: LogLevel.WARN,
    });

    registerSlackHandlers(slackApp, db);
    await slackApp.start();
    console.log("✅ Slack Bot connected (Socket Mode)");

    // Morning reminder cron (every day at 9am JST = 0 UTC)
    const NINE_AM_MS = 9 * 60 * 60 * 1000;
    const now = new Date();
    const todayNine = new Date(now);
    todayNine.setHours(9, 0, 0, 0);
    const msUntilNine = todayNine.getTime() > now.getTime()
      ? todayNine.getTime() - now.getTime()
      : NINE_AM_MS - (now.getTime() - todayNine.getTime());

    setTimeout(async () => {
      await sendMorningReminders(slackApp, db);
      setInterval(() => sendMorningReminders(slackApp, db), NINE_AM_MS);
    }, msUntilNine);

    console.log(`⏰ Morning reminder scheduled (next: ${new Date(Date.now() + msUntilNine).toLocaleString("ja-JP")})`);
  } else {
    console.log("ℹ️  Slack Bot skipped — set SLACK_BOT_TOKEN, SLACK_SIGNING_SECRET, SLACK_APP_TOKEN in .env");
  }

  // OKR ↔ Attendance sync every hour
  const { OkrService } = await import("./services/okr.service.js");
  const okrSvc = new OkrService(db);
  setInterval(() => {
    okrSvc.syncAttendanceMetrics(db);
    console.log("🔄 OKR metrics synced");
  }, 60 * 60 * 1000);

  return app;
}

const port = Number(process.env.PORT ?? 4000);

build().then((app) => {
  app.listen({ port, host: "0.0.0.0" }, (err) => {
    if (err) { console.error(err); process.exit(1); }
    console.log(`\n🚀 PeopleOS API ready at http://localhost:${port}`);
    console.log(`\nAPI Endpoints:`);
    console.log(`  GET  /health`);
    console.log(`  POST /api/attendance/check-in`);
    console.log(`  POST /api/attendance/check-out`);
    console.log(`  GET  /api/attendance/today/:managerId`);
    console.log(`  GET  /api/attendance/unpunched`);
    console.log(`  GET  /api/okr`);
    console.log(`  POST /api/okr`);
    console.log(`  PATCH /api/okr/key-results/:krId`);
    console.log(`  POST /api/okr/sync-metrics`);
    console.log(`  GET  /api/ai/insights/:managerId`);
    console.log(`  GET  /api/ai/report/:managerId/:yearMonth`);
  });
}).catch(console.error);
