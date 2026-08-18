import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import RouteSeo from './components/RouteSeo';
import { UI_TRANSLATIONS } from './constants';
import { isConfigured } from './lib/supabase';

// Pagina's
import Landing from './pages/Landing';
import Mediation from './pages/Mediation';
import VSO from './pages/VSO';
import Payment from './pages/Payment';
import JoinCase from './pages/JoinCase';
import InvitePartner from './pages/InvitePartner';
import Contact from './pages/Contact';
import Zakelijk from './pages/Zakelijk';
import KostenConflict from './pages/KostenConflict';
import JuridischeHulp from './pages/JuridischeHulp';
import Partners from './pages/Partners';
import ConflictLanding from './pages/landings/ConflictLanding';
import { LANDINGS, LANDING_SLUGS } from './pages/landings/data';

// Marketing Boilerplates (Placeholder voor content)
const MarketingPage = ({ title, content }: { title: string, content: string }) => (
  <div className="min-h-screen bg-white p-8 pt-24 max-w-3xl mx-auto">
    <h1 className="text-4xl font-extrabold text-slate-900 mb-8">{title}</h1>
    <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed font-medium">
      {content.split('\n').map((p, i) => <p key={i} className="mb-4">{p}</p>)}
    </div>
    <div className="mt-12 pt-8 border-t border-slate-100 text-center">
      <a href="/" className="text-primary font-bold hover:underline">Terug naar Home</a>
    </div>
  </div>
);

const App: React.FC = () => {
  const [appLanguage, setAppLanguage] = useState<string>(() => {
    // Eerder gekozen taal heeft altijd voorrang.
    const saved = localStorage.getItem('rsolve_app_lang');
    if (saved) return saved;
    // Geen keuze opgeslagen -> neem de taal van de telefoon/browser over,
    // mits die door de app ondersteund wordt. Anders val terug op Nederlands.
    try {
      const detected = (navigator.language || 'nl').slice(0, 2).toLowerCase();
      if (UI_TRANSLATIONS[detected]) return detected;
    } catch (e) { /* navigator niet beschikbaar */ }
    return 'nl';
  });

  const [activeCase, setActiveCase] = useState<any>(() => {
    const saved = localStorage.getItem('rsolve_active_case');
    return saved ? JSON.parse(saved) : null;
  });

  const [hasPaid, setHasPaid] = useState<boolean>(() => {
    return localStorage.getItem('rsolve_has_paid') === 'true';
  });

  const [finalVSO, setFinalVSO] = useState<any>(() => {
    const saved = localStorage.getItem('rsolve_final_vso');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    localStorage.setItem('rsolve_app_lang', appLanguage);
  }, [appLanguage]);

  useEffect(() => {
    if (activeCase) localStorage.setItem('rsolve_active_case', JSON.stringify(activeCase));
    else localStorage.removeItem('rsolve_active_case');
  }, [activeCase]);

  useEffect(() => {
    localStorage.setItem('rsolve_has_paid', hasPaid.toString());
  }, [hasPaid]);

  useEffect(() => {
    if (finalVSO) localStorage.setItem('rsolve_final_vso', JSON.stringify(finalVSO));
    else localStorage.removeItem('rsolve_final_vso');
  }, [finalVSO]);

  // Terugkeer van Stripe Checkout: /payment-complete?... doorsturen naar de route /payment
  useEffect(() => {
    if (window.location.pathname.startsWith('/payment-complete')) {
      const search = window.location.search || '';
      window.location.replace('/payment' + search);
    }
  }, []);

  const handleReset = () => {
    setFinalVSO(null);
    setActiveCase(null);
    setHasPaid(false);
    localStorage.clear();
    window.location.href = '/';
  };

  const handleAbandon = () => {
    setActiveCase(null);
    setHasPaid(false);
    localStorage.removeItem('rsolve_active_case');
    localStorage.removeItem('rsolve_has_paid');
    window.location.href = '/';
  };

  const t = (key: string, params?: any) => {
    let text = UI_TRANSLATIONS[appLanguage]?.[key] || UI_TRANSLATIONS['nl'][key] || key;
    if (params) {
      Object.keys(params).forEach(k => {
        text = text.replace(`{${k}}`, params[k]);
      });
    }
    return text;
  };

  return (
    <BrowserRouter>
      <RouteSeo />
      <div className="flex flex-col min-h-screen bg-white relative">
        {!isConfigured && (
          <div className="bg-red-600 text-white text-[10px] font-black py-2 px-4 text-center z-[200] uppercase tracking-widest">
            Configuratiefout: Supabase URL/Key ontbreekt in deze omgeving
          </div>
        )}
        <main className="flex-1">
          <Routes>
            <Route path="/" element={
              finalVSO ? <Navigate to="/vso" /> : 
              activeCase ? <Navigate to="/mediation" /> : 
              <Landing appLanguage={appLanguage} setAppLanguage={setAppLanguage} t={t} setHasPaid={setHasPaid} />
            } />
            <Route path="/payment" element={
              <Payment onSuccess={() => setHasPaid(true)} t={t} appLanguage={appLanguage} setAppLanguage={setAppLanguage} />
            } />
            <Route path="/invite-partner" element={
              hasPaid ? <InvitePartner onComplete={(data) => setActiveCase(data)} t={t} appLanguage={appLanguage} setAppLanguage={setAppLanguage} /> : <Navigate to="/payment" />
            } />
            <Route path="/invite/:id" element={
              <JoinCase t={t} onJoin={(data) => setActiveCase(data)} appLanguage={appLanguage} setAppLanguage={setAppLanguage} />
            } />
            <Route path="/mediation" element={activeCase ? (
              <Mediation 
                caseData={activeCase} 
                appLanguage={appLanguage} 
                setAppLanguage={setAppLanguage} 
                t={t} 
                onResolve={(vso) => { setFinalVSO(vso); setActiveCase(null); setHasPaid(false); }}
                onAbandon={handleAbandon}
              />
            ) : <Navigate to="/" />} />
            <Route path="/vso" element={finalVSO ? <VSO data={finalVSO} t={t} onReset={handleReset} /> : <Navigate to="/" />} />
            
            {/* Marketing Routes (wat-is-mediation, hoe-werkt-rsolve en kosten zijn nu volwaardige landingspagina's, zie hieronder) */}
            <Route path="/privacy" element={<MarketingPage title="Privacybeleid" content="Jouw gegevens zijn veilig. Gesprekken zijn versleuteld en we gebruiken AI-modellen die voldoen aan de strengste privacy-eisen (GDPR)." />} />
            <Route path="/terms" element={<MarketingPage title="Voorwaarden" content="Door gebruik te maken van Rsolve ga je akkoord met onze gebruikersvoorwaarden. We bieden ondersteuning bij bemiddeling, geen juridisch advies." />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/zakelijk" element={<Zakelijk />} />
            <Route path="/kosten-conflict" element={<KostenConflict />} />
            <Route path="/juridische-hulp" element={<JuridischeHulp />} />
            <Route path="/partners" element={<Partners />} />

            {/* SEO-landingspagina's per conflicttype */}
            {LANDING_SLUGS.map((slug) => (
              <Route key={slug} path={slug} element={<ConflictLanding data={LANDINGS[slug]} />} />
            ))}

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};

export default App;
