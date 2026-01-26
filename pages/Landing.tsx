
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

  // Primaire URL en een zeer stabiele Unsplash fallback
  const primaryHeroUrl = "https://replicate.delivery/yhqm/f0d8f99e-3e5a-497d-8e42-1e967364b6f7/out-0.png";
  const fallbackHeroUrl = "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=1200";

  return (
    <div className="bg-white text-[#1e293b] font-display antialiased min-h-screen">
      {/* Header conform screenshot */}
      <header className="sticky top-0 z-50 flex items-center bg-white/95 backdrop-blur-md px-8 py-6 justify-between max-w-[1440px] mx-auto w-full">
        <Logo showText={true} className="w-10 h-10" />
        <div className="flex items-center gap-8">
          <button 
            onClick={handleStartProcess}
            className="bg-[#0b50da] text-white px-10 py-3.5 rounded-full text-sm font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95"
          >
            Start
          </button>
          <button 
            onClick={() => setIsLangModalOpen(true)}
            className="p-1 text-slate-400 hover:text-[#0b50da] transition-colors"
          >
            <span className="material-symbols-outlined text-4xl">menu</span>
          </button>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative px-8 py-12 md:py-24 max-w-[1440px] mx-auto overflow-visible">
          <div className="flex flex-col lg:flex-row gap-20 items-center">
            {/* Left Content */}
            <div className="flex flex-col gap-12 text-left lg:max-w-2xl animate-in fade-in slide-in-from-left-8 duration-700">
              <div className="inline-flex items-center gap-3 py-2.5 px-6 bg-blue-50 border border-blue-100/50 rounded-full w-fit shadow-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-accent-warm shadow-[0_0_8px_rgba(255,154,92,0.6)]"></span>
                <span className="text-[#0b50da] font-black text-[11px] tracking-[0.25em] uppercase">De toekomst van Mediation</span>
              </div>
              
              <h1 className="text-[#0f172a] text-7xl md:text-[115px] font-extrabold leading-[0.85] tracking-tighter">
                Conflicten<br />
                oplossen <br/>
                <span className="text-[#0b50da]">zonder</span><br />
                <span className="text-[#0b50da]">strijd.</span>
              </h1>
              
              <p className="text-slate-500 text-2xl font-medium leading-relaxed max-w-lg">
                Bereik samen een rechtsgeldige oplossing met hulp van onze AI-mediator. Sneller, goedkoper en menselijker dan een advocaat.
              </p>
              
              <div className="flex items-center gap-5 pt-4">
                 <div className="flex -space-x-4">
                    {[1,2,3,4].map(i => <img key={i} className="w-14 h-14 rounded-full border-4 border-white shadow-md" src={`https://i.pravatar.cc/150?u=${i+200}`} alt="user" />)}
                 </div>
                 <p className="text-[12px] text-slate-400 font-black uppercase tracking-[0.3em]">+500 zaken succesvol afgerond</p>
              </div>
            </div>
            
            {/* Right Content - Hero Image met robuuste fallback */}
            <div className="relative w-full lg:flex-1 animate-in fade-in zoom-in-95 duration-1000 delay-200 mt-12 lg:mt-0">
              <div className="relative w-full aspect-[1.1] bg-slate-50 rounded-[6rem] shadow-[0_40px_100px_-20px_rgba(11,80,218,0.15)] border-[20px] border-white overflow-hidden group">
                <img 
                  src={primaryHeroUrl} 
                  alt="Rsolve Mediation Session" 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  loading="eager"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (target.src !== fallbackHeroUrl) {
                      target.src = fallbackHeroUrl;
                    }
                  }}
                />

                {/* NU ONLINE Badge */}
                <div className="absolute top-12 left-12 bg-white/95 backdrop-blur-xl px-7 py-4 rounded-3xl shadow-2xl flex items-center gap-4 border border-white/50">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.8)]"></div>
                  <span className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-700">Nu Online</span>
                </div>

                {/* AI Mediator Kaart */}
                <div className="absolute bottom-12 right-12 bg-white/98 backdrop-blur-2xl p-12 rounded-[4rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-white/60 max-w-[420px] transform hover:translate-y-[-12px] transition-transform duration-500">
                  <div className="flex items-center gap-5 mb-8">
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-md border border-slate-50 overflow-hidden">
                      <Logo className="w-10 h-10" />
                    </div>
                    <span className="text-[12px] font-black uppercase tracking-[0.4em] text-[#0b50da]">AI Mediator</span>
                  </div>
                  <p className="text-xl font-bold text-slate-900 leading-[1.6] italic">
                    "Ik hoor dat dit voor beide partijen belangrijk is. Zullen we kijken naar een middenweg?"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Artikel Sectie */}
        <section className="bg-slate-50/30 py-40 px-8 border-y border-slate-100">
          <div className="max-w-4xl mx-auto space-y-16">
            <header className="space-y-8">
              <div className="inline-flex items-center gap-3 py-2 px-5 bg-white border border-slate-200 rounded-full w-fit shadow-sm">
                <span className="material-symbols-outlined text-[#0b50da] text-xl">auto_stories</span>
                <span className="text-[#0b50da] font-black text-[11px] tracking-[0.3em] uppercase">Kennisbank</span>
              </div>
              <h2 className="text-6xl md:text-8xl font-black text-[#0f172a] tracking-tighter leading-[0.9] m-0">
                Mediation: conflicten oplossen <span className="text-[#0b50da] italic">zonder strijd</span>
              </h2>
            </header>

            <div className="prose prose-slate prose-2xl max-w-none text-slate-600 font-medium leading-relaxed space-y-16">
              <p className="text-2xl md:text-3xl">
                Conflicten zijn onvermijdelijk. Op het werk, thuis, met buren of in zakelijke relaties: waar mensen samenwerken of samenleven, ontstaan soms spanningen. Toch belanden veel conflicten nog steeds snel bij advocaten of in de rechtszaal.
              </p>
              
              <div className="relative py-12 px-16 bg-white rounded-[4rem] border border-slate-100 shadow-2xl shadow-blue-500/5">
                <div className="absolute left-0 top-16 bottom-16 w-2 bg-[#0b50da] rounded-full"></div>
                <p className="text-[#0f172a] font-black text-4xl md:text-5xl tracking-tight leading-tight italic m-0">
                  "Dat is zelden de beste oplossing."
                </p>
              </div>
              
              <p className="text-2xl">
                Een juridische procedure kost vaak veel geld, tijd en energie. Bovendien eindigt een rechtszaak bijna altijd met een winnaar en een verliezer. De onderliggende relatie is daarna vaak beschadigd of zelfs definitief kapot. 
                <span className="block mt-10 text-[#0b50da] font-black text-3xl">Mediation biedt een ander pad.</span>
              </p>

              <div className="bg-white p-16 rounded-[5rem] border border-slate-200 shadow-2xl space-y-12">
                <h3 className="text-4xl md:text-5xl font-black text-[#0f172a] tracking-tight m-0">Wat is mediation?</h3>
                <p className="text-xl">
                  Mediation is een manier om conflicten op te lossen waarbij beide partijen, onder begeleiding van een neutrale mediator, met elkaar in gesprek gaan. Het doel is niet om te winnen, maar om samen tot afspraken te komen die voor beide acceptabel zijn.
                </p>

                <div className="space-y-8">
                  <p className="font-black text-slate-400 uppercase tracking-[0.4em] text-xs">Bij mediation:</p>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-8 list-none p-0 m-0">
                    {[
                      "behouden beide partijen controle over de uitkomst",
                      "is er ruimte voor emoties én rationele oplossingen",
                      "staat samenwerking centraal",
                      "blijven relaties vaker intact"
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-5 bg-slate-50 p-8 rounded-3xl border border-slate-100 font-bold text-slate-800 m-0 shadow-sm">
                        <span className="material-symbols-outlined text-[#0b50da] bg-white p-2 rounded-xl shadow-sm text-2xl">check_circle</span>
                        <span className="leading-tight text-lg">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 px-8 text-center max-w-[1440px] mx-auto">
          <div className="bg-[#0f172a] rounded-[6rem] p-20 md:p-40 shadow-2xl relative overflow-hidden group">
            <div className="absolute -top-32 -right-32 w-full h-full bg-[#0b50da]/20 blur-[180px] rounded-full group-hover:scale-110 transition-transform duration-1000"></div>
            <div className="relative z-10 flex flex-col items-center gap-16">
              <h2 className="text-6xl md:text-[140px] font-black text-white tracking-tighter leading-[0.85] m-0">Klaar voor de <span className="text-[#0b50da]">oplossing?</span></h2>
              <button 
                onClick={handleStartProcess}
                className="bg-white text-[#0f172a] px-20 py-8 rounded-[3rem] font-black text-3xl shadow-2xl hover:bg-blue-50 transition-all active:scale-[0.98] mt-8"
              >
                Start nu voor €3,99
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Settings Modal */}
      {isLangModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-md">
          <div className="bg-white w-full max-w-sm rounded-[4rem] shadow-2xl p-12 space-y-10 border-none animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center">
              <h2 className="text-[12px] font-black uppercase tracking-[0.4em] text-slate-400">{t('settings')}</h2>
              <button onClick={() => setIsLangModalOpen(false)} className="p-2 text-slate-300 hover:text-[#0b50da]"><ICONS.X /></button>
            </div>
            <div className="space-y-4">
              {Object.keys(UI_TRANSLATIONS).map(langKey => (
                <button 
                  key={langKey}
                  onClick={() => { setAppLanguage(langKey); setIsLangModalOpen(false); }}
                  className={`w-full p-6 rounded-[2rem] border-2 text-left font-black text-lg flex items-center justify-between transition-all ${appLanguage === langKey ? 'border-[#0b50da] bg-blue-50 text-[#0b50da] shadow-sm' : 'border-slate-50 text-slate-400 hover:bg-slate-50'}`}
                >
                  {UI_TRANSLATIONS[langKey].label}
                  {appLanguage === langKey && <ICONS.Check className="w-6 h-6" />}
                </button>
              ))}
            </div>
            <Button className="w-full rounded-[2rem] py-6 text-xl shadow-lg" onClick={() => setIsLangModalOpen(false)}>Sluiten</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Landing;
