# Socratic Bots Frontend — Quick Start

Run the web app locally against a local backend. To deploy it, see [docs/how-to/deploy.md](../how-to/deploy.md).

This guide covers the frontend only. The app is useless without the Socratic Bots backend and DARE
behind it, so if those aren't running yet, start with the
[full-stack quick start](https://github.com/cmudco/socraticbots-backend/blob/dev/docs/tutorials/quickstart.md),
which brings up all the services in order and ends by pointing back here.

## Prerequisites

| Requirement           | Version | Notes                                                         |
| --------------------- | ------- | ------------------------------------------------------------- |
| Node.js               | 20+     | Vitest 4 needs Node 20 or newer. Node 22 is what we use.      |
| npm                   | 10+     | Ships with Node 20+.                                          |
| Socratic Bots backend | —       | Running on `http://localhost:8001`                            |
| DARE backend          | —       | Running on `http://localhost:8000`, with Redis for Socket.IO  |
| voice-agent-runtime   | —       | Optional. Only for voice exams with the Mistral/Pipecat voice |

## 1. Install

```bash
git clone https://github.com/cmudco/socraticbots-frontend.git
cd socraticbots-frontend
npm ci
```

`npm ci` installs exactly what `package-lock.json` pins. It also installs the Husky pre-commit hook.

## 2. Configure

```bash
cp .env.example .env
```

The defaults point at the standard local ports, so you usually don't need to change anything:

| Variable                 | Default                     | Points at                                |
| ------------------------ | --------------------------- | ---------------------------------------- |
| `VITE_API_URL`           | `http://localhost:8001/api` | Socratic Bots backend REST API           |
| `VITE_DARE_SOCKET_URL`   | `http://localhost:8000`     | DARE backend, for chat over Socket.IO    |
| `VITE_DARE_FRONTEND_URL` | `http://localhost:5173`     | DARE web app, for billing hand-off links |

Every variable, including the optional Sentry ones, is in
[docs/reference/configuration.md](../reference/configuration.md). `VITE_*` values are compiled into the browser bundle:
never put secrets in them.

## 3. Run

```bash
npm run dev -- --port 5174
```

Open <http://localhost:5174>. Vite hot-reloads on save.

Use port 5174. Vite's default, 5173, is where the DARE frontend runs, and DARE tells the two apps
apart by their origin. The Socratic Bots backend allows `http://localhost:5174` for CORS out of the
box.

## 4. Sign in

Accounts live in DARE. You have three ways in:

- **Log in with an existing DARE account** on `/login`. The Socratic Bots backend creates its local
  copy of the user on first login.
- **Register** on `/register` with an access code. The code is an access code group created in the
  DARE admin (`http://localhost:8000/admin/`). The group's default role decides whether the new
  account is a student or a creator.
- **Use the DARE superuser** you created while setting up DARE.

Building tutors needs a creator role (`CREATOR`, `RESEARCHER`, `SUPERVISOR`, or `SUPERADMIN`). Set
`platform_role` on the user in the DARE admin if your account only sees the student views.

## 5. Verify it works

1. After login you land on **Home**. The sidebar shows Subscription Codes, Chatbot Groups, Chat,
   Voice Assignments, and Settings; creators also see **Bot Access**.
2. As a creator, open **Chatbot Groups**, create a group and a bot, pick a model, and save.
3. Open the bot in **Chat** and send a message. A streaming reply means the Socket.IO connection to
   DARE works and DARE has a working model and wallet.

## Checks before you commit

```bash
npm run lint
npm run format:check
npm test
npm run test:voice-contract
npm run build
```

## Troubleshooting

| Symptom                                                    | Likely cause and fix                                                                                                                                                                         |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Every request fails with a network or CORS error           | The Socratic Bots backend isn't on `:8001`, or the app isn't on `:5174`. Check `VITE_API_URL` and the port you started Vite on.                                                              |
| Login succeeds but you're bounced back to `/login`         | The Socratic Bots backend can't verify DARE's tokens. `SSO_JWT_KEY` must be set and identical in both backends. See the backend quick start.                                                 |
| Messages send but no reply streams                         | The chat socket can't reach DARE, or DARE can't run the model. Check `VITE_DARE_SOCKET_URL`, that DARE runs under uvicorn (not `runserver`) with Redis up, and that DARE has a provider key. |
| Chat works in the DARE app but replies here look like DARE | DARE identifies Socratic Bots by origin. DARE's `SOCRATIC_BOTS_FRONTEND_URL` must be `http://localhost:5174`.                                                                                |
| Voice exam won't start                                     | Voice needs the voice runtime on `:8010` and `VOICE_RUNTIME_PUBLIC_URL` set on the Socratic Bots backend. See the voice-agent-runtime README.                                                |
| Changed `.env` but nothing changed                         | Vite reads `.env` at startup. Restart `npm run dev`.                                                                                                                                         |
| `npm test` fails to start                                  | Node is older than 20. Run `node -v`.                                                                                                                                                        |
