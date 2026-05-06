import { Router } from "express";

const router = Router();

router.post("/daily-summary", async (req, res) => {
  const secret = req.headers["x-cron-secret"] || req.headers["authorization"]?.replace("Bearer ", "");
  const expected = process.env.INTERNAL_CRON_SECRET;

  if (!expected || secret !== expected) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Stub: this would query all active projects and send daily summary emails
  console.log("[daily-summary] Scheduled: would send daily summary emails");

  res.json({ status: "ok", message: "Daily summary generation triggered (stub)" });
});

export default router;
