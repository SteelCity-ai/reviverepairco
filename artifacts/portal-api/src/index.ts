import express from "express";
import cors from "cors";
import compression from "compression";
import helmet from "helmet";

import { clerkAuth } from "./middleware/auth.js";
import healthRouter from "./routes/health.js";
import meRouter from "./routes/me.js";
import clientsRouter from "./routes/clients.js";
import usersRouter from "./routes/users.js";
import projectsRouter from "./routes/projects.js";
import workTypesRouter from "./routes/work-types.js";
import mainTasksRouter from "./routes/main-tasks.js";
import dailyTasksRouter from "./routes/daily-tasks.js";
import photosRouter from "./routes/photos.js";
import commentsRouter from "./routes/comments.js";
import documentsRouter from "./routes/documents.js";
import punchItemsRouter from "./routes/punch-items.js";
import changeOrdersRouter from "./routes/change-orders.js";
import dailyLogsRouter from "./routes/daily-logs.js";
import selectionsRouter from "./routes/selections.js";
import timeEntriesRouter from "./routes/time-entries.js";
import checklistsRouter from "./routes/checklists.js";
import dailySummaryRouter from "./routes/daily-summary.js";
import activityLogRouter from "./routes/activity-log.js";

const app = express();
const PORT = parseInt(process.env.PORT ?? "3002", 10);

// ── Global middleware ──────────────────────────────────────────────────────

app.use(
  cors({
    origin: [
      "https://portal.reviverepairco.com",
      "http://localhost:3001",
    ],
    credentials: true,
  }),
);

app.use(compression());
app.use(helmet());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// ── Unauthenticated routes ─────────────────────────────────────────────────

app.use("/api/v1/healthz", healthRouter);

// ── Internal routes (bearer-secret auth, not Clerk) ────────────────────────

app.use("/api/v1/internal", dailySummaryRouter);

// ── Clerk-protected routes ─────────────────────────────────────────────────

app.use("/api/v1", clerkAuth);

app.use("/api/v1/me", meRouter);
app.use("/api/v1/clients", clientsRouter);
app.use("/api/v1/users", usersRouter);
app.use("/api/v1/projects", projectsRouter);
app.use("/api/v1/work-types", workTypesRouter);
app.use("/api/v1/main-tasks", mainTasksRouter);
app.use("/api/v1/daily-tasks", dailyTasksRouter);
app.use("/api/v1/photos", photosRouter);
app.use("/api/v1/comments", commentsRouter);
app.use("/api/v1/documents", documentsRouter);
app.use("/api/v1/punch-items", punchItemsRouter);
app.use("/api/v1/change-orders", changeOrdersRouter);
app.use("/api/v1/daily-logs", dailyLogsRouter);
app.use("/api/v1/selections", selectionsRouter);
app.use("/api/v1/time-entries", timeEntriesRouter);
app.use("/api/v1/checklists", checklistsRouter);
app.use("/api/v1/activity", activityLogRouter);

// ── Error handling ─────────────────────────────────────────────────────────

app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error("[api-server] Unhandled error:", err);
    res.status(500).json({
      error: "Internal Server Error",
      message:
        process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  },
);

// ── Start ──────────────────────────────────────────────────────────────────

const server = app.listen(PORT, () => {
  console.log(`[api-server] Listening on http://0.0.0.0:${PORT}`);
  console.log(`[api-server] Health:    http://0.0.0.0:${PORT}/api/v1/healthz`);
  console.log(`[api-server] API base:  http://0.0.0.0:${PORT}/api/v1`);
});

export { app };
export default server;
