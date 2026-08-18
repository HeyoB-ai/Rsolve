import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Globe2, ChevronDown, Check } from 'lucide-react';
import { LANGS, NON_DEFAULT_LOCALES, setSiteLanguage, restoreDutch } from '../../../lib/i18n/engine';

const ACCENT = '#00E5FF';

// Roterende "Rsolve werkt in jouw taal" in veelvoorkomende talen.
const GREETINGS: { text: string; rtl?: boolean }[] = [
  { text: 'Rsolve werkt in jouw taal' },
  { text: 'Rsolve działa w Twoim języku' },
  { text: 'Rsolve works in your language' },
  { text: 'Rsolve працює вашою мовою' },
  { text: 'Rsolve يعمل بلغتك', rtl: true },
  { text: 'Rsolve senin dilinde çalışır' },
  { text: 'Rsolve funcționează în limba ta' },
  { text: 'Rsolve funciona en tu idioma' },
  { text: 'Rsolve работи на вашия език' },
];

// Haal de actieve taalcode uit het pad (/pl/... -> pl), anders 'nl'.
function localeFromPath(pathname: string): string {
  const seg = pathname.split('/').filter(Boolean)[0];
  return seg && NON_DEFAULT_LOCALES.includes(seg) ? seg : 'nl';
}

// Pad zonder taal-prefix (voor het omschakelen tussen talen).
function stripLocale(pathname: string): string {
  const parts = pathname.split('/').filter(Boolean);
  if (parts[0] && NON_DEFAULT_LOCALES.includes(parts[0])) parts.shift();
  return '/' + parts.join('/');
}

const LangBar: React.FC = () => {
  const [i, setI] = useState(0);
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const current = localeFromPath(location.pathname);

  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % GREETINGS.length), 2600);
    return () => clearInterval(t);
  }, []);

  const choose = (code: string) => {
    setOpen(false);
    if (code === current) return;
    const base = stripLocale(location.pathname);
    if (code === 'nl') {
      restoreDutch();
      navigate(base === '/' ? '/' : base);
    } else {
      // Meteen vertalen voor directe feedback; de route-wissel bevestigt de taal-URL.
      setSiteLanguage(code);
      const target = base === '/' ? `/${code}` : `/${code}${base}`;
      navigate(target);
    }
  };

  const g = GREETINGS[i];
  const cur = LANGS.find((l) => l.code === current) || LANGS[0];

  return (
    <div data-no-translate dir="ltr" className="w-full bg-slate-900 border-b border-slate-800 text-slate-200 relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Globe2 className="w-4 h-4 shrink-0" style={{ color: ACCENT }} />
          <span className="text-[13px] sm:text-sm font-medium truncate">
            <span key={i} dir={g.rtl ? 'rtl' : 'ltr'} className="text-white animate-in fade-in duration-500 inline-block">
              {g.text}
            </span>
            <span className="hidden md:inline text-slate-400"> · beschikbaar in 12 talen</span>
          </span>
        </div>

        <div className="relative shrink-0">
          <button
            onClick={() => setOpen((v) => !v)}
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg px-2.5 py-1 transition-colors"
            aria-haspopup="listbox"
            aria-expanded={open}
          >
            <Globe2 className="w-3.5 h-3.5" style={{ color: ACCENT }} />
            <span>{cur.label}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {open && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
              <ul
                role="listbox"
                className="absolute right-0 mt-1.5 z-50 w-44 max-h-80 overflow-auto bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1"
              >
                {LANGS.map((l) => (
                  <li key={l.code}>
                    <button
                      onClick={() => choose(l.code)}
                      className="w-full flex items-center justify-between gap-2 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800 transition-colors text-left"
                      dir={l.rtl ? 'rtl' : 'ltr'}
                    >
                      <span>
                        {l.label}
                        {l.code === 'nl' && <span className="text-slate-500 text-xs"> (origineel)</span>}
                      </span>
                      {l.code === current && <Check className="w-4 h-4 shrink-0" style={{ color: ACCENT }} />}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LangBar;
