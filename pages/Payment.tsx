import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Logo } from '../components/ui/Logo';
import { Input } from '../components/ui/Input';
import { ICONS } from '../constants';
import { supabase } from '../lib/supabase';
import { LanguageSelector } from '../components/ui/LanguageSelector';
import { track } from '../lib/analytics';

interface PaymentProps {
  onSuccess: () => void;
  t: (key: string) => string;
  appLanguage: string;
  setAppLanguage: (lang: string) => void;
}

const Payment: React.FC<PaymentProps> = ({ onSuccess, t, appLanguage, setAppLanguage }) => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [searchParams] = useSearchParams();

  // Promo Code States
  const [showPromoInput, setShowPromoInput] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState<string | null>(null);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);

  // Terugkeer van Stripe Checkout: controleer server-side of er echt betaald is
  // voordat we toegang verlenen (niet manipuleerbaar in de browser).
  useEffect(() => {
    if (searchParams.get('canceled')) {
      localStorage.removeItem('rsolve_pending_order');
      setStatusMsg('Betaling geannuleerd. Je kunt het opnieuw proberen.');
      return;
    }
    if (!searchParams.get('paid')) return;
    const orderId = localStorage.getItem('rsolve_pending_order');
    if (!orderId) return;

    setIsProcessing(true);
    let tries = 0;
    const check = async () => {
      tries++;
      try {
        const res = await fetch('/.netlify/functions/payment-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId }),
        });
        const data = await res.json();
        if (data?.paid) {
          localStorage.removeItem('rsolve_pending_order');
          track('Betaling gelukt', { methode: 'stripe' });
          onSuccess();
          navigate('/invite-partner');
          return;
        }
      } catch { /* opnieuw proberen */ }
      if (tries < 10) {
        setTimeout(check, 1500);
      } else {
        setIsProcessing(false);
        setStatusMsg('We konden de betaling nog niet bevestigen. Ververs de pagina of probeer het opnieuw.');
      }
    };
    check();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePayment = async () => {
    setIsProcessing(true);
    setStatusMsg(null);
    try {
      const res = await fetch('/.netlify/functions/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ origin: window.location.origin }),
      });
      const data = await res.json();
      if (data?.url && data?.orderId) {
        localStorage.setItem('rsolve_pending_order', data.orderId);
        track('Betaling gestart');
        window.location.href = data.url; // door naar Stripe Checkout
      } else {
        throw new Error('geen checkout-url');
      }
    } catch (e) {
      console.error('Checkout starten mislukt', e);
      setIsProcessing(false);
      setStatusMsg('Kon de betaling niet starten. Probeer het later opnieuw.');
    }
  };

  const handleVerifyPromoCode = async () => {
    if (!promoCode.trim()) return;
    
    setIsVerifyingCode(true);
    setPromoError(null);

    try {
      // We checken in de 'promo_codes' tabel of de code bestaat en niet gebruikt is
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', promoCode.trim().toUpperCase())
        .eq('is_used', false)
        .single();

      if (error || !data) {
        setPromoError("Ongeldige of reeds gebruikte code.");
        setIsVerifyingCode(false);
        return;
      }

      // Code is geldig! Markeer als gebruikt
      await supabase
        .from('promo_codes')
        .update({ is_used: true, used_at: new Date().toISOString() })
        .eq('code', data.code);

      setIsProcessing(true);
      track('Toegang via code');
      setTimeout(() => {
        onSuccess();
        navigate('/invite-partner');
      }, 1000);

    } catch (err) {
      setPromoError("Fout bij valideren. Probeer het later opnieuw.");
    } finally {
      setIsVerifyingCode(false);
    }
  };

  return (
    <div className="rsolve-dark min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center p-6 pt-12 animate-in fade-in duration-500 relative">
      <button
        onClick={() => setIsLangModalOpen(true)}
        className="absolute top-6 right-6 p-2 bg-slate-900 border border-slate-800 rounded-full text-slate-400 hover:text-cyan-400"
      >
        <ICONS.Globe className="w-5 h-5" />
      </button>

      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Logo className="w-20 h-20 mx-auto mb-6" />
          <h1 className="text-2xl font-black text-white tracking-tight">{t('payment_title')}</h1>
          <p className="text-sm text-slate-400 font-medium">{t('payment_desc')}</p>
        </div>

        <Card className="p-0 overflow-hidden shadow-2xl rounded-[32px]">
          <div className="bg-slate-950 text-white p-8 border-b border-slate-800">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-lg font-black mb-1 italic">Rsolve Access</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t('secure_trans')}</p>
              </div>
              <div className="text-3xl font-black text-cyan-400">€3,99</div>
            </div>
          </div>

          <div className="p-8 space-y-6">
            {!showPromoInput ? (
              <>
                <div className="text-center space-y-1">
                  <p className="text-sm font-bold text-slate-200">Eenmalige toegang tot je dossier</p>
                  <p className="text-[11px] text-slate-400 font-medium">Je betaalt veilig via iDEAL of creditcard.</p>
                </div>

                <div className="space-y-4">
                  <Button
                    size="lg"
                    className="w-full rounded-2xl py-6 text-xl font-black shadow-lg"
                    onClick={handlePayment}
                    disabled={isProcessing}
                    isLoading={isProcessing}
                  >
                    {t('pay_btn')}
                  </Button>

                  {statusMsg && (
                    <p className="text-center text-xs font-bold text-amber-600 leading-relaxed">{statusMsg}</p>
                  )}

                  <button
                    onClick={() => setShowPromoInput(true)}
                    className="w-full text-center text-[10px] font-black text-cyan-400 uppercase tracking-widest hover:text-cyan-300 transition-colors py-2"
                  >
                    {t('have_code')}
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('enter_code')}</label>
                  <button onClick={() => setShowPromoInput(false)} className="text-[10px] font-black text-red-500 uppercase tracking-widest">{t('close')}</button>
                </div>
                
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input 
                      placeholder={t('code_placeholder')}
                      className="rounded-2xl border-2 uppercase font-mono tracking-wider" 
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      error={promoError || undefined}
                    />
                  </div>
                  <Button 
                    className="rounded-2xl px-6 h-[50px]" 
                    onClick={handleVerifyPromoCode}
                    isLoading={isVerifyingCode}
                    disabled={!promoCode.trim()}
                  >
                    {t('validate_code')}
                  </Button>
                </div>
                <p className="text-[10px] text-slate-400 italic leading-tight">
                  {t('code_instruction')}
                </p>
              </div>
            )}

            <div className="flex items-center justify-center gap-2 pt-2 grayscale opacity-30">
               <span className="text-[10px] font-black uppercase tracking-widest">{t('secure_ssl')}</span>
            </div>
          </div>
        </Card>
        
        <button 
          onClick={() => navigate('/')}
          className="w-full text-center text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
        >
          {t('back_home')}
        </button>
      </div>

      {isProcessing && (
        <div className="fixed inset-0 bg-slate-950/95 z-50 flex flex-col items-center justify-center">
           <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
           <p className="font-black text-white uppercase tracking-widest text-center">
             {showPromoInput ? t('validating') : t('validating')}
           </p>
        </div>
      )}

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

export default Payment;