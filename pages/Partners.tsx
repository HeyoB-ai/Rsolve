import React, { useState } from 'react';
import { Logo } from '../components/ui/Logo';
import { Button } from '../components/ui/Button';

const encode = (data: Record<string, string>) =>
  Object.keys(data)
    .map((k) => encodeURIComponent(k) + '=' + encodeURIComponent(data[k]))
    .join('&');

const voordelen = [
  {
    title: 'Voorbemiddelde, gemotiveerde zaken',
    text: 'De mensen die je bereikt hebben eerst geprobeerd hun conflict samen op te lossen via onze mediator. Ze zijn serieus, en de kwestie is al gestructureerd in kaart gebracht.',
  },
  {
    title: 'Gematcht op rechtsgebied en regio',
    text: 'Je ziet alleen zaken die bij jouw specialisatie en werkgebied passen — geen ruis, geen koude leads.',
  },
  {
    title: 'Privacy vooraf gewaarborgd',
    text: 'Je beoordeelt eerst een volledig geanonimiseerde samenvatting. Pas als je een zaak claimt én de cliënt akkoord gaat, krijg je het volledige dossier en de contactgegevens.',
  },
  {
    title: 'Compliant opgezet',
    text: 'Je betaalt een vaste advertentiebijdrage om zichtbaar te zijn en zaken te claimen — geen vergoeding per aangebrachte zaak. Zo blijft het binnen de gedragsregels voor de advocatuur.',
  },
];

const stappen = [
  { n: '1', title: 'Adverteer', text: 'Word partner met een vaste bijdrage en word zichtbaar bij mensen die juridische hulp zoeken.' },
  { n: '2', title: 'Ontvang gematchte zaken', text: 'Passende, geanonimiseerde zaken verschijnen op basis van je rechtsgebied en regio.' },
  { n: '3', title: 'Claim wat past', text: 'Claim een zaak; na toestemming van de cliënt ontvang je het volledige dossier en neem je contact op.' },
];

const rechtsgebieden = ['Arbeidsrecht', 'Huurrecht', 'Familie- & relatierecht', 'Ondernemings- & contractrecht', 'Verbintenissen- & incassorecht', 'Consumentenrecht', 'Anders'];

const Partners: React.FC = () => {
  const [form, setForm] = useState({
    kantoornaam: '', contactpersoon: '', email: '', telefoon: '', rechtsgebieden: '', regio: '', website: '', bericht: '',
  });
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
    } catch {
      setStatus('error');
    }
  };

  const inputClass =
    'w-full p-4 rounded-2xl border-2 border-slate-100 bg-slate-50 font-medium text-slate-700 focus:outline-none focus:border-[#0b50da] transition-all';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-6 pt-14 pb-20 animate-in fade-in duration-500">
      <div className="w-full max-w-4xl space-y-14">

        {/* Header */}
        <header className="text-center max-w-2xl mx-auto">
          <Logo className="w-16 h-16 mx-auto mb-6" />
          <span className="inline-block text-[10px] font-black uppercase tracking-[0.3em] text-[#0b50da] bg-blue-50 px-3 py-1 rounded-full mb-4">Voor advocaten & juristen</span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">Word partner van Rsolve</h1>
          <p className="text-slate-500 font-medium mt-4 leading-relaxed">
            Wanneer mensen er via onze AI-mediator niet uitkomen, zoeken ze een professional. Adverteer op Rsolve en word zichtbaar bij deze gemotiveerde, voorbemiddelde zaken — netjes gematcht op jouw rechtsgebied en regio.
          </p>
        </header>

        {/* Voordelen */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {voordelen.map((v) => (
            <div key={v.title} className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm">
              <h3 className="font-black text-slate-900 text-base mb-2">{v.title}</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">{v.text}</p>
            </div>
          ))}
        </section>

        {/* Hoe werkt het */}
        <section className="space-y-6">
          <h2 className="text-2xl font-black text-slate-900 text-center tracking-tight">Hoe het werkt</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stappen.map((s) => (
              <div key={s.n} className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm text-center">
                <div className="w-10 h-10 bg-[#0b50da] text-white rounded-full flex items-center justify-center mx-auto mb-3 font-black">{s.n}</div>
                <h3 className="font-black text-slate-900 text-sm mb-1">{s.title}</h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">{s.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Aanmeldformulier */}
        <section className="bg-white rounded-[28px] p-8 border border-slate-100 shadow-xl max-w-2xl mx-auto w-full">
          {status === 'ok' ? (
            <div className="text-center py-10 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
              <h2 className="text-xl font-black text-slate-900">Bedankt voor je interesse!</h2>
              <p className="text-slate-500 font-medium">We nemen persoonlijk contact met je op om de mogelijkheden en tarieven door te nemen.</p>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Meld je aan als partner</h2>
                <p className="text-slate-500 font-medium mt-2 text-sm">Laat je gegevens achter, dan bespreken we de mogelijkheden en tarieven persoonlijk. Geen kosten per zaak — een vaste advertentiebijdrage.</p>
              </div>
              <form
                name="partner-aanmelding"
                method="POST"
                data-netlify="true"
                netlify-honeypot="bot-field"
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                <input type="hidden" name="form-name" value="partner-aanmelding" />
                <p className="hidden">
                  <label>Laat dit veld leeg: <input name="bot-field" /></label>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input className={inputClass} name="kantoornaam" placeholder="Kantoornaam *" value={form.kantoornaam} onChange={set('kantoornaam')} />
                  <input className={inputClass} name="contactpersoon" placeholder="Contactpersoon *" value={form.contactpersoon} onChange={set('contactpersoon')} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input className={inputClass} type="email" name="email" placeholder="E-mailadres *" value={form.email} onChange={set('email')} />
                  <input className={inputClass} type="tel" name="telefoon" placeholder="Telefoon" value={form.telefoon} onChange={set('telefoon')} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <select className={inputClass} name="rechtsgebieden" value={form.rechtsgebieden} onChange={set('rechtsgebieden')}>
                    <option value="">Rechtsgebied…</option>
                    {rechtsgebieden.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <input className={inputClass} name="regio" placeholder="Regio / werkgebied" value={form.regio} onChange={set('regio')} />
                </div>
                <input className={inputClass} name="website" placeholder="Website (optioneel)" value={form.website} onChange={set('website')} />
                <textarea className={inputClass} name="bericht" placeholder="Eventuele toelichting" rows={3} value={form.bericht} onChange={set('bericht')} />
                <Button type="submit" size="lg" className="w-full rounded-2xl" isLoading={status === 'sending'} disabled={status === 'sending'}>
                  Aanmelden als partner
                </Button>
                {status === 'error' && (
                  <p className="text-sm text-red-500 font-bold text-center">Er ging iets mis. Probeer het later opnieuw of mail naar clareco.online@gmail.com.</p>
                )}
              </form>
            </>
          )}
        </section>

        {/* Terug naar home */}
        <div className="text-center">
          <a href="/#/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#0b50da] transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
            Terug naar home
          </a>
        </div>
      </div>
    </div>
  );
};

export default Partners;
