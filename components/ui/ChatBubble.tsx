import React, { useState, useEffect } from 'react';
import { geminiService } from '../../services/geminiService';
import { ICONS } from '../../constants';

interface Attachment {
  name: string;
  type: string;
  url: string; // Base64 or Blob URL
}

interface ChatBubbleProps {
  text?: string;
  isOwn: boolean;
  sender: string;
  senderRole?: 'initiator' | 'respondent' | 'mediator' | 'system';
  timestamp: string;
  attachment?: Attachment;
  autoTranslateTo?: string | null;
  targetLanguageName?: string; 
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ 
  text, 
  isOwn, 
  sender, 
  senderRole,
  timestamp, 
  attachment, 
  autoTranslateTo, 
  targetLanguageName = 'Nederlands' 
}) => {
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    if (autoTranslateTo && !isOwn && text) {
      handleTranslate(autoTranslateTo);
    } else if (!autoTranslateTo) {
      setTranslatedText(null);
    }
  }, [autoTranslateTo, isOwn, text]);

  const handleTranslate = async (lang: string = targetLanguageName) => {
    if (!text) return;
    setIsTranslating(true);
    const result = await geminiService.translateText(text, lang);
    setTranslatedText(result);
    setIsTranslating(false);
  };

  const isMediator = senderRole === 'mediator';

  // Bepaal bubbel achtergrondkleur en rand
  const bubbleClasses = isOwn
    ? 'bg-blue-600 text-white rounded-br-none shadow-md'
    : isMediator
    ? 'bg-emerald-50 border border-emerald-100 text-slate-800 rounded-bl-none shadow-sm'
    : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm';

  const renderAttachment = () => {
    if (!attachment) return null;

    const isImage = attachment.type.startsWith('image/');
    const isVideo = attachment.type.startsWith('video/');

    if (isImage) {
      return (
        <div className={`mt-2 rounded-xl overflow-hidden border shadow-sm ${isOwn ? 'bg-blue-700 border-blue-500' : 'bg-slate-50 border-slate-100'}`}>
          <img src={attachment.url} alt={attachment.name} className="max-w-full h-auto block" />
          <div className={`px-3 py-2 ${isOwn ? 'bg-blue-800/50' : 'bg-white/80'} backdrop-blur-sm border-t ${isOwn ? 'border-blue-500' : 'border-slate-100'} flex items-center justify-between`}>
            <span className={`text-[10px] font-bold truncate ${isOwn ? 'text-blue-100' : 'text-slate-500'}`}>{attachment.name}</span>
          </div>
        </div>
      );
    }

    if (isVideo) {
      return (
        <div className="mt-2 rounded-xl overflow-hidden border border-slate-100 shadow-sm bg-slate-900">
          <video controls className="w-full block">
            <source src={attachment.url} type={attachment.type} />
          </video>
          <div className="px-3 py-2 bg-slate-800 flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-300 truncate">{attachment.name}</span>
          </div>
        </div>
      );
    }

    return (
      <a 
        href={attachment.url} 
        download={attachment.name}
        className={`
          mt-2 flex items-center gap-3 p-3 rounded-xl border transition-colors
          ${isOwn ? 'bg-blue-700 border-blue-500 text-white hover:bg-blue-800' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'}
        `}
      >
        <div className={`p-2 rounded-lg ${isOwn ? 'bg-blue-800' : 'bg-white'}`}>
          <ICONS.File className="w-5 h-5" />
        </div>
        <div className="flex-1 overflow-hidden">
          <p className="text-xs font-bold truncate">{attachment.name}</p>
          <p className={`text-[9px] uppercase tracking-widest font-black opacity-60`}>Bijlage • Download</p>
        </div>
      </a>
    );
  };

  return (
    <div className={`flex flex-col max-w-[85%] ${isOwn ? 'self-end items-end' : 'self-start items-start'} mb-2 animate-in fade-in slide-in-from-bottom-2 duration-300`}>
      {!isOwn && (
        <span className={`text-[10px] font-black mb-1 ml-2 uppercase tracking-widest ${isMediator ? 'text-emerald-600' : 'text-slate-400'}`}>
          {sender}
        </span>
      )}
      <div className={`
        relative px-4 py-3 rounded-[20px] transition-all duration-300 group
        ${bubbleClasses}
      `}>
        <div className="flex flex-col gap-1">
          {text && <p className="text-sm leading-relaxed whitespace-pre-wrap">{text}</p>}
          
          {renderAttachment()}
          
          {(translatedText || isTranslating) && (
            <div className={`pt-2 mt-2 border-t ${isOwn ? 'border-blue-500' : isMediator ? 'border-emerald-100' : 'border-slate-100'} animate-in fade-in slide-in-from-top-1`}>
              {isTranslating ? (
                <div className="flex items-center gap-2 text-[10px] opacity-70">
                  <div className="w-1 h-1 bg-current rounded-full animate-bounce" />
                  <div className="w-1 h-1 bg-current rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span>Vertaalt naar {targetLanguageName}...</span>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className={`text-[10px] uppercase tracking-widest font-black opacity-40 ${isOwn ? 'text-blue-100' : 'text-slate-400'}`}>Vertaling:</p>
                  <p className={`text-xs italic leading-relaxed ${isOwn ? 'text-blue-100' : 'text-slate-500'}`}>
                    {translatedText}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Vertaal knop */}
          {!isOwn && text && !translatedText && !isTranslating && (
             <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleTranslate();
                }}
                className={`
                  mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors border shadow-sm
                  ${isMediator 
                    ? 'bg-emerald-100/50 border-emerald-100 text-emerald-700 hover:bg-emerald-100' 
                    : 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100'}
                `}
                title={`Vertaal naar ${targetLanguageName}`}
             >
                <ICONS.Translate className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-wide">Vertaal</span>
             </button>
          )}
        </div>
      </div>
      
      <span className="text-[9px] text-slate-300 mt-1 mx-2 font-bold uppercase tracking-tighter">{timestamp}</span>
    </div>
  );
};
