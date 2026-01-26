
import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = "w-8 h-8", showText = false }) => {
  return (
    <div className="flex items-center gap-3 group select-none">
      <div className={`text-primary shrink-0 transition-transform duration-500 group-hover:rotate-12 ${className}`}>
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" />
          <line x1="12" y1="6" x2="12" y2="18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </div>
      {showText && <h2 className="text-primary text-2xl font-black tracking-tighter">Rsolve</h2>}
    </div>
  );
};
