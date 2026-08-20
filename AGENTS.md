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

### App structure
- Single app, one entry point (`src/main.tsx` → `src/NovaDashboard.demo.tsx`). It has a login screen (Boris onboarding) and a full sidebar of sections (Dashboard, Kanban, Cash, Analytics, Sklad, Materials, Team chat, Cleaning, Community, Wiki, AI-Navigator, Security, and **Смена → Рабочий стол**).
- "Рабочий стол" (`src/components/WorkDeskPage.tsx` + `WorkTodayTab`/`WorkLoadersTab`/`WorkFittingsTab`) is the former standalone light "work" app, now merged in as a sidebar tab. It talks to `/api/work/*` (no JWT — local salon tool) via `src/api/work.ts`, backed by SQLite tables `work_*` inside `backend/data/nova.db`. Fittings use Info codes; suppliers are Rondo/Ladya, Partner, Vasilyevo/Ortus.
- There used to be a separate `work`/`v2` face split (`VITE_APP_FACE`); that's gone — everything lives in the one app now. If you see references to it elsewhere (e.g. `src/archive/`), that's historical.

### Database
- Migrations + seed: `cd backend && npm run setup` (migrate + seed; idempotent). Run `cd backend && npm run migrate` if `work_*` tables are missing.
- Seed users all use password `demo123` (see `backend/seeds/01_demo_data.js`). Do not commit live cash/stock numbers if they are personal salon data.

### Lint / test / build (standard scripts, see `package.json`)
- Lint: `npm run lint` (ESLint; note it runs with `--fix`).
- Test: `npm test` (Vitest + jsdom) — all tests pass.
- Build: `npm run build` (or `npm run build:demo`, kept as an alias for the Vercel build command).
