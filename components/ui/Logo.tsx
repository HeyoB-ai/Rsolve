
import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = "w-8 h-8", showText = false }) => {
  return (
    <div className="flex items-center gap-2.5 group">
      <div className={`text-primary shrink-0 transition-transform duration-500 group-hover:rotate-12 ${className}`}>
        <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C11.4477 2 11 2.44772 11 3V4.0625C7.05432 4.54586 4 7.91795 4 12C4 16.0821 7.05432 19.4541 11 19.9375V21C11 21.5523 11.4477 22 12 22C12.5523 22 13 21.5523 13 21V19.9375C16.9457 19.4541 20 16.0821 20 12C20 7.91795 16.9457 4.54586 13 4.0625V3C13 2.44772 12.5523 2 12 2ZM6 12C6 8.68629 8.68629 6 12 6C15.3137 6 18 8.68629 18 12C18 15.3137 15.3137 18 12 18C8.68629 18 6 15.3137 6 12ZM12 8C10.8954 8 10 8.89543 10 10V14C10 15.1046 10.8954 16 12 16C13.1046 16 14 15.1046 14 14V10C14 8.89543 13.1046 8 12 8Z" />
        </svg>
      </div>
      {showText && <h2 className="text-primary text-2xl font-black tracking-tighter">Rsolve</h2>}
    </div>
  );
};
