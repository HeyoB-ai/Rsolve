import React, { useState, useEffect, useRef } from 'react';
import { Button } from './Button';
import { UI_TRANSLATIONS } from '../../constants';

// Rsolve Pro — Fase 4: begeleide wizard voor het genereren van een
// professioneel overdrachtsdossier. Vervangt de tijdelijke test-knop.
// Stappen: type -> taal -> overzicht -> toestemming -> genereren -> resultaat.

interface RsolveProWizardProps {
  isOpen: boolean;
  onClose: () => void;
  caseData: any;
  appLanguage: string;
  t: (key: string, params?: any) => string;
}

type Step = 'type' | 'language' | 'review' | 'consent' | 'generating' | 'result' | 'error';

// Talenlijst voor de dossiertaal (uit de bestaande UI-vertalingen).
const LANG_OPTIONS = Object.keys(UI_TRANSLATIONS).map((code) => ({
  code,
  label: UI_TRANSLATIONS[code]?.label || code,
}));

const downloadPdf = (b64: string, name: string) => {
  try {
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    const blob = new Blob([bytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name || 'rsolve-dossier'}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  } catch (e) {
    console.error('download pdf failed', e);
  }
};

export const RsolveProWizard: React.FC<RsolveProWizardProps> = ({ isOpen, onClose, caseData, appLanguage, t }) => {
  const [step, setStep] = useState<Step>('type');
  const [docType, setDocType] = useState<'summary' | 'full'>('summary');
  const [docLang, setDocLang] = useState<string>(appLanguage || 'nl');
  const [consent, setConsent] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const activeRef = useRef<string | null>(null); // stopt de poll bij sluiten/opnieuw openen

  useEffect(() => {
    if (isOpen) {
      setStep('type');
      setDocType('summary');
      setDocLang(appLanguage || 'nl');
      setConsent(false);
      setResult(null);
      setErrorMsg('');
    } else {
      activeRef.current = null;
    }
    return () => { activeRef.current = null; };
  }, [isOpen, appLanguage]);

  if (!isOpen) return null;

  const genExportNo = () =>
    `RP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

  // De export draait als achtergrondfunctie (geen 10s-limiet). We starten hem en
  // pollen daarna 'export-status' tot het dossier klaar is of faalt.
  const generate = async () => {
    setStep('generating');
    setErrorMsg('');
    const reqId = genExportNo();
    activeRef.current = reqId;
    const payload = {
      token: caseData?.token || '',
      type: docType,
      language: docLang,
      languageName: UI_TRANSLATIONS[docLang]?.label || 'Nederlands',
      export_no: reqId,
    };

    try {
      await fetch('/.netlify/functions/export-generate-background', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (e: any) {
      setErrorMsg(e?.message || 'network_error');
      setStep('error');
      return;
    }

    const startedAt = Date.now();
    const POLL_TIMEOUT_MS = 180000; // 3 minuten
    const POLL_INTERVAL_MS = 2500;

    const poll = async () => {
      if (activeRef.current !== reqId) return; // wizard gesloten/opnieuw gestart
      if (Date.now() - startedAt > POLL_TIMEOUT_MS) {
        setErrorMsg('timeout');
        setStep('error');
        return;
      }
      try {
        const res = await fetch('/.netlify/functions/export-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: caseData?.token || '', export_no: reqId }),
        });
        const data = await res.json().catch(() => ({}));
        if (activeRef.current !== reqId) return;
        if (data?.status === 'rendered') {
          setResult(data);
          setStep('result');
          return;
        }
        if (data?.status === 'failed') {
          setErrorMsg(String(data?.error || 'generation_failed'));
          setStep('error');
          return;
        }
        setTimeout(poll, POLL_INTERVAL_MS); // pending/processing → blijf pollen
      } catch {
        setTimeout(poll, 3500); // tijdelijke fout → doorgaan tot de timeout
      }
    };
    setTimeout(poll, POLL_INTERVAL_MS);
  };

  const StepDots = () => {
    const order: Step[] = ['type', 'language', 'review', 'consent'];
    const idx = order.indexOf(step);
    return (
      <div className="flex items-center justify-center gap-1.5">
        {order.map((s, i) => (
          <span key={s} className={`h-1.5 rounded-full transition-all ${i <= idx ? 'w-6 bg-[#0b50da]' : 'w-1.5 bg-slate-200'}`} />
        ))}
      </div>
    );
  };

  return (
    <div className="absolute inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in rounded-[24px]">
      <div className="w-full max-w-md bg-white rounded-[28px] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-tight text-[#0b50da] bg-blue-50 px-2 py-1 rounded-lg uppercase">Rsolve Pro</span>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-2xl leading-none font-light px-1">×</button>
          </div>
          <h2 className="text-lg font-black text-slate-900">{t('pro_wizard_title')}</h2>
          {(step === 'type' || step === 'language' || step === 'review' || step === 'consent') && (
            <div className="mt-3"><StepDots /></div>
          )}
        </div>

        {/* Body */}
        <div className="px-6 py-5 overflow-y-auto">
          {step === 'type' && (
            <div className="space-y-3">
              <p className="text-sm text-slate-500 font-medium">{t('pro_type_intro')}</p>
              {([
                { key: 'summary', label: t('pro_type_summary_label'), desc: t('pro_type_summary_desc') },
                { key: 'full', label: t('pro_type_full_label'), desc: t('pro_type_full_desc') },
              ] as const).map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setDocType(opt.key as 'summary' | 'full')}
                  className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${docType === opt.key ? 'border-[#0b50da] bg-blue-50/50' : 'border-slate-200 hover:border-slate-300'}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-slate-900 text-sm">{opt.label}</span>
                    <span className={`w-4 h-4 rounded-full border-2 ${docType === opt.key ? 'border-[#0b50da] bg-[#0b50da]' : 'border-slate-300'}`} />
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{opt.desc}</p>
                </button>
              ))}
            </div>
          )}

          {step === 'language' && (
            <div className="space-y-3">
              <p className="text-sm text-slate-500 font-medium">{t('pro_language_intro')}</p>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">{t('pro_language_label')}</label>
              <select
                value={docLang}
                onChange={(e) => setDocLang(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-bold text-slate-800 focus:outline-none focus:border-[#0b50da] focus:ring-4 focus:ring-blue-50/50"
              >
                {LANG_OPTIONS.map((l) => (
                  <option key={l.code} value={l.code}>{l.label}</option>
                ))}
              </select>
              <p className="text-xs text-slate-400 leading-relaxed">{t('pro_language_hint')}</p>
            </div>
          )}

          {step === 'review' && (
            <div className="space-y-4">
              <p className="text-sm text-slate-500 font-medium">{t('pro_review_intro')}</p>
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-2">{t('pro_review_included_title')}</p>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  <li className="flex gap-2"><span className="text-emerald-500 font-black">✓</span>{t('pro_review_inc_conversation')}</li>
                  <li className="flex gap-2"><span className="text-emerald-500 font-black">✓</span>{t('pro_review_inc_summary')}</li>
                  <li className="flex gap-2"><span className="text-emerald-500 font-black">✓</span>{t('pro_review_inc_own_notes')}</li>
                  <li className="flex gap-2"><span className="text-emerald-500 font-black">✓</span>{t('pro_review_inc_hash')}</li>
                </ul>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{t('pro_review_excluded_title')}</p>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  <li className="flex gap-2"><span className="text-slate-400 font-black">✕</span>{t('pro_review_exc_other_notes')}</li>
                  <li className="flex gap-2"><span className="text-slate-400 font-black">✕</span>{t('pro_review_exc_judgment')}</li>
                </ul>
              </div>
            </div>
          )}

          {step === 'consent' && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600 font-medium leading-relaxed">{t('pro_consent_text')}</p>
              <button
                onClick={() => setConsent((c) => !c)}
                className={`w-full flex items-start gap-3 text-left p-4 rounded-2xl border-2 transition-all ${consent ? 'border-[#0b50da] bg-blue-50/50' : 'border-slate-200'}`}
              >
                <span className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 ${consent ? 'border-[#0b50da] bg-[#0b50da] text-white' : 'border-slate-300'}`}>
                  {consent && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5"><polyline points="20 6 9 17 4 12" /></svg>}
                </span>
                <span className="text-xs text-slate-700 font-medium leading-relaxed">{t('pro_consent_checkbox')}</span>
              </button>
            </div>
          )}

          {step === 'generating' && (
            <div className="py-10 text-center space-y-4">
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="h-full bg-[#0b50da] animate-pulse w-2/3 rounded-full" />
              </div>
              <p className="text-sm text-slate-500 font-medium">{t('pro_generating')}</p>
            </div>
          )}

          {step === 'error' && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
                <p className="text-xs font-black text-red-700 uppercase tracking-wider mb-1">{t('pro_error_title')}</p>
                <p className="text-xs text-red-800 leading-relaxed">{t('pro_error_text')}</p>
                <p className="text-[10px] text-red-400 mt-2 font-mono break-all">{errorMsg}</p>
              </div>
            </div>
          )}

          {step === 'result' && result && (
            <div className="space-y-4">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
              <p className="text-center text-sm font-black text-slate-900">{t('pro_result_title')}</p>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="block text-slate-400 font-bold uppercase tracking-wider text-[9px]">{t('pro_result_docnr')}</span>
                  <span className="font-mono font-bold text-slate-800">{result.export_no}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="block text-slate-400 font-bold uppercase tracking-wider text-[9px]">{t('pro_result_items')}</span>
                  <span className="font-bold text-slate-800">{result.counts?.messages ?? 0}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 col-span-2">
                  <span className="block text-slate-400 font-bold uppercase tracking-wider text-[9px]">{t('pro_result_hash')}</span>
                  <span className="font-mono text-[9px] text-slate-500 break-all">{result.hash}</span>
                </div>
              </div>
              {result.ai_summary?.professional_summary && (
                <div className="bg-blue-50/60 p-3 rounded-xl border border-blue-100 max-h-40 overflow-y-auto">
                  <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{result.ai_summary.professional_summary}</p>
                </div>
              )}
              <p className="text-[9px] text-slate-400 italic leading-relaxed">{result.disclaimer}</p>
            </div>
          )}
        </div>

        {/* Footer / navigation */}
        <div className="px-6 py-4 border-t border-slate-100 shrink-0 bg-white">
          {step === 'type' && (
            <Button size="lg" className="w-full rounded-2xl" onClick={() => setStep('language')}>{t('pro_next')}</Button>
          )}
          {step === 'language' && (
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" size="lg" className="rounded-2xl" onClick={() => setStep('type')}>{t('pro_back')}</Button>
              <Button size="lg" className="rounded-2xl" onClick={() => setStep('review')}>{t('pro_next')}</Button>
            </div>
          )}
          {step === 'review' && (
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" size="lg" className="rounded-2xl" onClick={() => setStep('language')}>{t('pro_back')}</Button>
              <Button size="lg" className="rounded-2xl" onClick={() => setStep('consent')}>{t('pro_next')}</Button>
            </div>
          )}
          {step === 'consent' && (
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" size="lg" className="rounded-2xl" onClick={() => setStep('review')}>{t('pro_back')}</Button>
              <Button size="lg" className="rounded-2xl" onClick={generate} disabled={!consent}>{t('pro_generate_btn')}</Button>
            </div>
          )}
          {step === 'generating' && (
            <Button size="lg" className="w-full rounded-2xl" disabled>{t('pro_generating_btn')}</Button>
          )}
          {step === 'error' && (
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" size="lg" className="rounded-2xl" onClick={onClose}>{t('pro_close')}</Button>
              <Button size="lg" className="rounded-2xl" onClick={() => setStep('consent')}>{t('pro_retry')}</Button>
            </div>
          )}
          {step === 'result' && result && (
            <div className="space-y-2">
              {result.pdf_ready && result.pdf_base64 ? (
                <button
                  onClick={() => downloadPdf(result.pdf_base64, result.export_no)}
                  className="block w-full text-center bg-[#0b50da] hover:bg-blue-700 text-white font-black py-3.5 rounded-2xl transition-colors text-sm shadow-lg"
                >
                  {t('pro_download_btn')}
                </button>
              ) : (
                <p className="text-[11px] text-amber-600 font-bold text-center">{t('pro_pdf_unavailable')}{result.pdf_error ? `: ${result.pdf_error}` : ''}</p>
              )}
              <Button variant="ghost" size="md" className="w-full rounded-2xl text-slate-500" onClick={onClose}>{t('pro_close')}</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RsolveProWizard;
