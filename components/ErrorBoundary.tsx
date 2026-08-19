import React from 'react';
import { captureError } from '../lib/monitoring';

interface State {
  hasError: boolean;
}

// Vangt onverwachte render-fouten op zodat de gebruiker geen witte pagina krijgt,
// en meldt de fout aan de monitoring (Sentry) als die is ingesteld.
class ErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: unknown) {
    captureError(error, { componentStack: (info as any)?.componentStack });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rsolve-dark min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
          <div className="max-w-md text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-red-500/15 text-red-400 flex items-center justify-center mx-auto text-3xl font-black">!</div>
            <h1 className="text-2xl font-black text-white">Er ging iets mis</h1>
            <p className="text-slate-400 font-medium leading-relaxed">
              Excuses, er trad een onverwachte fout op. Probeer de pagina opnieuw te laden. Blijft het misgaan, neem dan gerust contact met ons op — je gegevens zijn veilig.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-1">
              <button
                onClick={() => window.location.reload()}
                className="bg-cyan-500 text-slate-950 px-6 py-3 rounded-2xl font-black hover:bg-cyan-400 transition-all active:scale-95"
              >
                Opnieuw laden
              </button>
              <a
                href="/"
                className="bg-slate-800 border border-slate-700 text-white px-6 py-3 rounded-2xl font-black hover:border-cyan-500 transition-all active:scale-95"
              >
                Naar home
              </a>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children as React.ReactElement;
  }
}

export default ErrorBoundary;
