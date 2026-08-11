// Vertelt de client of een order (betaling) daadwerkelijk betaald is.
// De client roept dit aan na terugkeer van Stripe; toegang wordt pas verleend
// als hier { paid: true } uitkomt (server-geverifieerd, niet manipuleerbaar in de browser).
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};

export default async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') return new Response('', { status: 204, headers: CORS });
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: CORS });

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    return new Response(JSON.stringify({ paid: false }), { status: 500, headers: CORS });
  }

  let orderId = '';
  try {
    const body = await req.json();
    orderId = String(body?.orderId || '');
  } catch {
    return new Response(JSON.stringify({ paid: false }), { status: 400, headers: CORS });
  }
  if (!orderId) return new Response(JSON.stringify({ paid: false }), { status: 400, headers: CORS });

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });
  const { data } = await supabase.from('payments').select('status').eq('id', orderId).single();

  return new Response(JSON.stringify({ paid: data?.status === 'paid' }), { status: 200, headers: CORS });
};
