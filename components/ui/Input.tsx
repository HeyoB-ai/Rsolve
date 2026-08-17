
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label className="text-sm font-semibold text-slate-300">{label}</label>}
      <input
        className={`
          w-full px-4 py-2.5 rounded-[8px] border bg-slate-800 text-slate-100 placeholder-slate-500
          transition-colors duration-200
          focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20
          ${error ? 'border-red-500 ring-red-100' : 'border-slate-700'}
          ${className}
        `}
        {...props}
      />
      {error && <span className="text-xs text-red-500 font-medium">{error}</span>}
    </div>
  );
};

export const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; error?: string }> = ({ label, error, className = '', ...props }) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label className="text-sm font-semibold text-slate-300">{label}</label>}
      <textarea
        className={`
          w-full px-4 py-2.5 rounded-[8px] border bg-slate-800 text-slate-100 placeholder-slate-500 min-h-[100px]
          transition-colors duration-200
          focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20
          ${error ? 'border-red-500 ring-red-100' : 'border-slate-700'}
          ${className}
        `}
        {...props}
      />
      {error && <span className="text-xs text-red-500 font-medium">{error}</span>}
    </div>
  );
};
