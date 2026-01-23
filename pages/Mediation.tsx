import React, { useState, useEffect, useRef } from 'react';
import { ChatBubble } from '../components/ui/ChatBubble';
import { Button } from '../components/ui/Button';
import { ICONS } from '../constants';

const Mediation: React.FC<{ caseData: any, onResolve: (vso: any) => void }> = ({ caseData, onResolve }) => {
  const [messages, setMessages] = useState([
    { id: '1', text: `Dossier "${caseData.title}" is aangemaakt.`, isOwn: false, sender: "Systeem", timestamp: "Nu" },
    { id: '2', text: `Welkom bij Rsolve. Ik ben jullie AI Mediator. Ik help jullie stap voor stap naar een oplossing.`, isOwn: false, sender: "Mediator", timestamp: "Nu" },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isRespondentJoined, setIsRespondentJoined] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    
    // Simuleer check of tegenpartij er is na 5 seconden (voor demo doeleinden)
    const timer = setTimeout(() => {
      if (!caseData.isRespondent) {
        setIsRespondentJoined(true);
        setMessages(prev => [...prev, {
          id: 'join-msg',
          text: `${caseData.otherParty} is zojuist het gesprek binnengekomen.`,
          isOwn: false,
          sender: "Systeem",
          timestamp: "Zojuist"
        }]);
      }
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      text: inputValue,
      isOwn: true,
      sender: "Jij",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    setInputValue('');
  };

  const inviteLink = `https://rsolve.app/#/invite/${btoa(caseData.title || "dossier").substring(0, 8)}`;

  const shareWhatsApp = () => {
    const text = encodeURIComponent(`Hoi! Ik heb een dossier aangemaakt bij Rsolve om ons conflict "${caseData.title}" op te lossen: ${inviteLink}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <header className="px-6 py-4 bg-white border-b border-slate-100 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100">
            <span className="text-white text-base font-black italic">R</span>
          </div>
          <div className="overflow-hidden">
            <h1 className="text-sm font-black text-slate-900 truncate max-w-[120px]">{caseData.title}</h1>
            <div className="flex items-center gap-2">
               <div className={`w-1.5 h-1.5 rounded-full ${isRespondentJoined ? 'bg-emerald-500' : 'bg-amber-400 animate-pulse'}`} />
               <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  {isRespondentJoined ? `${caseData.otherParty} is online` : `Wachten op ${caseData.otherParty}...`}
               </span>
            </div>
          </div>
        </div>
        {!caseData.isRespondent && !isRespondentJoined && (
          <Button variant="outline" size="sm" className="rounded-xl border-blue-100 text-blue-600 text-[10px]" onClick={shareWhatsApp}>
             WhatsApp Uitnodiging
          </Button>
        )}
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map(m => (
          <ChatBubble key={m.id} text={m.text} isOwn={m.isOwn} sender={m.sender} timestamp={m.timestamp} />
        ))}
        <div ref={scrollRef} />
      </div>

      <div className="p-4 bg-white border-t border-slate-100 safe-area-bottom">
        <div className="flex gap-3 max-w-2xl mx-auto w-full">
          <input 
            className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all placeholder:text-slate-400 font-medium"
            placeholder="Type een bericht aan de mediator..."
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleSend()}
          />
          <Button size="icon" className="rounded-2xl w-14 h-14 shadow-xl shadow-blue-200" onClick={handleSend}>
            <svg className="w-6 h-6 -rotate-45" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Mediation;