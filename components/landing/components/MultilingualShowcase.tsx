import React, { useState } from 'react';
import { Globe2, ArrowRightLeft, Sparkles, CheckCircle2, Shield } from 'lucide-react';

interface LangExample {
  langA: string;
  langAName: string;
  flagA: string;
  textA: string;
  langB: string;
  langBName: string;
  flagB: string;
  textBOriginal: string;
  textBTranslatedAndCalmed: string;
}

const EXAMPLES: LangExample[] = [
  {
    langA: 'nl',
    langAName: 'Nederlands',
    flagA: '🇳🇱',
    textA: 'We wachten nu al 3 weken op de revisie. Als dit morgen niet af is ontbind ik het contract per direct.',
    langB: 'pl',
    langBName: 'Pools (Polski)',
    flagB: '🇵🇱',
    textBOriginal: 'Czekamy już 3 tygodnie na poprawki. Jeśli to nie będzie gotowe jutro, zrywam umowę.',
    textBTranslatedAndCalmed: 'Strona A podkreśla pilną potrzebę finalizacji poprawek, aby móc kontynuować współpracę bez opóźnień.'
  },
  {
    langA: 'nl',
    langAName: 'Nederlands',
    flagA: '🇳🇱',
    textA: 'Het is onzin dat de hond zoveel blaft. Jullie overdrijven zwaar.',
    langB: 'en',
    langBName: 'Engels (English)',
    flagB: '🇬🇧',
    textBOriginal: 'It is complete nonsense that the dog barks so much. You are exaggerating.',
    textBTranslatedAndCalmed: 'Party A indicates that in their perception the noise is limited, but wants to explore constructive measures to preserve neighborly peace.'
  },
  {
    langA: 'nl',
    langAName: 'Nederlands',
    flagA: '🇳🇱',
    textA: 'Ik wil dat de borg binnen 48 uur op mijn rekening staat, anders stuur ik een incassobureau.',
    langB: 'es',
    langBName: 'Spaans (Español)',
    flagB: '🇪🇸',
    textBOriginal: 'Quiero la devolución de la fianza en 48h o enviaré una agencia de cobros.',
    textBTranslatedAndCalmed: 'La Parte A solicita una fecha de liquidación clara para la fianza con el fin de cerrar el acuerdo de forma amistosa.'
  }
];

interface MultilingualShowcaseProps {
  brandPrimaryColor?: string;
}

export function MultilingualShowcase({ brandPrimaryColor = '#10B981' }: MultilingualShowcaseProps) {
  const [selectedExample, setSelectedExample] = useState(0);
  const current = EXAMPLES[selectedExample];

  return (
    <section id="meertalig" className="py-20 md:py-28 bg-slate-950 border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Meertalige Bemiddeling
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-white font-extrabold tracking-tight">
            Iedereen communiceert in zijn eigen moedertaal
          </h2>
          <p className="text-base sm:text-lg text-slate-400 leading-relaxed font-light">
            Taalbarrières verergeren misverstanden. RSolve vertaalt niet alleen accuraat, maar neutraliseert tegelijkertijd emotionele fricties over taalgrenzen heen.
          </p>
        </div>

        {/* Language selector chips */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {EXAMPLES.map((ex, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedExample(idx)}
              className={`px-4 py-2.5 rounded-xl text-xs font-medium transition-all flex items-center gap-2 cursor-pointer ${
                selectedExample === idx
                  ? 'bg-slate-800 text-white border border-slate-700 shadow-md font-semibold'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <span>{ex.flagA} {ex.langAName}</span>
              <ArrowRightLeft className="w-3.5 h-3.5 opacity-40" />
              <span>{ex.flagB} {ex.langBName}</span>
            </button>
          ))}
        </div>

        {/* Dual-Panel Card */}
        <div className="bg-slate-900/70 rounded-2xl p-6 sm:p-8 max-w-4xl mx-auto border border-slate-800 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            
            {/* Column A: Dutch Raw input */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{current.flagA}</span>
                  <span className="font-semibold text-xs text-white">{current.langAName} (Partij A)</span>
                </div>
                <span className="text-[10px] bg-red-950/80 text-red-300 border border-red-800/40 px-2 py-0.5 rounded font-medium">
                  Ongefilterde Invoer
                </span>
              </div>

              <div className="p-4 bg-slate-950/80 border border-red-950/80 rounded-xl text-xs sm:text-sm text-red-200/90 italic leading-relaxed">
                &quot;{current.textA}&quot;
              </div>

              <div className="text-xs text-slate-400 font-light">
                Partij A kan direct in het Nederlands typen zonder zorgen over toon of escalatie.
              </div>
            </div>

            {/* Column B: Translated & Calmed Output */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{current.flagB}</span>
                  <span className="font-semibold text-xs text-white">{current.langBName} (Partij B)</span>
                </div>
                <span className="text-[10px] bg-emerald-950/80 text-emerald-300 border border-emerald-800/40 px-2 py-0.5 rounded font-medium flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-emerald-400" /> Neutraal Vertaald
                </span>
              </div>

              <div className="p-4 bg-slate-950/80 border border-emerald-950/80 rounded-xl text-xs sm:text-sm text-emerald-100 leading-relaxed font-light">
                &quot;{current.textBTranslatedAndCalmed}&quot;
              </div>

              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Respectvolle toon met focus op het werkelijke doel</span>
              </div>
            </div>

          </div>

          {/* Bottom badge */}
          <div className="mt-8 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Ondersteunt meer dan <strong className="text-white">25+ talen</strong> (o.a. Nederlands, Engels, Pools, Spaans, Arabisch, Turks, Duits, Frans).</span>
            </div>
            <span className="text-slate-300 font-medium">Real-time &amp; Automatisch</span>
          </div>
        </div>

      </div>
    </section>
  );
}
