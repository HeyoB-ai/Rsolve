
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Logo } from '../components/ui/Logo';
import { supabase } from '../lib/supabase';

interface JoinCaseProps {
  t: (key: string, params?: any) => string;
}

const JoinCase: React.FC<JoinCaseProps> = ({ t }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isJoining, setIsJoining] = useState(false);
  const [caseInfo, setCaseInfo] = useState<any>(null);

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
      }
    };
    fetchCase();
  }, [id]);

  const handleJoin = async () => {
    if (!caseInfo) return;
    setIsJoining(true);
    
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

    const activeCase = {
      id: id,
      title: caseInfo.title,
      otherParty: "Initiator",
      respondentName: caseInfo.other_party,
      isRespondent: true
    };

    localStorage.setItem('rsolve_active_case', JSON.stringify(activeCase));
    navigate('/mediation');
  };

  if (!caseInfo) return <div className="min-h-screen flex items-center justify-center">Dossier laden...</div>;

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
             Geen account nodig
          </p>
        </Card>
      </div>
    </div>
  );
};

export default JoinCase;
