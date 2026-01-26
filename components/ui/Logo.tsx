
import React, { useState } from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = "w-8 h-8", showText = false }) => {
  const [error, setError] = useState(false);

  return (
    <div className="flex items-center gap-3 group select-none">
      <div className={`relative shrink-0 ${className}`}>
        {!error ? (
          <img 
            src="/assets/rsolve-logo.png" 
            alt="Rsolve logo" 
            className="w-full h-full object-contain"
            onError={() => setError(true)}
          />
        ) : (
          <div className="w-full h-full bg-red-100 flex items-center justify-center border border-red-300 text-[8px] text-red-600 font-bold text-center p-1 rounded">
            MISSING LOGO
          </div>
        )}
      </div>
      {showText && <h2 className="text-[#1e293b] text-2xl font-black tracking-tighter">Rsolve</h2>}
    </div>
  );
};
