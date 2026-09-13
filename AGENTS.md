# Base44 Dev Environment — Zephyx Mail

## Stack
pnpm monorepo (`pnpm@11.21.0`, Node 24):
- `artifacts/api-server` — Express 5 API, Prisma 7 (PostgreSQL), Drizzle, BullMQ (Redis). Bundled with esbuild (`build.mjs`) to `dist/*.mjs`.
- `artifacts/novamail-web` — Vite 7 + React 19 SPA. Dev server with HMR.
- `lib/*` — workspace packages (`db`, `api-client-react`, `api-zod`, `api-spec`) consumed as TS source (no build step).

## Running
`docker compose -f docker-compose.base44.yml up -d`

Services: `postgres`, `redis`, `migrate` (one-shot Prisma migrate deploy), `api`, `web`.
- Web (Vite dev) is the public entry point on host **port 3000** and proxies `/api` → `http://api:5000` (single-origin wiring for cookie/session auth). Proxy target is configurable via the `API_PROXY_TARGET` env var (see `artifacts/novamail-web/vite.config.ts`).
- API runs on internal port 5000.

## Live reload
- **Web**: Vite HMR — edits to `artifacts/novamail-web/src` and `lib/*` appear live.
- **API**: no native watch mode. The `api` service rebuilds the esbuild bundle on (re)start. After editing API source, run `docker compose -f docker-compose.base44.yml restart api` then `reload_preview`.

## Credentials
- Local infra (Postgres/Redis) uses generated credentials inline in compose (`zephyx:zephyx`).
- App-internal JWT/session secrets are dev placeholders inline in compose.
- No external secrets are required to boot. Optional integrations (Gmail OAuth, SMTP, Gemini AI) degrade gracefully when unset. In `NODE_ENV=development` the API skips strict production secret validation (`validateProductionSecrets` returns early).
- If you later need an external secret (e.g. `GEMINI_API_KEY`), declare it via the platform secrets flow and add `env_file: /run/base44/app.env` to the relevant service — never inline.

## Notes / quirks
- The repo ships as a zip; source was extracted to the repo root.
- `Dockerfile.dev` installs the full workspace (cached layer) and generates the Prisma client; `node_modules` at each workspace package is preserved via anonymous volumes so the bind-mount of `./` over `/app` doesn't clobber installed deps.
- The Prisma client is committed at `artifacts/api-server/src/generated/prisma`; `prisma:generate` also runs a `normalize-prisma-generated.mjs` post-step (needs `artifacts/api-server/scripts`).
- The API's CORS allows any origin in development when `ALLOWED_ORIGINS` is empty.
- Vite `allowedHosts: true` accepts the preview's external hostname.
