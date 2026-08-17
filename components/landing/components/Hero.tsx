import React, { useState } from 'react';
import { ArrowRight, ShieldCheck, Clock, CheckCircle2, FileText, Sparkles, MessageSquare } from 'lucide-react';

interface HeroProps {
  onSelectScenario: (scenarioId: string) => void;
  onStartMediation: () => void;
  brandPrimaryColor: string;
}

export function Hero({ onSelectScenario, onStartMediation, brandPrimaryColor }: HeroProps) {
  const [quickInput, setQuickInput] = useState('');

  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-slate-800/80 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      
      {/* Subtle soft ambient light */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] rounded-full blur-3xl pointer-events-none opacity-15"
        style={{ backgroundColor: brandPrimaryColor }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          
          {/* Left Column: Clear Value Proposition */}
          <div className="lg:col-span-7 space-y-7">
            
            {/* Trust Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs text-slate-300 shadow-xs">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: brandPrimaryColor }} />
              <span className="font-medium">Intelligente AI Mediation • Art. 7:900 BW Rechtsgeldig</span>
            </div>

            {/* Headline: Clean, Calm & Authoritative */}
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-white font-extrabold tracking-tight leading-[1.1]">
              Conflicten oplossen in <span style={{ color: brandPrimaryColor }}>10 minuten</span>. Zonder advocaat of escalatie.
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl font-light">
              RSolve brengt beide partijen kalm en neutraal samen. Typ in je eigen bewoordingen, ontdek elkaars werkelijke belangen en ontvang direct een bindende vaststellingsovereenkomst.
            </p>

            {/* Action Card */}
            <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800 shadow-xl space-y-4">
              
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Probeer direct een situatie:
              </div>

              {/* Scenario chips */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'buren-erfgrens', label: '🏡 Buren & Tuin' },
                  { id: 'zakelijk-factuur', label: '💼 Freelance Factuur' },
                  { id: 'huur-borg', label: '🔑 Huurborg' },
                  { id: 'werk-team', label: '🤝 Werkplek' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectScenario(item.id);
                      const el = document.getElementById('simulator');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="text-xs font-medium px-3 py-2 rounded-xl bg-slate-950/70 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-all text-slate-200 text-left truncate cursor-pointer"
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Freeform input + start button */}
              <div className="pt-1 flex flex-col sm:flex-row gap-2.5">
                <input
                  type="text"
                  value={quickInput}
                  onChange={(e) => setQuickInput(e.target.value)}
                  placeholder="Waar gaat het conflict over? (bijv. borg of factuur)"
                  className="flex-1 px-4 py-3 text-sm bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:border-slate-600 text-white placeholder-slate-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && quickInput.trim()) {
                      onStartMediation();
                    }
                  }}
                />
                <button
                  onClick={onStartMediation}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold text-white rounded-xl shadow-lg transition-all whitespace-nowrap cursor-pointer hover:opacity-95 active:scale-[0.98]"
                  style={{ backgroundColor: brandPrimaryColor }}
                >
                  <span>Start Bemiddeling</span>
                  <span className="opacity-70 text-xs font-normal">• €3,99</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 3 Key Trust Points */}
            <div className="flex flex-wrap items-center gap-6 pt-1 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-300 shrink-0" />
                <span>Gemiddeld <strong>10 minuten</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-slate-300 shrink-0" />
                <span>Wettelijk bindend (Art. 7:900 BW)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-slate-300 shrink-0" />
                <span>100% Neutraal &amp; Vertrouwelijk</span>
              </div>
            </div>

          </div>

          {/* Right Column: Serene, Human Mediation Chat Preview */}
          <div className="lg:col-span-5">
            <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
              
              {/* Header */}
              <div className="px-5 py-3.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: brandPrimaryColor }} />
                  <span className="text-xs font-semibold text-white">RSolve AI Bemiddelingssessie</span>
                </div>
                <span className="text-[11px] text-slate-400 bg-slate-800/80 px-2.5 py-0.5 rounded-full">
                  Live Preview
                </span>
              </div>

              {/* Chat Body */}
              <div className="p-5 space-y-4 text-xs">
                
                {/* Party A statement */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-300 text-xs shrink-0">
                    S
                  </div>
                  <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-2xl rounded-tl-sm max-w-[85%] space-y-1">
                    <div className="text-[11px] font-semibold text-slate-400">Sanne (Buurvrouw)</div>
                    <p className="text-slate-200 leading-relaxed">
                      &quot;De hoge haag neemt al jaren alle middagzon van mijn terras weg. Ik wil dat deze wordt teruggesnoeid.&quot;
                    </p>
                  </div>
                </div>

                {/* RSolve AI Mediation Intervention */}
                <div className="flex items-start gap-3">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-md"
                    style={{ backgroundColor: brandPrimaryColor }}
                  >
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-slate-800/80 border border-slate-700/80 p-3.5 rounded-2xl rounded-tl-sm max-w-[90%] space-y-1.5">
                    <div className="text-[11px] font-bold text-white flex items-center gap-1.5">
                      <span>RSolve Mediator</span>
                      <span className="text-[10px] text-slate-400 font-normal">• Neutrale analyse</span>
                    </div>
                    <p className="text-slate-200 leading-relaxed">
                      &quot;Sanne zoekt meer natuurlijk zonlicht op haar terras, terwijl Mark zijn privacy aan de zijkant wil behouden. We kunnen de haag tot 2,40m snoeien en een esthetisch privacyscherm plaatsen.&quot;
                    </p>
                  </div>
                </div>

                {/* Party B Agreement */}
                <div className="flex items-start gap-3 justify-end">
                  <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-2xl rounded-tr-sm max-w-[85%] space-y-1 text-right">
                    <div className="text-[11px] font-semibold text-slate-400">Mark (Buurman)</div>
                    <p className="text-slate-200 leading-relaxed">
                      &quot;Met dat privacyscherm behoud ik mijn privacy en heeft Sanne weer zon. Ik ga akkoord.&quot;
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-300 text-xs shrink-0">
                    M
                  </div>
                </div>

                {/* Result Card */}
                <div className="p-3.5 bg-emerald-950/30 border border-emerald-800/40 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <div className="font-semibold text-emerald-300">Vaststellingsovereenkomst Gereed</div>
                      <div className="text-[10px] text-emerald-400/80">Art. 7:900 BW • Rechtsgeldig bindend</div>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-400 bg-emerald-900/50 px-2 py-0.5 rounded">
                    100% Akkoord
                  </span>
                </div>

              </div>

              {/* Footer */}
              <div className="px-5 py-3 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>Vast tarief per dossier: <strong className="text-white">€3,99</strong></span>
                <button
                  onClick={() => {
                    const el = document.getElementById('simulator');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="font-semibold text-white hover:underline flex items-center gap-1 cursor-pointer"
                  style={{ color: brandPrimaryColor }}
                >
                  <span>Probeer alle situaties</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
