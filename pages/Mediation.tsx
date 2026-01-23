
import React, { useState, useEffect, useRef } from 'react';
import { ChatBubble } from '../components/ui/ChatBubble';
import { Button } from '../components/ui/Button';
import { ICONS } from '../constants';
import { Card } from '../components/ui/Card';

const Mediation: React.FC<{ caseData: any, onResolve: (vso: any) => void }> = ({ caseData, onResolve }) => {
  const [showInviteOnboarding, setShowInviteOnboarding] = useState(true);
  const [hasCopied, setHasCopied] = useState(false);
  const [messages, setMessages] = useState([
    { id: '1', text: `Betaling ontvangen. Welkom in je beveiligde mediation omgeving voor: ${caseData.title}.`, isOwn: false, sender: "Rsolve Mediator", timestamp: "Nu" },
    { id: '2', text: `Ik ben je AI mediator. Zodra ${caseData.otherParty} de uitnodiging accepteert, kunnen we samen toewerken naar een VSO die voor beide partijen eerlijk is.`, isOwn: false, sender: "Rsolve Mediator", timestamp: "Nu" },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isGeneratingVSO, setIsGeneratingVSO] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const inviteLink = `https://rsolve.app/invite/${caseData.title.toLowerCase().replace(/\s+/g, '-')}-${Math.random().toString(36).substr(2, 5)}`;

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 3000);
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(`Hoi! Ik heb een mediation dossier aangemaakt via Rsolve om ons conflict "${caseData.title}" op te lossen. Doe je mee? Het is voor jou gratis: ${inviteLink}`);
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
    
    setTimeout(() => {
        setMessages(prev => [...prev, {
            id: (Date.now() + 1).toString(),
            text: "Helder punt. Ik noteer dit als onderdeel van jouw standpunt. Hoe denk je dat de tegenpartij hier tegenaan kijkt?",
            isOwn: false,
            sender: "Rsolve Mediator",
            timestamp: "Zojuist"
        }]);
    }, 1500);
  };

  const handleFinalize = async () => {
    setIsGeneratingVSO(true);
    setTimeout(() => {
      onResolve({
        title: caseData.title,
        parties: `Jij en ${caseData.otherParty}`,
        terms: caseData.goal,
        date: new Date().toLocaleDateString('nl-NL')
      });
      setIsGeneratingVSO(false);
    }, 2500);
  };

  if (showInviteOnboarding) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-white overflow-hidden">
        <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in-95 duration-500">
          <div className="text-center space-y-4">
            <div className="inline-flex w-16 h-16 bg-blue-600 rounded-[24px] items-center justify-center shadow-2xl shadow-blue-500/20 mb-2">
               <ICONS.Plus className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-black tracking-tight">Stap 1: Nodig {caseData.otherParty} uit</h1>
            <p className="text-slate-400 font-medium">Betaling geslaagd! Om dit conflict op te lossen hebben we de medewerking van de tegenpartij nodig.</p>
          </div>

          <Card className="bg-white/5 border-white/10 p-6 space-y-6 backdrop-blur-md rounded-[32px]">
             <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between">
                   <code className="text-[10px] text-blue-400 font-mono truncate mr-4">{inviteLink}</code>
                   <button 
                     onClick={copyInviteLink}
                     className={`shrink-0 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${hasCopied ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                   >
                     {hasCopied ? 'Gekopieerd!' : 'Kopieer'}
                   </button>
                </div>

                <div className="grid grid-cols-1 gap-3">
                   <button 
                     onClick={shareWhatsApp}
                     className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white py-4 rounded-2xl font-black flex items-center justify-center gap-3 transition-all shadow-lg shadow-emerald-900/20"
                   >
                     <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.631 1.433h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                     Deel via WhatsApp
                   </button>
                </div>
             </div>

             <div className="pt-4 border-t border-white/10 space-y-4">
                <div className="flex items-start gap-3">
                   <div className="bg-blue-500/20 rounded-full p-1 mt-0.5"><ICONS.Check className="w-3 h-3 text-blue-400" /></div>
                   <p className="text-[10px] text-slate-400 font-bold leading-relaxed uppercase tracking-wider">Deelname is voor de tegenpartij 100% gratis</p>
                </div>
                <div className="flex items-start gap-3">
                   <div className="bg-blue-500/20 rounded-full p-1 mt-0.5"><ICONS.Check className="w-3 h-3 text-blue-400" /></div>
                   <p className="text-[10px] text-slate-400 font-bold leading-relaxed uppercase tracking-wider">Privacy is gewaarborgd via ons beveiligde kanaal</p>
                </div>
             </div>
          </Card>

          <Button 
            variant="ghost" 
            className="w-full text-slate-500 hover:text-white transition-colors py-4 font-black uppercase tracking-widest text-xs"
            onClick={() => setShowInviteOnboarding(false)}
          >
            Ik heb de link gedeeld, start mediation
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <header className="px-6 py-4 bg-white border-b border-slate-100 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-black">R</span>
          </div>
          <div>
            <h1 className="text-sm font-black text-slate-900 truncate max-w-[150px]">{caseData.title}</h1>
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest flex items-center gap-1">
               <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
               Wachten op tegenpartij
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowInviteOnboarding(true)}>
             <ICONS.Plus className="w-3 h-3 mr-2" /> Link
          </Button>
          <Button variant="primary" size="sm" onClick={handleFinalize} isLoading={isGeneratingVSO}>
            VSO Maken
          </Button>
        </div>
      </header>

      {/* Persistent invite reminder if still alone */}
      <div className="bg-blue-600 text-white px-6 py-2 flex justify-between items-center animate-in slide-in-from-top duration-700">
         <p className="text-[9px] font-black uppercase tracking-widest">Vergeet niet {caseData.otherParty} uit te nodigen</p>
         <button onClick={shareWhatsApp} className="text-[9px] font-black uppercase tracking-widest bg-white/20 px-2 py-1 rounded-md">Deel via WA</button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map(m => (
          <ChatBubble key={m.id} text={m.text} isOwn={m.isOwn} sender={m.sender} timestamp={m.timestamp} />
        ))}
        <div ref={scrollRef} />
      </div>

      <div className="p-4 bg-white border-t border-slate-100 pb-safe">
        <div className="flex gap-2 max-w-2xl mx-auto w-full">
          <input 
            className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
            placeholder="Beschrijf je standpunt aan de mediator..."
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleSend()}
          />
          <Button size="icon" className="rounded-full w-12 h-12 shadow-lg" onClick={handleSend}>
            <svg className="w-5 h-5 -rotate-45" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Mediation;
