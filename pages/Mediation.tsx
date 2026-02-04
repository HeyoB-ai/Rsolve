
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChatBubble } from '../components/ui/ChatBubble';
import { Button } from '../components/ui/Button';
import { ICONS, UI_TRANSLATIONS } from '../constants';
import { Logo } from '../components/ui/Logo';
import { geminiService } from '../services/geminiService';
import { supabase } from '../lib/supabase';
import { Card } from '../components/ui/Card';
import { LanguageSelector } from '../components/ui/LanguageSelector';

// Web Audio API Sound Helper (No assets required)
const playNotificationSound = () => {
  try {
    const AudioCtx = (window.AudioContext || (window as any).webkitAudioContext);
    if (!AudioCtx) return;
    
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Friendly "Pop" sound
    osc.type = "sine";
    osc.frequency.value = 880; 
    
    // Envelope to avoid clicking
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.1, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.2);

    osc.onended = () => {
      // Cleanup context prevents memory leaks
      setTimeout(() => {
        if(ctx.state !== 'closed') ctx.close().catch(() => {});
      }, 200);
    };
  } catch (e) {
    // Silent fail if audio is not supported or blocked
    console.debug("Audio play failed", e);
  }
};

const SOUND_KEY = "rsolve_sound_enabled";

interface MediationProps {
  caseData: any;
  appLanguage: string;
  setAppLanguage: (lang: string) => void;
  t: (key: string, params?: any) => string;
  onResolve: (vsoData: any) => void;
  onAbandon: () => void;
}

const Mediation: React.FC<MediationProps> = ({ caseData, appLanguage, setAppLanguage, t, onResolve, onAbandon }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [partnerOnline, setPartnerOnline] = useState(false);
  const [showLangSelector, setShowLangSelector] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showVSOModal, setShowVSOModal] = useState(false);
  const [isGeneratingVSO, setIsGeneratingVSO] = useState(false);
  const [vsoTerms, setVsoTerms] = useState('');
  
  // Sound & Interaction State
  const [soundEnabled, setSoundEnabled] = useState(() => localStorage.getItem(SOUND_KEY) !== "false");
  const [hasInteracted, setHasInteracted] = useState(false);
  
  // Refs for tracking changes
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevMsgCountRef = useRef(0);
  const prevPartnerOnlineRef = useRef(false);
  const isInitialLoadRef = useRef(true);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Toggle Sound Preference
  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering interaction logic redundantly
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    localStorage.setItem(SOUND_KEY, newState.toString());
    setHasInteracted(true); // Clicking toggle counts as interaction
  };

  // Mark interaction to unlock audio context
  const handleInteraction = () => {
    if (!hasInteracted) {
      setHasInteracted(true);
      // Resume audio context if it was suspended (browser specific fix)
      const AudioCtx = (window.AudioContext || (window as any).webkitAudioContext);
      if (AudioCtx) {
        const ctx = new AudioCtx();
        ctx.resume().then(() => ctx.close());
      }
    }
  };

  useEffect(() => {
    // Scroll on new messages
    scrollToBottom();

    // Sound Logic
    if (soundEnabled && hasInteracted) {
      const msgCount = messages.length;
      const prevCount = prevMsgCountRef.current;
      
      // 1. Partner came online?
      if (!prevPartnerOnlineRef.current && partnerOnline) {
        playNotificationSound();
      }
      
      // 2. New message received? (Exclude initial load)
      if (msgCount > prevCount && !isInitialLoadRef.current) {
        const lastMsg = messages[msgCount - 1];
        // Only beep if message is NOT from me
        const isMe = lastMsg.sender_id === (caseData.isRespondent ? 'respondent' : 'initiator') || lastMsg.sender_id === 'local-user';
        
        if (!isMe) {
          playNotificationSound();
        }
      }
    }

    // Update refs
    prevMsgCountRef.current = messages.length;
    prevPartnerOnlineRef.current = partnerOnline;
    
    // Disable initial load flag after first render with data
    if (messages.length > 0) {
        isInitialLoadRef.current = false;
    }

  }, [messages, partnerOnline, soundEnabled, hasInteracted, caseData.isRespondent]);

  // Load chat history & Realtime subscription
  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('case_id', caseData.id)
        .order('created_at', { ascending: true });
      
      if (data) {
        setMessages(data);
        isInitialLoadRef.current = false; // Mark initial load complete immediately after fetch
      }
    };

    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`case-${caseData.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `case_id=eq.${caseData.id}` }, (payload: any) => {
        setMessages((prev) => [...prev, payload.new]);
      })
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        // Check if there is another user ID present besides me
        const others = Object.keys(state).length > 1; 
        setPartnerOnline(others);
      })
      .subscribe(async (status: string) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ user: caseData.isRespondent ? 'respondent' : 'initiator', online_at: new Date().toISOString() });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [caseData.id, caseData.isRespondent]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const myRole = caseData.isRespondent ? 'respondent' : 'initiator';
    const myName = caseData.isRespondent ? caseData.respondentName : caseData.initiatorName;

    // Optimistic UI update removed to prevent duplicate keys/state with Supabase realtime
    // We rely on the subscription to show the message
    
    const textToSend = inputValue;
    setInputValue('');

    // 1. Save user message to Supabase
    await supabase.from('messages').insert([{
      case_id: caseData.id,
      sender_id: myRole,
      sender_name: myName,
      content: textToSend,
      type: 'text'
    }]);

    setIsTyping(true);

    // 2. AI Mediation Logic
    // We fetch the full history again or use state to ensure context is correct
    const roles = {
      initiator: caseData.initiatorName,
      respondent: caseData.respondentName || "Tegenpartij"
    };

    // Format history for Gemini
    const historyForAI = messages.concat([{ 
        sender: myName, 
        text: textToSend, 
        role: myRole 
    }]).map(m => ({
        sender: m.sender_name,
        text: m.content,
        role: m.sender_id
    }));

    try {
        const aiResponse = await geminiService.generateMediatorResponse(
            historyForAI, 
            caseData.title, 
            roles
        );

        setIsTyping(false);

        // Check for VSO Trigger
        if (aiResponse.includes('[TRIGGER:VSO]')) {
            const cleanResponse = aiResponse.replace('[TRIGGER:VSO]', '').trim();
            if (cleanResponse) {
                await supabase.from('messages').insert([{
                    case_id: caseData.id,
                    sender_id: 'mediator',
                    sender_name: 'Mediator',
                    content: cleanResponse,
                    type: 'system'
                }]);
            }
            setShowVSOModal(true); // Open Modal to confirm generation
        } else {
            await supabase.from('messages').insert([{
                case_id: caseData.id,
                sender_id: 'mediator',
                sender_name: 'Mediator',
                content: aiResponse,
                type: 'text'
            }]);
        }

    } catch (err) {
        console.error(err);
        setIsTyping(false);
    }
  };

  const handleGenerateVSO = async () => {
    setIsGeneratingVSO(true);
    // Gather all messages for context
    const history = messages.map(m => ({ sender: m.sender_name, text: m.content }));
    const terms = await geminiService.generateVSOTerms(history, caseData.title);
    setVsoTerms(terms);
    setIsGeneratingVSO(false);
  };

  const finalizeVSO = () => {
    const vsoData = {
      title: caseData.title,
      parties: `${caseData.initiatorName} en ${caseData.respondentName || 'Tegenpartij'}`,
      date: new Date().toLocaleDateString('nl-NL'),
      terms: vsoTerms,
      caseId: caseData.id
    };
    onResolve(vsoData);
  };

  const myId = caseData.isRespondent ? 'respondent' : 'initiator';

  return (
    <div 
        className="flex flex-col h-safe bg-slate-50 relative"
        onPointerDown={handleInteraction} /* Capture first interaction for AudioContext */
    >
      {/* Header */}
      <header className="px-4 py-3 bg-white border-b border-slate-100 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-3 overflow-hidden">
          <Logo className="w-8 h-8" />
          <div className="flex flex-col overflow-hidden">
            <h1 className="text-sm font-black text-slate-900 truncate max-w-[150px] sm:max-w-xs">{caseData.title}</h1>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${partnerOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">
                {partnerOnline 
                  ? `${caseData.isRespondent ? caseData.initiatorName : caseData.respondentName} ${t('online')}` 
                  : `${t('waiting')} ${caseData.isRespondent ? caseData.initiatorName : caseData.respondentName}...`
                }
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button 
            onClick={toggleSound}
            className={`p-2 rounded-full transition-colors ${soundEnabled ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-400'}`}
            title={soundEnabled ? "Geluid aan" : "Geluid uit"}
          >
            {soundEnabled ? (
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
            ) : (
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>
            )}
          </button>

          <button 
            onClick={() => setShowLangSelector(true)}
            className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
          >
            <ICONS.Globe className="w-5 h-5" />
          </button>
          
          <button 
            onClick={() => setShowLeaveModal(true)}
            className="p-2 text-slate-300 hover:text-red-500 transition-colors"
          >
            <ICONS.X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2 scroll-smooth">
        {messages.map((m) => {
          const isMe = m.sender_id === myId || m.sender_id === 'local-user';
          const isSystem = m.type === 'system';
          
          if (isSystem) {
            return (
              <div key={m.id} className="flex justify-center my-4 animate-in fade-in zoom-in duration-500">
                <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-slate-200">
                  {m.content}
                </span>
              </div>
            );
          }

          return (
            <ChatBubble 
              key={m.id} 
              text={m.content} 
              isOwn={isMe} 
              sender={m.sender_name}
              senderRole={m.sender_id === 'mediator' ? 'mediator' : undefined} 
              timestamp={new Date(m.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} 
              autoTranslateTo={appLanguage !== 'nl' ? appLanguage : null}
              targetLanguageName={UI_TRANSLATIONS[appLanguage]?.label || 'Nederlands'}
            />
          );
        })}
        {isTyping && (
          <div className="flex items-center gap-2 text-slate-400 text-xs ml-4 mt-2 animate-pulse">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" />
            <span className="font-bold uppercase tracking-wider">{t('mediator_thinking')}</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-100 pb-safe">
        <div className="relative flex items-end gap-2 max-w-4xl mx-auto">
          <textarea 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder={t('placeholder')}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-[20px] px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none min-h-[50px] max-h-[120px]"
            rows={1}
          />
          <Button 
            size="icon" 
            className={`rounded-full w-12 h-12 shrink-0 transition-all ${inputValue.trim() ? 'bg-blue-600 shadow-lg scale-100' : 'bg-slate-200 text-slate-400 scale-95'}`}
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
          >
            <svg className="w-5 h-5 -rotate-45 -mr-1 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
          </Button>
        </div>
      </div>

      {/* Leave Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <Card className="w-full max-w-sm p-6 text-center space-y-6">
            <div className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto">
              <ICONS.Zap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">{t('leave_modal_title')}</h2>
              <p className="text-sm text-slate-500 mt-2">{t('leave_modal_desc')}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={() => setShowLeaveModal(false)}>{t('leave_cancel')}</Button>
              <Button variant="danger" onClick={onAbandon}>{t('leave_confirm')}</Button>
            </div>
          </Card>
        </div>
      )}

      {/* VSO Generation Modal */}
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
