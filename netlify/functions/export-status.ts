// Rsolve Pro — Fase 4 (fix): status-poll voor de achtergrond-export.
// De wizard pollt deze snelle functie tot het dossier klaar is (of faalt),
// en haalt dan de preview + PDF (base64) op. Autorisatie via het partij-token.
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};

function json(body: any, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: CORS });
}

export default async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') return new Response('', { status: 204, headers: CORS });
  if (req.method !== 'POST') return json({ error: 'method' }, 405);
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) return json({ error: 'not_configured' }, 500);

  let token = '', exportNo = '';
  try {
    const body = await req.json();
    token = String(body?.token || '');
    exportNo = String(body?.export_no || '');
  } catch {
    return json({ error: 'bad_request' }, 400);
  }

  if (!/^[a-zA-Z0-9]{8,128}$/.test(token)) return json({ error: 'invalid_token' }, 401);
  if (!/^[A-Za-z0-9-]{6,64}$/.test(exportNo)) return json({ error: 'invalid_export_no' }, 400);

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });

  // 1. Token -> case (server-side autorisatie)
  const { data: caseRow, error: caseErr } = await supabase
    .from('cases')
    .select('id, initiator_token, respondent_token')
    .or(`initiator_token.eq.${token},respondent_token.eq.${token}`)
    .single();
  if (caseErr || !caseRow) return json({ error: 'unauthorized' }, 401);
  const caseId = caseRow.id;

  // 2. Export-record zoeken
  const { data: row } = await supabase
    .from('exports')
    .select('export_no, case_id, status')
    .eq('export_no', exportNo)
    .maybeSingle();

  if (!row) return json({ ok: true, status: 'pending' });

  // 3. Autorisatie: het record moet bij het dossier van dit token horen (geen IDOR).
  if (row.case_id !== caseId) return json({ error: 'unauthorized' }, 401);

  if (row.status === 'failed') return json({ ok: true, status: 'failed', error: 'generation_failed' });
  if (row.status !== 'rendered') return json({ ok: true, status: row.status || 'pending' });

  // 4. Klaar: resultaat (preview + PDF base64) uit de privé-bucket lezen.
  try {
    const dl = await supabase.storage.from('exports').download(`${caseId}/${exportNo}.result.json`);
    if (dl.error || !dl.data) throw dl.error || new Error('no_result');
    const text = await dl.data.text();
    const result = JSON.parse(text);
    return json({ ok: true, status: 'rendered', ...result });
  } catch (e: any) {
    console.error('[export-status] result lezen mislukt:', e?.message || e);
    return json({ ok: true, status: 'rendered', pdf_ready: false, pdf_error: 'result_unavailable' });
  }
};
