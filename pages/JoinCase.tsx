
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
        setError("Dossier niet gevonden.");
      }
    };
    fetchCase();
  }, [id]);

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
      setError("Er ging iets mis.");
    } finally {
      setIsJoining(false);
    }
  };

  if (error) return <div className="p-6 text-center">{error}</div>;

  if (!caseInfo) return <div className="p-6 text-center animate-pulse uppercase tracking-widest font-black">Laden...</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
      <div className="w-full max-w-md space-y-8 text-center">
        <Logo className="w-24 h-24 mx-auto mb-4" />
        
        <div className="space-y-4">
          <h1 className="text-3xl font-black text-slate-900 leading-tight">Je bent uitgenodigd</h1>
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
            Deelnemen aan gesprek
          </Button>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
             Gratis deelname voor genodigden
          </p>
        </Card>
      </div>
    </div>
  );
};

export default JoinCase;
