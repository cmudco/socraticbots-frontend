# Contributing to the Socratic Bots Frontend

Thanks for your interest in contributing. This guide covers issues, pull requests, and the checks
we expect to pass.

## Filing issues

Before opening an issue:

1. Search existing issues to avoid duplicates.
2. Check that the problem reproduces on the latest `dev`.
3. Note whether it involves the Socratic Bots backend, DARE, or the voice runtime. Many frontend
   symptoms (failed login, no chat reply) come from backend configuration; the
   [QUICKSTART troubleshooting table](../docs/tutorials/quickstart.md#troubleshooting) covers the common ones.

### Bug reports

Include:

- **Environment**: OS, browser and version, Node version, and which backend versions you run.
- **Steps to reproduce**: minimal and numbered.
- **Expected** and **actual** behaviour, with browser console errors and failed network requests
  (redact tokens).
- **Screenshots or a recording** for anything visual.

### Feature requests

Describe the problem for instructors or students, who it affects, and any constraints. Leave the
implementation open.

### Security issues

Do **not** open public issues for vulnerabilities. See [.github/SECURITY.md](SECURITY.md).

## Pull requests

### Before opening a PR

1. Fork the repository and branch from the latest `dev`:

   ```bash
   git checkout dev
   git pull --ff-only origin dev
   git checkout -b your-name/feature/short-description
   ```

   Branch names follow `<author>/<feature|fix|refactor|docs>/<short-description>`. Pull requests
   target `dev`.

2. Run the checks. All of them pass on `dev`; keep it that way.

   ```bash
   npm run lint
   npm run format:check
   npm test
   npm run test:voice-contract
   npm run build
   ```

   `npm run build` runs `tsc -b`, which type-checks more than your editor may. Run it, not just
   `tsc --noEmit`.

3. Test the change in a browser against a local Socratic Bots backend and DARE. If you touched chat
   sockets, also run the browser-console regressions in [tests/README.md](../tests/README.md).

4. If you change a socket payload or event, update [tests/SOCKET_CONTRACT.md](../tests/SOCKET_CONTRACT.md)
   and coordinate the matching change in DARE.

The Husky pre-commit hook runs Prettier and ESLint on staged files. Run Prettier only on files you
changed (`npx prettier --write <files>`), not `npm run format` across the repo, so your diff stays
reviewable.

### What to put in the PR

- **What**: a short summary.
- **Why**: the motivation, with `Closes #123` if there's an issue.
- **How**: the approach and any non-obvious decisions.
- **Testing**: what you ran and what you clicked through.
- **Screenshots or recordings** for any UI change.
- **Backend dependencies**: if the change needs a Socratic Bots backend or DARE change, link it and
  say which to deploy first.

### Review and merge

- At least one approving review from a maintainer.
- Squash-merge by default, so make the PR title a good commit message.

## Coding standards

[docs/reference/rules.md](../docs/reference/rules.md) is the full standard. The short version:

- TypeScript everywhere. No `any`; ESLint enforces it.
- REST calls go through a service in `src/services/` built on `baseRequest`, wrapped in a TanStack
  Query hook in `src/hooks/queries/`. Never call `axios` or `fetch` against the backend from a
  component.
- Chat goes through the Socket.IO stores in `src/stores/core/`. Don't open extra sockets.
- Use the shadcn/ui components in `src/components/ui/` and theme tokens (`bg-primary`,
  `text-muted-foreground`, ...) rather than hard-coded colours.
- Never put secrets in `VITE_*` variables.

### Commit messages

`<type>: <summary>`, where type is `feat`, `fix`, `refactor`, `docs`, `test`, or `chore`. Keep the
summary under 70 characters and use the body for context.

```
fix: keep the composer locked until the final chat message arrives
```

## Using AI coding agents

This repo ships shared configuration for AI coding agents, so an agent pointed at a fresh clone
already knows how to run the app and check a change.

| File                             | What it is                                                                      |
| -------------------------------- | ------------------------------------------------------------------------------- |
| `AGENTS.md`                      | Project instructions. Read by Codex and other tools that follow the convention. |
| `.claude/CLAUDE.md`              | Imports `AGENTS.md`, plus any Claude Code-specific notes.                       |
| `.agents/skills/<name>/SKILL.md` | Task procedures: `run-frontend`, `check`.                                       |
| `.claude/skills/<name>`          | Symlinks to the above, because Claude Code scans a different path.              |

Invoke a skill by name (`/run-frontend` in Claude Code, `$run-frontend` in Codex) or describe the
task and let the agent pick the skill. Edit skills under `.agents/skills/`; the symlinks need no
change. See [.agents/README.md](../.agents/README.md), including the Windows symlink note.

Treat these files like code. If you change how the app is run, built, or tested, update the matching
skill in the same PR.

## Getting help

Open a draft PR and ask in the description, or open an issue with a design sketch before starting a
large change. For anything else, email vks@andrew.cmu.edu.
