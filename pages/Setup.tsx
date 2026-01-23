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
      // Sla op in state en localStorage
      const dataToSave = { ...formData, id: Math.random().toString(36).substr(2, 9) };
      localStorage.setItem('rsolve_pending_case', JSON.stringify(dataToSave));
      onComplete(dataToSave);
      // Navigeer direct naar de betaalpagina
      navigate('/payment');
    }
  };

  return (
    <div className="min-h-screen bg-white p-6 flex flex-col">
      <header className="mb-8 flex items-center justify-between">
        <button onClick={() => navigate('/')} className="p-2 -ml-2 text-slate-400">
           <ICONS.X />
        </button>
        <h1 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Dossier Opstarten</h1>
        <div className="w-8" />
      </header>

      <Stepper steps={steps} currentStep={step} />

      <div className="flex-1 space-y-8">
        {step === 0 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Wat is de situatie?</h2>
              <p className="text-sm text-slate-500 font-medium">Omschrijf kort waar het conflict over gaat.</p>
            </div>
            <Input 
              label="Onderwerp"
              placeholder="Bijv. Terugbetaling lening" 
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})} 
            />
            <Textarea 
              label="Beschrijving"
              placeholder="Wat is er gebeurd?" 
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Wie is de tegenpartij?</h2>
              <p className="text-sm text-slate-500 font-medium">Met wie wil je dit conflict oplossen?</p>
            </div>
            <Input 
              label="Naam tegenpartij"
              placeholder="Naam van persoon of bedrijf" 
              value={formData.otherParty}
              onChange={e => setFormData({...formData, otherParty: e.target.value})}
            />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Wat is het doel?</h2>
              <p className="text-sm text-slate-500 font-medium">Wanneer is het voor jou opgelost?</p>
            </div>
            <Textarea 
              label="Gewenste oplossing"
              placeholder="Bijv. Ik wil 500 euro terug voor 1 mei." 
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