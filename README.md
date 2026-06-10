# NEXA — AI Workforce Operating System

Marketing site **and** a working demo application (Command Center dashboard) backed by a
zero-dependency Node.js API.

## Run the full application (site + dashboard + API)

```bash
node server/server.js
```

Then open **http://localhost:4000**

- `http://localhost:4000/` — landing site
- `http://localhost:4000/signin.html` — sign in (demo: username `Kain`, password `Kain25`)
- `http://localhost:4000/command-center.html` — the live dashboard (requires sign-in)

The server serves the static site **and** the API on the same port, so login, the live
activity feed, workforce, operations, approvals, audit log, reports, marketplace installs,
connectors and schedules all run against real, persisted data.

## How it works

- **`server/server.js`** — HTTP server: serves the site and the `/api/*` endpoints.
- **`server/engine.js`** — the autonomy engine (commands, tasks, approvals, schedules, ROI).
- **`server/store.js`** — JSON persistence layer (data saved to `server/data/nexa.json`).
- **`server/connectors.js`** — connector status (runs in **sandbox** — no real accounts touched).
- **`assets/js/api.js`** — front-end API client. When the server is running it uses the live
  API; when the page is opened as a static file (e.g. GitHub Pages) it falls back to local
  demo data so the UI always works.

## API quick reference

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/login` | Authenticate (`{user, pass}` → `{ok, user, token}`) |
| GET  | `/api/state` | Company, connectors, workforce |
| GET  | `/api/workforce` · `/api/employee/:id` | Workforce + per-employee detail |
| GET  | `/api/activity?since=` | Live activity feed |
| GET  | `/api/intelligence` · `/api/roi` | Executive intelligence + ROI |
| GET/POST | `/api/tasks` · `/api/tasks/approve` · `/api/tasks/reject` | Human-in-the-loop approvals |
| POST | `/api/commands` | Run a natural-language command |
| GET/POST | `/api/marketplace` · `/api/workforce/install` | Marketplace + install employees |
| GET/POST | `/api/connectors` · `/api/schedules` | Connectors + schedules |
| GET  | `/api/audit` | Full audit log |
| POST | `/api/reset` | Reset demo data |

## Static hosting

The marketing pages are plain HTML/CSS/JS and host anywhere (GitHub Pages via `CNAME`).
The dashboard also works statically using the local-storage fallback; for the **real**
backend, run the Node server above.

## Demo credentials

`Kain` / `Kain25`
