
import React from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Logo } from '../components/ui/Logo';

// Define VSOProps to resolve type error in App.tsx
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
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            Opslaan als PDF / Print
          </Button>
        </header>

        <Card className="bg-white p-12 md:p-20 shadow-2xl border-none relative overflow-hidden print:p-0 print:shadow-none rounded-[2px]">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.02] rotate-[15deg] select-none pointer-events-none w-full flex justify-center">
            <Logo className="w-[500px] h-[500px]" />
          </div>

          <div className="prose prose-slate max-w-none relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter border-b-4 border-slate-900 inline-block pb-2 mb-4">Vaststellingsovereenkomst</h2>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.2em]">Onderhands Gerechtelijk Akkoord</p>
            </div>

            <section className="mb-10">
              <h3 className="text-sm font-black text-slate-900 mb-3 uppercase tracking-wider">1. De Partijen</h3>
              <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-6 rounded-lg border border-slate-100">
                Ondergetekenden verklaren hierbij een bindende regeling te hebben getroffen met betrekking tot het geschil genaamd <strong>"{data.title}"</strong>:
                <br /><br />
                <span className="text-slate-400 font-bold">Partij A (Initiator):</span> {data.parties?.split(' en ')[0] || '...'} <br />
                <span className="text-slate-400 font-bold">Partij B (Respondent):</span> {data.parties?.split(' en ')[1] || '...'}
              </p>
            </section>

            <section className="mb-10">
              <h3 className="text-sm font-black text-slate-900 mb-3 uppercase tracking-wider">2. Overeengekomen Voorwaarden</h3>
              <div className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap bg-blue-50/50 p-8 rounded-lg border-l-4 border-blue-600 font-serif italic text-lg shadow-inner">
                "{data.terms || 'Geen voorwaarden gespecificeerd.'}"
              </div>
            </section>

            <section className="mb-16">
              <h3 className="text-sm font-black text-slate-900 mb-3 uppercase tracking-wider">3. Finale Kwijting</h3>
              <p className="text-xs text-slate-500 leading-relaxed italic">
                Partijen verlenen elkaar, na uitvoering van de in artikel 2 genoemde voorwaarden, over en weer finale kwijting. Dit houdt in dat zij niets meer van elkaar te vorderen hebben met betrekking tot het onderwerp van dit geschil. Deze overeenkomst is een vaststellingsovereenkomst in de zin van artikel 7:900 Burgerlijk Wetboek.
              </p>
            </section>

            <div className="grid grid-cols-2 gap-16 mt-24">
              <div className="border-t-2 border-slate-900 pt-6 text-center">
                <p className="text-[10px] font-black text-slate-400 mb-10 uppercase tracking-[0.3em]">Handtekening Partij A</p>
                <p className="font-serif italic text-blue-900 text-2xl mb-1">Digitaal Ondertekend</p>
                <p className="text-[10px] text-slate-300">Datum: {data.date || new Date().toLocaleDateString()}</p>
              </div>
              <div className="border-t-2 border-slate-200 pt-6 text-center">
                <p className="text-[10px] font-black text-slate-400 mb-10 uppercase tracking-[0.3em]">Handtekening Partij B</p>
                <div className="h-10 mb-2 flex items-center justify-center">
                  <span className="text-xs text-slate-300 italic">Wacht op digitale handtekening...</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <footer className="py-16 flex flex-col items-center gap-8 print:hidden">
          <div className="bg-blue-600 text-white p-6 rounded-2xl text-center max-w-sm shadow-xl">
            <p className="text-sm font-bold mb-2">Gefeliciteerd!</p>
            <p className="text-xs opacity-90 leading-relaxed">
              Dit document is opgeslagen in je browser. Je kunt het nu delen met de tegenpartij of je advocaat.
            </p>
          </div>
          <Button variant="ghost" className="text-slate-400 hover:text-red-500 font-bold" onClick={onReset}>
            Verwijder alles en start nieuw dossier
          </Button>
        </footer>
      </div>
    </div>
  );
};

export default VSO;
