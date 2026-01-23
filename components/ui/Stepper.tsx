
import React from 'react';
import { ICONS } from '../../constants';

interface StepperProps {
  steps: string[];
  currentStep: number;
}

export const Stepper: React.FC<StepperProps> = ({ steps, currentStep }) => {
  return (
    <div className="flex items-center justify-between w-full relative mb-8">
      {/* Background Line */}
      <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-100 -translate-y-1/2 z-0" />
      
      {steps.map((step, idx) => {
        const isActive = idx <= currentStep;
        const isCompleted = idx < currentStep;
        
        return (
          <div key={idx} className="flex flex-col items-center gap-2 relative z-10">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors duration-300
              ${isActive ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-200 text-slate-400'}
            `}>
              {isCompleted ? <ICONS.Check className="w-4 h-4" /> : <span className="text-xs font-bold">{idx + 1}</span>}
            </div>
            <span className={`text-[10px] uppercase tracking-wider font-bold transition-colors ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>
              {step}
            </span>
          </div>
        );
      })}
    </div>
  );
};
