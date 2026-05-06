import { Router } from "express";
import { z } from "zod";
import OpenAI from "openai";
import multer from "multer";
import { PDFParse } from "pdf-parse";
import { db } from "../../lib/db/index.js";
import {
  workType,
  mainTask,
  project,
} from "../../lib/db/schema/portal.js";
import { eq } from "drizzle-orm";
import { validate } from "../middleware/validate.js";
import { requireAdmin } from "../middleware/auth.js";

const router: Router = Router();

const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY ?? "placeholder",
});

const suggestMainTasksSchema = z.object({
  workTypeId: z.string().uuid(),
  count: z.number().int().min(1).max(20).optional().default(6),
});

const suggestDailyTasksSchema = z.object({
  mainTaskId: z.string().uuid(),
  count: z.number().int().min(1).max(20).optional().default(8),
});

// POST /api/v1/ai/suggest-main-tasks
// Admin gives a work type — AI returns suggested main task names + descriptions.
router.post(
  "/suggest-main-tasks",
  requireAdmin,
  validate.body(suggestMainTasksSchema),
  async (req, res, next) => {
    try {
      const { workTypeId, count } = req.body as {
        workTypeId: string;
        count: number;
      };

      const wt = await db.query.workType.findFirst({
        where: eq(workType.id, workTypeId),
      });
      if (!wt) {
        res.status(404).json({ error: "Work type not found" });
        return;
      }

      const proj = await db.query.project.findFirst({
        where: eq(project.id, wt.projectId),
      });

      const systemPrompt = `You are an expert construction project manager specializing in roofing, siding, gutters, and general contracting work in Central Pennsylvania. 
You help plan construction projects by breaking work down into clear, actionable tasks.
Always respond with valid JSON only — no markdown, no explanation text.`;

      const userPrompt = `A construction project is underway: "${proj?.name ?? "Unnamed project"}".
${proj?.description ? `Project description: ${proj.description}` : ""}

The work type being planned is: "${wt.name}"
${wt.description ? `Work type description: ${wt.description}` : ""}

Generate ${count} main task suggestions for this work type. Each main task represents a distinct phase or major activity within this work type.

Respond with a JSON array of objects. Each object must have:
- "name": short task name (3-7 words, title case)
- "description": one sentence describing what this task involves
- "estimatedDays": realistic number of days to complete (integer, 1-14)

Example format:
[
  {"name": "Remove Existing Shingles", "description": "Strip all old shingle layers down to the roof deck.", "estimatedDays": 2},
  {"name": "Inspect and Repair Decking", "description": "Check the wood decking for rot or damage and replace affected sections.", "estimatedDays": 1}
]`;

      const completion = await openai.chat.completions.create({
        model: "gpt-5-mini",
        max_completion_tokens: 2048,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      });

      const raw = completion.choices[0]?.message?.content ?? "[]";

      let suggestions: { name: string; description: string; estimatedDays: number }[];
      try {
        const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        suggestions = JSON.parse(cleaned);
        if (!Array.isArray(suggestions)) suggestions = [];
      } catch {
        console.error("[ai] Failed to parse main task suggestions:", raw);
        suggestions = [];
      }

      res.json({
        workTypeId,
        workTypeName: wt.name,
        suggestions: suggestions.slice(0, count),
      });
    } catch (err) {
      next(err);
    }
  },
);

// POST /api/v1/ai/suggest-daily-tasks
// Admin gives a main task — AI returns suggested daily task (step) names.
router.post(
  "/suggest-daily-tasks",
  requireAdmin,
  validate.body(suggestDailyTasksSchema),
  async (req, res, next) => {
    try {
      const { mainTaskId, count } = req.body as {
        mainTaskId: string;
        count: number;
      };

      const mt = await db.query.mainTask.findFirst({
        where: eq(mainTask.id, mainTaskId),
        with: { dailyTasks: true },
      });
      if (!mt) {
        res.status(404).json({ error: "Main task not found" });
        return;
      }

      const wt = await db.query.workType.findFirst({
        where: eq(workType.id, mt.workTypeId),
      });
      const proj = wt
        ? await db.query.project.findFirst({ where: eq(project.id, wt.projectId) })
        : null;

      const existingSteps = mt.dailyTasks.map((d) => d.title);

      const systemPrompt = `You are an expert construction project manager specializing in roofing, siding, gutters, and general contracting work in Central Pennsylvania.
You help crews execute work by breaking main tasks into clear, single-day actionable steps.
Always respond with valid JSON only — no markdown, no explanation text.`;

      const userPrompt = `Project: "${proj?.name ?? "Unnamed project"}"
Work type: "${wt?.name ?? "Unknown"}"
Main task: "${mt.name}"
${mt.description ? `Description: ${mt.description}` : ""}
${existingSteps.length > 0 ? `Already planned steps (do NOT duplicate): ${existingSteps.join(", ")}` : ""}

Generate ${count} daily step suggestions for this main task. Each step should be completable in one day by a crew member.

Respond with a JSON array of objects. Each object must have:
- "title": short step title (3-8 words, action-oriented, e.g. "Install ice and water shield")
- "description": one sentence of specific instructions for the crew member

Example format:
[
  {"title": "Install Ice and Water Shield", "description": "Apply self-adhering ice and water shield membrane along all eaves and valleys."},
  {"title": "Lay Felt Underlayment", "description": "Roll out and staple 30-lb felt underlayment across the full roof deck."}
]`;

      const completion = await openai.chat.completions.create({
        model: "gpt-5-mini",
        max_completion_tokens: 2048,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      });

      const raw = completion.choices[0]?.message?.content ?? "[]";

      let suggestions: { title: string; description: string }[];
      try {
        const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        suggestions = JSON.parse(cleaned);
        if (!Array.isArray(suggestions)) suggestions = [];
      } catch {
        console.error("[ai] Failed to parse daily task suggestions:", raw);
        suggestions = [];
      }

      res.json({
        mainTaskId,
        mainTaskName: mt.name,
        suggestions: suggestions.slice(0, count),
      });
    } catch (err) {
      next(err);
    }
  },
);

// ── SOW Upload ──────────────────────────────────────────────────────────

const sowUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["application/pdf", "text/plain"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF and text files are allowed"));
    }
  },
});

// POST /api/v1/ai/parse-sow
// Upload a PDF or .txt file and extract its text content.
router.post(
  "/parse-sow",
  requireAdmin,
  sowUpload.single("file"),
  async (req, res, next) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: "No file provided" });
        return;
      }

      let text: string;
      if (req.file.mimetype === "application/pdf") {
        const parser = new PDFParse({ data: req.file.buffer });
        const result = await parser.getText();
        text = result.text;
        await parser.destroy();
      } else {
        text = req.file.buffer.toString("utf-8");
      }

      res.json({ text });
    } catch (err) {
      next(err);
    }
  },
);

// ── Build from SOW ─────────────────────────────────────────────────────────

const buildFromSowSchema = z.object({
  projectId: z.string().uuid(),
  sowText: z.string().min(10, "SOW text must be at least 10 characters"),
});

/**
 * POST /api/v1/ai/build-from-sow
 * AI analyzes SOW text and returns a structured WorkType → MainTask → DailyTask hierarchy.
 */
router.post(
  "/build-from-sow",
  requireAdmin,
  validate.body(buildFromSowSchema),
  async (req, res, next) => {
    try {
      const { projectId, sowText } = req.body as {
        projectId: string;
        sowText: string;
      };

      const proj = await db.query.project.findFirst({
        where: eq(project.id, projectId),
      });

      const systemPrompt = `You are an expert construction project manager and scope-of-work analyst.
Your job is to parse a Scope of Work (SOW) document and extract a structured hierarchy of work types, main tasks, and daily tasks for a construction project.

Respond with valid JSON only — no markdown fences, no explanation text, no trailing punctuation outside the JSON structure.`;

      const userPrompt = `Project: "${proj?.name ?? "Unnamed project"}"
${proj?.description ? `Description: ${proj.description}` : ""}

Below is the Scope of Work text. Analyze it and extract the work it describes into a structured project plan.

SCOPE OF WORK:
${sowText}

For each distinct work type (e.g. "Demolition", "Roofing", "Electrical", "Siding", "Gutters", "Interior Finishes", etc.), identify:
1. Work type name and brief description
2. For each work type, the main tasks (major phases or activities)
3. For each main task, the daily steps (single-day actionable steps for a crew member)

Respond with a JSON object in this exact format:
{
  "workTypes": [
    {
      "name": "Work Type Name",
      "description": "Brief description of this work type based on the SOW",
      "mainTasks": [
        {
          "name": "Main Task Name",
          "description": "One sentence describing the task",
          "estimatedDays": 3,
          "dailyTasks": [
            { "title": "Step 1 title", "description": "Specific instructions" },
            { "title": "Step 2 title", "description": "Specific instructions" }
          ]
        }
      ]
    }
  ]
}

Guidelines:
- Each daily task should be completable in a single day by one crew member
- estimatedDays is the total estimated days for the main task (integer, 1-30)
- Generate 2-5 daily tasks per main task
- Only include work types, tasks, and steps that are explicitly or implicitly described in the SOW
- Use clear, specific names — not generic labels`;

      const completion = await openai.chat.completions.create({
        model: "gpt-5-mini",
        max_completion_tokens: 4096,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      });

      const raw = completion.choices[0]?.message?.content ?? "{}";

      interface SowDailyTask {
        title: string;
        description: string;
      }

      interface SowMainTask {
        name: string;
        description: string;
        estimatedDays: number;
        dailyTasks: SowDailyTask[];
      }

      interface SowWorkType {
        name: string;
        description: string;
        mainTasks: SowMainTask[];
      }

      interface SowPlan {
        workTypes: SowWorkType[];
      }

      let plan: SowPlan;
      try {
        const cleaned = raw
          .replace(/```json\n?/g, "")
          .replace(/```\n?/g, "")
          .trim();
        plan = JSON.parse(cleaned);
        if (!plan.workTypes || !Array.isArray(plan.workTypes)) {
          plan = { workTypes: [] };
        }
      } catch {
        console.error("[ai] Failed to parse SOW build result:", raw);
        res.status(422).json({
          error: "AI returned invalid JSON",
          raw,
        });
        return;
      }

      res.json(plan);
    } catch (err) {
      next(err);
    }
  },
);

export default router;
