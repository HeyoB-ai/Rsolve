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
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

const ROOT = dirname(fileURLToPath(import.meta.url));
const DIST = join(ROOT, 'dist');
const PORT = Number(process.env.PRERENDER_PORT || 4183);

// Alleen publieke, indexeerbare marketingpagina's (Nederlands).
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
  // SEO-landingspagina's per conflicttype
  '/arbeidsconflict-oplossen',
  '/conflict-met-werkgever',
  '/burenruzie-oplossen',
  '/huurconflict-oplossen',
];

// Talen met vaste vertalingen (v1) en de routes die vertaald zijn.
const LOCALES = ['pl', 'en', 'de', 'uk', 'ar', 'tr', 'ro', 'es', 'fr', 'bg', 'pt'];
const LOCALIZED_ROUTES = [
  '/',
  '/wat-is-mediation',
  '/hoe-werkt-rsolve',
  '/kosten',
  '/arbeidsconflict-oplossen',
  '/conflict-met-werkgever',
  '/burenruzie-oplossen',
  '/huurconflict-oplossen',
];

// Bouw de volledige takenlijst: Nederlandse routes + per taal de vertaalde routes.
const TASKS = [
  ...ROUTES.map((route) => ({ url: route, out: route, lang: null })),
  ...LOCALES.flatMap((loc) =>
    LOCALIZED_ROUTES.map((route) => ({
      url: `/${loc}${route === '/' ? '' : route}`,
      out: `/${loc}${route === '/' ? '' : route}`,
      lang: loc,
    }))
  ),
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

  // Chromium komt uit het npm-pakket @sparticuz/chromium (geen download tijdens de
  // build nodig, dus betrouwbaar op Netlify). Lokaal kun je met
  // PUPPETEER_EXECUTABLE_PATH naar een bestaande Chromium wijzen.
  const localExe = process.env.PUPPETEER_EXECUTABLE_PATH;
  const launchOpts = localExe
    ? {
        executablePath: localExe,
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      }
    : {
        executablePath: await chromium.executablePath(),
        args: chromium.args,
        headless: true,
      };
  const browser = await puppeteer.launch(launchOpts);

  let done = 0;
  for (const task of TASKS) {
    const { url, out, lang } = task;
    const page = await browser.newPage();
    try {
      await page.goto(`http://localhost:${PORT}${url}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
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
      // Voor vertaalde routes: wacht tot de statische vertaling is toegepast
      // (engine zet <html lang> pas na het laden + toepassen van het woordenboek).
      if (lang) {
        await page
          .waitForFunction((l) => document.documentElement.lang === l, { timeout: 15000 }, lang)
          .catch(() => {});
      }
      // Kleine marge zodat RouteSeo de <head>-meta heeft bijgewerkt en de na-passes klaar zijn.
      await new Promise((r) => setTimeout(r, lang ? 700 : 400));

      const html = await page.content();
      const outDir = out === '/' ? DIST : join(DIST, out);
      await mkdir(outDir, { recursive: true });
      await writeFile(join(outDir, 'index.html'), html, 'utf8');
      done++;
      console.log(`[prerender] ✓ ${url}`);
    } catch (e) {
      console.warn(`[prerender] ✗ ${url}: ${e && e.message ? e.message : e}`);
    } finally {
      await page.close().catch(() => {});
    }
  }

  await browser.close().catch(() => {});
  server.close();
  console.log(`[prerender] klaar: ${done}/${TASKS.length} pagina's geprerenderd`);
}

run().catch((e) => {
  console.warn('[prerender] overgeslagen wegens fout:', e && e.message ? e.message : e);
  process.exit(0);
});
