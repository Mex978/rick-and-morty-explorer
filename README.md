# Rick and Morty Explorer

Browse and search the episodes of Rick and Morty and see the characters of each one in alphabetical order, built on the public [Rick and Morty API](https://rickandmortyapi.com/documentation). Available in Portuguese and English, light and dark.

- [How it works](#how-it-works)
- [Stack](#stack)
- [Getting started](#getting-started)
- [Running with Docker](#running-with-docker)
- [Running the tests](#running-the-tests)
- [Scripts](#scripts)
- [Project structure](#project-structure)
- [API](#api)
- [Observability](#observability)
- [Decisions](#decisions)
- [Deployment](#deployment)

## How it works

```
browser ──▶ Next.js (server components) ──▶ NestJS BFF ──▶ rickandmortyapi.com
              renders HTML, caches data     batches, sorts,
              per URL for one hour          caches in memory
```

The browser only ever talks to Next.js. Next.js fetches from the BFF on the server, and the BFF is the single place that knows the upstream exists. Two screens, one request each:

1. `/` lists the episodes grouped by season, paginated, with a search box.
2. `/episodes/:id` shows one episode with its characters sorted by name, with a filter.

## Stack

| Layer         | Choice                                                                        |
| ------------- | ----------------------------------------------------------------------------- |
| Web           | Next.js 16 (App Router), styled-components, next-intl                         |
| API           | NestJS 11 as a backend for frontend                                           |
| Language      | TypeScript end to end, shared contracts in `packages/types`                   |
| Monorepo      | pnpm workspaces, Turborepo                                                    |
| Tests         | Jest (api), Vitest + Testing Library (web), Playwright (e2e)                  |
| CI            | GitHub Actions                                                                |
| Observability | prom-client and Terminus in the api; Prometheus and Grafana in Docker Compose |
| Containers    | Docker multi-stage builds pruned with Turborepo, Docker Compose               |

## Getting started

### Prerequisites

- Node.js 22 or newer. `.nvmrc` pins 24, which CI uses; with nvm, run `nvm use` in the repository root.
- pnpm 10. With Node 22+, `corepack enable` is enough: the version is pinned in `package.json`.
- Docker Desktop, only for the [Docker section](#running-with-docker).

### 1. Install

```bash
git clone <this repository>
cd rick-and-morty-explorer
pnpm install
```

### 2. Run

Both apps at once, in watch mode:

```bash
pnpm dev
```

Or each one on its own terminal:

```bash
pnpm --filter @rma/api dev
```

```bash
pnpm --filter @rma/web dev
```

The API needs `packages/types` built once (`pnpm dev` and `pnpm build` do it through Turborepo; on its own run `pnpm --filter @rma/types build` first).

### 3. Open

| What    | URL                                                                                                      |
| ------- | -------------------------------------------------------------------------------------------------------- |
| Web app | http://localhost:3000 (redirects to `/pt-BR`; `/en` for English)                                         |
| API     | http://localhost:3001/api/v1/episodes                                                                    |
| Health  | http://localhost:3001/health (liveness) and http://localhost:3001/health/ready (checks the upstream too) |
| Metrics | http://localhost:3001/metrics                                                                            |

### Environment variables

Every variable has a working default, so `.env` files are optional. To change one, copy the example file next to the app and edit it:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

| Variable                 | App | Default                           | Purpose                                  |
| ------------------------ | --- | --------------------------------- | ---------------------------------------- |
| `PORT`                   | api | `3001`                            | HTTP port                                |
| `RICK_AND_MORTY_API_URL` | api | `https://rickandmortyapi.com/api` | upstream base URL                        |
| `CACHE_TTL_SECONDS`      | api | `3600`                            | in-memory cache and `Cache-Control`      |
| `NODE_ENV`               | api | unset                             | `production` switches logs to JSON lines |
| `API_URL`                | web | `http://localhost:3001`           | where the Next.js server finds the BFF   |
| `SITE_URL`               | web | `http://localhost:3000`           | base for canonical and hreflang links    |

## Running with Docker

Docker is optional. The application runs on its own with `pnpm dev`, and `/health` and `/metrics` are served by the API either way. The compose stack builds both apps as production images and adds Prometheus and Grafana around them, so you can see the metrics on a dashboard without installing anything else.

Stop `pnpm dev` first, since both use ports 3000 and 3001. Then, from the repository root:

```bash
docker compose up --build
```

The first build takes a few minutes; later runs reuse the layers. When the logs settle, four services are up:

| Service      | URL                   | What it is                                                                                       |
| ------------ | --------------------- | ------------------------------------------------------------------------------------------------ |
| `web`        | http://localhost:3000 | the Next.js app, production build, talking to `api` over the compose network                     |
| `api`        | http://localhost:3001 | the NestJS BFF, production build, JSON logs, with a container health check on `/health`          |
| `prometheus` | http://localhost:9090 | scrapes `api:3001/metrics` every 5 seconds; under Status → Targets the `api` job should be `UP`  |
| `grafana`    | http://localhost:3002 | opens without login; the dashboard "Rick and Morty Explorer API" is provisioned under Dashboards |

To see the dashboard move, browse the app on port 3000 for a minute and come back to Grafana. Useful commands:

```bash
docker compose logs -f api
```

```bash
docker compose down
```

```bash
docker compose build --no-cache
```

What is where:

- `apps/api/Dockerfile` and `apps/web/Dockerfile`: multi-stage builds. `turbo prune` keeps only the workspace packages each app needs, dependencies install in their own layer, the runtime image runs as a non-root user and contains only the build output and production dependencies (Next uses its `standalone` output).
- `docker-compose.yml`: the four services above, with `web` waiting for `api` to be healthy.
- `docker/prometheus/prometheus.yml`: the scrape config.
- `docker/grafana/`: datasource and dashboard provisioning, so Grafana comes up configured.

## Running the tests

Unit and integration tests for both apps, with coverage:

```bash
pnpm test
```

End to end with Playwright, against the real public API. It builds both apps, starts them on ports 3100 and 3101 (so it can run next to `pnpm dev`) and tears them down at the end. The first run needs the browser:

```bash
pnpm --filter @rma/e2e exec playwright install chromium
```

```bash
pnpm e2e
```

One app at a time, or in watch mode:

```bash
pnpm --filter @rma/api test
```

```bash
pnpm --filter @rma/web exec vitest
```

| Layer | Tool                    | What it covers                                                                                                                                                                                                                   |
| ----- | ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| api   | Jest, nock, supertest   | mapper, service (sorting, single batch call), HTTP client error mapping and retries, env validation, and an integration test booting the app through the same setup as `main.ts` for the routes, health, metrics and request ids |
| web   | Vitest, Testing Library | both layouts (search, character filter), header, pagination, theme toggle, smart components with the API client mocked, the client itself, route pages, metadata and message parity                                              |
| e2e   | Playwright, Chromium    | list, pagination, search, sorted characters, character filter, language and theme switch, translated 404                                                                                                                         |

`pnpm test` fails under 95% of statements, functions and lines (80% of branches on the api, 85% on the web). On the web the thresholds exclude the Next.js runtime glue (`layout.tsx`, `proxy.ts`, the i18n request config, the styled-components registry and the `styles.ts` files), which has no logic of its own and is exercised by Playwright instead. One web test deliberately goes through the real API client with `fetch` stubbed, as an integration check.

The e2e job in CI is blocking, with two retries to absorb public API hiccups, and runs serially because the upstream rate-limits bursts. Avatar images are answered with a one-pixel stub during the suite: the browser and the API leave from the same IP there, and real downloads would spend the CDN's per-IP quota the API calls need. The Playwright report is uploaded on failure.

## Scripts

All from the repository root.

| Script              | What it does                                              |
| ------------------- | --------------------------------------------------------- |
| `pnpm dev`          | api and web in watch mode                                 |
| `pnpm build`        | production builds of every package                        |
| `pnpm test`         | unit and integration tests with coverage thresholds       |
| `pnpm e2e`          | production builds, then Playwright on ports 3100 and 3101 |
| `pnpm lint`         | ESLint on every package                                   |
| `pnpm typecheck`    | `tsc --noEmit` on every package                           |
| `pnpm format`       | Prettier on the whole repo                                |
| `pnpm format:check` | verifies formatting; runs in CI                           |

Commits follow Conventional Commits, checked by commitlint; staged files are formatted on commit. CI runs format check, lint, typecheck, tests, builds, the Docker images and the e2e suite on every push to `main` and `develop` and on pull requests.

## Project structure

```
apps/
  api/
    src/episodes/        controller, service, pure mapper
    src/rick-and-morty/  the only code that knows the upstream exists
    src/observability/   metrics registry, request logging, /metrics
    src/health/          /health with Terminus
    test/                Jest suites mirroring src, fixtures and the integration test
    Dockerfile
  web/
    src/app/[locale]/    routes, metadata, skeleton loading and error states
    src/features/        episodes (list + search) and episode (detail), each with its hook
    src/components/      Header, Pagination, SearchField, Skeleton, ThemeToggle
    src/i18n/            routing, request config, navigation, metadata
    src/messages/        pt-BR.json, en.json
    test/                Vitest suites mirroring src, plus render helper and fixtures
    Dockerfile
packages/
  types/                 Episode, EpisodeDetail, Character, Paginated
  tsconfig/, eslint-config/
e2e/                     Playwright specs
docker/                  Prometheus config, Grafana datasource and dashboard
docker-compose.yml
.github/workflows/ci.yml
```

Each web feature has the same shape: `index.tsx` is the smart component (an async server component that fetches and prepares data), `data.ts` holds its props, `Layout/` is the dumb client component with its styled-components, and behaviour with state lives in a hook next to them (`useEpisodeSearch`, `useAvatar`). `components/` holds what the app shell or more than one feature shares. Web tests live in `apps/web/test`, mirroring `src`, so route and feature folders contain only code.

## API

Base path: `/api/v1`. Successful responses carry `Cache-Control: public, max-age=<CACHE_TTL_SECONDS>`; errors are never marked cacheable.

| Route                            | Response             |
| -------------------------------- | -------------------- |
| `GET /episodes?page=1&name=rick` | `Paginated<Episode>` |
| `GET /episodes/:id`              | `EpisodeDetail`      |

- `page` must be a positive integer and `name` at most 100 characters; anything else, including a repeated parameter, is a 400.
- A `name` with no matches returns an empty first page; any `page` past the last one, with or without `name`, is a 404.
- `EpisodeDetail` carries the characters already sorted by name; the frontend never sorts.

Try it:

```bash
curl -s "http://localhost:3001/api/v1/episodes?page=1" | head -c 400
```

```bash
curl -s -D - -o /dev/null http://localhost:3001/api/v1/episodes/1
```

The second call shows `X-Cache`, `Cache-Control` and `x-request-id` headers; repeat it and `X-Cache` turns from `MISS` to `HIT`.

## Observability

Everything runs locally; no external service is involved.

| Endpoint   | What it gives                                                                                                                                                                                               |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/health`  | Liveness: heap usage of this process only, so an upstream outage never gets a healthy container restarted. `/health/ready` adds a ping to the upstream and is the one to gate traffic on                    |
| `/metrics` | Prometheus text format: `http_request_duration_seconds` by method, route pattern and status; `cache_events_total` by hit or miss; `upstream_request_duration_seconds` by operation; Node.js default metrics |

Every response carries an `x-request-id` (reused when the caller sends one), and each request is logged with method, url, status, duration and cache result. With `NODE_ENV=production` the Nest logger writes JSON lines, ready for any log collector. Routes are logged by pattern (`/api/v1/episodes/:id`) so metric cardinality stays bounded whatever the ids or search terms.

The Grafana dashboard provisioned by Docker Compose shows requests per second and p95 latency by route, responses by status, the BFF cache hit ratio with hits and misses over time, upstream latency by operation and process memory. The cache panels count the BFF's own cache only: the Next.js data cache sits in front of it, so revisiting a page in the browser usually never reaches the API. To see hits, call the API directly twice, for example `curl -D - -o /dev/null http://localhost:3001/api/v1/episodes/1`, and watch `X-Cache` go from `MISS` to `HIT`. Traces were left out on purpose: they need a backend to be useful, and the request id already correlates a response with its log line.

## Decisions

- **A BFF, because the upstream returns character URLs, not characters.** Extracting ids, batching, sorting and caching belong in one place, and that keeps the frontend free of orchestration.
- **One batch request per episode.** `/character/1,2,3` turns an episode with 60 characters into 2 upstream calls instead of 61.
- **In-memory cache, bounded.** Nest's `CacheInterceptor` keeps responses for `CACHE_TTL_SECONDS` in an LRU store capped at 500 entries, because cache keys include user input. The content never changes, so this is safe. Redis would only make sense with more than one API instance.
- **Smart/dumb maps onto server/client components.** The smart one fetches on the server, the dumb one only renders and translates. No data fetching library on the client: server components call the BFF with `fetch` and Next's data cache. The BFF's `Cache-Control` header is for anything that talks to it directly, such as a CDN or another consumer.
- **Search lives in the URL.** Typing is debounced and navigates inside a React transition, so the server renders the result, the input keeps focus, every result page is cacheable and a search is a shareable link. Characters are filtered on the client because the whole episode is already on the page.
- **Themes are CSS variables.** A `data-theme` attribute toggles them, following the system preference by default. The choice is a cookie the layout reads on the server, so the page never flashes the other theme and switching re-renders nothing. Browsers with the View Transitions API reveal the new theme in a circle from the click. Reading the cookie makes every page dynamic, which is fine: caching happens at the data layer, not at the HTML.
- **The public API is treated as a shared, rate-limited resource.** The BFF retries transient 5xx twice with a short backoff and answers 503 on a 429 instead of waiting out the upstream's ten-second retry window. Each route has its own `loading.tsx` skeleton, which also bounds what a link prefetch fetches: the skeleton, never the data, so twenty visible cards do not turn into twenty upstream calls.
- **Avatars load straight from the upstream CDN.** `next/image` still handles sizing, lazy loading and the `priority` preload of the first row, but with `unoptimized` set: optimizing a 300px JPEG saves nothing, and routing every user's image traffic through one server IP is exactly what the upstream rate-limits, which showed up as broken images on refresh. A page with 60 avatars is still a burst for the CDN, so an avatar that fails is retried after a few seconds and then replaced by a placeholder with the character's initial.
- **Visited pages stay in the client router cache for a minute** (`staleTimes.dynamic`), so going back to an episode is instant instead of showing its skeleton again. The flag is still marked experimental by Next.js; the content never changes, so a minute of staleness is free.
- **next-intl for routing, messages, plurals and dates.** A test guarantees both locales have the same keys and the same ICU arguments.

## Deployment

The two apps deploy differently, and that is deliberate.

**Web on Vercel.** Import the repository, set the root directory to `apps/web` and the build command to `pnpm turbo build --filter=@rma/web` (Turborepo builds `packages/types` first; pnpm and the workspace are detected automatically). Set `API_URL` to the public URL of the API and `SITE_URL` to the Vercel domain. The `standalone` output used by the Dockerfile is harmless there.

**API in a container.** The BFF keeps an in-memory cache and keep-alive connections, which only pay off in a long-running process, so it is not a fit for serverless functions. The Dockerfile at `apps/api/Dockerfile` runs on any container host (Render, Fly.io, Railway, Cloud Run); expose `PORT`, set `CACHE_TTL_SECONDS` if the default hour is not what you want, and point the platform health check at `/health`.

MIT
