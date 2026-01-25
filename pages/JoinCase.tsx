
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Logo } from '../components/ui/Logo';
import { supabase } from '../lib/supabase';

interface JoinCaseProps {
  t: (key: string, params?: any) => string;
  onJoin: (data: any) => void;
}

const JoinCase: React.FC<JoinCaseProps> = ({ t, onJoin }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isJoining, setIsJoining] = useState(false);
  const [caseInfo, setCaseInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

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
        setError("Dossier niet gevonden. Controleer de link.");
      }
    };
    fetchCase();
  }, [id]);

  const handleJoin = async () => {
    if (!caseInfo || !id) return;
    setIsJoining(true);
    
    try {
      // Update de case in Supabase
      await supabase
        .from('cases')
        .update({ respondent_joined: true })
        .eq('id', id);

      // Systeembericht toevoegen
      await supabase.from('messages').insert([{
        case_id: id,
        sender_id: 'system',
        sender_name: 'Systeem',
        content: `${caseInfo.other_party} is deel gaan nemen aan het gesprek.`,
        type: 'system'
      }]);

      const activeCaseData = {
        id: id,
        title: caseInfo.title, // Dossiernaam van de case uit de DB
        otherParty: "Initiator",
        respondentName: caseInfo.other_party, // Jouw naam zoals opgegeven door initiator
        isRespondent: true
      };

      // Werk de state in App.tsx direct bij via de prop
      onJoin(activeCaseData);
      
      // Navigeer naar mediation
      navigate('/mediation');
    } catch (err) {
      console.error("Error joining case:", err);
      setError("Er ging iets mis bij het deelnemen. Probeer het opnieuw.");
    } finally {
      setIsJoining(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
        </div>
        <h1 className="text-xl font-black text-slate-900 mb-2 uppercase">{error}</h1>
        <Button onClick={() => navigate('/')} variant="outline" className="mt-4">Terug naar home</Button>
      </div>
    );
  }

  if (!caseInfo) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="font-black text-slate-400 uppercase tracking-widest animate-pulse">Dossier laden...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
      <div className="w-full max-w-md space-y-8 text-center">
        <Logo className="w-24 h-24 mx-auto mb-4" />
        
        <div className="space-y-4">
          <h1 className="text-3xl font-black text-slate-900 leading-tight">Je bent uitgenodigd</h1>
          <p className="text-slate-500 font-medium px-4">
            Iemand wil een conflict met je oplossen via Rsolve: <br/>
            <span className="text-blue-600 font-bold italic">"{caseInfo.title}"</span>
          </p>
        </div>

        <Card className="p-8 space-y-6 bg-white border-none shadow-2xl rounded-[32px]">
          <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
             <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Veilige Omgeving</p>
             <p className="text-xs text-slate-600 leading-relaxed font-medium">
               Deelname is volledig gratis voor genodigden. We werken samen aan een eerlijke oplossing.
             </p>
          </div>

          <Button 
            size="lg" 
            className="w-full py-6 text-xl rounded-2xl shadow-xl shadow-blue-100" 
            onClick={handleJoin}
            isLoading={isJoining}
          >
            Deelnemen aan gesprek
          </Button>

          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
             Geen account of betaling nodig
          </p>
        </Card>
      </div>
    </div>
  );
};

export default JoinCase;
