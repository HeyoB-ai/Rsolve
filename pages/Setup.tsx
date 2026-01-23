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
      const dataToSave = { ...formData, id: Math.random().toString(36).substr(2, 9) };
      onComplete(dataToSave);
      // Na setup gaan we direct naar de uitnodigingspagina
      navigate('/invite-partner');
    }
  };

  return (
    <div className="min-h-screen bg-white p-6 flex flex-col">
      <header className="mb-8 flex items-center justify-between">
        <button onClick={() => navigate('/')} className="p-2 -ml-2 text-slate-400">
           <ICONS.X />
        </button>
        <h1 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Dossier Gegevens</h1>
        <div className="w-8" />
      </header>

      <Stepper steps={steps} currentStep={step} />

      <div className="flex-1 space-y-8 max-w-md mx-auto w-full">
        {step === 0 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Wat is er aan de hand?</h2>
              <p className="text-sm text-slate-500 font-medium">Geef het conflict een duidelijke naam.</p>
            </div>
            <Input 
              label="Onderwerp van het geschil"
              placeholder="Bijv. Schade aan auto" 
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})} 
            />
            <Textarea 
              label="Korte beschrijving"
              placeholder="Wat is de aanleiding?" 
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Tegen wie richt je je?</h2>
              <p className="text-sm text-slate-500 font-medium">De persoon of het bedrijf met wie je het wilt oplossen.</p>
            </div>
            <Input 
              label="Naam tegenpartij"
              placeholder="Voor- en achternaam" 
              value={formData.otherParty}
              onChange={e => setFormData({...formData, otherParty: e.target.value})}
            />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Jouw ideale oplossing?</h2>
              <p className="text-sm text-slate-500 font-medium">Wanneer ben je tevreden?</p>
            </div>
            <Textarea 
              label="Gewenste uitkomst"
              placeholder="Bijv. Volledige vergoeding van de reparatiekosten." 
              value={formData.goal}
              onChange={e => setFormData({...formData, goal: e.target.value})}
            />
          </div>
        )}
      </div>

      <div className="py-6 mt-auto max-w-md mx-auto w-full">
        <Button size="lg" className="w-full rounded-2xl shadow-xl py-5" onClick={handleNext}>
          {step === steps.length - 1 ? 'Dossier Opslaan' : 'Volgende stap'}
        </Button>
      </div>
    </div>
  );
};

export default Setup;