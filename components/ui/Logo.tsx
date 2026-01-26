
import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = "w-8 h-8", showText = false }) => {
  return (
    <div className="flex items-center gap-3 group select-none">
      <div className={`shrink-0 transition-transform duration-500 group-hover:rotate-12 ${className}`}>
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full shadow-sm rounded-full">
          <defs>
            <linearGradient id="logoGradient" x1="0" y1="0" x2="100" y2="100">
              <stop offset="0%" stopColor="#0b50da" />
              <stop offset="50%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#ff9a5c" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          
          {/* Main Circle Background */}
          <circle cx="50" cy="50" r="50" fill="url(#logoGradient)" />
          
          {/* Abstract 'S' / Connection Shape representing Mediation */}
          <path 
            d="M30 50 C 30 25, 70 25, 70 50 C 70 75, 30 75, 30 50" 
            stroke="white" 
            strokeWidth="8" 
            strokeLinecap="round" 
            fill="none" 
            opacity="0.9"
          />
          
          {/* Dots representing two parties */}
          <circle cx="30" cy="50" r="6" fill="white" />
          <circle cx="70" cy="50" r="6" fill="white" />
          
          {/* Shine effect */}
          <circle cx="75" cy="25" r="8" fill="white" opacity="0.2" />
        </svg>
      </div>
      {showText && <h2 className="text-[#1e293b] text-2xl font-black tracking-tighter">Rsolve</h2>}
    </div>
  );
};
