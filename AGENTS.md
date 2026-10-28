# AGENTS.md

React 19 + TypeScript SPA for Socratic Bots, built with Vite and served on port 5174. It talks REST
to the Socratic Bots backend on port 8001 (every call goes through `src/utils/baseRequest.ts`),
Socket.IO `/chat` to the DARE backend on port 8000 for chat only, and WebRTC to the voice runtime
on port 8010. It never calls DARE's REST API.

Read and follow `docs/reference/rules.md` before changing code. Procedures live in `.agents/skills/`:
`run-frontend`, `check`.

## Commands

```bash
npm run dev -- --port 5174     # 5173 belongs to the DARE frontend
npm run lint
npm test                       # Vitest, tests/*.test.ts(x)
npm run test:voice-contract    # tsc on the voice contract + its tests
npm run build                  # tsc -b + vite build: the real type check
```

## Traps

- **Run on port 5174, not 5173.** DARE classifies chat traffic by the socket `Origin`, so DARE's
  `SOCRATIC_BOTS_FRONTEND_URL` must match this app's origin exactly.
- **Login works but every page bounces to `/login`?** The two backends do not share the same
  `SSO_JWT_KEY`. It is not a frontend bug.
- **`ai_stream` events carry the full text so far, not a delta.** Replace the message text; never
  append.
- **Message ids arrive as numbers or strings.** Normalize them at the store boundary in
  `src/stores/core/chatSocketCore.ts`.
- **Socket payloads are not camel-cased for you.** `send_message` uses camelCase routing keys and
  snake_case generation fields. `tests/SOCKET_CONTRACT.md` is the reference and DARE's validator
  the authority; a socket change needs a matching DARE change.
- **Anonymous public chats cannot use autonomous (agentic) retrieval.** The backend downgrades
  them to advanced; do not treat that as a frontend bug.
- **Voice has two providers.** `mistral_pipecat` (WebRTC to the voice runtime,
  `src/hooks/usePipecatWebRTCSession.ts`) and `elevenlabs` (`@elevenlabs/react`).
  `src/components/VoiceExam/VoiceInterface.tsx` picks by the agent's provider.
- **Verify with `npm run build`, not `tsc --noEmit`.** `tsc -b` checks more than `--noEmit`
  does; `--noEmit` can pass while the build fails.
- **Never run `npm run format`.** It is `prettier --write .` over the whole repo. lint-staged
  formats staged files on commit; format by hand only the files you touched
  (`npx prettier --write <files>`).
- **There is no CI.** The repo has no workflows. Run the `check` skill yourself.
