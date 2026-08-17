import React, { useState } from 'react';
import { Check, X, ArrowRight, ShieldCheck } from 'lucide-react';

interface CostComparisonProps {
  onStartMediation: () => void;
  brandPrimaryColor?: string;
}

export function CostComparison({ onStartMediation, brandPrimaryColor = '#10B981' }: CostComparisonProps) {
  const [claimAmount, setClaimAmount] = useState<number>(2500);

  // Grenzen van de slider
  const MIN_CLAIM = 200;
  const MAX_CLAIM = 15000;

  // Een traditioneel mediationtraject kost doorgaans € 1.200 – € 2.400 (zie kolom hierboven).
  // Grotere/complexere geschillen kosten meer uren, dus schalen we de kosten binnen die band
  // mee met het geschilbedrag. Zo beweegt de besparing echt mee met de slider.
  const TRAD_MIN = 1200;
  const TRAD_MAX = 2400;
  const rsolveCost = 3.99;

  const ratio = Math.min(1, Math.max(0, (claimAmount - MIN_CLAIM) / (MAX_CLAIM - MIN_CLAIM)));
  const traditionalCost = TRAD_MIN + ratio * (TRAD_MAX - TRAD_MIN);
  const estimatedSavings = Math.max(0, traditionalCost - rsolveCost);

  const euro = (n: number) =>
    n.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const euro0 = (n: number) => Math.round(n).toLocaleString('nl-NL');

  return (
    <section id="tarieven" className="py-20 md:py-28 bg-slate-950 border-b border-slate-800/80 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Tarieven &amp; Vergelijking
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-white font-extrabold tracking-tight">
            Waarom duizenden euro&apos;s betalen voor een conflict?
          </h2>
          <p className="text-base sm:text-lg text-slate-400 leading-relaxed font-light">
            Geschillen blijven vaak liggen omdat de drempel naar een advocaat te hoog en te duur is. RSolve maakt bemiddeling voor iedereen direct toegankelijk.
          </p>
        </div>

        {/* 3 Columns Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch mb-14">
          
          {/* Option 1: Lawyer */}
          <div className="bg-slate-900/60 rounded-2xl p-6 sm:p-8 border border-slate-800 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="text-xs font-semibold text-red-400 uppercase tracking-wider">
                Traditioneel
              </div>
              <h3 className="font-display text-xl font-bold text-white">
                Advocaat &amp; Rechtszaak
              </h3>
              <div className="space-y-1">
                <div className="text-3xl font-extrabold text-white">€250 – €380<span className="text-sm font-normal text-slate-400">/uur</span></div>
                <div className="text-xs text-red-400">Totaal doorgaans €2.500 – €7.500+</div>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed font-light">
                Standpunten verharden, communicatie verloopt via trage brieven en de relatie wordt permanent beschadigd.
              </p>
              <ul className="space-y-2.5 pt-2 text-xs text-slate-300">
                <li className="flex items-center gap-2 text-red-400">
                  <X className="w-4 h-4 shrink-0" />
                  <span>Doorlooptijd: 6 tot 18 maanden</span>
                </li>
                <li className="flex items-center gap-2 text-red-400">
                  <X className="w-4 h-4 shrink-0" />
                  <span>Geen garantie op een win-win uitkomst</span>
                </li>
                <li className="flex items-center gap-2 text-red-400">
                  <X className="w-4 h-4 shrink-0" />
                  <span>Hoge griffierechten en procesrisico</span>
                </li>
              </ul>
            </div>
            <div className="pt-4 border-t border-slate-800 text-xs text-slate-400 text-center">
              Escalerend &amp; kostbaar
            </div>
          </div>

          {/* Option 2: Human Mediator */}
          <div className="bg-slate-900/60 rounded-2xl p-6 sm:p-8 border border-slate-800 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                Fysieke Mediation
              </div>
              <h3 className="font-display text-xl font-bold text-white">
                Menselijke Mediator
              </h3>
              <div className="space-y-1">
                <div className="text-3xl font-extrabold text-white">€180 – €240<span className="text-sm font-normal text-slate-400">/uur</span></div>
                <div className="text-xs text-amber-400">Totaal gemiddeld €1.200 – €2.400</div>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed font-light">
                Constructief, maar vereist dat beide partijen gelijktijdig fysiek of via videocall bijeenkomen.
              </p>
              <ul className="space-y-2.5 pt-2 text-xs text-slate-300">
                <li className="flex items-center gap-2 text-amber-400">
                  <X className="w-4 h-4 shrink-0" />
                  <span>Wachttijd en agendaplanning nodig</span>
                </li>
                <li className="flex items-center gap-2 text-slate-200">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Focus op gezamenlijke afspraken</span>
                </li>
                <li className="flex items-center gap-2 text-amber-400">
                  <X className="w-4 h-4 shrink-0" />
                  <span>Hoge kosten per zittingsuur</span>
                </li>
              </ul>
            </div>
            <div className="pt-4 border-t border-slate-800 text-xs text-slate-400 text-center">
              Goed maar tijdrovend
            </div>
          </div>

          {/* Option 3: RSolve */}
          <div className="bg-slate-900 rounded-2xl p-6 sm:p-8 border-2 border-emerald-500/50 shadow-2xl flex flex-col justify-between space-y-6 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-slate-950 font-bold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
              Aanbevolen
            </div>

            <div className="space-y-4 pt-1">
              <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                RSolve AI Bemiddeling
              </div>
              <h3 className="font-display text-xl font-bold text-white">
                RSolve Online Dossier
              </h3>
              <div className="space-y-1">
                <div className="text-4xl font-black text-white">€3,99<span className="text-sm font-normal text-slate-400"> vast</span></div>
                <div className="text-xs text-emerald-400 font-semibold">Geen abonnement of verborgen kosten</div>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed font-light">
                Direct starten wanneer het jullie uitkomt. AI ontmantelt emoties en formuleert binnen 10 minuten een juridisch bindend akkoord.
              </p>
              <ul className="space-y-2.5 pt-2 text-xs text-slate-200">
                <li className="flex items-center gap-2 text-emerald-400">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>Oplossing in gemiddeld 10 minuten</span>
                </li>
                <li className="flex items-center gap-2 text-emerald-400">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>Inclusief Vaststellingsovereenkomst (Art. 7:900 BW)</span>
                </li>
                <li className="flex items-center gap-2 text-emerald-400">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>100% Neutraal, veilig en asynchroon</span>
                </li>
              </ul>
            </div>

            <button
              onClick={onStartMediation}
              className="w-full py-3 text-xs font-bold text-white rounded-xl shadow-lg transition-all cursor-pointer hover:opacity-95 text-center"
              style={{ backgroundColor: brandPrimaryColor }}
            >
              Start direct voor €3,99
            </button>
          </div>

        </div>

        {/* Interactive Savings Calculator */}
        <div className="bg-slate-900/90 rounded-2xl p-6 sm:p-8 border border-slate-800 max-w-3xl mx-auto space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="font-display text-lg font-bold text-white">
                Bereken je directe besparing
              </h4>
              <p className="text-xs text-slate-400">
                Vergelijk de kosten van RSolve met een traditioneel mediationtraject
              </p>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-400">Geschatte besparing:</div>
              <div className="text-2xl font-black text-emerald-400">€{euro(estimatedSavings)}</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-300">
              <span>Geschat geschilbedrag: €{euro0(claimAmount)}</span>
              <span className="text-slate-400">Traditioneel traject: ± €{euro0(traditionalCost)}</span>
            </div>
            <input
              type="range"
              min="200"
              max="15000"
              step="100"
              value={claimAmount}
              onChange={(e) => setClaimAmount(Number(e.target.value))}
              className="w-full accent-emerald-400 h-2 bg-slate-950 rounded-lg cursor-pointer"
            />
          </div>
        </div>

      </div>
    </section>
  );
}
