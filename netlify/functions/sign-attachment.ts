// Maakt een kortdurende (verlopende) signed URL voor een bijlage in de PRIVATE
// bucket `chat-uploads`. De client vraagt deze aan om een afbeelding/bestand te tonen.
// Alleen de server (service-role) kan signen; de bucket is niet publiek leesbaar meer.
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const BUCKET = 'chat-uploads';
const EXPIRES_IN = 60 * 60; // 1 uur

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
    return new Response(JSON.stringify({ error: 'not configured' }), { status: 500, headers: CORS });
  }

  let path = '';
  try {
    const body = await req.json();
    path = String(body?.path || '');
  } catch {
    return new Response(JSON.stringify({ error: 'bad request' }), { status: 400, headers: CORS });
  }

  // Basisvalidatie: geen absolute URL's, geen path traversal.
  if (!path || /^https?:\/\//i.test(path) || path.includes('..')) {
    return new Response(JSON.stringify({ error: 'invalid path' }), { status: 400, headers: CORS });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, EXPIRES_IN);

  if (error || !data?.signedUrl) {
    return new Response(JSON.stringify({ error: 'not found' }), { status: 404, headers: CORS });
  }
  return new Response(JSON.stringify({ url: data.signedUrl }), { status: 200, headers: CORS });
};
