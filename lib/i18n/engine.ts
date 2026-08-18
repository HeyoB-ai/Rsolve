// Statische paginavertaling (geen runtime-AI). Past een vooraf gegenereerd
// woordenboek (public/i18n/<code>.json) toe op de zichtbare tekst-nodes.
// Betrouwbaar, direct, gratis per bezoeker en prerender-baar voor Google.
//
// Elementen met [data-no-translate] (o.a. de taalbalk) worden overgeslagen.
// Onbekende strings blijven gewoon Nederlands (veilige terugval).

export type LangMeta = { code: string; label: string; name: string; rtl?: boolean };

// Nederlands = origineel. De rest heeft een statisch woordenboek.
export const LANGS: LangMeta[] = [
  { code: 'nl', label: 'Nederlands', name: 'Nederlands' },
  { code: 'pl', label: 'Polski', name: 'Polish' },
  { code: 'en', label: 'English', name: 'English' },
  { code: 'de', label: 'Deutsch', name: 'German' },
  { code: 'uk', label: 'Українська', name: 'Ukrainian' },
  { code: 'ar', label: 'العربية', name: 'Arabic', rtl: true },
  { code: 'tr', label: 'Türkçe', name: 'Turkish' },
  { code: 'ro', label: 'Română', name: 'Romanian' },
  { code: 'es', label: 'Español', name: 'Spanish' },
  { code: 'fr', label: 'Français', name: 'French' },
  { code: 'bg', label: 'Български', name: 'Bulgarian' },
  { code: 'pt', label: 'Português', name: 'Portuguese' },
];

export const SITE_LOCALES = LANGS.map((l) => l.code);
export const NON_DEFAULT_LOCALES = SITE_LOCALES.filter((c) => c !== 'nl');
export const RTL_LOCALES = new Set(LANGS.filter((l) => l.rtl).map((l) => l.code));

type Dict = Record<string, string>;

const dictCache: Record<string, Dict | undefined> = {};
const inFlight: Record<string, Promise<Dict> | undefined> = {};
// Bewaar het origineel per node zodat we terug kunnen naar het Nederlands.
const originals = new WeakMap<Text, string>();

let currentLang = 'nl';
let observer: MutationObserver | null = null;

export function getCurrentLang(): string {
  return currentLang;
}

async function loadDict(code: string): Promise<Dict> {
  if (dictCache[code]) return dictCache[code]!;
  if (inFlight[code]) return inFlight[code]!;
  const p = fetch(`/i18n/${code}.json`, { cache: 'force-cache' })
    .then((r) => (r.ok ? r.json() : {}))
    .then((d: Dict) => {
      dictCache[code] = d || {};
      return dictCache[code]!;
    })
    .catch(() => {
      dictCache[code] = {};
      return dictCache[code]!;
    })
    .finally(() => {
      inFlight[code] = undefined;
    });
  inFlight[code] = p;
  return p;
}

function skipParent(el: Element | null): boolean {
  if (!el) return true;
  const tag = el.tagName;
  if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT' || tag === 'CODE' || tag === 'PRE') return true;
  if (el.closest('[data-no-translate]')) return true;
  return false;
}

// Vervang de tekst van één node volgens het woordenboek; behoud spaties eromheen.
function translateNode(node: Text, dict: Dict) {
  const raw = node.nodeValue || '';
  const key = raw.trim();
  if (key.length < 2) return;
  const tr = dict[key];
  if (!tr || tr === key) return;
  if (!originals.has(node)) originals.set(node, raw);
  // Behoud voor-/achterloop-witruimte van het origineel.
  const lead = raw.match(/^\s*/)?.[0] ?? '';
  const trail = raw.match(/\s*$/)?.[0] ?? '';
  const next = lead + tr + trail;
  if (node.nodeValue !== next) node.nodeValue = next;
}

function walkAndTranslate(root: Node, dict: Dict) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(n) {
      const p = (n as Text).parentElement;
      if (skipParent(p)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  } as any);
  let n: Node | null;
  const batch: Text[] = [];
  while ((n = walker.nextNode())) batch.push(n as Text);
  batch.forEach((t) => translateNode(t, dict));
}

function startObserver(dict: Dict) {
  stopObserver();
  observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.type === 'characterData') {
        const t = m.target as Text;
        if (!skipParent(t.parentElement)) translateNode(t, dict);
      } else {
        m.addedNodes.forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            if (!skipParent((node as Text).parentElement)) translateNode(node as Text, dict);
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            if (!skipParent(node as Element)) walkAndTranslate(node, dict);
          }
        });
      }
    }
  });
  observer.observe(document.body, { childList: true, characterData: true, subtree: true });
}

function stopObserver() {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
}

function setHtmlLangDir(code: string) {
  const html = document.documentElement;
  html.setAttribute('lang', code);
  html.setAttribute('dir', RTL_LOCALES.has(code) ? 'rtl' : 'ltr');
}

export function restoreDutch() {
  stopObserver();
  currentLang = 'nl';
  setHtmlLangDir('nl');
  // Zet alle bekende nodes terug op hun Nederlandse origineel.
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
  let n: Node | null;
  while ((n = walker.nextNode())) {
    const t = n as Text;
    const orig = originals.get(t);
    if (orig !== undefined && t.nodeValue !== orig) t.nodeValue = orig;
  }
  try {
    localStorage.setItem('rsolve_site_lang', 'nl');
  } catch {}
  (window as any).__rsolveLang = 'nl';
}

// Zet de sitetaal: laad het woordenboek, vertaal alles wat er nu staat en houd
// nieuwe/gewijzigde nodes bij via een observer. Voor 'nl' -> terug naar origineel.
export async function setSiteLanguage(code: string): Promise<void> {
  if (!SITE_LOCALES.includes(code) || code === 'nl') {
    restoreDutch();
    return;
  }
  currentLang = code;
  const dict = await loadDict(code);
  setHtmlLangDir(code);
  walkAndTranslate(document.body, dict);
  startObserver(dict);
  // Kleine na-pass voor nodes die net na de eerste render binnenkwamen.
  setTimeout(() => walkAndTranslate(document.body, dict), 60);
  setTimeout(() => walkAndTranslate(document.body, dict), 300);
  try {
    localStorage.setItem('rsolve_site_lang', code);
  } catch {}
  (window as any).__rsolveLang = code;
}
