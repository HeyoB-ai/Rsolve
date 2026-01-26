
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UI_TRANSLATIONS } from './constants';
import { isDemoMode } from './lib/supabase';

// Pagina's
import Landing from './pages/Landing';
import Mediation from './pages/Mediation';
import VSO from './pages/VSO';
import Payment from './pages/Payment';
import JoinCase from './pages/JoinCase';
import InvitePartner from './pages/InvitePartner';

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
      <div className="flex flex-col min-h-screen bg-slate-50 relative">
        {isDemoMode && (
          <div className="bg-amber-500 text-white text-[8px] font-black uppercase tracking-[0.3em] py-1 px-4 text-center z-[200]">
            Demo Modus Actief &bull; Lokale Opslag &bull; Geen Database Verbinding
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
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
};

export default App;
