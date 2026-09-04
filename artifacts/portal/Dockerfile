# ── Revive Portal (Next.js) — multi-stage Docker build ──────────────────────
# Build context: repo root
# Build:  docker build -f artifacts/portal/Dockerfile --build-arg CLERK_PK=... -t revive-portal .
# Runtime: docker run -p 3001:3001 -e CLERK_PUBLISHABLE_KEY=... -e CLERK_SECRET_KEY=... revive-portal

FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@12.1.0 --activate
RUN apk add --no-cache libc6-compat

FROM base AS deps
WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json .npmrc ./
COPY lib/db/package.json ./lib/db/
COPY artifacts/portal/package.json ./artifacts/portal/

# pnpm 12: replace onlyBuiltDependencies with allowBuilds
RUN sed -i '/^onlyBuiltDependencies:/,+4d' pnpm-workspace.yaml && \
    echo "" >> pnpm-workspace.yaml && \
    echo "allowBuilds:" >> pnpm-workspace.yaml && \
    echo "  '@clerk/shared': true" >> pnpm-workspace.yaml && \
    echo "  esbuild: true" >> pnpm-workspace.yaml && \
    echo "  sharp: true" >> pnpm-workspace.yaml && \
    echo "  unrs-resolver: true" >> pnpm-workspace.yaml

RUN pnpm install --frozen-lockfile

FROM deps AS builder
COPY artifacts/portal/ ./artifacts/portal/
COPY lib/ ./lib/

WORKDIR /app/artifacts/portal

ARG CLERK_PK
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=${CLERK_PK}
ENV CLERK_PUBLISHABLE_KEY=${CLERK_PK}
ENV CLERK_SECRET_KEY=sk_dummy_docker_build
ENV NEXT_TELEMETRY_DISABLED=1

RUN pnpm build

FROM base AS runner
WORKDIR /app/artifacts/portal
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder /app/artifacts/portal/.next ./.next
COPY --from=builder /app/artifacts/portal/package.json ./
COPY --from=builder /app/artifacts/portal/next.config.ts ./
COPY --from=builder /app/artifacts/portal/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/lib ./lib

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 3001
ENV PORT=3001
CMD ["npx", "next", "start", "-p", "3001", "-H", "0.0.0.0"]
