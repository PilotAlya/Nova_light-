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

### App faces
- `npm run dev` / `npm run dev:work` loads **Nova 2.0 work desk** (`VITE_APP_FACE=work`, light UI in `src/work/`). Open `http://localhost:5180/`. Needs backend on `3002`. Work API is `/api/work` (no JWT — local salon tool). Data is in SQLite tables `work_*` inside `backend/data/nova.db`.
- `npm run dev:demo` — recruiter portfolio (login + Boris). Do not change that face while building work.
- `npm run dev:v2` — previous dark dashboard. The v2 UI does not perform a real backend login; `/api/leads-v2` needs `Authorization: Bearer` from `POST /api/auth/login` (`admin@nova.ru` / `demo123`).

### Database
- Migrations + seed: `cd backend && npm run setup` (migrate + seed; idempotent). After pulling work-app changes, run migrate so `work_*` tables exist: `cd backend && npm run migrate`.
- Seed users all use password `demo123` (see `backend/seeds/01_demo_data.js`). Do not commit live cash/stock numbers if they are personal salon data.

### Lint / test / build (standard scripts, see `package.json`)
- Lint: `npm run lint` (ESLint; note it runs with `--fix`). The repo currently has pre-existing lint errors/warnings unrelated to environment setup.
- Test: `npm test` (Vitest + jsdom). NOTE: `src/test/Sidebar.test.tsx` has pre-existing failures (test expects tab `analytics` but the component now emits `reports`); this is test/code drift, not an environment problem.
- Build: `npm run build` uses current vite mode; work face: `npm run build:work`.

### Nova 2.0 work desk
- Light salon app: Сегодня, Касса, Грузчики, Фурнитура, Заявки. Fittings with Info codes; suppliers Rondo/Ladya, Partner, Vasilyevo/Ortus. Orders are rows with `order_qty > 0` grouped by supplier.
- Google/Excel prototypes in `prototypes/nova-2.0/` are archive only — the live product is the work app.
