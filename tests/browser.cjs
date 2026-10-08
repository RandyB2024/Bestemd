// Run with Node and Playwright available via NODE_PATH. No production dependencies.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const root = path.resolve(__dirname, '..');
const output = process.env.TEST_OUTPUT || path.join(root, 'test-results');
fs.mkdirSync(output, { recursive: true });
const mime = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.mp4': 'video/mp4' };
const server = http.createServer((req, res) => {
  const file = path.resolve(root, '.' + (req.url.split('?')[0] === '/' ? '/index.html' : req.url.split('?')[0]));
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file)) { res.writeHead(404).end(); return; }
  const size = fs.statSync(file).size;
  const range = req.headers.range?.match(/bytes=(\d+)-(\d*)/);
  res.setHeader('Content-Type', mime[path.extname(file)] || 'text/plain');
  res.setHeader('Accept-Ranges', 'bytes');
  if (range) {
    const start = Number(range[1]), end = range[2] ? Math.min(Number(range[2]), size - 1) : size - 1;
    res.writeHead(206, { 'Content-Range': `bytes ${start}-${end}/${size}`, 'Content-Length': end - start + 1 });
    fs.createReadStream(file, { start, end }).pipe(res);
  } else { res.setHeader('Content-Length', size); fs.createReadStream(file).pipe(res); }
});
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const url = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || 'chrome', headless: true });
  const results = [];
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = [], badResponses = [], external = [], submissions = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => { if (response.status() >= 400) badResponses.push(response.url()); });
    page.on('request', request => { if (!request.url().startsWith(url)) external.push(request.url()); if (request.method() !== 'GET') submissions.push(request.url()); });
    await page.goto(url);
    assert.equal(await page.locator('video').evaluate(v => v.networkState), 1);
    assert.equal(await page.locator('video').getAttribute('preload'), 'none');
    assert.equal(await page.locator('#weekly').textContent(), '2,4');
    assert.equal(await page.locator('#monthly').textContent(), '10,4');
    assert.equal(await page.locator('#yearly').textContent(), '124,8');
    for (const [hours, saving, expected] of [[0,40,['0','0','0']], [25,80,['20','86,7','1.040']], [0.5,10,['0,1','0,2','2,6']]]) {
      await page.locator('#hours').fill(String(hours)); await page.locator('#saving').fill(String(saving));
      assert.deepEqual(await page.locator('.results strong').allTextContents(), expected);
    }
    await page.locator('#hours').fill('6'); await page.locator('#saving').fill('40');
    results.push('Calculator: default, zero, maximum and fractional inputs passed.');
    assert.deepEqual(await page.locator('a[href^="#"]').evaluateAll(links => links.filter(a => !document.getElementById(a.hash.slice(1))).map(a => a.hash)), []);
    for (const width of [320,375,390,580,768,850,1024,1440,1920]) {
      await page.setViewportSize({ width, height: 1000 });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `Horizontal overflow at ${width}`);
      if (width === 390 || width === 1440) {
        await page.evaluate(() => scrollTo(0,0));
        await page.screenshot({ path: path.join(output, `${width === 390 ? 'mobile' : 'desktop'}.png`), fullPage: true });
        await page.screenshot({ path: path.join(output, `${width === 390 ? 'mobile' : 'desktop'}-hero.png`) });
      }
    }
    results.push('Layout: no horizontal overflow at 320, 375, 390, 580, 768, 850, 1024, 1440, 1920px; desktop/mobile screenshots saved.');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator('.menu-toggle').click();
    assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'), 'true');
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'), 'false');
    await page.locator('.menu-toggle').click(); await page.locator('#navigation a[href="#diensten"]').click();
    assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'), 'false');
    results.push('All anchor targets exist; mobile navigation, Escape and link close passed.');
    await page.locator('#submit-button').click();
    assert.equal(await page.locator('#name').getAttribute('aria-invalid'), 'true');
    await page.locator('#name').fill('   '); await page.locator('#email').fill('invalid');
    await page.locator('#submit-button').click();
    assert.equal(await page.locator('#name').getAttribute('aria-invalid'), 'true');
    assert.equal(await page.locator('#email').getAttribute('aria-invalid'), 'true');
    await page.locator('#name').fill('Test ondernemer'); await page.locator('#email').fill('test@example.com'); await page.locator('#permission').check();
    await page.locator('#submit-button').click();
    assert.match(await page.locator('#form-status').textContent(), /niet verstuurd of opgeslagen/);
    assert.deepEqual(submissions, []);
    assert.equal(await page.evaluate(() => localStorage.length + sessionStorage.length), 0);
    results.push('Form: empty, whitespace, invalid email, consent and valid preview checked; no submission or browser storage.');
    const video = await page.locator('video').evaluate(async v => { v.muted = true; await v.play(); return { duration: v.duration, width: v.videoWidth, height: v.videoHeight }; });
    await page.waitForFunction(() => document.querySelector('video').currentTime > 0.2);
    await page.locator('video').evaluate(v => v.pause());
    results.push('Original video playback passed: ' + JSON.stringify(video));
    await page.emulateMedia({ reducedMotion: 'reduce' });
    assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior), 'auto');
    assert.equal(await page.locator('.section-heading').first().evaluate(e => getComputedStyle(e).animationName), 'none');
    assert.deepEqual(errors, []); assert.deepEqual(badResponses, []); assert.deepEqual(external, []);
    results.push('No JavaScript errors, failed resources or external requests; reduced motion respected.');
    const nojs = await browser.newPage({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    await nojs.goto(url);
    assert.equal(await nojs.locator('#navigation').isVisible(), true);
    assert.equal(await nojs.locator('#submit-button').isDisabled(), true);
    assert.equal(await nojs.locator('#diensten').isVisible(), true);
    results.push('Without JavaScript: navigation/content visible, form submission disabled.');
    fs.writeFileSync(path.join(output, 'test-results.json'), JSON.stringify(results, null, 2));
    console.log(results.join('\n'));
  } finally { await browser.close(); server.close(); }
})().catch(error => { console.error(error); server.close(); process.exitCode = 1; });
