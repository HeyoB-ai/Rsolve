
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Logo } from '../components/ui/Logo';
import { UI_TRANSLATIONS, ICONS } from '../constants';
import { Button } from '../components/ui/Button';

interface LandingProps {
  appLanguage: string;
  setAppLanguage: (lang: string) => void;
  t: (key: string) => string;
  setHasPaid: (val: boolean) => void;
}

const Landing: React.FC<LandingProps> = ({ appLanguage, setAppLanguage, t, setHasPaid }) => {
  const navigate = useNavigate();
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);

  const handleStartProcess = () => {
    navigate('/payment');
  };

  // De exacte foto die de gebruiker heeft verstrekt
  const heroImageUrl = "https://replicate.delivery/yhqm/f0d8f99e-3e5a-497d-8e42-1e967364b6f7/out-0.png"; 

  return (
    <div className="bg-white text-[#1e293b] font-display antialiased">
      {/* Header - Stitch Signature */}
      <header className="sticky top-0 z-50 flex items-center bg-white/90 backdrop-blur-md p-4 border-b border-slate-50 justify-between">
        <Logo showText={true} />
        <div className="flex items-center gap-3">
          <button 
            onClick={handleStartProcess}
            className="bg-primary text-white px-6 py-2 rounded-full text-sm font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/10 active:scale-95"
          >
            Start
          </button>
          <button 
            onClick={() => setIsLangModalOpen(true)}
            className="p-2 text-slate-400 hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>
      </header>

      <main className="overflow-x-hidden">
        {/* Hero Section */}
        <section className="relative px-5 py-12 md:py-24 subtle-mesh warm-accent-glow">
          <div className="flex flex-col lg:flex-row gap-16 max-w-7xl mx-auto items-center">
            <div className="flex flex-col gap-8 text-center lg:text-left lg:max-w-xl animate-in fade-in slide-in-from-left-8 duration-700">
              <div className="inline-flex items-center gap-2 py-1.5 px-4 bg-blue-50/80 border border-blue-100 rounded-full w-fit mx-auto lg:mx-0 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-accent-warm animate-pulse"></span>
                <span className="text-primary font-black text-[10px] tracking-widest uppercase">De toekomst van Mediation</span>
              </div>
              <h1 className="text-slate-900 text-5xl md:text-7xl font-extrabold leading-[1.05] tracking-tighter">
                Conflicten oplossen <span className="text-primary">zonder strijd.</span>
              </h1>
              <p className="text-slate-500 text-xl font-medium leading-relaxed">
                Bereik samen een rechtsgeldige oplossing met hulp van onze AI-mediator. Sneller, goedkoper en menselijker dan een advocaat.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={handleStartProcess}
                  className="flex-1 bg-primary text-white text-lg font-bold h-16 rounded-2xl shadow-2xl shadow-blue-500/20 flex items-center justify-center gap-3 hover:bg-blue-700 transition-all active:scale-[0.98]"
                >
                  <span>Start mediation</span>
                  <span className="material-symbols-outlined text-2xl">arrow_forward</span>
                </button>
                <button className="flex-1 bg-white text-slate-900 text-lg font-bold h-16 rounded-2xl border-2 border-slate-100 hover:border-primary/20 transition-all">
                  Hoe het werkt
                </button>
              </div>
              <div className="flex items-center justify-center lg:justify-start gap-4">
                 <div className="flex -space-x-3">
                    {[1,2,3,4].map(i => <img key={i} className="w-10 h-10 rounded-full border-2 border-white" src={`https://i.pravatar.cc/100?u=${i}`} alt="user" />)}
                 </div>
                 <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">+500 zaken succesvol afgerond</p>
              </div>
            </div>
            
            {/* De Specifieke Foto Container */}
            <div className="relative w-full lg:flex-1 animate-in fade-in zoom-in-95 duration-1000 delay-200">
              <div className="absolute -inset-4 bg-gradient-to-tr from-primary/5 to-accent-warm/5 rounded-[3rem] blur-2xl"></div>
              <div className="relative w-full aspect-[4/3] md:aspect-[3/2] lg:aspect-square bg-white rounded-[3rem] soft-card-shadow border-8 border-white overflow-hidden group shadow-2xl">
                {/* img tag for better reliability */}
                <img 
                  src={heroImageUrl} 
                  alt="Rsolve Mediation Session" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="eager"
                />

                {/* Floating UI Elements matching the request */}
                <div className="absolute top-8 left-8 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-lg border border-white/50">
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Nu Online</span>
                   </div>
                </div>

                <div className="absolute bottom-8 right-8 bg-white/90 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-white/50 max-w-xs transition-transform group-hover:scale-105">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined">auto_awesome</span>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">AI Mediator</span>
                  </div>
                  <p className="text-sm font-bold text-slate-900 leading-snug italic">"Ik hoor dat dit voor beide partijen belangrijk is. Zullen we kijken naar een middenweg?"</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="bg-white py-24 px-5 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-10 rounded-[2.5rem] bg-slate-50/50 border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-md mb-8 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-primary text-3xl">bolt</span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">Snelheid</h3>
              <p className="text-slate-500 leading-relaxed font-medium">Binnen enkele dagen een definitieve oplossing, zonder de maandenlange wachttijden van de rechtbank.</p>
            </div>
            <div className="p-10 rounded-[2.5rem] bg-slate-50/50 border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-md mb-8 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-primary text-3xl">verified_user</span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">Rechtsgeldig</h3>
              <p className="text-slate-500 leading-relaxed font-medium">Het resultaat is een officiële Vaststellingsovereenkomst (VSO), juridisch getoetst door onze AI.</p>
            </div>
            <div className="p-10 rounded-[2.5rem] bg-slate-50/50 border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-md mb-8 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-primary text-3xl">lock</span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">Vertrouwelijk</h3>
              <p className="text-slate-500 leading-relaxed font-medium">Uw gegevens en gesprekken zijn 100% versleuteld en worden nooit gedeeld met derden.</p>
            </div>
          </div>
        </section>

        {/* Showcase Area */}
        <section className="px-5 py-24 bg-slate-50/80 border-y border-slate-100 relative">
          <div className="max-w-6xl mx-auto flex flex-col gap-16">
            <div className="text-center space-y-4">
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Escaleer niet, communiceer.</h2>
              <p className="text-slate-500 text-lg max-w-2xl mx-auto font-medium">Onze technologie herkent emotionele lading en helpt u berichten te sturen die tot een oplossing leiden.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
               <div className="space-y-6">
                  <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-white">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">U stuurt:</span>
                     <p className="text-xl font-serif italic text-slate-700 leading-relaxed">"Dit is echt de laatste keer dat ik op je geld wacht. Ik ben er klaar mee!"</p>
                  </div>
                  <div className="flex justify-center">
                     <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center shadow-lg animate-bounce">
                        <span className="material-symbols-outlined">south</span>
                     </div>
                  </div>
                  <div className="bg-primary p-10 rounded-[2.5rem] shadow-2xl shadow-blue-500/20 relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 blur-[80px] rounded-full"></div>
                     <span className="text-[10px] font-black text-white/50 uppercase tracking-widest block mb-4">Rsolve Mediator Suggestie:</span>
                     <p className="text-2xl font-bold text-white leading-tight tracking-tight">"Ik ervaar frustratie over het verloop van de betalingen en wil graag afspraken maken over een vast moment."</p>
                  </div>
               </div>
               <div className="lg:pl-16 space-y-10">
                  <div className="flex gap-6 items-start">
                    <div className="w-12 h-12 bg-blue-100 text-primary rounded-2xl flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined">psychology</span>
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-slate-900 mb-2">Emotie Detectie</h4>
                      <p className="text-slate-500 font-medium">AI herkent spanning en voorkomt dat gesprekken ontsporen.</p>
                    </div>
                  </div>
                  <div className="flex gap-6 items-start">
                    <div className="w-12 h-12 bg-blue-100 text-primary rounded-2xl flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined">auto_stories</span>
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-slate-900 mb-2">Objectief Dossier</h4>
                      <p className="text-slate-500 font-medium">Focus op feiten en afspraken voor een juridisch houdbaar resultaat.</p>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-5 py-24 text-center bg-white">
          <div className="max-w-5xl mx-auto bg-slate-900 rounded-[4rem] p-16 md:p-24 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/20 blur-[120px] rounded-full"></div>
            <div className="relative z-10 flex flex-col items-center gap-8">
              <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter">Klaar voor de oplossing?</h2>
              <p className="text-slate-400 text-xl max-w-xl font-medium">Binnen 2 minuten start u een officieel mediation dossier. Geen abonnement, geen verborgen kosten.</p>
              <button 
                onClick={handleStartProcess}
                className="px-12 bg-white text-slate-900 font-black h-18 py-5 rounded-2xl shadow-xl hover:bg-blue-50 transition-all active:scale-[0.98] text-xl"
              >
                Start nu voor €3,99
              </button>
            </div>
          </div>
        </section>

        <footer className="bg-white p-12 border-t border-slate-50">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
            <div className="space-y-4">
              <Logo showText={true} />
              <p className="text-sm text-slate-400 font-medium max-w-xs leading-relaxed">Vreedzame conflictbemiddeling voor de digitale generatie.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-16">
              <div className="space-y-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Platform</span>
                <div className="flex flex-col gap-3">
                  <Link className="text-sm text-slate-600 font-bold hover:text-primary" to="/hoe-werkt-rsolve">Hoe het werkt</Link>
                  <Link className="text-sm text-slate-600 font-bold hover:text-primary" to="/kosten">Tarieven</Link>
                </div>
              </div>
              <div className="space-y-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Juridisch</span>
                <div className="flex flex-col gap-3">
                  <Link className="text-sm text-slate-600 font-bold hover:text-primary" to="/privacy">Privacy</Link>
                  <Link className="text-sm text-slate-600 font-bold hover:text-primary" to="/terms">Voorwaarden</Link>
                </div>
              </div>
            </div>
          </div>
          <div className="max-w-7xl mx-auto pt-12 mt-12 border-t border-slate-50 text-center">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">© 2024 Rsolve Mediation B.V. • Amsterdam</p>
          </div>
        </footer>
      </main>

      {/* Language Modal */}
      {isLangModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">{t('settings')}</h2>
              <button onClick={() => setIsLangModalOpen(false)} className="p-2 text-slate-400 hover:text-primary transition-colors"><ICONS.X /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 gap-2">
              {Object.keys(UI_TRANSLATIONS).map(langKey => (
                <button 
                  key={langKey}
                  onClick={() => { setAppLanguage(langKey); setIsLangModalOpen(false); }}
                  className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${appLanguage === langKey ? 'border-primary bg-blue-50 text-blue-900 font-bold shadow-sm' : 'border-slate-100 text-slate-600 hover:bg-slate-50'}`}
                >
                  <span className="text-sm font-bold">{UI_TRANSLATIONS[langKey].label}</span>
                  {appLanguage === langKey && <ICONS.Check className="w-4 h-4 text-primary" />}
                </button>
              ))}
            </div>
            <div className="p-6 border-t border-slate-100 shrink-0">
              <Button variant="primary" className="w-full rounded-2xl py-4 font-black uppercase tracking-widest text-[10px]" onClick={() => setIsLangModalOpen(false)}>{t('close')}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Landing;
