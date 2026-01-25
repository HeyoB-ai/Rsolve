
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper types voor onze database
export type DbCase = {
  id: string;
  title: string;
  other_party: string;
  initiator_id: string;
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
