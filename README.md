# Rick and Morty Explorer

Browse and search the episodes of Rick and Morty and see the characters of each one, built on the public [Rick and Morty API](https://rickandmortyapi.com/documentation). Portuguese and English, light and dark.

Next.js 16 (App Router, styled-components, next-intl) in front, NestJS 11 as a backend for frontend, TypeScript end to end in a pnpm + Turborepo monorepo. Jest, Vitest and Playwright for tests; Prometheus and Grafana for observability; GitHub Actions for CI.

```
browser ──▶ Next.js (server components) ──▶ NestJS BFF ──▶ rickandmortyapi.com
              renders HTML, caches data     batches, sorts, paces,
              per URL for a minute          caches for a day
```

The browser only talks to Next.js. Next.js fetches from the BFF on the server, and the BFF is the only code that knows the upstream exists. `/` lists episodes by season with search and pagination; `/episodes/:id` shows one episode with its characters sorted by name, ten per page, with a filter.

## Getting started

Node.js 22 or newer (`.nvmrc` pins 24; `nvm use`) and pnpm 10 (`corepack enable` is enough, the version is pinned in `package.json`).

```bash
pnpm install
pnpm dev
```

| What    | URL                                                                  |
| ------- | -------------------------------------------------------------------- |
| Web app | http://localhost:3000 (redirects to `/pt-BR`; `/en` for English)     |
| API     | http://localhost:3001/api/v1/episodes                                |
| Health  | http://localhost:3001/health, `/health/ready` and `/health/upstream` |
| Metrics | http://localhost:3001/metrics                                        |

Every variable has a working default, so `.env` files are optional (`apps/*/.env.example` to start from):

| Variable                 | App | Default                           | Purpose                                  |
| ------------------------ | --- | --------------------------------- | ---------------------------------------- |
| `PORT`                   | api | `3001`                            | HTTP port                                |
| `RICK_AND_MORTY_API_URL` | api | `https://rickandmortyapi.com/api` | upstream base URL                        |
| `CACHE_TTL_SECONDS`      | api | `86400`                           | in-memory cache and `Cache-Control`      |
| `UPSTREAM_CONCURRENCY`   | api | `3`                               | upstream calls in flight; the rest queue |
| `THROTTLE_LIMIT`         | api | `300`                             | requests per minute per client ip        |
| `TRUST_PROXY_HOPS`       | api | `0`                               | proxies whose `X-Forwarded-For` to trust |
| `SHUTDOWN_DRAIN_MS`      | api | `0`                               | readiness is down this long before close |
| `METRICS_TOKEN`          | api | unset                             | when set, `/metrics` needs it as bearer  |
| `NODE_ENV`               | api | unset                             | `production` switches logs to JSON lines |
| `API_URL`                | web | `http://localhost:3001`           | where the Next.js server finds the BFF   |
| `SITE_URL`               | web | `http://localhost:3000`           | base for canonical and hreflang links    |

## Running with Docker

Optional. The compose stack builds both apps as production images and adds Prometheus and Grafana, so the metrics show up on a dashboard. Stop `pnpm dev` first, since both use ports 3000 and 3001.

```bash
docker compose up
```

Every `up` rebuilds the app images from the code on disk, so there is no `--build` to remember. Grafana at http://localhost:3002 opens without login straight on the dashboard; Prometheus is at http://localhost:9090. The Dockerfiles are multi-stage builds pruned with `turbo prune`, running as a non-root user with production dependencies only. Prometheus and Grafana reread their mounted config on their own; if either reports a missing file after a git operation recreated `docker/`, run `docker compose up -d --force-recreate grafana prometheus`.

## Running the tests

```bash
pnpm test
```

Unit and integration tests for both apps, with coverage thresholds (95% of statements, functions and lines; 80% of branches on the api, 85% on the web). On the api: mapper, adapter, service against a fake source, HTTP client (error mapping, retries, concurrency cap), env validation, and an integration test booting the app for routes, validation, health, metrics and rate limit. On the web: layouts, components, smart components with the client mocked, route pages, metadata and message parity between locales.

End to end with Playwright, against a stand-in for the public API (`e2e/upstream.mjs`, same shapes and status codes, served from fixtures), so the suite is deterministic and never spends the upstream's quota. It builds both apps and starts them on ports 3100 to 3102, next to any dev server. The first run needs the browser:

```bash
pnpm --filter @rma/e2e exec playwright install chromium
pnpm e2e
```

`pnpm lint`, `pnpm typecheck`, `pnpm format:check` and `pnpm build` complete the set CI runs on every push and pull request, followed by the Docker builds and the e2e suite. Commits follow Conventional Commits, checked by commitlint.

## Project structure

```
apps/api/src/episodes/        controller, service and the EpisodeSource port it depends on
apps/api/src/rick-and-morty/  the adapter behind the port: http client, mapper, concurrency
apps/api/src/observability/   metrics, request logging with request ids, /metrics
apps/api/src/health/          liveness, readiness and the upstream ping
apps/web/src/app/[locale]/    routes, metadata, skeleton loading and error states
apps/web/src/features/        episodes (list + search) and episode (detail), smart + dumb + hook
apps/web/src/components/      Header, Pagination, SearchField, Skeleton, ThemeToggle
apps/web/src/i18n/, messages/ next-intl routing and the pt-BR and en catalogues
packages/types/               Episode, EpisodeDetail, Character, Paginated
e2e/                          Playwright specs and the upstream stand-in
docker/                       Prometheus config, Grafana datasource and dashboard
```

Tests live in `apps/*/test`, mirroring `src`.

## API

Base path `/api/v1`. Successful responses carry `Cache-Control: public, max-age=<CACHE_TTL_SECONDS>`; errors are never cacheable.

| Route                            | Response             |
| -------------------------------- | -------------------- |
| `GET /episodes?page=1&name=rick` | `Paginated<Episode>` |
| `GET /episodes/:id`              | `EpisodeDetail`      |

`page` and `:id` must be positive integers and `name` at most 100 characters, otherwise 400. A `name` with no matches is an empty first page; a `page` past the last one is a 404. `EpisodeDetail` comes with the characters already sorted by name. Each client ip gets `THROTTLE_LIMIT` requests per minute, then 429 with `Retry-After`. Call the same url twice and the `X-Cache` header goes from `MISS` to `HIT`.

## Observability

`/health` is liveness (heap of this process), `/health/ready` adds whether a shutdown has started and is the one to gate traffic on, `/health/upstream` pings the public API for dashboards and alerts only. `/metrics` exposes request duration by route pattern and status, cache hits and misses, upstream latency by operation, upstream calls that waited for a slot, and Node.js defaults. Every response carries an `x-request-id`, reused when the caller sends one, and each request is logged with it; in production the logs are JSON lines. Traces and a log backend were left out on purpose: they need more infrastructure than the application itself, and `docker compose logs -f api` already shows the request lines.

The Grafana dashboard counts the BFF's own cache. The Next.js data cache in front of it answers repeats of a url for a minute, so the first view of a page is a miss, refreshes within a minute never reach the BFF, and the next view after that is a hit.

## Decisions

- **A BFF, because the upstream returns character URLs, not characters.** Extracting ids, batching, sorting and caching belong in one place. One batch request (`/character/1,2,3`) turns an episode with 60 characters into 2 upstream calls instead of 61.
- **The episodes module depends on a port, not on the upstream.** `EpisodeSource` is an interface owned by `episodes/`; `rick-and-morty/` provides the adapter. The service only knows the port, so faking the upstream in a test is another provider for the same token, and its quirks (character urls, 404 for an empty search) stay inside the adapter.
- **Two caches with different jobs.** Next keeps a response for a minute per instance, enough to absorb a burst on one page; the BFF keeps it for a day in a bounded LRU, as the cache every consumer shares. The content never changes. Redis would only matter with more than one API instance.
- **The public API is a shared, rate-limited resource.** The BFF retries transient 5xx with a short backoff, answers 503 on a 429 instead of waiting out the upstream's retry window, and never sends more than `UPSTREAM_CONCURRENCY` calls at once, so a burst of misses becomes a short queue rather than a 429 for everyone. Episode cards do not prefetch on scroll: prefetching a dynamic route runs its `generateMetadata`, which needs the episode, and twenty visible cards would be twenty fetches at once.
- **Avatars load straight from the upstream CDN**, with `next/image` unoptimized: optimizing a 300px JPEG saves nothing, and routing every user's images through one server IP is exactly what the upstream rate-limits. Ten cards per page caps what a visit asks the CDN for; a failed avatar is retried and then replaced by a placeholder.
- **Server components fetch, client components interact.** No data fetching library on the client: the content is public and immutable, so it is rendered once on the server and cached. Search lives in the URL, debounced inside a transition, so every result is cacheable and shareable. Characters are filtered and paged on the client because the whole episode is already on the page; the filter runs over the whole list and returns to the first page.
- **Health looks at this process, never at the upstream.** An upstream outage must neither restart a healthy container nor pull instances out of rotation while the cache can still answer. Readiness turns down when a shutdown starts and `SHUTDOWN_DRAIN_MS` keeps the process serving until the balancer notices.
- **Rate limit sized for a server, not a visitor.** The Next.js server is one client with one ip as far as the BFF can tell; a per-visitor limit belongs at the edge. `TRUST_PROXY_HOPS` says how many `X-Forwarded-For` entries to believe, so a forged header cannot buy a fresh quota.
- **Themes are CSS variables** toggled by a `data-theme` attribute, stored in a cookie the layout reads on the server, so the page never flashes the other theme. Browsers with the View Transitions API reveal the new theme in a circle from the click.
- **next-intl for routing, messages, plurals and dates.** A test guarantees both locales have the same keys and the same ICU arguments.

MIT
