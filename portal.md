# Revive Portal — Developer Reference

Last updated: 2026-05-06. Keep this file current whenever architecture, routing, auth, AI features, or deployment details change.

---

## What is the Portal?

The Revive Portal is a role-based project-management web app for Revive Repair Co. It is used by three types of users:

| Role | Who | What they see |
|---|---|---|
| ADMIN | Project managers / owners | Full dashboard, all projects, clients, users, work builder, AI tools, reports |
| CREW | Field workers | Today's tasks, clock-in, task completion with photos, main-task checklists |
| CLIENT | Property owners | Their projects, daily progress, sign-off on completed work |

---

## Repository Location

This is a **pnpm monorepo**. The portal is split across two packages:

| Package | Path | Purpose |
|---|---|---|
| `@workspace/portal` | `artifacts/portal/` | Next.js 16 frontend (App Router) |
| `@workspace/portal-api` | `artifacts/portal-api/` | Express 5 REST API |

Both live in the same Replit project as the marketing website (`artifacts/web`).

---

## Architecture Overview

```
Browser
  │
  ├─ reviverepairco.com/portal/*     → Replit path router → portal (port 3001, Next.js)
  ├─ reviverepairco.com/portal-api/* → Replit path router → portal-api (port 3002, Express)
  └─ reviverepairco.com/*            → Replit path router → web marketing site (port 22333)

portal.reviverepairco.com
  └─ Redirects (308) via web middleware → reviverepairco.com/portal/
     (temporary — until portal gets its own dedicated deployment)
```

### Key architectural decisions

- **One deployment, path-based routing** — portal, portal-api, and the marketing site all run in the same Replit deployment. The Replit platform routes requests by path prefix. When the portal eventually gets its own deployment, the 308 redirect in `artifacts/web/middleware.ts` can be removed.
- **Separate portal-api** — the portal has its own Express API (`portal-api`) rather than sharing the main `api-server`. This was an explicit user decision. Do **not** fold portal-api into api-server.
- **Auth via Clerk** — Replit-managed Clerk (no dashboard login needed). Dev and production are separate Clerk tenants with separate user stores.
- **AI via Replit AI Integrations** — OpenAI is accessed through `AI_INTEGRATIONS_OPENAI_BASE_URL` + `AI_INTEGRATIONS_OPENAI_API_KEY` (auto-injected by the Replit AI Integrations proxy). Use `gpt-5-mini` for all AI calls. Never hard-code an OpenAI key.

---

## Dev Environment

### Starting everything

All services run via Replit Workflows. They start automatically. If you need to restart one manually:

```bash
# Portal frontend (Next.js, port 3001)
pnpm --filter @workspace/portal run dev

# Portal API (Express, port 3002)
pnpm --filter @workspace/portal-api run dev
```

### Access in dev

- Portal UI: `https://<replit-dev-domain>/portal/sign-in`
- Portal API: `https://<replit-dev-domain>/portal-api/api/v1/healthz`
- Dev domain: `f86932ce-a08c-4a4d-849d-e2f7953e6b12-00-14y64z67bvk1x.riker.replit.dev`

### Environment variables (dev)

| Variable | Used by | Purpose |
|---|---|---|
| `CLERK_PUBLISHABLE_KEY` | portal | Baked into Next.js build as `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` |
| `CLERK_SECRET_KEY` | portal, portal-api | Server-side Clerk verification |
| `PORTAL_API_INTERNAL_URL` | portal (server-side) | Override for internal API calls (default: `http://localhost:3002/api/v1`) |
| `DATABASE_URL` | portal-api | Postgres connection string |
| `DEFAULT_OBJECT_STORAGE_BUCKET_ID` | portal-api | Replit Object Storage for photos/documents |
| `AI_INTEGRATIONS_OPENAI_BASE_URL` | portal-api | Replit AI Integrations proxy base URL (auto-injected) |
| `AI_INTEGRATIONS_OPENAI_API_KEY` | portal-api | Replit AI Integrations API key (auto-injected) |

In dev, Replit injects test Clerk keys (`pk_test_*`, `sk_test_*`). In production, live keys are injected automatically before the build — no manual swap needed.

---

## Production Deployment

### How it's deployed

The entire monorepo deploys as a single Replit deployment. Clicking **Republish** in the Replit UI triggers:

1. `pnpm --filter @workspace/portal run build` (Next.js build, `NODE_ENV=production`, `basePath=/portal`)
2. `pnpm --filter @workspace/portal-api run start` (Express, compiled TypeScript via tsx)
3. `pnpm --filter @workspace/web run build` + `start`
4. `pnpm --filter @workspace/api-server run start`

All four services must bind their ports for the deployment to be considered healthy.

### Production URLs

| URL | Destination |
|---|---|
| `https://reviverepairco.com/portal/sign-in` | Portal sign-in (direct) |
| `https://portal.reviverepairco.com` | Redirects to above (308) |
| `https://reviverepairco.com/portal-api/api/v1/healthz` | API health check |

### basePath

The portal is served at `/portal` in both dev and production. `next.config.ts` reads `PORTAL_BASE_PATH` env var, defaulting to `/portal`. Do **not** set `PORTAL_BASE_PATH=""` in production — it will break static asset routing.

---

## Authentication

### How Clerk roles work

Roles are stored in Clerk's `publicMetadata.role` field (`ADMIN` | `CREW` | `CLIENT`). New users default to `CREW`.

The portal middleware (`artifacts/portal/middleware.ts`) reads the role from session claims. Because Clerk's default JWT does not include `publicMetadata`, the middleware falls back to a `clerkClient().users.getUser()` call if the claim is absent. This adds one extra API call per protected request for users without a custom session token template — acceptable for now.

The portal-api auth middleware (`artifacts/portal-api/src/middleware/auth.ts`) reads `req.user.role` after auto-provisioning a `user_profile` row on first login.

### Promoting a user to ADMIN

Use the Clerk Backend API (the `CLERK_SECRET_KEY` is available in the Replit Secrets pane):

```bash
curl -X PATCH https://api.clerk.com/v1/users/<CLERK_USER_ID>/metadata \
  -H "Authorization: Bearer $CLERK_SECRET_KEY" \
  -H "Content-Type: application/json" \
  -d '{"public_metadata": {"role": "ADMIN"}}'
```

Known ADMIN user: `user_3DCDK3RMq1tlKOTsH7a3RTkvmMe` (Mike Mitchell — dev + prod).

### Role-based routing (middleware)

```
/ (root)
  → ADMIN  → /admin/dashboard
  → CREW   → /crew/today
  → CLIENT → /client/projects

/admin/*   → ADMIN only
/crew/*    → ADMIN or CREW
/client/*  → ADMIN or CLIENT
```

Public routes (no auth required): `/sign-in`, `/sign-up`, `/accept-invite`, `/api/webhooks/clerk`

### Clerk webhook

`artifacts/portal/app/api/webhooks/clerk/route.ts` handles `user.created` events to sync Clerk users into the `user_profile` table. Uses `CLERK_WEBHOOK_SECRET` env var.

---

## Frontend — `artifacts/portal`

### Stack

- **Next.js 16** (App Router, `--webpack` in dev because Turbopack had HMR issues with Clerk)
- **Clerk** for auth UI (`<SignIn>`, `<SignUp>`, `clerkMiddleware`)
- **Tailwind CSS** for styling
- TypeScript throughout

### Directory structure

```
artifacts/portal/
├── app/
│   ├── admin/                        # ADMIN-only pages
│   │   ├── dashboard/                # Summary stats + project pipeline
│   │   ├── clients/[id]/             # Client detail — clickable project cards
│   │   ├── projects/
│   │   │   ├── page.tsx              # Project list
│   │   │   ├── new/                  # New project form
│   │   │   └── [id]/
│   │   │       ├── page.tsx          # Project detail (tabs)
│   │   │       ├── ProjectTabs.tsx   # Tab switcher
│   │   │       ├── WorkBuilder.tsx   # Work type / main task CRUD + AI suggest buttons
│   │   │       ├── ApprovalsPanel.tsx
│   │   │       ├── AISuggestMainTasks.tsx   # AI suggestion panel for main tasks (per work type)
│   │   │       ├── AISuggestDailyTasks.tsx  # AI suggestion panel for daily steps (per main task)
│   │   │       ├── main-tasks/[mainTaskId]/ # Admin drill-in: daily-step checklist + CRUD
│   │   │       ├── schedule/         # Gantt-style schedule view
│   │   │       ├── daily-logs/       # Daily log entries
│   │   │       ├── documents/        # File uploads
│   │   │       ├── punch-items/      # Punch list
│   │   │       ├── change-orders/    # Change orders
│   │   │       ├── selections/       # Client selections
│   │   │       ├── checklists/       # QA checklists
│   │   │       └── time/             # Time entries / timesheets
│   │   ├── users/                    # User management + invite
│   │   └── checklists/               # Checklist template management
│   ├── crew/                         # CREW-only pages
│   │   ├── today/                    # Today's assigned daily tasks
│   │   ├── task/[id]/                # Task detail + photo upload + mark done
│   │   ├── main-task/[id]/           # Full checklist for a main task (all daily steps)
│   │   ├── upcoming/                 # Upcoming task schedule
│   │   ├── clock-in/                 # Time tracking
│   │   └── done/                     # Completed tasks history
│   ├── client/                       # CLIENT-only pages
│   │   ├── projects/                 # Client's project list
│   │   └── projects/[id]/            # Project progress view
│   ├── sign-in/[[...sign-in]]/
│   ├── sign-up/[[...sign-up]]/
│   ├── accept-invite/                # Invite acceptance flow
│   └── api/webhooks/clerk/           # Clerk webhook handler
├── components/
│   ├── admin/                        # Admin-specific components
│   └── ui/                           # Shared primitives (see UI conventions below)
├── lib/
│   ├── api-client.ts     # Low-level typed fetch wrapper (server + browser)
│   ├── api-server.ts     # Server-component helper — pulls Clerk token, calls api-client
│   ├── api-browser.ts    # Client-component helper — useApi() hook with token refresh
│   └── auth.ts           # Role helpers: getSessionRole(), requireAdmin(), getUserId()
├── middleware.ts          # Clerk middleware — auth guards + role-based redirects
└── next.config.ts        # basePath, assetPrefix, Clerk env vars
```

### Making API calls from a server component

```tsx
import { api } from "@/lib/api-server";

// Returns null on 401/403/404, throws on other errors
const projects = await api<Project[]>("/projects");
```

### Making API calls from a client component

```tsx
import { useApi } from "@/lib/api-browser";

export default function MyComponent() {
  const { api } = useApi();

  async function handleSave() {
    await api("/projects", { method: "POST", body: { name: "New Project" } });
  }
}
```

### UI component conventions

All primitive components live in `artifacts/portal/components/ui/`. Use these rather than raw HTML:

- `Button` — props: `variant` (primary | secondary | ghost | danger | outline), `size`, `loading`
- `Input` — plain input wrapper with consistent focus styles
- `Card`, `CardHeader`, `CardContent` — standard shadow and padding
- `Modal` — controlled dialog
- `Badge` / `StatusBadge` — status chip with color variants
- `Tabs` — controlled tab switcher (see `ProjectTabs.tsx` for usage)
- `EmptyState`, `Loading` — standard empty/loading states

---

## API — `artifacts/portal-api`

### Stack

- **Express 5** with TypeScript (run with `tsx` in dev, compiled with esbuild for production)
- **Drizzle ORM** with PostgreSQL (Replit-managed production DB)
- **Clerk Express SDK** (`@clerk/express`) for JWT verification
- **Replit Object Storage** for photos and documents
- **OpenAI SDK** (`openai` npm package) for AI features — uses Replit AI Integrations proxy

### API base

All routes are under `/api/v1/`. The Replit path router exposes them externally at `/portal-api/api/v1/`.

### Auth layers

```
GET  /api/v1/healthz          → no auth
ALL  /api/v1/internal/*       → bearer secret (INTERNAL_CRON_SECRET)
ALL  /api/v1/*                → clerkAuth middleware (Clerk JWT + auto-provision user_profile)
```

After `clerkAuth`, `req.user` is always populated with `{ userId, clerkUserId, role, displayName, email, clientId }`.

Role guards (in `artifacts/portal-api/src/middleware/auth.ts`):
- `requireAdmin` — ADMIN only
- `requireCrew` — CREW only
- `requireStaff` — ADMIN or CREW
- `requireClient` — CLIENT only

### Route inventory

| Route prefix | Resource | Notes |
|---|---|---|
| `/api/v1/me` | Current user profile | |
| `/api/v1/clients` | Client CRUD | |
| `/api/v1/users` | User list + role management | includes `GET /users/directory` for crew lookup |
| `/api/v1/projects` | Project CRUD | |
| `/api/v1/work-types` | Work types per project | |
| `/api/v1/main-tasks` | Main tasks per work type | includes PM approval + client sign-off |
| `/api/v1/daily-tasks` | Daily steps per main task | includes `POST /:id/complete` + `POST /:id/uncomplete` |
| `/api/v1/photos` | Task photo upload + PM review | |
| `/api/v1/comments` | Comments on any entity | |
| `/api/v1/documents` | Project document upload | |
| `/api/v1/punch-items` | Punch list items | |
| `/api/v1/change-orders` | Change orders | |
| `/api/v1/daily-logs` | Daily field logs | |
| `/api/v1/selections` | Client selections | |
| `/api/v1/time-entries` | Clock-in / time tracking | |
| `/api/v1/checklists` | Checklist templates + instances | |
| `/api/v1/activity` | Activity log | |
| `/api/v1/ai` | AI suggestion endpoints | see AI section below |
| `/api/v1/internal/daily-summary` | Cron-triggered daily digest | |

### Adding a new API route

1. Create `artifacts/portal-api/src/routes/my-resource.ts`
2. Export an Express Router with CRUD handlers
3. Apply role guards (`requireAdmin`, `requireStaff`, etc.) per endpoint
4. Use `validate.body(zodSchema)` middleware for input validation
5. Import and mount in `artifacts/portal-api/src/index.ts` at `/api/v1/my-resource`
6. No code-generation step required — call it directly via `api()` or `useApi()` in the frontend

---

## Database

### ORM & migrations

Drizzle ORM. Schema lives at `artifacts/portal-api/lib/db/schema/portal.ts`. Migrations are in `artifacts/portal-api/drizzle/`.

```bash
# Generate a migration after a schema change
pnpm --filter @workspace/portal-api run db:generate

# Apply migrations to the dev database
pnpm --filter @workspace/portal-api run db:migrate
```

Production DB migrations must be run manually against the production database. Coordinate with the user before applying destructive migrations.

### Key tables

| Table | Purpose |
|---|---|
| `client` | Company/property-owner records |
| `user_profile` | Portal user (linked to Clerk by `clerk_user_id`) |
| `project` | A job/contract for a client |
| `work_type` | Phase of work within a project (e.g. "Roofing", "Demo") |
| `main_task` | Major task within a work type — has full approval lifecycle |
| `daily_task` | A daily step within a main task, assigned to crew |
| `task_photo` | Photos uploaded by crew against a daily task |
| `completion_document` | Compiled sign-off doc for a completed main task |
| `project_document` | Contracts, permits, receipts attached to a project |
| `punch_item` | Punch-list deficiency item |
| `change_order` | Scope/cost change with client approval |
| `daily_log` | Field notes, weather, delays per day per project |
| `selection` | Client material/finish choices |
| `time_entry` | Clock-in/out records per crew member |
| `checklist_template` | Reusable QA checklist definitions |
| `checklist_instance` | A checklist attached to a work type or main task |
| `activity_log` | Append-only audit trail |

### Status enums

```
project_status:            PLANNED | ACTIVE | ON_HOLD | COMPLETE | CANCELLED
work_type_status:          NOT_STARTED | IN_PROGRESS | COMPLETE
main_task_status:          NOT_STARTED | IN_PROGRESS | PM_REVIEW | CLIENT_SIGNOFF | COMPLETE
daily_task_status:         NOT_STARTED | DONE
photo_pm_status:           PENDING | APPROVED | REJECTED
punch_item_status:         OPEN | IN_PROGRESS | RESOLVED | VERIFIED
change_order_status:       DRAFT | SENT | APPROVED | REJECTED
selection_status:          PENDING | APPROVED | REJECTED
checklist_instance_status: IN_PROGRESS | COMPLETE
```

---

## Object Storage

Photos and documents are stored in Replit Object Storage. The bucket ID is in `DEFAULT_OBJECT_STORAGE_BUCKET_ID` secret. Storage helpers are in `artifacts/portal-api/src/lib/storage.ts`. Files are stored by key; the API returns proxied URL paths (e.g. `/api/v1/photos/:id/file`).

---

## AI Features

### What's already built

The AI layer lives in `artifacts/portal-api/src/routes/ai.ts`, mounted at `/api/v1/ai`. All endpoints require `requireAdmin`. The OpenAI client is initialised from `AI_INTEGRATIONS_OPENAI_BASE_URL` + `AI_INTEGRATIONS_OPENAI_API_KEY` (Replit AI Integrations proxy — no external key needed).

| Endpoint | Purpose |
|---|---|
| `POST /api/v1/ai/suggest-main-tasks` | Given a `workTypeId`, fetches work type + project context and asks GPT to return 6 main task name/description/estimatedDays suggestions as JSON |
| `POST /api/v1/ai/suggest-daily-tasks` | Given a `mainTaskId`, fetches main task context + existing daily steps (to avoid duplicates) and returns 8 daily step suggestions |

Both are surfaced in the frontend as purple-themed expandable panels:
- `AISuggestMainTasks.tsx` — rendered inside `WorkBuilder.tsx` below each work type's main-task list, next to the "+ Add main task" button.
- `AISuggestDailyTasks.tsx` — rendered inside the admin `main-tasks/[mainTaskId]/page.tsx` below the Daily Steps card header.

Both components share the same UX pattern: click "AI Suggest", spinner while loading, selectable + inline-editable checklist, select-all/deselect-all, expand rows to edit descriptions, "Add Selected" bulk-creates items, "Regenerate" re-calls the API.

### AI conventions for this project

- Always use `gpt-5-mini` (not `gpt-4o`, not `gpt-3.5-turbo`).
- Prompt for **JSON only** in the system message. Always strip markdown code fences before `JSON.parse`.
- All AI endpoints are admin-only (`requireAdmin`).
- Context passed to the AI should include: project name, work type name, main task name, and existing items (to avoid duplication).
- Keep prompts construction-industry specific — Revive Repair Co. works in roofing, siding, gutters, and general contracting in Central Pennsylvania.

---

## Upcoming Tasks for AI Agents

The following tasks are active (accepted but not yet started). An AI agent picking up either of these should read this entire portal.md first, then the relevant task description below.

---

### Task #22 — Project & Task Checklist Drill-In (Active)

**Goal:** Improve navigation and task-management UX for both admins and crew so they can drill from client → project → work type → main task → daily checklist, and crew can check off any step (not just today's).

**What to build:**

1. **Clickable project cards on the client detail page.**
   - File: `artifacts/portal/app/admin/clients/[id]/page.tsx`
   - Make the entire project row a clickable card with hover state. Keep the status badge visible.

2. **Admin main-task drill-in page** at `/admin/projects/[id]/main-tasks/[mainTaskId]`.
   - File: `artifacts/portal/app/admin/projects/[id]/main-tasks/[mainTaskId]/page.tsx`
   - Shows: main task header (name, dates, status, work-type breadcrumb), daily-step checklist with create / edit / assign / delete. Reuse the existing daily-task form fields from `WorkBuilder.tsx`. Add a "back to project Work tab" link.
   - Progress counter (e.g. "3 of 7 steps done") and assignee column per step.

3. **Slim the Work tab** in `WorkBuilder.tsx`.
   - Each main task becomes a single clickable row linking to the drill-in page.
   - Show a progress label like "3 / 7 done" on each row.
   - Keep work-type create/edit/delete and main-task create/edit/delete.
   - Drop the inline daily-step list and inline daily-task create form (those move to the drill-in page).

4. **Crew checklist view** at `/crew/main-task/[id]`.
   - File: `artifacts/portal/app/crew/main-task/[id]/page.tsx`
   - Shows every daily step in the main task with: checkbox (mark done/undo), assignee, scheduled date, "photo" button opening camera input.
   - Checkbox calls `POST /daily-tasks/:id/complete` or `POST /daily-tasks/:id/uncomplete`.
   - Link to this page from `/crew/today` and `/crew/task/[id]` ("View full checklist").

5. **Verify the completion flow** end-to-end (no backend changes needed).

**Key existing endpoints:**
- `GET /main-tasks/:id` — returns main task + daily tasks
- `POST /daily-tasks` — create a step
- `PATCH /daily-tasks/:id` — edit a step
- `POST /daily-tasks/:id/complete` — mark done
- `POST /daily-tasks/:id/uncomplete` — unmark done *(added in prior session)*
- `GET /users/directory` — returns crew list for assignee dropdowns *(added in prior session)*

**Relevant files:**
- `artifacts/portal/app/admin/clients/[id]/page.tsx`
- `artifacts/portal/app/admin/projects/[id]/WorkBuilder.tsx`
- `artifacts/portal/app/admin/projects/[id]/main-tasks/[mainTaskId]/page.tsx`
- `artifacts/portal/app/crew/today/page.tsx`
- `artifacts/portal/app/crew/task/[id]/page.tsx`
- `artifacts/portal/app/crew/main-task/[id]/page.tsx`
- `artifacts/portal-api/src/routes/main-tasks.ts`
- `artifacts/portal-api/src/routes/daily-tasks.ts`

**Out of scope:** Drag-and-drop reordering of steps, bulk assign/complete, new DB fields, any rework of the portal-api architecture.

---

### Task #23 — AI Scope-of-Work Project Builder (Proposed — not yet accepted)

**Goal:** Admin uploads a Scope of Work document (PDF or plain text) at project start. The AI reads it and auto-proposes the full work structure (work types → main tasks → daily steps) for review and one-click save.

**What to build:**

1. **PDF text extraction endpoint:** `POST /api/v1/ai/parse-sow`
   - Accepts multipart file upload (PDF or `.txt`).
   - Use the `pdf-parse` npm package to extract text from PDFs.
   - Returns `{ text: string }` so the client can confirm what was parsed.
   - Add to `artifacts/portal-api/src/routes/ai.ts`.

2. **AI SOW analysis endpoint:** `POST /api/v1/ai/build-from-sow`
   - Accepts `{ projectId: string, sowText: string }`.
   - Fetches project context (name, client) from the DB.
   - Sends SOW text + project context to GPT with a structured prompt.
   - Returns a JSON proposal: `WorkType[]` each containing `MainTask[]` each containing `DailyTask[]`.
   - Each item has: `name`, `description`, `estimatedDays` (main tasks only).

3. **SOW import panel:** `SOWImportPanel.tsx` in `artifacts/portal/app/admin/projects/[id]/`.
   - File-drop zone accepting PDF or `.txt`, plus a "paste text" tab as an alternative.
   - On submit: calls `parse-sow` (if file), then `build-from-sow`. Shows a spinner ("AI is reading your scope…").

4. **Proposal review tree.**
   - After AI responds, renders an expandable tree: work type sections (collapsible) → main task rows → daily step rows.
   - Every level has: checkbox (selected by default), inline-editable name, expandable description field.
   - "Select all / Deselect all" per work type section.
   - All items are pre-selected; admin deselects what to skip.

5. **Bulk creation on "Build Project".**
   - Sequentially: `POST /work-types` → `POST /main-tasks` (using returned workTypeId) → `POST /daily-tasks` (using returned mainTaskId).
   - Show a progress bar / step counter ("Creating work types… Creating main tasks… Done!").
   - On completion, call `router.refresh()` to reload the Work tab with all new items.
   - If the project already has work types, merge (add) — do not wipe existing items.

6. **Wire into WorkBuilder.**
   - Add "Import SOW" button at the top of `WorkBuilder.tsx`, rendered before the work type list.
   - Clicking opens `SOWImportPanel` inline. The existing manual "+ Add work type" flow remains.

**AI prompt guidance for the build-from-sow endpoint:**
```
System: You are an expert construction project manager for a residential contractor in Central Pennsylvania.
Given a Scope of Work document, extract all scopes of work and break each into a structured task plan.
Respond with valid JSON only — no markdown or explanations.

Output format:
[
  {
    "name": "Work Type Name",
    "description": "One sentence describing this scope",
    "mainTasks": [
      {
        "name": "Main Task Name",
        "description": "What this phase involves",
        "estimatedDays": 2,
        "dailySteps": [
          { "title": "Step title", "description": "Crew instruction" }
        ]
      }
    ]
  }
]
```

**Key existing endpoints to call from the frontend during bulk creation:**
- `POST /api/v1/work-types` — body: `{ projectId, name, description }`
- `POST /api/v1/main-tasks` — body: `{ workTypeId, name, description, estimatedDurationDays }`
- `POST /api/v1/daily-tasks` — body: `{ mainTaskId, title, description }`

**Relevant files to start from:**
- `artifacts/portal-api/src/routes/ai.ts` — add the two new endpoints here
- `artifacts/portal-api/src/index.ts` — AI router already mounted; no changes needed
- `artifacts/portal/app/admin/projects/[id]/WorkBuilder.tsx` — wire in the button + panel
- `artifacts/portal/app/admin/projects/[id]/AISuggestMainTasks.tsx` — reference for AI panel UX pattern
- `artifacts/portal-api/src/routes/work-types.ts`
- `artifacts/portal-api/src/routes/main-tasks.ts`
- `artifacts/portal-api/src/routes/daily-tasks.ts`

**Out of scope:** Date/assignee editing during import, Word (.docx) support, re-importing / diffing against existing structure, any DB schema changes.

---

## Adding a New Feature — Step by Step

### 1. Add a backend route (if needed)

```typescript
// artifacts/portal-api/src/routes/my-resource.ts
import { Router } from "express";
import { requireAdmin } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { db } from "../../lib/db/index.js";
import { z } from "zod";

const router = Router();
const createSchema = z.object({ name: z.string().min(1) });

router.get("/", requireAdmin, async (req, res) => {
  const rows = await db.query.myTable.findMany();
  res.json(rows);
});

router.post("/", requireAdmin, validate.body(createSchema), async (req, res) => {
  // ...
});

export default router;
```

Mount it in `src/index.ts`:
```typescript
import myResourceRouter from "./routes/my-resource.js";
app.use("/api/v1/my-resource", myResourceRouter);
```

After changing portal-api source, **restart the `artifacts/portal-api: portal-api` workflow**.

### 2. Add the frontend page

Pages go under `artifacts/portal/app/<role>/my-feature/page.tsx`. Use `api()` for server components or `useApi()` for client components. The `"use client"` directive is required for any component using hooks or event handlers.

### 3. Wire navigation

- Admin nav: `artifacts/portal/app/admin/layout.tsx`
- Crew nav: `artifacts/portal/app/crew/layout.tsx`

### 4. Test in dev

- Portal UI reloads via Next.js HMR after frontend changes (no restart needed).
- After changing portal-api, restart the `portal-api` workflow and verify `healthz` returns 200.
- Sign in as the ADMIN user to test admin features; use a separate CREW account to test crew features.

### 5. Republish for production

After testing in dev, click **Republish** in Replit. Always test in an incognito window after republishing.

---

## DNS & Domain Configuration

| Domain | Deployment | Notes |
|---|---|---|
| `reviverepairco.com` | Revive (combined deployment) | Marketing + portal |
| `www.reviverepairco.com` | Same | |
| `portal.reviverepairco.com` | Same — 308 redirect → `/portal/` | Temporary; remove when portal gets own deployment |
| `reviveroofrepair.com` | Same | Roofing brand |

DNS is managed in Cloudflare (reviverepairco.com) and GoDaddy (reviveroofrepair.com). All Replit records must be **DNS only** (gray cloud, not proxied).

The redirect from `portal.reviverepairco.com` lives in `artifacts/web/middleware.ts`.

### Clerk CNAME records (production Clerk tenant: `o6xirl9wucme`)

| Hostname | Target |
|---|---|
| `clkmail.portal.reviverepairco.com` | `mail.o6xirl9wucme.clerk.services` |
| `clk._domainkey.portal.reviverepairco.com` | `dkim1.o6xirl9wucme.clerk.services` |
| `clk2._domainkey.portal.reviverepairco.com` | `dkim2.o6xirl9wucme.clerk.services` |

---

## Common Issues & Fixes

| Symptom | Cause | Fix |
|---|---|---|
| Clerk sign-in widget blank (white box) | Portal built with wrong basePath — static assets routed to wrong service | Ensure `PORTAL_BASE_PATH` is NOT set to `""` in production artifact config. Republish. |
| `portal.reviverepairco.com` loads marketing site | Domain bound to web deployment instead of triggering redirect | Check web deployment domains in Replit UI; ensure the 308 redirect middleware is present and deployed |
| "This app isn't live yet" on portal subdomain | Domain not bound to any deployment | Add `portal.reviverepairco.com` to the web deployment's domain list |
| 401 on API calls | Clerk session token not forwarded | Use `api()` (server) or `useApi()` (client) — never call the API without a token |
| Role shows CREW for an ADMIN user | `publicMetadata.role` not set in Clerk | Promote via Clerk Backend API PATCH (see Auth section above) |
| "Invalid URL" on server-side API calls | `PORTAL_API_INTERNAL_URL` not set | Defaults to `http://localhost:3002/api/v1`; set the env var to override |
| Production users can't sign in | Dev and prod are separate Clerk tenants | Sign up fresh on the production URL; re-promote to ADMIN |
| AI endpoints return 500 | OpenAI proxy env vars not set | Confirm `AI_INTEGRATIONS_OPENAI_BASE_URL` and `AI_INTEGRATIONS_OPENAI_API_KEY` are present; the Replit AI Integrations panel sets these automatically |
| AI returns non-JSON text | Model wrapped response in markdown fences | The `ai.ts` route strips ` ```json ` fences before parsing — check that strip logic is present |
