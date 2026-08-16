
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { ICONS } from '../constants';
import { Logo } from '../components/ui/Logo';
import { supabase } from '../lib/supabase';
import { LanguageSelector } from '../components/ui/LanguageSelector';

// Geheim per-partij token: identificeert deze partij later server-side bij een export.
const genToken = () => {
  try { return (crypto as any).randomUUID().replace(/-/g, ''); }
  catch { return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2) + Date.now().toString(36); }
};

// Dossier-ID: cryptografisch sterke, niet-raadbare id (i.p.v. het zwakke Math.random).
const genId = () => {
  try { return (crypto as any).randomUUID().replace(/-/g, '').slice(0, 12); }
  catch { return Math.random().toString(36).slice(2, 11); }
};

interface InvitePartnerProps {
  onComplete: (data: any) => void;
  t: (key: string, params?: any) => string;
  appLanguage: string;
  setAppLanguage: (lang: string) => void;
}

const InvitePartner: React.FC<InvitePartnerProps> = ({ onComplete, t, appLanguage, setAppLanguage }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    yourName: '',
    otherParty: ''
  });
  const [caseId, setCaseId] = useState<string | null>(null);
  const [caseToken, setCaseToken] = useState<string | null>(null);
  const [showInvite, setShowInvite] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);

  const inviteLink = `${window.location.origin}/#/invite/${caseId}`;

  const handleSetupComplete = async () => {
    if (!formData.title || !formData.otherParty || !formData.yourName) return;
    
    setIsSaving(true);
    const newId = genId();
    const token = genToken();

    // Opslaan in Supabase
    const { error } = await supabase.from('cases').insert([{
      id: newId,
      title: formData.title,
      initiator_name: formData.yourName,
      other_party: formData.otherParty,
      initiator_id: 'local-user',
      respondent_joined: false,
      initiator_token: token
    }]);

    if (!error) {
      // DIT IS HET ALLEREERSTE BERICHT: Alleen welkom en privacy.
      const firstWelcome = `Welkom. Fijn dat je mee wilt werken om ons conflict over "${formData.title}" op te lossen. Ik ben een AI mediator die jullie gaat helpen een voor beiden aanvaardbare oplossing te bedenken. Ik ben volledig neutraal, ik ken veel regel- en wetgeving en weet hoe we in alle redelijkheid naar oplossingen toe kunnen werken. Dit voorkomt de inzet van dure advocaten en een eventuele rechtszaak. Als we een voor beiden aanvaardbare oplossing hebben gevonden maak ik een vaststellingsovereenkomst die ik jullie toestuur.

BELANGRIJK: Deel voor je eigen veiligheid nooit privacygevoelige gegevens zoals BSN-nummers of volledige adressen in deze chat.

Zodra jullie er allebei zijn, help ik jullie stap voor stap door het proces.`;

      await supabase.from('messages').insert([{
        case_id: newId,
        sender_id: 'mediator',
        sender_name: 'Mediator',
        content: firstWelcome,
        type: 'text'
      }]);

      setCaseId(newId);
      setCaseToken(token);
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
      initiatorName: formData.yourName,
      otherParty: formData.otherParty,
      isRespondent: false,
      token: caseToken
    };
    onComplete(dataToSave);
    navigate('/mediation');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 animate-in fade-in duration-500 relative">
      <button 
        onClick={() => setIsLangModalOpen(true)}
        className="absolute top-6 right-6 p-2 bg-white rounded-full shadow-sm text-slate-400 hover:text-[#0b50da]"
      >
        <ICONS.Globe className="w-5 h-5" />
      </button>

      <div className="w-full max-w-md space-y-8">
        {!showInvite ? (
          <div className="space-y-8 text-center">
            <div className="inline-flex w-20 h-20 bg-emerald-500 rounded-[32px] items-center justify-center shadow-lg">
               <ICONS.Check className="w-10 h-10 text-white" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">{t('payment_received')}</h1>
              <p className="text-slate-500 font-medium">{t('lets_start')}</p>
            </div>

            <Card className="p-8 space-y-6 bg-white border-none shadow-2xl rounded-[32px]">
              <Input 
                label={t('label_your_name')}
                placeholder={t('placeholder_name')}
                value={formData.yourName}
                onChange={e => setFormData({...formData, yourName: e.target.value})}
              />
              <Input 
                label={t('label_subject')}
                placeholder={t('placeholder_subject')}
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
              <Input 
                label={t('label_counterparty')}
                placeholder={t('placeholder_invite')}
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
                {t('btn_save_invite')}
              </Button>
            </Card>
          </div>
        ) : (
          <div className="space-y-8 text-center animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-4">
              <Logo className="w-20 h-20 mx-auto mb-2" />
              <h1 className="text-3xl font-black tracking-tight text-slate-900 leading-tight">{t('invite_header', {name: formData.otherParty})}</h1>
              <p className="text-slate-500 font-medium px-4">{t('invite_desc')}</p>
            </div>

            <Card className="p-8 space-y-6 bg-white border-none shadow-2xl rounded-[32px]">
               <div className="space-y-4">
                  <Button 
                    onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Goedendag, om ons conflict "${formData.title}" op te lossen heb ik een online mediator van Rsolve ingeschakeld. Hij helpt ons via een beveiligde chat om tot een eerlijke oplossing te komen zonder advocaten. Deelname is gratis voor jou. Klik hier: ${inviteLink}`)}`, '_blank')}
                    className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white py-6 rounded-2xl font-black flex items-center justify-center gap-4 transition-all shadow-lg"
                  >
                    {t('whatsapp_btn')}
                  </Button>

                  <button 
                    onClick={copyInviteLink}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between"
                  >
                    <code className="text-[10px] text-slate-400 font-mono truncate mr-2">{inviteLink}</code>
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 shrink-0">
                      {hasCopied ? t('copied') : t('copy')}
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
              {t('start_mediation_btn')}
            </Button>
          </div>
        )}
      </div>

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

export default InvitePartner;
