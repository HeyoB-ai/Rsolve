
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChatBubble } from '../components/ui/ChatBubble';
import { Button } from '../components/ui/Button';
import { ICONS, TOKENS } from '../constants';
import { Logo } from '../components/ui/Logo';
import { geminiService } from '../services/geminiService';

// Eenvoudige dictionary voor UI vertalingen
const UI_TRANSLATIONS: Record<string, any> = {
  nl: {
    dossier: "Bewijs Dossier",
    items_collected: "items verzameld",
    no_evidence: "Nog geen bewijsmateriaal geüpload.",
    view_download: "Bekijken / Download",
    online: "is online",
    waiting: "Wachten op",
    placeholder: "Schrijf een bericht...",
    settings: "Taalinstellingen",
    app_lang: "App Taal",
    close: "Sluiten",
    dossier_status: "Dossier Status",
    invitation_sent: "Link is verstuurd naar {name}. Je kunt de mediator alvast informeren.",
    mediator: "Mediator",
    you: "Jij",
    system: "Systeem"
  },
  en: {
    dossier: "Evidence File",
    items_collected: "items collected",
    no_evidence: "No evidence uploaded yet.",
    view_download: "View / Download",
    online: "is online",
    waiting: "Waiting for",
    placeholder: "Write a message...",
    settings: "Language Settings",
    app_lang: "App Language",
    close: "Close",
    dossier_status: "Case Status",
    invitation_sent: "Link sent to {name}. You can start informing the mediator.",
    mediator: "Mediator",
    you: "You",
    system: "System"
  },
  tr: {
    dossier: "Kanıt Dosyası",
    items_collected: "öğe toplandı",
    no_evidence: "Henüz kanıt yüklenmedi.",
    view_download: "Görüntüle / İndir",
    online: "çevrimiçi",
    waiting: "Bekleniyor:",
    placeholder: "Bir mesaj yazın...",
    settings: "Dil Ayarları",
    app_lang: "Uygulama Dili",
    close: "Kapat",
    dossier_status: "Dosya Durumu",
    invitation_sent: "Bağlantı {name} kişisine gönderildi. Arabulucuyu bilgilendirmeye başlayabilirsiniz.",
    mediator: "Arabulucu",
    you: "Sen",
    system: "Sistem"
  },
  ar: {
    dossier: "ملف الأدلة",
    items_collected: "تم جمع العناصر",
    no_evidence: "لم يتم تحميل أي أدلة بعد.",
    view_download: "عرض / تحميل",
    online: "متصل",
    waiting: "في انتظار",
    placeholder: "اكتب رسالة...",
    settings: "إعدادات اللغة",
    app_lang: "لغة التطبيق",
    close: "إغلاق",
    dossier_status: "حالة القضية",
    invitation_sent: "تم إرسال الرابط إلى {name}. يمكنك البدء في إبلاغ الوسيط.",
    mediator: "الوسيط",
    you: "أنت",
    system: "النظام"
  }
};

const Mediation: React.FC<{ caseData: any, onResolve: (vso: any) => void }> = ({ caseData, onResolve }) => {
  const [appLanguage, setAppLanguage] = useState<'nl' | 'en' | 'tr' | 'ar'>('nl');
  const t = (key: string, params?: any) => {
    let text = UI_TRANSLATIONS[appLanguage][key] || key;
    if (params) {
      Object.keys(params).forEach(k => {
        text = text.replace(`{${k}}`, params[k]);
      });
    }
    return text;
  };

  const [messages, setMessages] = useState<any[]>(() => {
    const saved = localStorage.getItem(`rsolve_chat_${caseData.id}`);
    if (saved) return JSON.parse(saved);
    
    return [
      { 
        id: '1', 
        text: `Mediation voor "${caseData.title}" is gestart.`, 
        isOwn: false, 
        sender: "Systeem", 
        timestamp: "Nu", 
        type: 'system' 
      },
      { 
        id: '2', 
        text: `Welkom. Ik ben jullie AI Mediator. ${caseData.otherParty} is uitgenodigd, maar we kunnen alvast beginnen. Vertel me gerust wat jouw kant van het verhaal is en voeg eventueel bewijslast toe via de paperclip. LET OP; hoewel we ons best doen om alle data zo goed mogelijke te beschermen is het belangrijk om te voorkomen dat er informatie wordt gedeeld die de privacy van deelnemers schendt. Dus noem zo min mogelijk achternamen, adressen en woonplaatsen terwijl je de app gebruikt.`, 
        isOwn: false, 
        sender: "Mediator", 
        timestamp: "Nu" 
      },
    ];
  });

  const [inputValue, setInputValue] = useState('');
  const [isRespondentJoined, setIsRespondentJoined] = useState(caseData.isRespondent || false);
  const [displayMode, setDisplayMode] = useState<'single' | 'dual'>('single');
  const [pendingLanguageApproval, setPendingLanguageApproval] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const evidenceList = useMemo(() => {
    return messages
      .filter(m => m.attachment)
      .map(m => ({
        ...m.attachment,
        sender: m.sender,
        timestamp: m.timestamp
      }));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem(`rsolve_chat_${caseData.id}`, JSON.stringify(messages));
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, caseData.id]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const newMessage = {
        id: Date.now().toString(),
        isOwn: true,
        sender: t('you'),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        attachment: {
          name: file.name,
          type: file.type,
          url: base64String
        }
      };
      setMessages(prev => [...prev, newMessage]);
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsDataURL(file);
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    
    const textToSend = inputValue;
    const newMessage = {
      id: Date.now().toString(),
      text: textToSend,
      isOwn: true,
      sender: t('you'),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, newMessage]);
    setInputValue('');

    if (displayMode === 'single') {
      const detection = await geminiService.detectNonDutch(textToSend);
      if (detection.isNonDutch && !pendingLanguageApproval) {
        setPendingLanguageApproval(detection.language);
        
        setTimeout(() => {
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            text: `Ik merk dat er in het ${detection.language} wordt gecommuniceerd. Is het goed als we in deze taal verdergaan of zal ik vanaf nu alles automatisch vertalen?`,
            isOwn: false,
            sender: t('mediator'),
            timestamp: "Zojuist",
            type: 'choice'
          }]);
        }, 800);
      }
    }
  };

  const setLanguagePreference = (mode: 'single' | 'dual') => {
    setDisplayMode(mode);
    setPendingLanguageApproval(null);
    const msg = mode === 'dual' 
      ? "Begrepen. Ik zal vanaf nu elk bericht in twee talen tonen voor de duidelijkheid."
      : "Akkoord, we gaan verder in de gekozen taal.";
    
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      text: msg,
      isOwn: false,
      sender: t('mediator'),
      timestamp: "Nu"
    }]);
  };

  return (
    <div className="h-safe flex flex-col bg-slate-50 overflow-hidden relative">
      {/* Dossier Sidebar */}
      <div className={`fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${isDossierOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsDossierOpen(false)}>
        <div className={`absolute top-0 right-0 h-full w-[85%] max-w-sm bg-white shadow-2xl transition-transform duration-300 transform ${isDossierOpen ? 'translate-x-0' : 'translate-x-full'}`} onClick={e => e.stopPropagation()}>
          <div className="flex flex-col h-full">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">{t('dossier')}</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase">{evidenceList.length} {t('items_collected')}</p>
              </div>
              <button onClick={() => setIsDossierOpen(false)} className="p-2 text-slate-400"><ICONS.X /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {evidenceList.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full opacity-30 text-center space-y-4">
                  <ICONS.Folder className="w-16 h-16" />
                  <p className="text-xs font-bold uppercase tracking-widest leading-relaxed">{t('no_evidence')}</p>
                </div>
              ) : (
                evidenceList.map((item, idx) => (
                  <div key={idx} className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                        {item.type.startsWith('image/') ? <ICONS.Camera className="w-4 h-4" /> : <ICONS.File className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="text-xs font-bold text-slate-900 truncate">{item.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{item.sender} • {item.timestamp}</p>
                      </div>
                    </div>
                    {item.type.startsWith('image/') && <img src={item.url} alt={item.name} className="w-full h-32 object-cover rounded-xl border border-slate-200" />}
                    <a href={item.url} download={item.name} className="mt-3 block w-full py-2 bg-white border border-slate-200 rounded-xl text-center text-[10px] font-black text-blue-600 uppercase tracking-widest">{t('view_download')}</a>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Settings Sidebar */}
      <div className={`fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${isSettingsOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsSettingsOpen(false)}>
        <div className={`absolute top-0 right-0 h-full w-[85%] max-w-sm bg-white shadow-2xl transition-transform duration-300 transform ${isSettingsOpen ? 'translate-x-0' : 'translate-x-full'}`} onClick={e => e.stopPropagation()}>
          <div className="flex flex-col h-full">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">{t('settings')}</h2>
              <button onClick={() => setIsSettingsOpen(false)} className="p-2 text-slate-400"><ICONS.X /></button>
            </div>
            <div className="p-6 space-y-6">
               <div className="space-y-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('app_lang')}</p>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { id: 'nl', label: 'Nederlands' },
                      { id: 'en', label: 'English' },
                      { id: 'tr', label: 'Türkçe' },
                      { id: 'ar', label: 'العربية' }
                    ].map(lang => (
                      <button 
                        key={lang.id}
                        onClick={() => { setAppLanguage(lang.id as any); setIsSettingsOpen(false); }}
                        className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${appLanguage === lang.id ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold' : 'border-slate-100 text-slate-600 hover:bg-slate-50'}`}
                      >
                        {lang.label}
                        {appLanguage === lang.id && <ICONS.Check className="w-4 h-4 text-blue-600" />}
                      </button>
                    ))}
                  </div>
               </div>
            </div>
            <div className="mt-auto p-6 border-t border-slate-100">
               <Button variant="outline" className="w-full rounded-xl" onClick={() => setIsSettingsOpen(false)}>{t('close')}</Button>
            </div>
          </div>
        </div>
      </div>

      <header className="px-5 py-3 bg-white border-b border-slate-100 flex items-center justify-between z-30 shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <Logo className="w-8 h-8" />
          <div className="overflow-hidden">
            <h1 className="text-xs font-black text-slate-900 truncate max-w-[150px] uppercase tracking-tight">{caseData.title}</h1>
            <div className="flex items-center gap-1.5">
               <div className={`w-1.5 h-1.5 rounded-full ${isRespondentJoined ? 'bg-emerald-500' : 'bg-amber-400 animate-pulse'}`} />
               <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                  {caseData.otherParty} {isRespondentJoined ? t('online') : `${t('waiting')}...`}
               </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button onClick={() => setIsSettingsOpen(true)} className="p-2 bg-slate-50 rounded-xl text-slate-600 border border-slate-100 active:scale-95 transition-transform">
            <ICONS.Globe className="w-5 h-5" />
          </button>
          <button onClick={() => setIsDossierOpen(true)} className="relative p-2 bg-slate-50 rounded-xl text-slate-600 border border-slate-100 active:scale-95 transition-transform">
            <ICONS.Folder className="w-5 h-5" />
            {evidenceList.length > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-white text-[8px] font-black rounded-full flex items-center justify-center">{evidenceList.length}</span>}
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(m => {
          if (m.type === 'system') return <div key={m.id} className="text-center py-2 animate-in fade-in duration-500"><span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">{m.text}</span></div>;
          if (m.type === 'choice') return (
            <div key={m.id} className="bg-white border border-slate-100 p-5 rounded-[24px] shadow-sm space-y-4 animate-in zoom-in-95 duration-300">
              <p className="text-sm font-medium text-slate-700 leading-relaxed text-center">{m.text}</p>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" size="sm" className="rounded-xl border-slate-200" onClick={() => setLanguagePreference('single')}>Taal is OK</Button>
                <Button variant="primary" size="sm" className="rounded-xl" onClick={() => setLanguagePreference('dual')}>Toon beide</Button>
              </div>
            </div>
          );
          return <ChatBubble key={m.id} text={m.text} isOwn={m.isOwn} sender={m.sender} timestamp={m.timestamp} attachment={m.attachment} autoTranslateTo={displayMode === 'dual' ? 'Nederlands' : null} />;
        })}
        {!isRespondentJoined && !messages.some(m => m.type === 'choice') && (
          <div className="mx-auto max-w-xs bg-amber-50/80 backdrop-blur-sm border border-amber-100 p-3 rounded-2xl text-center shadow-sm">
            <p className="text-[9px] font-black text-amber-600 uppercase tracking-[0.2em] mb-0.5">{t('dossier_status')}</p>
            <p className="text-[10px] text-amber-800 font-semibold leading-tight">{t('invitation_sent', { name: caseData.otherParty })}</p>
          </div>
        )}
        <div ref={scrollRef} className="h-4" />
      </div>

      <div className="bg-white border-t border-slate-100 px-4 pt-3 pb-safe shrink-0 shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
        <div className="flex gap-2 max-w-2xl mx-auto w-full items-end pb-2">
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*,video/*,.pdf,.doc,.docx" />
          <button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className={`p-3 rounded-2xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors shrink-0 mb-0.5 ${isUploading ? 'animate-pulse' : ''}`} title={t('add_evidence')}><ICONS.Paperclip className="w-5 h-5" /></button>
          <textarea className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-400 font-medium resize-none max-h-32" placeholder={t('placeholder')} rows={1} value={inputValue} onChange={e => setInputValue(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }} />
          <Button size="icon" className="rounded-2xl w-12 h-12 shadow-lg shadow-blue-100 shrink-0" onClick={handleSend} disabled={!inputValue.trim()}><svg className="w-5 h-5 -rotate-45" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg></Button>
        </div>
      </div>
    </div>
  );
};

export default Mediation;
