
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
    { id: '2', text: `Ik ben je Rsolve Mediator. Zodra ${caseData.otherParty} deelneemt aan dit gesprek, kunnen we starten met de officiële bemiddeling.`, isOwn: false, sender: "Mediator", timestamp: "Nu" },
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
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-white overflow-hidden">
        <div className="w-full max-w-md space-y-10 animate-in fade-in zoom-in-95 duration-700">
          <header className="text-center space-y-4">
            <div className="inline-flex w-20 h-20 bg-emerald-500 rounded-[32px] items-center justify-center shadow-2xl shadow-emerald-500/20 mb-2 rotate-3">
               <ICONS.Plus className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-black tracking-tight leading-tight">Nodig {caseData.otherParty} uit om te starten</h1>
            <p className="text-slate-400 font-medium px-4">Zonder de tegenpartij kunnen we geen bindende afspraken maken. Deel de unieke link.</p>
          </header>

          <div className="space-y-4">
            {/* WhatsApp is de focus */}
            <button 
              onClick={shareWhatsApp}
              className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white py-6 rounded-3xl font-black flex items-center justify-center gap-4 transition-all shadow-xl shadow-emerald-900/40 active:scale-95 group"
            >
              <svg className="w-8 h-8 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.631 1.433h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Stuur via WhatsApp
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-white/10"></div>
              <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Of kopieer link</span>
              <div className="flex-1 h-px bg-white/10"></div>
            </div>

            <div 
              onClick={copyInviteLink}
              className="group cursor-pointer bg-white/5 border border-white/10 p-5 rounded-3xl flex items-center justify-between hover:bg-white/10 transition-all active:scale-[0.98]"
            >
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1">Unieke Uitnodigingslink</span>
                <code className="text-xs text-slate-300 font-mono truncate max-w-[200px]">{inviteLink}</code>
              </div>
              <div className={`p-3 rounded-2xl transition-all ${hasCopied ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white'}`}>
                {hasCopied ? <ICONS.Check className="w-5 h-5" /> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/></svg>}
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/5">
            <Button 
              variant="ghost" 
              className="w-full text-slate-500 hover:text-white transition-colors py-4 font-black uppercase tracking-widest text-xs"
              onClick={() => setShowInviteOnboarding(false)}
            >
              Ga naar de mediator chat
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      <header className="px-6 py-4 bg-white border-b border-slate-100 flex items-center justify-between sticky top-0 z-10">
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
             <ICONS.Plus className="w-4 h-4 mr-1" /> Nodig uit
          </Button>
        </div>
      </header>

      {/* Persistent Warning Banner */}
      <div className="bg-blue-600 text-white px-6 py-3 flex justify-between items-center shadow-lg relative z-20">
         <div className="flex items-center gap-3">
            <div className="p-1 bg-white/20 rounded-lg">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest">Dossier is nog niet volledig</p>
         </div>
         <button onClick={shareWhatsApp} className="text-[10px] font-black uppercase tracking-widest bg-white text-blue-600 px-4 py-2 rounded-xl shadow-sm">Stuur via WA</button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
        <div className="text-center py-4">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Beveiligde Chat Gestart</span>
        </div>
        {messages.map(m => (
          <ChatBubble key={m.id} text={m.text} isOwn={m.isOwn} sender={m.sender} timestamp={m.timestamp} />
        ))}
        <div ref={scrollRef} />
      </div>

      <div className="p-4 bg-white border-t border-slate-100">
        <div className="flex gap-3 max-w-2xl mx-auto w-full">
          <input 
            className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all placeholder:text-slate-400 font-medium"
            placeholder="Beschrijf je standpunt..."
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
