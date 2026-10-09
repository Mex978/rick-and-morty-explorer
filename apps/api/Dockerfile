# syntax=docker/dockerfile:1
FROM node:24-alpine AS base
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable
WORKDIR /app

# Keep only the workspace packages the api needs, so dependency layers are not invalidated by web changes.
FROM base AS pruner
COPY . .
RUN pnpm dlx turbo@2 prune @rma/api --docker

FROM base AS builder
COPY --from=pruner /app/out/json/ .
RUN pnpm install --frozen-lockfile
COPY --from=pruner /app/out/full/ .
RUN pnpm turbo build --filter=@rma/api

# pnpm cannot prune dev dependencies inside a workspace, so production deps are installed in their own stage.
FROM base AS prod-deps
COPY --from=pruner /app/out/json/ .
RUN pnpm install --frozen-lockfile --prod --ignore-scripts

FROM base AS runner
ENV NODE_ENV=production
RUN addgroup -S app && adduser -S app -G app
COPY --from=prod-deps --chown=app:app /app/node_modules ./node_modules
COPY --from=prod-deps --chown=app:app /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=prod-deps --chown=app:app /app/packages/types ./packages/types
COPY --from=builder --chown=app:app /app/packages/types/dist ./packages/types/dist
COPY --from=builder --chown=app:app /app/apps/api/dist ./apps/api/dist
COPY --from=builder --chown=app:app /app/apps/api/package.json ./apps/api/package.json
USER app
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1:${PORT:-3001}/health || exit 1
CMD ["node", "apps/api/dist/main"]
