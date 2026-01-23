import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';

const Landing: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12 bg-white text-center">
      <div className="w-20 h-20 bg-blue-600 rounded-[28px] flex items-center justify-center mb-10 shadow-2xl shadow-blue-100 animate-pulse-subtle">
        <span className="text-4xl font-black text-white italic">R</span>
      </div>
      
      <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4 leading-tight">
        Conflict oplossen, <br/><span className="text-blue-600 underline decoration-blue-100 underline-offset-8">zonder gedoe.</span>
      </h1>
      
      <p className="text-slate-500 text-lg mb-12 max-w-xs mx-auto font-medium">
        Bereik samen een eerlijke Vaststellingsovereenkomst (VSO) met hulp van AI mediation.
      </p>

      <div className="w-full max-w-xs space-y-4">
        <Button size="lg" className="w-full py-6 text-xl shadow-2xl shadow-blue-200" onClick={() => navigate('/setup')}>
          Start Mediation (€3,99)
        </Button>
        
        <Button 
          variant="outline" 
          size="md" 
          className="w-full border-slate-200 text-slate-600 rounded-2xl py-4" 
          onClick={() => {
            const code = prompt("Voer je dossier-code in:");
            if (code) navigate(`/invite/${code}`);
          }}
        >
          Ik ben uitgenodigd
        </Button>
      </div>

      <div className="mt-24 pt-8 border-t border-slate-50 w-full max-w-xs">
        <div className="flex justify-center gap-4 opacity-40 items-center">
          <span className="text-[9px] font-black text-slate-400 tracking-widest uppercase">Rechtsgeldige VSO door AI</span>
        </div>
      </div>
    </div>
  );
};

export default Landing;