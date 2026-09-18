# Contributing

Thanks for contributing to SocraticBooks Frontend.

Before opening a pull request:

1. Run `npm run lint`.
2. Run `npm run format:check`.
3. Run `npm run build`.
4. Test against a local `socraticbooks-backend`.
5. Route REST calls through `VITE_API_URL` (Socratic backend). Real-time chat connects directly to DARE through `VITE_DARE_SOCKET_URL`.

Security issues should be reported privately to the maintainers, not through public issues.
