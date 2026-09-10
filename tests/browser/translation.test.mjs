import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { chromium } from 'playwright';

const baseURL = process.env.TEST_BASE_URL || 'http://127.0.0.1:5187';
let browser;

before(async () => {
  browser = await chromium.launch({
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined,
  });
});
after(async () => browser?.close());

// Google Translate replaces React-owned text nodes. Keep the displayed text
// unchanged so tests can still locate controls while reproducing the DOM change.
async function translate(page) {
  const count = await page.evaluate(() => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (
        node.textContent.trim() &&
        !node.parentElement.closest('script,style,textarea,svg,font')
      ) {
        nodes.push(node);
      }
    }
    for (const node of nodes) {
      const wrapper = document.createElement('font');
      wrapper.textContent = node.textContent;
      node.replaceWith(wrapper);
    }
    document.documentElement.classList.add('translated-ltr');
    return nodes.length;
  });
  assert.ok(count > 0, 'Translation must replace actual text nodes');
}

async function fixture(t, { loggedIn = true, mobile = false } = {}) {
  const context = await browser.newContext({
    viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 1000 },
  });
  t.after(() => context.close());
  const page = await context.newPage();
  page.setDefaultTimeout(10000);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => {
    if (
      message.type() === 'error' &&
      /NotFoundError|React will try to recreate/.test(message.text())
    ) {
      errors.push(message.text());
    }
  });
  let authenticated = loggedIn;
  let releaseLogin;
  let requestStartedResolve;
  let requestStarted = new Promise(resolve => {
    requestStartedResolve = resolve;
  });
  let loginResult;
  const requests = [];
  const bot = {
    id: 76,
    title: 'Translation QA Bot',
    subject: 'Physics',
    topic: 'Energy',
    isActive: true,
    createdById: 99,
    dareFileIds: [],
    filesCount: 0,
    botGroup: { id: 1, title: 'QA', collaborators: [] },
  };
  const bots = [
    bot,
    { ...bot, id: 77, title: 'Second QA Bot' },
    { ...bot, id: 78, title: 'Inactive QA Bot', isActive: false },
  ];

  // Stub transport only: exercise the real routes, queries, store and components.
  // No production requests or customer accounts are used by these tests.
  await page.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.pathname.includes('/api/')) {
      let data = [];
      let status = 200;
      if (url.pathname.endsWith('/users/user-info/')) {
        data = authenticated
          ? { id: 1, name: 'QA User', email: 'qa@example.test', isCreator: false, isActive: true }
          : { detail: 'Not authenticated' };
        status = authenticated ? 200 : 401;
      } else if (url.pathname.endsWith('/users/login/')) {
        await new Promise(resolve => {
          releaseLogin = resolve;
          requestStartedResolve();
        });
        authenticated = loginResult === 'success';
        status = authenticated ? 200 : 400;
        data = authenticated
          ? { access: 'qa-test', refresh: 'qa-refresh' }
          : { detail: 'Invalid credentials' };
      } else if (url.pathname.endsWith('/wallet/')) {
        data = { wallets: [], activeWallet: null };
      } else if (url.pathname.endsWith('/bot-groups/')) {
        data = [{ id: 1, title: 'QA', bots }];
      } else if (/\/conversations\/bots\/\d+\/conversations\/$/.test(url.pathname)) {
        const id = Number(url.pathname.split('/').at(-3));
        requests.push(id);
        data = {
          botId: id,
          dareConversationId: `QA${id}`,
          botName: bots.find(b => b.id === id).title,
          identifier: `QA${id}`,
        };
      }
      return route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(data) });
    }
    if (url.origin === new URL(baseURL).origin) return route.continue();
    return route.abort();
  });
  await page.routeWebSocket('**/*', socket => socket.close());
  return {
    page,
    errors,
    requests,
    finishLogin: async result => {
      await requestStarted;
      assert.ok(releaseLogin, 'Login request must be pending');
      loginResult = result;
      releaseLogin();
      requestStarted = new Promise(resolve => {
        requestStartedResolve = resolve;
      });
    },
  };
}

for (const translated of [false, true]) {
  test(`select, switch, reload and clear a bot (${translated ? 'translated' : 'original'} page)`, async t => {
    const { page, errors, requests } = await fixture(t);
    await page.goto(`${baseURL}/chat`);
    await page.getByRole('combobox').waitFor();
    if (translated) await translate(page);
    await page.getByRole('combobox').click();
    assert.equal(
      await page.getByRole('option', { name: /Inactive QA Bot/ }).getAttribute('aria-disabled'),
      'true'
    );
    if (translated) await translate(page);
    await page.getByRole('option', { name: /Translation QA Bot/ }).click();
    await page.waitForURL('**/chat/76');
    await page.getByText('Active', { exact: true }).waitFor();
    assert.match(await page.getByRole('combobox').innerText(), /Translation QA Bot/);
    if (translated) await translate(page);
    await page.getByRole('combobox').click();
    await page.getByRole('option', { name: /Second QA Bot/ }).click();
    await page.waitForURL('**/chat/77');
    assert.match(await page.getByRole('combobox').innerText(), /Second QA Bot/);
    await page.reload();
    await page.getByText('Active', { exact: true }).waitFor();
    assert.match(await page.getByRole('combobox').innerText(), /Second QA Bot/);
    if (translated) await translate(page);
    await page.getByRole('link', { name: 'Chat', exact: true }).click();
    await page.getByText('Please Select a Bot', { exact: true }).waitFor();
    assert.ok(requests.includes(76) && requests.includes(77));
    assert.deepEqual(errors, []);
  });
}

for (const mobile of [false, true]) {
  test(`translated login completes on ${mobile ? 'narrow' : 'wide'} screen`, async t => {
    const { page, errors, finishLogin } = await fixture(t, { loggedIn: false, mobile });
    await page.goto(`${baseURL}/login`);
    await page.getByLabel('Email Address').fill('qa@example.test');
    await page.getByLabel('Password', { exact: true }).fill('TestPassword42!');
    const request = page.waitForRequest('**/users/login/');
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();
    await request;
    await page.getByText('Signing in...', { exact: true }).waitFor();
    await translate(page);
    await finishLogin('success');
    await page.waitForURL(`${baseURL}/`);
    await page.getByRole('link', { name: 'Socratic Bots', exact: true }).waitFor();
    assert.deepEqual(errors, []);
  });
}

test('translated login failure allows another attempt', async t => {
  const { page, errors, finishLogin } = await fixture(t, { loggedIn: false });
  await page.goto(`${baseURL}/login`);
  await page.getByLabel('Email Address').fill('qa@example.test');
  await page.getByLabel('Password', { exact: true }).fill('TestPassword42!');
  let request = page.waitForRequest('**/users/login/');
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();
  await request;
  await page.getByText('Signing in...', { exact: true }).waitFor();
  await translate(page);
  await finishLogin('failure');
  // Mutations retry once in the app's query provider.
  request = page.waitForRequest('**/users/login/');
  await request;
  await finishLogin('failure');
  await page.getByText('Invalid credentials', { exact: true }).waitFor();
  await translate(page);
  request = page.waitForRequest('**/users/login/');
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();
  await request;
  await finishLogin('success');
  await page.waitForURL(`${baseURL}/`);
  await page.getByRole('link', { name: 'Socratic Bots', exact: true }).waitFor();
  assert.deepEqual(errors, []);
});
