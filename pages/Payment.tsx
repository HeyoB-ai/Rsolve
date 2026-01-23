import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ICONS } from '../constants';

interface PaymentProps {
  data: any;
  onSuccess: (data: any) => void;
}

const Payment: React.FC<PaymentProps> = ({ data, onSuccess }) => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedBank, setSelectedBank] = useState('');

  const banks = ['ING', 'Rabobank', 'ABN AMRO', 'SNS', 'ASN Bank', 'RegioBank', 'Triodos Bank', 'Knab', 'Bunq', 'Revolut'];

  const handlePayment = () => {
    if (!selectedBank) return;
    
    setIsProcessing(true);
    setTimeout(() => {
      onSuccess(data);
      // BELANGRIJK: Na betaling MOET je iemand uitnodigen
      navigate('/invite-partner');
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-6 pt-12">
      <div className="w-full max-w-md space-y-6 animate-in fade-in slide-in-from-bottom-6">
        <div className="text-center">
          <div className="inline-flex w-16 h-16 bg-blue-600 rounded-[22px] items-center justify-center mb-6 shadow-xl shadow-blue-200">
            <span className="text-3xl font-black text-white italic">R</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Afrekenen</h1>
          <p className="text-sm text-slate-500 font-medium">Betaal eenmalig voor je mediation dossier</p>
        </div>

        <Card className="p-0 overflow-hidden border-none shadow-2xl rounded-[32px] bg-white">
          <div className="bg-slate-900 text-white p-8">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-lg font-black mb-1 truncate max-w-[200px]">{data?.title || 'Nieuw Dossier'}</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Full AI Mediation Access</p>
              </div>
              <div className="text-3xl font-black text-blue-400">€3,99</div>
            </div>
          </div>

          <div className="p-8 space-y-6">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Kies je bank (iDEAL)</label>
              <select 
                value={selectedBank}
                onChange={(e) => setSelectedBank(e.target.value)}
                className="w-full p-4 rounded-2xl border-2 border-slate-100 bg-slate-50 font-bold text-slate-700 focus:outline-none focus:border-blue-500 transition-all cursor-pointer"
              >
                <option value="" disabled>Selecteer je bank...</option>
                {banks.map(bank => <option key={bank} value={bank}>{bank}</option>)}
              </select>
            </div>

            <Button 
              size="lg" 
              className="w-full rounded-2xl py-6 text-xl font-black shadow-2xl shadow-blue-100" 
              onClick={handlePayment}
              disabled={!selectedBank || isProcessing}
              isLoading={isProcessing}
            >
              Betaal Nu
            </Button>

            <div className="text-center">
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Veilig betalen via Stripe</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Payment;