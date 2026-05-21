# Security Policy

## Reporting a Vulnerability

Please do not report security vulnerabilities through public issues, discussions, or pull requests.

Use GitHub's private vulnerability reporting on this repository when available. If private reporting is not enabled, contact the repository maintainers privately through the organization profile before disclosing publicly.

## Scope

In scope:

- SocraticBooks React frontend code
- Default frontend configuration in this repository
- First-party JavaScript dependencies pinned in `package-lock.json`

Out of scope:

- Vulnerabilities in third-party LLM, voice, analytics, or hosting providers
- Deployment-specific issues caused only by a fork or custom static host
- Browser extension issues or self-XSS requiring devtools paste

## Hardening Notes

- Never put secrets in `VITE_*` variables; they are exposed to the browser.
- Keep all API calls pointed at `VITE_API_URL` for `socraticbooks-backend`.
- Chat intentionally connects directly to DARE Socket.IO through `VITE_DARE_SOCKET_URL`; configure the matching frontend origin on DARE.
- Serve production builds over HTTPS.
- Configure CORS and CSRF origins on `socraticbooks-backend` for the deployed frontend origin.
