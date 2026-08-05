# Revive Portal — which repo to use

## ⚠️ Portal code lives here instead
The **Revive admin/project portal** (Next.js 16 + Express 5 + Drizzle, custom JWT/bcrypt auth)
now lives in a **separate repo**:

**`SteelCity-ai/revive-project-portal-VPS`** (default branch: `main`)

That repo is the canonical source and matches what is deployed on the VPS production
containers (`revive-portal-prod-*`).

## What this repo is
This repo (`SteelCity-ai/reviverepairco`) holds the **marketing website** and an **older /
experimental portal implementation that uses Clerk auth**. It is **not** the active portal
codebase anymore.

**Do not pull portal code from the `portal/` / `portal-api/` directories here.** Use the
portal-VPS repo above. If you are starting work on the portal, clone
`SteelCity-ai/revive-project-portal-VPS`.

## tl;dr
| What | Repo |
|------|------|
| Revive marketing website | `SteelCity-ai/reviverepairco` (this repo) |
| Revive admin portal (canonical, deployed) | `SteelCity-ai/revive-project-portal-VPS` |
| Legacy/experimental Clerk portal | `SteelCity-ai/reviverepairco` → `portal/`, `portal-api/` (abandoned) |
