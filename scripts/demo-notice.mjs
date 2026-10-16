// Postbuild for the public demo: adds a small, dismissible "concept demo" notice to
// every HTML file in dist/, so visitors know nothing they enter is saved, sent or charged.
// Usage: node scripts/demo-notice.mjs [extra sentence]
import fs from 'node:fs';
import path from 'node:path';

const extra = process.argv[2] ? ` ${process.argv[2]}` : '';
const MARK = 'data-nurain-demo-notice';
const snippet =
  `<div ${MARK} role="note" aria-label="Demo notice" style="position:fixed;left:12px;bottom:12px;z-index:2147483647;max-width:min(360px,calc(100vw - 24px));display:flex;gap:10px;align-items:flex-start;padding:10px 12px;border-radius:14px;background:rgba(15,23,42,.92);color:#fff;font:500 12px/1.45 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.25)">` +
  `<span><strong style="font-weight:700">Concept demo by Nurain Designs.</strong> Sample data only — nothing you enter is saved, sent or charged.${extra}</span>` +
  `<button type="button" aria-label="Dismiss demo notice" style="all:unset;cursor:pointer;padding:0 4px;font-size:16px;line-height:1;color:#fff" onclick="this.parentNode.remove();try{sessionStorage.setItem('nurainDemoNotice','1')}catch(e){}">&times;</button></div>` +
  `<script>try{if(sessionStorage.getItem('nurainDemoNotice'))document.querySelectorAll('[${MARK}]').forEach(function(n){n.remove()})}catch(e){}</script>`;

let count = 0;
const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p);
    else if (entry.name.endsWith('.html')) {
      const html = fs.readFileSync(p, 'utf8');
      const i = html.lastIndexOf('</body>');
      if (i === -1 || html.includes(MARK)) continue;
      fs.writeFileSync(p, html.slice(0, i) + snippet + html.slice(i));
      count++;
    }
  }
};
walk(path.resolve(process.argv[3] || 'dist'));
console.log(`demo-notice: added to ${count} HTML files`);
