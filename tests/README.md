# Chat parity regression checks

With the frontend running locally, open its origin and run in the browser console:

```js
await (await import('/tests/chat-socket-parity.js')).runChatSocketParityTests()
```

The checks exercise both socket stores with numeric/string history IDs, original timestamps, stream completion, optimistic-message reconciliation, tool/context events, progress, failures, and stale conversation events. Store state is restored afterward. Use an isolated local session.

## Integration verification (2026-09-08)

Verified against local Socratic and DARE APIs with separate SQLite databases and a real Socket.IO connection:

- Signed-in login, conversation history, send, completion, second send, Stop, and persisted partial response.
- Public session creation, send, Stop, reload, failed generation, and subsequent successful send.
- All three retrieval selections save and survive editor reload. API tests also cover create/update/get/public-info persistence and access control.
- Agentic document search emits tool activity, returns a passage, continues the model turn, and survives reload.
- Advanced retrieval reaches DARE's shared pipeline; public Agentic selection uses the existing Advanced fallback.
- Context chips and original timestamps survive history reload.
- No browser console errors; production build and changed-file ESLint pass.

The provider and external document-search boundary used deterministic local fixtures. Authentication, routing, DTO construction, tool execution, sockets, serializers, database persistence, and UI were real. This does not validate live provider credentials, production vector indexes, or deployment configuration. DARE's full 770-test suite and Socratic backend's full 18-test suite passed.

Deploy the accompanying DARE changes and Socratic backend migration `bots.0016_bot_rag_mode` before this frontend. No deployment or merge was performed during verification.

## Message diagnostics and optional tracking (2026-09-09)

`await (await import('/tests/message-details.tsx')).runMessageDetailsChecks()` verifies the creator-only footer control, absence for subscribers/public viewers, removal of inline context, and tracking prerequisites. The socket regressions also check that stored snippets, retrieval traces, and web sources survive mapping.

Verified the drawer against real saved OOP responses: retrieval stages, 12 document snippets, tokens and cost remain available after reload. A real provider reply with tracking unconfigured completed without a learning-progress exception. The local stack uses the normal DARE PostgreSQL database and existing Socratic database. No invitation emails were sent. Code generation/redemption, duplicate use, capacity and subscriber restrictions are covered by the Socratic backend API suite (20 tests); DARE's full suite passes 774 tests.
