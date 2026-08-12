# AGENTS.md

## Cursor Cloud specific instructions

Nova Dashboard ("Рэлан") is a furniture-salon CRM. It has two parts that run together in development:

- Frontend: React 18 + Vite + TypeScript + Tailwind, served on port `5180` (not the Vite default `5173`, to avoid clashing with other local projects). Vite proxies `/api` → `http://localhost:3002` (see `vite.config.ts`).
- Backend: Express + Knex + `better-sqlite3` API on port `3002` (`backend/`), with the SQLite database at `backend/data/nova.db` (committed to the repo).
- There is also an Electron wrapper (`electron/`) and a Vercel serverless variant (`api/index.js`); neither is needed for normal local development.

The update script installs both root and `backend/` dependencies. It does NOT run DB migrations/seeds or start servers — do those yourself as needed (they are not part of automatic startup).

### Running the app (two dev servers)
- Backend: `cd backend && npm run dev` (uses `node --watch`, prints `Nova API running on http://localhost:3002`).
- Frontend: `npm run dev` (from repo root). Open `http://localhost:5180/`.
- Run each in its own long-lived process (e.g. separate tmux sessions); the frontend needs the backend on `3002` for live API data.

### App faces / login (non-obvious)
- `src/main.tsx` picks a "face" from `VITE_APP_FACE`: default is `v2`, an OPEN DEMO with no login wall — `http://localhost:5180/` loads straight into the dashboard. `VITE_APP_FACE=demo` (`npm run dev:demo`) shows the recruiter login screen instead.
- The `v2` UI does not perform a real backend login, so no JWT is stored. Auth-protected endpoints like `/api/leads-v2` return `Требуется авторизация` without a token; the UI degrades gracefully to seed/localStorage data. This is expected — the CRM (e.g. creating a lead in the kanban) still works end-to-end in the UI.
- To exercise the real backend directly, log in via `POST /api/auth/login` with a seeded user (`admin@nova.ru` / `demo123`) and send the returned token as `Authorization: Bearer <token>`.

### Database
- Migrations + seed: `cd backend && npm run setup` (migrate + seed; idempotent). Seed users all use password `demo123` (see `backend/seeds/01_demo_data.js`).

### Lint / test / build (standard scripts, see `package.json`)
- Lint: `npm run lint` (ESLint; note it runs with `--fix`). The repo currently has pre-existing lint errors/warnings unrelated to environment setup.
- Test: `npm test` (Vitest + jsdom). NOTE: `src/test/Sidebar.test.tsx` has pre-existing failures (test expects tab `analytics` but the component now emits `reports`); this is test/code drift, not an environment problem.
- Build: `npm run build` (`tsc -b && vite build`).
