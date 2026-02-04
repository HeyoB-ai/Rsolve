
import React, { useState, useEffect, useRef } from 'react';
import { ChatBubble } from '../components/ui/ChatBubble';
import { Button } from '../components/ui/Button';
import { ICONS, UI_TRANSLATIONS } from '../constants';
import { Logo } from '../components/ui/Logo';
import { geminiService } from '../services/geminiService';
import { supabase } from '../lib/supabase';
import { Card } from '../components/ui/Card';
import { LanguageSelector } from '../components/ui/LanguageSelector';
import { RealtimeChannel } from '@supabase/supabase-js';

// --- A) Notification Sound (Web Audio API) ---
const playNotificationSound = () => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.value = 880; // "Pop" frequentie

    // Envelope voor zacht begin/eind (geen klikjes)
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.13);

    osc.onended = () => {
      // Sluit context om memory leaks te voorkomen
      setTimeout(() => {
        if (ctx.state !== 'closed') ctx.close().catch(() => {});
      }, 200);
    };
  } catch (e) {
    console.error("Audio play failed", e);
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
  const [isTyping, setIsTyping] = useState(false); // AI typing state
  
  // Realtime States
  const [partnerOnline, setPartnerOnline] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  
  // UI States
  const [showLangSelector, setShowLangSelector] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showVSOModal, setShowVSOModal] = useState(false);
  const [isGeneratingVSO, setIsGeneratingVSO] = useState(false);
  const [vsoTerms, setVsoTerms] = useState('');

  // Sound & Interaction
  const [soundEnabled, setSoundEnabled] = useState(() => localStorage.getItem(SOUND_KEY) !== "0");
  const [hasInteracted, setHasInteracted] = useState(false);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastMessageIdRef = useRef<string | null>(null);
  const isInitialLoadRef = useRef(true);
  const typingTimeoutRef = useRef<any>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const myRole = caseData.isRespondent ? 'respondent' : 'initiator';
  const myName = caseData.isRespondent ? caseData.respondentName : caseData.initiatorName;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // --- Interaction Handler (Autoplay Policy) ---
  const handleInteraction = () => {
    if (!hasInteracted) {
      setHasInteracted(true);
      // Resume audio context indien nodig
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        ctx.resume().then(() => ctx.close());
      }
    }
  };

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    localStorage.setItem(SOUND_KEY, newState ? "1" : "0");
    setHasInteracted(true);
  };

  // --- Effect: Sound Logic ---
  useEffect(() => {
    if (messages.length === 0) return;

    const lastMsg = messages[messages.length - 1];
    
    // Check of dit bericht nieuw is (dedupe)
    if (lastMsg.id !== lastMessageIdRef.current) {
      lastMessageIdRef.current = lastMsg.id;

      // Speel geluid alleen als:
      // 1. Niet initial load
      // 2. Geluid aan + interactie
      // 3. Niet van mezelf (of lokale user)
      // 4. Niet van systeem (optioneel, maar wel fijn voor chat flow)
      
      const isMe = lastMsg.sender_id === myRole || lastMsg.sender_id === 'local-user';
      
      if (!isInitialLoadRef.current && soundEnabled && hasInteracted && !isMe) {
        playNotificationSound();
      }
    }
    
    scrollToBottom();
  }, [messages, soundEnabled, hasInteracted, myRole]);

  // --- Effect: Supabase Realtime (Messages + Presence) ---
  useEffect(() => {
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('case_id', caseData.id)
        .order('created_at', { ascending: true });
      
      if (data) {
        setMessages(data);
        if (data.length > 0) {
          lastMessageIdRef.current = data[data.length - 1].id;
        }
        // Markeer initial load als klaar na eerste render
        setTimeout(() => { isInitialLoadRef.current = false; }, 500);
      }
    };

    fetchMessages();

    // Setup Channel
    const channel = supabase.channel(`case-${caseData.id}`, {
      config: {
        presence: {
          key: myRole,
        },
      },
    });

    channelRef.current = channel;

    channel
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages', 
        filter: `case_id=eq.${caseData.id}` 
      }, (payload: any) => {
        setMessages((prev) => [...prev, payload.new]);
      })
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        
        // 1. Online detectie
        // Check of er een ANDERE key is dan mijn eigen role
        const users = Object.keys(state);
        const otherUserPresent = users.some(key => key !== myRole);
        setPartnerOnline(otherUserPresent);

        // 2. Typing detectie
        // Check of iemand anders dan ik 'typing: true' heeft
        let isOtherTyping = false;
        Object.entries(state).forEach(([key, values]: [string, any[]]) => {
          if (key !== myRole) {
            // Values is een array van presence objecten voor die key
            // We kijken naar de laatste update
            const lastStatus = values[values.length - 1];
            if (lastStatus?.typing) {
              isOtherTyping = true;
            }
          }
        });
        setPartnerTyping(isOtherTyping);
      })
      .subscribe(async (status: string) => {
        if (status === 'SUBSCRIBED') {
          // Initiele status tracken (niet typend)
          await channel.track({ 
            online_at: new Date().toISOString(),
            typing: false 
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [caseData.id, myRole]);

  // --- B) Typing Logic (Sender) ---
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInputValue(val);

    if (!channelRef.current) return;

    // Als we nog niet aan het typen waren, stuur status update
    // We gebruiken een ref om debounce te managen
    clearTimeout(typingTimeoutRef.current);

    // Stuur 'typing: true' (maar niet spammen bij elke keystroke, throttle logic via presence is automatisch redelijk efficiënt, 
    // maar we sturen hem opnieuw om de timeout aan de andere kant levend te houden als we dat zouden implementeren)
    // Hier sturen we gewoon bij elke keystroke een debounced 'stop'
    
    // Update presence state naar typing: true
    channelRef.current.track({ 
      online_at: new Date().toISOString(),
      typing: true 
    });

    // Zet timeout om status weer op false te zetten na 2 seconden niks doen
    typingTimeoutRef.current = setTimeout(() => {
      if (channelRef.current) {
        channelRef.current.track({ 
          online_at: new Date().toISOString(),
          typing: false 
        });
      }
    }, 2000);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // Reset typing direct bij verzenden
    clearTimeout(typingTimeoutRef.current);
    if (channelRef.current) {
      channelRef.current.track({ online_at: new Date().toISOString(), typing: false });
    }

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

    setIsTyping(true); // AI is thinking locally UI

    // 2. AI Mediation Logic
    const roles = {
      initiator: caseData.initiatorName,
      respondent: caseData.respondentName || "Tegenpartij"
    };

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
    } catch (err) {
        console.error(err);
        setIsTyping(false);
    }
  };

  const handleGenerateVSO = async () => {
    setIsGeneratingVSO(true);
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

  return (
    <div 
        className="flex flex-col h-safe bg-slate-50 relative"
        onPointerDown={handleInteraction} /* Capture interaction for AudioContext */
    >
      {/* Header */}
      <header className="px-4 py-3 bg-white border-b border-slate-100 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-3 overflow-hidden">
          <Logo className="w-8 h-8" />
          <div className="flex flex-col overflow-hidden">
            <h1 className="text-sm font-black text-slate-900 truncate max-w-[150px] sm:max-w-xs">{caseData.title}</h1>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full transition-colors duration-500 ${partnerOnline ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-300'}`} />
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
            className={`p-2 rounded-full transition-all active:scale-95 ${soundEnabled ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-400'}`}
            title={soundEnabled ? "Geluid aan" : "Geluid uit"}
          >
             {soundEnabled ? (
               <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
             ) : (
               <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>
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
          const isMe = m.sender_id === myRole || m.sender_id === 'local-user';
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

        {/* Typing Indicators */}
        {(isTyping || partnerTyping) && (
          <div className="flex items-center gap-2 ml-4 mt-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
             {partnerTyping && (
                <div className="flex items-center gap-2 bg-slate-100 px-3 py-2 rounded-xl rounded-bl-none">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    {caseData.isRespondent ? caseData.initiatorName : caseData.respondentName} {t('typing_indicator')}
                  </span>
                  <div className="flex gap-1">
                    <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" />
                    <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce delay-75" />
                    <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce delay-150" />
                  </div>
                </div>
             )}
             
             {isTyping && !partnerTyping && (
               <div className="flex items-center gap-2 text-emerald-600 text-[10px] font-bold bg-emerald-50 px-3 py-2 rounded-full border border-emerald-100">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="uppercase tracking-wider">{t('mediator_thinking')}</span>
               </div>
             )}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-100 pb-safe">
        <div className="relative flex items-end gap-2 max-w-4xl mx-auto">
          <textarea 
            value={inputValue}
            onChange={handleInputChange}
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
