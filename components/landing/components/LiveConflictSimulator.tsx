import React, { useState } from 'react';
import { SCENARIOS } from '../data/contentData';
import { Sparkles, CheckCircle2, FileText, ArrowRight, Check, Copy, User, Scale } from 'lucide-react';

interface SimulatorProps {
  selectedScenarioId: string;
  onSelectScenarioId: (id: string) => void;
  onStartMediation: () => void;
  brandPrimaryColor?: string;
}

export function LiveConflictSimulator({
  selectedScenarioId,
  onSelectScenarioId,
  onStartMediation,
  brandPrimaryColor = '#10B981',
}: SimulatorProps) {
  const currentScenario = SCENARIOS.find((s) => s.id === selectedScenarioId) || SCENARIOS[0];
  const [activeTab, setActiveTab] = useState<'dialogue' | 'analysis' | 'agreement'>('dialogue');
  const [copied, setCopied] = useState(false);

  const handleCopyAgreement = () => {
    const text = `VASTSTELLINGSOVEREENKOMST (Art. 7:900 BW)\nDossier: ${currentScenario.title}\nPartij A: ${currentScenario.partyA.name}\nPartij B: ${currentScenario.partyB.name}\n\nAfspraken:\n${currentScenario.generatedAgreement.points.map((p, i) => `${i + 1}. ${p}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="simulator" className="py-20 md:py-28 bg-slate-900/60 border-b border-slate-800/80 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Live Voorbeelden &amp; Simulatie
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-white font-extrabold tracking-tight">
            Ervaar hoe RSolve conflicten de-escaleert
          </h2>
          <p className="text-base sm:text-lg text-slate-400 leading-relaxed font-light">
            Kies een situatie en bekijk hoe emotionele verwijten stap voor stap worden omgezet in wederzijdse belangen en een bindende overeenkomst.
          </p>
        </div>

        {/* Scenario Tabs */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8">
          {SCENARIOS.map((s) => {
            const isSelected = s.id === currentScenario.id;
            return (
              <button
                key={s.id}
                onClick={() => {
                  onSelectScenarioId(s.id);
                  setActiveTab('dialogue');
                }}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-white text-slate-900 shadow-md font-bold'
                    : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700'
                }`}
              >
                <span>{s.categoryLabel}</span>
                <span className="text-[11px] opacity-60 font-normal">
                  (~{s.generatedAgreement.resolutionTimeMin} min)
                </span>
              </button>
            );
          })}
        </div>

        {/* Main Stage Card */}
        <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden max-w-4xl mx-auto">
          
          {/* Header of the Simulator */}
          <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                {currentScenario.categoryLabel}
              </span>
              <h3 className="font-display text-lg font-bold text-white">
                {currentScenario.title}
              </h3>
            </div>

            {/* View switcher tabs */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setActiveTab('dialogue')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  activeTab === 'dialogue' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                1. AI Dialoog
              </button>
              <button
                onClick={() => setActiveTab('analysis')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  activeTab === 'analysis' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                2. Belangenanalyse
              </button>
              <button
                onClick={() => setActiveTab('agreement')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  activeTab === 'agreement' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                3. Vaststellingsovereenkomst
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-6 sm:p-8 space-y-6">
            
            {/* TAB 1: Dialogue */}
            {activeTab === 'dialogue' && (
              <div className="space-y-4">
                {currentScenario.aiMediationDialogue.map((msg, index) => {
                  const isAi = msg.speaker === 'ai';
                  const isPartyA = msg.speaker === 'partyA';
                  
                  return (
                    <div
                      key={index}
                      className={`flex items-start gap-3.5 ${
                        isAi ? 'max-w-2xl mx-auto' : isPartyA ? 'mr-auto max-w-xl' : 'ml-auto max-w-xl flex-row-reverse'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          isAi
                            ? 'text-white shadow-md'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                        style={isAi ? { backgroundColor: brandPrimaryColor } : {}}
                      >
                        {isAi ? <Sparkles className="w-4 h-4" /> : isPartyA ? currentScenario.partyA.name.charAt(0) : currentScenario.partyB.name.charAt(0)}
                      </div>

                      <div
                        className={`p-4 rounded-2xl text-xs sm:text-sm space-y-1 ${
                          isAi
                            ? 'bg-slate-900 border border-slate-700/80 text-white rounded-tl-sm'
                            : isPartyA
                            ? 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-sm'
                            : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tr-sm text-right'
                        }`}
                      >
                        <div className="text-[11px] font-semibold text-slate-400">
                          {isAi ? 'RSolve Mediator' : isPartyA ? currentScenario.partyA.name : currentScenario.partyB.name}
                        </div>
                        <p className="leading-relaxed font-light">{msg.text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* TAB 2: Analysis */}
            {activeTab === 'analysis' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Party A */}
                  <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300">
                        A
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">{currentScenario.partyA.name}</div>
                        <div className="text-[11px] text-slate-400">{currentScenario.partyA.role}</div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-[11px] text-slate-400 uppercase font-semibold">Oorspronkelijk Standpunt:</div>
                      <p className="text-xs text-slate-300 italic">&quot;{currentScenario.partyA.initialStatement}&quot;</p>
                    </div>

                    <div className="space-y-1 pt-2 border-t border-slate-800">
                      <div className="text-[11px] text-emerald-400 font-semibold uppercase">Werkelijke Belang (AI Analyse):</div>
                      <p className="text-xs text-slate-200">{currentScenario.partyA.hiddenNeed}</p>
                    </div>
                  </div>

                  {/* Party B */}
                  <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300">
                        B
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">{currentScenario.partyB.name}</div>
                        <div className="text-[11px] text-slate-400">{currentScenario.partyB.role}</div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-[11px] text-slate-400 uppercase font-semibold">Oorspronkelijk Standpunt:</div>
                      <p className="text-xs text-slate-300 italic">&quot;{currentScenario.partyB.initialStatement}&quot;</p>
                    </div>

                    <div className="space-y-1 pt-2 border-t border-slate-800">
                      <div className="text-[11px] text-emerald-400 font-semibold uppercase">Werkelijke Belang (AI Analyse):</div>
                      <p className="text-xs text-slate-200">{currentScenario.partyB.hiddenNeed}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-300 leading-relaxed">
                    <strong>Neutrale Samenvatting:</strong> {currentScenario.neutralizedSummary}
                  </p>
                </div>
              </div>
            )}

            {/* TAB 3: Agreement */}
            {activeTab === 'agreement' && (
              <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] text-emerald-400 uppercase tracking-wider font-semibold">
                      {currentScenario.generatedAgreement.bindingType}
                    </span>
                    <h4 className="font-display text-base font-bold text-white">
                      Vaststellingsovereenkomst (Art. 7:900 BW)
                    </h4>
                  </div>
                  <button
                    onClick={handleCopyAgreement}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Gekopieerd' : 'Kopieer'}</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  <div className="text-xs font-semibold text-slate-400">Gezamenlijk overeengekomen afspraken:</div>
                  <ul className="space-y-2 text-xs sm:text-sm text-slate-200">
                    {currentScenario.generatedAgreement.points.map((pt, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span>Partijen: {currentScenario.partyA.name} &amp; {currentScenario.partyB.name}</span>
                  <span className="text-emerald-400 font-semibold">100% Rechtsgeldig Bindend</span>
                </div>
              </div>
            )}

          </div>

          {/* Action Footer */}
          <div className="px-6 py-4 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-400 text-center sm:text-left">
              Klaar om jouw eigen conflict vreedzaam op te lossen?
            </div>
            <button
              onClick={onStartMediation}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-white rounded-xl shadow-lg transition-all cursor-pointer hover:opacity-95"
              style={{ backgroundColor: brandPrimaryColor }}
            >
              <span>Start Nieuwe Sessie (€3,99)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>
    </section>
  );
}
