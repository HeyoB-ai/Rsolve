
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_PUBLIC || '';

// We controleren of de variabelen bestaan voordat we de client maken om de 'required' error te voorkomen
export const isConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : new Proxy({}, {
      get: () => {
        return () => {
          console.error("Supabase is niet geconfigureerd. Controleer je omgevingsvariabelen.");
          return { data: null, error: { message: "Supabase niet geconfigureerd" } };
        };
      }
    }) as any;

export type DbCase = {
  id: string;
  title: string;
  other_party: string;
  initiator_id: string;
  initiator_name: string;
  respondent_joined: boolean;
  created_at: string;
};

export type DbMessage = {
  id: string;
  case_id: string;
  sender_id: string;
  sender_name: string;
  content: string;
  type: 'text' | 'system' | 'attachment';
  attachment_url?: string;
  created_at: string;
};
