import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/landing/components/Header';
import LangBar from '../components/landing/components/LangBar';
import { Hero } from '../components/landing/components/Hero';
import { HowItWorks } from '../components/landing/components/HowItWorks';
import { LiveConflictSimulator } from '../components/landing/components/LiveConflictSimulator';
import { MultilingualShowcase } from '../components/landing/components/MultilingualShowcase';
import { CostComparison } from '../components/landing/components/CostComparison';
import { SecurityAndLegal } from '../components/landing/components/SecurityAndLegal';
import { TestimonialsFAQ } from '../components/landing/components/TestimonialsFAQ';
import { CTASection } from '../components/landing/components/CTASection';
import { Footer } from '../components/landing/components/Footer';

// Accentkleur van de nieuwe donkere stijl (cyaan/teal).
const ACCENT = '#00E5FF';

interface LandingProps {
  appLanguage?: string;
  setAppLanguage?: (lang: string) => void;
  t?: (key: string, params?: any) => string;
  setHasPaid?: (v: boolean) => void;
}

const Landing: React.FC<LandingProps> = () => {
  const navigate = useNavigate();
  // Standaard-scenario voor de simulator: een werkgerelateerde kwestie.
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('werk-team');

  const startMediation = () => navigate('/payment');

  return (
    <div className="rsolve-dark min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-400 selection:text-slate-950 antialiased">
      <LangBar />
      <Header onStartMediation={startMediation} brandPrimaryColor={ACCENT} />
      <main className="flex-1">
        <Hero onSelectScenario={setSelectedScenarioId} onStartMediation={startMediation} brandPrimaryColor={ACCENT} />
        <HowItWorks onStartMediation={startMediation} brandPrimaryColor={ACCENT} />
        <LiveConflictSimulator
          selectedScenarioId={selectedScenarioId}
          onSelectScenarioId={setSelectedScenarioId}
          onStartMediation={startMediation}
          brandPrimaryColor={ACCENT}
        />
        <MultilingualShowcase brandPrimaryColor={ACCENT} />
        <CostComparison onStartMediation={startMediation} brandPrimaryColor={ACCENT} />
        <SecurityAndLegal brandPrimaryColor={ACCENT} />
        <TestimonialsFAQ brandPrimaryColor={ACCENT} />
        <CTASection onStartMediation={startMediation} brandPrimaryColor={ACCENT} />
      </main>
      <Footer brandPrimaryColor={ACCENT} />
    </div>
  );
};

export default Landing;
