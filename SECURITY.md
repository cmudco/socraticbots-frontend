# Security Policy

## Reporting a vulnerability

Please do not report security vulnerabilities through public issues, discussions, or pull requests.

Report them privately through GitHub's **private vulnerability reporting** on this repository
(Security tab → "Report a vulnerability"). If that isn't available, email **vks@andrew.cmu.edu**
with "Socratic Bots security" in the subject.

Include what you found, how to reproduce it, and the impact you expect. We will acknowledge your
report, keep you updated while we fix it, and credit you when the fix is released unless you prefer
otherwise. Please give us a reasonable chance to fix the issue before disclosing it publicly.

## Scope

In scope:

- The Socratic Bots frontend code in this repository
- Its default configuration (`.env.example`, Vite config)
- Dependencies pinned in `package-lock.json`, where the frontend's use of them is exploitable

Out of scope (report these to the right project):

- The Socratic Bots backend, DARE, and the voice runtime: use their own repositories
- Third-party services (LLM providers, ElevenLabs, Sentry, hosting)
- Issues that need a modified fork, a compromised browser, or a user pasting code into devtools

## Hardening notes for deployers

- **No secrets in `VITE_*` variables.** They are compiled into the public bundle.
- **Serve over HTTPS** and redirect HTTP.
- **Tokens live in `localStorage`.** Any XSS can read them. Keep a strict Content-Security-Policy on
  the host serving `dist/`, and don't add inline scripts or third-party script tags.
- **Allow only your origin** on the Socratic Bots backend (CORS and CSRF), DARE, and the voice
  runtime.
- **Sentry is optional.** Production replay masks all text, inputs, and media; local development
  sends only a minimal event.
