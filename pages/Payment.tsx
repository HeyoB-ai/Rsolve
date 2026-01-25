
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Logo } from '../components/ui/Logo';
import { Input } from '../components/ui/Input';
import { ICONS } from '../constants';
import { supabase } from '../lib/supabase';

interface PaymentProps {
  onSuccess: () => void;
  t: (key: string) => string;
}

const Payment: React.FC<PaymentProps> = ({ onSuccess, t }) => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedBank, setSelectedBank] = useState('');
  
  // Promo Code States
  const [showPromoInput, setShowPromoInput] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState<string | null>(null);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);

  const banks = ['ING', 'Rabobank', 'ABN AMRO', 'SNS', 'ASN Bank', 'RegioBank', 'Triodos Bank', 'Knab', 'Bunq', 'Revolut'];

  const handlePayment = () => {
    if (!selectedBank) return;
    
    setIsProcessing(true);
    setTimeout(() => {
      onSuccess();
      navigate('/invite-partner');
    }, 2000);
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
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-6 pt-12 animate-in fade-in duration-500">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Logo className="w-20 h-20 mx-auto mb-6" />
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">{t('payment_title')}</h1>
          <p className="text-sm text-slate-500 font-medium">Betaling voor AI Mediation Dossier</p>
        </div>

        <Card className="p-0 overflow-hidden border-none shadow-2xl rounded-[32px] bg-white">
          <div className="bg-slate-900 text-white p-8">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-lg font-black mb-1 italic">Rsolve Access</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Veilige Transactie</p>
              </div>
              <div className="text-3xl font-black text-blue-400">€3,99</div>
            </div>
          </div>

          <div className="p-8 space-y-6">
            {!showPromoInput ? (
              <>
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1 text-center">Betaal via iDEAL</label>
                  <select 
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="w-full p-4 rounded-2xl border-2 border-slate-100 bg-slate-50 font-bold text-slate-700 focus:outline-none focus:border-blue-500 transition-all cursor-pointer"
                  >
                    <option value="" disabled>{t('choosing_bank')}</option>
                    {banks.map(bank => <option key={bank} value={bank}>{bank}</option>)}
                  </select>
                </div>

                <div className="space-y-4">
                  <Button 
                    size="lg" 
                    className="w-full rounded-2xl py-6 text-xl font-black shadow-lg" 
                    onClick={handlePayment}
                    disabled={!selectedBank || isProcessing}
                    isLoading={isProcessing}
                  >
                    {t('pay_btn')}
                  </Button>
                  
                  <button 
                    onClick={() => setShowPromoInput(true)}
                    className="w-full text-center text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-700 transition-colors py-2"
                  >
                    Heb je een toegangscode?
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Toegangscode Invoeren</label>
                  <button onClick={() => setShowPromoInput(false)} className="text-[10px] font-black text-red-500 uppercase tracking-widest">Annuleren</button>
                </div>
                
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input 
                      placeholder="Bijv. RS-2024-XXXX" 
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
                    OK
                  </Button>
                </div>
                <p className="text-[10px] text-slate-400 italic leading-tight">
                  Vul de code in die je hebt ontvangen van je werkgever of verzekeraar.
                </p>
              </div>
            )}

            <div className="flex items-center justify-center gap-2 pt-2 grayscale opacity-30">
               <span className="text-[10px] font-black uppercase tracking-widest">Beveiligd door Rsolve SSL</span>
            </div>
          </div>
        </Card>
        
        <button 
          onClick={() => navigate('/')}
          className="w-full text-center text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
        >
          Terug naar Home
        </button>
      </div>

      {isProcessing && (
        <div className="fixed inset-0 bg-white/95 z-50 flex flex-col items-center justify-center">
           <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
           <p className="font-black text-slate-900 uppercase tracking-widest text-center">
             {showPromoInput ? 'Code valideren...' : 'Betaling valideren...'}
           </p>
        </div>
      )}
    </div>
  );
};

export default Payment;
