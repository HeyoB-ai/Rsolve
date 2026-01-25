
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChatBubble } from '../components/ui/ChatBubble';
import { Button } from '../components/ui/Button';
import { ICONS, UI_TRANSLATIONS } from '../constants';
import { Logo } from '../components/ui/Logo';
import { geminiService } from '../services/geminiService';
import { supabase } from '../lib/supabase';
import { Card } from '../components/ui/Card';

interface MediationProps {
  caseData: any;
  appLanguage: string;
  setAppLanguage: (lang: string) => void;
  t: (key: string, params?: any) => string;
  onResolve: (vso: any) => void;
}

const Mediation: React.FC<MediationProps> = ({ caseData, appLanguage, setAppLanguage, t, onResolve }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isRespondentJoined, setIsRespondentJoined] = useState(false);
  const [displayMode, setDisplayMode] = useState<'single' | 'dual'>('single');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // VSO Flow States
  const [isVSOReviewOpen, setIsVSOReviewOpen] = useState(false);
  const [vsoConcept, setVsoConcept] = useState<string | null>(null);
  const [isGeneratingVSO, setIsGeneratingVSO] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check of de mediator heeft aangegeven dat het tijd is voor de VSO
  const showFinalizePrompt = useMemo(() => {
    if (messages.length < 4) return false;
    const lastMediatorMsgs = messages.filter(m => m.senderId === 'mediator').slice(-2);
    const keywords = ['vso', 'overeenkomst', 'akkoord', 'onderteken', 'afronden', 'vastleggen'];
    return lastMediatorMsgs.some(m => keywords.some(k => m.text.toLowerCase().includes(k)));
  }, [messages]);

  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('case_id', caseData.id)
        .order('created_at', { ascending: true });
      
      if (data) {
        setMessages(data.map(m => ({
          id: m.id,
          text: m.content,
          sender: m.sender_name,
          senderId: m.sender_id,
          timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: m.type,
          attachment: m.attachment_url ? { url: m.attachment_url, name: 'Bijlage', type: 'image/jpeg' } : null
        })));
      }
    };

    fetchMessages();
  }, [caseData.id]);

  useEffect(() => {
    const channel = supabase
      .channel(`case_${caseData.id}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages', 
        filter: `case_id=eq.${caseData.id}` 
      }, (payload) => {
        const newMessage = payload.new;
        setMessages(prev => {
          if (prev.find(m => m.id === newMessage.id)) return prev;
          return [...prev, {
            id: newMessage.id,
            text: newMessage.content,
            sender: newMessage.sender_name,
            senderId: newMessage.sender_id,
            timestamp: new Date(newMessage.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: newMessage.type,
            attachment: newMessage.attachment_url ? { url: newMessage.attachment_url, name: 'Bijlage', type: 'image/jpeg' } : null
          }];
        });
      })
      .subscribe();

    const presenceChannel = supabase.channel(`presence_${caseData.id}`, {
      config: { presence: { key: caseData.isRespondent ? 'respondent' : 'initiator' } }
    });

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        const otherRole = caseData.isRespondent ? 'initiator' : 'respondent';
        setIsRespondentJoined(!!state[otherRole]);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({ online_at: new Date().toISOString() });
        }
      });

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(presenceChannel);
    };
  }, [caseData.id, caseData.isRespondent]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAiThinking, showFinalizePrompt]);

  const evidenceList = useMemo(() => {
    return messages.filter(m => m.attachment).map(m => ({ ...m.attachment, sender: m.sender, timestamp: m.timestamp }));
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    const textToSend = inputValue;
    setInputValue('');

    const { data: userMsg, error } = await supabase.from('messages').insert([{
      case_id: caseData.id,
      sender_id: caseData.isRespondent ? 'respondent' : 'initiator',
      sender_name: caseData.isRespondent ? (caseData.respondentName || 'Tegenpartij') : t('you'),
      content: textToSend,
      type: 'text'
    }]).select().single();

    if (error) return;

    setIsAiThinking(true);
    const chatHistory = [...messages, { sender: caseData.isRespondent ? 'Respondent' : 'Initiator', text: textToSend }]
      .slice(-15)
      .map(m => ({ sender: m.sender, text: m.text }));

    try {
      const aiResponse = await geminiService.generateMediatorResponse(chatHistory, caseData.title);
      await supabase.from('messages').insert([{
        case_id: caseData.id,
        sender_id: 'mediator',
        sender_name: t('mediator'),
        content: aiResponse,
        type: 'text'
      }]);
    } catch (e) {
      console.error("AI Error:", e);
    } finally {
      setIsAiThinking(false);
    }
  };

  const startVSOFlow = async () => {
    setIsGeneratingVSO(true);
    setIsVSOReviewOpen(true);
    
    const chatHistory = messages
      .filter(m => m.type === 'text')
      .map(m => ({ sender: m.sender, text: m.text }));

    try {
      const terms = await geminiService.generateVSOTerms(chatHistory, caseData.title);
      setVsoConcept(terms);
    } catch (e) {
      setVsoConcept("Er kon geen automatische samenvatting gemaakt worden.");
    } finally {
      setIsGeneratingVSO(false);
    }
  };

  const handleVSOPrefix = () => {
    const vsoData = {
      title: caseData.title,
      parties: `${caseData.isRespondent ? 'Tegenpartij' : 'Jij'} en ${caseData.isRespondent ? 'Jij' : caseData.otherParty}`,
      terms: vsoConcept,
      date: new Date().toLocaleDateString('nl-NL')
    };
    onResolve(vsoData);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      await supabase.from('messages').insert([{
        case_id: caseData.id,
        sender_id: caseData.isRespondent ? 'respondent' : 'initiator',
        sender_name: caseData.isRespondent ? (caseData.respondentName || 'Tegenpartij') : t('you'),
        content: `Heeft een bijlage gestuurd: ${file.name}`,
        type: 'attachment',
        attachment_url: base64String
      }]);
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="h-safe flex flex-col bg-slate-50 overflow-hidden relative">
      {/* VSO Review Modal */}
      {isVSOReviewOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
           <Card className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border-none">
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <ICONS.Check className="w-5 h-5 text-emerald-500" />
                  <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Controleer Afspraken</h2>
                </div>
                <button onClick={() => setIsVSOReviewOpen(false)} className="p-2 text-slate-400"><ICONS.X /></button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8">
                 {isGeneratingVSO ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-4">
                       <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                       <p className="text-sm font-black text-slate-400 uppercase tracking-widest text-center animate-pulse">De AI stelt het document op...</p>
                    </div>
                 ) : (
                    <div className="space-y-6">
                       <p className="text-xs text-slate-500 font-medium leading-relaxed">
                          Op basis van jullie gesprek heeft de mediator de volgende afspraken geformuleerd. Lees ze goed door voordat je het document definitief maakt.
                       </p>
                       <div className="bg-slate-50 p-6 rounded-2xl border-l-4 border-blue-600 font-serif italic text-slate-700 leading-relaxed shadow-inner whitespace-pre-wrap">
                          {vsoConcept}
                       </div>
                       <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex gap-3">
                          <ICONS.Check className="w-5 h-5 text-emerald-600 shrink-0" />
                          <p className="text-[10px] text-emerald-800 font-bold leading-tight">
                             Door te bevestigen wordt er een officieel VSO document gegenereerd dat als bewijs dient van jullie afspraken.
                          </p>
                       </div>
                    </div>
                 )}
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex flex-col gap-3 shrink-0">
                 <Button 
                   size="lg" 
                   className="w-full rounded-2xl py-4 shadow-xl shadow-blue-100" 
                   disabled={isGeneratingVSO}
                   onClick={handleVSOPrefix}
                 >
                    Bevestig & Naar Ondertekening
                 </Button>
                 <button 
                   onClick={() => setIsVSOReviewOpen(false)}
                   className="text-xs font-black text-slate-400 uppercase tracking-widest py-2"
                 >
                    Terug naar gesprek
                 </button>
              </div>
           </Card>
        </div>
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">{t('settings')}</h2>
              <button onClick={() => setIsSettingsOpen(false)} className="p-2 text-slate-400"><ICONS.X /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 gap-2">
              {Object.keys(UI_TRANSLATIONS).map(langKey => (
                <button 
                  key={langKey}
                  onClick={() => { setAppLanguage(langKey); setIsSettingsOpen(false); }}
                  className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${appLanguage === langKey ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold shadow-sm' : 'border-slate-100 text-slate-600 hover:bg-slate-50'}`}
                >
                  <span className="text-sm">{UI_TRANSLATIONS[langKey].label}</span>
                  {appLanguage === langKey && <ICONS.Check className="w-4 h-4 text-blue-600" />}
                </button>
              ))}
            </div>
            <div className="p-6 border-t border-slate-100 shrink-0">
              <Button variant="primary" className="w-full rounded-2xl" onClick={() => setIsSettingsOpen(false)}>{t('close')}</Button>
            </div>
          </div>
        </div>
      )}

      <header className="px-5 py-3 bg-white border-b border-slate-100 flex items-center justify-between z-30 shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <Logo className="w-8 h-8" />
          <div className="overflow-hidden">
            <h1 className="text-xs font-black text-slate-900 truncate max-w-[120px] uppercase tracking-tight">{caseData.title}</h1>
            <div className="flex items-center gap-1.5">
               <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-500 ${isRespondentJoined ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-amber-400 animate-pulse'}`} />
               <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                  {caseData.isRespondent ? 'Initiator' : caseData.otherParty} {isRespondentJoined ? t('online') : `${t('waiting')}...`}
               </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {messages.length > 5 && isRespondentJoined && (
            <button 
              onClick={startVSOFlow}
              className={`px-3 py-2 ${showFinalizePrompt ? 'bg-emerald-500 animate-bounce' : 'bg-slate-900'} text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all`}
            >
              Rond af
            </button>
          )}
          <button onClick={() => setIsSettingsOpen(true)} className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl text-slate-600 border border-slate-100 active:scale-95 transition-all">
            <ICONS.Globe className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">{UI_TRANSLATIONS[appLanguage].label}</span>
          </button>
          <button onClick={() => setIsDossierOpen(true)} className="relative p-2 bg-slate-50 rounded-xl text-slate-600 border border-slate-100 active:scale-95 transition-all">
            <ICONS.Folder className="w-5 h-5" />
            {evidenceList.length > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-white text-[8px] font-black rounded-full flex items-center justify-center">{evidenceList.length}</span>}
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(m => {
          const isActuallyOwn = (caseData.isRespondent && m.senderId === 'respondent') || (!caseData.isRespondent && m.senderId === 'initiator');

          if (m.type === 'system') return <div key={m.id} className="text-center py-2"><span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">{m.text}</span></div>;
          
          return (
            <ChatBubble 
              key={m.id} 
              text={m.text} 
              isOwn={isActuallyOwn} 
              sender={m.sender} 
              timestamp={m.timestamp} 
              attachment={m.attachment} 
              autoTranslateTo={displayMode === 'dual' ? UI_TRANSLATIONS[appLanguage].label : null} 
              targetLanguageName={UI_TRANSLATIONS[appLanguage].label}
            />
          );
        })}
        
        {isAiThinking && (
          <div className="flex flex-col items-start max-w-[85%] self-start animate-in fade-in slide-in-from-left-2">
            <span className="text-[10px] font-black text-slate-400 mb-1 ml-2 uppercase tracking-widest">{t('mediator')} is aan het typen...</span>
            <div className="bg-white border border-slate-100 px-4 py-3 rounded-[20px] rounded-bl-none shadow-sm flex gap-1">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" />
            </div>
          </div>
        )}

        {/* Afronding Prompt in Chat */}
        {showFinalizePrompt && (
          <div className="animate-in slide-in-from-bottom-4 fade-in duration-500 delay-300">
            <Card className="bg-emerald-50 border-emerald-200 border-2 p-6 rounded-[32px] text-center space-y-4 shadow-xl shadow-emerald-100/50">
               <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <ICONS.Check className="w-6 h-6" />
               </div>
               <div className="space-y-1">
                  <h3 className="text-sm font-black text-emerald-900 uppercase tracking-widest">Akkoord gedetecteerd</h3>
                  <p className="text-xs text-emerald-700 font-medium">De mediator heeft de afspraken samengevat. Klik hieronder om de officiële VSO te genereren en te ondertekenen.</p>
               </div>
               <Button 
                  onClick={startVSOFlow}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl shadow-xl shadow-emerald-200 flex items-center justify-center gap-2 group"
               >
                  <span>Bekijk & Onderteken VSO</span>
                  <ICONS.ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
               </Button>
            </Card>
          </div>
        )}

        <div ref={scrollRef} className="h-4" />
      </div>

      <div className="bg-white border-t border-slate-100 px-4 pt-3 pb-safe shrink-0 shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
        <div className="flex gap-2 max-w-2xl mx-auto w-full items-end pb-2">
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*,video/*,.pdf,.doc,.docx" />
          <button onClick={() => fileInputRef.current?.click()} disabled={isUploading || isAiThinking} className="p-3 rounded-2xl bg-slate-100 text-slate-500 shrink-0 mb-0.5"><ICONS.Paperclip className="w-5 h-5" /></button>
          <textarea className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-400 font-medium resize-none max-h-32" placeholder={t('placeholder')} rows={1} value={inputValue} onChange={e => setInputValue(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }} />
          <Button size="icon" className="rounded-2xl w-12 h-12 shadow-lg shadow-blue-100 shrink-0" onClick={handleSend} disabled={!inputValue.trim() || isAiThinking}><svg className="w-5 h-5 -rotate-45" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg></Button>
        </div>
      </div>
    </div>
  );
};

export default Mediation;
