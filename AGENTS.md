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

### Nova 2.0 (tables first — do not start a new app yet)
- Goal: a working salon desk, not a prettier portfolio. Keep the dark demo faces (`src/NovaDashboard.demo.tsx`, `src/NovaDashboard.v2.tsx`) unchanged.
- Do **not** add a light-theme React face / `VITE_APP_FACE=work` until the salon Google Sheet has been used for 1–5 real workdays. Progress of that decision lives in `prototypes/nova-2.0/ХОД_РАБОТЫ.md` (step 6 = `пауза`).
- Two documents, different jobs:
  - Project steps: `prototypes/nova-2.0/ХОД_РАБОТЫ.md` (and optional Google copy; paste the URL into that file when it exists).
  - Salon ops: CSV templates in `prototypes/nova-2.0/sheets/` to import into a **Google Sheet on the user's Drive**. How-to: `prototypes/nova-2.0/README.md`.
- `prototypes/nova-2.0/Nova_2.0_прототип.xlsx` is a structure backup only, not the working file. Do not commit cash/stock numbers.
