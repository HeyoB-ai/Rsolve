import React from 'react';
import { ICONS, UI_TRANSLATIONS } from '../../constants';

interface LanguageSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: string;
  onSetLang: (lang: string) => void;
  t: (key: string) => string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ isOpen, onClose, currentLang, onSetLang, t }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl p-8 space-y-6 border-none animate-in zoom-in-95 duration-300">
        <div className="flex justify-between items-center">
          <h2 className="text-[12px] font-black uppercase tracking-[0.4em] text-slate-400">{t('settings')}</h2>
          <button onClick={onClose} className="p-2 text-slate-300 hover:text-[#0b50da]"><ICONS.X /></button>
        </div>
        <div className="space-y-3">
          {Object.keys(UI_TRANSLATIONS).map(langKey => (
            <button 
              key={langKey}
              onClick={() => { onSetLang(langKey); onClose(); }}
              className={`w-full p-4 rounded-xl border-2 text-left font-black flex items-center justify-between transition-all ${currentLang === langKey ? 'border-[#0b50da] bg-blue-50 text-[#0b50da]' : 'border-slate-50 text-slate-400 hover:bg-slate-50'}`}
            >
              <div className="flex items-center gap-3">
                 <span className="text-xl leading-none">{langKey === 'nl' ? '🇳🇱' : langKey === 'en' ? '🇬🇧' : langKey === 'tr' ? '🇹🇷' : '🇸🇦'}</span>
                 <span>{UI_TRANSLATIONS[langKey].label}</span>
              </div>
              {currentLang === langKey && <ICONS.Check className="w-5 h-5" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
