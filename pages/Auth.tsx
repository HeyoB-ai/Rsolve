
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Logo } from '../components/ui/Logo';

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 antialiased font-display">
      <div className="w-full max-w-sm space-y-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center flex flex-col items-center gap-6">
          <Logo className="w-16 h-16" />
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              {mode === 'signin' ? 'Welkom Terug' : 'Account Aanmaken'}
            </h1>
            <p className="text-slate-400 mt-2 text-sm font-medium">
              {mode === 'signin' ? 'Log in op je Rsolve mediation dossier' : 'Start met vreedzame conflictbemiddeling'}
            </p>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[3rem] shadow-2xl shadow-blue-500/5 border border-white">
          <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); navigate('/dashboard'); }}>
            <Input label="E-mailadres" type="email" placeholder="naam@email.com" required className="rounded-2xl" />
            <Input label="Wachtwoord" type="password" placeholder="••••••••" required className="rounded-2xl" />
            
            <Button size="lg" className="w-full mt-4 rounded-2xl py-6 font-black text-lg shadow-xl shadow-blue-500/10">
              {mode === 'signin' ? 'Inloggen' : 'Account Aanmaken'}
            </Button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-50"></div></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-4 text-slate-300 font-black tracking-[0.3em]">Of verder met</span></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="w-full rounded-2xl border-slate-100 font-black text-[10px] uppercase tracking-widest">Google</Button>
            <Button variant="outline" className="w-full rounded-2xl border-slate-100 font-black text-[10px] uppercase tracking-widest">Apple</Button>
          </div>
        </div>

        <div className="text-center">
          <button 
            onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
            className="text-xs font-black text-primary uppercase tracking-[0.2em] hover:text-blue-700 transition-colors"
          >
            {mode === 'signin' ? "Nieuw hier? Registreren" : "Al een account? Inloggen"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
