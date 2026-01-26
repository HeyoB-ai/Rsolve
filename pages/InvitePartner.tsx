
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { ICONS } from '../constants';
import { Logo } from '../components/ui/Logo';
import { supabase } from '../lib/supabase';

interface InvitePartnerProps {
  onComplete: (data: any) => void;
  t: (key: string, params?: any) => string;
}

const InvitePartner: React.FC<InvitePartnerProps> = ({ onComplete, t }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    yourName: '', // Nieuw veld
    otherParty: ''
  });
  const [caseId, setCaseId] = useState<string | null>(null);
  const [showInvite, setShowInvite] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const inviteLink = `${window.location.origin}/#/invite/${caseId}`;

  const handleSetupComplete = async () => {
    if (!formData.title || !formData.otherParty || !formData.yourName) return;
    
    setIsSaving(true);
    const newId = Math.random().toString(36).substr(2, 9);
    
    // Opslaan in Supabase
    const { error } = await supabase.from('cases').insert([{
      id: newId,
      title: formData.title,
      initiator_name: formData.yourName, // Sla eigen naam op
      other_party: formData.otherParty,
      initiator_id: 'local-user', 
      respondent_joined: false
    }]);

    if (!error) {
      // Welkomstbericht van de Mediator - Nu meer procesgericht
      const welcomeMsg = `Welkom ${formData.yourName}. Ik ben de AI Mediator van Rsolve. 

Mijn rol is om als onafhankelijke en neutrale partij jullie te helpen bij het vinden van een eerlijke oplossing voor het conflict: "${formData.title}".

We volgen een vaste procedure:
1. Ik vraag eerst u (de initiator) om een toelichting op de situatie.
2. Daarna vraag ik de tegenpartij (${formData.otherParty}) om zijn of haar kant van het verhaal.
3. Vervolgens zoeken we samen naar afspraken waar beiden achter staan.

${formData.yourName}, kunt u beginnen met een toelichting op wat er precies is gebeurd?`;

      await supabase.from('messages').insert([{
        case_id: newId,
        sender_id: 'mediator',
        sender_name: 'Mediator',
        content: welcomeMsg,
        type: 'text'
      }]);

      setCaseId(newId);
      setShowInvite(true);
    } else {
      alert("Er ging iets mis bij het aanmaken van het dossier.");
    }
    setIsSaving(false);
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  const handleStartMediation = () => {
    const dataToSave = { 
      id: caseId,
      title: formData.title,
      initiatorName: formData.yourName, // Geef naam door aan de app state
      otherParty: formData.otherParty,
      isRespondent: false 
    };
    onComplete(dataToSave);
    navigate('/mediation');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
      <div className="w-full max-w-md space-y-8">
        {!showInvite ? (
          <div className="space-y-8 text-center">
            <div className="inline-flex w-20 h-20 bg-emerald-500 rounded-[32px] items-center justify-center shadow-lg">
               <ICONS.Check className="w-10 h-10 text-white" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Betaling Ontvangen!</h1>
              <p className="text-slate-500 font-medium">Laten we het dossier opstarten.</p>
            </div>

            <Card className="p-8 space-y-6 bg-white border-none shadow-2xl rounded-[32px]">
              <Input 
                label="Jouw naam"
                placeholder="Bijv. Mark de Vries"
                value={formData.yourName}
                onChange={e => setFormData({...formData, yourName: e.target.value})}
              />
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
                disabled={!formData.title || !formData.otherParty || !formData.yourName || isSaving}
                isLoading={isSaving}
              >
                Opslaan & Uitnodiging Maken
              </Button>
            </Card>
          </div>
        ) : (
          <div className="space-y-8 text-center animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-4">
              <Logo className="w-20 h-20 mx-auto mb-2" />
              <h1 className="text-3xl font-black tracking-tight text-slate-900 leading-tight">Nodig {formData.otherParty} uit</h1>
              <p className="text-slate-500 font-medium px-4">Deel deze link via WhatsApp om het proces officieel te starten.</p>
            </div>

            <Card className="p-8 space-y-6 bg-white border-none shadow-2xl rounded-[32px]">
               <div className="space-y-4">
                  <Button 
                    onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Hallo, om ons conflict "${formData.title}" op te lossen heb ik een online mediator van Rsolve ingeschakeld. Hij helpt ons via een beveiligde chat om tot een eerlijke oplossing te komen zonder advocaten. Deelname is gratis voor jou. Klik hier: ${inviteLink}`)}`, '_blank')}
                    className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white py-6 rounded-2xl font-black flex items-center justify-center gap-4 transition-all shadow-lg"
                  >
                    WhatsApp Uitnodiging
                  </Button>

                  <button 
                    onClick={copyInviteLink}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between"
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
