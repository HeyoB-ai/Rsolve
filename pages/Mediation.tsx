
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
  onAbandon: () => void;
}

const Mediation: React.FC<MediationProps> = ({ caseData, appLanguage, setAppLanguage, t, onResolve, onAbandon }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isRespondentJoined, setIsRespondentJoined] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [isLeavingLoading, setIsLeavingLoading] = useState(false);
  
  // VSO Flow States
  const [isVSOReviewOpen, setIsVSOReviewOpen] = useState(false);
  const [vsoConcept, setVsoConcept] = useState<string | null>(null);
  const [isGeneratingVSO, setIsGeneratingVSO] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const dossierItems = useMemo(() => {
    return messages.filter(m => m.type === 'attachment' && m.attachment);
  }, [messages]);

  const myName = caseData.isRespondent ? (caseData.respondentName || 'Tegenpartij') : (caseData.initiatorName || 'Initiator');
  const otherPartyName = caseData.isRespondent ? (caseData.initiatorName || 'Initiator') : caseData.otherParty;

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const sendNotification = (title: string, body: string) => {
    if ("Notification" in window && Notification.permission === "granted" && document.visibilityState !== 'visible') {
      new Notification(title, { body, icon: '/logo.png' });
    }
  };

  useEffect(() => {
    const fetchMessages = async () => {
      const { data } = await supabase
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
          attachment: m.attachment_url ? { url: m.attachment_url, name: m.content.replace('Heeft een bijlage gestuurd: ', ''), type: 'image/jpeg' } : null
        })));
      }
    };
    fetchMessages();
  }, [caseData.id]);

  useEffect(() => {
    const channel = supabase
      .channel(`case_${caseData.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `case_id=eq.${caseData.id}` }, (payload) => {
        const newMessage = payload.new;
        const isActuallyOwn = (caseData.isRespondent && newMessage.sender_id === 'respondent') || (!caseData.isRespondent && newMessage.sender_id === 'initiator');
        
        if (!isActuallyOwn) {
          sendNotification(`Nieuw bericht in Rsolve`, `${newMessage.sender_name}: ${newMessage.content.substring(0, 50)}...`);
        }

        setMessages(prev => {
          if (prev.find(m => m.id === newMessage.id)) return prev;
          return [...prev, {
            id: newMessage.id,
            text: newMessage.content,
            sender: newMessage.sender_name,
            senderId: newMessage.sender_id,
            timestamp: new Date(newMessage.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: newMessage.type,
            attachment: newMessage.attachment_url ? { url: newMessage.attachment_url, name: newMessage.content.replace('Heeft een bijlage gestuurd: ', ''), type: 'image/jpeg' } : null
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
        if (status === 'SUBSCRIBED') await presenceChannel.track({ online_at: new Date().toISOString() });
      });

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(presenceChannel);
    };
  }, [caseData.id, caseData.isRespondent]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAiThinking]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    const textToSend = inputValue;
    setInputValue('');

    const { error } = await supabase.from('messages').insert([{
      case_id: caseData.id,
      sender_id: caseData.isRespondent ? 'respondent' : 'initiator',
      sender_name: myName, 
      content: textToSend,
      type: 'text'
    }]);

    if (error) return;

    setIsAiThinking(true);
    const chatHistory = [...messages, { sender: myName, text: textToSend }]
      .slice(-15)
      .map(m => ({ sender: m.sender, text: m.text }));

    try {
      const contextTitle = `${caseData.title}`;
      let aiResponse = await geminiService.generateMediatorResponse(chatHistory, contextTitle);
      
      const hasActionTrigger = aiResponse.includes('[ACTION:GENERATE_VSO]');
      const cleanResponse = aiResponse.replace('[ACTION:GENERATE_VSO]', '').trim();

      await supabase.from('messages').insert([{
        case_id: caseData.id,
        sender_id: 'mediator',
        sender_name: t('mediator'),
        content: cleanResponse,
        type: 'text'
      }]);

      if (hasActionTrigger) {
        setTimeout(() => startVSOFlow(), 1500);
      }
    } catch (e) {
      console.error("AI Error:", e);
    } finally {
      setIsAiThinking(false);
    }
  };

  const handleConfirmLeave = async () => {
    setIsLeavingLoading(true);
    try {
      await supabase.from('messages').insert([{
        case_id: caseData.id, sender_id: 'system', sender_name: t('system'),
        content: `${myName} heeft de mediation verlaten.`, type: 'system'
      }]);
      onAbandon();
    } catch (err) { onAbandon(); } finally {
      setIsLeavingLoading(false);
      setIsExitModalOpen(false);
    }
  };

  const startVSOFlow = async () => {
    setIsGeneratingVSO(true);
    setIsVSOReviewOpen(true);
    const chatHistory = messages.filter(m => m.type === 'text').map(m => ({ sender: m.sender, text: m.text }));
    try {
      const terms = await geminiService.generateVSOTerms(chatHistory, caseData.title);
      setVsoConcept(terms);
    } catch (e) {
      setVsoConcept("Fout bij opstellen. Probeer het opnieuw.");
    } finally {
      setIsGeneratingVSO(false);
    }
  };

  const handleVSOPrefix = () => {
    onResolve({
      caseId: caseData.id, title: caseData.title,
      parties: `${caseData.initiatorName} en ${caseData.otherParty}`,
      terms: vsoConcept, date: new Date().toLocaleDateString('nl-NL')
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      await supabase.from('messages').insert([{
        case_id: caseData.id, sender_id: caseData.isRespondent ? 'respondent' : 'initiator',
        sender_name: myName, content: `Heeft een bijlage gestuurd: ${file.name}`,
        type: 'attachment', attachment_url: reader.result as string
      }]);
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="h-safe flex flex-col bg-slate-50 overflow-hidden relative">
      {isDossierOpen && (
        <div className="fixed inset-0 z-[115] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <Card className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] border-none">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3 text-slate-900">
                <ICONS.Folder className="w-5 h-5 text-blue-600" />
                <h2 className="text-sm font-black uppercase tracking-widest">{t('dossier')}</h2>
              </div>
              <button onClick={() => setIsDossierOpen(false)} className="p-2 text-slate-400"><ICONS.X /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {dossierItems.length > 0 ? (
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{dossierItems.length} {t('items_collected')}</p>
                  <div className="grid grid-cols-1 gap-3">
                    {dossierItems.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                        <div className="w-12 h-12 bg-white rounded-xl overflow-hidden border border-slate-200 shrink-0 shadow-sm">
                          {item.attachment.type.startsWith('image/') ? <img src={item.attachment.url} className="w-full h-full object-cover" /> : <ICONS.File className="w-full h-full p-2 text-slate-300" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-900 truncate">{item.attachment.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{item.sender} • {item.timestamp}</p>
                        </div>
                        <a href={item.attachment.url} download={item.attachment.name} className="p-2 bg-white rounded-lg text-blue-600 border border-slate-200"><ICONS.ChevronRight className="w-4 h-4" /></a>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center gap-4 text-slate-400">
                  <ICONS.Folder className="w-12 h-12 opacity-20" />
                  <p className="text-sm font-medium">{t('no_evidence')}</p>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-slate-100 shrink-0">
              <Button variant="primary" className="w-full rounded-2xl" onClick={() => setIsDossierOpen(false)}>{t('close')}</Button>
            </div>
          </Card>
        </div>
      )}

      {isExitModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-slate-900/90 backdrop-blur-xl animate-in fade-in duration-300">
           <Card className="bg-white w-full max-w-sm rounded-[32px] shadow-2xl overflow-hidden flex flex-col p-8 border-none text-center gap-6">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg></div>
              <div className="space-y-2">
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Mediation Verlaten?</h2>
                <p className="text-sm text-slate-600 font-medium">Je kunt dit dossier dan niet meer openen.</p>
              </div>
              <div className="flex flex-col gap-3">
                 <Button variant="danger" className="w-full rounded-2xl py-4" onClick={handleConfirmLeave} isLoading={isLeavingLoading}>Ja, verlaat sessie</Button>
                 <Button variant="ghost" className="w-full rounded-2xl py-3 text-slate-500 font-black uppercase tracking-widest text-[10px]" onClick={() => setIsExitModalOpen(false)}>Nee, ga door</Button>
              </div>
           </Card>
        </div>
      )}

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
                       <p className="text-sm font-black text-slate-400 uppercase tracking-widest text-center animate-pulse">VSO Wordt Opgesteld...</p>
                    </div>
                 ) : (
                    <div className="space-y-6">
                       <div className="bg-slate-50 p-6 rounded-2xl border-l-4 border-blue-600 font-serif italic text-slate-700 leading-relaxed shadow-inner whitespace-pre-wrap">{vsoConcept}</div>
                    </div>
                 )}
              </div>
              <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex flex-col gap-3 shrink-0">
                 <Button size="lg" className="w-full rounded-2xl py-4 shadow-xl" disabled={isGeneratingVSO} onClick={handleVSOPrefix}>Deze Afspraken Bevestigen</Button>
              </div>
           </Card>
        </div>
      )}

      {isSettingsOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">{t('settings')}</h2>
              <button onClick={() => setIsSettingsOpen(false)} className="p-2 text-slate-400"><ICONS.X /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 gap-2">
              {Object.keys(UI_TRANSLATIONS).map(langKey => (
                <button key={langKey} onClick={() => { setAppLanguage(langKey); setIsSettingsOpen(false); }} className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${appLanguage === langKey ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold' : 'border-slate-100 text-slate-600'}`}>
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
               <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-500 ${isRespondentJoined ? 'bg-emerald-500' : 'bg-amber-400 animate-pulse'}`} />
               <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{otherPartyName} {isRespondentJoined ? t('online') : `${t('waiting')}...`}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 3 && isRespondentJoined && (
            <button onClick={startVSOFlow} className="px-3 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all">Afronden</button>
          )}
          <button onClick={() => setIsExitModalOpen(true)} className="px-3 py-2 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-red-100 active:scale-95 transition-all">Verlaat</button>
          <button onClick={() => setIsDossierOpen(true)} className="relative p-2 bg-slate-50 rounded-xl text-slate-600 border border-slate-100 active:scale-95 transition-all">
            <ICONS.Folder className="w-5 h-5" />
            {dossierItems.length > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-white text-[8px] font-black rounded-full flex items-center justify-center animate-bounce">{dossierItems.length}</span>}
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(m => {
          const isActuallyOwn = (caseData.isRespondent && m.senderId === 'respondent') || (!caseData.isRespondent && m.senderId === 'initiator');
          if (m.type === 'system') return (
            <div key={m.id} className="text-center py-2 px-6">
              <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.15em] leading-relaxed block">{m.text}</span>
            </div>
          );
          return (
            <ChatBubble key={m.id} text={m.text} isOwn={isActuallyOwn} sender={m.sender} senderRole={m.senderId} timestamp={m.timestamp} attachment={m.attachment} targetLanguageName={UI_TRANSLATIONS[appLanguage].label} />
          );
        })}
        {isAiThinking && (
          <div className="flex flex-col items-start max-w-[85%] self-start p-2 animate-in fade-in slide-in-from-left-2">
             <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]" />
             </div>
             <span className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.2em] animate-pulse">Mediator analyseert het gesprek...</span>
          </div>
        )}
        <div ref={scrollRef} className="h-4" />
      </div>

      <div className="bg-white border-t border-slate-100 px-4 pt-3 pb-safe shrink-0 shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
        <div className="flex gap-2 max-w-2xl mx-auto w-full items-end pb-2">
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*,video/*,.pdf,.doc,.docx" />
          <button onClick={() => fileInputRef.current?.click()} disabled={isUploading || isAiThinking} className="p-3 rounded-2xl bg-slate-100 text-slate-500 shrink-0 mb-0.5"><ICONS.Paperclip className="w-5 h-5" /></button>
          <textarea className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-400 font-medium resize-none max-h-32" placeholder={t('placeholder')} rows={1} value={inputValue} onChange={e => setInputValue(e.target.value)} />
          <Button size="icon" className="rounded-2xl w-12 h-12 shadow-lg" onClick={handleSend} disabled={!inputValue.trim() || isAiThinking}><svg className="w-5 h-5 -rotate-45" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg></Button>
        </div>
      </div>
    </div>
  );
};

export default Mediation;
