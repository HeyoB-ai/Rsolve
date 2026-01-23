import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Logo } from '../components/ui/Logo';

interface PaymentProps {
  onSuccess: () => void;
}

const Payment: React.FC<PaymentProps> = ({ onSuccess }) => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedBank, setSelectedBank] = useState('');

  const banks = ['ING', 'Rabobank', 'ABN AMRO', 'SNS', 'ASN Bank', 'RegioBank', 'Triodos Bank', 'Knab', 'Bunq', 'Revolut'];

  const handlePayment = () => {
    if (!selectedBank) return;
    
    setIsProcessing(true);
    setTimeout(() => {
      onSuccess();
      navigate('/invite-partner');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-6 pt-12 animate-in fade-in duration-500">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Logo className="w-20 h-20 mx-auto mb-6" />
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Eénmalige Betaling</h1>
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
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1 text-center">Betaal met iDEAL</label>
              <select 
                value={selectedBank}
                onChange={(e) => setSelectedBank(e.target.value)}
                className="w-full p-4 rounded-2xl border-2 border-slate-100 bg-slate-50 font-bold text-slate-700 focus:outline-none focus:border-blue-500 transition-all cursor-pointer"
              >
                <option value="" disabled>Kies je bank...</option>
                {banks.map(bank => <option key={bank} value={bank}>{bank}</option>)}
              </select>
            </div>

            <Button 
              size="lg" 
              className="w-full rounded-2xl py-6 text-xl font-black shadow-lg" 
              onClick={handlePayment}
              disabled={!selectedBank || isProcessing}
              isLoading={isProcessing}
            >
              Betaal €3,99
            </Button>

            <div className="flex items-center justify-center gap-2 pt-2 grayscale opacity-30">
               <span className="text-[10px] font-black uppercase tracking-widest">Beveiligd door Stripe</span>
            </div>
          </div>
        </Card>
        
        <button 
          onClick={() => navigate('/')}
          className="w-full text-center text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
        >
          Annuleren
        </button>
      </div>

      {isProcessing && (
        <div className="fixed inset-0 bg-white/95 z-50 flex flex-col items-center justify-center">
           <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
           <p className="font-black text-slate-900 uppercase tracking-widest text-center">
             Betaling valideren...
           </p>
        </div>
      )}
    </div>
  );
};

export default Payment;