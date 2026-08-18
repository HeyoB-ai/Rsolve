// Live paginavertaling. Verzamelt de zichtbare tekst-nodes, vertaalt ze in bulk
// via /.netlify/functions/translate-batch en vervangt de tekst. Elementen met
// [data-no-translate] (o.a. de taalbalk zelf) worden overgeslagen.
//
// Let op: dit is machinevertaling over een React-app. Statische tekst vertaalt prima;
// tekst in interactieve widgets kan na een klik terugspringen naar het origineel.

type Snap = { node: Text; original: string };

let snapshot: Snap[] | null = null;
const cache: Record<string, Map<string, string>> = {};

const RTL = new Set(['ar', 'he', 'fa', 'ur']);

function shouldSkip(text: string): boolean {
  const t = text.trim();
  if (t.length < 2) return true;
  if (!/[A-Za-zÀ-ÿА-яҐ-ґЀ-ӿأ-ي]/.test(t)) return true; // geen letters -> overslaan (cijfers/symbolen)
  if (/^(rsolve|rsolve\.app)$/i.test(t)) return true;
  return false;
}

function collect(): Snap[] {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(n) {
      const p = (n as Text).parentElement;
      if (!p) return NodeFilter.FILTER_REJECT;
      const tag = p.tagName;
      if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT') return NodeFilter.FILTER_REJECT;
      if (p.closest('[data-no-translate]')) return NodeFilter.FILTER_REJECT;
      if (shouldSkip(n.nodeValue || '')) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  } as any);
  const out: Snap[] = [];
  let n: Node | null;
  while ((n = walker.nextNode())) out.push({ node: n as Text, original: (n as Text).nodeValue || '' });
  return out;
}

async function callBatch(texts: string[], targetLanguage: string): Promise<string[]> {
  try {
    const res = await fetch('/.netlify/functions/translate-batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texts, targetLanguage }),
    });
    const data = await res.json();
    return Array.isArray(data?.result) && data.result.length === texts.length ? data.result : texts;
  } catch {
    return texts;
  }
}

export function restoreOriginal(): void {
  document.documentElement.setAttribute('dir', 'ltr');
  document.documentElement.setAttribute('lang', 'nl');
  if (snapshot) snapshot.forEach((s) => (s.node.nodeValue = s.original));
}

export async function translatePage(code: string, targetLanguage: string): Promise<void> {
  if (!snapshot) snapshot = collect();

  document.documentElement.setAttribute('dir', RTL.has(code) ? 'rtl' : 'ltr');
  document.documentElement.setAttribute('lang', code);

  let map = cache[code];
  if (!map) {
    map = new Map<string, string>();
    const uniq = Array.from(new Set(snapshot.map((s) => s.original.trim())));
    const CHUNK = 60;
    const chunks: string[][] = [];
    for (let i = 0; i < uniq.length; i += CHUNK) chunks.push(uniq.slice(i, i + CHUNK));
    const results = await Promise.all(chunks.map((c) => callBatch(c, targetLanguage)));
    chunks.forEach((c, ci) => c.forEach((s, si) => map!.set(s, results[ci][si] || s)));
    cache[code] = map;
  }

  snapshot.forEach((s) => {
    const key = s.original.trim();
    const tr = map!.get(key);
    if (tr && tr !== key) s.node.nodeValue = s.original.replace(key, tr);
  });
}
