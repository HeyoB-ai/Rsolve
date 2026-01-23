
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
    } else {
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
        <h1 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Nieuw Conflict</h1>
        <div className="w-8" />
      </header>

      <Stepper steps={steps} currentStep={step} />

      <div className="flex-1 space-y-8 animate-in fade-in slide-in-from-bottom-4">
        {step === 0 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900">Wat is er aan de hand?</h2>
              <p className="text-sm text-slate-500 font-medium">Geef je conflict een naam en beschrijf kort wat er is gebeurd.</p>
            </div>
            <Input 
              label="Onderwerp"
              placeholder="Bijv. Te hoge heg, onbetaalde huur..." 
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})} 
            />
            <Textarea 
              label="Beschrijving"
              placeholder="Vertel wat er is voorgevallen..." 
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900">Met wie heb je ruzie?</h2>
              <p className="text-sm text-slate-500 font-medium">Vul de naam in van de persoon of het bedrijf.</p>
            </div>
            <Input 
              label="Naam tegenpartij"
              placeholder="Bijv. Buurman Jan, Verhuurder de Vries..." 
              value={formData.otherParty}
              onChange={e => setFormData({...formData, otherParty: e.target.value})}
            />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900">Wat wil je bereiken?</h2>
              <p className="text-sm text-slate-500 font-medium">Wat is voor jou een eerlijke oplossing?</p>
            </div>
            <Textarea 
              label="Jouw gewenste oplossing"
              placeholder="Bijv. De heg moet naar 2 meter, of betaling van €500,- voor de 1e van de maand." 
              value={formData.goal}
              onChange={e => setFormData({...formData, goal: e.target.value})}
            />
          </div>
        )}
      </div>

      <div className="py-6 mt-auto">
        <Button size="lg" className="w-full rounded-2xl shadow-lg" onClick={handleNext}>
          {step === steps.length - 1 ? 'Ga naar betaling' : 'Volgende'}
        </Button>
      </div>
    </div>
  );
};

export default Setup;
