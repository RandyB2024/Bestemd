// Node + Playwright test tooling only; the website has no dependencies.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const root = path.resolve(__dirname, '..');
const output = process.env.TEST_OUTPUT || path.join(root, 'test-results');
fs.mkdirSync(output, { recursive: true });
const mime = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.mp4': 'video/mp4' };
const server = http.createServer((req, res) => {
  const file = path.resolve(root, '.' + (req.url.split('?')[0] === '/' ? '/index.html' : req.url.split('?')[0]));
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404).end(); return; }
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
const settle = async page => {
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  await page.waitForTimeout(50);
};
const scroll = async (page, y) => {
  await page.evaluate(y => scrollTo({ top: y, behavior: 'instant' }), y);
  await settle(page);
};
const sceneTop = (page, id) => page.locator(id).evaluate(el => el.getBoundingClientRect().top + scrollY - 105);

(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const url = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || 'chrome', headless: true });
  const results = [];
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = [], badResponses = [], external = [], submissions = [], videoRequests = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => { if (response.status() >= 400) badResponses.push(response.url()); });
    page.on('request', request => {
      if (!request.url().startsWith(url)) external.push(request.url());
      if (request.method() !== 'GET') submissions.push(request.url());
      if (request.url().endsWith('.mp4')) videoRequests.push(request.url());
    });
    await page.goto(url);
    await page.waitForTimeout(1700);
    assert.equal(await page.locator('main > section').count(), 8);
    assert.match(await page.locator('.opening-date').textContent(), /begin 2027/);
    assert.equal(await page.locator('h1').count(), 1);
    assert.equal(await page.locator('.abc-lines article').count(), 3);
    assert.match(await page.locator('#human-title').textContent(), /leven serieus/);
    assert.equal(await page.locator('.opening-brand img').evaluate(el => getComputedStyle(el).filter), 'none');
    assert.equal(await page.locator('.opening-brand').evaluate(el => getComputedStyle(el).backgroundColor), 'rgb(255, 255, 255)');
    assert.equal(await page.locator('video').getAttribute('preload'), 'none');
    assert.deepEqual(videoRequests, []);
    assert.deepEqual(await page.locator('a[href^="#"]').evaluateAll(links => links.filter(a => !document.getElementById(a.hash.slice(1))).map(a => a.hash)), []);
    assert.equal(await page.locator('link[rel=canonical]').getAttribute('href'), 'https://mijnbestemd.nl/');
    const assets = await page.locator('[src], [poster], link[rel=stylesheet], link[rel=icon]').evaluateAll(elements => [...new Set(elements.flatMap(e => [e.getAttribute('src'), e.getAttribute('poster'), e.getAttribute('href')]).filter(Boolean))]);
    for (const asset of assets.filter(asset => !asset.endsWith('.mp4'))) assert.equal((await page.request.get(url + '/' + asset)).status(), 200, asset);
    assert.equal((await page.request.get(url + '/assets/launch-social.png')).status(), 200);
    results.push('Eight scenes, launch period, anchor targets, canonical and local assets verified; no initial video download.');

    for (const width of [320,375,390,580,768,850,1024,1440,1920]) {
      await page.setViewportSize({ width, height: width < 600 ? 844 : 1000 });
      for (const id of ['#home','#verhaal','#verandering','#toekomst','#visie','#film','#introductie','#contact']) {
        await scroll(page, await sceneTop(page,id));
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `Overflow: ${width}, ${id}`);
      }
      if (width === 390 || width === 1440) {
        const prefix = width === 390 ? 'cinematic-mobile' : 'cinematic-desktop';
        await scroll(page, 0);
        await page.screenshot({ path: path.join(output, `${prefix}-hero.png`) });
        await scroll(page, await sceneTop(page, '#toekomst'));
        await page.screenshot({ path: path.join(output, `${prefix}-portal.png`) });
        await scroll(page, await sceneTop(page, '#introductie'));
        await page.screenshot({ path: path.join(output, `${prefix}-launch.png`) });
        await scroll(page, await sceneTop(page, '#visie'));
        await page.locator('#visie').screenshot({ path: path.join(output, `${prefix}-vision.png`) });
      }
    }
    results.push('All eight scenes checked at nine widths (320–1920px) without horizontal overflow; desktop/mobile screenshots saved.');

    await page.setViewportSize({ width: 1440, height: 1000 });
    const story = await page.locator('#verhaal').evaluate(el => ({ top: el.offsetTop, height: el.offsetHeight }));
    const y = story.top + (story.height - 1000) * .35;
    await scroll(page,y);
    assert.equal(await page.locator('.problem-stage').evaluate(el => getComputedStyle(el).position), 'sticky');
    const forward = await page.locator('.story-word').evaluateAll(words => words.map(w => [w.style.color, w.style.transform]));
    await scroll(page, y + 300); await scroll(page,y);
    assert.deepEqual(await page.locator('.story-word').evaluateAll(words => words.map(w => [w.style.color,w.style.transform])), forward);
    assert.equal(await page.locator('.story-word').evaluateAll(words => words.every(w => getComputedStyle(w).opacity === '1')), true);
    await page.setViewportSize({ width: 390, height: 844 }); await settle(page);
    assert.equal(await page.locator('.problem-stage').evaluate(el => getComputedStyle(el).position), 'static');
    results.push('Forward/reverse scrolling produces identical text states; desktop pin only; mobile has no pin; words never disappear.');

    await page.locator('.menu-toggle').click();
    assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'), 'true');
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'), 'false');
    await page.locator('.menu-toggle').click(); await page.locator('#navigation a[href="#toekomst"]').click();
    assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'), 'false');
    await page.locator('#tab-documents').click();
    assert.equal(await page.locator('#panel-documents').isVisible(), true);
    assert.equal(await page.locator('#panel-overview').isVisible(), false);
    await page.locator('#tab-overview').focus(); await page.keyboard.press('Enter');
    assert.equal(await page.locator('#panel-overview').isVisible(), true);
    results.push('Mobile navigation, Escape, anchor close and keyboard-operated concept panels passed.');

    await page.locator('#tijdwinst > summary').click();
    assert.deepEqual(await page.locator('.results strong').allTextContents(), ['2,4','10,4','124,8']);
    for (const [hours, saving, expected] of [[0,40,['0','0','0']], [25,80,['20','86,7','1.040']], [0.5,10,['0,1','0,2','2,6']]]) {
      await page.locator('#hours').fill(String(hours)); await page.locator('#saving').fill(String(saving));
      assert.deepEqual(await page.locator('.results strong').allTextContents(), expected);
    }
    await page.locator('#hours').fill('6'); await page.locator('#saving').fill('40');
    await page.locator('#tijdwinst > summary').click();
    results.push('Optional calculator: default, zero, maximum and fractional inputs passed.');

    await page.locator('#submit-button').click();
    assert.equal(await page.locator('#name').getAttribute('aria-invalid'), 'true');
    await page.locator('#name').fill('   '); await page.locator('#email').fill('invalid');
    await page.locator('#submit-button').click();
    assert.equal(await page.locator('#name').getAttribute('aria-invalid'), 'true');
    assert.equal(await page.locator('#email').getAttribute('aria-invalid'), 'true');
    await page.locator('#name').fill('Test ondernemer'); await page.locator('#email').fill('test@example.com');
    await page.locator('#submit-button').click();
    assert.equal(await page.locator('#permission').getAttribute('aria-invalid'), 'true');
    await page.locator('#permission').check(); await page.locator('#submit-button').click();
    assert.match(await page.locator('#form-status').textContent(), /niet verstuurd of opgeslagen/);
    assert.match(await page.locator('#form-status').textContent(), /nog niet aangemeld/);
    await page.locator('#website').evaluate(el => { el.value = 'spam'; });
    await page.locator('#submit-button').click();
    assert.match(await page.locator('#form-status').textContent(), /niets verstuurd/);
    assert.deepEqual(submissions, []);
    assert.equal(await page.evaluate(() => localStorage.length + sessionStorage.length), 0);
    assert.deepEqual(videoRequests, []);
    results.push('Form: required fields, whitespace, email, consent, valid preview and honeypot passed; no submission, storage or false success. Video still not downloaded after scrolling.');

    await page.locator('video').evaluate(v => { v.muted = true; });
    await page.locator('.film-play').click();
    await page.waitForFunction(() => document.querySelector('video').currentTime > .3);
    const video = await page.locator('video').evaluate(v => { v.pause(); return { duration: v.duration, width: v.videoWidth, height: v.videoHeight }; });
    assert.equal(await page.locator('.film-play').isHidden(), true);
    results.push('Original video played via custom play button and native controls: ' + JSON.stringify(video));

    await page.locator('#motion-toggle').click();
    assert.equal(await page.locator('html').getAttribute('data-motion'), 'off');
    assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior), 'auto');
    await page.locator('#motion-toggle').click();
    await page.emulateMedia({ reducedMotion: 'reduce' }); await settle(page);
    assert.equal(await page.locator('html').getAttribute('data-motion'), 'off');
    assert.equal(await page.locator('.problem-stage').evaluate(el => getComputedStyle(el).position), 'static');
    assert.equal(await page.locator('h1').evaluate(el => getComputedStyle(el).animationName), 'none');
    assert.equal(await page.locator('#motion-toggle').isDisabled(), true);
    results.push('Manual motion switch and live OS reduced-motion changes remove animation and pinning.');
    assert.deepEqual(errors, []); assert.deepEqual(badResponses, []); assert.deepEqual(external, []);
    results.push('No console errors, failed resource responses or external requests.');

    const nojs = await browser.newPage({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    await nojs.goto(url);
    assert.equal(await nojs.locator('#navigation').isVisible(), true);
    assert.equal(await nojs.locator('#submit-button').isDisabled(), true);
    assert.equal(await nojs.locator('#panel-documents').isVisible(), true);
    assert.equal(await nojs.locator('.problem-stage').evaluate(el => getComputedStyle(el).position), 'static');
    await nojs.locator('#name').fill('Test'); await nojs.locator('#name').press('Enter');
    assert.equal(nojs.url(), url + '/');
    results.push('Without JS: all scenes and both concept panels readable, navigation visible, no pinned section or form submission.');

    // A reproducible lab check, not field Core Web Vitals or a physical phone test.
    const slow = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await slow.addInitScript(() => {
      window.lab = { cls: 0, lcp: 0, longTasks: 0 };
      new PerformanceObserver(list => list.getEntries().forEach(e => { if (!e.hadRecentInput) window.lab.cls += e.value; })).observe({ type: 'layout-shift', buffered: true });
      new PerformanceObserver(list => list.getEntries().forEach(e => { window.lab.lcp = e.startTime; })).observe({ type: 'largest-contentful-paint', buffered: true });
      new PerformanceObserver(list => list.getEntries().forEach(() => window.lab.longTasks++)).observe({ type: 'longtask', buffered: true });
    });
    const cdp = await slow.context().newCDPSession(slow);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 6 });
    await cdp.send('Network.enable');
    await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 200000, uploadThroughput: 90000 });
    await slow.goto(url); await slow.waitForTimeout(2200);
    const lab = await slow.evaluate(() => ({ ...window.lab, initialTransferBytes: [...performance.getEntriesByType('navigation'), ...performance.getEntriesByType('resource')].reduce((sum,e) => sum + e.transferSize,0), videoRequests: performance.getEntriesByType('resource').filter(e => e.name.endsWith('.mp4')).length }));
    assert.ok(lab.cls < .1, `Unexpected layout shift: ${lab.cls}`);
    assert.equal(lab.videoRequests, 0);
    for (const id of ['#verhaal','#toekomst','#introductie']) await scroll(slow,await sceneTop(slow,id));
    results.push('6× CPU / 1.6Mbps / 150ms mobile lab load: ' + JSON.stringify(lab));
    fs.writeFileSync(path.join(output,'cinematic-test-results.json'), JSON.stringify(results,null,2));
    console.log(results.join('\n'));
  } finally { await browser.close(); server.close(); }
})().catch(error => { console.error(error); server.close(); process.exitCode = 1; });
