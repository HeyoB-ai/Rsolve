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

// Geheim per-partij token: identificeert deze partij later server-side bij een export.
const genToken = () => {
  try { return (crypto as any).randomUUID().replace(/-/g, ''); }
  catch { return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2) + Date.now().toString(36); }
};

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
      // Alleen de velden die de uitnodigingspagina nodig heeft — nooit de geheime tokens.
      const { data, error } = await supabase
        .from('cases')
        .select('id, title, initiator_name, other_party, respondent_joined, created_at')
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
      const token = genToken();
      await supabase
        .from('cases')
        .update({ respondent_joined: true, respondent_token: token })
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
        isRespondent: true,
        token: token
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
    <div className="rsolve-dark min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 animate-in fade-in duration-500 relative">
      <button
        onClick={() => setIsLangModalOpen(true)}
        className="absolute top-6 right-6 p-2 bg-slate-900 border border-slate-800 rounded-full text-slate-400 hover:text-cyan-400"
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
                className={`px-3 py-1.5 rounded-full text-sm font-bold border transition-all ${appLanguage === code ? 'bg-cyan-500 text-slate-950 border-cyan-500' : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-cyan-400'}`}
              >
                <span className="mr-1">{flag}</span>{UI_TRANSLATIONS[code]?.label || code}
              </button>
            ))}
            <button
              onClick={() => setIsLangModalOpen(true)}
              className="px-3 py-1.5 rounded-full text-sm font-bold text-cyan-400 hover:bg-slate-800 border border-transparent"
            >
              + {t('plus_more')}
            </button>
          </div>
        </div>

        <Logo className="w-24 h-24 mx-auto mb-4" />
        
        <div className="space-y-4">
          <h1 className="text-3xl font-black text-white leading-tight">{t('invited_header')}</h1>
          <p className="text-slate-400 font-medium px-4">
            <span className="font-black text-white">{caseInfo.initiator_name}</span> wil een conflict met je oplossen via Rsolve: <br/>
            <span className="text-cyan-400 font-bold italic">"{caseInfo.title}"</span>
          </p>
        </div>

        <Card className="p-8 space-y-6 shadow-2xl rounded-[32px]">
          <Button
            size="lg"
            className="w-full py-6 text-xl rounded-2xl shadow-xl"
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
