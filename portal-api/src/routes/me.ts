import { Router } from "express";
import { db } from "../../lib/db/index.js";
import { eq, sql } from "drizzle-orm";

const router = Router();

// GET /api/v1/me — returns current user profile
router.get("/", async (req, res, next) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    // Re-fetch the latest profile data (may have been updated elsewhere)
    const { userProfile } = await import("../../lib/db/schema/portal.js");
    // Use the in-memory user context — it's already loaded by auth middleware
    res.json({
      id: req.user.userId,
      clerkUserId: req.user.clerkUserId,
      role: req.user.role,
      displayName: req.user.displayName,
      email: req.user.email,
      clientId: req.user.clientId,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
