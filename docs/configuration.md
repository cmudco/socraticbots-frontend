# Configuration

The frontend reads a handful of Vite environment variables. Copy `.env.example` to `.env` for local
development, or to `.env.production` before a production build.

Vite compiles `VITE_*` values into the JavaScript bundle at build time. That has two consequences:

- Everything in them is public. Never put API keys, internal service keys, or other secrets here.
- Changing a value requires a restart (`npm run dev`) or a rebuild (`npm run build`).

## Variables

| Variable                  | Default                                   | Required           | What it does                                                                                                                                                | Read in                                  |
| ------------------------- | ----------------------------------------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| `VITE_API_URL`            | `http://localhost:8001/api`               | Yes, in production | Base URL of the Socratic Bots backend REST API, including `/api`. Every REST call is `${VITE_API_URL}/<path>`.                                              | `src/lib/config.ts`                      |
| `VITE_DARE_SOCKET_URL`    | `http://localhost:8000`                   | Yes, in production | DARE backend origin. Chat connects to `${VITE_DARE_SOCKET_URL}/chat` over Socket.IO (path `/socket.io/`). A trailing slash is stripped.                     | `src/config/socket.config.ts`            |
| `VITE_DARE_FRONTEND_URL`  | `http://localhost:5173`                   | No                 | DARE web app origin. Used for the "manage in DARE" billing link in the wallet drawer (`${VITE_DARE_FRONTEND_URL}/billing/`).                                | `src/components/wallet/WalletDrawer.tsx` |
| `VITE_SENTRY_DSN`         | unset (Sentry off)                        | No                 | Sentry DSN for production builds. Enables error reporting, tracing at 20%, and session replay with all text, inputs, and media masked.                      | `src/lib/sentry.ts`                      |
| `VITE_LOCAL_SENTRY_DSN`   | unset (Sentry off)                        | No                 | Sentry DSN used only by `npm run dev`. Keeps local errors out of the production project. Local events are stripped to a minimal payload and have no replay. | `src/lib/sentry.ts`                      |
| `VITE_SENTRY_ENVIRONMENT` | Vite mode (`development` or `production`) | No                 | Environment tag on Sentry events.                                                                                                                           | `src/lib/sentry.ts`                      |

## What is not configured here

| Setting                  | Where it comes from                                                                                                                      |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Voice runtime URL        | The Socratic Bots backend returns a signed URL per voice session (`VOICE_RUNTIME_PUBLIC_URL` on the backend).                            |
| WebRTC STUN/TURN servers | Sent by the Socratic Bots backend with the voice session (`VOICE_RUNTIME_ICE_SERVERS` on the backend).                                   |
| Models, wallets, prices  | Fetched from the Socratic Bots backend, which reads them from DARE.                                                                      |
| Dev server port          | Not set in `vite.config.ts`. Pass `-- --port 5174` to `npm run dev`; 5173 is the DARE frontend's port.                                   |
| Allowed origins          | Configured on the backends, not here. See the frontend [DEPLOYMENT.md](../DEPLOYMENT.md#3-configure-the-other-services-for-this-origin). |

## Local example

```bash
VITE_API_URL=http://localhost:8001/api
VITE_DARE_SOCKET_URL=http://localhost:8000
VITE_DARE_FRONTEND_URL=http://localhost:5173
```

## Production example

```bash
VITE_API_URL=https://sb-api.example.org/api
VITE_DARE_SOCKET_URL=https://dare-api.example.org
VITE_DARE_FRONTEND_URL=https://dare.example.org
VITE_SENTRY_DSN=https://<key>@<org>.ingest.sentry.io/<project>
VITE_SENTRY_ENVIRONMENT=production
```
