import React from 'react';
import { Logo } from '../components/ui/Logo';

const Contact: React.FC = () => {
  const iconWrap = 'w-11 h-11 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center shrink-0';
  const label = 'text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5';

  return (
    <div className="rsolve-dark min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center p-6 pt-16 animate-in fade-in duration-500">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Logo className="w-16 h-16 mx-auto mb-6" />
          <h1 className="text-3xl font-black text-white tracking-tight">Contact</h1>
          <p className="text-sm text-slate-400 font-medium mt-2">Neem gerust contact met ons op.</p>
        </div>

        <div className="bg-slate-900 rounded-[28px] shadow-2xl border border-slate-800 p-8 space-y-6">
          {/* Bedrijf */}
          <div className="flex items-start gap-4">
            <div className={iconWrap}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
            </div>
            <div>
              <p className={label}>Bedrijf</p>
              <p className="font-bold text-slate-100">Clareco bv</p>
            </div>
          </div>

          {/* Adres */}
          <div className="flex items-start gap-4">
            <div className={iconWrap}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            </div>
            <div>
              <p className={label}>Adres</p>
              <p className="font-bold text-slate-100 leading-relaxed">Baronielaan 107 A<br />4818 PD Breda</p>
            </div>
          </div>

          {/* Telefoon */}
          <a href="tel:+31657812417" className="flex items-start gap-4 group">
            <div className={iconWrap}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
            </div>
            <div>
              <p className={label}>Telefoon</p>
              <p className="font-bold text-slate-100 group-hover:text-cyan-400 transition-colors">06-57812417</p>
            </div>
          </a>
        </div>

        <div className="text-center">
          <a href="/#/" className="text-cyan-400 font-bold text-sm hover:underline">← Terug naar home</a>
        </div>
      </div>
    </div>
  );
};

export default Contact;
