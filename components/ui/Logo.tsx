
import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = "w-8 h-8", showText = false }) => {
  return (
    <div className="flex items-center gap-3 group select-none">
      <div className={`relative shrink-0 ${className}`}>
        <img 
          src="/assets/rsolve-logo.png" 
          alt="Rsolve logo" 
          className="w-full h-full object-contain"
        />
      </div>
      {showText && <h2 className="text-[#1e293b] text-2xl font-black tracking-tighter">Rsolve</h2>}
    </div>
  );
};
