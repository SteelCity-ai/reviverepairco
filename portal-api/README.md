# Revive Admin Portal — API Server

Express 5 + Drizzle ORM + PostgreSQL

## Routes

| Route | Module |
|-------|--------|
| `GET /api/health` | Health check |
| `POST /api/auth/*` | Clerk webhook — user sync |
| `GET/POST /api/clients` | Client CRUD |
| `GET/POST /api/projects` | Project CRUD |
| `GET/POST /api/main-tasks` | Main tasks |
| `GET/POST /api/daily-tasks` | Daily tasks |
| `GET/POST /api/daily-logs` | Daily logs |
| `GET/POST /api/photos` | Task photos |
| `GET/POST /api/documents` | Project documents |
| `GET/POST /api/change-orders` | Change orders |
| `GET/POST /api/punch-items` | Punch items |
| `GET/POST /api/checklists` | Checklist templates + instances |
| `GET/POST /api/selections` | Material selections |
| `GET/POST /api/time-entries` | Time tracking |
| `GET/POST /api/work-types` | Work type config |
| `GET/POST /api/comments` | Comments |
| `GET/POST /api/users` | User management |
| `GET /api/activity-log` | Activity log |
| `GET /api/daily-summary` | Daily summary |

## DB Schema

Schema lives in `lib/db/schema/portal.ts` — 19 tables, 14 enums.
The shared schema is also mirrored at `../../lib/db/` for the portal frontend.

## Setup

```bash
cp .env.example .env
# Fill in DATABASE_URL, CLERK_WEBHOOK_SECRET, ZOHO_SMTP_*

npm install
npx drizzle-kit push
npx tsx src/index.ts
```
