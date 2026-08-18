import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { LANDINGS } from '../pages/landings/data';
import { LEGAL } from '../pages/legal/data';
import { NON_DEFAULT_LOCALES, SITE_LOCALES } from '../lib/i18n/engine';

// Routes waarvoor vaste vertalingen bestaan (v1). Alleen hiervoor tonen we
// hreflang-alternatieven en vertaalde meta.
const LOCALIZED_ROUTES = new Set<string>([
  '/',
  '/wat-is-mediation',
  '/hoe-werkt-rsolve',
  '/kosten',
  '/arbeidsconflict-oplossen',
  '/conflict-met-werkgever',
  '/burenruzie-oplossen',
  '/huurconflict-oplossen',
]);

// og-locale codes per taal.
const OG_LOCALE: Record<string, string> = {
  nl: 'nl_NL', pl: 'pl_PL', en: 'en_US', de: 'de_DE', uk: 'uk_UA', ar: 'ar_AR',
  tr: 'tr_TR', ro: 'ro_RO', es: 'es_ES', fr: 'fr_FR', bg: 'bg_BG', pt: 'pt_PT',
};

// In-memory cache van de vertaalde meta (title/description) per taal.
const metaCache: Record<string, Record<string, { title?: string; description?: string }> | undefined> = {};
async function loadMeta(code: string) {
  if (metaCache[code]) return metaCache[code]!;
  try {
    const r = await fetch(`/i18n/meta.${code}.json`, { cache: 'force-cache' });
    metaCache[code] = r.ok ? await r.json() : {};
  } catch {
    metaCache[code] = {};
  }
  return metaCache[code]!;
}

function localeFromPath(pathname: string): string {
  const seg = pathname.split('/').filter(Boolean)[0];
  return seg && NON_DEFAULT_LOCALES.includes(seg) ? seg : 'nl';
}
function stripLocale(pathname: string): string {
  const parts = pathname.split('/').filter(Boolean);
  if (parts[0] && NON_DEFAULT_LOCALES.includes(parts[0])) parts.shift();
  return '/' + parts.join('/');
}
function localeHref(code: string, basePath: string): string {
  const base = basePath === '/' ? '' : basePath;
  return code === 'nl' ? SITE + (base || '/') : `${SITE}/${code}${base || ''}`;
}

// Centrale, per-route SEO-meta. Zonder extra dependency: we zetten document.title,
// description, Open Graph, canonical en robots afhankelijk van het pad. Google rendert
// JS, dus deze client-side updates worden meegenomen. Privé app-routes krijgen noindex.

const SITE = 'https://rsolve.app';
const DEFAULT_TITLE = 'Rsolve — Conflicten oplossen zonder strijd | Online AI-mediation';
const DEFAULT_DESC =
  'Rsolve is een online AI-mediator die twee partijen helpt hun conflict snel, neutraal en betaalbaar op te lossen — inclusief rechtsgeldige vaststellingsovereenkomst. Vast tarief €3,99, deelname gratis voor de andere partij.';

const META: Record<string, { title?: string; description: string }> = {
  '/': { description: DEFAULT_DESC },
  '/zakelijk': {
    title: 'Voor bedrijven',
    description: 'Zakelijke conflicten snel en zonder dure procedures oplossen met Rsolve. Neutrale AI-bemiddeling voor werkgevers, ondernemers en teams.',
  },
  '/partners': {
    title: 'Voor advocaten & mediators',
    description: 'Word partner van Rsolve. Ontvang doorverwezen zaken uit ons netwerk en versterk uw praktijk met vastgelegde, gedocumenteerde dossiers.',
  },
  '/kosten-conflict': {
    title: 'Wat een conflict kost',
    description: 'Ontdek wat een onopgelost conflict u werkelijk kost aan geld, tijd en relaties — en hoe Rsolve dat voor €3,99 helpt voorkomen.',
  },
  '/juridische-hulp': {
    title: 'Juridische hulp',
    description: 'Loopt de bemiddeling vast? Rsolve verwijst u door naar een advocaat, mediator of Het Juridisch Loket — met uw complete dossier bij de hand.',
  },
  '/contact': {
    title: 'Contact',
    description: 'Neem contact op met Rsolve (Clareco bv) in Breda. Vragen over online mediation, samenwerking of de app? Wij helpen u graag verder.',
  },
  '/wat-is-mediation': {
    title: 'Wat is mediation?',
    description: 'Mediation lost conflicten op zonder rechter. Rsolve maakt dit met AI toegankelijker, neutraler en betaalbaarder dan een traditioneel traject.',
  },
  '/hoe-werkt-rsolve': {
    title: 'Hoe werkt Rsolve?',
    description: 'In drie stappen naar een oplossing: aanmelding, begeleide dialoog en een rechtsgeldige vaststellingsovereenkomst. Zo werkt Rsolve.',
  },
  '/kosten': {
    title: 'Tarieven',
    description: 'Transparante prijs: één vast bedrag van €3,99 per dossier. Geen abonnement, geen verborgen kosten. Deelname is gratis voor de uitgenodigde partij.',
  },
  '/privacy': {
    title: 'Privacybeleid',
    description: 'Hoe Rsolve omgaat met uw gegevens. Versleutelde gesprekken en AI-verwerking conform de AVG/GDPR.',
  },
  '/terms': {
    title: 'Voorwaarden',
    description: 'De gebruikersvoorwaarden van Rsolve. Wij bieden ondersteuning bij bemiddeling; dit is geen juridisch advies.',
  },
};

// Voeg de SEO-landingspagina's toe uit hetzelfde datamodel (één bron van waarheid).
for (const [slug, c] of Object.entries(LANDINGS)) {
  META[slug] = { title: c.seoTitle, description: c.metaDescription };
}
for (const [slug, d] of Object.entries(LEGAL)) {
  META[slug] = { title: d.seoTitle, description: d.metaDescription };
}

// Privé routes: niet indexeren (ook via robots.txt afgeschermd).
const PRIVATE = /^\/(mediation|vso|payment|payment-complete|invite|invite-partner)(\/|$)/;

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertCanonical(href: string) {
  let el = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

// Vervang alle hreflang-alternatieven door de meegegeven set.
function setAlternates(pairs: { hreflang: string; href: string }[]) {
  document.head.querySelectorAll('link[data-rs-alt]').forEach((el) => el.remove());
  for (const p of pairs) {
    const el = document.createElement('link');
    el.setAttribute('rel', 'alternate');
    el.setAttribute('hreflang', p.hreflang);
    el.setAttribute('href', p.href);
    el.setAttribute('data-rs-alt', '1');
    document.head.appendChild(el);
  }
}

export default function RouteSeo() {
  const { pathname } = useLocation();

  useEffect(() => {
    const isPrivate = PRIVATE.test(pathname);
    const lang = localeFromPath(pathname);
    const basePath = stripLocale(pathname);
    const m = META[basePath];
    const localizable = LOCALIZED_ROUTES.has(basePath) && !isPrivate;

    // Basis (Nederlandse) title/description.
    let title = m?.title ? `${m.title} | Rsolve` : DEFAULT_TITLE;
    let description = m?.description || DEFAULT_DESC;

    const url = localeHref(lang, basePath);
    document.documentElement.setAttribute('lang', lang);

    const apply = () => {
      document.title = title;
      upsertMeta('name', 'description', description);
      upsertMeta('name', 'robots', isPrivate ? 'noindex,nofollow' : 'index,follow');
      upsertMeta('property', 'og:title', title);
      upsertMeta('property', 'og:description', description);
      upsertMeta('property', 'og:url', url);
      upsertMeta('property', 'og:locale', OG_LOCALE[lang] || 'nl_NL');
      upsertMeta('name', 'twitter:title', title);
      upsertMeta('name', 'twitter:description', description);
      upsertCanonical(url);

      // hreflang-alternatieven (+ x-default = Nederlands) alleen voor vertaalde routes.
      if (localizable) {
        const pairs = SITE_LOCALES.map((c) => ({ hreflang: c, href: localeHref(c, basePath) }));
        pairs.push({ hreflang: 'x-default', href: localeHref('nl', basePath) });
        setAlternates(pairs);
      } else {
        setAlternates([]);
      }
    };

    apply();

    // Vertaalde meta ophalen (indien beschikbaar) en opnieuw toepassen.
    if (localizable && lang !== 'nl') {
      loadMeta(lang).then((mm) => {
        const t = mm[basePath];
        if (t) {
          if (t.title) title = basePath === '/' ? t.title : `${t.title} | Rsolve`;
          if (t.description) description = t.description;
          apply();
        }
      });
    }
  }, [pathname]);

  return null;
}
