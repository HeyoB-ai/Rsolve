import React, { useState } from 'react';
import { FAQS } from '../data/contentData';
import { ChevronDown, Star, CheckCircle2 } from 'lucide-react';

interface TestimonialsFAQProps {
  brandPrimaryColor?: string;
}

const REVIEWS = [
  {
    quote: 'Na maanden ruzie over een overhangende coniferenhaag en verlies van zonlicht hebben we via RSolve in 11 minuten een compromis gesloten waar we allebei tevreden mee zijn.',
    author: 'Jeroen & Linda V.',
    type: 'Burengeschil Utrecht',
    tag: 'Opgelost in 11 min'
  },
  {
    quote: 'Als ZZP’er zat ik klem met een onbetaalde factuur van €2.800. RSolve haalde de emotionele boosheid uit het gesprek en binnen een kwartier hadden we een formele betalingsregeling.',
    author: 'Karim B.',
    type: 'Zakelijke Factuur',
    tag: 'Factuur voldaan'
  },
  {
    quote: 'Mijn verhuurder sprak alleen Nederlands, ik Pools. Dankzij de neutrale meertalige vertaling begrepen we elkaars punten en kregen we snel 80% van de waarborgsom teruggestort.',
    author: 'Piotr K.',
    type: 'Huurgeschil Rotterdam',
    tag: 'Borg teruggestort'
  }
];

export function TestimonialsFAQ({ brandPrimaryColor = '#10B981' }: TestimonialsFAQProps) {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  return (
    <section className="py-20 md:py-28 bg-slate-950 border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Testimonials */}
        <div className="mb-24">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Ervaringen &amp; Resultaten
            </div>
            <h2 className="font-display text-3xl sm:text-4xl text-white font-extrabold tracking-tight">
              Al duizenden geschillen vreedzaam opgelost
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {REVIEWS.map((rev, idx) => (
              <div
                key={idx}
                className="p-6 bg-slate-900/60 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all shadow-lg"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1 text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-full">
                      {rev.tag}
                    </span>
                  </div>

                  <p className="text-sm text-slate-300 leading-relaxed font-light italic">
                    &quot;{rev.quote}&quot;
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-white">{rev.author}</div>
                    <div className="text-slate-400 text-[11px]">{rev.type}</div>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div id="faq" className="max-w-3xl mx-auto scroll-mt-20">
          <div className="text-center space-y-3 mb-12">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Veelgestelde Vragen
            </div>
            <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
              Alles over de werking en rechtsgeldigheid
            </h3>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 text-white font-semibold text-sm sm:text-base hover:bg-slate-900 transition-colors cursor-pointer"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-white' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3.5 font-light">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
