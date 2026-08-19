// Verwijdert een volledig dossier permanent uit Supabase: alle berichten,
// privé-notities, export-records en het dossier zelf, plus de bijbehorende
// bestanden in de opslag (chat-uploads en exports). Zo doet de knop
// "Verwijder & sluit" écht wat het privacybeleid belooft (AVG-recht op wissen).
//
// Autorisatie: in dit model is er geen accountlogin; het dossier-id (een UUID)
// is de facto het toegangsbewijs — wie het id heeft, heeft sowieso al toegang
// tot het dossier (join-link, berichten). Betaalgegevens (tabel `payments`)
// blijven bewaard i.v.m. de wettelijke fiscale bewaarplicht.
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};

// Verwijder alle bestanden onder de prefix `${caseId}/` in een privé-bucket.
async function wipeBucketFolder(supabase: any, bucket: string, caseId: string): Promise<number> {
  try {
    const { data: files, error } = await supabase.storage.from(bucket).list(caseId, { limit: 1000 });
    if (error || !Array.isArray(files) || files.length === 0) return 0;
    const paths = files.map((f: any) => `${caseId}/${f.name}`);
    const { error: rmErr } = await supabase.storage.from(bucket).remove(paths);
    return rmErr ? 0 : paths.length;
  } catch {
    return 0;
  }
}

export default async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') return new Response('', { status: 204, headers: CORS });
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'method not allowed' }), { status: 405, headers: CORS });

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    return new Response(JSON.stringify({ error: 'not configured' }), { status: 500, headers: CORS });
  }

  let caseId = '';
  try {
    const body = await req.json();
    caseId = String(body?.caseId || '').trim();
  } catch {
    return new Response(JSON.stringify({ error: 'bad request' }), { status: 400, headers: CORS });
  }

  // Basisvalidatie: geen path-tekens, plausibele id-lengte (UUID).
  if (!caseId || caseId.length < 8 || caseId.length > 64 || /[/\\.\s]/.test(caseId)) {
    return new Response(JSON.stringify({ error: 'invalid caseId' }), { status: 400, headers: CORS });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });

  const result: Record<string, unknown> = { ok: true, caseId };
  const errors: string[] = [];

  // 1) Opslag eerst (bijlagen + gegenereerde exports).
  result.chat_uploads_removed = await wipeBucketFolder(supabase, 'chat-uploads', caseId);
  result.exports_files_removed = await wipeBucketFolder(supabase, 'exports', caseId);

  // 2) Databaserijen — kinderen vóór het dossier.
  const delChild = async (table: string, column: string) => {
    const { error } = await supabase.from(table).delete().eq(column, caseId);
    if (error) errors.push(`${table}: ${error.message}`);
  };
  await delChild('messages', 'case_id');
  await delChild('private_notes', 'case_id');
  await delChild('exports', 'case_id');

  const { error: caseErr } = await supabase.from('cases').delete().eq('id', caseId);
  if (caseErr) errors.push(`cases: ${caseErr.message}`);

  // NB: `payments` bewust NIET verwijderd (wettelijke fiscale bewaarplicht).

  if (errors.length) {
    result.ok = false;
    result.errors = errors;
    return new Response(JSON.stringify(result), { status: 500, headers: CORS });
  }
  return new Response(JSON.stringify(result), { status: 200, headers: CORS });
};
