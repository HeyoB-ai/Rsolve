
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';

// Pagina's
import Landing from './pages/Landing';
import Setup from './pages/Setup';
import Mediation from './pages/Mediation';
import VSO from './pages/VSO';
import Payment from './pages/Payment';
import JoinCase from './pages/JoinCase';
import InvitePartner from './pages/InvitePartner';

const App: React.FC = () => {
  const [activeCase, setActiveCase] = useState<any>(() => {
    const saved = localStorage.getItem('rsolve_active_case');
    return saved ? JSON.parse(saved) : null;
  });

  const [pendingCase, setPendingCase] = useState<any>(() => {
    const saved = localStorage.getItem('rsolve_pending_case');
    return saved ? JSON.parse(saved) : null;
  });

  const [finalVSO, setFinalVSO] = useState<any>(() => {
    const saved = localStorage.getItem('rsolve_final_vso');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (activeCase) localStorage.setItem('rsolve_active_case', JSON.stringify(activeCase));
    else localStorage.removeItem('rsolve_active_case');
  }, [activeCase]);

  useEffect(() => {
    if (pendingCase) localStorage.setItem('rsolve_pending_case', JSON.stringify(pendingCase));
    else localStorage.removeItem('rsolve_pending_case');
  }, [pendingCase]);

  useEffect(() => {
    if (finalVSO) localStorage.setItem('rsolve_final_vso', JSON.stringify(finalVSO));
    else localStorage.removeItem('rsolve_final_vso');
  }, [finalVSO]);

  return (
    <HashRouter>
      <div className="flex flex-col min-h-screen bg-slate-50">
        <main className="flex-1">
          <Routes>
            <Route path="/" element={
              finalVSO ? <Navigate to="/vso" /> : 
              activeCase ? <Navigate to="/mediation" /> : 
              <Landing />
            } />
            <Route path="/setup" element={<Setup onComplete={(data) => setPendingCase(data)} />} />
            <Route path="/invite-partner" element={
              activeCase ? <InvitePartner caseData={activeCase} /> : <Navigate to="/" />
            } />
            <Route path="/invite/:id" element={<JoinCase />} />
            <Route path="/payment" element={
              <Payment 
                data={pendingCase} 
                onSuccess={(data) => {
                  setActiveCase(data);
                  setPendingCase(null);
                }} 
              />
            } />
            <Route path="/mediation" element={
              activeCase ? <Mediation caseData={activeCase} onResolve={(vso) => {
                setFinalVSO(vso);
                setActiveCase(null);
              }} /> : <Navigate to="/" />
            } />
            <Route path="/vso" element={
              finalVSO ? <VSO data={finalVSO} onReset={() => {
                setFinalVSO(null);
                setActiveCase(null);
                localStorage.clear();
                window.location.href = '#/';
              }} /> : <Navigate to="/" />
            } />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
};

export default App;
