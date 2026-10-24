# Changelog

All notable changes to the Socratic Bots frontend are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). The project will
use semantic versioning once public releases begin.

## [Unreleased]

### Documentation

- Rewrote the README for the open-source release: what Socratic Bots is, how the frontend talks to
  the Socratic Bots backend, DARE, and the voice runtime, and the features that exist today.
- Added `QUICKSTART.md` (run locally), `DEPLOYMENT.md` (build and serve `dist/`),
  `docs/configuration.md`, and `docs/architecture.md`.
- Rewrote `CONTRIBUTING.md` and `SECURITY.md`, and `tests/README.md` as contributor docs.
- Replaced the outdated `CLAUDE.md` with `AGENTS.md` (imported by `CLAUDE.md`) plus `run-frontend`
  and `check` agent skills.

### Changed

- Removed unused dependencies: MUI, Emotion, TipTap, react-dropzone, react-icons, and dompurify.
- Declared Node 20+ in `package.json` `engines`.
- `VITE_API_URL` now falls back to `http://localhost:8001/api` instead of a production-looking host.
- `.env.example` lists only the variables the code reads.
- `npm run lint` and `npm run format:check` pass again.

### Removed

- Leftover chapter modal state from the old books/chapters model.
