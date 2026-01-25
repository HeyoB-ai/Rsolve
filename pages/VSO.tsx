
import React from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Logo } from '../components/ui/Logo';
// Import ICONS from constants to fix the missing name error
import { ICONS } from '../constants';

interface VSOProps {
  data: any;
  t: (key: string, params?: any) => string;
  onReset: () => void;
}

const VSO: React.FC<VSOProps> = ({ data, t, onReset }) => {
  return (
    <div className="min-h-screen bg-slate-100 p-6 md:p-12 flex flex-col items-center animate-in fade-in duration-700">
      <div className="w-full max-w-3xl space-y-8">
        <header className="flex justify-between items-center print:hidden">
          <div className="flex items-center gap-3">
            <Logo className="w-12 h-12" />
            <div>
              <h1 className="text-xl font-bold text-slate-900">VSO Document</h1>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Rechtsgeldig Document</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => window.print()} className="rounded-xl border-slate-200">
            Download PDF / Print
          </Button>
        </header>

        <Card className="bg-white p-12 md:p-20 shadow-2xl border-none relative overflow-hidden print:p-0 print:shadow-none rounded-[2px] min-h-[1000px]">
          {/* Watermark */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] rotate-[15deg] select-none pointer-events-none w-full flex justify-center">
            <Logo className="w-[600px] h-[600px]" />
          </div>

          <div className="prose prose-slate max-w-none relative z-10">
            <div className="text-center mb-16 border-b-2 border-slate-100 pb-10">
              <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-2">Vaststellingsovereenkomst</h2>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.4em]">Onderhands Gerechtelijk Akkoord • Rsolve AI Mediation</p>
            </div>

            <section className="mb-12">
              <h3 className="text-xs font-black text-slate-900 mb-4 uppercase tracking-widest border-l-4 border-blue-600 pl-3">1. De Partijen</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm text-slate-700 leading-relaxed bg-slate-50/50 p-8 rounded-2xl border border-slate-100">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Partij A (Initiator)</p>
                  <p className="font-bold text-lg">{data.parties?.split(' en ')[0] || '...'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Partij B (Respondent)</p>
                  <p className="font-bold text-lg">{data.parties?.split(' en ')[1] || '...'}</p>
                </div>
              </div>
            </section>

            <section className="mb-12">
              <h3 className="text-xs font-black text-slate-900 mb-4 uppercase tracking-widest border-l-4 border-blue-600 pl-3">2. Het Geschil</h3>
              <p className="text-sm text-slate-600 leading-relaxed italic px-8">
                Partijen verklaren een geschil te hebben gehad met betrekking tot: <br/>
                <span className="text-slate-900 font-bold not-italic">"{data.title}"</span>
              </p>
            </section>

            <section className="mb-12">
              <h3 className="text-xs font-black text-slate-900 mb-4 uppercase tracking-widest border-l-4 border-blue-600 pl-3">3. Overeengekomen Voorwaarden</h3>
              <div className="text-base text-slate-800 leading-loose whitespace-pre-wrap bg-blue-50/30 p-10 rounded-2xl border border-blue-100 font-serif shadow-inner">
                {data.terms || 'Geen voorwaarden gespecificeerd.'}
              </div>
            </section>

            <section className="mb-20">
              <h3 className="text-xs font-black text-slate-900 mb-4 uppercase tracking-widest border-l-4 border-blue-600 pl-3">4. Finale Kwijting & Rechtskracht</h3>
              <p className="text-xs text-slate-500 leading-relaxed italic bg-slate-50 p-6 rounded-xl border border-slate-100">
                Partijen verlenen elkaar, na volledige uitvoering van de in artikel 3 genoemde voorwaarden, over en weer finale kwijting. Deze overeenkomst is een vaststellingsovereenkomst in de zin van artikel 7:900 Burgerlijk Wetboek, bedoeld om een einde te maken aan onzekerheid of geschil tussen partijen. Partijen doen uitdrukkelijk afstand van hun recht deze overeenkomst te ontbinden of te vernietigen.
              </p>
            </section>

            <div className="grid grid-cols-2 gap-16 mt-32">
              <div className="border-t-2 border-slate-900 pt-8 text-center relative">
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-20 rotate-[-5deg]">
                  <Logo className="w-24 h-24" />
                </div>
                <p className="text-[10px] font-black text-slate-400 mb-12 uppercase tracking-[0.3em]">Handtekening Partij A</p>
                <p className="font-serif italic text-blue-900 text-3xl mb-1">Digitaal Geverifieerd</p>
                <p className="text-[10px] text-slate-300 font-bold">Kenmerk: RS-{Math.random().toString(36).substr(2, 6).toUpperCase()}</p>
                <p className="text-[9px] text-slate-400 mt-1">Datum: {data.date}</p>
              </div>
              <div className="border-t-2 border-slate-200 pt-8 text-center">
                <p className="text-[10px] font-black text-slate-400 mb-12 uppercase tracking-[0.3em]">Handtekening Partij B</p>
                <div className="h-10 mb-2 flex items-center justify-center">
                  <span className="text-xs text-slate-300 italic animate-pulse">Wacht op digitale ondertekening door respondent...</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <footer className="py-20 flex flex-col items-center gap-8 print:hidden">
          <div className="bg-slate-900 text-white p-10 rounded-[32px] text-center max-w-sm shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-blue-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500 opacity-20"></div>
            <ICONS.Check className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <p className="text-lg font-black mb-2 uppercase tracking-tight">Oplossing Bereikt!</p>
            <p className="text-xs text-slate-400 leading-relaxed font-medium mb-6">
              Jullie hebben samen een conflict opgelost. Dit document is nu jullie wettelijke bewijs.
            </p>
            <Button variant="primary" className="w-full rounded-2xl py-4 bg-blue-600 border-none shadow-xl" onClick={() => window.print()}>
               Dossier Downloaden
            </Button>
          </div>
          <button 
            onClick={onReset}
            className="text-[10px] font-black text-slate-300 hover:text-red-500 uppercase tracking-widest transition-colors duration-300"
          >
            Verwijder Dossier & Sluit Sessie
          </button>
        </footer>
      </div>
    </div>
  );
};

export default VSO;
