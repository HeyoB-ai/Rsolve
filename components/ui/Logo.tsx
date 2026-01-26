
import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

/**
 * Rsolve Official Logo: De kleurrijke, ronde identiteit.
 * We gebruiken een geoptimaliseerde versie die de geüploade afbeelding reflecteert.
 */
export const Logo: React.FC<LogoProps> = ({ className = "w-8 h-8", showText = false }) => {
  // De URL naar het door de gebruiker geüploade kleurrijke logo
  const logoUrl = "https://replicate.delivery/yhqm/b3a4a904-7a91-4e78-8386-89689e9f90f2/out-0.png";

  return (
    <div className="flex items-center gap-3 group select-none">
      <div className={`shrink-0 transition-all duration-500 group-hover:scale-110 ${className}`}>
        <img 
          src={logoUrl} 
          alt="Rsolve Logo" 
          className="w-full h-full object-contain rounded-full shadow-sm"
          onError={(e) => {
            // Fallback naar een gestileerde versie als de specifieke URL niet laadt
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
          }}
        />
        {/* Fallback SVG in geval van laadfout */}
        <svg className="hidden" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="9" stroke="#0b50da" strokeWidth="2.8" />
          <line x1="12" y1="7" x2="12" y2="17" stroke="#0b50da" strokeWidth="2.8" strokeLinecap="round" />
        </svg>
      </div>
      {showText && <h2 className="text-[#1e293b] text-2xl font-black tracking-tighter">Rsolve</h2>}
    </div>
  );
};
