
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
  const [imgError, setImgError] = useState(false);

  const handleStartProcess = () => {
    navigate('/payment');
  };

  return (
    <div className="bg-white text-[#1e293b] font-display antialiased min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center bg-white/95 backdrop-blur-md px-6 py-4 md:px-8 md:py-5 justify-between max-w-[1440px] mx-auto w-full border-b border-slate-50">
        <Logo showText={true} className="w-10 h-10" />
        
        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-8">
            <Link to="/wat-is-mediation" className="text-sm font-bold text-slate-600 hover:text-[#0b50da] transition-colors">Wat is mediation?</Link>
            <button 
                onClick={handleStartProcess}
                className="text-sm font-bold text-[#0b50da] hover:underline"
            >
                Start mediation
            </button>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-4">
          <button 
            onClick={() => setIsLangModalOpen(true)}
            className="p-1 text-slate-400 hover:text-[#0b50da] transition-colors"
          >
            <span className="material-symbols-outlined text-3xl">menu</span>
          </button>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative px-6 py-12 md:py-24 max-w-[1440px] mx-auto">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            
            {/* Left Content */}
            <div className="flex flex-col gap-8 text-left lg:max-w-xl animate-in fade-in slide-in-from-left-8 duration-700">
              <h1 className="text-[#0f172a] text-5xl md:text-7xl font-extrabold leading-[1.1] tracking-tighter">
                Conflicten oplossen <span className="text-[#0b50da]">zonder strijd.</span>
              </h1>
              
              <p className="text-slate-500 text-xl font-medium leading-relaxed">
                AI-gestuurde mediation in (bijna) elke taal. Tweetalig waar nodig.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <button 
                    onClick={handleStartProcess}
                    className="bg-[#0b50da] text-white px-8 py-4 rounded-full text-lg font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95"
                >
                    Start mediation
                </button>
                <Link 
                    to="/hoe-werkt-rsolve"
                    className="px-8 py-4 rounded-full text-lg font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all text-center"
                >
                    Lees hoe het werkt
                </Link>
              </div>
            </div>
            
            {/* Right Content - 16:9 Hero Image */}
            <div className="w-full lg:flex-1 animate-in fade-in zoom-in-95 duration-1000 delay-200">
              <div className="relative w-full aspect-video rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white ring-1 ring-slate-100 bg-slate-200">
                {!imgError ? (
                  <img 
                    src="/assets/mediation-hero.png" 
                    alt="Mediation gesprek in een rustige omgeving" 
                    className="w-full h-full object-cover"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-red-50 text-red-500 p-8 text-center gap-4">
                    <span className="material-symbols-outlined text-5xl">broken_image</span>
                    <div>
                        <p className="font-bold text-lg">AFBEELDING ONTBREEKT</p>
                        <p className="text-sm font-mono mt-2 bg-white p-2 rounded border border-red-200">/public/assets/mediation-hero.png</p>
                        <p className="text-xs mt-2 text-slate-500">Plaats het bestand in de map om dit op te lossen.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </section>

        {/* Features Grid (Korte samenvatting) */}
        <section className="bg-slate-50 py-20 px-6 border-t border-slate-100">
            <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { icon: 'translate', title: 'Meertalig', desc: 'Ieder spreekt zijn eigen taal. Onze AI vertaalt direct.' },
                    { icon: 'gavel', title: 'Rechtsgeldig', desc: 'Eindigt in een vaststellingsovereenkomst (VSO).' },
                    { icon: 'savings', title: 'Betaalbaar', desc: 'Geen dure uurtarieven. Eén vast laag bedrag.' }
                ].map((f, i) => (
                    <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4">
                        <div className="w-12 h-12 bg-blue-50 text-[#0b50da] rounded-xl flex items-center justify-center">
                            <span className="material-symbols-outlined text-2xl">{f.icon}</span>
                        </div>
                        <h3 className="text-xl font-black text-slate-900">{f.title}</h3>
                        <p className="text-slate-500 font-medium">{f.desc}</p>
                    </div>
                ))}
            </div>
        </section>

      </main>

      {/* Settings Modal (voor taal) */}
      {isLangModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-md">
          <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl p-8 space-y-6 border-none animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center">
              <h2 className="text-[12px] font-black uppercase tracking-[0.4em] text-slate-400">{t('settings')}</h2>
              <button onClick={() => setIsLangModalOpen(false)} className="p-2 text-slate-300 hover:text-[#0b50da]"><ICONS.X /></button>
            </div>
            <div className="space-y-3">
              {Object.keys(UI_TRANSLATIONS).map(langKey => (
                <button 
                  key={langKey}
                  onClick={() => { setAppLanguage(langKey); setIsLangModalOpen(false); }}
                  className={`w-full p-4 rounded-xl border-2 text-left font-black flex items-center justify-between transition-all ${appLanguage === langKey ? 'border-[#0b50da] bg-blue-50 text-[#0b50da]' : 'border-slate-50 text-slate-400 hover:bg-slate-50'}`}
                >
                  {UI_TRANSLATIONS[langKey].label}
                  {appLanguage === langKey && <ICONS.Check className="w-5 h-5" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Landing;
