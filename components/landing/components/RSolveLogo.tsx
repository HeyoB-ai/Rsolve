import React from 'react';

interface RSolveLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showWordmark?: boolean;
  showTagline?: boolean;
  className?: string;
  customLogoUrl?: string | null;
  brandPrimaryColor?: string;
}

export function RSolveLogo({
  size = 'md',
  showWordmark = true,
  showTagline = false,
  className = '',
  customLogoUrl = null,
  brandPrimaryColor = '#10B981',
}: RSolveLogoProps) {
  const sizeMap = {
    sm: { icon: 24, text: 'text-lg', sub: 'text-[9px]', gap: 'gap-2' },
    md: { icon: 32, text: 'text-xl sm:text-2xl', sub: 'text-[10px]', gap: 'gap-2.5' },
    lg: { icon: 40, text: 'text-2xl sm:text-3xl', sub: 'text-xs', gap: 'gap-3' },
    xl: { icon: 52, text: 'text-3xl sm:text-4xl', sub: 'text-sm', gap: 'gap-3.5' },
  };

  const current = sizeMap[size];

  return (
    <div className={`inline-flex items-center ${current.gap} ${className}`}>
      {/* Logo Icon or Uploaded Image */}
      {customLogoUrl ? (
        <img
          src={customLogoUrl}
          alt="RSolve Logo"
          className="object-contain shrink-0 rounded-lg"
          style={{ width: current.icon, height: current.icon }}
        />
      ) : (
        <div 
          className="relative shrink-0 flex items-center justify-center transition-transform duration-200"
          style={{ width: current.icon, height: current.icon }}
        >
          {/* Subtle clean infinity / resolution loop geometry */}
          <svg
            viewBox="0 0 36 36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
          >
            {/* Background subtle circle */}
            <circle cx="18" cy="18" r="17" fill="#0B1320" stroke="currentColor" strokeOpacity="0.15" strokeWidth="1" />
            
            {/* Harmonizing bridge / resolution path connecting two sides */}
            <path
              d="M10 24C10 17 14 11 20 11C24.5 11 27 14 27 18C27 22.5 23 25 18 25C13 25 10 21 10 18"
              stroke={brandPrimaryColor}
              strokeWidth="2.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* The 'R' intersection leg */}
            <path
              d="M18 18L25 25"
              stroke="#38BDF8"
              strokeWidth="2.75"
              strokeLinecap="round"
            />
            {/* Equilibrium focal point */}
            <circle cx="20" cy="11" r="1.5" fill="#F59E0B" />
          </svg>
        </div>
      )}

      {/* Wordmark */}
      {showWordmark && (
        <div className="flex flex-col select-none">
          <div className="flex items-center gap-1.5 leading-none">
            <span className={`font-display font-black tracking-tight text-white ${current.text}`}>
              R<span style={{ color: brandPrimaryColor }}>Solve</span>
            </span>
          </div>

          {showTagline && (
            <span className={`text-slate-400 font-medium tracking-wide ${current.sub} mt-0.5`}>
              AI Mediation &amp; Conflict Resolution
            </span>
          )}
        </div>
      )}
    </div>
  );
}
