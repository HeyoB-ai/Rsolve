
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChatBubble } from '../components/ui/ChatBubble';
import { Button } from '../components/ui/Button';
import { ICONS, UI_TRANSLATIONS } from '../constants';
import { Logo } from '../components/ui/Logo';
import { geminiService } from '../services/geminiService';
import { supabase } from '../lib/supabase';
import { Card } from '../components/ui/Card';
import { LanguageSelector } from '../components/ui/LanguageSelector';
import { RealtimeChannel } from '@supabase/supabase-js';

// --- CONSTANTS ---
const SOUND_KEY = "rsolve_sound_enabled";
const TYPING_TIMEOUT_MS = 1200; // Hoe lang na laatste toetsaanslag stopt typing
const TYPING_THROTTLE_MS = 400; // Maximaal 1 event per 400ms sturen
const POLLING_INTERVAL_MS = 4000; // Backup polling voor als Realtime faalt

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
  
  // Realtime & Presence
  const [partnerOnline, setPartnerOnline] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false); // De ANDER typt
  const [isAiThinking, setIsAiThinking] = useState(false); // Lokale AI status

  // Audio State
  const [soundEnabled, setSoundEnabled] = useState(() => localStorage.getItem(SOUND_KEY) !== "0");
  const [audioReady, setAudioReady] = useState(false);

  // UI Modals
  const [showLangSelector, setShowLangSelector] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showVSOModal, setShowVSOModal] = useState(false);
  const [isGeneratingVSO, setIsGeneratingVSO] = useState(false);
  const [vsoTerms, setVsoTerms] = useState('');

  // --- REFS ---
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioUnlockedRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Refs voor logica
  const lastProcessedMessageIdRef = useRef<string | null>(null);
  const isInitialLoadRef = useRef(true);
  
  // Refs voor typing throttling
  const lastTypedTimeRef = useRef<number>(0);
  const typingTimeoutRef = useRef<any>(null);
  const partnerTypingTimeoutRef = useRef<any>(null);
  const isLocallyTypingRef = useRef(false);

  // Identity & Names Correction
  const isRespondent = caseData.isRespondent;
  
  // Bepaal mijn naam robuust
  const myName = isRespondent 
    ? (caseData.respondentName || "Respondent") 
    : (caseData.initiatorName || "Initiator");

  // Bepaal partner naam robuust (fallback naar otherParty als respondentName leeg is bij initiator)
  const partnerName = isRespondent
    ? (caseData.initiatorName || "Initiator")
    : (caseData.respondentName || caseData.otherParty || "Tegenpartij");

  const myRole = isRespondent ? 'respondent' : 'initiator';

  // --- AUDIO ENGINE (SILENT START STRATEGY) ---
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
        console.log("[AUDIO] System unlocked and ready.");
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
      console.log(`[AUDIO] Playing sound: ${reason}`);
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

  // --- TYPING LOGIC (BROADCAST) ---
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

  const sendMediatorStatus = async (isThinking: boolean) => {
    if (!channelRef.current) return;
    await channelRef.current.send({
        type: "broadcast",
        event: "mediator_status",
        payload: { isThinking }
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
        // Slimme merge: behoud 'temp-' berichten die nog niet in de database data zitten
        // Dit voorkomt dat optimistische berichten flikkeren/verdwijnen
        const pendingOptimistic = prev.filter(m => 
            m.id.toString().startsWith('temp-') && 
            !data.some(d => d.content === m.content && d.sender_id === m.sender_id)
        );
        
        // Combineer echte data + nog niet verwerkte optimistische data
        const merged = [...data, ...pendingOptimistic];
        
        if (merged.length > 0) {
            // Update last processed om geluidjes correct te laten werken
             const lastRealMsg = data[data.length - 1];
             if (lastRealMsg && lastRealMsg.id !== lastProcessedMessageIdRef.current) {
                 // Trigger sound effect only if it's new and not from us
                 if (!isInitialLoadRef.current && lastRealMsg.sender_id !== myRole && lastRealMsg.sender_id !== 'local-user') {
                     // We doen dit hier niet direct, maar laten de useEffect of Realtime listener dit doen
                     // om dubbele geluiden te voorkomen.
                 }
             }
        }
        return merged;
      });

      if (data.length > 0) {
        // Alleen updaten als het een echt ID is
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
      const { data } = await supabase.from('cases').select('vso_terms').eq('id', caseData.id).single();
      if (data && data.vso_terms) {
          setVsoTerms(data.vso_terms);
      }
  };

  useEffect(() => {
    fetchMessages();
    fetchCaseData();
    
    // Polling Fallback (Backup voor als Realtime socket faalt)
    const interval = setInterval(() => {
        fetchMessages();
    }, POLLING_INTERVAL_MS);

    const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
            console.log("[APP] Waking up/Visible -> Refreshing messages & Case Data...");
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
    // --- ROBUST REALTIME SETUP ---
    const channel = supabase.channel(`case-${caseData.id}`, {
      config: { presence: { key: myRole } },
    });
    channelRef.current = channel;

    channel
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages', 
        filter: `case_id=eq.${caseData.id}` 
      }, (payload: any) => {
        const newMessage = payload.new;
        
        // Optimistic UI Reconciliation
        setMessages((prev) => {
            // Deduplication: If ID matches (e.g. from our optimistic insert result), ignore
            if (prev.some(m => m.id === newMessage.id)) return prev;
            
            // Replace temporary message if exists (fallback match by content + sender)
            // Dit zorgt ervoor dat het grijze/temp bericht wordt vervangen door de echte database versie
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
      .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'cases',
          filter: `id=eq.${caseData.id}`
      }, (payload: any) => {
          if (payload.new.vso_terms) {
              setVsoTerms(payload.new.vso_terms);
          }
      })
      .on('broadcast', { event: 'typing' }, (payload: any) => {
          const p = payload?.payload;
          if (!p) return;
          if (p.userId === myRole) return;
          if (p.typing === true) {
            setPartnerTyping(true);
            if (partnerTypingTimeoutRef.current) clearTimeout(partnerTypingTimeoutRef.current);
            partnerTypingTimeoutRef.current = setTimeout(() => {
              setPartnerTyping(false);
            }, TYPING_TIMEOUT_MS + 200);
          } else {
            setPartnerTyping(false);
            if (partnerTypingTimeoutRef.current) clearTimeout(partnerTypingTimeoutRef.current);
          }
      })
      .on('broadcast', { event: 'mediator_status' }, (payload: any) => {
          const p = payload?.payload;
          if (p && typeof p.isThinking === 'boolean') {
              setIsAiThinking(p.isThinking);
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
           console.log("[REALTIME] Subscribed to channel");
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

  // --- FILE UPLOAD AND AI TRIGGER ---
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // 1. Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const filePath = `${caseData.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('chat-uploads')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('chat-uploads')
        .getPublicUrl(filePath);

      if (data?.publicUrl) {
        // Optimistic UI for File
        const tempId = 'temp-' + Date.now();
        const tempMsg = {
          id: tempId,
          case_id: caseData.id,
          sender_id: myRole,
          sender_name: myName,
          content: file.name,
          attachment_url: data.publicUrl,
          type: 'attachment',
          created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, tempMsg]);

        // 2. Insert Message into DB
        const { data: insertedMsg, error: insertError } = await supabase.from('messages').insert([{
          case_id: caseData.id,
          sender_id: myRole,
          sender_name: myName,
          content: file.name,
          attachment_url: data.publicUrl,
          type: 'attachment'
        }]).select().single();

        if (insertedMsg) {
             setMessages(prev => prev.map(m => m.id === tempId ? insertedMsg : m));
        }

        // 3. Convert File to Base64 for AI Analysis
        const base64Data = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const result = reader.result as string;
                const b64 = result.split(',')[1];
                resolve(b64);
            };
            reader.onerror = error => reject(error);
        });

        // 4. Trigger AI Analysis
        setIsAiThinking(true);
        void sendMediatorStatus(true);
        
        const roles = {
            initiator: isRespondent ? partnerName : myName,
            respondent: isRespondent ? myName : partnerName
        };

        const historyForAI = messages.concat([tempMsg]).map(m => ({
            sender: m.sender_name || m.sender, 
            text: m.content || m.text,
            role: m.sender_id || m.role
        }));

        const aiResponse = await geminiService.generateMediatorResponse(
            historyForAI, 
            caseData.title, 
            roles,
            { mimeType: file.type, data: base64Data }
        );

        setIsAiThinking(false);
        void sendMediatorStatus(false);

        // 5. Insert AI Response
        if (aiResponse.includes('[TRIGGER:VSO]')) {
            const cleanResponse = aiResponse.replace('[TRIGGER:VSO]', '').trim();
            if (cleanResponse) {
                await supabase.from('messages').insert([{
                    case_id: caseData.id,
                    sender_id: 'mediator',
                    sender_name: 'Mediator',
                    content: cleanResponse + " [TRIGGER:VSO]",
                    type: 'system'
                }]);
            }
            fetchCaseData();
            setShowVSOModal(true);
        } else {
            await supabase.from('messages').insert([{
                case_id: caseData.id,
                sender_id: 'mediator',
                sender_name: 'Mediator',
                content: aiResponse,
                type: 'text'
            }]);
        }
        
        // Removed fetchMessages() here to prevent race conditions
      }
    } catch (error) {
      console.error("Upload failed", error);
      alert("Upload mislukt. Probeer het opnieuw.");
      setIsAiThinking(false);
      void sendMediatorStatus(false);
      fetchMessages(); // Rollback if needed
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    void sendTypingBroadcast(false);
    
    const textToSend = inputValue;
    setInputValue('');

    // --- OPTIMISTIC UI UPDATE ---
    const tempId = 'temp-' + Date.now();
    const tempMsg = {
      id: tempId,
      case_id: caseData.id,
      sender_id: myRole,
      sender_name: myName,
      content: textToSend,
      type: 'text',
      created_at: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, tempMsg]);

    // Insert into DB
    const { data: insertedMsg, error } = await supabase.from('messages').insert([{
      case_id: caseData.id,
      sender_id: myRole,
      sender_name: myName,
      content: textToSend,
      type: 'text'
    }]).select().single();

    if (error) {
        console.error("Failed to send", error);
        // Remove optimistic update on error? Or retry?
        // For now, let's refresh to sync truth
        fetchMessages();
        return;
    }

    if (insertedMsg) {
        // Replace temp message with real one to get correct ID for future
        setMessages(prev => prev.map(m => m.id === tempId ? insertedMsg : m));
    }

    setIsAiThinking(true);
    void sendMediatorStatus(true); 

    const roles = {
      initiator: isRespondent ? partnerName : myName,
      respondent: isRespondent ? myName : partnerName
    };

    const historyForAI = messages.concat([tempMsg]).map(m => ({
        sender: m.sender_name || m.sender, 
        text: m.content || m.text,
        role: m.sender_id || m.role
    }));

    try {
        const aiResponse = await geminiService.generateMediatorResponse(
            historyForAI, 
            caseData.title, 
            roles
        );

        setIsAiThinking(false);
        void sendMediatorStatus(false); 

        if (aiResponse.includes('[TRIGGER:VSO]')) {
            const cleanResponse = aiResponse.replace('[TRIGGER:VSO]', '').trim();
            if (cleanResponse) {
                await supabase.from('messages').insert([{
                    case_id: caseData.id,
                    sender_id: 'mediator',
                    sender_name: 'Mediator',
                    content: cleanResponse + " [TRIGGER:VSO]", 
                    type: 'system'
                }]);
            }
            fetchCaseData();
            setShowVSOModal(true);
        } else {
            await supabase.from('messages').insert([{
                case_id: caseData.id,
                sender_id: 'mediator',
                sender_name: 'Mediator',
                content: aiResponse,
                type: 'text'
            }]);
        }
        
        // Removed fetchMessages() here to avoid removing the optimistic UI before DB is consistent

    } catch (err) {
        console.error(err);
        setIsAiThinking(false);
        void sendMediatorStatus(false);
    }
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
    const vsoData = {
      title: caseData.title,
      parties: `${isRespondent ? partnerName : myName} en ${isRespondent ? myName : partnerName}`,
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
    return {
      name: m.content || 'Bijlage', 
      type,
      url: m.attachment_url
    };
  };

  return (
    <div className="flex flex-col h-safe bg-slate-50 relative">
      <header className="px-4 py-3 bg-white border-b border-slate-100 flex items-center justify-between shrink-0 z-10 shadow-sm">
        <div className="flex items-center gap-3 overflow-hidden">
          <Logo className="w-8 h-8" />
          <div className="flex flex-col overflow-hidden">
            <h1 className="text-sm font-black text-slate-900 truncate max-w-[150px] sm:max-w-xs">{caseData.title}</h1>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full transition-colors duration-500 ${partnerOnline ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-300'}`} />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">
                {partnerOnline 
                  ? `${partnerName} ${t('online')}` 
                  : `${t('waiting')} ${partnerName}...`
                }
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-50 rounded-full p-1 border border-slate-100">
             {soundEnabled && (
                <button 
                  onClick={handleTestAudio} 
                  className={`text-[8px] font-bold uppercase tracking-widest px-2 py-1 rounded-full transition-colors ${audioReady ? 'text-emerald-500 bg-emerald-50' : 'text-amber-600 bg-amber-50 animate-pulse'}`}
                  title="Klik om geluid te testen"
                >
                   {audioReady ? 'Test' : 'Tap'}
                </button>
             )}
             <button 
                onClick={toggleSound}
                className={`p-2 rounded-full transition-all active:scale-95 ${soundEnabled ? 'text-blue-600' : 'text-slate-400'}`}
                title={soundEnabled ? "Geluid aan" : "Geluid uit"}
            >
                {soundEnabled ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>
                )}
            </button>
          </div>
          <button onClick={() => setShowLangSelector(true)} className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
            <ICONS.Globe className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setShowLeaveModal(true)}
            className="px-3 py-1.5 text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors uppercase tracking-wider"
            title={t('leave_btn') || "Verlaten"}
          >
             {t('leave_btn_label') || "Stop"}
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2 scroll-smooth">
        {messages.map((m) => {
          const isMe = m.sender_id === myRole || m.sender_id === 'local-user';
          const isSystem = m.type === 'system';
          if (isSystem) {
            const displayContent = m.content.replace('[TRIGGER:VSO]', '').trim();
            if (!displayContent) return null;
            return (
              <div key={m.id} className="flex justify-center my-4 animate-in fade-in zoom-in duration-500">
                <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-slate-200">
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
              senderRole={m.sender_id === 'mediator' ? 'mediator' : undefined} 
              timestamp={new Date(m.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} 
              autoTranslateTo={appLanguage !== 'nl' ? appLanguage : null}
              targetLanguageName={UI_TRANSLATIONS[appLanguage]?.label || 'Nederlands'}
            />
          );
        })}
        {(isAiThinking || partnerTyping) && (
          <div className="flex flex-col gap-1 ml-4 mt-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
             {partnerTyping && (
                <div className="flex items-center gap-2 bg-slate-100 w-fit px-3 py-2 rounded-xl rounded-bl-none shadow-sm">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    {partnerName} {t('typing_indicator')}
                  </span>
                  <div className="flex gap-1">
                    <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" />
                    <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce delay-75" />
                    <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce delay-150" />
                  </div>
                </div>
             )}
             {isAiThinking && !partnerTyping && (
               <div className="flex items-center gap-2 text-emerald-600 text-[10px] font-bold bg-emerald-50 w-fit px-3 py-2 rounded-full border border-emerald-100">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="uppercase tracking-wider">{t('mediator_thinking')}</span>
               </div>
             )}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-slate-100 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
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
            className="rounded-full w-14 h-14 shrink-0 bg-slate-100 text-slate-500 hover:bg-slate-200"
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
            className="flex-1 bg-slate-50 border border-slate-200 rounded-[24px] px-5 py-3.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 resize-none min-h-[54px] max-h-[120px] shadow-inner transition-all"
            rows={1}
          />
          <Button 
            size="icon" 
            className={`rounded-full w-14 h-14 shrink-0 transition-all duration-300 ${inputValue.trim() ? 'bg-blue-600 shadow-lg scale-100 rotate-0' : 'bg-slate-100 text-slate-300 scale-95'}`}
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
          >
            <svg className="w-6 h-6 -rotate-45 -mr-1 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
          </Button>
        </div>
      </div>

      {showLeaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <Card className="w-full max-w-sm p-6 text-center space-y-6">
            <div className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto">
              <ICONS.Zap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">{t('leave_modal_title')}</h2>
              <div className="mt-4 bg-red-50 p-4 rounded-xl border border-red-100 text-left">
                 <div className="flex gap-2 mb-2">
                    <ICONS.Shield className="w-4 h-4 text-red-600" />
                    <span className="text-xs font-black text-red-700 uppercase tracking-wider">Juridische Waarschuwing</span>
                 </div>
                 <p className="text-xs text-red-800 font-medium leading-relaxed">
                   {t('leave_legal_warning') || "Let op: Het niet meewerken aan een oplossing kan in een eventuele latere rechtszaak in uw nadeel werken."}
                 </p>
              </div>
              <p className="text-xs text-slate-400 mt-4 font-medium">{t('leave_modal_desc')}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={() => setShowLeaveModal(false)}>{t('leave_cancel')}</Button>
              <Button variant="danger" onClick={onAbandon}>{t('leave_confirm')}</Button>
            </div>
          </Card>
        </div>
      )}

      {showVSOModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in">
          <Card className="w-full max-w-md p-8 text-center space-y-6 relative overflow-hidden">
            {!vsoTerms ? (
              <>
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                  <ICONS.File className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900">{t('vso_modal_title')}</h2>
                  <p className="text-sm text-slate-500 mt-2">
                    {isGeneratingVSO ? t('vso_generating') : "De mediator stelt nu een juridisch document op."}
                  </p>
                </div>
                {isGeneratingVSO ? (
                   <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 animate-pulse w-2/3 rounded-full"></div>
                   </div>
                ) : (
                  <Button size="lg" className="w-full shadow-xl" onClick={handleGenerateVSO}>
                    {t('vso_confirm')}
                  </Button>
                )}
              </>
            ) : (
              <div className="animate-in slide-in-from-bottom-8">
                <h2 className="text-xl font-black text-slate-900 mb-4">{t('vso_title')}</h2>
                <div className="bg-slate-50 p-4 rounded-xl text-left text-xs text-slate-600 max-h-60 overflow-y-auto border border-slate-100 mb-6 font-mono leading-relaxed">
                  {vsoTerms}
                </div>
                <Button size="lg" className="w-full shadow-xl bg-emerald-600 hover:bg-emerald-700" onClick={finalizeVSO}>
                  {t('finish_btn')}
                </Button>
              </div>
            )}
          </Card>
        </div>
      )}

      <LanguageSelector 
        isOpen={showLangSelector} 
        onClose={() => setShowLangSelector(false)} 
        currentLang={appLanguage} 
        onSetLang={setAppLanguage} 
        t={t}
      />
    </div>
  );
};

export default Mediation;
