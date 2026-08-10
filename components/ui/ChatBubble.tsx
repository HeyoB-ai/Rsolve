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
  const [showTranslation, setShowTranslation] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  // Tijdelijke (verlopende) link voor de bijlage; de bucket is privé.
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);

  useEffect(() => {
    // Auto-translate if requested and not own message
    if (autoTranslateTo && !isOwn && text && !translatedText && !isTranslating) {
      performTranslation();
    }
  }, [autoTranslateTo, isOwn, text]);

  useEffect(() => {
    let active = true;
    const url = attachment?.url;
    if (!url) { setResolvedUrl(null); return; }
    // Oude berichten kunnen nog een volledige (publieke) URL bevatten -> direct gebruiken.
    if (/^https?:\/\//i.test(url)) { setResolvedUrl(url); return; }
    // Nieuw formaat: een opslagpad. Vraag een tijdelijke signed link aan de server.
    setResolvedUrl(null);
    (async () => {
      try {
        const res = await fetch('/.netlify/functions/sign-attachment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: url }),
        });
        const data = await res.json();
        if (active && data?.url) setResolvedUrl(data.url);
      } catch (e) {
        console.error('Kon bijlage-link niet ophalen', e);
      }
    })();
    return () => { active = false; };
  }, [attachment?.url]);

  const performTranslation = async () => {
    if (!text) return;
    setIsTranslating(true);
    try {
      const result = await geminiService.translateText(text, targetLanguageName);
      setTranslatedText(result);
      setShowTranslation(true); // Default to showing translation once ready
    } catch (error) {
      console.error("Translation failed", error);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!translatedText && !isTranslating) {
      performTranslation();
    } else {
      setShowTranslation(!showTranslation);
    }
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

    // Bijlage-link wordt nog opgehaald (tijdelijke signed URL) -> laadindicator tonen.
    if (!resolvedUrl) {
      return (
        <div className={`mt-2 flex items-center gap-2 p-3 rounded-xl border ${isOwn ? 'bg-blue-700 border-blue-500 text-blue-100' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin opacity-70" />
          <span className="text-[10px] font-bold truncate">{attachment.name}</span>
        </div>
      );
    }

    if (isImage) {
      return (
        <div className={`mt-2 rounded-xl overflow-hidden border shadow-sm ${isOwn ? 'bg-blue-700 border-blue-500' : 'bg-slate-50 border-slate-100'}`}>
          <img src={resolvedUrl} alt={attachment.name} className="max-w-full h-auto block" />
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
            <source src={resolvedUrl} type={attachment.type} />
          </video>
          <div className="px-3 py-2 bg-slate-800 flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-300 truncate">{attachment.name}</span>
          </div>
        </div>
      );
    }

    return (
      <a
        href={resolvedUrl}
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

  const displayText = (showTranslation && translatedText) ? translatedText : text;

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
          {text && (
            <p className="text-sm leading-relaxed whitespace-pre-wrap transition-all duration-300">
              {displayText}
            </p>
          )}
          
          {renderAttachment()}

          {/* Translation Status / Toggle Button */}
          {!isOwn && text && (
            <div className={`mt-2 pt-2 border-t flex items-center justify-between gap-2 ${isMediator ? 'border-emerald-100' : 'border-slate-100'}`}>
              
              {isTranslating ? (
                <div className="flex items-center gap-2 text-[10px] opacity-70">
                  <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span>Vertaalt...</span>
                </div>
              ) : (
                <button 
                  onClick={handleToggle}
                  className={`
                    flex items-center gap-1.5 px-2 py-1 rounded-lg transition-colors text-[10px] font-bold uppercase tracking-wider
                    ${isMediator 
                      ? 'bg-emerald-100/50 text-emerald-700 hover:bg-emerald-100' 
                      : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700'}
                  `}
                >
                  <ICONS.Translate className="w-3.5 h-3.5" />
                  {showTranslation && translatedText 
                    ? 'Toon origineel' 
                    : translatedText 
                      ? 'Toon vertaling' 
                      : 'Vertaal'}
                </button>
              )}

              {/* Indicator if showing translation */}
              {showTranslation && translatedText && !isTranslating && (
                <span className={`text-[8px] font-black uppercase tracking-widest opacity-40 ${isMediator ? 'text-emerald-800' : 'text-slate-500'}`}>
                  Vertaald
                </span>
              )}
            </div>
          )}
        </div>
      </div>
      
      <span className="text-[9px] text-slate-300 mt-1 mx-2 font-bold uppercase tracking-tighter">{timestamp}</span>
    </div>
  );
};
