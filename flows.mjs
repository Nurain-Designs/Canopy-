// End-to-end demo-mode flows on the live GitHub Pages demos (BioDapt, SkillBridge),
// at desktop and mobile sizes. Records each step and any requests to a backend.
import { chromium } from 'playwright';
import fs from 'node:fs';

const G = 'https://nurain-designs.github.io/';
const browser = await chromium.launch();
const out = {};

async function run(name, size, fn) {
  const ctx = await browser.newContext({ viewport: size, isMobile: size.width < 500 });
  const page = await ctx.newPage();
  const errors = [];
  const backend = [];
  page.on('pageerror', (e) => errors.push(String(e.message).slice(0, 120)));
  page.on('request', (r) => { if (/localhost:5000|\/api\//.test(r.url())) backend.push(r.url()); });
  const steps = [];
  try { await fn(page, steps); } catch (e) { steps.push('ERROR ' + String(e).slice(0, 160)); }
  await page.screenshot({ path: `results/shots/flow-${name}-${size.width}.jpg`, type: 'jpeg', quality: 60 });
  out[`${name}-${size.width}`] = { steps, backendRequests: backend.length, pageErrors: [...new Set(errors)] };
  await ctx.close();
}

for (const size of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
  await run('biodapt', size, async (page, steps) => {
    await page.goto(G + 'BioDapt---Fullstack/', { waitUntil: 'networkidle' });
    steps.push('demo badge: ' + (await page.getByText('Demo mode').count()));
    const nav = page.getByRole('button', { name: /AI Advisor/ }).first();
    if (await nav.isVisible()) await nav.click();
    else await page.getByRole('button', { name: /Try Advisor/ }).first().click();
    await page.waitForTimeout(1000);
    const box = page.locator('input[placeholder^="Describe your packaging"]');
    await box.fill('I need packaging for frozen food that must biodegrade within 6 months in compost');
    await box.press('Enter');
    await page.waitForTimeout(2500);
    const text = await page.evaluate(() => document.body.innerText);
    steps.push('recommendation: ' + (text.match(/I recommend \*?\*?(.+?)\*?\*? as the top choice/)?.[1] ?? 'NONE'));
    steps.push('error message shown: ' + /couldn't fetch/.test(text));
  });
  await run('skillbridge', size, async (page, steps) => {
    const base = G + 'SkillBridge-frontend--12/';
    await page.goto(base, { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: 'Explore the demo' }).click();
    await page.waitForURL(/dashboard/, { timeout: 15000 });
    steps.push('explore → ' + page.url().replace(base, ''));
    await page.goto(base + 'resume-upload/', { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: /Use a sample résumé/ }).click();
    await page.getByRole('button', { name: /Analyze with AI/ }).click();
    await page.waitForTimeout(2600);
    const t = await page.evaluate(() => document.body.innerText);
    steps.push('sample analysis labelled: ' + (t.includes('Sample analysis ready') && t.includes('was not uploaded')));
    await page.getByRole('button', { name: /View Roadmap/ }).click();
    await page.waitForTimeout(1000);
    await page.reload({ waitUntil: 'networkidle' });
    steps.push('roadmap after reload: ' + page.url().replace(base, '') + ' len=' + (await page.evaluate(() => document.body.innerText.length)));
  });
}
fs.writeFileSync('results/flows.json', JSON.stringify(out, null, 1));
console.log(JSON.stringify(out, null, 1));
await browser.close();
