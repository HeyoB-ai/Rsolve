import React from 'react';
import { ArrowRight, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react';

interface CTASectionProps {
  onStartMediation: () => void;
  brandPrimaryColor?: string;
}

export function CTASection({ onStartMediation, brandPrimaryColor = '#10B981' }: CTASectionProps) {
  return (
    <section className="py-20 md:py-28 bg-slate-900 border-b border-slate-800/80 relative overflow-hidden">
      
      {/* Soft ambient center glow */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full blur-3xl opacity-10 pointer-events-none"
        style={{ backgroundColor: brandPrimaryColor }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 relative z-10">
        
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Vast tarief van €3,99 • Geen abonnement
        </div>

        <h2 className="font-display text-3xl sm:text-5xl lg:text-6xl text-white font-extrabold tracking-tight leading-[1.15]">
          Laat een conflict niet langer je rust en energie bepalen.
        </h2>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed font-light">
          Start direct een neutrale sessie, nodig de andere partij uit en bereik binnen 10 minuten een bindende, juridisch getoetste oplossing (Art. 7:900 BW).
        </p>

        {/* Action button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onStartMediation}
            id="btn-cta-start-case"
            className="w-full sm:w-auto px-8 py-4 text-sm font-bold text-white rounded-xl shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer hover:opacity-95 active:scale-[0.98]"
            style={{ backgroundColor: brandPrimaryColor }}
          >
            <span>Start nu een bemiddeling (€3,99)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Badges row */}
        <div className="flex flex-wrap justify-center items-center gap-6 pt-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-300" />
            <span>Klaar in ~10 minuten</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-slate-300" />
            <span>Wettelijk bindend (Art. 7:900 BW)</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-slate-300" />
            <span>100% Neutraal &amp; Vertrouwelijk</span>
          </div>
        </div>

      </div>
    </section>
  );
}
