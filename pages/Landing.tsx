import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Logo } from '../components/ui/Logo';
import { ICONS } from '../constants';
import { LanguageSelector } from '../components/ui/LanguageSelector';

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
            <Link to="/wat-is-mediation" className="text-sm font-bold text-slate-600 hover:text-[#0b50da] transition-colors">{t('nav_what_is')}</Link>
            <button 
                onClick={handleStartProcess}
                className="text-sm font-bold text-[#0b50da] hover:underline"
            >
                {t('nav_start')}
            </button>
            <button 
              onClick={() => setIsLangModalOpen(true)}
              className="p-2 rounded-full hover:bg-slate-50 transition-colors text-slate-400 hover:text-[#0b50da]"
              title={t('settings')}
            >
              <ICONS.Globe className="w-5 h-5" />
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
                {t('tagline')} <span className="text-[#0b50da]">{t('tagline_highlight')}</span>
              </h1>
              
              <p className="text-slate-500 text-xl font-medium leading-relaxed">
                {t('sub_tagline')}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <button 
                    onClick={handleStartProcess}
                    className="bg-[#0b50da] text-white px-8 py-4 rounded-full text-lg font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95"
                >
                    {t('start_btn')}
                </button>
                <Link 
                    to="/hoe-werkt-rsolve"
                    className="px-8 py-4 rounded-full text-lg font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all text-center"
                >
                    Lees hoe het werkt
                </Link>
              </div>
            </div>
            
            {/* Right Content - 16:9 Hero Image (PNG) */}
            <div className="w-full lg:flex-1 animate-in fade-in zoom-in-95 duration-1000 delay-200">
              <div className="relative w-full aspect-video rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white ring-1 ring-slate-100 bg-slate-200">
                {!imgError ? (
                  <img 
                    src="/assets/mediation-hero.png" 
                    alt="Mediation gesprek" 
                    className="w-full h-full object-cover"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-red-50 text-red-500 p-8 text-center gap-4">
                    <span className="material-symbols-outlined text-5xl">broken_image</span>
                    <div>
                        <p className="font-bold text-lg">AFBEELDING ONTBREEKT</p>
                        <p className="text-sm font-mono mt-2 bg-white p-2 rounded border border-red-200">/public/assets/mediation-hero.png</p>
                        <p className="text-xs mt-2 text-slate-500">Plaats het bestand handmatig in de map public/assets.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </section>

        {/* Artikel Sectie */}
        <section className="bg-slate-50/50 py-24 px-6 border-y border-slate-100">
          <div className="max-w-3xl mx-auto space-y-16">
            
            {/* Header Artikel */}
            <header className="space-y-6">
              <div className="inline-flex items-center gap-2 py-1.5 px-4 bg-white border border-slate-200 rounded-full w-fit shadow-sm">
                <span className="material-symbols-outlined text-[#0b50da] text-lg">auto_stories</span>
                <span className="text-[#0b50da] font-black text-[10px] tracking-[0.25em] uppercase">Kennisbank</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-[#0f172a] tracking-tighter leading-[1.05]">
                Mediation: conflicten oplossen <span className="text-[#0b50da] italic">zonder strijd.</span>
              </h2>
            </header>

            {/* Intro */}
            <div className="prose prose-lg prose-slate max-w-none text-slate-600 font-medium leading-relaxed space-y-8">
              <p className="text-xl md:text-2xl leading-relaxed text-slate-700">
                Conflicten zijn onvermijdelijk. Op het werk, thuis, met buren of in zakelijke relaties: waar mensen samenwerken of samenleven, ontstaan soms spanningen. Toch belanden veel conflicten nog steeds snel bij advocaten of in de rechtszaal.
              </p>
              
              <div className="relative py-10 px-10 bg-white rounded-3xl border border-slate-100 shadow-xl shadow-blue-500/5 my-12">
                <div className="absolute left-0 top-10 bottom-10 w-1.5 bg-[#0b50da] rounded-r-full"></div>
                <p className="text-[#0f172a] font-black text-2xl md:text-3xl tracking-tight leading-tight italic m-0">
                  "Dat is zelden de beste oplossing."
                </p>
              </div>
              
              <p>
                Een juridische procedure kost vaak veel geld, tijd en energie. Bovendien eindigt een rechtszaak bijna altijd met een winnaar en een verliezer. De onderliggende relatie is daarna vaak beschadigd of zelfs definitief kapot. 
                <span className="block mt-4 text-[#0b50da] font-bold">Mediation biedt een ander pad.</span>
              </p>

              {/* Wat is mediation? */}
              <div className="mt-16 space-y-6">
                <h3 className="text-3xl font-black text-[#0f172a] tracking-tight">Wat is mediation?</h3>
                <p>
                  Mediation is een manier om conflicten op te lossen waarbij beide partijen, onder begeleiding van een neutrale mediator, met elkaar in gesprek gaan. Het doel is niet om te winnen, maar om samen tot afspraken te komen die voor beide acceptabel zijn.
                </p>

                <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm mt-8">
                  <p className="font-black text-slate-400 uppercase tracking-[0.2em] text-xs mb-6">Bij mediation:</p>
                  <ul className="space-y-4 list-none p-0 m-0">
                    {[
                      "behouden beide partijen controle over de uitkomst",
                      "is er ruimte voor emoties én rationele oplossingen",
                      "staat samenwerking centraal",
                      "blijven relaties vaker intact"
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-4 font-bold text-slate-800">
                        <span className="material-symbols-outlined text-[#0b50da] text-xl shrink-0">check_circle</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-6 text-sm text-slate-500 font-medium border-t border-slate-100 pt-6">
                    Het proces is doorgaans sneller en aanzienlijk goedkoper dan een juridische procedure.
                  </p>
                </div>
              </div>

              {/* Wanneer werkt mediation? */}
              <div className="mt-16 space-y-6">
                <h3 className="text-3xl font-black text-[#0f172a] tracking-tight">Wanneer werkt mediation goed?</h3>
                <p>
                  Mediation werkt vooral goed wanneer beide partijen bereid zijn om te communiceren en openstaan voor een oplossing. Dat hoeft niet te betekenen dat iedereen het meteen met elkaar eens is — juist bij stevige conflicten kan mediation verrassend effectief zijn.
                </p>
                <p className="font-bold text-slate-900">Het belangrijkste is de bereidheid om te praten.</p>
              </div>

              {/* Waarom kiezen mensen hiervoor? */}
              <div className="mt-16 space-y-6">
                <h3 className="text-3xl font-black text-[#0f172a] tracking-tight">Waarom steeds meer mensen kiezen voor mediation</h3>
                <p>Steeds meer organisaties, werkgevers en particulieren ontdekken dat mediation:</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                  {['Escalatie voorkomt', 'Stress vermindert', 'Praktische oplossingen', 'Toekomstgericht is'].map((tag, i) => (
                    <div key={i} className="bg-blue-50 text-blue-900 font-bold px-6 py-4 rounded-xl flex items-center gap-3">
                       <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                       {tag}
                    </div>
                  ))}
                </div>
                
                <p className="mt-8">
                  In plaats van terug te kijken naar wie er <span className="italic">“gelijk had”</span>, richt mediation zich op: <span className="font-bold text-[#0b50da]">hoe gaan we verder?</span>
                </p>
              </div>
            </div>

            {/* CTA in Article */}
            <div className="pt-12 text-center">
               <button 
                onClick={handleStartProcess}
                className="bg-[#0f172a] text-white px-10 py-5 rounded-full text-xl font-black hover:bg-slate-800 transition-all shadow-2xl active:scale-95"
              >
                Start direct jouw dossier
              </button>
            </div>
          </div>
        </section>

        {/* Features Grid (Korte samenvatting) */}
        <section className="bg-white py-20 px-6 border-t border-slate-100">
            <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { icon: 'translate', title: 'Meertalig', desc: 'Ieder spreekt zijn eigen taal. Onze AI vertaalt direct.' },
                    { icon: 'gavel', title: 'Rechtsgeldig', desc: 'Eindigt in een vaststellingsovereenkomst (VSO).' },
                    { icon: 'savings', title: 'Betaalbaar', desc: 'Geen dure uurtarieven. Eén vast laag bedrag.' }
                ].map((f, i) => (
                    <div key={i} className="bg-slate-50 p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4">
                        <div className="w-12 h-12 bg-white text-[#0b50da] rounded-xl flex items-center justify-center border border-slate-200">
                            <span className="material-symbols-outlined text-2xl">{f.icon}</span>
                        </div>
                        <h3 className="text-xl font-black text-slate-900">{f.title}</h3>
                        <p className="text-slate-500 font-medium">{f.desc}</p>
                    </div>
                ))}
            </div>
        </section>

      </main>

      <LanguageSelector 
        isOpen={isLangModalOpen} 
        onClose={() => setIsLangModalOpen(false)} 
        currentLang={appLanguage} 
        onSetLang={setAppLanguage}
        t={t}
      />
    </div>
  );
};

export default Landing;
