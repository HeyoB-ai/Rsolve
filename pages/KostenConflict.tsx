import React from 'react';
import { Logo } from '../components/ui/Logo';
import LangBar from '../components/landing/components/LangBar';

const stats = [
  { big: '£28,5 mld', sub: 'kosten per jaar voor werkgevers (VK)', src: 'Acas, 2021' },
  { big: '2,8 uur', sub: 'per week per werknemer aan conflict', src: 'CPP Global, 2008' },
  { big: '€250–400', sub: 'kosten van één verzuimdag per werknemer', src: 'NL arbo-indicatie' },
  { big: '3× duurder', sub: 'een formeel afgehandeld conflict vs. informeel oplossen', src: 'Acas, 2021' },
];

const KostenConflict: React.FC = () => {
  return (
    <div className="rsolve-dark min-h-screen bg-slate-950 text-slate-200 animate-in fade-in duration-500">
      <LangBar />
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 text-white px-6 pt-6 pb-20">
        <div className="max-w-3xl mx-auto">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-300 hover:text-white transition-colors mb-10"
          >
            <span aria-hidden>←</span> Terug naar home
          </a>
        </div>
        <div className="max-w-3xl mx-auto text-center">
          <Logo className="w-14 h-14 mx-auto mb-6" />
          <span className="inline-block text-[10px] font-black uppercase tracking-[0.3em] text-cyan-300 bg-white/10 px-3 py-1 rounded-full mb-5">Achtergrond</span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-white">Wat conflicten op de werkvloer écht kosten</h1>
          <p className="text-slate-300 font-medium mt-5 text-lg leading-relaxed max-w-2xl mx-auto">
            Een sluimerend conflict lijkt een "zachte" kwestie, maar de schade is keihard — in euro's, in verloren tijd en in mensen. De cijfers uit binnen- en buitenland zijn confronterend.
          </p>
        </div>
      </header>

      {/* Stat cards */}
      <section className="px-6 -mt-12">
        <div className="max-w-4xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <div key={i} className="bg-slate-900 rounded-2xl shadow-xl border border-slate-800 p-5 text-center">
              <p className="text-2xl sm:text-3xl font-black text-cyan-400 leading-tight">{s.big}</p>
              <p className="text-xs text-slate-300 font-bold mt-2 leading-snug">{s.sub}</p>
              <p className="text-[10px] text-slate-500 font-medium mt-2 uppercase tracking-wider">{s.src}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Article body */}
      <article className="px-6 py-16">
        <div className="max-w-2xl mx-auto space-y-10 text-[17px] leading-relaxed text-slate-300">

          <div className="space-y-4">
            <h2 className="text-2xl font-black text-white">De tijd die stilletjes verdampt</h2>
            <p>
              Conflicten kosten vooral tijd. Volgens het veelgeciteerde <strong className="text-white">CPP Global Human Capital Report</strong> uit 2008 besteedt een werknemer gemiddeld <strong className="text-white">2,8 uur per week</strong> aan het omgaan met conflicten — ruziën, piekeren, roddelen, vermijden. Opgeteld kwam dat in de Verenigde Staten neer op zo'n <strong className="text-white">359 miljard dollar</strong> aan betaalde uren per jaar. Uit datzelfde onderzoek bleek dat ongeveer <strong className="text-white">85% van de werknemers</strong> in enige mate met conflict te maken krijgt.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-black text-white">De rekening voor werkgevers</h2>
            <p>
              Het meest complete recente onderzoek komt van <strong className="text-white">Acas</strong>, de Britse overheidsdienst voor arbeidsverhoudingen. In een rapport uit 2021 (op basis van cijfers uit 2018/19) berekenden onderzoekers dat werkplekconflicten Britse werkgevers <strong className="text-white">£28,5 miljard per jaar</strong> kosten — gemiddeld <strong className="text-white">meer dan £1.000 per werknemer</strong>.
            </p>
            <p>
              Achter dat bedrag gaan mensen schuil. Bijna <strong className="text-white">10 miljoen</strong> mensen maakten in een jaar een conflict op het werk mee. Ruim de helft kreeg last van stress, angst of somberheid. Zo'n <strong className="text-white">900.000</strong> mensen meldden zich ziek, bijna <strong className="text-white">een half miljoen</strong> nam ontslag en <strong className="text-white">ruim 300.000</strong> werden ontslagen.
            </p>
            <blockquote className="border-l-4 border-cyan-400 pl-5 py-1 text-white font-bold text-lg">
              Liep een conflict uit op een formele procedure, dan waren de kosten meer dan drie keer zo hoog als bij informeel oplossen.
            </blockquote>
            <p>
              Met andere woorden: hoe langer je wacht en hoe formeler het wordt, hoe duurder het uitpakt.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-black text-white">En in Nederland?</h2>
            <p>
              Ook dichter bij huis zijn de bedragen fors. <strong className="text-white">TNO en het CBS</strong> berekenden dat het verzuim door werkstress Nederlandse werkgevers rond de <strong className="text-white">€3,1 miljard per jaar</strong> kost (cijfers 2020). Werkstress ontstaat lang niet altijd door een conflict, maar een slepend conflict is er wel een belangrijke aanjager van.
            </p>
            <p>
              Eén ding is zeker: verzuim is duur. Een afwezige werknemer kost een werkgever al gauw <strong className="text-white">€250 tot €400 per dag</strong> aan doorbetaling, vervanging en verloren productiviteit. En conflict-gerelateerd verzuim is berucht om z'n lange duur — het gaat vaak niet om dagen, maar om weken of maanden. Arbo- en mediationorganisaties schatten dan ook dat een fors deel van het psychische verzuim voortkomt uit onderlinge conflicten, en dat de totale kosten van één geëscaleerd arbeidsconflict kunnen oplopen tot tienduizenden euro's.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-black text-white">De schade die je niet op de factuur ziet</h2>
            <p>
              Naast de directe kosten is er de schade die zich niet makkelijk in een bedrag laat vangen: goede mensen die vertrekken, teams die uit elkaar vallen, kennis die weglekt, en een sfeer waarin niemand meer z'n nek uitsteekt. Die verborgen kosten tikken vaak zwaarder aan dan de zichtbare.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-black text-white">Waarom vroeg oplossen loont</h2>
            <p>
              De rode draad door al dit onderzoek is simpel: <strong className="text-white">een conflict wordt met de dag duurder</strong>. Wie er vroeg bij is en er samen uitkomt, voorkomt ziekmeldingen, vertrek en dure juridische procedures. Precies daar is Rsolve voor gemaakt: een neutrale AI-mediator die partijen snel en laagdrempelig naar een eerlijke oplossing begeleidt, met een vaststellingsovereenkomst als bindende afronding — voor een fractie van de kosten van een geëscaleerd conflict.
            </p>
          </div>

          {/* CTA */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-[24px] p-8 text-center">
            <p className="font-black text-white text-lg mb-4">Los een conflict op vóórdat het escaleert.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="/" className="bg-cyan-500 text-slate-950 px-8 py-4 rounded-full font-black hover:bg-cyan-400 transition-all shadow-lg active:scale-95">
                Start met Rsolve
              </a>
              <a href="/zakelijk" className="bg-slate-800 border border-slate-700 text-white px-8 py-4 rounded-full font-black hover:border-cyan-500 transition-all active:scale-95">
                Voor organisaties
              </a>
            </div>
          </div>

          {/* Bronnen */}
          <div className="pt-6 border-t border-slate-800">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Bronnen</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                Acas — <a href="https://www.acas.org.uk/estimating-the-costs-of-workplace-conflict" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">Estimating the costs of workplace conflict</a> (2021).
              </li>
              <li>
                CPP Global Human Capital Report, <em>Workplace Conflict</em> (2008); o.a. aangehaald door <a href="https://www.shrm.org/topics-tools/news/employee-relations/viewpoint-art-science-conflict-management" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">SHRM</a>.
              </li>
              <li>
                TNO — <a href="https://www.tno.nl/nl/newsroom/2020/11/verzuimkosten-werkstress-lopen-3-1/" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">Verzuimkosten door werkstress lopen op tot 3,1 miljard</a> (2020, TNO/CBS).
              </li>
              <li>
                Indicaties verzuim- en conflictkosten NL: <a href="https://www.cereo.nl/verzuimkosten/" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">Cereo</a> en <a href="https://www.gimd.nl/blog/wat-zijn-de-kosten-van-een-arbeidsconflict-voor-een-organisatie/" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">Gimd</a>.
              </li>
            </ul>
            <p className="text-[11px] text-slate-500 mt-4 leading-relaxed">
              Bedragen zijn afkomstig uit de genoemde bronnen en gelden voor het vermelde jaar en land; ze zijn bedoeld als indicatie van de omvang, niet als exacte voorspelling voor een individueel bedrijf. De Nederlandse verzuim- en conflictbedragen zijn deels schattingen van arbo- en mediationorganisaties.
            </p>
          </div>

          <div className="text-center pt-2">
            <a href="/" className="text-cyan-400 font-bold text-sm hover:underline">← Terug naar home</a>
          </div>
        </div>
      </article>
    </div>
  );
};

export default KostenConflict;
