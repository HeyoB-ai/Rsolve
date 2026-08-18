import React from 'react';
import { Header } from '../../components/landing/components/Header';
import { Footer } from '../../components/landing/components/Footer';
import { useNavigate } from 'react-router-dom';
import type { LegalDoc } from './data';

const ACCENT = '#00E5FF';

interface Props {
  doc: LegalDoc;
}

const LegalPage: React.FC<Props> = ({ doc }) => {
  const navigate = useNavigate();
  const startMediation = () => navigate('/payment');

  return (
    <div className="rsolve-dark min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-400 selection:text-slate-950">
      <Header onStartMediation={startMediation} brandPrimaryColor={ACCENT} />

      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight">{doc.title}</h1>
          <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Laatst bijgewerkt: {doc.updated}
          </p>
          <p className="mt-6 text-slate-300 leading-relaxed font-light">{doc.intro}</p>

          <div className="mt-10 space-y-9">
            {doc.sections.map((s, i) => (
              <section key={i}>
                <h2 className="font-display text-lg sm:text-xl font-bold text-white tracking-tight">{s.heading}</h2>
                <div className="mt-3 space-y-3">
                  {s.paragraphs.map((p, j) => (
                    <p key={j} className="text-sm text-slate-300 leading-relaxed font-light">
                      {p}
                    </p>
                  ))}
                </div>
                {s.bullets && (
                  <ul className="mt-3 space-y-2">
                    {s.bullets.map((b, k) => (
                      <li key={k} className="flex items-start gap-3 text-sm text-slate-300 leading-relaxed font-light">
                        <span className="mt-2 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: ACCENT }} />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>

          <div className="mt-14 pt-8 border-t border-slate-800 flex flex-wrap gap-4 text-sm">
            <a href="/" className="font-semibold hover:underline" style={{ color: ACCENT }}>← Terug naar home</a>
            <a href="/privacy" className="text-slate-400 hover:text-white transition-colors">Privacybeleid</a>
            <a href="/terms" className="text-slate-400 hover:text-white transition-colors">Voorwaarden</a>
            <a href="/contact" className="text-slate-400 hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </main>

      <Footer brandPrimaryColor={ACCENT} />
    </div>
  );
};

export default LegalPage;
