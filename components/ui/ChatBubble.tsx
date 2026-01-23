import React, { useState, useEffect } from 'react';
import { ICONS } from '../../constants';
import { geminiService } from '../../services/geminiService';

interface ChatBubbleProps {
  text: string;
  isOwn: boolean;
  sender: string;
  timestamp: string;
  autoTranslateTo?: string | null;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ text, isOwn, sender, timestamp, autoTranslateTo }) => {
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    if (autoTranslateTo && !isOwn) {
      handleTranslate(autoTranslateTo);
    }
  }, [autoTranslateTo]);

  const handleTranslate = async (lang: string = 'Nederlands') => {
    if (translatedText && !autoTranslateTo) {
      setTranslatedText(null);
      return;
    }
    setIsTranslating(true);
    const result = await geminiService.translateText(text, lang);
    setTranslatedText(result);
    setIsTranslating(false);
  };

  return (
    <div className={`flex flex-col max-w-[85%] ${isOwn ? 'self-end items-end' : 'self-start items-start'} mb-1`}>
      {!isOwn && <span className="text-[10px] font-black text-slate-400 mb-1 ml-2 uppercase tracking-widest">{sender}</span>}
      <div className={`
        relative px-4 py-3 rounded-[20px] shadow-sm transition-all duration-300
        ${isOwn ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white border border-slate-100 text-slate-800 rounded-bl-none'}
      `}>
        <div className="flex flex-col gap-2">
          <p className="text-sm leading-relaxed">{text}</p>
          
          {(translatedText || isTranslating) && (
            <div className={`pt-2 mt-2 border-t ${isOwn ? 'border-blue-500' : 'border-slate-100 animate-in fade-in slide-in-from-top-1'}`}>
              {isTranslating ? (
                <div className="flex items-center gap-2 text-[10px] opacity-70">
                  <div className="w-1 h-1 bg-current rounded-full animate-bounce" />
                  <div className="w-1 h-1 bg-current rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span>Vertaalt...</span>
                </div>
              ) : (
                <p className={`text-xs italic leading-relaxed ${isOwn ? 'text-blue-100' : 'text-slate-500'}`}>
                  {translatedText}
                </p>
              )}
            </div>
          )}
        </div>
        
        {/* Handmatige vertaal-knop (alleen als auto-translate uit staat) */}
        {!autoTranslateTo && (
          <button 
            onClick={() => handleTranslate('Nederlands')}
            disabled={isTranslating}
            className={`
              mt-2 flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest
              ${isOwn ? 'text-blue-100 hover:text-white' : 'text-slate-400 hover:text-blue-600'}
              transition-colors
            `}
          >
            <ICONS.Translate className="w-3 h-3" />
            {translatedText ? 'Toon origineel' : 'Vertaal naar NL'}
          </button>
        )}
      </div>
      <span className="text-[9px] text-slate-300 mt-1 mx-2 font-bold uppercase tracking-tighter">{timestamp}</span>
    </div>
  );
};