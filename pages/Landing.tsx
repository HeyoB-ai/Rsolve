
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Logo } from '../components/ui/Logo';
import { Input } from '../components/ui/Input';
import { ICONS, UI_TRANSLATIONS } from '../constants';
import { supabase } from '../lib/supabase';

interface LandingProps {
  appLanguage: string;
  setAppLanguage: (lang: string) => void;
  t: (key: string) => string;
  setHasPaid: (val: boolean) => void;
}

const Landing: React.FC<LandingProps> = ({ appLanguage, setAppLanguage, t, setHasPaid }) => {
  const navigate = useNavigate();
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);

  const handleVerifyPromoCode = async () => {
    if (!promoCode.trim()) return;
    setIsVerifying(true);
    setPromoError(null);

    try {
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', promoCode.trim().toUpperCase())
        .eq('is_used', false)
        .single();

      if (error || !data) {
        setPromoError("Ongeldige of reeds gebruikte code.");
        setIsVerifying(false);
        return;
      }

      await supabase
        .from('promo_codes')
        .update({ is_used: true, used_at: new Date().toISOString() })
        .eq('code', data.code);

      // Succes! Update state en navigeer
      setHasPaid(true);
      localStorage.setItem('rsolve_has_paid', 'true');
      navigate('/invite-partner');
    } catch (err) {
      setPromoError("Fout bij valideren.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-8 bg-white text-center overflow-y-auto relative">
      {/* Language Selector Button - Top Right */}
      <button 
        onClick={() => setIsLangModalOpen(true)}
        className="absolute top-6 right-6 p-3 bg-slate-50 rounded-2xl text-slate-600 border border-slate-100 active:scale-95 transition-all shadow-sm z-50 flex items-center gap-2"
      >
        <ICONS.Globe className="w-5 h-5" />
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

      {/* Promo Code Modal */}
      {isPromoModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[32px] shadow-2xl overflow-hidden flex flex-col p-8 gap-6">
            <div className="text-center space-y-2">
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Voer Toegangscode in</h2>
              <p className="text-xs text-slate-500 font-medium italic">Heb je een code via je werkgever of verzekeraar?</p>
            </div>
            
            <div className="space-y-4">
              <Input 
                placeholder="BIJV. RS-2024-XXXX" 
                className="rounded-2xl border-2 uppercase font-mono tracking-wider text-center" 
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                error={promoError || undefined}
                autoFocus
              />
              <Button 
                size="lg"
                className="w-full rounded-2xl py-4 shadow-xl" 
                onClick={handleVerifyPromoCode}
                isLoading={isVerifying}
                disabled={!promoCode.trim()}
              >
                Valideer Code
              </Button>
              <button 
                onClick={() => setIsPromoModalOpen(false)}
                className="w-full text-center text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-red-500 transition-colors py-2"
              >
                Annuleren
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-4 animate-in fade-in zoom-in duration-700">
        <Logo className="w-48 h-48 md:w-56 md:h-56" showText={true} />
      </div>
      
      <div className="animate-in slide-in-from-bottom-6 fade-in duration-700 delay-300 fill-mode-both w-full max-w-sm">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2 leading-tight">
          {t('tagline')} <br/><span className="text-blue-600 underline decoration-blue-100 underline-offset-8">{t('tagline_highlight')}</span>
        </h1>
        
        <p className="text-slate-500 text-base mb-8 max-w-[280px] mx-auto font-medium">
          {t('sub_tagline')}
        </p>

        <div className="w-full space-y-3 mx-auto flex flex-col items-center">
          <Button size="lg" className="w-full py-5 text-xl shadow-xl shadow-blue-100/50" onClick={() => navigate('/payment')}>
            {t('start_btn')}
          </Button>
          
          <Button 
            variant="outline" 
            size="md" 
            className="w-full border-slate-200 text-slate-600 rounded-2xl py-4 hover:bg-slate-50" 
            onClick={() => {
              const code = prompt("Voer je dossier-code in (bijv: a1b2c3d4e):");
              if (code && code.trim()) navigate(`/invite/${code.trim()}`);
            }}
          >
            {t('invited_btn')}
          </Button>

          <button 
            onClick={() => setIsPromoModalOpen(true)}
            className="w-full text-center text-[11px] font-black text-blue-600 uppercase tracking-[0.15em] hover:text-blue-800 transition-all py-3 active:scale-95"
          >
            Ik heb een toegangscode
          </button>
        </div>
      </div>

      <div className="mt-12 pt-6 border-t border-slate-50 w-full max-w-xs animate-in fade-in duration-1000 delay-700 fill-mode-both">
        <div className="flex justify-center gap-4 opacity-40 items-center">
          <span className="text-[9px] font-black text-slate-400 tracking-widest uppercase">{t('legal_vso')}</span>
        </div>
      </div>
    </div>
  );
};

export default Landing;
