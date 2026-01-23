
import React, { useState } from 'react';
import { ICONS } from '../../constants';
import { geminiService } from '../../services/geminiService';

interface ChatBubbleProps {
  text: string;
  isOwn: boolean;
  sender: string;
  timestamp: string;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ text, isOwn, sender, timestamp }) => {
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  const handleTranslate = async () => {
    if (translatedText) {
      setTranslatedText(null);
      return;
    }
    setIsTranslating(true);
    const result = await geminiService.translateText(text, 'Spanish');
    setTranslatedText(result);
    setIsTranslating(false);
  };

  return (
    <div className={`flex flex-col max-w-[85%] ${isOwn ? 'self-end items-end' : 'self-start items-start'} mb-4`}>
      {!isOwn && <span className="text-xs font-semibold text-slate-500 mb-1 ml-1">{sender}</span>}
      <div className={`
        relative px-4 py-3 rounded-[16px] shadow-sm
        ${isOwn ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white border border-slate-100 text-slate-800 rounded-bl-none'}
      `}>
        <p className="text-sm leading-relaxed">{translatedText || text}</p>
        
        {/* Translation Toggle UI */}
        <button 
          onClick={handleTranslate}
          disabled={isTranslating}
          className={`
            mt-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider
            ${isOwn ? 'text-blue-100 hover:text-white' : 'text-slate-400 hover:text-blue-600'}
            transition-colors
          `}
        >
          {isTranslating ? (
            <span className="animate-pulse">Translating...</span>
          ) : (
            <>
              <ICONS.Translate className="w-3 h-3" />
              {translatedText ? 'Original' : 'Translate'}
            </>
          )}
        </button>
      </div>
      <span className="text-[10px] text-slate-400 mt-1 mx-1 font-medium">{timestamp}</span>
    </div>
  );
};
