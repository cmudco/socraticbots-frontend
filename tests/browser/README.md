# Translation regression tests

These tests run the real React routes with synthetic API responses. They replace
text nodes with `font` elements to reproduce the DOM mutation caused by browser
translation. They cover bot selection/switching/reload, inactive options, and login
success/failure/retry, including a narrow viewport. They do not test live provider
responses or real iOS WebKit.

1. Run `npm ci` and `npx playwright install chromium`.
2. Start the frontend: `npm run dev -- --host 127.0.0.1 --port 5187 --strictPort`.
3. In another terminal, run `npm run test:browser`.

Set `TEST_BASE_URL` to use another local port. If using an existing Chromium
installation, set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to its executable.
No production API requests are sent; external HTTP and WebSocket traffic is blocked.
