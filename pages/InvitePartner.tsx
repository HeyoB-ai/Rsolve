import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { ICONS } from '../constants';

interface InvitePartnerProps {
  onComplete: (data: any) => void;
}

const InvitePartner: React.FC<InvitePartnerProps> = ({ onComplete }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    otherParty: ''
  });
  const [showInvite, setShowInvite] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);

  const inviteLink = `${window.location.origin}/#/invite/${btoa(formData.title || "dossier").substring(0, 8)}`;

  const handleSetupComplete = () => {
    if (!formData.title || !formData.otherParty) return;
    setShowInvite(true);
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(`Hoi! Ik heb een dossier aangemaakt bij Rsolve om ons conflict "${formData.title}" op te lossen. Jouw deelname is gratis en helpt ons om snel een rechtsgeldige overeenkomst (VSO) op te stellen. Doe je mee? Klik hier: ${inviteLink}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleStartMediation = () => {
    const dataToSave = { ...formData, id: Math.random().toString(36).substr(2, 9), isRespondent: false };
    onComplete(dataToSave);
    navigate('/mediation');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        {!showInvite ? (
          <div className="space-y-8 text-center">
            <div className="inline-flex w-20 h-20 bg-emerald-500 rounded-[32px] items-center justify-center shadow-lg mb-2">
               <ICONS.Check className="w-10 h-10 text-white" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Betaling Ontvangen!</h1>
              <p className="text-slate-500 font-medium">Laten we het dossier kort omschrijven.</p>
            </div>

            <Card className="p-8 space-y-6 bg-white border-none shadow-2xl rounded-[32px]">
              <Input 
                label="Onderwerp van het conflict"
                placeholder="Bijv. Terugbetaling lening"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
              <Input 
                label="Naam van de tegenpartij"
                placeholder="Wie wil je uitnodigen?"
                value={formData.otherParty}
                onChange={e => setFormData({...formData, otherParty: e.target.value})}
              />
              <Button 
                size="lg" 
                className="w-full rounded-2xl py-5 shadow-lg" 
                onClick={handleSetupComplete}
                disabled={!formData.title || !formData.otherParty}
              >
                Opslaan & Uitnodiging Maken
              </Button>
            </Card>
          </div>
        ) : (
          <div className="space-y-8 text-center animate-in fade-in duration-500">
            <div className="space-y-4">
              <img 
                src="/logo.png" 
                alt="Rsolve" 
                className="w-24 h-24 mx-auto mb-2"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.dataset.tried) {
                    target.dataset.tried = 'true';
                    target.src = 'https://raw.githubusercontent.com/stackblitz/stackblitz-images/main/rsolve-logo.png';
                  }
                }}
              />
              <h1 className="text-3xl font-black tracking-tight text-slate-900 leading-tight">Nodig {formData.otherParty} uit</h1>
              <p className="text-slate-500 font-medium px-4">Deel deze link via WhatsApp. Pas na het uitnodigen start het gesprek met de mediator.</p>
            </div>

            <Card className="p-8 space-y-6 bg-white border-none shadow-2xl rounded-[32px]">
               <div className="space-y-4">
                  <Button 
                    onClick={shareWhatsApp}
                    className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white py-6 rounded-2xl font-black flex items-center justify-center gap-4 transition-all shadow-lg active:scale-95"
                  >
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.631 1.433h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    WhatsApp Uitnodiging
                  </Button>

                  <button 
                    onClick={copyInviteLink}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between hover:bg-white transition-colors"
                  >
                    <code className="text-[10px] text-slate-400 font-mono truncate mr-2">{inviteLink}</code>
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 shrink-0">
                      {hasCopied ? 'Gekopieerd' : 'Kopieer'}
                    </span>
                  </button>
               </div>
            </Card>

            <Button 
              variant="primary" 
              size="lg" 
              className="w-full rounded-2xl py-5 shadow-lg"
              onClick={handleStartMediation}
            >
              Start Mediation Gesprek
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvitePartner;