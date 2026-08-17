
import React from 'react';
import { TOKENS } from '../../constants';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick, noPadding }) => {
  return (
    <div 
      onClick={onClick}
      className={`
        bg-slate-900 border border-slate-800 text-slate-100
        ${noPadding ? '' : 'p-4'}
        rounded-[12px]
        ${onClick ? 'cursor-pointer active:scale-[0.98] transition-transform' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};
