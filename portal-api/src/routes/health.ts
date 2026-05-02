import { Router } from "express";

const router = Router();

// GET /api/v1/healthz — health check, no auth required
router.get("/", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

export default router;
