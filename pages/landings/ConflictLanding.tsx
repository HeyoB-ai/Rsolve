import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Clock, ShieldCheck, CircleCheck, Users, Lock, Scale, ChevronDown } from 'lucide-react';
import { Header } from '../../components/landing/components/Header';
import { Footer } from '../../components/landing/components/Footer';
import { PROCESS_STEPS, type LandingContent } from './data';

const ACCENT = '#00E5FF';
const SITE = 'https://rsolve.app';

interface Props {
  data: LandingContent;
}

const ConflictLanding: React.FC<Props> = ({ data }) => {
  const navigate = useNavigate();
  const startMediation = () => navigate('/payment');

  // Structured data: FAQPage + BreadcrumbList. Prerendering bakt dit in de HTML,
  // zodat Google het kan lezen (antwoorden staan ook zichtbaar op de pagina).
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'FAQPage',
        mainEntity: data.faq.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE + '/' },
          { '@type': 'ListItem', position: 2, name: data.kicker, item: SITE + data.slug },
        ],
      },
    ],
  };

  const Section: React.FC<{ id?: string; children: React.ReactNode; alt?: boolean }> = ({ id, children, alt }) => (
    <section id={id} className={`py-16 md:py-20 border-b border-slate-800/80 ${alt ? 'bg-slate-900/40' : 'bg-slate-950'}`}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">{children}</div>
    </section>
  );

  const Bullets: React.FC<{ items?: string[] }> = ({ items }) =>
    !items ? null : (
      <ul className="mt-4 space-y-2.5">
        {items.map((b, i) => (
          <li key={i} className="flex items-start gap-3 text-sm text-slate-300 leading-relaxed">
            <CircleCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <span>{b}</span>
          </li>
        ))}
      </ul>
    );

  return (
    <div className="rsolve-dark min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-400 selection:text-slate-950">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Header onStartMediation={startMediation} brandPrimaryColor={ACCENT} />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden pt-14 pb-16 md:pt-20 md:pb-20 border-b border-slate-800/80 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full blur-3xl pointer-events-none opacity-15" style={{ backgroundColor: ACCENT }} />
          <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">{data.kicker}</div>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl text-white font-extrabold tracking-tight leading-[1.12]">
              {data.h1}
            </h1>
            <p className="mt-6 text-base sm:text-lg text-slate-300 leading-relaxed font-light">{data.intro}</p>
            <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <button
                onClick={startMediation}
                className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-bold text-slate-950 rounded-xl shadow-lg transition-all cursor-pointer hover:opacity-95 active:scale-[0.98]"
                style={{ backgroundColor: ACCENT }}
              >
                <span>{data.cta.button}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <div className="flex flex-wrap items-center gap-5 text-xs text-slate-400">
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-slate-300" /> ~10 minuten</span>
                <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-slate-300" /> 100% neutraal</span>
              </div>
            </div>
          </div>
        </section>

        {/* Probleemherkenning */}
        {data.problem && (
        <Section id="probleem">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">{data.problem.heading}</h2>
          <p className="mt-4 text-slate-300 leading-relaxed font-light">{data.problem.body}</p>
          <Bullets items={data.problem.bullets} />
        </Section>
        )}

        {/* Hoe Rsolve helpt */}
        {data.help && (
        <Section id="oplossing" alt>
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-5">
            <Users className="w-6 h-6 text-cyan-400" />
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">{data.help.heading}</h2>
          <p className="mt-4 text-slate-300 leading-relaxed font-light">{data.help.body}</p>
          <Bullets items={data.help.bullets} />
        </Section>
        )}

        {/* Proces */}
        {data.showProcess !== false && (
        <Section id="hoe-het-werkt">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">Zo verloopt het in 4 stappen</h2>
          <div className="mt-8 space-y-5">
            {PROCESS_STEPS.map((s, i) => (
              <div key={i} className="flex gap-4">
                <div className="shrink-0 w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-display font-black text-sm" style={{ color: ACCENT }}>
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{s.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed font-light mt-0.5">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>
        )}

        {/* Kosten */}
        {data.costs && (
        <Section id="kosten" alt>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">{data.costs.heading}</h2>
          <p className="mt-4 text-slate-300 leading-relaxed font-light">{data.costs.body}</p>
          <a href="/kosten-conflict" className="inline-flex items-center gap-1.5 mt-4 text-sm font-semibold hover:underline" style={{ color: ACCENT }}>
            Bekijk wat een conflict werkelijk kost <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </Section>
        )}

        {/* Privacy */}
        {data.privacy && (
        <Section id="privacy">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-5">
            <Lock className="w-6 h-6 text-cyan-400" />
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">{data.privacy.heading}</h2>
          <p className="mt-4 text-slate-300 leading-relaxed font-light">{data.privacy.body}</p>
        </Section>
        )}

        {/* Beperkingen / vertrouwen */}
        {data.limits && (
        <Section id="beperkingen" alt>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-5">
            <Scale className="w-6 h-6 text-amber-400" />
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">{data.limits.heading}</h2>
          <p className="mt-4 text-slate-300 leading-relaxed font-light">{data.limits.body}</p>
          {data.limits.bullets && (
            <ul className="mt-4 space-y-2.5">
              {data.limits.bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-300 leading-relaxed">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          )}
        </Section>
        )}

        {/* FAQ — antwoorden staan in de DOM (details/summary), crawlbaar */}
        <Section id="faq">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">Veelgestelde vragen</h2>
          <div className="mt-8 space-y-3">
            {data.faq.map((f, i) => (
              <details key={i} className="group bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden">
                <summary className="cursor-pointer list-none p-5 flex items-center justify-between gap-4 text-white font-semibold text-sm sm:text-base">
                  <span>{f.q}</span>
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 transition-transform group-open:rotate-180" />
                </summary>
                <div className="px-5 pb-5 text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3.5 font-light">
                  {f.a}
                </div>
              </details>
            ))}
          </div>
        </Section>

        {/* Gerelateerde pagina's — interne links */}
        <Section id="gerelateerd" alt>
          <h2 className="font-display text-xl font-bold text-white tracking-tight">Ook interessant</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            {data.related.map((r, i) => (
              <a key={i} href={r.to} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-sm text-slate-200 transition-colors">
                {r.label} <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </a>
            ))}
          </div>
        </Section>

        {/* Slot-CTA */}
        <section className="py-16 md:py-24 bg-slate-900 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[260px] rounded-full blur-3xl opacity-10 pointer-events-none" style={{ backgroundColor: ACCENT }} />
          <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <h2 className="font-display text-2xl sm:text-4xl text-white font-extrabold tracking-tight leading-[1.15]">{data.cta.heading}</h2>
            <p className="text-base text-slate-300 max-w-xl mx-auto leading-relaxed font-light">{data.cta.body}</p>
            <button
              onClick={startMediation}
              className="inline-flex items-center gap-2 px-8 py-4 text-sm font-bold text-slate-950 rounded-xl shadow-xl transition-all cursor-pointer hover:opacity-95 active:scale-[0.98]"
              style={{ backgroundColor: ACCENT }}
            >
              <span>{data.cta.button}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      </main>

      <Footer brandPrimaryColor={ACCENT} />
    </div>
  );
};

export default ConflictLanding;
