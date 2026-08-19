import React, { useState } from 'react';
import { Logo } from '../components/ui/Logo';
import { Button } from '../components/ui/Button';
import LangBar from '../components/landing/components/LangBar';
import { track } from '../lib/analytics';

const encode = (data: Record<string, string>) =>
  Object.keys(data)
    .map((k) => encodeURIComponent(k) + '=' + encodeURIComponent(data[k]))
    .join('&');

const JuridischeHulp: React.FC = () => {
  const [form, setForm] = useState({ naam: '', email: '', telefoon: '', onderwerp: '', bericht: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle');

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.naam.trim() || !form.email.trim()) return;
    setStatus('sending');
    try {
      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encode({ 'form-name': 'lawyer-request', ...form }),
      });
      if (!res.ok) throw new Error('mislukt');
      setStatus('ok');
      track('Juridische hulp aangevraagd');
    } catch {
      setStatus('error');
    }
  };

  const inputClass =
    'w-full p-4 rounded-2xl border-2 border-slate-700 bg-slate-800 font-medium text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-all';

  return (
    <>
      <LangBar />
      <div className="rsolve-dark min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center p-6 pt-14 pb-20 animate-in fade-in duration-500">
      <div className="w-full max-w-lg space-y-8">
        <div className="text-center">
          <Logo className="w-16 h-16 mx-auto mb-6" />
          <span className="inline-block text-[10px] font-black uppercase tracking-[0.3em] text-cyan-300 bg-cyan-500/10 px-3 py-1 rounded-full mb-4">Juridische hulp</span>
          <h1 className="text-3xl font-black text-white tracking-tight">Advocaat nodig? Wij denken mee.</h1>
          <p className="text-slate-400 font-medium mt-4 leading-relaxed">
            Reageert de andere partij niet, of houdt iemand zich niet aan de afspraken? Dan is juridische hulp soms de enige weg. Rsolve werkt samen met een netwerk van betrouwbare advocaten. Laat je gegevens achter, dan stellen we je vrijblijvend een passende advocaat voor.
          </p>
        </div>

        {status === 'ok' ? (
          <div className="bg-slate-900 rounded-[28px] shadow-xl border border-slate-800 p-10 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mx-auto text-2xl font-black">✓</div>
            <h2 className="text-xl font-black text-white">Aanvraag ontvangen</h2>
            <p className="text-slate-400 font-medium">Bedankt. We nemen zo snel mogelijk contact met je op met een passend voorstel.</p>
            <a href="/" className="inline-block text-cyan-400 font-bold text-sm hover:underline pt-2">← Terug naar home</a>
          </div>
        ) : (
          <form
            name="lawyer-request"
            method="POST"
            data-netlify="true"
            netlify-honeypot="bot-field"
            onSubmit={handleSubmit}
            className="bg-slate-900 rounded-[28px] shadow-xl border border-slate-800 p-8 space-y-4"
          >
            <input type="hidden" name="form-name" value="lawyer-request" />
            <p className="hidden">
              <label>Niet invullen: <input name="bot-field" onChange={() => {}} /></label>
            </p>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1 ml-1">Naam *</label>
              <input className={inputClass} value={form.naam} onChange={set('naam')} placeholder="Je naam" required />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1 ml-1">E-mail *</label>
              <input type="email" className={inputClass} value={form.email} onChange={set('email')} placeholder="je@email.nl" required />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1 ml-1">Telefoon</label>
              <input type="tel" className={inputClass} value={form.telefoon} onChange={set('telefoon')} placeholder="Optioneel" />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1 ml-1">Onderwerp</label>
              <input className={inputClass} value={form.onderwerp} onChange={set('onderwerp')} placeholder="Bijv. arbeidsconflict, huurgeschil" />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1 ml-1">Korte toelichting</label>
              <textarea className={`${inputClass} min-h-[110px] resize-none`} value={form.bericht} onChange={set('bericht')} placeholder="Waar gaat het over? (optioneel)" />
            </div>

            {status === 'error' && (
              <p className="text-center text-xs font-bold text-red-500">Er ging iets mis bij het versturen. Probeer het later opnieuw of bel ons.</p>
            )}

            <Button
              size="lg"
              type="submit"
              className="w-full rounded-2xl py-5 shadow-lg"
              disabled={status === 'sending' || !form.naam.trim() || !form.email.trim()}
              isLoading={status === 'sending'}
            >
              Aanvraag versturen
            </Button>
            <p className="text-[11px] text-slate-400 text-center leading-relaxed">
              Vrijblijvend. We gebruiken je gegevens alleen om je een passende advocaat voor te stellen.
            </p>
          </form>
        )}

        <div className="text-center">
          <a href="/" className="text-cyan-400 font-bold text-sm hover:underline">← Terug naar home</a>
        </div>
      </div>
      </div>
    </>
  );
};

export default JuridischeHulp;
