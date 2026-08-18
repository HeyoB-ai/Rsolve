// Extractie: rendert de kernpagina's in headless Chrome en verzamelt de unieke,
// vertaalbare Nederlandse tekststrings (zelfde filter als de runtime-applier).
// Output: scripts/i18n-source.json  ->  { strings: [...], perRoute: {route: [...]} }
import http from 'node:http';
import { readFile, writeFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const ROOT = dirname(fileURLToPath(import.meta.url)) + '/..';
const DIST = join(ROOT, 'dist');
const PORT = 4199;
const EXE = process.env.PUPPETEER_EXECUTABLE_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

const ROUTES = [
  '/',
  '/arbeidsconflict-oplossen',
  '/conflict-met-werkgever',
  '/burenruzie-oplossen',
  '/huurconflict-oplossen',
  '/wat-is-mediation',
  '/hoe-werkt-rsolve',
  '/kosten',
];

const MIME = { '.html':'text/html;charset=utf-8','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.woff2':'font/woff2','.ico':'image/x-icon','.txt':'text/plain','.xml':'application/xml','.webp':'image/webp' };

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
    } catch { res.writeHead(500); res.end('err'); }
  });
  return new Promise((r) => server.listen(PORT, () => r(server)));
}

// Zelfde skip-logica als de runtime applier (lib/i18n/engine.ts).
const COLLECT = `(() => {
  function shouldSkip(text){
    const t=text.trim();
    if(t.length<2) return true;
    if(!/[A-Za-zÀ-ÿ]/.test(t)) return true;          // moet minstens een latijnse letter hebben
    if(/^(rsolve|rsolve\\.app|rsolve\\.nl)$/i.test(t)) return true;
    return false;
  }
  const out=[];
  const w=document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, { acceptNode(n){
    const p=n.parentElement; if(!p) return NodeFilter.FILTER_REJECT;
    const tag=p.tagName; if(tag==='SCRIPT'||tag==='STYLE'||tag==='NOSCRIPT') return NodeFilter.FILTER_REJECT;
    if(p.closest('[data-no-translate]')) return NodeFilter.FILTER_REJECT;
    if(shouldSkip(n.nodeValue||'')) return NodeFilter.FILTER_REJECT;
    return NodeFilter.FILTER_ACCEPT;
  }});
  let n; while((n=w.nextNode())) out.push((n.nodeValue||'').trim());
  return out;
})()`;

async function run() {
  const server = await startServer();
  const browser = await puppeteer.launch({ executablePath: EXE, headless: true, args:['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage'] });
  const all = new Set();
  const perRoute = {};
  for (const route of ROUTES) {
    const page = await browser.newPage();
    try {
      await page.goto(`http://localhost:${PORT}${route}`, { waitUntil:'networkidle0', timeout:30000 });
      await page.waitForFunction(() => { const r=document.getElementById('root'); return r && (r.innerText||'').trim().length>60; }, { timeout:15000 }).catch(()=>{});
      await new Promise((r)=>setTimeout(r,700));
      const strings = await page.evaluate(COLLECT);
      const uniq = Array.from(new Set(strings));
      perRoute[route] = uniq;
      uniq.forEach((s)=>all.add(s));
      console.log(`[extract] ${route}: ${uniq.length} strings`);
    } catch (e) {
      console.warn(`[extract] ✗ ${route}: ${e.message}`);
    } finally { await page.close().catch(()=>{}); }
  }
  await browser.close().catch(()=>{});
  server.close();
  const strings = Array.from(all).sort((a,b)=>a.localeCompare(b,'nl'));
  await writeFile(join(ROOT,'scripts','i18n-source.json'), JSON.stringify({ count: strings.length, strings, perRoute }, null, 2), 'utf8');
  console.log(`[extract] TOTAAL uniek: ${strings.length} -> scripts/i18n-source.json`);
}
run().catch((e)=>{ console.error(e); process.exit(1); });
