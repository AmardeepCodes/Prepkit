# PrepKit AI — Backend

Step 1 of the backend: **Skeleton only.** No auth, no kits, no AI — just a
server that boots, connects to MongoDB, and answers a health check. Every
later feature (auth, kit CRUD, retrieval, generation...) gets built on top
of this and mounted in `src/app.js`.

## Run locally

You need MongoDB running locally (or a free MongoDB Atlas connection string).

```bash
npm install
cp .env.example .env
npm run dev
```

Then open `http://localhost:4000/health` — you should see:

```json
{ "status": "ok", "env": "development", "db": "connected" }
```

If `db` says `"disconnected"`, MongoDB isn't reachable — check `MONGODB_URI`
in `.env`.

## What each file does

- `server.js` — the only file that actually starts the server. Connects to
  the DB first, then calls `app.listen()`.
- `src/app.js` — builds the Express app: security headers, CORS, JSON
  parsing, session cookie, the `/health` route, and (commented out for now)
  where future feature routers get mounted.
- `src/config/env.js` — reads `.env` once, validates it, and exports plain
  values. Nothing else in the codebase should touch `process.env` directly.
- `src/config/db.js` — MongoDB connect/disconnect logic, and a `dbState()`
  helper the health check uses.
- `src/middlewares/errorHandler.js` — turns any thrown error into a
  consistent `{ error: { code, message } }` JSON response.

## Folders that exist but are empty on purpose

`src/models`, `src/routes`, `src/controllers`, `src/services`, `scripts`,
`tests` — these fill up one feature at a time, starting with Auth next.
