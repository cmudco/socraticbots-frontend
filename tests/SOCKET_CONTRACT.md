# DARE / Socratic chat contract audit — 2026-09-09

Compared Socratic frontend #83 with DARE frontend `d234d8014f1904adb5df6496a0d68a290f798f61` and DARE backend #349 (`7ab8735`). This checks the common chat protocol, not complete feature equivalence between the products.

## Wire contract

| Area                  | Contract / result                                                                                                                                                                                                                                                |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Transport             | Both Socket.IO `/chat`, path `/socket.io/`, websocket then polling; authenticated connection uses `auth.token`.                                                                                                                                                  |
| Public authentication | Socratic additionally uses `auth.sessionId` + `auth.conversationId`; auto-subscribed by backend. Platform comes from Origin, not a client flag.                                                                                                                  |
| Rooms                 | `subscribe_conversation` / `unsubscribe_conversation` with camelCase `conversationId`; active room is injected by both Socratic adapters.                                                                                                                        |
| Send                  | `send_message`; camelCase routing key, snake_case generation fields. Socket payloads do **not** receive REST's automatic request-key conversion.                                                                                                                 |
| Attachments           | `images: [{ preview, name, type }]` on `send_message` (data URLs, image/\* only, ≤10 MB, ≤6). DARE stores each as a message file; echo and history return them under `files` with `mediaType: 'image'`, rendered from `file` resolved against the socket origin. |
| Models                | `model_id` opaque string: database ID or `litellm:<key>:<model>`; do not coerce to number. `progress_llm_id` follows the same model contract.                                                                                                                    |
| Retrieval             | `rag_mode`: `naive`, `advanced`, `agentic`; `embedding_ids`, `file_owner_id`, `max_context_snippets`, `document_similarity_threshold`. Zero threshold preserved.                                                                                                 |
| Socratic extension    | `bot_meta` contains title/subject/topic/chat_prompt/tracking_prompt/learning_goals; `is_advanced` is teaching style, independent of retrieval. `enable_progress` requires configured model, goals and prompt.                                                    |
| Replies               | `message` envelope with `type`; `message` final/full state, `ai_stream` cumulative replacement text (not append). Numeric/string message IDs normalized at Socratic UI boundary. Final `streaming:false` releases composer.                                      |
| Stop                  | `stop_generation` with `conversationId` (DARE may additionally send `messageId`); acknowledgement is not the saved partial reply. Final message supplies persisted content.                                                                                      |
| Acknowledgements      | Success is `{success:true}`; failures may be `{error:...}` with no `success` field.                                                                                                                                                                              |
| Diagnostics           | camelCase `contextTrace`, `retrievalTrace`, `snippets`, `webSearchSources`, `toolCalls`, `inputTokens`, `outputTokens`; cost can be a decimal string or null. Persisted model is `llm`, not only `llmId`; history can use `sender` rather than `senderName`.     |
| Tool events           | `tool_call_pending`, `tool_call_args_progress`, `tool_call_executing`, `tool_call_result`, correlated by `messageId`/`toolCallId`; typed result slots `dareResult`/`mcpResult`/`providerResult`.                                                                 |
| Edit/regenerate       | DARE UI uses edit `{messageId}` and regenerate `{message_id}`. Socratic has service methods but no equivalent editing/regeneration UI flow; do not claim these journeys were tested there.                                                                       |

## Changes made during audit

- Replaced separate public/authenticated payload construction with `buildBotChatPayload`; both adapters inject their current conversation ID.
- Replaced stale duplicate public auth type with the configuration source; corrected optional acknowledgement success, nullable/string cost and bot metadata/retrieval declarations.
- Both message stores retain the same received diagnostics and map persisted sender/model fields. The details button remains creator-only; storing fields already returned by the server does not grant new API access.

## Intentional differences and remaining maintenance work

DARE uses Redux and a richer request builder for attachments, memory, artifacts, MCP, ensemble and other DARE features. Socratic uses Zustand, bot configuration and optional learning progress. Anonymous Agentic is downgraded to Advanced by the backend. DARE normally loads history over REST; Socratic uses socket history. Socratic retries reconnects indefinitely with up to 30-second delay; the inspected DARE frontend permits two attempts with up to two-second delay. Socratic Stop has a ten-second acknowledgement timeout; DARE's inspected handler logs a negative acknowledgement. These lifecycle policies differ; this audit does not silently change them.

The two frontend repositories do not import a shared protocol package. Future socket changes still require updating both; matching today does not automatically prevent future drift. The backend validator/formatter and tool event emitter are the wire authority. A versioned/generated shared contract is a useful separate follow-up.

For a socket change, update the backend parser/formatter, DARE thunks/middleware/reducers and Socratic payload builder/types/shared core together. Replay the same send and response fixtures against both consumers; verify finalization, cancellation, reconnect/history, errors and diagnostics. Add public-session and optional tracking cases for Socratic.

## Verification

Run on the local Socratic Vite origin:

```js
(await import('/tests/chat-wire-contract.js')).runChatWireContractChecks();
await (await import('/tests/chat-socket-parity.js')).runChatSocketParityTests();
```

The wire test captures both actual Socratic store adapters with transport mocked: six combinations of retrieval modes and database/LiteLLM IDs, stale-room protection, zero threshold, nested tracking and connection auth. Captured frames were replayed through DARE's real `MessageValidationService` and `LLMQueryRequestBuilder` for 12 authenticated/public cases. No external model calls occur in this contract check. The response regression verifies numeric/string IDs, completion/next send, errors, persisted sender/model/decimal cost and diagnostics in both stores. Build and changed-file lint pass. DARE frontend was inspected at the commit above; a new full DARE browser journey was not run for this audit.

## PR handover

Core integration targets, all based on dev:

1. [DARE backend #349](https://github.com/cmudco/dare-backend/pull/349)
2. [Socratic backend #68](https://github.com/cmudco/socraticbots-backend/pull/68), including migration `bots.0016_bot_rag_mode`
3. [Socratic frontend #83](https://github.com/cmudco/socraticbots-frontend/pull/83)

Deploy both backends before frontend. These are integration targets, not evidence of production deployment.

Superseded: frontend #60/#61/#62/#63 by #83, backend #52/#53 by #68, DARE #348 by #349. Backend heads are ancestors of the integration heads. Frontend patches are equivalent; the foundation patch differs only in its rebase context around the numeric-ID hotfix, whose guard is retained in the shared core.

Keep separate: frontend #77 and backend #64 (voice-provider retirement), frontend #44 (audio saving; old branch needs reconciliation), frontend #47 and backend #41 (documentation), backend #50 (account deletion), backend #51 (internal throttling, targets main). These are not included simply because the chat integration is complete. Frontend #64 and backend #54 are old main/dev sync PRs with multiple merge bases; review their merge resolutions separately rather than closing or deploying them as duplicate chat work.
