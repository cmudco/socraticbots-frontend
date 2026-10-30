---
name: run-frontend
description: Start the Socratic Bots frontend locally — Vite dev server on port 5174 against the Socratic Bots backend (:8001) and DARE (:8000). Use when the user wants to run, start, serve, or preview the Socratic Bots web app, or asks why the app on :5174 shows errors, won't log in, or gets no chat replies.
---

# Run the Socratic Bots frontend

A Vite + React app. It needs two backends already running:

- **Socratic Bots backend** on `http://localhost:8001` (all REST calls)
- **DARE backend** on `http://localhost:8000` with Redis (chat over Socket.IO `/chat`)

If they aren't up, start them first; the backend repo's `docs/tutorials/quickstart.md` has the full-stack order.
Check quickly:

```bash
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:8001/api/users/user-info/   # 401 or 403 = up
curl -s http://localhost:8000/api/health/
```

## Start it

```bash
node -v                      # must be 20+
npm ci                       # only if node_modules is missing or package-lock.json changed
[ -f .env ] || cp .env.example .env
npm run dev -- --port 5174 --strictPort
```

Always use port 5174. 5173 is the DARE frontend, and DARE tells the two apps apart by origin.
`--strictPort` fails instead of silently moving to another port.

### From an agent session

Detach it so it outlives the session:

```bash
nohup npm run dev -- --port 5174 --strictPort > /tmp/sb-frontend.log 2>&1 & disown
lsof -ti tcp:5174            # should print a PID
tail -n 20 /tmp/sb-frontend.log
```

## Verify

Open <http://localhost:5174>. Signed out, `/` shows the landing page. After login the sidebar shows
Home, Subscription Codes, Chatbot Groups, Chat, Voice Assignments, and Settings (creators also get
Bot Access). Open a bot in Chat and send a message; a streaming reply proves the DARE socket works.

## When it doesn't work

| Symptom                                 | Cause                                                                                   |
| --------------------------------------- | --------------------------------------------------------------------------------------- |
| Network or CORS errors on every request | Socratic Bots backend not on `:8001`, or app not on `:5174`                             |
| Login succeeds, then back to `/login`   | `SSO_JWT_KEY` differs between the Socratic Bots backend and DARE                        |
| Message sends, no reply                 | DARE socket unreachable, DARE not under uvicorn, Redis down, or no provider key in DARE |
| `.env` change ignored                   | Restart the dev server; Vite reads env at startup                                       |

## Stop it

```bash
lsof -ti tcp:5174 | xargs kill
```

## Related

- `check` — lint, format, tests, and build before a PR.
- `README.md` and `docs/tutorials/quickstart.md` for the overview and full setup.
