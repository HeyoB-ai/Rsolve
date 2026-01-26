
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_PUBLIC || '';

// Mock implementation for demo/preview mode
class MockSupabaseClient {
  private storage = {
    cases: JSON.parse(localStorage.getItem('mock_cases') || '[]'),
    messages: JSON.parse(localStorage.getItem('mock_messages') || '[]'),
    promo_codes: [{ code: 'DEMO2025', is_used: false }]
  };

  private listeners: any[] = [];

  from(table: string) {
    return {
      select: (query: string) => ({
        eq: (col: string, val: any) => ({
          single: () => {
            const item = (this.storage as any)[table].find((i: any) => i[col] === val);
            return Promise.resolve({ data: item, error: item ? null : { message: 'Not found' } });
          },
          order: () => Promise.resolve({ data: (this.storage as any)[table].filter((i: any) => i[col] === val), error: null })
        })
      }),
      insert: (items: any[]) => {
        const tableData = (this.storage as any)[table];
        const newItems = items.map(i => ({ ...i, id: i.id || Math.random().toString(36).substr(2, 9), created_at: new Date().toISOString() }));
        (this.storage as any)[table] = [...tableData, ...newItems];
        localStorage.setItem(`mock_${table}`, JSON.stringify((this.storage as any)[table]));
        
        // Notify listeners
        newItems.forEach(item => {
          this.listeners.forEach(l => {
            if (l.table === table) l.callback({ new: item });
          });
        });
        
        return Promise.resolve({ error: null });
      },
      update: (val: any) => ({
        eq: (col: string, id: any) => {
          const idx = (this.storage as any)[table].findIndex((i: any) => i[col] === id);
          if (idx !== -1) {
            (this.storage as any)[table][idx] = { ...(this.storage as any)[table][idx], ...val };
            localStorage.setItem(`mock_${table}`, JSON.stringify((this.storage as any)[table]));
          }
          return Promise.resolve({ error: null });
        }
      })
    };
  }

  channel(name: string) {
    return {
      on: (type: string, config: any, callback: any) => {
        this.listeners.push({ table: config.table, callback });
        return { subscribe: () => ({}) };
      },
      subscribe: (callback: any) => {
        if (callback) callback('SUBSCRIBED');
        return { track: () => Promise.resolve() };
      },
      presenceState: () => ({ initiator: [{}], respondent: [{}] }) // Simulate everyone online in demo
    };
  }
  
  removeChannel() {}
}

export const isDemoMode = !supabaseUrl || !supabaseAnonKey;

export const supabase = !isDemoMode
  ? createClient(supabaseUrl, supabaseAnonKey)
  : new MockSupabaseClient() as any;

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
