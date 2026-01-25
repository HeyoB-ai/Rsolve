import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Logo } from '../components/ui/Logo';

const Landing: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12 bg-white text-center overflow-hidden">
      <div className="mb-8 animate-in fade-in zoom-in duration-700">
        <Logo className="w-56 h-56 md:w-64 md:h-64" showText={true} />
      </div>
      
      <div className="animate-in slide-in-from-bottom-6 fade-in duration-700 delay-300 fill-mode-both">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4 leading-tight">
          Conflict oplossen, <br/><span className="text-blue-600 underline decoration-blue-100 underline-offset-8">zonder gedoe.</span>
        </h1>
        
        <p className="text-slate-500 text-lg mb-10 max-w-xs mx-auto font-medium">
          Bereik samen een eerlijke oplossing met hulp van AI mediation.
        </p>

        <div className="w-full max-w-xs space-y-4 mx-auto">
          <Button size="lg" className="w-full py-6 text-xl shadow-2xl shadow-blue-100" onClick={() => navigate('/payment')}>
            Start Mediation (€3,99)
          </Button>
          
          <Button 
            variant="outline" 
            size="md" 
            className="w-full border-slate-200 text-slate-600 rounded-2xl py-4 hover:bg-slate-50" 
            onClick={() => {
              const code = prompt("Voer je dossier-code in:");
              if (code) navigate(`/invite/${code}`);
            }}
          >
            Ik ben uitgenodigd
          </Button>
        </div>
      </div>

      <div className="mt-20 pt-8 border-t border-slate-50 w-full max-w-xs animate-in fade-in duration-1000 delay-700 fill-mode-both">
        <div className="flex justify-center gap-4 opacity-40 items-center">
          <span className="text-[9px] font-black text-slate-400 tracking-widest uppercase">Rechtsgeldige VSO door AI</span>
        </div>
      </div>
    </div>
  );
};

export default Landing;