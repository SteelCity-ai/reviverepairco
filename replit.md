# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/web run dev` — run the Revive Roof Repair Next.js site locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Artifacts

- `artifacts/web` — **Revive Roof Repair** marketing site (reviveroofrepair.com).
  - Imported from GitHub repo `SteelCity-ai/reviveroofrepair.com`.
  - Stack: Next.js 16 (App Router, Turbopack), React 19, Tailwind CSS v4.
  - Dev: `pnpm --filter @workspace/web run dev` (binds to `$PORT`).
  - Production: `next build` then `next start` (configured in `artifacts/web/.replit-artifact/artifact.toml`).
  - `next.config.ts` reads `REPLIT_DOMAINS` to set `allowedDevOrigins` so the dev server accepts proxied requests.
  - No environment variables / secrets required.
