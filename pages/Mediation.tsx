import React, { useState, useEffect, useRef } from 'react';
import { ChatBubble } from '../components/ui/ChatBubble';
import { Button } from '../components/ui/Button';
import { ICONS } from '../constants';
import { Logo } from '../components/ui/Logo';
import { geminiService } from '../services/geminiService';

const Mediation: React.FC<{ caseData: any, onResolve: (vso: any) => void }> = ({ caseData, onResolve }) => {
  const [messages, setMessages] = useState<any[]>([
    { id: '1', text: `Mediation voor "${caseData.title}" is gestart.`, isOwn: false, sender: "Systeem", timestamp: "Nu", type: 'system' },
    { id: '2', text: `Welkom. Ik ben jullie AI Mediator. Omar is uitgenodigd, maar we kunnen alvast beginnen. Vertel me gerust wat jouw kant van het verhaal is.`, isOwn: false, sender: "Mediator", timestamp: "Nu" },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isRespondentJoined, setIsRespondentJoined] = useState(caseData.isRespondent || false);
  const [displayMode, setDisplayMode] = useState<'single' | 'dual'>('single');
  const [pendingLanguageApproval, setPendingLanguageApproval] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addSystemMessage = (text: string) => {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      text,
      isOwn: false,
      sender: "Systeem",
      timestamp: "Nu",
      type: 'system'
    }]);
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    
    const textToSend = inputValue;
    const newMessage = {
      id: Date.now().toString(),
      text: textToSend,
      isOwn: true,
      sender: "Jij",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, newMessage]);
    setInputValue('');

    // Check voor vreemde taal
    if (displayMode === 'single') {
      const detection = await geminiService.detectNonDutch(textToSend);
      if (detection.isNonDutch && !pendingLanguageApproval) {
        setPendingLanguageApproval(detection.language);
        
        // Mediator stelt vraag aan de ANDERE partij (fictief in dit demo-scenario)
        setTimeout(() => {
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            text: `Ik merk dat er in het ${detection.language} wordt gecommuniceerd. Is het goed als we in deze taal verdergaan, of zal ik vanaf nu alles automatisch vertalen?`,
            isOwn: false,
            sender: "Mediator",
            timestamp: "Zojuist",
            type: 'choice'
          }]);
        }, 800);
      }
    }
  };

  const setLanguagePreference = (mode: 'single' | 'dual') => {
    setDisplayMode(mode);
    setPendingLanguageApproval(null);
    const msg = mode === 'dual' 
      ? "Begrepen. Ik zal vanaf nu elk bericht in twee talen tonen voor de duidelijkheid."
      : "Akkoord, we gaan verder in de gekozen taal.";
    
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      text: msg,
      isOwn: false,
      sender: "Mediator",
      timestamp: "Nu"
    }]);
  };

  return (
    <div className="h-safe flex flex-col bg-slate-50 overflow-hidden">
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

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(m => {
          if (m.type === 'system') {
            return (
              <div key={m.id} className="text-center py-2 animate-in fade-in duration-500">
                <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">{m.text}</span>
              </div>
            );
          }
          if (m.type === 'choice') {
            return (
              <div key={m.id} className="bg-white border border-slate-100 p-5 rounded-[24px] shadow-sm space-y-4 animate-in zoom-in-95 duration-300">
                <p className="text-sm font-medium text-slate-700 leading-relaxed text-center">{m.text}</p>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" size="sm" className="rounded-xl border-slate-200" onClick={() => setLanguagePreference('single')}>
                    Taal is OK
                  </Button>
                  <Button variant="primary" size="sm" className="rounded-xl" onClick={() => setLanguagePreference('dual')}>
                    Toon beide
                  </Button>
                </div>
              </div>
            );
          }
          return (
            <ChatBubble 
              key={m.id} 
              text={m.text} 
              isOwn={m.isOwn} 
              sender={m.sender} 
              timestamp={m.timestamp} 
              autoTranslateTo={displayMode === 'dual' ? 'Nederlands' : null}
            />
          );
        })}
        
        {!isRespondentJoined && !messages.some(m => m.type === 'choice') && (
          <div className="mx-auto max-w-xs bg-amber-50/80 backdrop-blur-sm border border-amber-100 p-3 rounded-2xl text-center shadow-sm">
            <p className="text-[9px] font-black text-amber-600 uppercase tracking-[0.2em] mb-0.5">Dossier Status</p>
            <p className="text-[10px] text-amber-800 font-semibold leading-tight">
              Link is verstuurd. Je kunt de mediator alvast informeren in je eigen taal.
            </p>
          </div>
        )}
        <div ref={scrollRef} className="h-4" />
      </div>

      <div className="bg-white border-t border-slate-100 px-4 pt-3 pb-safe shrink-0 shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
        <div className="flex gap-2 max-w-2xl mx-auto w-full items-end">
          <textarea 
            className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-400 font-medium resize-none max-h-32"
            placeholder="Bericht..."
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