
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ICONS } from '../constants';
import { Badge } from '../components/ui/Badge';

interface PaymentProps {
  data: any;
  onSuccess: (data: any) => void;
}

const Payment: React.FC<PaymentProps> = ({ data, onSuccess }) => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'ideal' | 'card'>('ideal');
  const [selectedBank, setSelectedBank] = useState('');
  const [showBankError, setShowBankError] = useState(false);

  const banks = [
    'ING', 'Rabobank', 'ABN AMRO', 'SNS Bank', 'ASN Bank', 'RegioBank', 'Triodos Bank', 'Knab', 'Bunq', 'Revolut'
  ];

  // Zorg dat de view naar boven springt bij laden
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handlePayment = () => {
    if (selectedMethod === 'ideal' && !selectedBank) {
      setShowBankError(true);
      // Scroll naar bankselectie als deze gemist is
      document.getElementById('bank-select')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    
    setIsProcessing(true);
    setTimeout(() => {
      onSuccess(data);
      navigate('/mediation');
    }, 2800);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-4 md:p-8">
      <div className="w-full max-w-md space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-500">
        <header className="text-center py-4">
          <div className="inline-flex w-14 h-14 bg-blue-600 rounded-[20px] items-center justify-center mb-4 shadow-xl shadow-blue-200">
            <span className="text-3xl font-black text-white italic">R</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Veilig Afrekenen</h1>
          <p className="text-sm text-slate-500 font-medium">Eénmalige betaling voor volledige toegang</p>
        </header>

        <Card className="p-0 overflow-hidden border-none shadow-2xl rounded-[32px] bg-white">
          {/* Order Summary Section */}
          <div className="bg-slate-900 text-white p-8 relative overflow-hidden">
             <div className="absolute -top-4 -right-4 opacity-10 rotate-12">
                <ICONS.Credits className="w-32 h-32" />
             </div>
            <div className="flex justify-between items-start mb-8 relative z-10">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">Overzicht</span>
              <div className="flex items-center gap-1 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/20 backdrop-blur-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">Beveiligd</span>
              </div>
            </div>
            <div className="flex justify-between items-end relative z-10">
              <div>
                <h2 className="text-xl font-black mb-1 truncate max-w-[200px]">{data?.title || 'Nieuw Dossier'}</h2>
                <p className="text-xs text-slate-400 font-medium">Full AI Mediation Service</p>
              </div>
              <div className="text-4xl font-black tracking-tighter text-blue-400">€3,99</div>
            </div>
          </div>

          <div className="p-8 space-y-8 bg-white">
            {/* Payment Selector */}
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Betaalmethode</label>
              
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setSelectedMethod('ideal')}
                  className={`relative flex flex-col items-center justify-center p-6 rounded-3xl border-2 transition-all gap-3 ${selectedMethod === 'ideal' ? 'border-blue-500 bg-blue-50' : 'border-slate-100 hover:border-slate-200 bg-slate-50/50'}`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${selectedMethod === 'ideal' ? 'bg-pink-600' : 'bg-slate-200'}`}>
                    <span className="text-[10px] font-black text-white italic">iDEAL</span>
                  </div>
                  <span className={`text-xs font-black uppercase tracking-widest ${selectedMethod === 'ideal' ? 'text-blue-600' : 'text-slate-400'}`}>iDEAL</span>
                  {selectedMethod === 'ideal' && <div className="absolute -top-2 -right-2 bg-blue-500 rounded-full p-1 shadow-lg border-2 border-white"><ICONS.Check className="w-3 h-3 text-white" /></div>}
                </button>

                <button 
                  onClick={() => setSelectedMethod('card')}
                  className={`relative flex flex-col items-center justify-center p-6 rounded-3xl border-2 transition-all gap-3 ${selectedMethod === 'card' ? 'border-blue-500 bg-blue-50' : 'border-slate-100 hover:border-slate-200 bg-slate-50/50'}`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${selectedMethod === 'card' ? 'bg-slate-900' : 'bg-slate-200'}`}>
                    <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/></svg>
                  </div>
                  <span className={`text-xs font-black uppercase tracking-widest ${selectedMethod === 'card' ? 'text-blue-600' : 'text-slate-400'}`}>Kaart</span>
                  {selectedMethod === 'card' && <div className="absolute -top-2 -right-2 bg-blue-500 rounded-full p-1 shadow-lg border-2 border-white"><ICONS.Check className="w-3 h-3 text-white" /></div>}
                </button>
              </div>

              {/* Specific Inputs */}
              <div className="pt-2" id="bank-select">
                {selectedMethod === 'ideal' ? (
                  <div className="animate-in slide-in-from-top-2 duration-300">
                    <select 
                      value={selectedBank}
                      onChange={(e) => {
                        setSelectedBank(e.target.value);
                        setShowBankError(false);
                      }}
                      className={`w-full p-4 rounded-2xl border-2 appearance-none bg-white font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all cursor-pointer ${showBankError ? 'border-red-500 bg-red-50 ring-4 ring-red-100' : 'border-slate-200 hover:border-blue-300'}`}
                    >
                      <option value="" disabled>Selecteer je bank...</option>
                      {banks.map(bank => (
                        <option key={bank} value={bank}>{bank}</option>
                      ))}
                    </select>
                    {showBankError && <p className="text-red-500 text-[10px] font-black mt-3 ml-1 uppercase tracking-widest animate-pulse">Selecteer een bank om door te gaan</p>}
                  </div>
                ) : (
                  <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
                     <div className="p-5 rounded-2xl border-2 border-slate-100 bg-slate-50 flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Kaartgegevens</label>
                          <div className="flex items-center justify-between text-slate-400">
                             <span className="text-sm font-mono tracking-[0.2em]">•••• •••• •••• ••••</span>
                             <div className="flex gap-2">
                                <div className="w-6 h-4 bg-slate-200 rounded-sm"></div>
                                <div className="w-6 h-4 bg-slate-200 rounded-sm"></div>
                             </div>
                          </div>
                        </div>
                        <div className="flex gap-6 pt-3 border-t border-slate-200">
                           <div className="flex-1 text-[10px] text-slate-400 font-bold uppercase tracking-widest">VERVALDATUM</div>
                           <div className="w-12 text-[10px] text-slate-400 font-bold uppercase tracking-widest text-right">CVC</div>
                        </div>
                     </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Section */}
            <div className="space-y-6">
              <Button 
                size="lg" 
                className={`w-full rounded-3xl py-6 text-xl font-black shadow-2xl transition-all ${selectedMethod === 'ideal' && !selectedBank ? 'bg-slate-200 text-slate-400 shadow-none' : 'bg-blue-600 shadow-blue-200 hover:bg-blue-700'}`} 
                onClick={handlePayment}
                isLoading={isProcessing}
              >
                {isProcessing ? 'Verwerken...' : 
                 selectedMethod === 'ideal' && selectedBank ? `Betaal met ${selectedBank}` : 
                 selectedMethod === 'card' ? 'Betaal €3,99' : 'Nu Afrekenen €3,99'}
              </Button>

              <div className="flex flex-col items-center gap-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-3 opacity-30 grayscale">
                    <span className="text-[9px] font-black uppercase tracking-widest italic">Stripe Secure</span>
                    <div className="w-1 h-1 rounded-full bg-slate-400" />
                    <span className="text-[9px] font-black uppercase tracking-widest italic">PCI DSS</span>
                  </div>
                  <button 
                    onClick={() => navigate('/')} 
                    className="text-[10px] font-black text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-[0.2em]"
                  >
                    Terug naar startpagina
                  </button>
              </div>
            </div>
          </div>
        </Card>
        
        <p className="text-center text-[9px] text-slate-400 font-medium">
          Rsolve B.V. • Beveiligde transactie via Stripe Connect
        </p>
      </div>

      {/* Real-time Processing Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-[100] flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
          <div className="bg-white rounded-[40px] p-12 max-w-sm w-full shadow-2xl space-y-8 animate-in zoom-in-95">
            <div className="w-24 h-24 relative mx-auto">
              <div className="absolute inset-0 border-8 border-slate-50 rounded-full"></div>
              <div className="absolute inset-0 border-8 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900">Verwerken...</h2>
              <p className="text-slate-500 font-medium text-sm leading-relaxed">
                We openen de beveiligde bankomgeving. Sluit dit venster niet.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payment;
