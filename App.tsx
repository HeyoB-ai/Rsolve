
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UI_TRANSLATIONS } from './constants';
import { isConfigured } from './lib/supabase';

// Pagina's
import Landing from './pages/Landing';
import Mediation from './pages/Mediation';
import VSO from './pages/VSO';
import Payment from './pages/Payment';
import JoinCase from './pages/JoinCase';
import InvitePartner from './pages/InvitePartner';

// Marketing Boilerplates (Placeholder voor content)
const MarketingPage = ({ title, content }: { title: string, content: string }) => (
  <div className="min-h-screen bg-white p-8 pt-24 max-w-3xl mx-auto">
    <h1 className="text-4xl font-extrabold text-slate-900 mb-8">{title}</h1>
    <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed font-medium">
      {content.split('\n').map((p, i) => <p key={i} className="mb-4">{p}</p>)}
    </div>
    <div className="mt-12 pt-8 border-t border-slate-100 text-center">
      <a href="/#/" className="text-primary font-bold hover:underline">Terug naar Home</a>
    </div>
  </div>
);

const App: React.FC = () => {
  const [appLanguage, setAppLanguage] = useState<string>(() => {
    return localStorage.getItem('rsolve_app_lang') || 'nl';
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

  const handleReset = () => {
    setFinalVSO(null);
    setActiveCase(null);
    setHasPaid(false);
    localStorage.clear();
    window.location.href = '#/';
  };

  const handleAbandon = () => {
    setActiveCase(null);
    setHasPaid(false);
    localStorage.removeItem('rsolve_active_case');
    localStorage.removeItem('rsolve_has_paid');
    window.location.href = '#/';
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
    <HashRouter>
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
            <Route path="/payment" element={<Payment onSuccess={() => setHasPaid(true)} t={t} />} />
            <Route path="/invite-partner" element={hasPaid ? <InvitePartner onComplete={(data) => setActiveCase(data)} t={t} /> : <Navigate to="/payment" />} />
            <Route path="/invite/:id" element={<JoinCase t={t} onJoin={(data) => setActiveCase(data)} />} />
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
            
            {/* Marketing Routes */}
            <Route path="/wat-is-mediation" element={<MarketingPage title="Wat is Mediation?" content="Mediation is een manier om conflicten op te lossen zonder tussenkomst van een rechter. Bij Rsolve gebruiken we AI om dit proces toegankelijker en neutraler te maken." />} />
            <Route path="/kosten" element={<MarketingPage title="Tarieven" content="Bij Rsolve geloven we in transparantie. Voor een eenmalig bedrag van €3,99 start je een dossier. Voor de genodigde partij is deelname volledig gratis." />} />
            <Route path="/hoe-werkt-rsolve" element={<MarketingPage title="Hoe werkt Rsolve?" content="In drie simpele stappen: Aanmelding, Begeleide Dialoog en Vaststelling. Onze AI mediator zorgt ervoor dat het gesprek constructief blijft." />} />
            <Route path="/privacy" element={<MarketingPage title="Privacybeleid" content="Jouw gegevens zijn veilig. Gesprekken zijn versleuteld en we gebruiken AI-modellen die voldoen aan de strengste privacy-eisen (GDPR)." />} />
            <Route path="/terms" element={<MarketingPage title="Voorwaarden" content="Door gebruik te maken van Rsolve ga je akkoord met onze gebruikersvoorwaarden. We bieden ondersteuning bij bemiddeling, geen juridisch advies." />} />

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
};

export default App;
