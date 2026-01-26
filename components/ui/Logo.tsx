
import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = "text-2xl", showText = false }) => {
  return (
    <div className="flex items-center gap-2">
      <div className="text-primary flex items-center">
        <span className={`material-symbols-outlined ${className}`} style={{ fontVariationSettings: "'FILL' 1" }}>
          balance
        </span>
      </div>
      {showText && <h2 className="text-primary text-xl font-bold tracking-tight">Rsolve</h2>}
    </div>
  );
};
