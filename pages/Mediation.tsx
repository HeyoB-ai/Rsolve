import React, { useState, useEffect, useRef } from 'react';
import { ChatBubble } from '../components/ui/ChatBubble';
import { Button } from '../components/ui/Button';
import { ICONS } from '../constants';
import { Logo } from '../components/ui/Logo';

const Mediation: React.FC<{ caseData: any, onResolve: (vso: any) => void }> = ({ caseData, onResolve }) => {
  const [messages, setMessages] = useState([
    { id: '1', text: `Mediation voor "${caseData.title}" is gestart.`, isOwn: false, sender: "Systeem", timestamp: "Nu" },
    { id: '2', text: `Welkom. Ik ben jullie AI Mediator. Omar is uitgenodigd, maar we kunnen alvast beginnen. Vertel me gerust wat jouw kant van het verhaal is.`, isOwn: false, sender: "Mediator", timestamp: "Nu" },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isRespondentJoined, setIsRespondentJoined] = useState(caseData.isRespondent || false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll naar beneden bij elk nieuw bericht
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    const newMessage = {
      id: Date.now().toString(),
      text: inputValue,
      isOwn: true,
      sender: "Jij",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, newMessage]);
    setInputValue('');

    // Simuleer een korte reactie van de mediator als de andere partij er nog niet is
    if (!isRespondentJoined) {
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          text: "Ik begrijp je punt. Ik noteer dit voor het dossier. Zodra de tegenpartij aansluit, zal ik proberen een brug te slaan tussen jullie beide standpunten.",
          isOwn: false,
          sender: "Mediator",
          timestamp: "Zojuist"
        }]);
      }, 1500);
    }
  };

  return (
    <div className="h-safe flex flex-col bg-slate-50 overflow-hidden">
      {/* Header - Compact voor mobiel */}
      <header className="px-5 py-3 bg-white border-b border-slate-100 flex items-center justify-between z-30 shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <Logo className="w-8 h-8" />
          <div className="overflow-hidden">
            <h1 className="text-xs font-black text-slate-900 truncate max-w-[150px] uppercase tracking-tight">
              {caseData.title}
            </h1>
            <div className="flex items-center gap-1.5">
               <div className={`w-1.5 h-1.5 rounded-full ${isRespondentJoined ? 'bg-emerald-500' : 'bg-amber-400 animate-pulse'}`} />
               <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                  {isRespondentJoined ? `${caseData.otherParty} is online` : `Wachten op ${caseData.otherParty}...`}
               </span>
            </div>
          </div>
        </div>
        <button className="text-slate-300 p-2"><ICONS.Settings className="w-5 h-5" /></button>
      </header>

      {/* Chat Area - Neemt alle overgebleven ruimte in */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(m => (
          <ChatBubble key={m.id} text={m.text} isOwn={m.isOwn} sender={m.sender} timestamp={m.timestamp} />
        ))}
        
        {!isRespondentJoined && (
          <div className="mx-auto max-w-xs bg-amber-50/80 backdrop-blur-sm border border-amber-100 p-3 rounded-2xl text-center shadow-sm">
            <p className="text-[9px] font-black text-amber-600 uppercase tracking-[0.2em] mb-0.5">Dossier Status</p>
            <p className="text-[10px] text-amber-800 font-semibold leading-tight">
              Link is verstuurd naar {caseData.otherParty}. Je kunt de mediator alvast informeren.
            </p>
          </div>
        )}
        <div ref={scrollRef} className="h-4" />
      </div>

      {/* Input Area - Met safe-area padding voor iPhone */}
      <div className="bg-white border-t border-slate-100 px-4 pt-3 pb-safe shrink-0 shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
        <div className="flex gap-2 max-w-2xl mx-auto w-full items-end">
          <textarea 
            className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-400 font-medium resize-none max-h-32"
            placeholder="Typ een bericht..."
            rows={1}
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <Button 
            size="icon" 
            className="rounded-2xl w-12 h-12 shadow-lg shadow-blue-100 shrink-0" 
            onClick={handleSend}
            disabled={!inputValue.trim()}
          >
            <svg className="w-5 h-5 -rotate-45" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
              <path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Mediation;