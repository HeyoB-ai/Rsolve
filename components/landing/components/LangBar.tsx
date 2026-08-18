import React, { useEffect, useState } from 'react';
import { Globe2, ChevronDown, Check, Loader2 } from 'lucide-react';
import { translatePage, restoreOriginal } from '../../../lib/pageTranslate';

const ACCENT = '#00E5FF';

// "Rsolve werkt in jouw taal" in de talen die in Nederland veel voorkomen.
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

// code = html lang / RTL-detectie · label = weergave · name = doeltaal voor de vertaler
const LANGS: { code: string; label: string; name: string }[] = [
  { code: 'nl', label: 'Nederlands', name: 'Nederlands' },
  { code: 'pl', label: 'Polski', name: 'Polish' },
  { code: 'en', label: 'English', name: 'English' },
  { code: 'de', label: 'Deutsch', name: 'German' },
  { code: 'uk', label: 'Українська', name: 'Ukrainian' },
  { code: 'ar', label: 'العربية', name: 'Arabic' },
  { code: 'tr', label: 'Türkçe', name: 'Turkish' },
  { code: 'ro', label: 'Română', name: 'Romanian' },
  { code: 'es', label: 'Español', name: 'Spanish' },
  { code: 'fr', label: 'Français', name: 'French' },
  { code: 'bg', label: 'Български', name: 'Bulgarian' },
  { code: 'pt', label: 'Português', name: 'Portuguese' },
];

const LangBar: React.FC = () => {
  const [i, setI] = useState(0);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [current, setCurrent] = useState('nl');

  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % GREETINGS.length), 2600);
    return () => clearInterval(t);
  }, []);

  const choose = async (l: { code: string; label: string; name: string }) => {
    setOpen(false);
    if (l.code === current) return;
    setCurrent(l.code);
    if (l.code === 'nl') {
      restoreOriginal();
      return;
    }
    setBusy(true);
    try {
      await translatePage(l.code, l.name);
    } finally {
      setBusy(false);
    }
  };

  const g = GREETINGS[i];
  const cur = LANGS.find((l) => l.code === current) || LANGS[0];

  return (
    <div data-no-translate className="w-full bg-slate-900 border-b border-slate-800 text-slate-200 relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Globe2 className="w-4 h-4 shrink-0" style={{ color: ACCENT }} />
          <span className="text-[13px] sm:text-sm font-medium truncate">
            <span key={i} dir={g.rtl ? 'rtl' : 'ltr'} className="text-white animate-in fade-in duration-500 inline-block">
              {g.text}
            </span>
            <span className="hidden md:inline text-slate-400"> · beschikbaar in 25+ talen</span>
          </span>
        </div>

        <div className="relative shrink-0">
          <button
            onClick={() => setOpen((v) => !v)}
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg px-2.5 py-1 transition-colors"
            aria-haspopup="listbox"
            aria-expanded={open}
          >
            {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: ACCENT }} /> : <Globe2 className="w-3.5 h-3.5" style={{ color: ACCENT }} />}
            <span>{busy ? 'Vertalen…' : cur.label}</span>
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
                      onClick={() => choose(l)}
                      className="w-full flex items-center justify-between gap-2 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800 transition-colors text-left"
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

      {busy && (
        <div className="w-full bg-cyan-500/10 border-t border-cyan-400/20 text-center py-1 text-[11px] text-cyan-200">
          De pagina wordt automatisch vertaald — even geduld…
        </div>
      )}
    </div>
  );
};

export default LangBar;
