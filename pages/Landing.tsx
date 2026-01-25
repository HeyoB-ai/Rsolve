
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Logo } from '../components/ui/Logo';
import { ICONS, UI_TRANSLATIONS } from '../constants';

interface LandingProps {
  appLanguage: string;
  setAppLanguage: (lang: string) => void;
  t: (key: string) => string;
}

const Landing: React.FC<LandingProps> = ({ appLanguage, setAppLanguage, t }) => {
  const navigate = useNavigate();
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12 bg-white text-center overflow-hidden relative">
      {/* Language Selector Button - Top Right */}
      <button 
        onClick={() => setIsLangModalOpen(true)}
        className="absolute top-6 right-6 p-3 bg-slate-50 rounded-2xl text-slate-600 border border-slate-100 active:scale-95 transition-all shadow-sm z-50 flex items-center gap-2"
      >
        <ICONS.Globe className="w-6 h-6" />
        <span className="text-[10px] font-black uppercase tracking-widest">{UI_TRANSLATIONS[appLanguage].label}</span>
      </button>

      {/* Language Selection Modal */}
      {isLangModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">{t('settings')}</h2>
              <button onClick={() => setIsLangModalOpen(false)} className="p-2 text-slate-400"><ICONS.X /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 gap-2">
              {Object.keys(UI_TRANSLATIONS).map(langKey => (
                <button 
                  key={langKey}
                  onClick={() => { setAppLanguage(langKey); setIsLangModalOpen(false); }}
                  className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${appLanguage === langKey ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold shadow-sm' : 'border-slate-100 text-slate-600 hover:bg-slate-50'}`}
                >
                  <span className="text-sm">{UI_TRANSLATIONS[langKey].label}</span>
                  {appLanguage === langKey && <ICONS.Check className="w-4 h-4 text-blue-600" />}
                </button>
              ))}
            </div>
            <div className="p-6 border-t border-slate-100 shrink-0">
              <Button variant="primary" className="w-full rounded-2xl" onClick={() => setIsLangModalOpen(false)}>{t('close')}</Button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8 animate-in fade-in zoom-in duration-700">
        <Logo className="w-56 h-56 md:w-64 md:h-64" showText={true} />
      </div>
      
      <div className="animate-in slide-in-from-bottom-6 fade-in duration-700 delay-300 fill-mode-both w-full max-w-sm">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4 leading-tight">
          {t('tagline')} <br/><span className="text-blue-600 underline decoration-blue-100 underline-offset-8">{t('tagline_highlight')}</span>
        </h1>
        
        <p className="text-slate-500 text-lg mb-10 max-w-xs mx-auto font-medium">
          {t('sub_tagline')}
        </p>

        <div className="w-full space-y-4 mx-auto">
          <Button size="lg" className="w-full py-6 text-xl shadow-2xl shadow-blue-100" onClick={() => navigate('/payment')}>
            {t('start_btn')}
          </Button>
          
          <Button 
            variant="outline" 
            size="md" 
            className="w-full border-slate-200 text-slate-600 rounded-2xl py-4 hover:bg-slate-50" 
            onClick={() => {
              const code = prompt("Voer je dossier-code in:");
              if (code) navigate(`/invite/${code}`);
            }}
          >
            {t('invited_btn')}
          </Button>
        </div>
      </div>

      <div className="mt-20 pt-8 border-t border-slate-50 w-full max-w-xs animate-in fade-in duration-1000 delay-700 fill-mode-both">
        <div className="flex justify-center gap-4 opacity-40 items-center">
          <span className="text-[9px] font-black text-slate-400 tracking-widest uppercase">{t('legal_vso')}</span>
        </div>
      </div>
    </div>
  );
};

export default Landing;
