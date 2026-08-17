import React from 'react';
import { ShieldCheck, Lock, FileText, CheckCircle, Scale, EyeOff, Server } from 'lucide-react';

interface SecurityAndLegalProps {
  brandPrimaryColor?: string;
}

export function SecurityAndLegal({ brandPrimaryColor = '#10B981' }: SecurityAndLegalProps) {
  const pillars = [
    {
      icon: Scale,
      title: 'Juridisch Bindend (Art. 7:900 BW)',
      description: 'Zodra beide partijen akkoord geven, produceert RSolve een officiële Vaststellingsovereenkomst. Deze is volgens het Nederlands Burgerlijk Wetboek bindend en voorkomt latere gerechtelijke procedures over dezelfde punten.'
    },
    {
      icon: EyeOff,
      title: 'Geen AI Training op jouw zaak',
      description: 'Jouw privégegevens, chatberichten en afspraken worden strikt vertrouwelijk behandeld. Geen enkel privédossier wordt ooit gebruikt om publieke AI-modellen te trainen.'
    },
    {
      icon: Lock,
      title: 'AVG / GDPR & End-to-End Encryptie',
      description: 'Alle gegevens worden versleuteld verzonden en opgeslagen via TLS 1.3 en AES-256 in gecertificeerde Europese datacenters (EU Data Sovereignty).'
    },
    {
      icon: Server,
      title: 'Automatische Data Verwijdering',
      description: 'Na afronding en download van de getekende overeenkomst kun je met één klik het gehele dossier permanent wissen van onze servers.'
    },
  ];

  return (
    <section id="veiligheid" className="py-20 md:py-28 bg-slate-900/40 text-white border-b border-slate-800/80 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Juridische Zekerheid &amp; Privacy
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
            Gebouwd op Nederlands recht en Europese privacy
          </h2>
          <p className="text-base sm:text-lg text-slate-400 leading-relaxed font-light">
            Bij geschillen staat er veel op het spel. Daarom is RSolve vanaf de basis ontworpen conform Burgerlijk Wetboek Art. 7:900 en de strengste AVG-eisen.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {pillars.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-slate-900/60 rounded-2xl p-6 sm:p-8 space-y-4 border border-slate-800/80 hover:border-slate-700 transition-colors"
              >
                <div 
                  className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center"
                  style={{ color: brandPrimaryColor }}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-display text-lg font-bold text-white">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed font-light">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Trust summary strip */}
        <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-300 shadow-lg">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>
              Standaard inclusief digitale verificatie en onweerlegbare cryptografische tijdstempels conform eIDAS.
            </span>
          </div>
          <div className="flex items-center gap-2 font-semibold text-emerald-400 whitespace-nowrap">
            <CheckCircle className="w-4 h-4" />
            <span>100% AVG / GDPR Compliant</span>
          </div>
        </div>

      </div>
    </section>
  );
}
