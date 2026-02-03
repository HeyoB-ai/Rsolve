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

  const FeatureItem = ({ icon: Icon, text }: { icon: any, text: string }) => (
    <div className="flex items-center gap-3">
      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
        <Icon className="w-3.5 h-3.5 text-blue-600" />
      </div>
      <span className="text-slate-700 font-medium">{text}</span>
    </div>
  );

  const langPills = [
    { code: 'nl', label: '🇳🇱 Nederlands' },
    { code: 'en', label: '🇬🇧 English' },
    { code: 'tr', label: '🇹🇷 Türkçe' },
    { code: 'pl', label: '🇵🇱 Polski' },
    { code: 'ar', label: '🇸🇦 العربية' },
    { code: 'es', label: '🇪🇸 Español' }
  ];

  return (
    <div className="bg-white text-[#1e293b] font-display antialiased min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center bg-white/95 backdrop-blur-md px-6 py-4 md:px-8 md:py-5 justify-between max-w-[1440px] mx-auto w-full border-b border-slate-50">
        <Logo showText={true} className="w-10 h-10" />
        
        <div className="flex items-center gap-4">
            <button 
                onClick={handleStartProcess}
                className="hidden md:block text-sm font-bold text-[#0b50da] hover:underline"
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
              
              <div className="flex flex-col gap-3">
                <button 
                    onClick={handleStartProcess}
                    className="w-full sm:w-auto bg-[#0b50da] text-white px-8 py-4 rounded-full text-lg font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95"
                >
                    {t('start_btn')}
                </button>
                <div className="flex items-center gap-2 text-slate-400 text-xs font-bold pl-2">
                   <ICONS.Clock className="w-4 h-4" />
                   <span>{t('micro_time')}</span>
                </div>
              </div>
            </div>
            
            {/* Right Content - Hero Image */}
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
                  <div className="w-full h-full flex flex-col items-center justify-center bg-blue-50 p-8 text-center gap-4">
                     <div className="bg-white p-4 rounded-full shadow-sm">
                       <ICONS.Handshake className="w-12 h-12 text-blue-500" />
                     </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </section>

        {/* Not Winning Section */}
        <section className="bg-slate-50 py-20 px-6">
           <div className="max-w-3xl mx-auto text-center space-y-6">
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">{t('section_not_winning_title')}</h2>
              <p className="text-lg text-slate-600 leading-relaxed font-medium">
                {t('section_not_winning_text')}
              </p>
           </div>
        </section>

        {/* What is Rsolve / Benefits Grid */}
        <section className="py-24 px-6 max-w-[1440px] mx-auto">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                 <div className="inline-flex items-center gap-2 py-1 px-3 bg-blue-50 border border-blue-100 rounded-full w-fit">
                    <span className="text-[#0b50da] font-black text-[10px] tracking-[0.2em] uppercase">{t('mediation_badge')}</span>
                 </div>
                 <h2 className="text-4xl font-black text-slate-900 tracking-tight">{t('what_is_title')}</h2>
                 <p className="text-lg text-slate-600 leading-relaxed">{t('what_is_p1')}</p>
                 
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                    <FeatureItem icon={ICONS.Shield} text={t('what_is_list_1')} />
                    <FeatureItem icon={ICONS.Zap} text={t('what_is_list_2')} />
                    <FeatureItem icon={ICONS.Check} text={t('what_is_list_3')} />
                    <FeatureItem icon={ICONS.File} text={t('what_is_list_4')} />
                 </div>
              </div>
              
              <div className="bg-slate-900 text-white p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full blur-[100px] opacity-50 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                 <h3 className="text-2xl font-black mb-8 relative z-10">{t('why_title')}</h3>
                 <div className="space-y-4 relative z-10">
                    {[t('why_1'), t('why_2'), t('why_3'), t('why_4'), t('why_5'), t('why_6')].map((item, i) => (
                      <div key={i} className="flex items-center gap-4 p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                         <div className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                         <span className="font-bold">{item}</span>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        </section>

        {/* Language Section */}
        <section className="bg-blue-600 text-white py-24 px-6 overflow-hidden relative">
           <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(circle at center, white 1px, transparent 1px)', backgroundSize: '24px 24px'}}></div>
           <div className="max-w-4xl mx-auto text-center relative z-10 space-y-8">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center mx-auto mb-6">
                 <ICONS.Translate className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight">{t('language_title')}</h2>
              <p className="text-xl text-blue-100 font-medium leading-relaxed max-w-2xl mx-auto">
                 {t('language_text')}
              </p>
              
              <div className="flex flex-wrap justify-center gap-3 pt-8 opacity-60">
                 {langPills.map(lang => (
                    <button 
                      key={lang.code} 
                      onClick={() => setAppLanguage(lang.code)}
                      className={`px-4 py-2 rounded-full text-sm font-bold backdrop-blur-sm transition-all hover:bg-white/20 active:scale-95 ${appLanguage === lang.code ? 'bg-white text-blue-600' : 'bg-white/10 text-white'}`}
                    >
                      {lang.label}
                    </button>
                 ))}
                 <button onClick={() => setIsLangModalOpen(true)} className="px-4 py-2 bg-white/10 rounded-full text-sm font-bold backdrop-blur-sm hover:bg-white/20 transition-all">{t('plus_more')}</button>
              </div>
           </div>
        </section>

        {/* When it works */}
        <section className="py-24 px-6 bg-white">
           <div className="max-w-3xl mx-auto text-center space-y-12">
              <div className="space-y-4">
                <h2 className="text-3xl font-black text-slate-900">{t('when_title')}</h2>
                <p className="text-lg text-slate-600">{t('when_text')}</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 {[
                   {icon: 'work', label: t('when_work')},
                   {icon: 'handshake', label: t('when_business')},
                   {icon: 'home', label: t('when_neighbors')},
                   {icon: 'favorite', label: t('when_relations')}
                 ].map((item, i) => (
                    <div key={i} className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center gap-3">
                       <span className="material-symbols-outlined text-3xl text-slate-400">{item.icon}</span>
                       <span className="font-bold text-slate-700">{item.label}</span>
                    </div>
                 ))}
              </div>
           </div>
        </section>

        {/* How it works */}
        <section className="py-24 px-6 bg-slate-900 text-white">
           <div className="max-w-[1440px] mx-auto">
              <h2 className="text-3xl font-black mb-16 text-center">{t('how_title')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                 {[t('how_step_1'), t('how_step_2'), t('how_step_3'), t('how_step_4')].map((step, i) => (
                    <div key={i} className="relative">
                       <div className="text-6xl font-black text-slate-800 absolute -top-8 -left-4 select-none z-0">{i + 1}</div>
                       <div className="relative z-10 bg-slate-800/50 p-6 rounded-2xl border border-slate-700 backdrop-blur-sm">
                          <h3 className="text-xl font-bold mb-2">{step}</h3>
                          <div className="w-12 h-1 bg-blue-500 rounded-full"></div>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </section>

        {/* FAQ */}
        <section className="py-24 px-6 bg-white">
           <div className="max-w-2xl mx-auto space-y-12">
              <h2 className="text-3xl font-black text-center text-slate-900">{t('faq_title')}</h2>
              <div className="space-y-6">
                 {[1, 2, 3, 4].map(n => (
                    <div key={n} className="border-b border-slate-100 pb-6">
                       <h3 className="text-lg font-black text-slate-900 mb-2">{t(`faq_${n}_q` as any)}</h3>
                       <p className="text-slate-600 font-medium">{t(`faq_${n}_a` as any)}</p>
                    </div>
                 ))}
              </div>
           </div>
        </section>

        {/* CTA Footer */}
        <section className="bg-slate-50 py-24 px-6 border-t border-slate-200">
           <div className="max-w-3xl mx-auto text-center space-y-8">
              <h2 className="text-4xl font-black text-slate-900 tracking-tight">{t('footer_payoff')}</h2>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">{t('footer_expats')}</p>
              <button 
                onClick={handleStartProcess}
                className="bg-[#0b50da] text-white px-12 py-5 rounded-full text-xl font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95"
              >
                {t('start_btn')}
              </button>
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