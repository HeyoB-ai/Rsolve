
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Logo } from '../components/ui/Logo';
import { UI_TRANSLATIONS, ICONS } from '../constants';
import { Button } from '../components/ui/Button';

interface LandingProps {
  appLanguage: string;
  setAppLanguage: (lang: string) => void;
  t: (key: string, params?: any) => string;
  setHasPaid: (val: boolean) => void;
}

const Landing: React.FC<LandingProps> = ({ appLanguage, setAppLanguage, t, setHasPaid }) => {
  const navigate = useNavigate();
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);

  const handleStartProcess = () => {
    navigate('/payment');
  };

  // De exacte foto van de mediator aan tafel
  const heroImageUrl = "https://replicate.delivery/yhqm/f0d8f99e-3e5a-497d-8e42-1e967364b6f7/out-0.png"; 

  return (
    <div className="bg-white text-[#1e293b] font-display antialiased min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center bg-white/95 backdrop-blur-md px-8 py-5 justify-between max-w-[1440px] mx-auto w-full">
        <Logo showText={true} />
        <div className="flex items-center gap-6">
          <button 
            onClick={handleStartProcess}
            className="bg-primary text-white px-8 py-2.5 rounded-full text-sm font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/10 active:scale-95"
          >
            Start
          </button>
          <button 
            onClick={() => setIsLangModalOpen(true)}
            className="p-1 text-slate-400 hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-3xl">menu</span>
          </button>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative px-8 py-12 md:py-20 max-w-[1440px] mx-auto overflow-visible">
          <div className="flex flex-col lg:flex-row gap-16 items-start">
            {/* Left Content */}
            <div className="flex flex-col gap-10 text-left lg:max-w-2xl animate-in fade-in slide-in-from-left-8 duration-700">
              <div className="inline-flex items-center gap-2 py-2 px-5 bg-blue-50 border border-blue-100 rounded-full w-fit shadow-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-accent-warm"></span>
                <span className="text-primary font-black text-[11px] tracking-[0.2em] uppercase">De toekomst van Mediation</span>
              </div>
              
              <h1 className="text-slate-900 text-7xl md:text-[110px] font-extrabold leading-[0.88] tracking-tighter">
                Conflicten<br />
                oplossen <span className="text-primary">zonder</span><br />
                <span className="text-primary">strijd.</span>
              </h1>
              
              <p className="text-slate-500 text-2xl font-medium leading-relaxed max-w-lg mt-2">
                Bereik samen een rechtsgeldige oplossing met hulp van onze AI-mediator. Sneller, goedkoper en menselijker dan een advocaat.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button 
                  onClick={handleStartProcess}
                  className="bg-primary text-white text-xl font-black h-20 px-12 rounded-[2rem] shadow-2xl shadow-blue-500/25 flex items-center justify-center gap-4 hover:bg-blue-700 transition-all active:scale-[0.98]"
                >
                  <span>Start mediation</span>
                  <span className="material-symbols-outlined text-3xl">arrow_forward</span>
                </button>
                <button className="bg-white text-slate-900 text-xl font-black h-20 px-12 rounded-[2rem] border-2 border-slate-100 hover:border-primary/20 transition-all">
                  Hoe het werkt
                </button>
              </div>

              <div className="flex items-center gap-5 pt-8">
                 <div className="flex -space-x-4">
                    {[1,2,3,4].map(i => <img key={i} className="w-12 h-12 rounded-full border-4 border-white shadow-sm" src={`https://i.pravatar.cc/100?u=${i+30}`} alt="user" />)}
                 </div>
                 <p className="text-[11px] text-slate-400 font-black uppercase tracking-[0.2em]">+500 zaken succesvol afgerond</p>
              </div>
            </div>
            
            {/* Right Content - Hero Image */}
            <div className="relative w-full lg:flex-1 animate-in fade-in zoom-in-95 duration-1000 delay-200 mt-12 lg:mt-0">
              <div className="relative w-full aspect-[1.1] bg-slate-50 rounded-[5rem] shadow-2xl border-[16px] border-white overflow-hidden group">
                <img 
                  src={heroImageUrl} 
                  alt="Rsolve Mediation Session" 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  loading="eager"
                />

                <div className="absolute top-10 left-10 bg-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-100/50">
                  <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.8)]"></div>
                  <span className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-600">Nu Online</span>
                </div>

                <div className="absolute bottom-10 right-10 bg-white/95 backdrop-blur-xl p-10 rounded-[3.5rem] shadow-2xl border border-white/50 max-w-[340px] transform hover:translate-y-[-10px] transition-transform duration-500">
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                      <Logo className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-[0.25em] text-primary">AI Mediator</span>
                  </div>
                  <p className="text-base font-bold text-slate-900 leading-[1.6] italic">"Ik hoor dat dit voor beide partijen belangrijk is. Zullen we kijken naar een middenweg?"</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Artikel Sectie */}
        <section className="bg-slate-50/50 py-32 px-8 border-y border-slate-100">
          <div className="max-w-4xl mx-auto space-y-12">
            <header className="space-y-6">
              <div className="inline-flex items-center gap-2 py-1.5 px-4 bg-white border border-slate-200 rounded-full w-fit shadow-sm">
                <span className="material-symbols-outlined text-primary text-sm">auto_stories</span>
                <span className="text-primary font-black text-[10px] tracking-widest uppercase">Kennisbank</span>
              </div>
              <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none">
                Mediation: conflicten oplossen zonder strijd
              </h2>
            </header>

            <div className="prose prose-slate prose-xl max-w-none text-slate-600 font-medium leading-relaxed space-y-8">
              <p>
                Conflicten zijn onvermijdelijk. Op het werk, thuis, met buren of in zakelijke relaties: waar mensen samenwerken of samenleven, ontstaan soms spanningen. Toch belanden veel conflicten nog steeds snel bij advocaten of in de rechtszaal.
              </p>
              
              <p className="text-slate-900 font-bold text-2xl tracking-tight italic">Dat is zelden de beste oplossing.</p>
              
              <p>
                Een juridische procedure kost vaak veel geld, tijd en energie. Bovendien eindigt een rechtszaak bijna altijd met een winnaar en een verliezer. De onderliggende relatie is daarna vaak beschadigd of zelfs definitief kapot.
              </p>

              <p className="text-primary font-black text-2xl">Mediation biedt een ander pad.</p>

              <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-xl shadow-blue-500/5 space-y-8">
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">Wat is mediation?</h3>
                <p>
                  Mediation is een manier om conflicten op te lossen waarbij beide partijen, onder begeleiding van een neutrale mediator, met elkaar in gesprek gaan. Het doel is niet om te winnen, maar om samen tot afspraken te komen die voor beide acceptabel zijn.
                </p>

                <div className="space-y-4">
                  <p className="font-black text-slate-900 uppercase tracking-widest text-xs">Bij mediation:</p>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 list-none p-0">
                    {[
                      "behouden beide partijen controle over de uitkomst",
                      "is er ruimte voor emoties én rationele oplossingen",
                      "staat samenwerking centraal",
                      "blijven relaties vaker intact"
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3 bg-slate-50 p-5 rounded-2xl border border-slate-100 font-bold text-slate-700">
                        <span className="material-symbols-outlined text-primary">check_circle</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="text-lg font-bold text-primary italic">
                  Het proces is doorgaans sneller en aanzienlijk goedkoper dan een juridische procedure.
                </p>
              </div>

              <div className="space-y-6">
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">Wanneer werkt mediation goed?</h3>
                <p>
                  Mediation werkt vooral goed wanneer beide partijen bereid zijn om te communiceren en openstaan voor een oplossing. Dat hoeft niet te betekenen dat iedereen het meteen met elkaar eens is — juist bij stevige conflicten kan mediation verrassend effectief zijn.
                </p>
                <p className="text-slate-900 font-bold text-xl underline decoration-primary/30 decoration-4 underline-offset-8">
                  Het belangrijkste is de bereidheid om te praten.
                </p>
              </div>

              <div className="space-y-10 pt-10">
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">Waarom steeds meer mensen kiezen voor mediation</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  {[
                    { title: "Escalatie voorkomt", desc: "Zet een punt achter de ruzie voordat het te laat is." },
                    { title: "Stress vermindert", desc: "Geen jarenlange procedures maar snelle duidelijkheid." },
                    { title: "Praktische oplossingen", desc: "Afspraken die in het echt ook werken." },
                    { title: "Toekomstgericht", desc: "Niet blijven hangen in het verleden." }
                  ].map((benefit, i) => (
                    <div key={i} className="space-y-2 group border-b border-slate-100 pb-8">
                      <h4 className="text-xl font-black text-slate-900 group-hover:text-primary transition-colors">{benefit.title}</h4>
                      <p className="text-base text-slate-500 leading-relaxed">{benefit.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-2xl font-black text-slate-900 leading-tight pt-10 border-t border-slate-100">
                In plaats van terug te kijken naar wie er “gelijk had”, richt mediation zich op: <span className="text-primary italic underline decoration-primary/20 underline-offset-8">hoe gaan we verder?</span>
              </p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-white py-32 px-8 max-w-[1440px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            {[
              { icon: 'bolt', title: 'Snelheid', desc: 'Binnen enkele dagen een definitieve oplossing, zonder de maandenlange wachttijden.' },
              { icon: 'verified_user', title: 'Rechtsgeldig', desc: 'Een officiële Vaststellingsovereenkomst (VSO), juridisch getoetst door AI.' },
              { icon: 'lock', title: 'Vertrouwelijk', desc: 'Uw gesprekken zijn 100% versleuteld en worden nooit gedeeld met derden.' }
            ].map((f, i) => (
              <div key={i} className="p-12 bg-slate-50/50 rounded-[3.5rem] border border-slate-100 hover:shadow-2xl hover:bg-white transition-all duration-500 group">
                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-md mb-10 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-primary text-4xl">{f.icon}</span>
                </div>
                <h3 className="text-3xl font-black text-slate-900 mb-5 tracking-tight">{f.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed text-lg">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 px-8 text-center max-w-[1440px] mx-auto">
          <div className="bg-slate-900 rounded-[5rem] p-16 md:p-32 shadow-2xl relative overflow-hidden group">
            <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/30 blur-[150px] rounded-full group-hover:scale-110 transition-transform duration-1000"></div>
            <div className="relative z-10 flex flex-col items-center gap-12">
              <h2 className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-[0.95]">Klaar voor de oplossing?</h2>
              <p className="text-slate-400 text-2xl font-medium max-w-2xl">Start vandaag nog een officieel mediation dossier voor een vreedzame uitkomst.</p>
              <button 
                onClick={handleStartProcess}
                className="bg-white text-slate-900 px-16 py-7 rounded-[2.5rem] font-black text-2xl shadow-xl hover:bg-blue-50 transition-all active:scale-[0.98]"
              >
                Start nu voor €3,99
              </button>
            </div>
          </div>
        </section>

        <footer className="py-24 border-t border-slate-100 px-8 max-w-[1440px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start gap-16">
            <div className="space-y-6">
              <Logo showText={true} />
              <p className="text-sm font-black text-slate-300 uppercase tracking-[0.4em] max-w-xs">Conflictbemiddeling voor de digitale generatie.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-24">
              <div className="space-y-6">
                <span className="text-[11px] font-black text-slate-300 uppercase tracking-[0.5em]">Platform</span>
                <div className="flex flex-col gap-4">
                  <Link to="/hoe-werkt-rsolve" className="text-base font-bold text-slate-600 hover:text-primary transition-colors">Hoe het werkt</Link>
                  <Link to="/kosten" className="text-base font-bold text-slate-600 hover:text-primary transition-colors">Tarieven</Link>
                </div>
              </div>
              <div className="space-y-6">
                <span className="text-[11px] font-black text-slate-300 uppercase tracking-[0.5em]">Juridisch</span>
                <div className="flex flex-col gap-4">
                  <Link to="/privacy" className="text-base font-bold text-slate-600 hover:text-primary transition-colors">Privacy</Link>
                  <Link to="/terms" className="text-base font-bold text-slate-600 hover:text-primary transition-colors">Voorwaarden</Link>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-24 pt-16 border-t border-slate-50 text-center">
            <p className="text-[11px] font-black text-slate-200 uppercase tracking-[0.8em]">© 2024 Rsolve Mediation B.V. • Amsterdam</p>
          </div>
        </footer>
      </main>

      {/* Settings Modal */}
      {isLangModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-md">
          <div className="bg-white w-full max-w-sm rounded-[3.5rem] shadow-2xl p-10 space-y-8 border-none animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center">
              <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">{t('settings')}</h2>
              <button onClick={() => setIsLangModalOpen(false)} className="p-2 text-slate-300 hover:text-primary"><ICONS.X /></button>
            </div>
            <div className="space-y-3">
              {Object.keys(UI_TRANSLATIONS).map(langKey => (
                <button 
                  key={langKey}
                  onClick={() => { setAppLanguage(langKey); setIsLangModalOpen(false); }}
                  className={`w-full p-5 rounded-[1.5rem] border-2 text-left font-black text-base flex items-center justify-between transition-all ${appLanguage === langKey ? 'border-primary bg-blue-50 text-primary shadow-sm' : 'border-slate-50 text-slate-400 hover:bg-slate-50'}`}
                >
                  {UI_TRANSLATIONS[langKey].label}
                  {appLanguage === langKey && <ICONS.Check className="w-5 h-5" />}
                </button>
              ))}
            </div>
            <Button className="w-full rounded-2xl py-5" onClick={() => setIsLangModalOpen(false)}>Sluiten</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Landing;
