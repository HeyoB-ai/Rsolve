
import React, { useState } from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = "w-8 h-8", showText = false }) => {
  const [imgError, setImgError] = useState(false);
  const logoUrl = "https://replicate.delivery/yhqm/b3a4a904-7a91-4e78-8386-89689e9f90f2/out-0.png";

  return (
    <div className="flex items-center gap-3 group select-none">
      <div className={`shrink-0 transition-all duration-500 group-hover:scale-110 relative ${className}`}>
        {!imgError ? (
          <img 
            src={logoUrl} 
            alt="Rsolve Logo" 
            className="w-full h-full object-contain rounded-full shadow-sm"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#0b50da] via-[#ff9a5c] to-[#0b50da] flex items-center justify-center shadow-inner">
            <div className="w-1/2 h-1/2 border-2 border-white/50 rounded-full" />
          </div>
        )}
      </div>
      {showText && <h2 className="text-[#1e293b] text-2xl font-black tracking-tighter">Rsolve</h2>}
    </div>
  );
};
