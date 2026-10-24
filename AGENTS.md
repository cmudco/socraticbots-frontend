# AGENTS.md

Guidance for AI coding agents working in the Socratic Bots frontend. Codex and other tools that
follow the `AGENTS.md` convention read this file directly; Claude Code reads it through the import
in `CLAUDE.md`.

Task procedures (running the app, pre-PR checks) are skills in `.agents/skills/`. See
`.agents/README.md` for how that directory works.

Before changing code, read and follow `rules.md`.

## What this app is

The React single-page app for Socratic Bots: instructors build AI tutors (bots) that teach with
questions, share them with students through access codes or public links, and run spoken voice
exams. It owns no data. It talks to:

| Service                                 | How                                              | Env var                          |
| --------------------------------------- | ------------------------------------------------ | -------------------------------- |
| Socratic Bots backend (Django, `:8001`) | REST, every call via `src/utils/baseRequest.ts`  | `VITE_API_URL` (includes `/api`) |
| DARE backend (`:8000`)                  | Socket.IO namespace `/chat`, for chat only       | `VITE_DARE_SOCKET_URL`           |
| voice-agent-runtime (`:8010`)           | WebRTC + HTTP audio, signed URL from the backend | none                             |
| DARE frontend (`:5173`)                 | Billing hand-off link only                       | `VITE_DARE_FRONTEND_URL`         |

There are no direct DARE REST calls. Books and chapters no longer exist; the model is bot groups →
bots.

## Commands

```bash
npm ci                         # install (Node 20+)
cp .env.example .env           # defaults match the local ports
npm run dev -- --port 5174     # 5173 belongs to the DARE frontend
npm run lint
npm run format:check
npm test                       # Vitest, tests/*.test.ts(x)
npm run test:voice-contract    # tsc on the voice contract + its tests
npm run build                  # tsc -b && vite build; stricter than tsc --noEmit
```

Run Prettier only on files you changed (`npx prettier --write <files>`). `npm run format` rewrites the
whole repo and buries the diff.

## Layout

| Path                                                            | Contents                                                                                                                                              |
| --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/App.tsx`                                                   | All routes. Protected routes sit under `ProtectedRoute` + `Layout`.                                                                                   |
| `src/pages/`                                                    | Route-level pages (`BotEditPage`, `Chat`, `PublicBotChat`, `VoiceExams/`, ...)                                                                        |
| `src/components/ui/`                                            | shadcn/ui components (Radix + CVA + Tailwind)                                                                                                         |
| `src/components/<feature>/`                                     | Feature components: `bots/`, `botGroups/`, `chat/`, `VoiceExam/`, `voice-agents/`, `wallet/`, `settings/`, `sidebar/`                                 |
| `src/services/*.service.ts`                                     | REST clients, one per backend area                                                                                                                    |
| `src/hooks/queries/`                                            | TanStack Query hooks around the services                                                                                                              |
| `src/stores/core/`                                              | Chat stores: `websocketStore` (signed in), `publicWebSocketStore` (public bots), shared `chatSocketCore`, plus conversation, notes, attachment stores |
| `src/stores/ui/`, `src/stores/forms/`                           | UI and multi-step form state                                                                                                                          |
| `src/config/socket.config.ts`, `src/services/socket.service.ts` | Socket.IO connection to DARE                                                                                                                          |
| `src/utils/botChatPayload.ts`                                   | Builds the `send_message` payload from bot settings                                                                                                   |
| `src/hooks/usePipecatWebRTCSession.ts`                          | Mistral/Pipecat voice session client                                                                                                                  |
| `src/lib/`                                                      | `config.ts`, `sentry.ts`, voice lifecycle and contract helpers                                                                                        |
| `src/types/`, `src/schemas/`                                    | TypeScript types and Zod schemas                                                                                                                      |
| `tests/`                                                        | Vitest suites and browser-console chat regressions                                                                                                    |

## Conventions

- **REST**: add a method to the relevant `src/services/*.service.ts` using `baseRequest`, then a
  TanStack Query hook in `src/hooks/queries/`. Components use the hook. The backend uses camelCase
  JSON (DRF camel-case renderer), so TypeScript types are camelCase.
- **Sockets**: socket payloads are not camel-cased automatically. `send_message` uses camelCase
  routing keys and snake_case generation fields. `tests/SOCKET_CONTRACT.md` is the reference; DARE's
  validator is the authority. Socket changes need a matching DARE change.
- **State**: server data in TanStack Query; streaming and UI state in Zustand. Don't duplicate
  server data into Zustand.
- **Auth**: `access_token` in `localStorage`, sent as `Bearer` by `baseRequest` and as `auth.token`
  on the socket. Token refresh is disabled; expiry means re-login.
- **Roles**: the user payload has `isCreator` and `platformRole`. Creator-only navigation is in
  `src/types/navigation.ts`. The backend enforces permissions; UI gating is cosmetic.
- **Forms**: new forms use React Hook Form + Zod. Older forms use Formik + Yup; don't mix both in one
  form.
- **Styling**: Tailwind 4 with theme tokens (`bg-primary`, `text-muted-foreground`). No hard-coded
  accent colours. Bot chat themes live in `src/themes/`.
- **Types**: no `any` (ESLint errors on it). Prefer types exported from `src/types/` or the service.
- **Env**: only `VITE_*` variables exist. Never put secrets in them.

## Gotchas

- Port 5174, not 5173. DARE classifies chat traffic by the socket `Origin`; DARE's
  `SOCRATIC_BOTS_FRONTEND_URL` must match the Socratic Bots origin.
- Login works but every page bounces to `/login`: the two backends don't share the same
  `SSO_JWT_KEY`. Not a frontend bug.
- `ai_stream` events carry the full text so far, not a delta. Replace, don't append.
- Message ids arrive as numbers or strings; normalize at the store boundary (`chatSocketCore`).
- Anonymous public chats can't use autonomous (agentic) retrieval; the backend downgrades them.
- Voice has two providers: `mistral_pipecat` (WebRTC to the voice runtime) and `elevenlabs`
  (`@elevenlabs/react`). `VoiceInterface.tsx` picks by the agent's provider.
