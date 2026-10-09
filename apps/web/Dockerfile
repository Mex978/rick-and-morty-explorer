# syntax=docker/dockerfile:1
FROM node:24-alpine AS base
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
# Turborepo lives in this cached layer instead of being downloaded by `pnpm dlx` on every build.
RUN corepack enable && npm install -g turbo@2.11.7
WORKDIR /app

FROM base AS pruner
COPY . .
RUN turbo prune @rma/web --docker

FROM base AS builder
COPY --from=pruner /app/out/json/ .
RUN pnpm install --frozen-lockfile
COPY --from=pruner /app/out/full/ .
RUN pnpm turbo build --filter=@rma/web

# Next's standalone output already contains the server and the node_modules it needs.
FROM base AS runner
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
RUN addgroup -S app && adduser -S app -G app
COPY --from=builder --chown=app:app /app/apps/web/.next/standalone ./
COPY --from=builder --chown=app:app /app/apps/web/.next/static ./apps/web/.next/static
USER app
EXPOSE 3000
CMD ["node", "apps/web/server.js"]
