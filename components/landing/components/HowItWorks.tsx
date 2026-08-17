import React from 'react';
import { MessageSquarePlus, Sparkles, Handshake, FileCheck, ArrowRight } from 'lucide-react';

interface HowItWorksProps {
  onStartMediation: () => void;
  brandPrimaryColor?: string;
}

export function HowItWorks({ onStartMediation, brandPrimaryColor = '#10B981' }: HowItWorksProps) {
  const steps = [
    {
      number: '01',
      title: 'Beide partijen delen hun perspectief',
      subtitle: 'In eigen woorden & eigen tempo',
      description: 'Nodig de tegenpartij uit met een beveiligde link. Iedereen typt zijn kant van het verhaal. RSolve vangt frustraties op en haalt emotionele ladingen eruit.',
      icon: MessageSquarePlus,
    },
    {
      number: '02',
      title: 'AI herkent achterliggende belangen',
      subtitle: 'Harvard Mediation methode',
      description: 'RSolve scheidt de inhoudelijke belangen van persoonlijke emoties en herformuleert standpunten naar respectvolle, oplossingsgerichte voorstellen.',
      icon: Sparkles,
    },
    {
      number: '03',
      title: 'Gezamenlijke consensus bouwen',
      subtitle: 'Stap voor stap naar evenwicht',
      description: 'De mediator legt constructieve compromissen voor. Beide partijen geven feedback totdat een eerlijk en gebalanceerd akkoord is bereikt.',
      icon: Handshake,
    },
    {
      number: '04',
      title: 'Direct bindende vaststellingsovereenkomst',
      subtitle: 'Wettelijk bindend (Art. 7:900 BW)',
      description: 'Zodra beide partijen akkoord zijn, genereert het platform direct een officiële Vaststellingsovereenkomst met duidelijke afspraken en finale kwijting.',
      icon: FileCheck,
    },
  ];

  return (
    <section id="hoe-het-werkt" className="py-20 md:py-28 bg-slate-950 border-b border-slate-800/80 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Hoe het werkt
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-white font-extrabold tracking-tight">
            Van conflict naar bindend akkoord in 4 stappen
          </h2>
          <p className="text-base sm:text-lg text-slate-400 leading-relaxed font-light">
            Geen lange wachttijden of dure advocaatkosten. RSolve begeleidt jullie binnen 10 minuten naar een vreedzame en juridisch geldige uitkomst.
          </p>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="bg-slate-900/60 rounded-2xl p-6 border border-slate-800/90 hover:border-slate-700 transition-all flex flex-col justify-between space-y-5"
              >
                <div className="space-y-4">
                  {/* Step Header */}
                  <div className="flex items-center justify-between">
                    <span className="font-display text-2xl font-black text-slate-600">
                      {step.number}
                    </span>
                    <div 
                      className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-white"
                      style={{ color: brandPrimaryColor }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Titles */}
                  <div>
                    <h3 className="font-display text-lg font-bold text-white leading-snug">
                      {step.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 font-medium">
                      {step.subtitle}
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-slate-400 leading-relaxed font-light">
                    {step.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/60 text-xs text-slate-400 font-medium">
                  Stap {step.number} van 4
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-14 text-center">
          <button
            onClick={onStartMediation}
            className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-bold text-white rounded-xl shadow-lg transition-all cursor-pointer hover:opacity-95 active:scale-[0.98]"
            style={{ backgroundColor: brandPrimaryColor }}
          >
            <span>Start Direct een Bemiddelingsdossier</span>
            <span className="opacity-70 text-xs font-normal">• Vaste €3,99</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>

      </div>
    </section>
  );
}
