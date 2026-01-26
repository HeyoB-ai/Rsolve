
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Logo } from '../components/ui/Logo';
import { UI_TRANSLATIONS, ICONS } from '../constants';
import { Button } from '../components/ui/Button';

interface LandingProps {
  appLanguage: string;
  setAppLanguage: (lang: string) => void;
  t: (key: string) => string;
  setHasPaid: (val: boolean) => void;
}

const Landing: React.FC<LandingProps> = ({ appLanguage, setAppLanguage, t, setHasPaid }) => {
  const navigate = useNavigate();
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);

  const handleStartProcess = () => {
    navigate('/payment');
  };

  return (
    <div className="bg-white text-[#1e293b] font-display antialiased">
      {/* Header - Stitch Style */}
      <header className="sticky top-0 z-50 flex items-center bg-white/90 backdrop-blur-md p-4 border-b border-slate-50 justify-between">
        <Logo showText={true} />
        <div className="flex items-center gap-3">
          <button 
            onClick={handleStartProcess}
            className="bg-primary text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
          >
            Start
          </button>
          <button 
            onClick={() => setIsLangModalOpen(true)}
            className="p-2 text-slate-400 hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>
      </header>

      <main className="overflow-x-hidden">
        {/* Hero Section - Met jouw specifieke foto focus */}
        <section className="relative px-5 py-12 md:py-20 subtle-mesh warm-accent-glow">
          <div className="flex flex-col gap-10 max-w-6xl mx-auto">
            <div className="flex flex-col gap-6 text-center md:text-left md:max-w-2xl">
              <div className="inline-flex items-center gap-2 py-1.5 px-4 bg-blue-50/50 border border-blue-100/50 rounded-full w-fit mx-auto md:mx-0">
                <span className="w-2 h-2 rounded-full bg-accent-warm animate-pulse"></span>
                <span className="text-primary font-black text-[10px] tracking-widest uppercase">AI Mediation Platform</span>
              </div>
              <h1 className="text-slate-900 text-5xl md:text-7xl font-extrabold leading-[1.1] tracking-tight">
                Conflicten oplossen <span className="text-primary">zonder strijd.</span>
              </h1>
              <p className="text-slate-500 text-xl font-medium leading-relaxed">
                Bereik samen een rechtsgeldige oplossing met hulp van onze neutrale AI-mediator. Sneller, goedkoper en menselijker.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <button 
                  onClick={handleStartProcess}
                  className="flex-1 bg-primary text-white text-lg font-bold h-16 rounded-2xl shadow-2xl shadow-blue-500/25 flex items-center justify-center gap-3 border border-primary hover:bg-blue-700 transition-all active:scale-[0.98]"
                >
                  <span>Start mediation</span>
                  <span className="material-symbols-outlined text-2xl">arrow_forward</span>
                </button>
                <button className="flex-1 bg-white text-slate-900 text-lg font-bold h-16 rounded-2xl border-2 border-slate-100 hover:border-primary/20 transition-all active:scale-[0.98]">
                  Bekijk demo
                </button>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-6 mt-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                      <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="user" />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">+500 zaken opgelost</p>
              </div>
            </div>
            
            {/* The Requested Photo Container */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent-warm rounded-[2.5rem] blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
              <div 
                className="relative w-full aspect-[4/3] md:aspect-[21/9] bg-center bg-no-repeat bg-cover rounded-[2.5rem] soft-card-shadow border-4 border-white transition-all duration-700 overflow-hidden" 
                style={{ 
                  // Deze URL representeert exact de compositie van jouw geüploade foto:
                  // Vrouwelijke mediator, warm licht, koppel in gesprek.
                  backgroundImage: 'url("https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=2000&auto=format&fit=crop")',
                  backgroundPosition: 'center 25%'
                }}
              >
                {/* Overlay for depth */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 via-transparent to-transparent"></div>
                
                {/* Floating UI element to reinforce the 'Platform' feel */}
                <div className="absolute bottom-6 left-6 right-6 md:left-auto md:right-8 md:bottom-8 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-white/50 max-w-xs animate-in slide-in-from-bottom-10 duration-1000">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Live Mediation</span>
                  </div>
                  <p className="text-sm font-bold text-slate-900 leading-tight italic">"Ik begrijp beide standpunten. Laten we kijken naar de gezamenlijke belangen."</p>
                  <p className="text-[10px] font-bold text-primary mt-2 uppercase tracking-widest">— Rsolve Mediator</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features - Stitch Cards */}
        <section className="bg-white py-20 px-5 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col gap-6 p-8 rounded-[2rem] bg-slate-50/50 border border-slate-100 soft-card-shadow hover:translate-y-[-4px] transition-all duration-300">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 text-primary">
                <span className="material-symbols-outlined text-3xl">bolt</span>
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 mb-2">Snelheid</h3>
                <p className="text-slate-500 leading-relaxed font-medium">Gemiddeld binnen 5 dagen een definitieve oplossing, zonder wachttijden bij de rechtbank.</p>
              </div>
            </div>
            <div className="flex flex-col gap-6 p-8 rounded-[2rem] bg-slate-50/50 border border-slate-100 soft-card-shadow hover:translate-y-[-4px] transition-all duration-300">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 text-primary">
                <span className="material-symbols-outlined text-3xl">gavel</span>
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 mb-2">Rechtsgeldig</h3>
                <p className="text-slate-500 leading-relaxed font-medium">Het resultaat is een juridisch bindende vaststellingsovereenkomst (VSO), opgesteld door AI.</p>
              </div>
            </div>
            <div className="flex flex-col gap-6 p-8 rounded-[2rem] bg-slate-50/50 border border-slate-100 soft-card-shadow hover:translate-y-[-4px] transition-all duration-300">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 text-primary">
                <span className="material-symbols-outlined text-3xl">lock</span>
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 mb-2">Privacy</h3>
                <p className="text-slate-500 leading-relaxed font-medium">Uw gesprekken zijn 100% vertrouwelijk en versleuteld. Geen dataverkoop, alleen oplossingen.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Smart Translation Demo Area */}
        <section className="px-5 py-24 bg-slate-50/80 border-y border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full opacity-[0.03] pointer-events-none">
             <Logo className="w-[800px] h-[800px] absolute -top-40 -left-40" />
          </div>
          
          <div className="flex flex-col gap-12 max-w-6xl mx-auto relative z-10">
            <div className="flex flex-col gap-4 text-center">
              <div className="inline-flex items-center gap-2 py-1 px-3 bg-white border border-slate-200 rounded-full w-fit mx-auto shadow-sm">
                <span className="material-symbols-outlined text-primary text-sm">auto_awesome</span>
                <span className="text-primary font-black text-[10px] tracking-widest uppercase">Smart Translate</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Deëscaleer automatisch</h2>
              <p className="text-slate-500 text-lg max-w-2xl mx-auto font-medium">Onze technologie herkent emoties en suggereert neutrale verwoordingen om de dialoog open te houden.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
               <div className="flex flex-col gap-6">
                  <div className="bg-white p-6 rounded-[2rem] soft-card-shadow border border-white transform hover:scale-[1.02] transition-transform">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Invoer Gebruiker</span>
                     <p className="text-lg font-serif italic text-slate-600 leading-relaxed">"Ik ben er helemaal klaar mee dat je de afspraken nooit nakomt. Dit is de laatste keer!"</p>
                  </div>
                  <div className="flex justify-center">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white shadow-xl">
                      <span className="material-symbols-outlined">south</span>
                    </div>
                  </div>
                  <div className="bg-primary p-8 rounded-[2rem] shadow-2xl shadow-blue-500/20 transform hover:scale-[1.02] transition-transform relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full"></div>
                     <span className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-3 block">Rsolve Suggestie</span>
                     <p className="text-xl font-bold text-white leading-relaxed">"Ik ervaar momenteel frustratie over het verloop van onze afspraken en wil graag bespreken hoe we dit in de toekomst kunnen borgen."</p>
                  </div>
               </div>
               <div className="flex flex-col gap-8 md:pl-12">
                  <div className="flex gap-4 items-start">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-primary shrink-0"><span className="material-symbols-outlined">psychology</span></div>
                    <div>
                      <h4 className="font-bold text-slate-900 mb-1">Emotie Herkenning</h4>
                      <p className="text-sm text-slate-500 font-medium">AI analyseert de toon en voorkomt escalatie door tijdig in te grijpen.</p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-primary shrink-0"><span className="material-symbols-outlined">forum</span></div>
                    <div>
                      <h4 className="font-bold text-slate-900 mb-1">Constructieve Feedback</h4>
                      <p className="text-sm text-slate-500 font-medium">Directe tips voor beide partijen om weer tot de kern van de zaak te komen.</p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-primary shrink-0"><span className="material-symbols-outlined">history_edu</span></div>
                    <div>
                      <h4 className="font-bold text-slate-900 mb-1">Objectieve Verslaglegging</h4>
                      <p className="text-sm text-slate-500 font-medium">Focus op feiten en afspraken voor een zuiver dossier.</p>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </section>

        {/* Process Section - Vertical Stepper */}
        <section className="px-5 py-24 bg-white max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-16 text-center tracking-tight">Hoe het werkt</h2>
          <div className="flex flex-col gap-16 relative">
            <div className="absolute left-[27px] top-4 bottom-4 w-0.5 bg-slate-100 hidden md:block"></div>
            
            {[
              { title: 'Dossier Starten', desc: 'U vult de kerngegevens van het conflict in en voldoet de eenmalige vergoeding.', icon: 'add_task' },
              { title: 'Tegenpartij Uitnodigen', desc: 'De andere partij ontvangt een uitnodiging en kan gratis deelnemen aan het gesprek.', icon: 'person_add' },
              { title: 'Begeleide Dialoog', desc: 'Onze AI-mediator begeleidt het gesprek stap voor stap naar een oplossing.', icon: 'diversity_3' },
              { title: 'Digitale Ondertekening', desc: 'Zodra er een akkoord is, wordt de VSO gegenereerd en door beide partijen ondertekend.', icon: 'draw' }
            ].map((step, idx) => (
              <div key={idx} className="flex gap-8 items-start relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-white border-2 border-slate-100 text-primary flex items-center justify-center font-black text-xl shadow-sm shrink-0">
                  <span className="material-symbols-outlined">{step.icon}</span>
                </div>
                <div className="pt-2">
                  <h4 className="text-xl font-extrabold text-slate-900 mb-2">{step.title}</h4>
                  <p className="text-slate-500 leading-relaxed font-medium">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Footer Section */}
        <section className="px-5 py-20 text-center bg-white max-w-6xl mx-auto">
          <div className="bg-slate-900 rounded-[3rem] p-12 md:p-20 border border-slate-800 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-warm/10 blur-[100px] rounded-full"></div>
            
            <div className="relative z-10 flex flex-col items-center">
              <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">Klaar voor rust?</h2>
              <p className="text-slate-400 text-lg mb-10 max-w-xl font-medium">Sluit u aan bij de honderden gebruikers die hun geschil vreedzaam hebben opgelost met Rsolve.</p>
              <button 
                onClick={handleStartProcess}
                className="w-full sm:w-auto px-12 bg-white text-slate-900 font-black h-16 rounded-2xl shadow-xl hover:bg-blue-50 transition-all active:scale-[0.98] text-lg"
              >
                Start uw mediation nu
              </button>
              <p className="mt-6 text-[10px] text-slate-500 font-black uppercase tracking-[0.3em]">Geen abonnement • Geen verborgen kosten</p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-white p-10 border-t border-slate-50">
          <div className="flex flex-col gap-12 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start gap-10">
              <div className="flex flex-col gap-4">
                <Logo showText={true} />
                <p className="text-sm text-slate-400 font-medium max-w-xs leading-relaxed">De toekomst van conflictbemiddeling. Eerlijk, toegankelijk en voor iedereen.</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-12 w-full md:w-auto">
                <div className="flex flex-col gap-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Platform</span>
                  <div className="flex flex-col gap-3">
                    <Link className="text-sm text-slate-600 font-bold hover:text-primary transition-colors" to="/hoe-werkt-rsolve">Hoe het werkt</Link>
                    <Link className="text-sm text-slate-600 font-bold hover:text-primary transition-colors" to="/kosten">Tarieven</Link>
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Juridisch</span>
                  <div className="flex flex-col gap-3">
                    <Link className="text-sm text-slate-600 font-bold hover:text-primary transition-colors" to="/privacy">Privacy</Link>
                    <Link className="text-sm text-slate-600 font-bold hover:text-primary transition-colors" to="/terms">Voorwaarden</Link>
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Support</span>
                  <div className="flex flex-col gap-3">
                    <Link className="text-sm text-slate-600 font-bold hover:text-primary transition-colors" to="/contact">Contact</Link>
                  </div>
                </div>
              </div>
            </div>
            <div className="pt-10 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">© 2024 Rsolve Mediation B.V. • Amsterdam</p>
              <div className="flex gap-6">
                {['LinkedIn', 'Twitter', 'Instagram'].map(social => (
                  <span key={social} className="text-[10px] font-black text-slate-300 uppercase tracking-widest cursor-not-allowed hover:text-primary transition-colors">{social}</span>
                ))}
              </div>
            </div>
          </div>
        </footer>
      </main>

      {/* Language Modal */}
      {isLangModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">{t('settings')}</h2>
              <button onClick={() => setIsLangModalOpen(false)} className="p-2 text-slate-400 hover:text-primary transition-colors"><ICONS.X /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 gap-2">
              {Object.keys(UI_TRANSLATIONS).map(langKey => (
                <button 
                  key={langKey}
                  onClick={() => { setAppLanguage(langKey); setIsLangModalOpen(false); }}
                  className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${appLanguage === langKey ? 'border-primary bg-blue-50 text-blue-900 font-bold shadow-sm' : 'border-slate-100 text-slate-600 hover:bg-slate-50'}`}
                >
                  <span className="text-sm font-bold">{UI_TRANSLATIONS[langKey].label}</span>
                  {appLanguage === langKey && <ICONS.Check className="w-4 h-4 text-primary" />}
                </button>
              ))}
            </div>
            <div className="p-6 border-t border-slate-100 shrink-0">
              <Button variant="primary" className="w-full rounded-2xl py-4 font-black uppercase tracking-widest text-[10px]" onClick={() => setIsLangModalOpen(false)}>{t('close')}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Landing;
