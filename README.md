# Rick and Morty Explorer

Browse and search the episodes of Rick and Morty and see the characters of each one in alphabetical order, built on the public [Rick and Morty API](https://rickandmortyapi.com/documentation). Available in Portuguese and English, light and dark.

```
browser ──▶ Next.js (server components) ──▶ NestJS BFF ──▶ rickandmortyapi.com
              renders HTML, caches data     batches, sorts,
              per URL for one hour          caches in memory
```

The browser only ever talks to Next.js. Next.js fetches from the BFF on the server, and the BFF is the single place that knows the upstream exists.

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

## Running locally

Requires Node 22 or newer (`.nvmrc` pins 24, which CI uses) and pnpm 10.

```bash
pnpm install
pnpm dev
```

The web app runs on http://localhost:3000 and the API on http://localhost:3001.

Or with Docker, which builds both apps and also brings up Prometheus and a Grafana dashboard:

```bash
docker compose up --build
```

| Service    | URL                                                            |
| ---------- | -------------------------------------------------------------- |
| web        | http://localhost:3000                                          |
| api        | Jest, nock, supertest                                          | mapper, service (sorting, single batch call), HTTP client error mapping, env validation, and an integration test booting the app through the same setup as `main.ts` for the routes, health, metrics and request ids |
| Prometheus | http://localhost:9090                                          |
| Grafana    | http://localhost:3002 (anonymous admin, dashboard provisioned) |

Docker is optional: `pnpm dev` runs the application on its own, and `/health` and `/metrics` are served by the API either way. The compose stack only adds Prometheus and Grafana around it.

Every variable has a working default, so `.env` files are optional; copy `apps/api/.env.example` or `apps/web/.env.example` to `.env` next to it when you need to change one.

| Variable                 | App | Default                           | Purpose                                |
| ------------------------ | --- | --------------------------------- | -------------------------------------- |
| `PORT`                   | api | `3001`                            | HTTP port                              |
| `RICK_AND_MORTY_API_URL` | api | `https://rickandmortyapi.com/api` | upstream base URL                      |
| `CACHE_TTL_SECONDS`      | api | `3600`                            | in-memory cache and `Cache-Control`    |
| `API_URL`                | web | `http://localhost:3001`           | where the Next.js server finds the BFF |
| `SITE_URL`               | web | `http://localhost:3000`           | base for canonical and hreflang links  |

## Scripts

| Script           | What it does                                                                                                     |
| ---------------- | ---------------------------------------------------------------------------------------------------------------- |
| `pnpm dev`       | api and web in watch mode                                                                                        |
| `pnpm test`      | unit and integration tests with coverage thresholds                                                              |
| `pnpm e2e`       | production builds, then Playwright against the real API on ports 3100 and 3101, so it can run next to `pnpm dev` |
| `pnpm lint`      | ESLint on every package                                                                                          |
| `pnpm format`    | Prettier on the whole repo (`format:check` runs in CI)                                                           |
| `pnpm typecheck` | `tsc --noEmit` on every package                                                                                  |
| `pnpm build`     | production builds                                                                                                |

Commits follow Conventional Commits, checked by commitlint; staged files are formatted on commit.

## Project structure

```
apps/
  api/
    src/episodes/        controller, service, pure mapper and their tests
    src/rick-and-morty/  the only code that knows the upstream exists
    test/                integration test booting the whole app
  web/
    src/app/[locale]/    routes, metadata, loading and error states
    src/features/        episodes (list + search) and episode (detail)
    src/components/      Header, Pagination, SearchField, ThemeToggle
    src/i18n/            routing, request config, navigation, metadata
    src/messages/        pt-BR.json, en.json
packages/
  types/                 Episode, EpisodeDetail, Character, Paginated
  tsconfig/, eslint-config/
e2e/                     Playwright specs
docker/                  Prometheus config, Grafana datasource and dashboard
apps/*/Dockerfile, docker-compose.yml
.github/workflows/ci.yml
```

Each web feature has the same shape: `index.tsx` is the smart component (an async server component that fetches and prepares data), `data.ts` holds its props and `Layout/` is the dumb client component with its styled-components. Nothing in `components/` is used by fewer than two features.

## API

Base path: `/api/v1`. Successful responses carry `Cache-Control: public, max-age=<CACHE_TTL_SECONDS>`; errors are never marked cacheable.

| Route                            | Response             |
| -------------------------------- | -------------------- |
| `GET /episodes?page=1&name=rick` | `Paginated<Episode>` |
| `GET /episodes/:id`              | `EpisodeDetail`      |

- `page` must be a positive integer and `name` at most 100 characters; anything else, including a repeated parameter, is a 400.
- A `name` with no matches returns an empty page; a `page` past the last one is a 404.
- `EpisodeDetail` carries the characters already sorted by name; the frontend never sorts.

## Observability

Everything runs locally; no external service is involved.

| Endpoint   | What it gives                                                                                                                                                                                               |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/health`  | Terminus check: pings the upstream and watches heap usage; 503 when either is down, so a container orchestrator can act on it                                                                               |
| `/metrics` | Prometheus text format: `http_request_duration_seconds` by method, route pattern and status; `cache_events_total` by hit or miss; `upstream_request_duration_seconds` by operation; Node.js default metrics |

Every response carries an `x-request-id` (reused when the caller sends one), and each request is logged with method, url, status, duration and cache result. With `NODE_ENV=production` the Nest logger writes JSON lines, ready for any log collector. Routes are logged by pattern (`/api/v1/episodes/:id`) so metric cardinality stays bounded whatever the ids or search terms.

The Grafana dashboard provisioned by Docker Compose shows requests per second and p95 latency by route, responses by status, cache hit ratio, upstream latency by operation and process memory. Traces were left out on purpose: they need a backend to be useful, and the request id already correlates a response with its log line.

## Decisions

- **A BFF, because the upstream returns character URLs, not characters.** Extracting ids, batching, sorting and caching belong in one place, and that keeps the frontend free of orchestration.
- **One batch request per episode.** `/character/1,2,3` turns an episode with 60 characters into 2 upstream calls instead of 61.
- **In-memory cache, bounded.** Nest's `CacheInterceptor` keeps responses for `CACHE_TTL_SECONDS` in an LRU store capped at 500 entries, because cache keys include user input. The content never changes, so this is safe. Redis would only make sense with more than one API instance.
- **Smart/dumb maps onto server/client components.** The smart one fetches on the server, the dumb one only renders and translates. No data fetching library on the client: server components call the BFF with `fetch` and Next's data cache, and the `Cache-Control` header covers the browser.
- **Search lives in the URL.** Typing is debounced and navigates inside a React transition, so the server renders the result, the input keeps focus, every result page is cacheable and a search is a shareable link. Characters are filtered on the client because the whole episode is already on the page.
- **Themes are CSS variables.** A `data-theme` attribute toggles them, following the system preference by default. The choice is a cookie the layout reads on the server, so the page never flashes the other theme and switching re-renders nothing. Browsers with the View Transitions API reveal the new theme in a circle from the click. Reading the cookie makes every page dynamic, which is fine: caching happens at the data layer, not at the HTML.
- **The public API is treated as a shared, rate-limited resource.** The BFF retries 429 and transient 5xx twice with a short backoff, and episode cards do not prefetch their detail page, because prefetching twenty of them at once is exactly the burst that trips the limit.
- **next-intl for routing, messages, plurals and dates.** A test guarantees both locales have the same keys and the same ICU arguments.

## Testing

| Layer | Tool                    | What it covers                                                                                                                                                                      |
| ----- | ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| api   | Jest, nock, supertest   | mapper, service (sorting, single batch call), HTTP client error mapping, env validation, and an integration test booting the app through the same setup as `main.ts`                |
| web   | Vitest, Testing Library | both layouts (search, character filter), header, pagination, theme toggle, smart components with the API client mocked, the client itself, route pages, metadata and message parity |
| e2e   | Playwright, Chromium    | list, pagination, search, sorted characters, character filter, language and theme switch, against the real API                                                                      |

`pnpm test` fails under 95% of statements, functions and lines (80% of branches on the api, 85% on the web). On the web the thresholds exclude the Next.js runtime glue (`layout.tsx`, `proxy.ts`, the i18n request config, the styled-components registry and the `styles.ts` files), which has no logic of its own and is exercised by Playwright instead. One web test deliberately goes through the real API client with `fetch` stubbed, as an integration check.

The e2e job in CI is blocking, with two retries to absorb public API hiccups, and runs serially because the upstream rate-limits bursts. The Playwright report is uploaded on failure.

```bash
pnpm test
pnpm e2e
```

## Deployment

The two apps deploy differently, and that is deliberate.

**Web on Vercel.** Import the repository, set the root directory to `apps/web` and the build command to `pnpm turbo build --filter=@rma/web` (Turborepo builds `packages/types` first; pnpm and the workspace are detected automatically). Set `API_URL` to the public URL of the API and `SITE_URL` to the Vercel domain. The `standalone` output used by the Dockerfile is harmless there.

**API in a container.** The BFF keeps an in-memory cache and keep-alive connections, which only pay off in a long-running process, so it is not a fit for serverless functions. The Dockerfile at `apps/api/Dockerfile` runs on any container host (Render, Fly.io, Railway, Cloud Run); expose `PORT`, set `CACHE_TTL_SECONDS` if the default hour is not what you want, and point the platform health check at `/health`.

MIT
