import React from 'react';
import { RSolveLogo } from './RSolveLogo';

interface FooterProps {
  brandPrimaryColor?: string;
}

export function Footer({ brandPrimaryColor = '#10B981' }: FooterProps) {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800/80 pt-16 pb-12 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800/80">

          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <RSolveLogo size="md" showWordmark={true} customLogoUrl="/assets/rsolve-logo.png" brandPrimaryColor={brandPrimaryColor} />
            <p className="text-slate-400 leading-relaxed text-xs">
              Het intelligente AI mediation platform voor onpartijdige, snelle en rechtsgeldige geschilbeslechting.
            </p>
            <div className="text-xs text-white font-medium">
              Vast tarief €3,99 per afgerond dossier.
            </div>
          </div>

          {/* Platform */}
          <div className="space-y-3">
            <div className="font-semibold text-white uppercase tracking-wider text-xs">Platform</div>
            <ul className="space-y-2 text-slate-400">
              <li><a href="#hoe-het-werkt" className="hover:text-white transition-colors">Hoe het werkt</a></li>
              <li><a href="#simulator" className="hover:text-white transition-colors">Voorbeelden &amp; Simulator</a></li>
              <li><a href="#tarieven" className="hover:text-white transition-colors">Tarieven &amp; Besparing</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors">Veelgestelde vragen</a></li>
            </ul>
          </div>

          {/* Juridisch & Privacy */}
          <div className="space-y-3">
            <div className="font-semibold text-white uppercase tracking-wider text-xs">Juridisch &amp; Privacy</div>
            <ul className="space-y-2 text-slate-400">
              <li><a href="#veiligheid" className="hover:text-white transition-colors">Art. 7:900 BW Vaststellingsovereenkomst</a></li>
              <li><a href="/#/juridische-hulp" className="hover:text-white transition-colors">Juridische hulp</a></li>
              <li><a href="/#/privacy" className="hover:text-white transition-colors">AVG / GDPR Verklaring</a></li>
              <li><a href="/#/terms" className="hover:text-white transition-colors">Voorwaarden</a></li>
            </ul>
          </div>

          {/* Bedrijf */}
          <div className="space-y-3">
            <div className="font-semibold text-white uppercase tracking-wider text-xs">Bedrijf</div>
            <ul className="space-y-2 text-slate-400">
              <li><a href="/#/zakelijk" className="hover:text-white transition-colors">Voor bedrijven</a></li>
              <li><a href="/#/partners" className="hover:text-white transition-colors">Voor advocaten</a></li>
              <li><a href="/#/kosten-conflict" className="hover:text-white transition-colors">Wat conflicten kosten</a></li>
              <li><a href="/#/contact" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-xs">
          <div>© {new Date().getFullYear()} Clareco bv — Rsolve. Alle rechten voorbehouden.</div>
          <div>Wettelijk bindende vaststellingsovereenkomsten (Art. 7:900 BW)</div>
        </div>

      </div>
    </footer>
  );
}
