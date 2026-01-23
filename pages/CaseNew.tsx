
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input, Textarea } from '../components/ui/Input';
import { Stepper } from '../components/ui/Stepper';
import { ICONS } from '../constants';

const CaseNew: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const steps = ['Parties', 'The Dispute', 'Target'];

  const handleNext = () => {
    if (step < steps.length - 1) setStep(step + 1);
    else navigate('/dashboard');
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
    else navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <header className="mb-8 flex justify-between items-center">
        <button onClick={handleBack} className="p-2 -ml-2 text-slate-400">
           <ICONS.X />
        </button>
        <h1 className="text-lg font-bold text-slate-900">New Dispute</h1>
        <div className="w-6" />
      </header>

      <Stepper steps={steps} currentStep={step} />

      <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4">
        {step === 0 && (
          <>
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900">Who is involved?</h2>
              <p className="text-sm text-slate-500">Provide the details of the party you're in dispute with.</p>
            </div>
            <Input label="Their Name / Company" placeholder="e.g. John Doe / Skyline Property Management" />
            <Input label="Their Email Address" type="email" placeholder="john@example.com" />
            <Input label="Expected Relationship" placeholder="e.g. Landlord, Client, Neighbor" />
          </>
        )}

        {step === 1 && (
          <>
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900">What happened?</h2>
              <p className="text-sm text-slate-500">Describe the situation in your own words. Our AI will help summarize it for the other party.</p>
            </div>
            <Textarea label="The Situation" placeholder="Describe the events that led to this dispute..." />
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Attachment (Optional)</p>
              <Button variant="outline" size="sm" className="w-full bg-white">
                <ICONS.Plus className="w-3 h-3 mr-2" /> Upload Photo or Doc
              </Button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900">Ideal outcome?</h2>
              <p className="text-sm text-slate-500">What do you think is a fair way to resolve this?</p>
            </div>
            <Input label="Requested Amount ($)" type="number" placeholder="0.00" />
            <Textarea label="Non-monetary Resolution" placeholder="e.g. Apology, repair of fence, or contract cancellation..." />
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl text-blue-800">
               <div className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-bold">!</span>
               </div>
               <p className="text-xs font-medium">Being realistic helps reach a resolution 3x faster.</p>
            </div>
          </>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-slate-50">
        <Button size="lg" className="w-full" onClick={handleNext}>
          {step === steps.length - 1 ? 'Start Case (1 Credit)' : 'Continue'}
        </Button>
      </div>
    </div>
  );
};

export default CaseNew;
