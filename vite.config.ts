
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // API_KEY is bewust VERWIJDERD: de Gemini-sleutel mag niet meer in de client-bundle.
    // Alle AI-calls lopen nu via server-side Netlify Functions (netlify/functions/*).
    'process.env.SUPABASE_URL': JSON.stringify(process.env.SUPABASE_URL),
    'process.env.SUPABASE_ANON_KEY': JSON.stringify(process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_PUBLIC),
    'process.env.SUPABASE_ANON_PUBLIC': JSON.stringify(process.env.SUPABASE_ANON_PUBLIC),
    // Crash reporting (optioneel): alleen actief als SENTRY_DSN is ingesteld.
    'process.env.SENTRY_DSN': JSON.stringify(process.env.SENTRY_DSN || ''),
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: './index.html',
      },
    },
  },
});
