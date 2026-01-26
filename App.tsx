
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UI_TRANSLATIONS } from './constants';

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

  // Check of de benodigde keys aanwezig zijn (ondersteunt beide namen)
  const isAnonKeyPresent = !!(process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_PUBLIC);
  const isConfigMissing = !process.env.SUPABASE_URL || !isAnonKeyPresent;

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

  if (isConfigMissing) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-center">
        <div className="max-w-md bg-white rounded-[32px] p-8 shadow-2xl">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
          </div>
          <h1 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight">Configuratie Fout</h1>
          <p className="text-slate-500 text-sm mb-6">Er is een mismatch tussen de variabelen in Netlify en de code.</p>
          <div className="bg-slate-50 p-4 rounded-xl text-left text-[10px] font-mono text-slate-400 break-all space-y-1">
            <div>URL: {process.env.SUPABASE_URL ? '✅ OK' : '❌ Ontbreekt'}</div>
            <div>KEY: {isAnonKeyPresent ? '✅ OK' : '❌ Ontbreekt'}</div>
          </div>
          <p className="mt-4 text-[10px] text-slate-400 italic">Trigger een nieuwe 'Clear cache & deploy' in Netlify na het opslaan van de wijzigingen.</p>
        </div>
      </div>
    );
  }

  return (
    <HashRouter>
      <div className="flex flex-col min-h-screen bg-slate-50">
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
