
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

  return (
    <div className="bg-white text-[#1e293b] font-display antialiased">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center bg-white/90 backdrop-blur-md p-4 border-b border-slate-50 justify-between">
        <Logo showText={true} />
        <div className="flex items-center gap-3">
          <button 
            onClick={handleStartProcess}
            className="bg-primary text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-blue-700 transition-all shadow-lg active:scale-95"
          >
            Start
          </button>
          <button 
            onClick={() => setIsLangModalOpen(true)}
            className="p-1 text-slate-500 hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>
      </header>

      <main className="overflow-x-hidden">
        {/* Hero Section */}
        <section className="relative px-5 py-10 subtle-mesh warm-accent-glow">
          <div className="flex flex-col gap-8 max-w-5xl mx-auto">
            <div className="flex flex-col gap-5">
              <div className="inline-flex items-center gap-2 py-1 px-3 bg-blue-50/50 border border-blue-100/50 rounded-full w-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-warm animate-pulse"></span>
                <span className="text-primary font-bold text-[10px] tracking-widest uppercase">AI-Ondersteunde Mediation</span>
              </div>
              <h1 className="text-slate-900 text-4xl md:text-6xl font-extrabold leading-[1.15] tracking-tight">
                Conflicten oplossen <span className="text-primary">zonder strijd</span>
              </h1>
              <p className="text-slate-500 text-lg font-medium leading-relaxed max-w-xl">
                Het eerste platform dat neutrale communicatie en snelle, eerlijke oplossingen mogelijk maakt met slimme technologie.
              </p>
              <div className="flex flex-col gap-3 mt-2 md:max-w-xs">
                <button 
                  onClick={handleStartProcess}
                  className="w-full bg-primary text-white text-base font-bold h-14 rounded-2xl shadow-xl shadow-blue-500/10 flex items-center justify-center gap-2 border border-primary hover:bg-blue-700 transition-all active:scale-[0.98]"
                >
                  <span>Start mediation</span>
                  <span className="material-symbols-outlined text-xl">arrow_forward</span>
                </button>
                <p className="text-center text-xs text-slate-400 font-medium">Volledig vertrouwelijk • Juridisch onderbouwd</p>
              </div>
            </div>
            
            {/* The Specific Photo: Warm, professional mediation scene matching the user's upload */}
            <div 
              className="w-full aspect-[4/3] md:aspect-[21/9] bg-center bg-no-repeat bg-cover rounded-3xl soft-card-shadow border border-white transition-all duration-700 hover:shadow-2xl" 
              style={{ 
                backgroundImage: 'url("https://images.unsplash.com/photo-1573497620053-ea5300f94f21?q=80&w=2000&auto=format&fit=crop")',
                backgroundPosition: 'center 20%'
              }}
              title="Rsolve Mediation Sessie"
            >
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-white py-16 px-5 max-w-5xl mx-auto">
          <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-3">
              <h2 className="text-slate-900 text-2xl font-bold leading-tight">De toekomst van mediation</h2>
              <p className="text-slate-500 text-base leading-relaxed">Rsolve combineert menselijke expertise met slimme technologie voor een proces dat sneller en toegankelijker is.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="flex flex-col gap-4 rounded-3xl border border-slate-50 bg-slate-50/30 p-7 soft-card-shadow">
                <div className="bg-white text-primary w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm border border-slate-100">
                  <span className="material-symbols-outlined">bolt</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  <h3 className="text-slate-900 text-lg font-bold">Snelheid</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">Doorloop het volledige proces in dagen in plaats van maanden. Geen wachttijden.</p>
                </div>
              </div>
              <div className="flex flex-col gap-4 rounded-3xl border border-slate-50 bg-slate-50/30 p-7 soft-card-shadow">
                <div className="bg-white text-primary w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm border border-slate-100">
                  <span className="material-symbols-outlined">verified_user</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  <h3 className="text-slate-900 text-lg font-bold">Neutraliteit</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">Onze AI-waarborging garandeert een onbevooroordeeld proces waarin iedereen gehoord wordt.</p>
                </div>
              </div>
              <div className="flex flex-col gap-4 rounded-3xl border border-slate-50 bg-slate-50/30 p-7 soft-card-shadow">
                <div className="bg-white text-primary w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm border border-slate-100">
                  <span className="material-symbols-outlined">devices</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  <h3 className="text-slate-900 text-lg font-bold">Toegankelijkheid</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">Start uw zaak waar en wanneer u wilt. Uw digitale dossier is altijd bereikbaar.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Smart Translate Section */}
        <section className="px-5 py-16 bg-slate-50/80 border-y border-slate-100">
          <div className="flex flex-col gap-8 max-w-5xl mx-auto">
            <div className="flex flex-col gap-4">
              <div className="inline-flex items-center gap-1.5 text-primary text-xs font-bold uppercase tracking-widest">
                <span className="material-symbols-outlined text-sm">auto_awesome</span>
                Smart Translate
              </div>
              <h2 className="text-slate-900 text-2xl font-bold leading-tight">Mediation zonder strijd</h2>
              <p className="text-slate-500 text-base">Onze AI neutraliseert harde bewoordingen naar een constructieve dialoog, zodat u samen verder kunt.</p>
            </div>
            <div className="bg-white rounded-[2rem] p-6 soft-card-shadow border border-white flex flex-col gap-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-accent-warm/5 blur-3xl rounded-full"></div>
              <div className="flex flex-col gap-6 relative z-10">
                <div className="flex flex-col gap-1.5 max-w-[90%]">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Origineel bericht</span>
                  <div className="bg-slate-100/70 p-4 rounded-2xl rounded-tl-none italic text-sm text-slate-600">
                    "Ik ben het zat dat je altijd te laat betaalt! Dit is onacceptabel."
                  </div>
                </div>
                <div className="flex justify-center -my-2">
                  <div className="bg-primary/5 p-2 rounded-full border border-primary/10">
                    <span className="material-symbols-outlined text-primary text-xl">keyboard_double_arrow_down</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 self-end max-w-[90%] text-right">
                  <span className="text-[10px] uppercase font-bold text-primary tracking-wider">Rsolve Suggestie</span>
                  <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-2xl rounded-tr-none text-sm text-primary font-medium leading-relaxed">
                    "Ik maak me zorgen over de tijdige ontvangst van de betalingen en zou graag afspraken maken over een vast moment."
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3 Steps Section */}
        <section className="px-5 py-20 bg-white max-w-5xl mx-auto">
          <h2 className="text-slate-900 text-2xl font-bold mb-10 text-center">In drie stappen naar rust</h2>
          <div className="flex flex-col gap-0 max-w-lg mx-auto">
            <div className="flex gap-6">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 text-primary flex items-center justify-center font-bold text-sm shrink-0">1</div>
                <div className="w-0.5 h-16 bg-gradient-to-b from-slate-100 to-transparent"></div>
              </div>
              <div className="pt-1">
                <h4 className="text-slate-900 font-bold mb-1">Aanmelding</h4>
                <p className="text-slate-500 text-sm leading-relaxed">Beantwoord een paar vragen en nodig de tegenpartij uit.</p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 text-primary flex items-center justify-center font-bold text-sm shrink-0">2</div>
                <div className="w-0.5 h-16 bg-gradient-to-b from-slate-100 to-transparent"></div>
              </div>
              <div className="pt-1">
                <h4 className="text-slate-900 font-bold mb-1">Begeleide Dialoog</h4>
                <p className="text-slate-500 text-sm leading-relaxed">Onze technologie helpt u constructief tot de kern te komen.</p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 text-primary flex items-center justify-center font-bold text-sm shrink-0">3</div>
              </div>
              <div className="pt-1">
                <h4 className="text-slate-900 font-bold mb-1">Vaststelling</h4>
                <p className="text-slate-500 text-sm leading-relaxed">Afspraken worden juridisch bindend vastgelegd in een overeenkomst.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-5 py-16 text-center bg-white max-w-5xl mx-auto">
          <div className="bg-slate-50 rounded-[2.5rem] p-10 border border-slate-100 soft-card-shadow">
            <h2 className="text-2xl font-extrabold text-slate-900 mb-4">Klaar voor de oplossing?</h2>
            <p className="text-slate-500 mb-8 leading-relaxed">Sluit u aan bij honderden anderen die hun geschil vreedzaam hebben opgelost.</p>
            <button 
              onClick={handleStartProcess}
              className="w-full bg-primary text-white font-bold h-14 rounded-2xl shadow-xl shadow-blue-500/10 border border-primary hover:bg-blue-700 transition-all active:scale-[0.98]"
            >
              Start nu gratis
            </button>
            <p className="mt-4 text-xs text-slate-400 font-medium">Binnen 2 minuten een zaak geopend</p>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-white p-8 border-t border-slate-50">
          <div className="flex flex-col gap-10 max-w-5xl mx-auto">
            <div className="flex flex-col gap-3">
              <Logo showText={true} />
              <p className="text-sm text-slate-400">Gevestigd in Amsterdam, werkzaam door heel Nederland.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="flex flex-col gap-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Platform</span>
                <div className="flex flex-col gap-2.5">
                  <Link className="text-sm text-slate-600 font-medium hover:text-primary" to="/hoe-werkt-rsolve">Hoe het werkt</Link>
                  <Link className="text-sm text-slate-600 font-medium hover:text-primary" to="/kosten">Tarieven</Link>
                  <Link className="text-sm text-slate-600 font-medium hover:text-primary" to="/veiligheid">Veiligheid</Link>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Juridisch</span>
                <div className="flex flex-col gap-2.5">
                  <Link className="text-sm text-slate-600 font-medium hover:text-primary" to="/privacy">Privacy</Link>
                  <Link className="text-sm text-slate-600 font-medium hover:text-primary" to="/terms">Voorwaarden</Link>
                  <Link className="text-sm text-slate-600 font-medium hover:text-primary" to="/contact">Contact</Link>
                </div>
              </div>
            </div>
            <div className="pt-8 border-t border-slate-50 text-center">
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">© 2024 Rsolve Mediation B.V.</p>
            </div>
          </div>
        </footer>
      </main>

      {/* Language / Menu Modal Placeholder */}
      {isLangModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
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
                  <span className="text-sm">{UI_TRANSLATIONS[langKey].label}</span>
                  {appLanguage === langKey && <ICONS.Check className="w-4 h-4 text-primary" />}
                </button>
              ))}
            </div>
            <div className="p-6 border-t border-slate-100 shrink-0">
              <Button variant="primary" className="w-full rounded-2xl" onClick={() => setIsLangModalOpen(false)}>{t('close')}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Landing;
