
import React, { useState, useEffect, useRef } from 'react';
import { ChatBubble } from '../components/ui/ChatBubble';
import { Button } from '../components/ui/Button';
import { ICONS } from '../constants';
import { Card } from '../components/ui/Card';

const Mediation: React.FC<{ caseData: any, onResolve: (vso: any) => void }> = ({ caseData, onResolve }) => {
  const [showInviteOnboarding, setShowInviteOnboarding] = useState(true);
  const [hasCopied, setHasCopied] = useState(false);
  const [messages, setMessages] = useState([
    { id: '1', text: `Betaling ontvangen voor dossier: ${caseData.title}.`, isOwn: false, sender: "Systeem", timestamp: "Nu" },
    { id: '2', text: `Welkom. Ik ben je Rsolve Mediator. Zodra ${caseData.otherParty} deelneemt, leggen we de afspraken vast in een VSO.`, isOwn: false, sender: "Mediator", timestamp: "Nu" },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isGeneratingVSO, setIsGeneratingVSO] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const inviteLink = `https://rsolve.app/#/invite/${btoa(caseData.title).substring(0, 8)}`;

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(`Hoi! Ik heb een dossier aangemaakt bij Rsolve om ons conflict "${caseData.title}" op te lossen. Jouw deelname is gratis en helpt ons om snel een VSO op te stellen: ${inviteLink}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

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

  if (showInviteOnboarding) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 overflow-hidden">
        <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in-95 duration-700">
          <div className="text-center space-y-4">
            <div className="inline-flex w-24 h-24 bg-white rounded-[40px] items-center justify-center shadow-2xl mb-2 relative">
               <div className="absolute inset-0 bg-blue-500 rounded-[40px] animate-ping opacity-20"></div>
               <span className="text-5xl font-black text-blue-600 italic relative z-10">R</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 leading-tight">Laatste stap: <br/>Nodig {caseData.otherParty} uit</h1>
            <p className="text-slate-500 font-medium px-4">Je mediation dossier is aangemaakt. Om een geldige overeenkomst te sluiten moet de tegenpartij deelnemen via de unieke link.</p>
          </div>

          <Card className="p-8 space-y-8 bg-white border-none shadow-2xl rounded-[32px]">
             <div className="space-y-6">
                <Button 
                  onClick={shareWhatsApp}
                  className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white py-6 rounded-2xl font-black flex items-center justify-center gap-4 transition-all shadow-xl shadow-emerald-200 active:scale-95 animate-pulse-subtle"
                >
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.631 1.433h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  Deel via WhatsApp
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                  <div className="relative flex justify-center text-[10px] uppercase tracking-[0.3em] font-black text-slate-300"><span className="bg-white px-3">Of kopieer link</span></div>
                </div>

                <div 
                  onClick={copyInviteLink}
                  className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <code className="text-xs text-slate-400 font-mono truncate mr-4">{inviteLink}</code>
                  <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg ${hasCopied ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
                    {hasCopied ? 'Gereed' : 'Kopieer'}
                  </span>
                </div>
             </div>

             <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 text-slate-400">
                  <ICONS.Check className="w-4 h-4 text-emerald-500" />
                  <p className="text-[10px] font-bold uppercase tracking-widest">Gratis voor tegenpartij</p>
                </div>
                <div className="flex items-center gap-3 text-slate-400">
                  <ICONS.Check className="w-4 h-4 text-emerald-500" />
                  <p className="text-[10px] font-bold uppercase tracking-widest">Beveiligde omgeving</p>
                </div>
             </div>
          </Card>

          <button 
            onClick={() => setShowInviteOnboarding(false)}
            className="w-full text-[10px] font-black text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-[0.3em]"
          >
            Ik heb de link gedeeld, ga verder
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      <header className="px-6 py-4 bg-white border-b border-slate-100 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100">
            <span className="text-white text-base font-black italic">R</span>
          </div>
          <div>
            <h1 className="text-sm font-black text-slate-900 truncate max-w-[140px]">{caseData.title}</h1>
            <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1.5">
               <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
               Wachten op tegenpartij
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="rounded-xl border-slate-200" onClick={() => setShowInviteOnboarding(true)}>
             Link
          </Button>
        </div>
      </header>

      {/* Persistent Status Bar */}
      <div className="bg-slate-900 text-white px-6 py-3 flex justify-between items-center z-20">
         <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Nodig {caseData.otherParty} uit via WhatsApp</p>
         </div>
         <button onClick={shareWhatsApp} className="text-[10px] font-black uppercase tracking-widest text-blue-400">Verstuur nu</button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
        {messages.map(m => (
          <ChatBubble key={m.id} text={m.text} isOwn={m.isOwn} sender={m.sender} timestamp={m.timestamp} />
        ))}
        <div ref={scrollRef} />
      </div>

      <div className="p-4 bg-white border-t border-slate-100">
        <div className="flex gap-3 max-w-2xl mx-auto w-full">
          <input 
            className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all placeholder:text-slate-400 font-medium"
            placeholder="Beschrijf je standpunt aan de mediator..."
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
