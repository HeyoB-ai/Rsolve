
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

  // De exacte foto van de gebruiker
  const heroImageUrl = "https://replicate.delivery/yhqm/f0d8f99e-3e5a-497d-8e42-1e967364b6f7/out-0.png"; 

  return (
    <div className="bg-white text-[#1e293b] font-display antialiased">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center bg-white/95 backdrop-blur-md px-6 py-4 border-b border-slate-50 justify-between">
        <Logo showText={true} />
        <div className="flex items-center gap-4">
          <button 
            onClick={handleStartProcess}
            className="bg-primary text-white px-6 py-2.5 rounded-full text-sm font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/10 active:scale-95"
          >
            Start
          </button>
          <button 
            onClick={() => setIsLangModalOpen(true)}
            className="p-2 text-slate-400 hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-2xl">menu</span>
          </button>
        </div>
      </header>

      <main>
        {/* Hero Section - Exact Match met screenshot */}
        <section className="relative px-6 py-12 md:py-24 max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            {/* Left Content */}
            <div className="flex flex-col gap-8 text-left lg:max-w-xl animate-in fade-in slide-in-from-left-8 duration-700">
              <div className="inline-flex items-center gap-2 py-1.5 px-4 bg-blue-50/80 border border-blue-100 rounded-full w-fit shadow-sm">
                <span className="w-2 h-2 rounded-full bg-accent-warm"></span>
                <span className="text-primary font-black text-[10px] tracking-[0.2em] uppercase">De toekomst van Mediation</span>
              </div>
              
              <h1 className="text-slate-900 text-6xl md:text-8xl font-extrabold leading-[0.95] tracking-tighter">
                Conflicten oplossen <span className="text-primary">zonder strijd.</span>
              </h1>
              
              <p className="text-slate-500 text-xl font-medium leading-relaxed max-w-lg">
                Bereik samen een rechtsgeldige oplossing met hulp van onze AI-mediator. Sneller, goedkoper en menselijker dan een advocaat.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={handleStartProcess}
                  className="bg-primary text-white text-lg font-black h-16 px-10 rounded-[2rem] shadow-2xl shadow-blue-500/25 flex items-center justify-center gap-3 hover:bg-blue-700 transition-all active:scale-[0.98]"
                >
                  <span>Start mediation</span>
                  <span className="material-symbols-outlined text-2xl">arrow_forward</span>
                </button>
                <button className="bg-white text-slate-900 text-lg font-black h-16 px-10 rounded-[2rem] border-2 border-slate-100 hover:border-primary/20 transition-all">
                  Hoe het werkt
                </button>
              </div>

              <div className="flex items-center gap-4 pt-4">
                 <div className="flex -space-x-3">
                    {[1,2,3,4].map(i => <img key={i} className="w-10 h-10 rounded-full border-2 border-white" src={`https://i.pravatar.cc/100?u=${i+10}`} alt="user" />)}
                 </div>
                 <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">+500 zaken succesvol afgerond</p>
              </div>
            </div>
            
            {/* Right Content - De Foto */}
            <div className="relative w-full lg:flex-1 animate-in fade-in zoom-in-95 duration-1000 delay-200">
              <div className="relative w-full aspect-[4/3] md:aspect-[1.2] lg:aspect-square bg-slate-50 rounded-[4rem] overflow-hidden shadow-2xl border-[12px] border-white">
                <img 
                  src={heroImageUrl} 
                  alt="Rsolve Mediation" 
                  className="w-full h-full object-cover"
                />

                {/* Overlays */}
                <div className="absolute top-8 left-8 bg-white/95 backdrop-blur-md px-5 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 border border-white/50">
                  <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-700">Nu Online</span>
                </div>

                <div className="absolute bottom-8 right-8 bg-white/95 backdrop-blur-xl p-8 rounded-[3rem] shadow-2xl border border-white/50 max-w-[300px]">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                      <Logo className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">AI Mediator</span>
                  </div>
                  <p className="text-sm font-bold text-slate-900 leading-relaxed italic">"Ik hoor dat dit voor beide partijen belangrijk is. Zullen we kijken naar een middenweg?"</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="bg-slate-50/50 py-32 border-y border-slate-100">
           <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                { icon: 'bolt', title: 'Snelheid', desc: 'Binnen enkele dagen een definitieve oplossing, zonder de maandenlange wachttijden.' },
                { icon: 'verified_user', title: 'Rechtsgeldig', desc: 'Een officiële Vaststellingsovereenkomst (VSO), juridisch getoetst door AI.' },
                { icon: 'lock', title: 'Vertrouwelijk', desc: 'Uw gesprekken zijn 100% versleuteld en worden nooit gedeeld met derden.' }
              ].map((f, i) => (
                <div key={i} className="p-10 bg-white rounded-[3rem] shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-500 group">
                   <div className="w-16 h-16 bg-blue-50 text-primary rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-3xl">{f.icon}</span>
                   </div>
                   <h3 className="text-2xl font-black text-slate-900 mb-4">{f.title}</h3>
                   <p className="text-slate-500 font-medium leading-relaxed">{f.desc}</p>
                </div>
              ))}
           </div>
        </section>

        {/* CTA */}
        <section className="py-32 px-6 text-center">
           <div className="max-w-5xl mx-auto bg-slate-900 rounded-[4rem] p-16 md:p-32 shadow-2xl relative overflow-hidden group">
              <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/20 blur-[120px] rounded-full"></div>
              <div className="relative z-10 space-y-10">
                 <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter">Klaar voor de oplossing?</h2>
                 <p className="text-slate-400 text-xl font-medium max-w-xl mx-auto">Start vandaag nog een officieel mediation dossier voor een vreedzame uitkomst.</p>
                 <button 
                  onClick={handleStartProcess}
                  className="bg-white text-slate-900 px-12 py-6 rounded-[2rem] font-black text-xl shadow-xl hover:bg-blue-50 transition-all active:scale-[0.98]"
                 >
                   Start nu voor €3,99
                 </button>
              </div>
           </div>
        </section>

        <footer className="py-20 border-t border-slate-100 px-6">
           <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
              <Logo showText={true} />
              <div className="flex gap-16">
                 <div className="space-y-4">
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Platform</span>
                    <div className="flex flex-col gap-2">
                       <Link to="/hoe-werkt-rsolve" className="text-sm font-bold text-slate-600 hover:text-primary transition-colors">Hoe het werkt</Link>
                       <Link to="/kosten" className="text-sm font-bold text-slate-600 hover:text-primary transition-colors">Tarieven</Link>
                    </div>
                 </div>
                 <div className="space-y-4">
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Juridisch</span>
                    <div className="flex flex-col gap-2">
                       <Link to="/privacy" className="text-sm font-bold text-slate-600 hover:text-primary transition-colors">Privacy</Link>
                       <Link to="/terms" className="text-sm font-bold text-slate-600 hover:text-primary transition-colors">Voorwaarden</Link>
                    </div>
                 </div>
              </div>
           </div>
           <p className="mt-20 text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.5em]">© 2024 Rsolve Mediation B.V.</p>
        </footer>
      </main>

      {/* Language Modal */}
      {isLangModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-md">
          <div className="bg-white w-full max-w-sm rounded-[3rem] shadow-2xl p-8 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('settings')}</h2>
              <button onClick={() => setIsLangModalOpen(false)}><ICONS.X /></button>
            </div>
            <div className="space-y-2">
              {Object.keys(UI_TRANSLATIONS).map(langKey => (
                <button 
                  key={langKey}
                  onClick={() => { setAppLanguage(langKey); setIsLangModalOpen(false); }}
                  className={`w-full p-4 rounded-2xl border-2 text-left font-black text-sm flex items-center justify-between ${appLanguage === langKey ? 'border-primary bg-blue-50 text-primary' : 'border-slate-50 text-slate-500'}`}
                >
                  {UI_TRANSLATIONS[langKey].label}
                  {appLanguage === langKey && <ICONS.Check className="w-4 h-4" />}
                </button>
              ))}
            </div>
            <Button className="w-full rounded-2xl" onClick={() => setIsLangModalOpen(false)}>Sluiten</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Landing;
