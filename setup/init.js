'use strict';

const pptr = require('puppeteer');

async function run() {
  const browser = await pptr.launch({
    // headless: false,
    // slowMo: 30,
  });
  const page = await browser.newPage();
  await page.setViewport({width: 1024, height: 800});

  await init(page);
  await createDataSource(page);
  // await login(page);
  const apiKey = await getApiKey(page);
  console.log(`API_TOKEN=${apiKey}`);

  await browser.close();
}

async function init(page) {
  console.log('Initialize Redash Admin...');
  await page.goto('http://localhost/');
  await page.waitFor('input[name="name"]', {timeout: 1000});
  await page.type('input[name="name"]', 'redash-client');
  await page.type('input[name="email"]', 'redash-client@example.com');
  await page.type('input[name="password"]', 'redash-client');
  await page.type('input[name="org_name"]', 'redash-client');
  return Promise.all([page.waitForNavigation(), page.click('button[type=submit]')]);
}

// https://github.com/GoogleChrome/puppeteer/issues/761
async function type(page, selector, text) {
  const input = await page.$(selector);
  await input.click({clickCount: 3});
  return input.type(text);
}

async function createDataSource(page) {
  console.log('Create Data Source...');
  await page.goto('http://localhost/data_sources/new');
  await page.waitFor('img[alt="PostgreSQL"]', {timeout: 1000});
  // PostgreSQL
  await page.click('img[alt="PostgreSQL"]');
  // Name
  await page.type('form[target=dataSource] > div:nth-child(1) input', 'dvdrental');
  // Host
  await type(page, 'form[target=dataSource] > div:nth-child(3) input', 'postgres');
  // User
  await page.type('form[target=dataSource] > div:nth-child(5) input', 'postgres');
  // Password
  await page.type('form[target=dataSource] > div:nth-child(6) input', '12345');
  // Database Name
  await page.type('form[target=dataSource] > div:nth-child(8) input', 'dvdrental');
  // Submit
  return Promise.all([page.waitForNavigation(), page.click('form[target=dataSource] > button')]);
}

async function login(page) {
  console.log('Login...');
  await page.goto('http://localhost/');
  await page.waitFor('input[name="email"]', {timeout: 1000});
  await page.type('input[name="email"]', 'redash-client@example.com');
  await page.type('input[name="password"]', 'redash-client');
  return Promise.all([page.waitForNavigation(), page.click('button[type=submit]')]);
}

async function getApiKey(page) {
  console.log('Get API Key...');
  await page.goto('http://localhost/users/me');
  const xpath = '//label[contains(text(), "API Key")]/following-sibling::input';
  await page.waitFor(xpath, {timeout: 1000});
  const inputs = await page.$x(xpath);
  if (inputs.length !== 1) {
    throw new Error('Unexpected selector matching');
  }
  return page.evaluate(input => input.value, inputs[0]);
}

run();
