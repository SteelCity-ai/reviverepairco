# Revive Portal — Developer Reference

Last updated: 2026-05-05. Keep this file current whenever architecture, routing, auth, or deployment details change.

---

## What is the Portal?

The Revive Portal is a role-based project-management web app for Revive Repair Co. It is used by three types of users:

| Role | Who | What they see |
|---|---|---|
| ADMIN | Project managers / owners | Full dashboard, all projects, clients, users, work builder, reports |
| CREW | Field workers | Today's tasks, clock-in, task completion with photos |
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
  ├─ reviverepairco.com/portal/*   → Replit path router → portal (port 3001, Next.js)
  ├─ reviverepairco.com/portal-api/* → Replit path router → portal-api (port 3002, Express)
  └─ reviverepairco.com/*          → Replit path router → web marketing site (port 22333)

portal.reviverepairco.com
  └─ Redirects (308) via web middleware → reviverepairco.com/portal/
     (temporary — until portal gets its own dedicated deployment)
```

### Key architectural decisions

- **One deployment, path-based routing** — portal, portal-api, and the marketing site all run in the same Replit deployment. The Replit platform routes requests by path prefix. When the portal eventually gets its own deployment, the 308 redirect in `artifacts/web/middleware.ts` can be removed and `portal.reviverepairco.com` linked directly.
- **Separate portal-api** — the portal has its own Express API (`portal-api`) rather than sharing the main `api-server`. This was an explicit user decision. Do not fold portal-api into api-server.
- **Auth via Clerk** — Replit-managed Clerk (no dashboard login needed). Dev and production are separate Clerk tenants with separate user stores.

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

### After republishing

- Test `https://reviverepairco.com/portal/sign-in` in an incognito window
- Sign up a production account (separate from dev — Clerk stores are isolated)
- Promote the production account to ADMIN via Clerk API (see Auth section below)

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

Find the Clerk user ID in Replit's Auth pane → Users, or from the deployment logs after the user signs in.

### Role-based routing (middleware)

```
/ (root)
  → ADMIN → /admin/dashboard
  → CREW  → /crew/today
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
│   ├── admin/             # ADMIN-only pages
│   │   ├── dashboard/     # Summary stats
│   │   ├── clients/       # Client CRUD
│   │   ├── projects/      # Project list + detail
│   │   │   └── [id]/
│   │   │       ├── page.tsx        # Project detail (tabs)
│   │   │       ├── ProjectTabs.tsx # Tab switcher
│   │   │       ├── WorkBuilder.tsx # Inline CRUD for work types / main tasks / daily steps
│   │   │       ├── schedule/       # Gantt-style schedule view
│   │   │       ├── daily-logs/     # Daily log entries
│   │   │       ├── documents/      # File uploads
│   │   │       ├── punch-items/    # Punch list
│   │   │       ├── change-orders/  # Change orders
│   │   │       ├── selections/     # Client selections
│   │   │       ├── checklists/     # QA checklists
│   │   │       └── time/           # Time entries / timesheets
│   │   ├── users/         # User management + invite
│   │   └── checklists/    # Checklist template management
│   ├── crew/              # CREW-only pages
│   │   ├── today/         # Today's assigned daily tasks
│   │   ├── task/[id]/     # Task detail + photo upload + mark done
│   │   ├── upcoming/      # Upcoming task schedule
│   │   ├── clock-in/      # Time tracking
│   │   └── done/          # Completed tasks history
│   ├── client/            # CLIENT-only pages
│   │   ├── projects/      # Client's project list
│   │   └── projects/[id]/ # Project progress view
│   ├── sign-in/[[...sign-in]]/
│   ├── sign-up/[[...sign-up]]/
│   ├── accept-invite/     # Invite acceptance flow
│   └── api/webhooks/clerk/ # Clerk webhook handler
├── components/
│   ├── admin/             # Admin-specific components
│   └── ui/                # Shared primitives: Button, Input, Card, Modal, Badge, etc.
├── lib/
│   ├── api-client.ts      # Low-level typed fetch wrapper (used by server + browser helpers)
│   ├── api-server.ts      # Server-component helper — pulls Clerk token, calls api-client
│   ├── api-browser.ts     # Client-component helper — useApi() hook with token refresh
│   └── auth.ts            # Role helpers: getSessionRole(), requireAdmin(), getUserId()
├── middleware.ts           # Clerk middleware — auth guards + role-based redirects
└── next.config.ts         # basePath, assetPrefix, Clerk env vars
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
  const { call, loading } = useApi();

  async function handleSave() {
    await call("/projects", { method: "POST", body: { name: "New Project" } });
  }
}
```

### UI component conventions

All primitive components live in `artifacts/portal/components/ui/`. Use these rather than raw HTML:

- `Button` — props: `variant` (primary | secondary | ghost | danger | outline), `size`, `loading`
- `Input` — plain input wrapper with consistent focus styles
- `Card` — `<div>` with standard shadow and padding
- `Modal` — controlled dialog
- `Badge` — status chip with color variants
- `Tabs` — controlled tab switcher (see `ProjectTabs.tsx` for usage)
- `EmptyState`, `Loading` — standard empty/loading states

---

## API — `artifacts/portal-api`

### Stack

- **Express 5** with TypeScript (compiled via esbuild / run with tsx in dev)
- **Drizzle ORM** with PostgreSQL (Replit-managed production DB)
- **Clerk Express SDK** (`@clerk/express`) for JWT verification
- **Replit Object Storage** for photos and documents

### API base

All routes are under `/api/v1/`. The Replit path router exposes them externally at `/portal-api/api/v1/`.

### Auth layers

```
POST /api/v1/healthz          → no auth
POST /api/v1/internal/*       → bearer secret (INTERNAL_CRON_SECRET)
ALL  /api/v1/*                → clerkAuth middleware (Clerk JWT + auto-provision user_profile)
```

After `clerkAuth`, `req.user` is always populated with `{ userId, clerkUserId, role, displayName, email, clientId }`.

Role guards:
- `requireAdmin` — ADMIN only
- `requireCrew` — CREW only
- `requireStaff` — ADMIN or CREW
- `requireClient` — CLIENT only

### Route inventory

| Route prefix | Resource |
|---|---|
| `/api/v1/me` | Current user profile |
| `/api/v1/clients` | Client CRUD |
| `/api/v1/users` | User list + role management |
| `/api/v1/projects` | Project CRUD |
| `/api/v1/work-types` | Work types per project |
| `/api/v1/main-tasks` | Main tasks per work type |
| `/api/v1/daily-tasks` | Daily steps per main task |
| `/api/v1/photos` | Task photo upload + PM review |
| `/api/v1/comments` | Comments on any entity |
| `/api/v1/documents` | Project document upload |
| `/api/v1/punch-items` | Punch list items |
| `/api/v1/change-orders` | Change orders |
| `/api/v1/daily-logs` | Daily field logs |
| `/api/v1/selections` | Client selections |
| `/api/v1/time-entries` | Clock-in / time tracking |
| `/api/v1/checklists` | Checklist templates + instances |
| `/api/v1/activity` | Activity log |
| `/api/v1/internal/daily-summary` | Cron-triggered daily digest |

### Adding a new API route

1. Create `artifacts/portal-api/src/routes/my-resource.ts`
2. Export an Express Router with CRUD handlers
3. Apply role guards (`requireAdmin`, `requireStaff`, etc.) per endpoint
4. Import and mount in `artifacts/portal-api/src/index.ts` at `/api/v1/my-resource`
5. No code-generation step required — call it directly via `api()` or `useApi()` in the frontend

---

## Database

### ORM & migrations

Drizzle ORM. Schema lives at `artifacts/portal-api/lib/db/schema/portal.ts`. Migrations are in `artifacts/portal-api/drizzle/`.

To generate a new migration after a schema change:

```bash
pnpm --filter @workspace/portal-api run db:generate
```

To apply migrations to the dev database:

```bash
pnpm --filter @workspace/portal-api run db:migrate
```

Production DB migrations must be run manually against the production database. Use the Replit Database skill to query production read-only, or coordinate with the user before applying destructive migrations.

### Key tables

| Table | Purpose |
|---|---|
| `client` | Company/property-owner records |
| `user_profile` | Portal user (linked to Clerk by `clerk_user_id`) |
| `project` | A job/contract for a client |
| `work_type` | Phase of work within a project (e.g. "Roofing", "Demo") |
| `main_task` | Major task within a work type, has full approval lifecycle |
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
project_status:           PLANNED | ACTIVE | ON_HOLD | COMPLETE | CANCELLED
work_type_status:         NOT_STARTED | IN_PROGRESS | COMPLETE
main_task_status:         NOT_STARTED | IN_PROGRESS | PM_REVIEW | CLIENT_SIGNOFF | COMPLETE
daily_task_status:        NOT_STARTED | DONE
photo_pm_status:          PENDING | APPROVED | REJECTED
punch_item_status:        OPEN | IN_PROGRESS | RESOLVED | VERIFIED
change_order_status:      DRAFT | SENT | APPROVED | REJECTED
selection_status:         PENDING | APPROVED | REJECTED
checklist_instance_status: IN_PROGRESS | COMPLETE
```

---

## Object Storage

Photos and documents are stored in Replit Object Storage. The bucket ID is in `DEFAULT_OBJECT_STORAGE_BUCKET_ID` secret. Storage helpers are in `artifacts/portal-api/src/lib/storage.ts`. Files are stored by key; the API returns signed/proxied URLs.

---

## Adding a New Feature — Step by Step

### 1. Add a backend route (if needed)

```typescript
// artifacts/portal-api/src/routes/my-resource.ts
import { Router } from "express";
import { requireAdmin } from "../middleware/auth.js";
import { db } from "../../lib/db/index.js";

const router = Router();

router.get("/", requireAdmin, async (req, res) => {
  const rows = await db.query.myTable.findMany();
  res.json(rows);
});

export default router;
```

Mount it in `src/index.ts`:
```typescript
import myResourceRouter from "./routes/my-resource.js";
app.use("/api/v1/my-resource", myResourceRouter);
```

### 2. Add the frontend page

Pages go under `artifacts/portal/app/<role>/my-feature/page.tsx`. For admin features, place under `app/admin/`. For crew, under `app/crew/`. Use `api()` for server components or `useApi()` for client components.

### 3. Wire navigation

Admin nav is in `artifacts/portal/app/admin/layout.tsx`. Crew nav is in `artifacts/portal/app/crew/layout.tsx`.

### 4. Restart dev workflows

After changing portal-api, restart the `artifacts/portal-api: portal-api` workflow. After changing the portal frontend, Next.js HMR handles it automatically.

### 5. Republish

After testing in dev, click **Republish** in Replit to deploy to production. Always test in incognito after republishing.

---

## DNS & Domain Configuration

| Domain | Deployment | Notes |
|---|---|---|
| `reviverepairco.com` | Revive Roof Repair (combined deployment) | Marketing + portal |
| `www.reviverepairco.com` | Same | |
| `portal.reviverepairco.com` | Same — 308 redirect → `/portal/` | Temporary; remove when portal gets own deployment |
| `reviveroofrepair.com` | Same | Roofing brand |

DNS is managed in Cloudflare (reviverepairco.com) and GoDaddy (reviveroofrepair.com). All Replit records must be **DNS only** (gray cloud, not proxied).

The redirect from `portal.reviverepairco.com` lives in `artifacts/web/middleware.ts`. If you split the portal into its own deployment, remove the `PORTAL_HOSTS` block and link the domain directly.

### Clerk CNAME records (for email from custom domain)

These need to point to the **production** Clerk tenant (`o6xirl9wucme`) not the dev tenant (`be5ttubj7mdk`):

| Hostname | Target |
|---|---|
| `clkmail.portal.reviverepairco.com` | `mail.o6xirl9wucme.clerk.services` |
| `clk._domainkey.portal.reviverepairco.com` | `dkim1.o6xirl9wucme.clerk.services` |
| `clk2._domainkey.portal.reviverepairco.com` | `dkim2.o6xirl9wucme.clerk.services` |

---

## Splitting the Portal into Its Own Deployment (Future)

When the time comes:

1. Remove the `PORTAL_HOSTS` redirect block from `artifacts/web/middleware.ts`
2. In the Replit UI, publish the portal as a second deployment
3. Link `portal.reviverepairco.com` to the new portal deployment
4. Set `PORTAL_BASE_PATH=""` in the portal's production environment (portal will now serve at `/` not `/portal`)
5. Update `CORS` origins in `artifacts/portal-api/src/index.ts` if needed
6. Republish both deployments
7. Production Clerk users from the old setup remain valid (same Clerk tenant)

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
