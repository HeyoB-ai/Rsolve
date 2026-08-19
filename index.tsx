import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import { initMonitoring } from './lib/monitoring';
import './index.css';

// Crash reporting starten (stil als er geen SENTRY_DSN is ingesteld).
initMonitoring();

const updateVh = () => {
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
};

window.addEventListener('resize', updateVh);
updateVh();

// Compat: oude gedeelde hash-links (bijv. /#/invite/xxx of /#/payment) omzetten naar
// echte paden vóórdat de router mount, zodat reeds verstuurde links blijven werken
// na de overstap van HashRouter naar BrowserRouter.
try {
  const legacyHash = window.location.hash;
  if (legacyHash.startsWith('#/')) {
    const target = legacyHash.slice(1) + window.location.search;
    window.history.replaceState(null, '', target);
  }
} catch (e) { /* geen window/history beschikbaar */ }

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);