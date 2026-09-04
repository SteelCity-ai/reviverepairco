# ── Revive Portal API (Express + tsc) — multi-stage Docker build ───────────
# Build context: repo root
# Build:  docker build -f artifacts/portal-api/Dockerfile -t revive-portal-api .
# Runtime: docker run -p 3002:3002 -e DATABASE_URL=... -e CLERK_SECRET_KEY=... revive-portal-api

FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@12.1.0 --activate
RUN apk add --no-cache libc6-compat

FROM base AS deps
WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json .npmrc ./
COPY lib/db/package.json ./lib/db/
COPY artifacts/portal-api/package.json ./artifacts/portal-api/

RUN sed -i '/^onlyBuiltDependencies:/,+4d' pnpm-workspace.yaml && \
    echo "" >> pnpm-workspace.yaml && \
    echo "allowBuilds:" >> pnpm-workspace.yaml && \
    echo "  '@clerk/shared': true" >> pnpm-workspace.yaml && \
    echo "  esbuild: true" >> pnpm-workspace.yaml && \
    echo "  sharp: true" >> pnpm-workspace.yaml && \
    echo "  unrs-resolver: true" >> pnpm-workspace.yaml

RUN pnpm install --frozen-lockfile

FROM deps AS builder
COPY artifacts/portal-api/ ./artifacts/portal-api/
COPY lib/ ./lib/

WORKDIR /app/artifacts/portal-api
RUN pnpm build

FROM base AS prod-deps
WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json .npmrc ./
COPY lib/db/package.json ./lib/db/
COPY artifacts/portal-api/package.json ./artifacts/portal-api/

RUN sed -i '/^onlyBuiltDependencies:/,+4d' pnpm-workspace.yaml && \
    echo "" >> pnpm-workspace.yaml && \
    echo "allowBuilds:" >> pnpm-workspace.yaml && \
    echo "  '@clerk/shared': true" >> pnpm-workspace.yaml && \
    echo "  esbuild: true" >> pnpm-workspace.yaml && \
    echo "  sharp: true" >> pnpm-workspace.yaml && \
    echo "  unrs-resolver: true" >> pnpm-workspace.yaml

RUN pnpm install --frozen-lockfile --prod

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3002

COPY --from=builder /app/artifacts/portal-api/dist ./dist
COPY --from=builder /app/artifacts/portal-api/package.json ./
COPY --from=prod-deps /app/node_modules ./node_modules

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs && \
    chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 3002
CMD ["node", "dist/src/index.js"]
