
import { createClient } from '@supabase/supabase-js';

// We checken beide mogelijke namen die in Netlify gebruikt kunnen worden
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_PUBLIC || '';

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : new Proxy({}, {
      get: () => {
        throw new Error("Supabase configuratie ontbreekt. Controleer of SUPABASE_URL en SUPABASE_ANON_KEY (of SUPABASE_ANON_PUBLIC) zijn ingesteld.");
      }
    }) as ReturnType<typeof createClient>;

export type DbCase = {
  id: string;
  title: string;
  other_party: string;
  initiator_id: string;
  initiator_name: string; // Nieuw veld
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

export type DbPromoCode = {
  code: string;
  is_used: boolean;
  used_at?: string;
  case_id?: string;
};
