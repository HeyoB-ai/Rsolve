import React from 'react';
import { Logo } from '../components/ui/Logo';
import LangBar from '../components/landing/components/LangBar';

const bundles = [
  { codes: 10, price: '€29', perCode: '€2,90', save: '~27%', popular: false },
  { codes: 25, price: '€59', perCode: '€2,36', save: '~41%', popular: true },
  { codes: 100, price: '€199', perCode: '€1,99', save: '~50%', popular: false },
];

const steps = [
  { n: '1', title: 'Kies een bundel', text: 'Bepaal hoeveel toegangscodes je nodig hebt en neem contact op.' },
  { n: '2', title: 'Ontvang je codes', text: 'Je krijgt de codes en een factuur toegestuurd. Betalen kan per bundel met korting.' },
  { n: '3', title: 'Deel ze uit', text: 'Medewerkers, huurders of klanten lossen hun geschil op via "Heb je een code?" — gratis voor hen.' },
];

const Zakelijk: React.FC = () => {
  const mailto =
    'mailto:clareco.online@gmail.com?subject=' +
    encodeURIComponent('Zakelijke bundel Rsolve') +
    '&body=' +
    encodeURIComponent('Hallo,\n\nIk ben geïnteresseerd in een zakelijke bundel toegangscodes voor Rsolve.\n\nGewenst aantal codes:\nOrganisatie:\n\nMet vriendelijke groet,');

  return (
    <div className="rsolve-dark min-h-screen bg-slate-950 text-slate-100 flex flex-col animate-in fade-in duration-500">
      <LangBar />
      <div className="flex-1 flex flex-col items-center p-6 pt-14 pb-20">
        <div className="w-full max-w-4xl space-y-12">

          {/* Header */}
          <header className="text-center max-w-2xl mx-auto">
            <Logo className="w-16 h-16 mx-auto mb-6" />
            <span className="inline-block text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-full mb-4">Voor organisaties</span>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">Toegangscodes in bundel — met korting</h1>
            <p className="text-slate-400 font-medium mt-4 leading-relaxed">
              Los conflicten binnen je organisatie snel en betaalbaar op. Met een zakelijke bundel koop je toegangscodes met korting en deel je ze uit wanneer er een geschil speelt. Elke code geeft toegang tot één volledig mediation-dossier met onze neutrale AI-mediator — normaal €3,99 per dossier.
            </p>
          </header>

          {/* Bundels */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {bundles.map((b) => (
              <div
                key={b.codes}
                className={`relative rounded-[28px] p-8 flex flex-col items-center text-center transition-all ${
                  b.popular
                    ? 'bg-slate-900 text-white border-2 border-cyan-500/50 shadow-2xl md:scale-105'
                    : 'bg-slate-900/60 text-white border border-slate-800 shadow-xl'
                }`}
              >
                {b.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-widest bg-cyan-500 text-slate-950 px-4 py-1 rounded-full shadow-lg">
                    Populair
                  </span>
                )}
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Bundel</p>
                <p className="text-5xl font-black my-2 text-white">{b.codes}</p>
                <p className="text-xs font-bold uppercase tracking-widest mb-6 text-slate-400">toegangscodes</p>

                <div className="mb-1 flex items-end justify-center gap-2">
                  <span className="text-3xl font-black text-white">{b.price}</span>
                </div>
                <p className="text-xs font-bold text-cyan-400">{b.perCode} per code · bespaar {b.save}</p>

                <a
                  href={mailto}
                  className={`mt-8 w-full rounded-2xl py-3.5 font-black text-sm uppercase tracking-widest transition-all active:scale-95 ${
                    b.popular ? 'bg-cyan-500 text-slate-950 hover:bg-cyan-400' : 'bg-slate-800 text-white hover:bg-slate-700 border border-slate-700'
                  }`}
                >
                  Aanvragen
                </a>
              </div>
            ))}
          </section>

          <p className="text-center text-xs text-slate-500 font-medium -mt-6">
            Genoemde bedragen zijn indicatief (excl. btw). Grotere aantallen of een afspraak op maat? Vraag een offerte aan.
          </p>

          {/* Hoe het werkt */}
          <section className="bg-slate-900/60 rounded-[28px] shadow-xl border border-slate-800 p-8 sm:p-10">
            <h2 className="text-lg font-black text-white uppercase tracking-widest text-center mb-8">Hoe het werkt</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {steps.map((s) => (
                <div key={s.n} className="text-center">
                  <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-black flex items-center justify-center mx-auto mb-4">{s.n}</div>
                  <h3 className="font-black text-white mb-1">{s.title}</h3>
                  <p className="text-sm text-slate-400 font-medium leading-relaxed">{s.text}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Voor wie */}
          <section className="text-center max-w-2xl mx-auto">
            <h2 className="text-lg font-black text-white uppercase tracking-widest mb-3">Voor wie?</h2>
            <p className="text-slate-400 font-medium leading-relaxed">
              Ideaal voor werkgevers en HR, verhuurders en woningcorporaties, VvE's, incassobureaus, brancheverenigingen en iedereen die regelmatig geschillen op een eerlijke, laagdrempelige manier wil oplossen — zonder dure advocaten of een rechtszaak.
            </p>
          </section>

          {/* Contact CTA */}
          <section className="bg-slate-900 border border-slate-800 text-white rounded-[32px] p-10 text-center shadow-2xl">
            <h2 className="text-2xl font-black mb-2">Klaar om te starten?</h2>
            <p className="text-slate-300 font-medium mb-8 max-w-md mx-auto">
              Vraag je bundel aan of stel je vraag — we denken graag met je mee over het juiste aantal codes.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href={mailto} className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-2xl px-8 py-4 font-black uppercase tracking-widest text-sm transition-all active:scale-95">
                Bundel aanvragen
              </a>
              <a href="tel:+31657812417" className="bg-white/10 hover:bg-white/20 text-white rounded-2xl px-8 py-4 font-black uppercase tracking-widest text-sm transition-all active:scale-95">
                Bel 06-57812417
              </a>
            </div>
            <a href="/contact" className="inline-block mt-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest hover:text-white transition-colors">
              Alle contactgegevens →
            </a>
          </section>

          <div className="text-center">
            <a href="/" className="text-cyan-400 font-bold text-sm hover:underline">← Terug naar home</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Zakelijk;
