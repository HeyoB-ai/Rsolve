
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
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Verwijder het volledige dossier permanent van de servers (AVG-recht op wissen),
  // en wis daarna de lokale sessie. Twee klikken ter bevestiging.
  const handleDeleteDossier = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 4000);
      return;
    }
    setIsDeleting(true);
    try {
      await fetch('/.netlify/functions/delete-case', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseId: data.caseId }),
      });
    } catch {
      /* zelfs bij een serverfout ruimen we de lokale sessie op */
    } finally {
      onReset();
    }
  };

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
      // Alleen de handtekening-status ophalen — nooit de geheime tokens.
      const { data: c } = await supabase
        .from('cases')
        .select('id, initiator_signature, respondent_signature, initiator_signed_at, respondent_signed_at')
        .eq('id', data.caseId)
        .single();
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

  // Genereert een echte, downloadbare PDF van de vaststellingsovereenkomst.
  // Vervangt window.print() (dat op mobiel/veel browsers niet betrouwbaar werkt).
  const downloadVsoPdf = async () => {
    setIsDownloadingPdf(true);
    try {
      const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
      const pdf = await PDFDocument.create();
      const helv = await pdf.embedFont(StandardFonts.Helvetica);
      const helvB = await pdf.embedFont(StandardFonts.HelveticaBold);
      const helvI = await pdf.embedFont(StandardFonts.HelveticaOblique);

      const PW = 595.28, PH = 841.89, margin = 56;
      const contentW = PW - margin * 2;
      let page = pdf.addPage([PW, PH]);
      let y = PH - margin;

      const slate = rgb(0.06, 0.09, 0.16);
      const gray = rgb(0.2, 0.25, 0.33);
      const muted = rgb(0.58, 0.64, 0.72);
      const accent = rgb(0.145, 0.388, 0.922);
      const hair = rgb(0.89, 0.91, 0.94);

      // Standaard PDF-fonts ondersteunen alleen Latin-1 (WinAnsi); transliteer veelvoorkomende tekens.
      const wa = (s: any) => String(s ?? '')
        .replace(/[‘’‚‹›]/g, "'")
        .replace(/[“”„«»]/g, '"')
        .replace(/[–—]/g, '-')
        .replace(/…/g, '...')
        .replace(/[•●]/g, '-')
        .replace(/ /g, ' ')
        .replace(/[^\x00-\xFF]/g, '?');

      const room = (needed: number) => { if (y - needed < margin) { page = pdf.addPage([PW, PH]); y = PH - margin; } };

      const wrap = (text: string, font: any, size: number, maxW: number) => {
        const out: string[] = [];
        String(text).split('\n').forEach((raw) => {
          const words = raw.split(/\s+/);
          let line = '';
          words.forEach((w) => {
            const test = line ? line + ' ' + w : w;
            if (font.widthOfTextAtSize(wa(test), size) > maxW && line) { out.push(line); line = w; }
            else line = test;
          });
          out.push(line);
        });
        return out;
      };

      const para = (text: string, opts: any = {}) => {
        const { font = helv, size = 11, color = gray, gap = 10, lh = 1.45 } = opts;
        wrap(text, font, size, contentW).forEach((ln) => {
          room(size * lh); y -= size * lh;
          page.drawText(wa(ln), { x: margin, y, size, font, color });
        });
        y -= gap;
      };

      const heading = (text: string) => {
        room(32); y -= 16;
        page.drawText(wa(text.toUpperCase()), { x: margin, y, size: 11, font: helvB, color: slate });
        y -= 6;
        page.drawLine({ start: { x: margin, y }, end: { x: margin + 42, y }, thickness: 2, color: accent });
        y -= 14;
      };

      // Titelblok
      const title = t('settlement_agreement');
      y -= 24;
      page.drawText(wa(title), { x: (PW - helvB.widthOfTextAtSize(wa(title), 20)) / 2, y, size: 20, font: helvB, color: slate });
      y -= 16;
      const sub = t('legal_accord');
      page.drawText(wa(sub), { x: (PW - helv.widthOfTextAtSize(wa(sub), 9)) / 2, y, size: 9, font: helv, color: muted });
      y -= 12;
      page.drawLine({ start: { x: margin, y }, end: { x: PW - margin, y }, thickness: 1, color: hair });
      y -= 6;

      heading(t('section_parties'));
      para(`${t('party_a')} (Initiator): ${initiatorName}`, { font: helvB, color: slate, gap: 4 });
      para(`${t('party_b')} (Respondent): ${respondentName}`, { font: helvB, color: slate, gap: 16 });

      heading(t('section_dispute'));
      para(t('dispute_desc'), { font: helvI, gap: 4 });
      para(`"${data.title}"`, { font: helvB, color: slate, gap: 16 });

      heading(t('section_terms'));
      para(data.terms || t('no_terms'), { gap: 16 });

      heading(t('section_final'));
      para(t('final_text'), { font: helvI, size: 9, color: muted, gap: 24 });

      // Handtekeningblok
      room(90); y -= 30;
      const colW = (contentW - 40) / 2;
      const leftX = margin, rightX = margin + colW + 40;
      page.drawLine({ start: { x: leftX, y }, end: { x: leftX + colW, y }, thickness: 1.2, color: slate });
      page.drawLine({ start: { x: rightX, y }, end: { x: rightX + colW, y }, thickness: 1.2, color: slate });
      y -= 14;
      page.drawText(wa(t('sign_party_a')), { x: leftX, y, size: 8, font: helvB, color: muted });
      page.drawText(wa(t('sign_party_b')), { x: rightX, y, size: 8, font: helvB, color: muted });
      y -= 22;
      page.drawText(wa(initiatorSigned || ''), { x: leftX, y, size: 16, font: helvI, color: accent });
      page.drawText(wa(respondentSigned || ''), { x: rightX, y, size: 16, font: helvI, color: accent });
      y -= 13;
      const iDate = caseState?.initiator_signed_at ? new Date(caseState.initiator_signed_at).toLocaleDateString('nl-NL') : '';
      const rDate = caseState?.respondent_signed_at ? new Date(caseState.respondent_signed_at).toLocaleDateString('nl-NL') : '';
      page.drawText(wa(`${t('digital_sign')} - ${t('date')} ${iDate}`), { x: leftX, y, size: 7, font: helv, color: muted });
      page.drawText(wa(`${t('digital_sign')} - ${t('date')} ${rDate}`), { x: rightX, y, size: 7, font: helv, color: muted });

      const bytes = await pdf.save();
      const blob = new Blob([bytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vaststellingsovereenkomst-${String(data.title || 'dossier').replace(/\s+/g, '-').toLowerCase()}.pdf`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('PDF download mislukt:', e);
      alert('Kon het dossier niet downloaden. Probeer het opnieuw.');
    } finally {
      setIsDownloadingPdf(false);
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
    <div className="rsolve-dark min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12 flex flex-col items-center animate-in fade-in duration-700">
      <div className="w-full max-w-3xl space-y-8">
        <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 print:hidden">
          <div className="flex items-center gap-3">
            <Logo className="w-12 h-12" />
            <div>
              <h1 className="text-xl font-bold text-white">{t('vso_title')}</h1>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{t('legal_doc')}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={downloadChatHistory}
              isLoading={isDownloadingLog}
              className="rounded-xl hidden md:inline-flex"
            >
              <ICONS.Folder className="w-4 h-4 mr-2" /> {t('download_chat')}
            </Button>
            <Button variant="outline" size="sm" onClick={downloadVsoPdf} isLoading={isDownloadingPdf} className="rounded-xl">
              <ICONS.File className="w-4 h-4 mr-2" /> {t('download_pdf')}
            </Button>
          </div>
        </header>

        {/* Disclaimer vóór ondertekening — geen juridische toets */}
        <div className="print:hidden bg-amber-500/10 border border-amber-400/25 rounded-2xl p-4 flex gap-3 items-start">
          <ICONS.Shield className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-100/90 leading-relaxed">
            <span className="font-bold text-amber-200">Let op:</span> deze vaststellingsovereenkomst legt uitsluitend jullie eigen afspraken vast. Het is <span className="font-semibold">geen juridisch advies en geen juridische toetsing</span>. Laat het document bij twijfel controleren door een jurist of advocaat voordat je tekent.
          </p>
        </div>

        {/* Het VSO-document blijft bewust 'papier'-wit (ook in de donkere app), zoals een officieel document / PDF. */}
        <div className="bg-white text-slate-900 p-5 sm:p-12 md:p-20 shadow-2xl relative overflow-hidden print:p-0 print:shadow-none rounded-[4px] min-h-[600px] md:min-h-[1000px]">
          {/* Watermark */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] rotate-[15deg] select-none pointer-events-none w-full flex justify-center">
            <Logo className="w-[600px] h-[600px]" />
          </div>

          <div className="prose prose-slate max-w-none relative z-10">
            <div className="text-center mb-10 sm:mb-16 border-b-2 border-slate-100 pb-6 sm:pb-10">
              <h2 className="text-lg sm:text-3xl font-black text-slate-900 uppercase tracking-tight mb-2 break-words">{t('settlement_agreement')}</h2>
              <p className="text-[9px] sm:text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] sm:tracking-[0.4em]">{t('legal_accord')}</p>
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
              <div className="text-base text-slate-800 leading-loose whitespace-pre-wrap bg-blue-50/30 p-5 sm:p-10 rounded-2xl border border-blue-100 font-serif shadow-inner break-words">
                {data.terms || t('no_terms')}
              </div>
            </section>

            <section className="mb-20">
              <h3 className="text-xs font-black text-slate-900 mb-4 uppercase tracking-widest border-l-4 border-blue-600 pl-3">{t('section_final')}</h3>
              <p className="text-xs text-slate-500 leading-relaxed italic bg-slate-50 p-6 rounded-xl border border-slate-100">
                {t('final_text')}
              </p>
            </section>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 sm:gap-16 mt-16 sm:mt-32">
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
        </div>

        <footer className="py-20 flex flex-col items-center gap-8 print:hidden">
          {bothSigned && (
            <div className="bg-slate-900 text-white p-10 rounded-[32px] text-center max-w-sm shadow-2xl relative overflow-hidden group animate-in slide-in-from-bottom-8">
              <div className="absolute inset-0 bg-cyan-500 translate-y-full group-hover:translate-y-0 transition-transform duration-500 opacity-10 pointer-events-none"></div>
              <ICONS.Check className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
              <p className="text-lg font-black mb-2 uppercase tracking-tight">{t('congrats')}</p>
              <p className="text-xs text-slate-400 leading-relaxed font-medium mb-6">
                 {t('signed_desc')}
              </p>
              <div className="space-y-3">
                <Button variant="primary" className="w-full rounded-2xl py-4 border-none shadow-xl relative z-10" onClick={downloadVsoPdf} isLoading={isDownloadingPdf}>
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
            onClick={handleDeleteDossier}
            disabled={isDeleting}
            className={`text-[10px] font-black uppercase tracking-widest transition-colors duration-300 disabled:opacity-60 ${confirmDelete ? 'text-red-500' : 'text-slate-300 hover:text-red-500'}`}
          >
            {isDeleting
              ? 'Bezig met verwijderen…'
              : confirmDelete
                ? 'Zeker weten? Klik nogmaals om alles permanent te verwijderen'
                : t('delete_close')}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default VSO;
