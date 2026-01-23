import React, { useState, useEffect, useRef } from 'react';
import { ChatBubble } from '../components/ui/ChatBubble';
import { Button } from '../components/ui/Button';
import { ICONS } from '../constants';
import { Logo } from '../components/ui/Logo';

const Mediation: React.FC<{ caseData: any, onResolve: (vso: any) => void }> = ({ caseData, onResolve }) => {
  const [messages, setMessages] = useState([
    { id: '1', text: `Mediation voor "${caseData.title}" is gestart.`, isOwn: false, sender: "Systeem", timestamp: "Nu" },
    { id: '2', text: `Welkom. Ik ben jullie AI Mediator. We gaan samen kijken hoe we tot een oplossing kunnen komen.`, isOwn: false, sender: "Mediator", timestamp: "Nu" },
  ]);
  const [inputValue, setInputValue] = useState('');
  // We zetten de status nu standaard op false voor de initiator, 
  // en alleen op true als de gebruiker zelf de respondent is (via de invite link).
  const [isRespondentJoined, setIsRespondentJoined] = useState(caseData.isRespondent || false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    
    // De automatische timer (setTimeout) die Henk 'online' haalde is verwijderd.
    // In een productie-omgeving met een database (zoals Supabase) zou hier 
    // een realtime listener komen die kijkt of de andere partij echt inlogt.
  }, [messages]);

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

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <header className="px-6 py-4 bg-white border-b border-slate-100 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <Logo className="w-10 h-10" />
          <div className="overflow-hidden">
            <h1 className="text-sm font-black text-slate-900 truncate max-w-[120px]">{caseData.title}</h1>
            <div className="flex items-center gap-2">
               <div className={`w-1.5 h-1.5 rounded-full ${isRespondentJoined ? 'bg-emerald-500' : 'bg-slate-300'}`} />
               <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  {isRespondentJoined ? `${caseData.otherParty} is online` : `Wachten op ${caseData.otherParty}...`}
               </span>
            </div>
          </div>
        </div>
        <button className="text-slate-400 p-2"><ICONS.Settings className="w-5 h-5" /></button>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map(m => (
          <ChatBubble key={m.id} text={m.text} isOwn={m.isOwn} sender={m.sender} timestamp={m.timestamp} />
        ))}
        {!isRespondentJoined && (
          <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl text-center animate-in fade-in duration-700">
            <p className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em] mb-1">Status</p>
            <p className="text-xs text-amber-800 font-medium">
              Zodra {caseData.otherParty} op de uitnodigingslink klikt, verschijnt hij hier in het gesprek.
            </p>
          </div>
        )}
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