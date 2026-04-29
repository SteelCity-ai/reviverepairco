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

- `artifacts/web` — **Revive** marketing site, multi-domain.
  - Imported from GitHub repo `SteelCity-ai/reviveroofrepair.com`.
  - Stack: Next.js 16 (App Router, Turbopack), React 19, Tailwind CSS v4.
  - Dev: `pnpm --filter @workspace/web run dev` (binds to `$PORT`).
  - Production: `next build` then `next start` (configured in `artifacts/web/.replit-artifact/artifact.toml`).
  - `next.config.ts` reads `REPLIT_DOMAINS` to set `allowedDevOrigins` so the dev server accepts proxied requests.
  - Optional secrets: `ZOHO_SMTP_USER` / `ZOHO_SMTP_PASSWORD` (contact form delivery via `lib/email.ts`). Without them the contact API throws.

### Multi-domain setup

Both `reviveroofrepair.com` and `reviverepairco.com` are served by the same Next.js deployment. Hostname routing is handled by `artifacts/web/middleware.ts`:

- **reviveroofrepair.com** → "roofing" brand. `/` renders the roofing homepage. Logo: `/images/revive-logo-v3.png` ("Revive Repair Specialists").
- **reviverepairco.com** → "repair-co" brand. `/` rewrites to `/general-contracting` (the GC landing page). `/roofing` shows the roofing homepage. Logo: `/images/revive-logo-company.png` ("Revive Repair Company").

The middleware detects the host, sets an `x-revive-brand` header, and rewrites `/` on the repair-co domain. `lib/brand.ts` exposes `getBrand()` (server) and `brandConfig(brand)` for components to read the brand from request headers and pick the right logo, metadata, OG tags, canonical URL, and JSON-LD schema type.

`sitemap.ts` and `robots.ts` are dynamic (`force-dynamic`) and emit URLs for the canonical domain matching the requesting host. The repair-co sitemap lists `/`, `/general-contracting`, `/roofing`, plus shared pages; the roofing sitemap stays roofing-first but also lists `/general-contracting` as a discoverable cross-link.

### Adding `reviverepairco.com` in production

1. **Add the domain in Replit Deployments** for the published `artifacts/web` deployment. Replit will issue an `A` record IP and a `replit-verify` `TXT` record.
2. **At the domain registrar (or DNS provider)**, create:
   - `A` record for `@` (root) pointing at the IP Replit gives you.
   - `TXT` record for `@` with the `replit-verify=...` value.
   - (Optional) `CNAME` for `www` pointing at the apex.
   - If using Cloudflare, set the records to **DNS-only** (gray cloud) so Replit can issue and serve its own TLS cert (mirrors what `reviveroofrepair.com` already does).
3. Wait for DNS to propagate, then click **Verify** in Replit. Once verified, Replit will issue an SSL cert automatically.
4. No code changes are needed — the middleware already recognizes `reviverepairco.com`.

## Pushing site updates back to GitHub

Workspace git is platform-managed, so changes are pushed to
`SteelCity-ai/reviveroofrepair.com` via a sync script that uses the connected
GitHub account (no PAT required).

- Preview pending changes (no writes):
  `pnpm --filter @workspace/scripts exec tsx ./src/sync-to-github.ts --dry-run`
- Push to the default branch (`main`):
  `pnpm --filter @workspace/scripts exec tsx ./src/sync-to-github.ts --message "your commit message"`
- Push to a feature branch and open a PR:
  `pnpm --filter @workspace/scripts exec tsx ./src/sync-to-github.ts --branch my-edits --message "..."`
  (the script prints a compare URL when not pushing to the default branch).
- Help: add `--help` for all options (`--owner`, `--repo`, `--branch`,
  `--base-branch`, `--message`, `--dir`, `--dry-run`, `--force-delete`).

The script uploads only files whose contents changed and respects
`artifacts/web/.gitignore` plus `node_modules`, `.next`, build output, and
`.git`. Because it mirrors the local directory to the repo root, deleting
remote files requires `--force-delete` — without it, the script will print
the would-be deletions and abort, so files outside the synced directory
(workflows, docs, CI config) can't be removed by accident. To pull updates
from teammates, use GitHub's normal PR/clone flow on your local machine —
this workspace does not auto-pull.
