# Contributing

Thanks for helping with the Socratic Bots frontend, the browser app that sits on the Socratic Bots
backend and DARE.

## Filing issues

- **Search first.** Check existing issues and confirm the problem reproduces on the latest `dev`.
- **Find the right service.** Note whether it involves the Socratic Bots backend, DARE or the voice
  runtime. Many frontend symptoms (failed login, no chat reply) come from backend configuration;
  the [quick start troubleshooting list](../docs/tutorials/quickstart.md#troubleshooting) covers
  the common ones.
- **Bug reports.** Include your OS, browser and version, Node version and backend versions;
  minimal numbered steps to reproduce; expected and actual behaviour with browser console errors
  and failed network requests (redact tokens); and screenshots or a recording for anything visual.
- **Feature requests.** Describe the problem for instructors or students, who it affects, and any
  constraints. Leave the implementation open.
- **Security issues.** Never open a public issue. See [SECURITY.md](SECURITY.md).

## Pull requests

### Branching

Fork the repository and branch from the latest `dev`. Pull requests target `dev`.

```bash
git checkout dev
git pull --ff-only origin dev
git checkout -b your-name/feature/short-description
```

Branch names follow `<author>/<feature|fix|refactor|docs>/<short-description>`.

### Before you open a PR

Run the checks (or the `check` skill). All of them pass on `dev`; keep it that way.

```bash
npm run lint
npm run format:check
npm test
npm run test:voice-contract
npm run build
```

- Follow [docs/reference/rules.md](../docs/reference/rules.md); its definition of done is the bar.
- Test the change in a browser against a local Socratic Bots backend and DARE. If you touched chat
  sockets, also run the browser-console regressions in [tests/README.md](../tests/README.md).
- If you change a socket payload or event, update
  [tests/SOCKET_CONTRACT.md](../tests/SOCKET_CONTRACT.md) and coordinate the matching DARE change.
- The Husky pre-commit hook runs Prettier and ESLint on staged files. Run Prettier only on files
  you changed (`npx prettier --write <files>`), never `npm run format`.

### PR description

- **What.** A short summary.
- **Why.** The motivation, with `Closes #123` if there is an issue.
- **How.** The approach and any non-obvious decisions.
- **Testing.** What you ran and what you clicked through.
- **Screenshots or recordings.** For any UI change.
- **Backend dependencies.** If the change needs a Socratic Bots backend or DARE change, link it
  and say which to deploy first.

### Review and merge

- At least one approving review from a maintainer.
- Squash-merge by default, so make the PR title a good commit message.

### Commit messages

`<type>: <summary>`, where type is `feat`, `fix`, `refactor`, `docs`, `test` or `chore`. Keep the
summary under 70 characters and use the body for context.

```
fix: keep the composer locked until the final chat message arrives
docs: list every environment variable in configuration.md
```

## Using AI coding agents

`AGENTS.md` holds the project instructions; `.claude/CLAUDE.md` imports it for Claude Code.
Procedures (`run-frontend`, `check`) live in `.agents/skills/`, with symlinks in `.claude/skills/`;
see [.agents/README.md](../.agents/README.md). Invoke one by name (`/run-frontend` in Claude
Code, `$run-frontend` in Codex). If you change how the app is run, built or tested,
update the matching skill in the same PR.

## Getting help

Open an issue (with a design sketch before a large change) or a draft PR and ask in the
description. For anything else, email vks@andrew.cmu.edu.
