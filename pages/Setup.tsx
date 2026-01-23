
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input, Textarea } from '../components/ui/Input';
import { Stepper } from '../components/ui/Stepper';
import { ICONS } from '../constants';

const Setup: React.FC<{ onComplete: (data: any) => void }> = ({ onComplete }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    otherParty: '',
    goal: ''
  });

  const steps = ['Situatie', 'Partijen', 'Doel'];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
      window.scrollTo(0, 0);
    } else {
      // Sla op in localStorage voor robuustheid bij redirects
      localStorage.setItem('rsolve_pending_case', JSON.stringify(formData));
      onComplete(formData);
      navigate('/payment');
    }
  };

  return (
    <div className="min-h-screen bg-white p-6 flex flex-col">
      <header className="mb-8 flex items-center justify-between">
        <button onClick={() => navigate('/')} className="p-2 -ml-2 text-slate-400">
           <ICONS.X />
        </button>
        <h1 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Nieuw Dossier</h1>
        <div className="w-8" />
      </header>

      <Stepper steps={steps} currentStep={step} />

      <div className="flex-1 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {step === 0 && (
          <div className="space-y-6">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Wat is er gebeurd?</h2>
              <p className="text-sm text-slate-500 font-medium">Geef je dossier een naam en omschrijf het conflict.</p>
            </div>
            <Input 
              label="Onderwerp"
              placeholder="Bijv. Schade aan schutting" 
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})} 
            />
            <Textarea 
              label="Beschrijving"
              placeholder="Wat is de aanleiding van dit conflict?" 
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Met wie heb je ruzie?</h2>
              <p className="text-sm text-slate-500 font-medium">Vul de naam in van de persoon of het bedrijf.</p>
            </div>
            <Input 
              label="Naam tegenpartij"
              placeholder="Bijv. Buurman Jan" 
              value={formData.otherParty}
              onChange={e => setFormData({...formData, otherParty: e.target.value})}
            />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">De oplossing</h2>
              <p className="text-sm text-slate-500 font-medium">Wat moet er gebeuren om dit op te lossen?</p>
            </div>
            <Textarea 
              label="Jouw voorstel"
              placeholder="Bijv. Reparatie van de schutting voor 1 mei." 
              value={formData.goal}
              onChange={e => setFormData({...formData, goal: e.target.value})}
            />
          </div>
        )}
      </div>

      <div className="py-6 mt-auto">
        <Button size="lg" className="w-full rounded-2xl shadow-xl py-5" onClick={handleNext}>
          {step === steps.length - 1 ? 'Naar betaling (€3,99)' : 'Volgende stap'}
        </Button>
      </div>
    </div>
  );
};

export default Setup;
