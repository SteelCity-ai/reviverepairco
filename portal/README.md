# Revive Admin Portal — Frontend

Next.js 16 + React 19 + Tailwind CSS 4 + Clerk auth

## Pages

| Route | Purpose |
|-------|---------|
| `/admin/*` | Admin dashboard, clients, projects, tasks, checklists, change orders, selections, time tracking, documents, daily logs, punch items, schedule |
| `/crew/*` | Crew portal — clock-in, today/upcoming tasks, task detail with completion |
| `/client/*` | Client portal — project view, task sign-off |
| `/sign-in` | Clerk-hosted sign-in |

## Setup

Copy `.env.example` → `.env.local` and fill in:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_API_URL` (points to portal-api server)

```bash
npm install
npx next dev
```
