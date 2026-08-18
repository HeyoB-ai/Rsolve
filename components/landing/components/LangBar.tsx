import React, { useEffect, useState } from 'react';
import { Globe2, ArrowRight } from 'lucide-react';

const ACCENT = '#00E5FF';

// "Rsolve werkt in jouw taal" in de talen die in Nederland veel voorkomen.
// De boodschap staat in de eigen taal/schrift, zodat een anderstalige bezoeker
// zich meteen aangesproken voelt (belangrijker dan vlaggetjes).
const GREETINGS: { lang: string; text: string; rtl?: boolean }[] = [
  { lang: 'Nederlands', text: 'Rsolve werkt in jouw taal' },
  { lang: 'Polski', text: 'Rsolve działa w Twoim języku' },
  { lang: 'English', text: 'Rsolve works in your language' },
  { lang: 'Українська', text: 'Rsolve працює вашою мовою' },
  { lang: 'العربية', text: 'Rsolve يعمل بلغتك', rtl: true },
  { lang: 'Türkçe', text: 'Rsolve senin dilinde çalışır' },
  { lang: 'Română', text: 'Rsolve funcționează în limba ta' },
  { lang: 'Español', text: 'Rsolve funciona en tu idioma' },
  { lang: 'Български', text: 'Rsolve работи на вашия език' },
];

interface Props {
  onStart?: () => void;
}

const LangBar: React.FC<Props> = ({ onStart }) => {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % GREETINGS.length), 2600);
    return () => clearInterval(t);
  }, []);

  const g = GREETINGS[i];

  return (
    <div className="w-full bg-slate-900 border-b border-slate-800 text-slate-200">
      <button
        onClick={onStart}
        className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-center gap-2.5 text-center cursor-pointer group"
        aria-label="Rsolve werkt in meer dan 25 talen — start in je eigen taal"
      >
        <Globe2 className="w-4 h-4 shrink-0" style={{ color: ACCENT }} />
        <span className="text-[13px] sm:text-sm font-medium">
          <span
            key={i}
            dir={g.rtl ? 'rtl' : 'ltr'}
            className="text-white animate-in fade-in duration-500 inline-block"
          >
            {g.text}
          </span>
          <span className="hidden sm:inline text-slate-400"> · beschikbaar in 25+ talen — typ gewoon in je eigen taal</span>
        </span>
        <span
          className="hidden sm:inline-flex items-center gap-1 text-[13px] font-semibold group-hover:gap-1.5 transition-all shrink-0"
          style={{ color: ACCENT }}
        >
          Start <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </button>
    </div>
  );
};

export default LangBar;
