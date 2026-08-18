import React, { useState } from 'react';
import { Menu, X, ArrowRight } from 'lucide-react';

interface HeaderProps {
  onStartMediation: () => void;
  onJoin?: () => void;
  brandPrimaryColor: string;
}

export function Header({ onStartMediation, onJoin, brandPrimaryColor }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">

        {/* Brand Logo — beeldmerk + kraakhelder wordmerk */}
        <a href="#" className="flex items-center gap-2.5 group focus:outline-none">
          <img
            src="/assets/rsolve-emblem.png"
            alt=""
            aria-hidden="true"
            className="h-10 sm:h-12 w-auto object-contain select-none"
          />
          <span
            className="text-white font-extrabold leading-none select-none text-2xl sm:text-[28px] tracking-tight"
            style={{ fontFamily: "'Poppins', 'Inter', system-ui, sans-serif" }}
          >
            RSOLVE
          </span>
        </a>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <a href="#hoe-het-werkt" className="hover:text-white transition-colors">Hoe het werkt</a>
          <a href="#simulator" className="hover:text-white transition-colors">Voorbeelden</a>
          <a href="#tarieven" className="hover:text-white transition-colors">Tarieven</a>
          <a href="#veiligheid" className="hover:text-white transition-colors">Juridische Zekerheid</a>
          <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
        </nav>

        {/* Right CTA */}
        <div className="hidden sm:flex items-center gap-3">
          {onJoin && (
            <button
              onClick={onJoin}
              className="text-xs font-medium text-slate-300 hover:text-white px-3 py-2 transition-colors cursor-pointer"
            >
              Ik ben uitgenodigd
            </button>
          )}
          <button
            onClick={onStartMediation}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white rounded-xl shadow-lg transition-all cursor-pointer hover:opacity-95 active:scale-[0.98]"
            style={{ backgroundColor: brandPrimaryColor }}
          >
            <span>Start bemiddeling</span>
            <span className="opacity-70 text-[11px] font-normal">• €3,99</span>
            <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
          </button>
        </div>

        {/* Mobile menu toggle */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-300 hover:text-white bg-slate-900 border border-slate-800"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-950 px-4 pt-3 pb-5 space-y-3">
          <nav className="flex flex-col space-y-2 text-sm text-slate-300">
            <a href="#hoe-het-werkt" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-slate-900">Hoe het werkt</a>
            <a href="#simulator" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-slate-900">Voorbeelden &amp; Simulator</a>
            <a href="#tarieven" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-slate-900">Tarieven</a>
            <a href="#veiligheid" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-slate-900">Juridische Zekerheid</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-slate-900">FAQ</a>
          </nav>
          <div className="pt-2 flex flex-col gap-2 border-t border-slate-800">
            {onJoin && (
              <button
                onClick={() => { setMobileMenuOpen(false); onJoin(); }}
                className="w-full py-2.5 text-xs text-center font-medium text-slate-300 bg-slate-900 border border-slate-800 rounded-xl"
              >
                Ik ben uitgenodigd
              </button>
            )}
            <button
              onClick={() => { setMobileMenuOpen(false); onStartMediation(); }}
              className="w-full py-3 text-xs font-bold text-white rounded-xl shadow-lg"
              style={{ backgroundColor: brandPrimaryColor }}
            >
              Start Bemiddeling (€3,99)
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
