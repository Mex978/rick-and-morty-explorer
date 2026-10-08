# Rick and Morty Explorer

Browse and search the episodes of Rick and Morty and see the characters of each one in alphabetical order, on top of the public [Rick and Morty API](https://rickandmortyapi.com/documentation). Available in pt-BR and en, light and dark.

## Stack

- Next.js 16 (App Router) with styled-components and next-intl
- NestJS 11 as a backend for frontend over the public API
- TypeScript end to end, with shared contracts in `packages/types`
- pnpm workspaces and Turborepo
- Jest (api), Vitest and Testing Library (web), Playwright (e2e)
- GitHub Actions

## Running locally

Requires Node 22+ (see `.nvmrc`) and pnpm 10.

```bash
pnpm install
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
pnpm dev
```

The `.env` files are optional: every variable has a working default. The web app runs on http://localhost:3000 and the API on http://localhost:3001.

## Scripts

| Script | What it does |
| --- | --- |
| `pnpm dev` | starts api and web in watch mode |
| `pnpm test` | unit and integration tests of api and web |
| `pnpm e2e` | builds everything and runs Playwright against the real API |
| `pnpm lint` | ESLint on every package |
| `pnpm typecheck` | `tsc --noEmit` on every package |
| `pnpm build` | production builds |

## Project structure

```
apps/
  api/          NestJS: episodes module + rick-and-morty client, Jest tests
  web/          Next.js: features/{episodes,episode}, i18n, Vitest tests
packages/
  types/        Episode, EpisodeDetail, Character, Paginated
  tsconfig/     shared tsconfig presets
  eslint-config/
e2e/            Playwright specs
.github/workflows/ci.yml
```

Each web feature follows the same shape: `index.tsx` is the smart component (an async server component that fetches and prepares data), `data.ts` holds its props types and `Layout/` is the dumb client component with its styled-components.

## API

Base path: `/api/v1`

| Route | Response | Notes |
| --- | --- | --- |
| `GET /episodes?page=1&name=rick` | `Paginated<Episode>` | `name` filters by episode name and answers an empty page when nothing matches; 400 when `page` is not a number, 404 when it is out of range |
| `GET /episodes/:id` | `EpisodeDetail` | characters sorted by name, 404 when the episode does not exist |

Both routes send `Cache-Control: public, max-age=3600`.

## Decisions

- A BFF exists because the public API returns character URLs inside an episode, not the characters. Extracting the ids, batching, sorting and caching belong in one place, and that keeps the frontend free of orchestration.
- Characters are fetched in a single batch request (`/character/1,2,3`), so an episode with 60 characters costs 2 upstream calls instead of 61.
- Responses are cached in memory for one hour with Nest's `CacheInterceptor`. The content never changes, so this is safe. Redis would only make sense with more than one API instance.
- Smart/dumb components map onto server/client components: the smart one fetches on the server, the dumb one only renders and translates.
- next-intl handles routing (`/pt-BR`, `/en`), messages, plurals and date formatting. A test guarantees both locales have the same keys.
- There is no data fetching library on the client. Server components call the BFF with `fetch` and Next's data cache, and the `Cache-Control` header covers the browser.
- Search lives in the URL (`?q=`). Typing is debounced and navigates inside a React transition, so the server renders the result, the input keeps focus, every result page is cacheable and a search is shareable as a link.
- Themes are CSS variables toggled by a `data-theme` attribute, following the system preference by default. The choice is a cookie the layout reads on the server, so the page never flashes the other theme, switching re-renders nothing, and browsers with the View Transitions API reveal the new theme in a circle from the click.

## Testing

- `apps/api`: unit tests for the mapper, the service (sorting, single batch call) and the HTTP client (error mapping with nock), plus an integration test that boots the whole app and checks the routes, validation and cache behaviour.
- `apps/web`: component tests for both layouts, the pagination and the theme toggle, tests for the smart components with the API mocked, the API client and the message parity between locales.
- `e2e`: seven Playwright tests against the real API covering the list, pagination, search, the sorted character list, the language switch and the theme switch.

```bash
pnpm test
pnpm e2e
```

MIT
