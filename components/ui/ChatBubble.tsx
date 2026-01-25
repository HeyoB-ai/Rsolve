
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
  timestamp: string;
  attachment?: Attachment;
  autoTranslateTo?: string | null;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ text, isOwn, sender, timestamp, attachment, autoTranslateTo }) => {
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    if (autoTranslateTo && !isOwn && text) {
      handleTranslate(autoTranslateTo);
    } else if (!autoTranslateTo) {
      setTranslatedText(null);
    }
  }, [autoTranslateTo, isOwn, text]);

  const handleTranslate = async (lang: string = 'Nederlands') => {
    if (!text) return;
    setIsTranslating(true);
    const result = await geminiService.translateText(text, lang);
    setTranslatedText(result);
    setIsTranslating(false);
  };

  const renderAttachment = () => {
    if (!attachment) return null;

    const isImage = attachment.type.startsWith('image/');
    const isVideo = attachment.type.startsWith('video/');

    if (isImage) {
      return (
        <div className="mt-2 rounded-xl overflow-hidden border border-slate-100 shadow-sm bg-slate-50">
          <img src={attachment.url} alt={attachment.name} className="max-w-full h-auto block" />
          <div className="px-3 py-2 bg-white/80 backdrop-blur-sm border-t border-slate-100 flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 truncate">{attachment.name}</span>
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
          ${isOwn ? 'bg-blue-700 border-blue-500 text-white' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'}
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
    <div className={`flex flex-col max-w-[85%] ${isOwn ? 'self-end items-end' : 'self-start items-start'} mb-1`}>
      {!isOwn && <span className="text-[10px] font-black text-slate-400 mb-1 ml-2 uppercase tracking-widest">{sender}</span>}
      <div className={`
        relative px-4 py-3 rounded-[20px] shadow-sm transition-all duration-300 group
        ${isOwn ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white border border-slate-100 text-slate-800 rounded-bl-none'}
      `}>
        <div className="flex flex-col gap-1">
          {text && <p className="text-sm leading-relaxed">{text}</p>}
          
          {renderAttachment()}
          
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

          {/* Manual Translate Button for received messages */}
          {!isOwn && text && !translatedText && !isTranslating && (
            <button 
              onClick={() => handleTranslate()}
              className="absolute -right-2 -bottom-2 bg-white shadow-md border border-slate-100 rounded-full p-1.5 text-slate-400 hover:text-blue-600 hover:scale-110 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
              title="Vertaal bericht"
            >
              <ICONS.Translate className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
      <span className="text-[9px] text-slate-300 mt-1 mx-2 font-bold uppercase tracking-tighter">{timestamp}</span>
    </div>
  );
};
