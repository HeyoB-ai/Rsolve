import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Scale, Lock, Sparkles, Building2, MapPin, Globe, Mail, Phone, User, Check } from 'lucide-react';
import LangBar from '../components/landing/components/LangBar';
import { track } from '../lib/analytics';

const ACCENT = '#00E5FF';

const encode = (data: Record<string, string>) =>
  Object.keys(data).map((k) => encodeURIComponent(k) + '=' + encodeURIComponent(data[k])).join('&');

const voordelen = [
  { icon: Sparkles, title: 'Voorbemiddelde, gemotiveerde zaken', text: 'De mensen die je bereikt hebben eerst geprobeerd hun conflict samen op te lossen via onze mediator. Ze zijn serieus, en de kwestie is al gestructureerd in kaart gebracht.' },
  { icon: MapPin, title: 'Gematcht op rechtsgebied en regio', text: 'Je ziet alleen zaken die bij jouw specialisatie en werkgebied passen — geen ruis, geen koude leads.' },
  { icon: Lock, title: 'Privacy vooraf gewaarborgd', text: 'Je beoordeelt eerst een volledig geanonimiseerde samenvatting. Pas als je een zaak claimt én de cliënt akkoord gaat, krijg je het volledige dossier en de contactgegevens.' },
  { icon: Scale, title: 'Compliant opgezet', text: 'Je betaalt een vaste advertentiebijdrage om zichtbaar te zijn en zaken te claimen — geen vergoeding per aangebrachte zaak. Zo blijft het binnen de gedragsregels voor de advocatuur.' },
];

const stappen = [
  { n: '1', title: 'Adverteer', text: 'Word partner met een vaste bijdrage en word zichtbaar bij mensen die juridische hulp zoeken.' },
  { n: '2', title: 'Ontvang gematchte zaken', text: 'Passende, geanonimiseerde zaken verschijnen op basis van je rechtsgebied en regio.' },
  { n: '3', title: 'Claim wat past', text: 'Claim een zaak; na toestemming van de cliënt ontvang je het volledige dossier en neem je contact op.' },
];

const rechtsgebieden = ['Arbeidsrecht', 'Huurrecht', 'Familie- & relatierecht', 'Ondernemings- & contractrecht', 'Verbintenissen- & incassorecht', 'Consumentenrecht', 'Anders'];

const Partners: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ kantoornaam: '', contactpersoon: '', email: '', telefoon: '', rechtsgebieden: '', regio: '', website: '', bericht: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle');

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.kantoornaam.trim() || !form.contactpersoon.trim() || !form.email.trim()) return;
    setStatus('sending');
    try {
      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encode({ 'form-name': 'partner-aanmelding', ...form }),
      });
      if (!res.ok) throw new Error('mislukt');
      setStatus('ok');
      track('Partner-aanmelding', form.rechtsgebieden ? { rechtsgebied: form.rechtsgebieden } : undefined);
    } catch {
      setStatus('error');
    }
  };

  const inputClass =
    'w-full p-3.5 rounded-xl border border-slate-700 bg-slate-900 text-sm font-medium text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all';

  return (
    <>
      <LangBar />
      <div className="rsolve-dark min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center p-6 pt-14 pb-20 antialiased">
      <div className="w-full max-w-5xl space-y-16">

        {/* Header */}
        <header className="text-center max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-300 bg-cyan-400/10 border border-cyan-400/20 px-3 py-1 rounded-full mb-5">
            <Scale className="w-3.5 h-3.5" /> Voor advocaten &amp; juristen
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.05]">Word partner van Rsolve</h1>
          <p className="text-slate-400 font-medium mt-5 leading-relaxed text-lg">
            Wanneer mensen er via onze AI-mediator niet uitkomen, zoeken ze een professional. Adverteer op Rsolve en word zichtbaar bij deze gemotiveerde, voorbemiddelde zaken — netjes gematcht op jouw rechtsgebied en regio.
          </p>
        </header>

        {/* Voordelen */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {voordelen.map((v) => (
            <div key={v.title} className="bg-slate-900/70 rounded-2xl p-6 border border-slate-800 hover:border-slate-700 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center mb-4" style={{ color: ACCENT }}>
                <v.icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-white text-base mb-1.5">{v.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{v.text}</p>
            </div>
          ))}
        </section>

        {/* Hoe werkt het */}
        <section className="space-y-8">
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white text-center tracking-tight">Hoe het werkt</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stappen.map((s) => (
              <div key={s.n} className="bg-slate-900/70 rounded-2xl p-6 border border-slate-800 text-center">
                <div className="w-11 h-11 rounded-xl text-slate-950 flex items-center justify-center mx-auto mb-3 font-extrabold" style={{ backgroundColor: ACCENT }}>{s.n}</div>
                <h3 className="font-semibold text-white text-sm mb-1">{s.title}</h3>
                <p className="text-xs text-slate-400 font-medium leading-relaxed">{s.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Aanmeldformulier */}
        <section className="bg-slate-900/70 rounded-3xl p-8 border border-slate-800 shadow-2xl max-w-2xl mx-auto w-full">
          {status === 'ok' ? (
            <div className="text-center py-10 space-y-4">
              <div className="w-16 h-16 bg-emerald-500/15 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-white">Bedankt voor je interesse!</h2>
              <p className="text-slate-400 font-medium">We nemen persoonlijk contact met je op om de mogelijkheden en tarieven door te nemen.</p>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <h2 className="font-display text-2xl font-extrabold text-white tracking-tight">Meld je aan als partner</h2>
                <p className="text-slate-400 font-medium mt-2 text-sm">Laat je gegevens achter, dan bespreken we de mogelijkheden en tarieven persoonlijk. Geen kosten per zaak — een vaste advertentiebijdrage.</p>
              </div>
              <form name="partner-aanmelding" method="POST" data-netlify="true" netlify-honeypot="bot-field" onSubmit={handleSubmit} className="space-y-4">
                <input type="hidden" name="form-name" value="partner-aanmelding" />
                <p className="hidden"><label>Laat dit veld leeg: <input name="bot-field" /></label></p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative"><Building2 className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" /><input className={inputClass + ' pl-10'} name="kantoornaam" placeholder="Kantoornaam *" value={form.kantoornaam} onChange={set('kantoornaam')} /></div>
                  <div className="relative"><User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" /><input className={inputClass + ' pl-10'} name="contactpersoon" placeholder="Contactpersoon *" value={form.contactpersoon} onChange={set('contactpersoon')} /></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative"><Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" /><input className={inputClass + ' pl-10'} type="email" name="email" placeholder="E-mailadres *" value={form.email} onChange={set('email')} /></div>
                  <div className="relative"><Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" /><input className={inputClass + ' pl-10'} type="tel" name="telefoon" placeholder="Telefoon" value={form.telefoon} onChange={set('telefoon')} /></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <select className={inputClass} name="rechtsgebieden" value={form.rechtsgebieden} onChange={set('rechtsgebieden')}>
                    <option value="">Rechtsgebied…</option>
                    {rechtsgebieden.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <div className="relative"><MapPin className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" /><input className={inputClass + ' pl-10'} name="regio" placeholder="Regio / werkgebied" value={form.regio} onChange={set('regio')} /></div>
                </div>
                <div className="relative"><Globe className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" /><input className={inputClass + ' pl-10'} name="website" placeholder="Website (optioneel)" value={form.website} onChange={set('website')} /></div>
                <textarea className={inputClass} name="bericht" placeholder="Eventuele toelichting" rows={3} value={form.bericht} onChange={set('bericht')} />
                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="w-full rounded-xl py-3.5 text-sm font-semibold text-slate-950 shadow-lg transition-all hover:opacity-95 active:scale-[0.99] disabled:opacity-60"
                  style={{ backgroundColor: ACCENT }}
                >
                  {status === 'sending' ? 'Versturen…' : 'Aanmelden als partner'}
                </button>
                {status === 'error' && (
                  <p className="text-sm text-red-400 font-semibold text-center">Er ging iets mis. Probeer het later opnieuw of mail naar clareco.online@gmail.com.</p>
                )}
                <p className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500"><ShieldCheck className="w-3.5 h-3.5" /> Vrijblijvend — we bespreken de mogelijkheden persoonlijk.</p>
              </form>
            </>
          )}
        </section>

        {/* Terug naar home */}
        <div className="text-center">
          <button onClick={() => navigate('/')} className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> Terug naar home
          </button>
        </div>
      </div>
      </div>
    </>
  );
};

export default Partners;
