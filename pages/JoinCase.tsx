
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

const JoinCase: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isJoining, setIsJoining] = useState(false);

  const handleJoin = () => {
    setIsJoining(true);
    setTimeout(() => {
      const demoCase = {
        title: "Conflict over " + (id ? atob(id).substring(0, 15) : "Dossier"),
        otherParty: "Initiator",
        isRespondent: true
      };
      localStorage.setItem('rsolve_active_case', JSON.stringify(demoCase));
      navigate('/mediation');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8 text-center">
        <img 
          src="logo.png" 
          alt="Rsolve" 
          className="w-24 h-24 mx-auto mb-4 drop-shadow-2xl animate-pulse-subtle"
          onError={(e) => e.currentTarget.src = 'https://raw.githubusercontent.com/stackblitz/stackblitz-images/main/rsolve-logo.png'}
        />
        
        <div className="space-y-4">
          <h1 className="text-3xl font-black text-slate-900 leading-tight">Je bent uitgenodigd voor Mediation</h1>
          <p className="text-slate-500 font-medium px-4">
            Iemand wil een conflict met je oplossen via Rsolve. Dit is een gratis, veilige omgeving om samen tot een Vaststellingsovereenkomst (VSO) te komen.
          </p>
        </div>

        <Card className="p-8 space-y-6 bg-white border-none shadow-2xl rounded-[32px]">
          <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
             <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Dossier ID</p>
             <code className="text-sm font-mono text-slate-600">{id}</code>
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
             Geen kosten voor genodigden
          </p>
        </Card>

        <button 
          onClick={() => navigate('/')}
          className="text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest"
        >
          Wat is Rsolve?
        </button>
      </div>
    </div>
  );
};

export default JoinCase;
