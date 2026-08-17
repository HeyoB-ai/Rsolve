import React, { useState, useEffect } from 'react';
import { geminiService } from '../../services/geminiService';
import { ICONS } from '../../constants';

// Sessiebrede cache voor vertalingen, zodat dezelfde tekst niet steeds opnieuw
// naar de vertaal-API gaat (zuiniger en sneller).
const translationMemo = new Map<string, string>();

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
    // Toon berichten van de ander en van de mediator automatisch in de taal van de
    // lezer. De mediator schrijft in het Nederlands, dus voor een Nederlandse lezer
    // slaan we die vertaling over (voorkomt een onnodige call).
    const isMediatorMsg = senderRole === 'mediator';
    const skip = isMediatorMsg && autoTranslateTo === 'nl';
    if (autoTranslateTo && !isOwn && text && !skip && !translatedText && !isTranslating) {
      performTranslation();
    }
  }, [autoTranslateTo, isOwn, text, senderRole]);

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
    const cacheKey = `${targetLanguageName}::${text}`;
    const cached = translationMemo.get(cacheKey);
    if (cached !== undefined) {
      setTranslatedText(cached);
      setShowTranslation(true);
      return;
    }
    setIsTranslating(true);
    try {
      const result = await geminiService.translateText(text, targetLanguageName);
      translationMemo.set(cacheKey, result);
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

  // Vaste kleur per partij (rol), zodat je in één oogopslag ziet wie wie is —
  // consistent met de kleurcodering op de website. Partij A (initiator) = rose,
  // Partij B (respondent) = emerald, mediator = cyaan (merk).
  const ROLE_THEME: Record<string, {
    label: string; own: string; other: string; divider: string; accent: string; btn: string;
  }> = {
    initiator: {
      label: 'text-red-300',
      own: 'bg-red-950/60 border border-red-800/50 text-red-50 rounded-br-none shadow-sm',
      other: 'bg-slate-950/70 border border-red-900/60 text-slate-100 rounded-bl-none shadow-sm',
      divider: 'border-red-800/30',
      accent: 'text-red-300',
      btn: 'bg-red-500/10 text-red-200 hover:bg-red-500/20',
    },
    respondent: {
      label: 'text-emerald-300',
      own: 'bg-emerald-950/60 border border-emerald-800/50 text-emerald-50 rounded-br-none shadow-sm',
      other: 'bg-slate-950/70 border border-emerald-900/60 text-slate-100 rounded-bl-none shadow-sm',
      divider: 'border-emerald-800/30',
      accent: 'text-emerald-300',
      btn: 'bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/20',
    },
    mediator: {
      label: 'text-cyan-300',
      own: 'bg-cyan-950/60 border border-cyan-800/50 text-cyan-50 rounded-br-none shadow-sm',
      other: 'bg-slate-900/70 border border-cyan-800/40 text-slate-100 rounded-bl-none shadow-sm',
      divider: 'border-cyan-800/30',
      accent: 'text-cyan-300',
      btn: 'bg-cyan-500/10 text-cyan-200 hover:bg-cyan-500/20',
    },
    default: {
      label: 'text-slate-400',
      own: 'bg-slate-800/80 border border-slate-700 text-slate-100 rounded-br-none shadow-sm',
      other: 'bg-slate-900/70 border border-slate-700 text-slate-100 rounded-bl-none shadow-sm',
      divider: 'border-slate-700',
      accent: 'text-slate-400',
      btn: 'bg-slate-700/60 text-slate-300 hover:bg-slate-700 hover:text-white',
    },
  };
  const theme = ROLE_THEME[senderRole || 'default'] || ROLE_THEME.default;

  // Bepaal bubbel achtergrondkleur en rand
  const bubbleClasses = isOwn ? theme.own : theme.other;

  const renderAttachment = () => {
    if (!attachment) return null;

    const isImage = attachment.type.startsWith('image/');
    const isVideo = attachment.type.startsWith('video/');

    // Bijlage-link wordt nog opgehaald (tijdelijke signed URL) -> laadindicator tonen.
    if (!resolvedUrl) {
      return (
        <div className="mt-2 flex items-center gap-2 p-3 rounded-xl border bg-slate-900/70 border-slate-700 text-slate-400">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin opacity-70" />
          <span className="text-[10px] font-bold truncate">{attachment.name}</span>
        </div>
      );
    }

    if (isImage) {
      return (
        <div className="mt-2 rounded-xl overflow-hidden border shadow-sm bg-slate-900/70 border-slate-700">
          <img src={resolvedUrl} alt={attachment.name} className="max-w-full h-auto block" />
          <div className="px-3 py-2 bg-slate-900/80 backdrop-blur-sm border-t border-slate-700 flex items-center justify-between">
            <span className="text-[10px] font-bold truncate text-slate-400">{attachment.name}</span>
          </div>
        </div>
      );
    }

    if (isVideo) {
      return (
        <div className="mt-2 rounded-xl overflow-hidden border border-slate-700 shadow-sm bg-slate-900">
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
          bg-slate-900/70 border-slate-700 text-slate-200 hover:bg-slate-800
        `}
      >
        <div className="p-2 rounded-lg bg-slate-950/60">
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
        <span className={`text-[10px] font-black mb-1 ml-2 uppercase tracking-widest ${theme.label}`}>
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
            <div className={`mt-2 pt-2 border-t flex items-center justify-between gap-2 ${theme.divider}`}>
              
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
                    ${theme.btn}
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
                <span className={`text-[8px] font-black uppercase tracking-widest opacity-50 ${theme.accent}`}>
                  Vertaald
                </span>
              )}
            </div>
          )}
        </div>
      </div>
      
      <span className="text-[9px] text-slate-500 mt-1 mx-2 font-bold uppercase tracking-tighter">{timestamp}</span>
    </div>
  );
};
