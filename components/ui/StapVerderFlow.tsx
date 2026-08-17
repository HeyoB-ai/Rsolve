import React, { useState, useEffect, useRef } from 'react';
import { Button } from './Button';
import { UI_TRANSLATIONS } from '../../constants';

// Rsolve Pro — "Stap verder": als het gesprek vastloopt, biedt de mediator aan
// om juridische hulp te zoeken. Splitst op inkomen (advocaat vs. Juridisch Loket).
// Bij de advocaat-route sturen we EERST een GEANONIMISEERDE teaser naar de interne
// Rsolve-inbox (Netlify Forms); het volledige dossier volgt pas als een kantoor aanhaakt.

interface StapVerderFlowProps {
  isOpen: boolean;
  onClose: () => void;
  caseData: any;
  appLanguage: string;
  t: (key: string, params?: any) => string;
}

type Step = 'offer' | 'income' | 'loket' | 'contact' | 'processing' | 'done' | 'error';

const JURIDISCH_LOKET_URL = 'https://www.juridischloket.nl';

const encode = (data: Record<string, string>) =>
  Object.keys(data).map((k) => encodeURIComponent(k) + '=' + encodeURIComponent(data[k])).join('&');

const genExportNo = () =>
  `RP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

const downloadPdf = (b64: string, name: string) => {
  try {
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    const url = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name || 'rsolve-dossier'}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  } catch (e) { console.error('download pdf failed', e); }
};

const ClockLoader: React.FC = () => (
  <>
    <style>{`@keyframes rp-clock-spin { to { transform: rotate(360deg); } }`}</style>
    <svg viewBox="0 0 64 64" className="w-20 h-20 mx-auto" role="img" aria-label="loading">
      <circle cx="32" cy="32" r="28" fill="#eff6ff" stroke="#dbeafe" strokeWidth="4" />
      <g stroke="#bfdbfe" strokeWidth="2.5" strokeLinecap="round">
        <line x1="32" y1="9" x2="32" y2="14" /><line x1="32" y1="55" x2="32" y2="50" />
        <line x1="9" y1="32" x2="14" y2="32" /><line x1="55" y1="32" x2="50" y2="32" />
      </g>
      <line x1="32" y1="32" x2="43" y2="32" stroke="#93c5fd" strokeWidth="3.5" strokeLinecap="round"
        style={{ transformBox: 'view-box', transformOrigin: '32px 32px', animation: 'rp-clock-spin 6s linear infinite' }} />
      <line x1="32" y1="32" x2="32" y2="16" stroke="#00E5FF" strokeWidth="3.5" strokeLinecap="round"
        style={{ transformBox: 'view-box', transformOrigin: '32px 32px', animation: 'rp-clock-spin 1.6s linear infinite' }} />
      <circle cx="32" cy="32" r="3" fill="#00E5FF" />
    </svg>
  </>
);

export const StapVerderFlow: React.FC<StapVerderFlowProps> = ({ isOpen, onClose, caseData, appLanguage, t }) => {
  const [step, setStep] = useState<Step>('offer');
  const [form, setForm] = useState({ naam: '', email: '', telefoon: '' });
  const [consent, setConsent] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const activeRef = useRef<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStep('offer');
      setForm({ naam: caseData?.isRespondent ? (caseData?.respondentName || '') : (caseData?.initiatorName || ''), email: '', telefoon: '' });
      setConsent(false);
      setResult(null);
      setErrorMsg('');
    } else {
      activeRef.current = null;
    }
    return () => { activeRef.current = null; };
  }, [isOpen, caseData]);

  if (!isOpen) return null;

  // Draait de achtergrond-export en pollt tot het klaar is; geeft het resultaat terug.
  const runGenerate = (): Promise<any> => new Promise((resolve, reject) => {
    const reqId = genExportNo();
    activeRef.current = reqId;
    const payload = {
      token: caseData?.token || '',
      type: 'summary',
      language: appLanguage,
      languageName: UI_TRANSLATIONS[appLanguage]?.label || 'Nederlands',
      export_no: reqId,
    };
    fetch('/.netlify/functions/export-generate-background', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
    }).then(() => {
      const startedAt = Date.now();
      const poll = async () => {
        if (activeRef.current !== reqId) return;
        if (Date.now() - startedAt > 180000) { reject(new Error('timeout')); return; }
        try {
          const res = await fetch('/.netlify/functions/export-status', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: caseData?.token || '', export_no: reqId }),
          });
          const data = await res.json().catch(() => ({}));
          if (activeRef.current !== reqId) return;
          if (data?.status === 'rendered') { resolve(data); return; }
          if (data?.status === 'failed') { reject(new Error(String(data?.error || 'failed'))); return; }
          setTimeout(poll, 2500);
        } catch { setTimeout(poll, 3500); }
      };
      setTimeout(poll, 2500);
    }).catch((e) => reject(e));
  });

  // Advocaat-route: dossier genereren -> GEANONIMISEERDE teaser naar interne inbox.
  const submitLawyer = async () => {
    if (!form.naam.trim() || !form.email.trim() || !consent) return;
    setStep('processing');
    setErrorMsg('');
    try {
      const data = await runGenerate();
      setResult(data);
      const teaser = data?.ai_summary?.anonymized_teaser || '(geen anonieme samenvatting beschikbaar)';
      const thema = data?.ai_summary?.category || 'overig';
      await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encode({
          'form-name': 'stap-verder-aanvraag',
          naam: form.naam,
          email: form.email,
          telefoon: form.telefoon,
          route: 'advocaat',
          thema,
          dossiernr: data?.export_no || '',
          case_ref: caseData?.id || '',
          anonieme_samenvatting: teaser,
        }),
      }).catch((e) => { console.error('form submit failed', e); });
      setStep('done');
    } catch (e: any) {
      setErrorMsg(e?.message || 'error');
      setStep('error');
    }
  };

  // Loket-route: eigen dossier genereren om mee te nemen (geen verzending).
  const generateOwnDossier = async () => {
    setStep('processing');
    setErrorMsg('');
    try {
      const data = await runGenerate();
      setResult(data);
      if (data?.pdf_ready && data?.pdf_base64) downloadPdf(data.pdf_base64, data.export_no);
      setStep('loket');
    } catch (e: any) {
      setErrorMsg(e?.message || 'error');
      setStep('error');
    }
  };

  const inputClass = 'w-full p-3.5 rounded-2xl border-2 border-slate-700 bg-slate-800 text-sm font-medium text-slate-200 focus:outline-none focus:border-[#00E5FF] transition-all';

  // Bijkomend voordeel: een gedocumenteerde mediationpoging die je later kunt aantonen.
  const proofNote = (
    <div className="flex items-start gap-2 text-left bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-3">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-emerald-400 shrink-0 mt-0.5"><path d="M20 6 9 17l-5-5" /></svg>
      <p className="text-xs text-emerald-200/90 font-medium leading-relaxed">{t('sv_proof_note')}</p>
    </div>
  );

  return (
    <div className="absolute inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in rounded-[24px]">
      <div className="w-full max-w-md bg-slate-900 rounded-[28px] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-800 shrink-0 flex items-center justify-between">
          <span className="text-xs font-black tracking-tight text-[#00E5FF] bg-cyan-500/10 px-2 py-1 rounded-lg uppercase">Rsolve</span>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 text-2xl leading-none font-light px-1">×</button>
        </div>

        <div className="px-6 py-5 overflow-y-auto">
          {step === 'offer' && (
            <div className="space-y-4 text-center">
              <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 9v4M12 17h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /></svg>
              </div>
              <h2 className="text-lg font-black text-white">{t('sv_offer_title')}</h2>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">{t('sv_offer_text')}</p>
              {proofNote}
            </div>
          )}

          {step === 'income' && (
            <div className="space-y-3">
              <h2 className="text-lg font-black text-white">{t('sv_income_title')}</h2>
              <p className="text-sm text-slate-500 font-medium">{t('sv_income_text')}</p>
              <button onClick={() => setStep('contact')} className="w-full text-left p-4 rounded-2xl border-2 border-slate-700 hover:border-[#00E5FF] transition-all">
                <span className="font-black text-white text-sm">{t('sv_income_lawyer')}</span>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{t('sv_income_lawyer_desc')}</p>
              </button>
              <button onClick={() => setStep('loket')} className="w-full text-left p-4 rounded-2xl border-2 border-slate-700 hover:border-[#00E5FF] transition-all">
                <span className="font-black text-white text-sm">{t('sv_income_low')}</span>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{t('sv_income_low_desc')}</p>
              </button>
            </div>
          )}

          {step === 'loket' && (
            <div className="space-y-4">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 12l2 2 4-4" /><circle cx="12" cy="12" r="9" /></svg>
              </div>
              <h2 className="text-lg font-black text-white text-center">{t('sv_loket_title')}</h2>
              <p className="text-sm text-slate-300 font-medium leading-relaxed">{t('sv_loket_text')}</p>
              <p className="text-xs text-slate-400 leading-relaxed">{t('sv_loket_note')}</p>
              {proofNote}
            </div>
          )}

          {step === 'contact' && (
            <div className="space-y-3">
              <h2 className="text-lg font-black text-white">{t('sv_contact_title')}</h2>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">{t('sv_contact_text')}</p>
              <input className={inputClass} placeholder={t('sv_contact_name')} value={form.naam} onChange={(e) => setForm({ ...form, naam: e.target.value })} />
              <input className={inputClass} type="email" placeholder={t('sv_contact_email')} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <input className={inputClass} type="tel" placeholder={t('sv_contact_phone')} value={form.telefoon} onChange={(e) => setForm({ ...form, telefoon: e.target.value })} />
              <button
                onClick={() => setConsent((c) => !c)}
                className={`w-full flex items-start gap-3 text-left p-4 rounded-2xl border-2 transition-all ${consent ? 'border-[#00E5FF] bg-cyan-500/10' : 'border-slate-700'}`}
              >
                <span className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 ${consent ? 'border-[#00E5FF] bg-[#00E5FF] text-slate-950' : 'border-slate-300'}`}>
                  {consent && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5"><polyline points="20 6 9 17 4 12" /></svg>}
                </span>
                <span className="text-xs text-slate-200 font-medium leading-relaxed">{t('sv_consent_text')}</span>
              </button>
            </div>
          )}

          {step === 'processing' && (
            <div className="py-10 text-center space-y-5">
              <ClockLoader />
              <p className="text-sm text-slate-500 font-medium">{t('sv_processing')}</p>
            </div>
          )}

          {step === 'done' && (
            <div className="space-y-4 text-center">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
              <h2 className="text-lg font-black text-white">{t('sv_done_title')}</h2>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">{t('sv_done_text')}</p>
              {proofNote}
            </div>
          )}

          {step === 'error' && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
                <p className="text-xs font-black text-red-700 uppercase tracking-wider mb-1">{t('sv_error_title')}</p>
                <p className="text-xs text-red-800 leading-relaxed">{t('sv_error_text')}</p>
                <p className="text-[10px] text-red-400 mt-2 font-mono break-all">{errorMsg}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 shrink-0 bg-slate-900">
          {step === 'offer' && (
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" size="lg" className="rounded-2xl" onClick={onClose}>{t('sv_offer_no')}</Button>
              <Button size="lg" className="rounded-2xl" onClick={() => setStep('income')}>{t('sv_offer_yes')}</Button>
            </div>
          )}
          {step === 'income' && (
            <Button variant="ghost" size="md" className="w-full rounded-2xl text-slate-500" onClick={() => setStep('offer')}>{t('sv_back')}</Button>
          )}
          {step === 'loket' && (
            <div className="space-y-2">
              <a href={JURIDISCH_LOKET_URL} target="_blank" rel="noopener noreferrer"
                className="block w-full text-center bg-[#00E5FF] hover:bg-cyan-400 text-slate-950 font-black py-3.5 rounded-2xl transition-colors text-sm shadow-lg">
                {t('sv_loket_link_btn')}
              </a>
              {result?.pdf_ready && result?.pdf_base64 ? (
                <Button variant="outline" size="md" className="w-full rounded-2xl" onClick={() => downloadPdf(result.pdf_base64, result.export_no)}>{t('sv_download_dossier')}</Button>
              ) : (
                <Button variant="outline" size="md" className="w-full rounded-2xl" onClick={generateOwnDossier}>{t('sv_loket_dossier_btn')}</Button>
              )}
              <Button variant="ghost" size="md" className="w-full rounded-2xl text-slate-500" onClick={onClose}>{t('sv_close')}</Button>
            </div>
          )}
          {step === 'contact' && (
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" size="lg" className="rounded-2xl" onClick={() => setStep('income')}>{t('sv_back')}</Button>
              <Button size="lg" className="rounded-2xl" onClick={submitLawyer} disabled={!form.naam.trim() || !form.email.trim() || !consent}>{t('sv_submit_btn')}</Button>
            </div>
          )}
          {step === 'processing' && (
            <Button size="lg" className="w-full rounded-2xl" disabled>{t('sv_processing_btn')}</Button>
          )}
          {step === 'done' && (
            <div className="space-y-2">
              {result?.pdf_ready && result?.pdf_base64 && (
                <Button variant="outline" size="md" className="w-full rounded-2xl" onClick={() => downloadPdf(result.pdf_base64, result.export_no)}>{t('sv_done_download')}</Button>
              )}
              <Button size="lg" className="w-full rounded-2xl" onClick={onClose}>{t('sv_close')}</Button>
            </div>
          )}
          {step === 'error' && (
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" size="lg" className="rounded-2xl" onClick={onClose}>{t('sv_close')}</Button>
              <Button size="lg" className="rounded-2xl" onClick={() => setStep('income')}>{t('sv_back')}</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StapVerderFlow;
