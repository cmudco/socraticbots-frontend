---
name: check
description: Run the Socratic Bots frontend's pre-PR checks — ESLint, Prettier, Vitest, the voice API contract, and the type-checked production build. Use before committing, before opening or updating a pull request, after a refactor, or when the user asks whether the frontend is green.
---

# Check the Socratic Bots frontend

Run these from the repo root. All of them pass on `dev`; a failure is yours to fix before the PR.

```bash
npm run lint                  # ESLint; errors fail, warnings are reported
npm run format:check          # Prettier
npm test                      # Vitest unit tests (tests/*.test.ts(x))
npm run test:voice-contract   # tsc -p tsconfig.voice-contract.json + voice contract tests
npm run build                 # tsc -b && vite build
```

`npm run build` is the real type check. It runs `tsc -b` over the project references and catches
errors `tsc --noEmit` misses. The "chunk larger than 500 kB" warning is expected.

## Fixing failures

- **Formatting**: format only the files you touched:

  ```bash
  npx prettier --write $(git diff --name-only --diff-filter=ACM origin/dev -- '*.ts' '*.tsx' '*.js' '*.json' '*.md' '*.css')
  ```

  Don't run `npm run format`; it rewrites the whole repo.

- **Lint**: `npx eslint <file> --fix` handles import order. `no-explicit-any` needs a real type,
  usually one from `src/types/` or the service.
- **Tests**: `npx vitest run tests/<file>` reruns one suite.

## Chat socket changes

If the diff touches `src/stores/core/`, `src/services/socket.service.ts`,
`src/config/socket.config.ts`, or `src/utils/botChatPayload.ts`, also run the browser-console
regressions with the dev server running (see `tests/README.md`):

```js
(await import('/tests/chat-wire-contract.js')).runChatWireContractChecks();
await (await import('/tests/chat-socket-parity.js')).runChatSocketParityTests();
await (await import('/tests/chat-socket-completion.js')).runChatSocketCompletionTests();
```

## Report

Say which commands ran and their results. Name any failure with the file and line, and don't call
the change ready until all five pass.
