// Opens each demo URL in Chromium at desktop and mobile sizes and records: title,
// same-origin asset failures, broken images, page errors, overflow, one internal
// navigation and a reload of that route. Screenshots go to results/shots.
import { chromium } from 'playwright';
import fs from 'node:fs';

const targets = JSON.parse(fs.readFileSync(process.argv[2] || 'urls.json', 'utf8'));
fs.mkdirSync('results/shots', { recursive: true });
const browser = await chromium.launch();
const report = {};

for (const [id, t] of Object.entries(targets)) {
  const r = { url: t.url, expectedTitle: t.title };
  for (const [tag, vp] of [['desktop', { width: 1440, height: 900 }], ['mobile', { width: 390, height: 844 }]]) {
    const ctx = await browser.newContext({ viewport: vp, isMobile: tag === 'mobile', deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    const origin = new URL(t.url).origin;
    const bad = [];
    const errors = [];
    page.on('response', (res) => {
      if (res.status() >= 400 && res.url().startsWith(origin)) bad.push(`${res.status()} ${res.url()}`);
    });
    page.on('requestfailed', (q) => {
      if (q.url().startsWith(origin)) bad.push(`failed ${q.url()} ${q.failure()?.errorText}`);
    });
    page.on('pageerror', (e) => errors.push(String(e.message).slice(0, 200)));
    const v = {};
    try {
      const resp = await page.goto(t.url, { waitUntil: 'networkidle', timeout: 60000 });
      await page.waitForTimeout(2500);
      v.status = resp?.status();
      v.finalUrl = page.url();
      v.title = await page.title();
      v.titleOk = v.title.toLowerCase().includes(t.title.toLowerCase());
      v.h1 = await page.evaluate(() =>
        [...document.querySelectorAll('h1,h2')].slice(0, 2).map((e) => e.innerText.replace(/\s+/g, ' ').trim()).join(' | ').slice(0, 160),
      );
      v.textLen = await page.evaluate(() => document.body?.innerText.trim().length || 0);
      v.text = await page.evaluate(() => (document.body?.innerText || '').replace(/\s+/g, ' ').slice(0, 200));
      v.brokenImages = await page.evaluate(() =>
        [...document.images].filter((i) => i.complete && i.naturalWidth === 0 && i.src).map((i) => i.src).slice(0, 5),
      );
      v.overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 2);
      await page.screenshot({ path: `results/shots/${id}-${tag}.jpg`, type: 'jpeg', quality: 60 });
      if (tag === 'desktop') {
        for (const p of t.paths || []) {
          const u = new URL(p, t.url).href;
          const res = await page.goto(u, { waitUntil: 'networkidle', timeout: 45000 }).catch(() => null);
          await page.waitForTimeout(1200);
          (v.directLoads ||= []).push({
            path: p,
            status: res?.status(),
            title: await page.title(),
            textLen: await page.evaluate(() => document.body?.innerText.trim().length || 0),
          });
        }
        if (t.paths?.length) await page.goto(t.url, { waitUntil: 'networkidle' });
        const href = await page.evaluate((o) => {
          const here = location.href.split('#')[0];
          const a = [...document.querySelectorAll('a[href]')].find((el) => {
            const u = new URL(el.href, location.href);
            const box = el.getBoundingClientRect();
            return u.origin === o && u.href.split('#')[0] !== here && !/\.(pdf|zip|png|jpe?g)$/.test(u.pathname) && box.width > 0 && box.height > 0;
          });
          return a ? a.href : null;
        }, origin);
        v.navLink = href;
        if (href) {
          const nav = await page.goto(href, { waitUntil: 'networkidle', timeout: 45000 }).catch(() => null);
          await page.waitForTimeout(1500);
          v.navStatus = nav?.status();
          v.navTextLen = await page.evaluate(() => document.body?.innerText.trim().length || 0);
          const re = await page.reload({ waitUntil: 'networkidle' }).catch(() => null);
          await page.waitForTimeout(1000);
          v.reloadStatus = re?.status();
          v.reloadTextLen = await page.evaluate(() => document.body?.innerText.trim().length || 0);
          await page.screenshot({ path: `results/shots/${id}-nested.jpg`, type: 'jpeg', quality: 60 });
        }
      }
    } catch (e) {
      v.error = String(e).slice(0, 200);
    }
    v.badRequests = [...new Set(bad)].slice(0, 8);
    v.pageErrors = [...new Set(errors)].slice(0, 5);
    r[tag] = v;
    await ctx.close();
  }
  report[id] = r;
  console.log(id, JSON.stringify(r).slice(0, 400));
}
fs.writeFileSync(`results/${process.argv[3] || 'report'}.json`, JSON.stringify(report, null, 1));
await browser.close();
