// Post-build prerendering: draait de gebouwde SPA in een headless browser en slaat
// per publieke route de volledig gerenderde HTML op in dist/<route>/index.html.
// Zo krijgt Google (en social/AI-crawlers die geen JS draaien) echte inhoud + de
// per-pagina meta/canonical die RouteSeo zet. Privé app-routes worden NIET geprerenderd.
//
// Faalt dit script, dan eindigt het bewust met exit 0 zodat de Netlify-build blijft
// slagen en gewoon terugvalt op de normale client-side SPA (nooit een kapotte deploy).
import http from 'node:http';
import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';

const ROOT = dirname(fileURLToPath(import.meta.url));
const DIST = join(ROOT, 'dist');
const PORT = Number(process.env.PRERENDER_PORT || 4183);

// Alleen publieke, indexeerbare marketingpagina's.
const ROUTES = [
  '/',
  '/zakelijk',
  '/partners',
  '/kosten-conflict',
  '/juridische-hulp',
  '/contact',
  '/wat-is-mediation',
  '/hoe-werkt-rsolve',
  '/kosten',
  '/privacy',
  '/terms',
];

const MIME = {
  '.html': 'text/html;charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.webp': 'image/webp', '.gif': 'image/gif', '.json': 'application/json',
  '.ico': 'image/x-icon', '.txt': 'text/plain', '.xml': 'application/xml',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.map': 'application/json',
};

// Statische server met SPA-fallback naar index.html.
function startServer() {
  const server = http.createServer(async (req, res) => {
    try {
      const p = decodeURIComponent((req.url || '/').split('?')[0]);
      let fp = join(DIST, p);
      const ok = existsSync(fp) && (await stat(fp)).isFile();
      if (!ok) fp = join(DIST, 'index.html');
      const body = await readFile(fp);
      res.writeHead(200, { 'Content-Type': MIME[extname(fp)] || 'application/octet-stream' });
      res.end(body);
    } catch {
      res.writeHead(500);
      res.end('error');
    }
  });
  return new Promise((resolve) => server.listen(PORT, () => resolve(server)));
}

async function run() {
  if (!existsSync(join(DIST, 'index.html'))) {
    console.warn('[prerender] geen dist/index.html — overslaan');
    return;
  }

  const server = await startServer();
  const browser = await puppeteer.launch({
    headless: true,
    // Op Netlify gebruikt puppeteer zijn eigen gedownloade Chromium; lokaal kun je
    // PUPPETEER_EXECUTABLE_PATH zetten naar een bestaande Chromium.
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  let done = 0;
  for (const route of ROUTES) {
    const page = await browser.newPage();
    try {
      await page.goto(`http://localhost:${PORT}${route}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      // Wacht tot React de inhoud in #root heeft gezet.
      await page
        .waitForFunction(
          () => {
            const r = document.getElementById('root');
            return r && r.children.length > 0 && (r.innerText || '').trim().length > 40;
          },
          { timeout: 15000 }
        )
        .catch(() => {});
      // Kleine marge zodat RouteSeo de <head>-meta heeft bijgewerkt.
      await new Promise((r) => setTimeout(r, 400));

      const html = await page.content();
      const outDir = route === '/' ? DIST : join(DIST, route);
      await mkdir(outDir, { recursive: true });
      await writeFile(join(outDir, 'index.html'), html, 'utf8');
      done++;
      console.log(`[prerender] ✓ ${route}`);
    } catch (e) {
      console.warn(`[prerender] ✗ ${route}: ${e && e.message ? e.message : e}`);
    } finally {
      await page.close().catch(() => {});
    }
  }

  await browser.close().catch(() => {});
  server.close();
  console.log(`[prerender] klaar: ${done}/${ROUTES.length} pagina's geprerenderd`);
}

run().catch((e) => {
  console.warn('[prerender] overgeslagen wegens fout:', e && e.message ? e.message : e);
  process.exit(0);
});
