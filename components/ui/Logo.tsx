import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = "w-24 h-24", showText = false }) => {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <svg viewBox="0 0 400 400" className="w-full h-full drop-shadow-sm">
        <defs>
          <clipPath id="circleClip">
            <circle cx="200" cy="180" r="140" />
          </clipPath>
        </defs>
        
        {/* Outer background circle */}
        <circle cx="200" cy="180" r="145" fill="white" />
        
        {/* The Mandala/Face Design */}
        <g clipPath="url(#circleClip)">
          {/* Base Background Colors */}
          <path d="M60 180 A140 140 0 0 1 340 180 L 200 180 Z" fill="#1e3a8a" /> {/* Top Dark Blue */}
          <path d="M60 180 A140 140 0 0 0 340 180 L 200 180 Z" fill="#0ea5e9" /> {/* Bottom Sky Blue */}
          
          {/* Top Petal / Crest */}
          <circle cx="200" cy="80" r="60" fill="#f59e0b" />
          <circle cx="200" cy="80" r="40" fill="#0ea5e9" />
          <circle cx="200" cy="80" r="15" fill="#ef4444" />
          
          {/* Side Petals (Greenish/Cyan) */}
          <path d="M60 180 Q 80 120 120 180 Q 80 240 60 180" fill="#a7f3d0" stroke="#1e3a8a" strokeWidth="6" />
          <path d="M340 180 Q 320 120 280 180 Q 320 240 340 180" fill="#a7f3d0" stroke="#1e3a8a" strokeWidth="6" />
          
          {/* Red/Orange background elements */}
          <circle cx="120" cy="120" r="50" fill="#ef4444" />
          <circle cx="280" cy="120" r="50" fill="#f97316" />
          <circle cx="120" cy="240" r="50" fill="#f97316" />
          <circle cx="280" cy="240" r="50" fill="#f59e0b" />

          {/* Central Sun Face */}
          <circle cx="200" cy="185" r="95" fill="#1e3a8a" /> {/* Border/Shadow */}
          <circle cx="200" cy="185" r="85" fill="#f97316" />
          
          {/* Face split/gradient effect */}
          <path d="M200 100 A85 85 0 0 1 200 270 Z" fill="#f59e0b" />
          <path d="M200 100 A85 85 0 0 1 200 270 Z" fill="#ef4444" opacity="0.4" transform="rotate(180 200 185)" />

          {/* Eyes */}
          <circle cx="165" cy="175" r="12" fill="#1e3a8a" />
          <circle cx="235" cy="175" r="12" fill="#1e3a8a" />
          
          {/* Smile */}
          <path d="M175 205 Q 200 230 225 205" fill="none" stroke="#1e3a8a" strokeWidth="8" strokeLinecap="round" />

          {/* Decorative Stars/Dots */}
          <circle cx="140" cy="90" r="8" fill="white" />
          <circle cx="260" cy="90" r="8" fill="white" />
          <path d="M140 70 L 145 80 L 155 85 L 145 90 L 140 100 L 135 90 L 125 85 L 135 80 Z" fill="white" />
          <path d="M260 70 L 265 80 L 275 85 L 265 90 L 260 100 L 255 90 L 245 85 L 255 80 Z" fill="white" />
          
          {/* Bottom Blue elements */}
          <path d="M160 300 Q 200 280 240 300 L 220 340 L 180 340 Z" fill="#3b82f6" />
        </g>
      </svg>
      
      {showText && (
        <span className="mt-4 text-4xl font-black tracking-widest text-[#1e3a8a] font-sans">
          RSOLVE
        </span>
      )}
    </div>
  );
};
