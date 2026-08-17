
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChatBubble } from '../components/ui/ChatBubble';
import { Button } from '../components/ui/Button';
import { ICONS, UI_TRANSLATIONS } from '../constants';
import { Logo } from '../components/ui/Logo';
import { geminiService } from '../services/geminiService';
import { supabase } from '../lib/supabase';
import { Card } from '../components/ui/Card';
import { LanguageSelector } from '../components/ui/LanguageSelector';
import { RsolveProWizard } from '../components/ui/RsolveProWizard';
import { StapVerderFlow } from '../components/ui/StapVerderFlow';
import { RealtimeChannel } from '@supabase/supabase-js';

// --- CONSTANTS ---
const SOUND_KEY = "rsolve_sound_enabled";
const TYPING_TIMEOUT_MS = 1200; 
const TYPING_THROTTLE_MS = 400; 
const POLLING_INTERVAL_MS = 4000; 

interface MediationProps {
  caseData: any;
  appLanguage: string;
  setAppLanguage: (lang: string) => void;
  t: (key: string, params?: any) => string;
  onResolve: (vsoData: any) => void;
  onAbandon: () => void;
}

const Mediation: React.FC<MediationProps> = ({ caseData, appLanguage, setAppLanguage, t, onResolve, onAbandon }) => {
  // --- STATE ---
  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  
  // Realtime & Presence
  const [partnerOnline, setPartnerOnline] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false); 
  const [isAiThinking, setIsAiThinking] = useState(false); 

  // Audio State
  const [soundEnabled, setSoundEnabled] = useState(() => localStorage.getItem(SOUND_KEY) !== "0");
  const [audioReady, setAudioReady] = useState(false);

  // UI Modals
  const [showLangSelector, setShowLangSelector] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showVSOModal, setShowVSOModal] = useState(false);
  const [isGeneratingVSO, setIsGeneratingVSO] = useState(false);
  const [vsoTerms, setVsoTerms] = useState('');

  // --- Rsolve Pro (Fase 4): wizard voor het overdrachtsdossier ---
  const [showProWizard, setShowProWizard] = useState(false);
  // --- "Stap verder": juridische doorverwijzing bij een vastgelopen gesprek ---
  const [showStapVerder, setShowStapVerder] = useState(false);

  // --- REFS ---
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioUnlockedRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Refs voor logica
  const lastProcessedMessageIdRef = useRef<string | null>(null);
  const isInitialLoadRef = useRef(true);
  const lastTypedTimeRef = useRef<number>(0);
  const typingTimeoutRef = useRef<any>(null);
  const partnerTypingTimeoutRef = useRef<any>(null);
  const isLocallyTypingRef = useRef(false);

  // Identity & Names Correction
  const isRespondent = !!caseData.isRespondent;
  const myName = isRespondent ? (caseData.respondentName || "Respondent") : (caseData.initiatorName || "Initiator");
  const partnerName = isRespondent ? (caseData.initiatorName || "Initiator") : (caseData.respondentName || caseData.otherParty || "Tegenpartij");
  const myRole = isRespondent ? 'respondent' : 'initiator';

  // --- AUDIO ENGINE ---
  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        audioCtxRef.current = new AudioContext();
      }
    }
  };

  const unlockAudio = useCallback(() => {
    if (audioUnlockedRef.current) return;
    initAudio();
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(e => console.error("[AUDIO] Resume failed", e));
    }
    try {
        const buffer = ctx.createBuffer(1, 1, 22050);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start(0);
        audioUnlockedRef.current = true;
        setAudioReady(true);
    } catch (e) {
        console.error("[AUDIO] Unlock buffer failed", e);
    }
  }, []);

  const playBeep = useCallback((reason: string) => {
    if (!soundEnabled) return;
    if (!audioCtxRef.current) initAudio();
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();
    try {
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, t);
      osc.frequency.exponentialRampToValueAtTime(300, t + 0.25);
      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      osc.start(t);
      osc.stop(t + 0.3);
    } catch (e) {
      console.error("[AUDIO] Play failed", e);
    }
  }, [soundEnabled]);

  const handleTestAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    unlockAudio();
    setTimeout(() => playBeep("user-test"), 50);
  };

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    localStorage.setItem(SOUND_KEY, newState ? "1" : "0");
    if (newState) unlockAudio();
  };

  useEffect(() => {
    const unlockHandler = () => {
        unlockAudio();
        if (audioUnlockedRef.current) {
            window.removeEventListener('pointerdown', unlockHandler);
            window.removeEventListener('keydown', unlockHandler);
        }
    };
    window.addEventListener('pointerdown', unlockHandler);
    window.addEventListener('keydown', unlockHandler);
    return () => {
        window.removeEventListener('pointerdown', unlockHandler);
        window.removeEventListener('keydown', unlockHandler);
        if (audioCtxRef.current) {
            audioCtxRef.current.close().catch(() => {});
        }
    };
  }, [unlockAudio]);

  // --- TYPING LOGIC ---
  const sendTypingBroadcast = async (isTyping: boolean) => {
    if (!channelRef.current) return;
    const now = Date.now();
    if (isTyping && now - lastTypedTimeRef.current < TYPING_THROTTLE_MS) return;
    lastTypedTimeRef.current = now;
    isLocallyTypingRef.current = isTyping;
    await channelRef.current.send({
      type: "broadcast",
      event: "typing",
      payload: { userId: myRole, typing: isTyping, ts: now }
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    if (!isLocallyTypingRef.current) {
        void sendTypingBroadcast(true);
    } else {
        void sendTypingBroadcast(true); 
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
        void sendTypingBroadcast(false);
    }, TYPING_TIMEOUT_MS);
  };

  const handleInputBlur = () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      void sendTypingBroadcast(false);
  };

  const fetchMessages = useCallback(async () => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('case_id', caseData.id)
      .order('created_at', { ascending: true });
    
    if (data) {
      setMessages(prev => {
        const pendingOptimistic = prev.filter(m => 
            m.id.toString().startsWith('temp-') && 
            !data.some(d => d.content === m.content && d.sender_id === m.sender_id)
        );
        const merged = [...data, ...pendingOptimistic];
        if (merged.length > 0) {
             const lastRealMsg = data[data.length - 1];
             if (lastRealMsg && lastRealMsg.id !== lastProcessedMessageIdRef.current) {
                 // Audio handled by realtime subscription
             }
        }
        return merged;
      });

      if (data.length > 0) {
        const lastId = data[data.length - 1].id;
        if (!lastId.toString().startsWith('temp-')) {
             lastProcessedMessageIdRef.current = lastId;
        }
      }

      const hasTrigger = data.some(m => m.content.includes('[TRIGGER:VSO]'));
      if (hasTrigger) {
          fetchCaseData();
          setShowVSOModal(true);
      }
      if (isInitialLoadRef.current) {
         setTimeout(() => { isInitialLoadRef.current = false; }, 1000);
      }
    }
  }, [caseData.id, myRole]);

  const fetchCaseData = async () => {
      const { data } = await supabase.from('cases').select('vso_terms, mediator_busy').eq('id', caseData.id).single();
      if (data) {
          if (data.vso_terms) setVsoTerms(data.vso_terms);
          if (typeof data.mediator_busy === 'boolean') setIsAiThinking(data.mediator_busy);
      }
  };

  useEffect(() => {
    fetchMessages();
    fetchCaseData();
    const interval = setInterval(() => { fetchMessages(); }, POLLING_INTERVAL_MS);
    const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
            fetchMessages();
            fetchCaseData();
        }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
        clearInterval(interval);
        document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fetchMessages]);

  useEffect(() => {
    const channel = supabase.channel(`case-${caseData.id}`, {
      config: { presence: { key: myRole } },
    });
    channelRef.current = channel;

    channel
      .on('postgres_changes', { 
        event: 'INSERT', schema: 'public', table: 'messages', filter: `case_id=eq.${caseData.id}` 
      }, (payload: any) => {
        const newMessage = payload.new;
        setMessages((prev) => {
            if (prev.some(m => m.id === newMessage.id)) return prev;
            const existsAsTemp = prev.findIndex(m => 
                m.id.toString().startsWith('temp-') && 
                m.content === newMessage.content && 
                m.sender_id === newMessage.sender_id
            );
            if (existsAsTemp !== -1) {
                const newArr = [...prev];
                newArr[existsAsTemp] = newMessage;
                return newArr;
            }
            return [...prev, newMessage];
        });

        if (newMessage.type === 'system' && newMessage.content.includes('[TRIGGER:VSO]')) {
            fetchCaseData();
            setShowVSOModal(true);
        }

        if (newMessage.sender_id !== myRole && newMessage.sender_id !== 'local-user') {
            setPartnerTyping(false);
            if (partnerTypingTimeoutRef.current) clearTimeout(partnerTypingTimeoutRef.current);
        }

        if (newMessage.id !== lastProcessedMessageIdRef.current) {
             lastProcessedMessageIdRef.current = newMessage.id;
             const isFromMe = newMessage.sender_id === myRole || newMessage.sender_id === 'local-user';
             if (!isInitialLoadRef.current && !isFromMe) {
                 playBeep("new_message");
             }
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'cases', filter: `id=eq.${caseData.id}` }, (payload: any) => {
          if (payload.new.vso_terms) {
              setVsoTerms(payload.new.vso_terms);
          }
          // De "mediator denkt na"-indicator volgt nu de server-side lock (mediator_busy),
          // zodat beide partijen hem zien terwijl het antwoord server-side wordt gemaakt.
          if (typeof payload.new.mediator_busy === 'boolean') {
              setIsAiThinking(payload.new.mediator_busy);
          }
      })
      .on('broadcast', { event: 'typing' }, (payload: any) => {
          const p = payload?.payload;
          if (!p || p.userId === myRole) return;
          if (p.typing === true) {
            setPartnerTyping(true);
            if (partnerTypingTimeoutRef.current) clearTimeout(partnerTypingTimeoutRef.current);
            partnerTypingTimeoutRef.current = setTimeout(() => { setPartnerTyping(false); }, TYPING_TIMEOUT_MS + 200);
          } else {
            setPartnerTyping(false);
            if (partnerTypingTimeoutRef.current) clearTimeout(partnerTypingTimeoutRef.current);
          }
      })
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const users = Object.keys(state);
        const others = users.filter(key => key !== myRole);
        setPartnerOnline(others.length > 0);
      })
      .subscribe(async (status: string) => {
        if (status === 'SUBSCRIBED') {
           await channel.track({ user: myRole, online_at: Date.now() });
        }
      });

    return () => {
      supabase.removeChannel(channel);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (partnerTypingTimeoutRef.current) clearTimeout(partnerTypingTimeoutRef.current);
    };
  }, [caseData.id, myRole, playBeep]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, partnerTyping, isAiThinking]);

  // --- ACTIONS ---
  const handleConfirmAbandon = async () => {
    if (isLeaving) return;
    setIsLeaving(true);
    try {
        const leaveMessage = `${myName} heeft de mediation sessie verlaten. De mediator informeert u: Het eenzijdig afbreken van mediation kan in een eventuele juridische vervolgprocedure nadelige gevolgen hebben (bijv. m.b.t. proceskosten). Dit dossier wordt hierbij gesloten.`;
        await supabase.from('messages').insert([{ case_id: caseData.id, sender_id: 'mediator', sender_name: 'Mediator', content: leaveMessage, type: 'system' }]);
        await new Promise(resolve => setTimeout(resolve, 500));
    } catch (err) { console.error("Error logging leave:", err); } finally { onAbandon(); }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const filePath = `${caseData.id}/${fileName}`;
      const { error: uploadError } = await supabase.storage.from('chat-uploads').upload(filePath, file);
      if (uploadError) throw uploadError;

      // Sla het OPSLAGPAD op i.p.v. een permanente publieke URL. De bucket is privé;
      // weergave gebeurt via tijdelijke signed links (functie sign-attachment) en de
      // mediator haalt het bestand server-side op met de service-role. Geen AI-call in de browser.
      const tempId = 'temp-' + Date.now();
      const tempMsg = { id: tempId, case_id: caseData.id, sender_id: myRole, sender_name: myName, content: file.name, attachment_url: filePath, type: 'attachment', created_at: new Date().toISOString() };
      setMessages(prev => [...prev, tempMsg]);
      const { data: insertedMsg } = await supabase.from('messages').insert([{ case_id: caseData.id, sender_id: myRole, sender_name: myName, content: file.name, attachment_url: filePath, type: 'attachment' }]).select().single();
      if (insertedMsg) setMessages(prev => prev.map(m => m.id === tempId ? insertedMsg : m));
    } catch (error) { console.error("Upload failed", error); alert("Upload mislukt."); fetchMessages(); } finally { setIsUploading(false); if (fileInputRef.current) fileInputRef.current.value = ''; }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    void sendTypingBroadcast(false);
    
    const textToSend = inputValue;
    setInputValue('');
    const tempId = 'temp-' + Date.now();
    const tempMsg = { id: tempId, case_id: caseData.id, sender_id: myRole, sender_name: myName, content: textToSend, type: 'text', created_at: new Date().toISOString() };
    setMessages(prev => [...prev, tempMsg]);

    const { data: insertedMsg, error } = await supabase.from('messages').insert([{ case_id: caseData.id, sender_id: myRole, sender_name: myName, content: textToSend, type: 'text' }]).select().single();
    if (error) { console.error("Failed to send", error); fetchMessages(); return; }
    if (insertedMsg) setMessages(prev => prev.map(m => m.id === tempId ? insertedMsg : m));

    // De mediator-reactie wordt server-side gegenereerd (Supabase webhook -> Netlify Function)
    // en komt via de realtime-subscription binnen. De "denkt na"-indicator volgt het veld
    // mediator_busy op het dossier. Geen AI-call meer in de browser.
  };

  const handleGenerateVSO = async () => {
    if (vsoTerms) return;
    setIsGeneratingVSO(true);
    const history = messages.map(m => ({ sender: m.sender_name, text: m.content }));
    const terms = await geminiService.generateVSOTerms(history, caseData.title);
    await supabase.from('cases').update({ vso_terms: terms }).eq('id', caseData.id);
    setVsoTerms(terms);
    setIsGeneratingVSO(false);
  };

  const finalizeVSO = () => {
    const initiatorName = isRespondent ? partnerName : myName;
    const respondentName = isRespondent ? myName : partnerName;
    const vsoData = {
      title: caseData.title,
      parties: `${initiatorName} en ${respondentName}`,
      initiatorName: initiatorName,
      respondentName: respondentName,
      isRespondent: isRespondent, 
      date: new Date().toLocaleDateString('nl-NL'),
      terms: vsoTerms,
      caseId: caseData.id
    };
    onResolve(vsoData);
  };

  const getAttachmentFromMessage = (m: any) => {
    if (m.type !== 'attachment' || !m.attachment_url) return undefined;
    const ext = m.attachment_url.split('.').pop()?.toLowerCase();
    let type = 'application/octet-stream';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) type = 'image/jpeg';
    else if (['pdf'].includes(ext)) type = 'application/pdf';
    else if (['mp4', 'mov'].includes(ext)) type = 'video/mp4';
    return { name: m.content || 'Bijlage', type, url: m.attachment_url };
  };

  return (
    // 'touch-none' hier toegevoegd om het bouncen op mobiel te voorkomen in de app
    <div className="rsolve-dark fixed inset-0 bg-slate-950 flex items-center justify-center touch-none">
      {/* 
        Container Logic: 
        - Op desktop: Een 'kaart' die gecentreerd is (max-w-3xl) met schaduw.
        - Op mobiel: Full screen (w-full h-full).
      */}
      <div className="w-full h-full md:max-w-3xl md:h-[90vh] md:max-h-[850px] bg-slate-900 md:rounded-[24px] md:shadow-2xl md:overflow-hidden relative flex flex-col border border-slate-800">

        {/* Header */}
        <header className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-3 overflow-hidden">
            <Logo className="w-8 h-8" />
            <div className="flex flex-col overflow-hidden">
              <h1 className="text-sm font-black text-white truncate max-w-[150px] sm:max-w-xs">{caseData.title}</h1>
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full transition-colors duration-500 ${partnerOnline ? 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-600'}`} />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">
                  {partnerOnline ? `${partnerName} ${t('online')}` : `${t('waiting')} ${partnerName}...`}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-800 rounded-full p-1 border border-slate-700">
               {soundEnabled && (
                  <button onClick={handleTestAudio} className={`text-[8px] font-bold uppercase tracking-widest px-2 py-1 rounded-full transition-colors ${audioReady ? 'text-emerald-400 bg-emerald-500/10' : 'text-amber-400 bg-amber-500/10 animate-pulse'}`}>
                     {audioReady ? 'Test' : 'Tap'}
                  </button>
               )}
               <button onClick={toggleSound} className={`p-2 rounded-full transition-all active:scale-95 ${soundEnabled ? 'text-cyan-400' : 'text-slate-500'}`}>
                  {soundEnabled ? <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg> : <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>}
              </button>
            </div>
            <button onClick={() => setShowLangSelector(true)} className="p-2 text-slate-400 hover:text-cyan-400 transition-colors">
              <ICONS.Globe className="w-5 h-5" />
            </button>
            <button onClick={() => setShowLeaveModal(true)} className="px-3 py-1.5 text-xs font-bold text-red-300 bg-red-500/15 hover:bg-red-500/25 rounded-lg transition-colors uppercase tracking-wider">
               {t('leave_btn_label') || "Stop"}
            </button>
          </div>
        </header>

        {/* Messages Container - touch-pan-y allows internal scrolling */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2 scroll-smooth scroll-container bg-slate-950/40 touch-pan-y">
          {messages.map((m) => {
            const isMe = m.sender_id === myRole || m.sender_id === 'local-user';
            const isSystem = m.type === 'system';
            if (isSystem) {
              const displayContent = m.content.replace('[TRIGGER:VSO]', '').trim();
              if (!displayContent) return null;
              return (
                <div key={m.id} className="flex justify-center my-4 animate-in fade-in zoom-in duration-500 px-4">
                  <span className="bg-slate-800/70 text-slate-300 text-[10px] font-bold px-4 py-2 rounded-xl text-center border border-slate-700 leading-relaxed max-w-xs">
                    {displayContent}
                  </span>
                </div>
              );
            }
            return (
              <ChatBubble 
                key={m.id} 
                text={m.content} 
                attachment={getAttachmentFromMessage(m)}
                isOwn={isMe}
                sender={m.sender_name}
                senderRole={
                  m.sender_id === 'mediator' ? 'mediator'
                  : m.sender_id === 'initiator' ? 'initiator'
                  : m.sender_id === 'respondent' ? 'respondent'
                  : m.sender_id === 'local-user' ? myRole
                  : undefined
                }
                timestamp={new Date(m.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} 
                autoTranslateTo={appLanguage}
                targetLanguageName={UI_TRANSLATIONS[appLanguage]?.label || 'Nederlands'}
              />
            );
          })}
          {(isAiThinking || partnerTyping) && (
            <div className="flex flex-col gap-1 ml-4 mt-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
               {partnerTyping && (
                  <div className="flex items-center gap-2 bg-slate-800 w-fit px-3 py-2 rounded-xl rounded-bl-none shadow-sm">
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">{partnerName} {t('typing_indicator')}</span>
                    <div className="flex gap-1">
                      <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" />
                      <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce delay-75" />
                      <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce delay-150" />
                    </div>
                  </div>
               )}
               {isAiThinking && !partnerTyping && (
                 <div className="flex items-center gap-2 text-cyan-300 text-[10px] font-bold bg-cyan-500/10 w-fit px-3 py-2 rounded-full border border-cyan-400/20">
                    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
                    <span className="uppercase tracking-wider">{t('mediator_thinking')}</span>
                 </div>
               )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        {/* pb-[env(safe-area-inset-bottom)] zorgt ervoor dat het niet achter de home-bar op iPhone verdwijnt */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <div className="relative flex items-end gap-2 max-w-4xl mx-auto">
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleFileSelect} 
              accept="image/*,application/pdf"
            />
            <Button 
              size="icon" 
              variant="secondary"
              className="rounded-full w-12 h-12 shrink-0 bg-slate-800 text-slate-300 hover:bg-slate-700 border-0"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? (
                <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <ICONS.Paperclip className="w-6 h-6" />
              )}
            </Button>
            <textarea 
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={t('placeholder')}
              className="flex-1 bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-[24px] px-5 py-3.5 text-sm focus:outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/15 resize-none min-h-[48px] max-h-[100px] transition-all"
              rows={1}
            />
            <Button 
              size="icon" 
              className={`rounded-full w-12 h-12 shrink-0 transition-all duration-300 border-0 ${inputValue.trim() ? 'bg-cyan-500 text-slate-950 shadow-lg scale-100 rotate-0' : 'bg-slate-800 text-slate-600 scale-95'}`}
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
            >
              <svg className="w-5 h-5 -rotate-45 -mr-0.5 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
            </Button>
          </div>
        </div>

        {/* Modals remain absolute within this container */}
        {showLeaveModal && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/50 backdrop-blur-sm animate-in fade-in rounded-[24px]">
            <div className="w-full max-w-sm p-6 text-center space-y-6 bg-slate-900 border border-slate-800 rounded-[24px] shadow-2xl">
              <div className="w-12 h-12 bg-red-500/15 text-red-400 rounded-full flex items-center justify-center mx-auto">
                <ICONS.Zap className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white">{t('leave_modal_title')}</h2>
                <div className="mt-4 bg-red-500/10 p-4 rounded-xl border border-red-500/20 text-left">
                  <div className="flex gap-2 mb-2">
                      <ICONS.Shield className="w-4 h-4 text-red-400" />
                      <span className="text-xs font-black text-red-300 uppercase tracking-wider">Juridische Waarschuwing</span>
                  </div>
                  <p className="text-xs text-red-200 font-medium leading-relaxed">
                    {t('leave_legal_warning') || "Let op: Het niet meewerken aan een oplossing kan in een eventuele latere rechtszaak in uw nadeel werken."}
                  </p>
                </div>
                <p className="text-xs text-slate-400 mt-4 font-medium">{t('leave_modal_desc')}</p>

                {/* Bij vastlopen: bied een stap verder aan (juridische hulp) */}
                <div className="mt-4 bg-cyan-500/10 p-4 rounded-xl border border-cyan-400/20 text-left">
                  <div className="flex gap-2 mb-1.5 items-center">
                    <span className="text-[10px] font-black text-cyan-300 bg-slate-950 px-1.5 py-0.5 rounded uppercase tracking-wider">Rsolve</span>
                    <span className="text-xs font-black text-white">{t('sv_offer_title')}</span>
                  </div>
                  <p className="text-xs text-slate-300 font-medium leading-relaxed mb-3">{t('sv_offer_text')}</p>
                  <button
                    className="w-full rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-sm font-semibold py-2.5 transition-colors"
                    onClick={() => { setShowLeaveModal(false); setShowStapVerder(true); }}
                  >
                    {t('sv_offer_yes')}
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setShowLeaveModal(false)} className="rounded-xl border border-slate-700 text-slate-200 hover:bg-slate-800 text-sm font-semibold py-2.5 transition-colors">{t('leave_cancel')}</button>
                <button onClick={handleConfirmAbandon} disabled={isLeaving} className="rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold py-2.5 transition-colors disabled:opacity-60">{t('leave_confirm')}</button>
              </div>
            </div>
          </div>
        )}

        {showVSOModal && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in rounded-[24px]">
            <div className="w-full max-w-md p-8 text-center space-y-6 relative overflow-hidden bg-slate-900 border border-slate-800 rounded-[24px] shadow-2xl">
              {!vsoTerms ? (
                <>
                  <div className="w-16 h-16 bg-cyan-500/15 text-cyan-300 rounded-full flex items-center justify-center mx-auto animate-bounce">
                    <ICONS.File className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white">{t('vso_modal_title')}</h2>
                    <p className="text-sm text-slate-400 mt-2">
                      {isGeneratingVSO ? t('vso_generating') : "De mediator stelt nu een juridisch document op."}
                    </p>
                  </div>
                  {isGeneratingVSO ? (
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-500 animate-pulse w-2/3 rounded-full"></div>
                    </div>
                  ) : (
                    <button className="w-full rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-sm font-semibold py-3 shadow-lg transition-colors" onClick={handleGenerateVSO}>
                      {t('vso_confirm')}
                    </button>
                  )}
                </>
              ) : (
                <div className="animate-in slide-in-from-bottom-8">
                  <h2 className="text-xl font-black text-white mb-4">{t('vso_title')}</h2>
                  <div className="bg-slate-950 p-4 rounded-xl text-left text-xs text-slate-300 max-h-60 overflow-y-auto border border-slate-800 mb-6 font-mono leading-relaxed">
                    {vsoTerms}
                  </div>
                  <button className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold py-3 shadow-lg transition-colors" onClick={finalizeVSO}>
                    {t('finish_btn')}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Rsolve Pro — begeleide wizard voor het overdrachtsdossier */}
        <RsolveProWizard
          isOpen={showProWizard}
          onClose={() => setShowProWizard(false)}
          caseData={caseData}
          appLanguage={appLanguage}
          t={t}
        />

        {/* "Stap verder" — juridische doorverwijzing bij vastgelopen gesprek */}
        <StapVerderFlow
          isOpen={showStapVerder}
          onClose={() => setShowStapVerder(false)}
          caseData={caseData}
          appLanguage={appLanguage}
          t={t}
        />

        <LanguageSelector
          isOpen={showLangSelector}
          onClose={() => setShowLangSelector(false)}
          currentLang={appLanguage} 
          onSetLang={setAppLanguage} 
          t={t}
        />
      </div>
    </div>
  );
};

export default Mediation;
