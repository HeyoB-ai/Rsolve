
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
        bg-white border border-slate-200 
        ${noPadding ? '' : 'p-4'} 
        rounded-[12px] 
        shadow-sm
        ${onClick ? 'cursor-pointer active:scale-[0.98] transition-transform' : ''}
        ${className}
      `}
      style={{ boxShadow: TOKENS.shadows.sm }}
    >
      {children}
    </div>
  );
};
