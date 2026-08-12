import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Logo } from '../components/ui/Logo';
import { supabase } from '../lib/supabase';
import { LanguageSelector } from '../components/ui/LanguageSelector';
import { ICONS, UI_TRANSLATIONS } from '../constants';

const QUICK_LANGS: { code: string; flag: string }[] = [
  { code: 'nl', flag: '🇳🇱' },
  { code: 'en', flag: '🇬🇧' },
  { code: 'tr', flag: '🇹🇷' },
  { code: 'ar', flag: '🇸🇦' },
  { code: 'pl', flag: '🇵🇱' },
  { code: 'es', flag: '🇪🇸' },
];

interface JoinCaseProps {
  t: (key: string, params?: any) => string;
  onJoin: (data: any) => void;
  appLanguage: string;
  setAppLanguage: (lang: string) => void;
}

const JoinCase: React.FC<JoinCaseProps> = ({ t, onJoin, appLanguage, setAppLanguage }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isJoining, setIsJoining] = useState(false);
  const [caseInfo, setCaseInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);

  useEffect(() => {
    const fetchCase = async () => {
      if (!id) return;
      const { data, error } = await supabase
        .from('cases')
        .select('*')
        .eq('id', id)
        .single();
      
      if (data) {
        setCaseInfo(data);
      } else {
        setError(t('dossier_not_found'));
      }
    };
    fetchCase();
  }, [id, t]);

  const handleJoin = async () => {
    if (!caseInfo || !id) return;
    setIsJoining(true);
    
    try {
      await supabase
        .from('cases')
        .update({ respondent_joined: true })
        .eq('id', id);

      await supabase.from('messages').insert([{
        case_id: id,
        sender_id: 'system',
        sender_name: 'Systeem',
        content: `${caseInfo.other_party} is deel gaan nemen aan het gesprek.`,
        type: 'system'
      }]);

      const activeCaseData = {
        id: id,
        title: caseInfo.title,
        initiatorName: caseInfo.initiator_name, // Neem de naam van de initiator over
        otherParty: caseInfo.initiator_name || "Initiator",
        respondentName: caseInfo.other_party,
        isRespondent: true
      };

      onJoin(activeCaseData);
      navigate('/mediation');
    } catch (err) {
      console.error("Error joining case:", err);
      setError(t('error_generic'));
    } finally {
      setIsJoining(false);
    }
  };

  if (error) return <div className="p-6 text-center">{error}</div>;

  if (!caseInfo) return <div className="p-6 text-center animate-pulse uppercase tracking-widest font-black">{t('loading')}</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 animate-in fade-in duration-500 relative">
      <button 
        onClick={() => setIsLangModalOpen(true)}
        className="absolute top-6 right-6 p-2 bg-white rounded-full shadow-sm text-slate-400 hover:text-[#0b50da]"
      >
        <ICONS.Globe className="w-5 h-5" />
      </button>

      <div className="w-full max-w-md space-y-8 text-center">
        {/* Taalkeuze bij binnenkomst — ieder leest en schrijft in de eigen taal */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 text-slate-400">
            <ICONS.Globe className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Kies je taal · Choose language</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {QUICK_LANGS.map(({ code, flag }) => (
              <button
                key={code}
                onClick={() => setAppLanguage(code)}
                className={`px-3 py-1.5 rounded-full text-sm font-bold border transition-all ${appLanguage === code ? 'bg-[#0b50da] text-white border-[#0b50da]' : 'bg-white text-slate-500 border-slate-200 hover:border-[#0b50da]'}`}
              >
                <span className="mr-1">{flag}</span>{UI_TRANSLATIONS[code]?.label || code}
              </button>
            ))}
            <button
              onClick={() => setIsLangModalOpen(true)}
              className="px-3 py-1.5 rounded-full text-sm font-bold text-[#0b50da] hover:bg-blue-50 border border-transparent"
            >
              + {t('plus_more')}
            </button>
          </div>
        </div>

        <Logo className="w-24 h-24 mx-auto mb-4" />
        
        <div className="space-y-4">
          <h1 className="text-3xl font-black text-slate-900 leading-tight">{t('invited_header')}</h1>
          <p className="text-slate-500 font-medium px-4">
            <span className="font-black text-slate-900">{caseInfo.initiator_name}</span> wil een conflict met je oplossen via Rsolve: <br/>
            <span className="text-blue-600 font-bold italic">"{caseInfo.title}"</span>
          </p>
        </div>

        <Card className="p-8 space-y-6 bg-white border-none shadow-2xl rounded-[32px]">
          <Button 
            size="lg" 
            className="w-full py-6 text-xl rounded-2xl shadow-xl shadow-blue-100" 
            onClick={handleJoin}
            isLoading={isJoining}
          >
            {t('join_btn')}
          </Button>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
             {t('join_free_notice')}
          </p>
        </Card>
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

export default JoinCase;
