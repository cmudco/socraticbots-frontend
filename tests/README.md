# Tests

Three kinds of checks live here: Vitest unit tests, the voice API contract tests, and manual
browser-console regressions for the chat sockets.

## Unit tests (Vitest)

```bash
npm test                                  # all tests/*.test.ts(x)
npx vitest run tests/voiceSession.test.ts # one file
npx vitest                                # watch mode
npm run test:voice                        # voice session + feedback suites only
```

Tests run in jsdom with Testing Library. They need no backend: network calls are mocked. Vitest
reads `vite.config.ts`, so the `@/` import alias works in tests.

| File                              | Covers                                                                        |
| --------------------------------- | ----------------------------------------------------------------------------- |
| `postLoginRedirect.test.ts`       | Returning to the original page after login or voice sign-up                   |
| `progressSocket.test.ts`          | Progress-tracking results on the chat socket, including conversation switches |
| `sessionOutcomeUI.test.tsx`       | The ending reason shown after a voice session                                 |
| `voiceApiContract.test.ts`        | Voice REST responses parsed against the shared contract                       |
| `voiceBrowserDiagnostics.test.ts` | Browser diagnostics sent during voice sessions                                |
| `voiceCompletion.test.ts`         | A voice exam counts as submitted only once it is persisted                    |
| `voiceFeedback.test.tsx`          | The speech-recognition backup (Whisper) control                               |
| `voiceLifecycle.test.ts`          | Connection-quality and permission handling                                    |
| `voiceSession.test.ts`            | Voice session recovery and ending                                             |
| `voiceStartupUI.test.tsx`         | Voice session startup states                                                  |

## Voice API contract

```bash
npm run test:voice-contract
```

This type-checks `src/` with the contract tests (`tsconfig.voice-contract.json`), then runs
`voiceApiContract.test.ts`. The test parses the payloads in `fixtures/voiceApiContract.json` with
the Zod schemas in `src/lib/voiceApiContract.ts`. The Socratic Bots backend has a matching fixture
(`backend/voice/fixtures/api_contract.json`) checked by its own contract tests. If you change a voice
API shape, update both fixtures in the same change.

## Chat socket regressions (manual, in the browser)

These scripts drive the real chat stores with the transport mocked, so they check what the app
sends to and accepts from DARE's `/chat` socket. They don't call a model.

1. Start the dev server: `npm run dev -- --port 5174`.
2. Open <http://localhost:5174> in a browser and open the devtools console. Sign in first for the
   message-details check.
3. Run the checks:

   ```js
   (await import('/tests/chat-wire-contract.js')).runChatWireContractChecks();
   await (await import('/tests/chat-socket-parity.js')).runChatSocketParityTests();
   await (await import('/tests/chat-socket-completion.js')).runChatSocketCompletionTests();
   (await import('/tests/message-details.tsx')).runMessageDetailsChecks();
   ```

| Script                      | Checks                                                                                                                        |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `chat-wire-contract.js`     | Payloads the signed-in and public stores emit, for each retrieval mode and model id format, plus socket auth                  |
| `chat-socket-parity.js`     | Both stores handle numeric and string ids, timestamps, streaming, completion, tool and context events, progress, and failures |
| `chat-socket-completion.js` | The composer unlocks when the final message arrives, for both stores                                                          |
| `message-details.tsx`       | The message-details control shows for creators only, and tracking prerequisites                                               |

Each script restores store state when it finishes. Use a throwaway local session anyway.

Run them whenever you change `src/stores/core/`, `src/services/socket.service.ts`,
`src/config/socket.config.ts`, or `src/utils/botChatPayload.ts`. The wire format they check is
documented in [SOCKET_CONTRACT.md](SOCKET_CONTRACT.md).
