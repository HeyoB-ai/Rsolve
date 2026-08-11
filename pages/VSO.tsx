
import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Logo } from '../components/ui/Logo';
import { ICONS } from '../constants';
import { supabase } from '../lib/supabase';

interface VSOProps {
  data: any;
  t: (key: string, params?: any) => string;
  onReset: () => void;
}

const VSO: React.FC<VSOProps> = ({ data, t, onReset }) => {
  // State for signatures
  const [caseState, setCaseState] = useState<any>(null);
  const [signatureName, setSignatureName] = useState('');
  const [isSigning, setIsSigning] = useState(false);
  const [isDownloadingLog, setIsDownloadingLog] = useState(false);

  // Identity logic - Ensure boolean type
  const isRespondent = !!data.isRespondent;
  const initiatorName = data.initiatorName || 'Partij A';
  const respondentName = data.respondentName || 'Partij B';

  // Load initial state and subscribe to changes
  useEffect(() => {
    // Werk de status bij zonder een reeds gezette handtekening te wissen
    // (voorkomt geflikker tussen de optimistische update en de database).
    const applyCase = (c: any) => {
      if (!c) return;
      setCaseState((prev: any) => {
        if (!prev) return c;
        return {
          ...c,
          initiator_signature: c.initiator_signature || prev.initiator_signature,
          respondent_signature: c.respondent_signature || prev.respondent_signature,
          initiator_signed_at: c.initiator_signed_at || prev.initiator_signed_at,
          respondent_signed_at: c.respondent_signed_at || prev.respondent_signed_at,
        };
      });
    };

    const fetchCase = async () => {
      const { data: c } = await supabase.from('cases').select('*').eq('id', data.caseId).single();
      applyCase(c);
    };

    fetchCase();

    const channel = supabase.channel(`vso-${data.caseId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'cases',
        filter: `id=eq.${data.caseId}`
      }, (payload: any) => {
        applyCase(payload.new);
      })
      .subscribe();

    // Fallback: pol de handtekeningstatus elke paar seconden, zodat beide partijen
    // elkaars handtekening zien ook als realtime (nog) niet actief is voor deze tabel.
    const interval = setInterval(fetchCase, 3000);
    const onVisible = () => { if (document.visibilityState === 'visible') fetchCase(); };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [data.caseId]);

  const handleSign = async () => {
    if (!signatureName.trim()) return;
    setIsSigning(true);

    const updateField = isRespondent ? 'respondent_signature' : 'initiator_signature';
    const dateField = isRespondent ? 'respondent_signed_at' : 'initiator_signed_at';

    try {
        // Optimistic update
        setCaseState((prev: any) => ({
            ...prev,
            [updateField]: signatureName,
            [dateField]: new Date().toISOString()
        }));

        await supabase.from('cases').update({
            [updateField]: signatureName,
            [dateField]: new Date().toISOString()
        }).eq('id', data.caseId);

    } catch (e) {
        console.error("Signing failed", e);
        alert("Kon handtekening niet opslaan. Probeer opnieuw.");
    } finally {
        setIsSigning(false);
    }
  };

  const downloadChatHistory = async () => {
    if (!data.caseId) return;
    setIsDownloadingLog(true);

    try {
      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .eq('case_id', data.caseId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      let logText = `GESPREKSVERSLAG RSOLVE MEDIATION\n`;
      logText += `Dossier: ${data.title}\n`;
      logText += `Datum export: ${new Date().toLocaleString('nl-NL')}\n`;
      logText += `Partijen: ${initiatorName} en ${respondentName}\n`;
      logText += `--------------------------------------------------\n\n`;

      messages.forEach((m: any) => {
        const time = new Date(m.created_at).toLocaleString('nl-NL');
        logText += `[${time}] ${m.sender_name}:\n${m.content}\n\n`;
      });

      logText += `--------------------------------------------------\n`;
      logText += `EINDE VERSLAG\n`;

      const blob = new Blob([logText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gespreksverslag-${data.title.replace(/\s+/g, '-').toLowerCase()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Fout bij downloaden verslag:", err);
      alert("Kon het verslag niet downloaden.");
    } finally {
      setIsDownloadingLog(false);
    }
  };

  const initiatorSigned = caseState?.initiator_signature;
  const respondentSigned = caseState?.respondent_signature;
  const bothSigned = initiatorSigned && respondentSigned;

  // Determining who I am signing for
  const amISigningAsInitiator = !isRespondent;
  const amISigningAsRespondent = isRespondent;

  // Have I signed?
  const haveISigned = (amISigningAsInitiator && initiatorSigned) || (amISigningAsRespondent && respondentSigned);

  return (
    <div className="min-h-screen bg-slate-100 p-6 md:p-12 flex flex-col items-center animate-in fade-in duration-700">
      <div className="w-full max-w-3xl space-y-8">
        <header className="flex justify-between items-center print:hidden">
          <div className="flex items-center gap-3">
            <Logo className="w-12 h-12" />
            <div>
              <h1 className="text-xl font-bold text-slate-900">{t('vso_title')}</h1>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{t('legal_doc')}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={downloadChatHistory} 
              isLoading={isDownloadingLog}
              className="rounded-xl border-slate-200 hidden md:inline-flex"
            >
              <ICONS.Folder className="w-4 h-4 mr-2" /> {t('download_chat')}
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.print()} className="rounded-xl border-slate-200">
              <ICONS.File className="w-4 h-4 mr-2" /> {t('download_pdf')}
            </Button>
          </div>
        </header>

        <Card className="bg-white p-12 md:p-20 shadow-2xl border-none relative overflow-hidden print:p-0 print:shadow-none rounded-[2px] min-h-[1000px]">
          {/* Watermark */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] rotate-[15deg] select-none pointer-events-none w-full flex justify-center">
            <Logo className="w-[600px] h-[600px]" />
          </div>

          <div className="prose prose-slate max-w-none relative z-10">
            <div className="text-center mb-16 border-b-2 border-slate-100 pb-10">
              <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-2">{t('settlement_agreement')}</h2>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.4em]">{t('legal_accord')}</p>
            </div>

            <section className="mb-12">
              <h3 className="text-xs font-black text-slate-900 mb-4 uppercase tracking-widest border-l-4 border-blue-600 pl-3">{t('section_parties')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm text-slate-700 leading-relaxed bg-slate-50/50 p-8 rounded-2xl border border-slate-100">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('party_a')} (Initiator)</p>
                  <p className="font-bold text-lg">{initiatorName}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('party_b')} (Respondent)</p>
                  <p className="font-bold text-lg">{respondentName}</p>
                </div>
              </div>
            </section>

            <section className="mb-12">
              <h3 className="text-xs font-black text-slate-900 mb-4 uppercase tracking-widest border-l-4 border-blue-600 pl-3">{t('section_dispute')}</h3>
              <p className="text-sm text-slate-600 leading-relaxed italic px-8">
                {t('dispute_desc')} <br/>
                <span className="text-slate-900 font-bold not-italic">"{data.title}"</span>
              </p>
            </section>

            <section className="mb-12">
              <h3 className="text-xs font-black text-slate-900 mb-4 uppercase tracking-widest border-l-4 border-blue-600 pl-3">{t('section_terms')}</h3>
              <div className="text-base text-slate-800 leading-loose whitespace-pre-wrap bg-blue-50/30 p-10 rounded-2xl border border-blue-100 font-serif shadow-inner">
                {data.terms || t('no_terms')}
              </div>
            </section>

            <section className="mb-20">
              <h3 className="text-xs font-black text-slate-900 mb-4 uppercase tracking-widest border-l-4 border-blue-600 pl-3">{t('section_final')}</h3>
              <p className="text-xs text-slate-500 leading-relaxed italic bg-slate-50 p-6 rounded-xl border border-slate-100">
                {t('final_text')}
              </p>
            </section>

            <div className="grid grid-cols-2 gap-16 mt-32">
              {/* PARTY A / INITIATOR SIGNATURE BLOCK */}
              <div className="border-t-2 border-slate-900 pt-8 text-center relative">
                <p className="text-[10px] font-black text-slate-400 mb-12 uppercase tracking-[0.3em]">
                   {t('sign_party_a')}
                </p>
                
                {initiatorSigned ? (
                   <div className="animate-in fade-in zoom-in duration-500">
                    <p className="font-serif italic text-blue-900 text-3xl mb-1">{initiatorSigned}</p>
                    <p className="text-[8px] text-emerald-600 font-black uppercase tracking-widest">{t('digital_sign')}</p>
                    <p className="text-[10px] text-slate-300 font-bold">{t('date')} {new Date(caseState?.initiator_signed_at || new Date()).toLocaleDateString()}</p>
                   </div>
                ) : (
                    amISigningAsInitiator ? (
                        <div className="print:hidden">
                            <input 
                              type="text" 
                              placeholder={t('sign_placeholder')}
                              className="w-full text-center border-b border-slate-300 bg-transparent py-2 focus:outline-none focus:border-blue-600 text-sm italic"
                              value={signatureName}
                              onChange={(e) => setSignatureName(e.target.value)}
                            />
                            <Button 
                              variant="primary" 
                              size="sm" 
                              className="mt-4 rounded-full w-full py-2 text-[10px] uppercase tracking-widest"
                              onClick={handleSign}
                              isLoading={isSigning}
                              disabled={!signatureName.trim()}
                            >
                              {t('sign_btn')}
                            </Button>
                        </div>
                    ) : (
                        <div className="h-10 mb-2 flex items-center justify-center">
                            <span className="text-[10px] text-slate-300 italic font-medium uppercase tracking-widest animate-pulse">
                                {t('waiting_sign')}
                            </span>
                        </div>
                    )
                )}
              </div>
              
              {/* PARTY B / RESPONDENT SIGNATURE BLOCK */}
              <div className="border-t-2 border-slate-900 pt-8 text-center">
                <p className="text-[10px] font-black text-slate-400 mb-12 uppercase tracking-[0.3em]">
                    {t('sign_party_b')}
                </p>

                {respondentSigned ? (
                   <div className="animate-in fade-in zoom-in duration-500">
                    <p className="font-serif italic text-blue-900 text-3xl mb-1">{respondentSigned}</p>
                    <p className="text-[8px] text-emerald-600 font-black uppercase tracking-widest">{t('digital_sign')}</p>
                    <p className="text-[10px] text-slate-300 font-bold">{t('date')} {new Date(caseState?.respondent_signed_at || new Date()).toLocaleDateString()}</p>
                   </div>
                ) : (
                    amISigningAsRespondent ? (
                        <div className="print:hidden">
                            <input 
                              type="text" 
                              placeholder={t('sign_placeholder')}
                              className="w-full text-center border-b border-slate-300 bg-transparent py-2 focus:outline-none focus:border-blue-600 text-sm italic"
                              value={signatureName}
                              onChange={(e) => setSignatureName(e.target.value)}
                            />
                            <Button 
                              variant="primary" 
                              size="sm" 
                              className="mt-4 rounded-full w-full py-2 text-[10px] uppercase tracking-widest"
                              onClick={handleSign}
                              isLoading={isSigning}
                              disabled={!signatureName.trim()}
                            >
                              {t('sign_btn')}
                            </Button>
                        </div>
                    ) : (
                        <div className="h-10 mb-2 flex items-center justify-center">
                            <span className="text-[10px] text-slate-300 italic font-medium uppercase tracking-widest animate-pulse">
                                {t('waiting_sign')}
                            </span>
                        </div>
                    )
                )}
              </div>
            </div>
          </div>
        </Card>

        <footer className="py-20 flex flex-col items-center gap-8 print:hidden">
          {bothSigned && (
            <div className="bg-slate-900 text-white p-10 rounded-[32px] text-center max-w-sm shadow-2xl relative overflow-hidden group animate-in slide-in-from-bottom-8">
              <div className="absolute inset-0 bg-blue-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500 opacity-20"></div>
              <ICONS.Check className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <p className="text-lg font-black mb-2 uppercase tracking-tight">{t('congrats')}</p>
              <p className="text-xs text-slate-400 leading-relaxed font-medium mb-6">
                 {t('signed_desc')}
              </p>
              <div className="space-y-3">
                <Button variant="primary" className="w-full rounded-2xl py-4 bg-blue-600 border-none shadow-xl" onClick={() => window.print()}>
                   {t('download_dossier')}
                </Button>
                <button 
                  onClick={downloadChatHistory}
                  className="w-full text-center text-[10px] font-black text-slate-400 uppercase tracking-widest py-2"
                >
                  {t('download_chat')}
                </button>
              </div>
            </div>
          )}
          
          {haveISigned && !bothSigned && (
             <p className="text-sm font-medium text-slate-500 animate-pulse">
               Je hebt getekend. Wachten op de andere partij...
             </p>
          )}

          <button 
            onClick={onReset}
            className="text-[10px] font-black text-slate-300 hover:text-red-500 uppercase tracking-widest transition-colors duration-300"
          >
            {t('delete_close')}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default VSO;
