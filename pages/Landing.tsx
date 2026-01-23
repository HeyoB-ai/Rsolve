
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';

const Landing: React.FC = () => {
  const navigate = useNavigate();

  const startFlow = () => navigate('/setup');

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
        <Button size="lg" className="w-full py-6 text-xl shadow-2xl shadow-blue-200" onClick={startFlow}>
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

        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] pt-6">
          Veilig afrekenen via
        </p>
        
        <div className="flex justify-center items-center gap-3 pt-2">
           <button 
             onClick={startFlow}
             className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 flex items-center gap-2 hover:bg-slate-100 transition-colors cursor-pointer"
           >
              <div className="w-4 h-4 bg-[#ff0066] rounded-sm flex items-center justify-center text-[6px] text-white font-black italic">i</div>
              <span className="text-[10px] font-black text-slate-400">iDEAL</span>
           </button>
           <button 
             onClick={startFlow}
             className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 flex items-center gap-2 hover:bg-slate-100 transition-colors cursor-pointer"
           >
              <div className="w-4 h-4 bg-slate-900 rounded-sm flex items-center justify-center text-[6px] text-white font-black italic">S</div>
              <span className="text-[10px] font-black text-slate-400">STRIPE</span>
           </button>
        </div>
      </div>

      <div className="mt-16 pt-8 border-t border-slate-50 w-full max-w-xs">
        <div className="flex justify-center gap-4 opacity-40 items-center">
          <span className="text-[9px] font-black text-slate-400 tracking-widest uppercase">Rechtsgeldige VSO</span>
        </div>
      </div>
    </div>
  );
};

export default Landing;
