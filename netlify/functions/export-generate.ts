// Rsolve Pro — Fase 2: stelt server-side een gestructureerd overdrachtsdossier samen.
// Beveiliging: identificatie via het geheime partij-token (token -> case + rol),
// zodat een partij nooit gegevens van de andere partij kan exporteren (IDOR-veilig).
// Genereert: canonieke bron-payload + SHA-256-hash + neutrale AI-samenvatting.
// (PDF-rendering en de consent-wizard volgen in latere fases.)
import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';
import { createHash } from 'node:crypto';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
const CONSENT_VERSION = 'v1';
const MAX_MESSAGES_FOR_AI = 400; // bescherming bij extreem lange gesprekken

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};

// Deterministische serialisatie (gesorteerde keys) voor een reproduceerbare hash.
function canonicalize(v: any): string {
  if (Array.isArray(v)) return '[' + v.map(canonicalize).join(',') + ']';
  if (v && typeof v === 'object') {
    return '{' + Object.keys(v).sort().map((k) => JSON.stringify(k) + ':' + canonicalize(v[k])).join(',') + '}';
  }
  return JSON.stringify(v === undefined ? null : v);
}

function json(body: any, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: CORS });
}

const SUMMARY_KEYS = [
  'conflict_description', 'chronology', 'standpoint_a', 'standpoint_b',
  'interests_a', 'interests_b', 'agreements', 'disagreements', 'amounts_dates',
  'proposals', 'partial_agreement', 'current_status', 'open_questions', 'professional_summary',
];

export default async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') return new Response('', { status: 204, headers: CORS });
  if (req.method !== 'POST') return json({ error: 'method' }, 405);

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !GEMINI_API_KEY) {
    console.error('[export] Ontbrekende server-configuratie.');
    return json({ error: 'not_configured' }, 500);
  }

  let token = '', type = 'summary', language = 'nl', languageName = 'Nederlands';
  try {
    const body = await req.json();
    token = String(body?.token || '');
    type = body?.type === 'full' ? 'full' : 'summary';
    language = String(body?.language || 'nl');
    languageName = String(body?.languageName || 'Nederlands');
  } catch {
    return json({ error: 'bad_request' }, 400);
  }

  // Token-formaat valideren (alfanumeriek) — voorkomt filter-injectie in de .or-query.
  if (!/^[a-zA-Z0-9]{8,128}$/.test(token)) {
    return json({ error: 'invalid_token' }, 401);
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });

  // 1. Token -> case + rol (server-side autorisatie)
  const { data: caseRow, error: caseErr } = await supabase
    .from('cases')
    .select('*')
    .or(`initiator_token.eq.${token},respondent_token.eq.${token}`)
    .single();

  if (caseErr || !caseRow) {
    return json({ error: 'unauthorized' }, 401);
  }
  const role: 'initiator' | 'respondent' = caseRow.initiator_token === token ? 'initiator' : 'respondent';
  const caseId = caseRow.id;

  // 2. Gedeelde conversatie ophalen
  const { data: allMessages } = await supabase
    .from('messages')
    .select('sender_id, sender_name, content, type, attachment_url, created_at')
    .eq('case_id', caseId)
    .order('created_at', { ascending: true });

  const messages = (allMessages || []).filter(
    (m) => !(m.type === 'system' && String(m.content || '').includes('[TRIGGER:VSO]'))
  );

  // 3. Eigen vertrouwelijke notities (alleen van deze partij; nooit die van de ander)
  const { data: ownNotes } = await supabase
    .from('private_notes')
    .select('content, created_at')
    .eq('case_id', caseId)
    .eq('owner_role', role)
    .order('created_at', { ascending: true });

  // 4. Bijlagen-index (alleen namen/tijdstippen, geen inhoud)
  const attachments = messages
    .filter((m) => m.type === 'attachment')
    .map((m) => ({ name: m.content || 'bijlage', by: m.sender_id, at: m.created_at }));

  const initiatorName = caseRow.initiator_name || 'Partij A';
  const respondentName = caseRow.respondent_name || caseRow.other_party || 'Partij B';
  const hasVso = Boolean(caseRow.vso_terms);
  const bothSigned = Boolean(caseRow.initiator_signature && caseRow.respondent_signature);

  // 5. Bron-payload (feitelijke, door partijen geleverde informatie)
  const source = {
    case: {
      id: caseId,
      title: caseRow.title || '',
      started_at: caseRow.created_at || null,
      status: bothSigned ? 'overeenkomst_getekend' : hasVso ? 'vso_opgesteld' : 'in_behandeling',
      has_vso: hasVso,
      vso_terms: caseRow.vso_terms || null,
    },
    parties: { initiator: initiatorName, respondent: respondentName },
    messages: messages.map((m) => ({
      role: m.sender_id,
      name: m.sender_name,
      type: m.type,
      content: m.content,
      at: m.created_at,
    })),
    confidential_notes_own: (ownNotes || []).map((n) => ({ content: n.content, at: n.created_at })),
    attachments,
  };

  // 6. Neutrale, gestructureerde AI-samenvatting (waardevrij, geen juridisch oordeel)
  const transcript = messages
    .slice(-MAX_MESSAGES_FOR_AI)
    .map((m) => {
      const who = m.sender_id === 'mediator' ? 'MEDIATOR'
        : m.sender_id === 'initiator' ? `PARTIJ A (${initiatorName})`
        : m.sender_id === 'respondent' ? `PARTIJ B (${respondentName})`
        : 'SYSTEEM';
      return `${who}: ${m.content}`;
    })
    .join('\n');

  const prompt = `Je stelt een NEUTRALE, feitelijke samenvatting op van een mediation-gesprek voor overdracht aan een professional (advocaat/mediator).
STRIKTE REGELS:
- Baseer je UITSLUITEND op onderstaand gesprek. Verzin niets; laat velden leeg ("") of gebruik lege lijsten als iets niet blijkt.
- Geef GEEN juridisch oordeel, spreek geen schuld of gelijk uit, en garandeer geen uitkomst.
- Blijf beschrijvend en waardevrij ("Partij A stelt dat...", niet "Partij A heeft gelijk").
- Schrijf alle waarden in het ${languageName}.

Retourneer UITSLUITEND geldige JSON met exact deze sleutels:
{
 "conflict_description": string,
 "chronology": [{"date": string, "event": string}],
 "standpoint_a": string,
 "standpoint_b": string,
 "interests_a": string,
 "interests_b": string,
 "agreements": [string],
 "disagreements": [string],
 "amounts_dates": [string],
 "proposals": [{"proposal": string, "status": "accepted"|"rejected"|"open"|"unknown"}],
 "partial_agreement": string,
 "current_status": string,
 "open_questions": [string],
 "professional_summary": string
}

GESPREK (Partij A = ${initiatorName}, Partij B = ${respondentName}):
${transcript}`;

  let aiSummary: any = {};
  let aiOk = false;
  try {
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: { temperature: 0.2, responseMimeType: 'application/json' },
    });
    const text = response.text?.trim() || '{}';
    aiSummary = JSON.parse(text);
    aiOk = true;
  } catch (e: any) {
    console.error('[export] AI-samenvatting mislukt:', e?.message || e);
    aiSummary = { professional_summary: '', error: 'ai_summary_unavailable' };
  }
  // Alleen bekende sleutels behouden (voorspelbaar dossier).
  const cleanSummary: any = {};
  for (const k of SUMMARY_KEYS) cleanSummary[k] = (aiSummary && aiSummary[k] !== undefined) ? aiSummary[k] : (Array.isArray(aiSummary?.[k]) ? [] : '');

  // 7. Metadata + canonieke payload + hash
  const generatedAt = new Date().toISOString();
  const exportNo = `RP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  const meta = {
    export_no: exportNo,
    case_id: caseId,
    requested_by_role: role,
    type,
    language,
    version: 1,
    consent_version: CONSENT_VERSION,
    generated_at: generatedAt,
    disclaimer: 'Onderstaande samenvatting is automatisch opgesteld op basis van de communicatie binnen Rsolve en vormt geen juridisch oordeel.',
  };
  const canonicalPayload = { meta, source, ai_summary: cleanSummary };
  const payloadHash = createHash('sha256').update(canonicalize(canonicalPayload)).digest('hex');

  // 8. Export-record opslaan (audit + integriteit)
  const { error: insErr } = await supabase.from('exports').insert([{
    export_no: exportNo,
    case_id: caseId,
    requested_by_role: role,
    type,
    language,
    status: 'generated',
    payload_hash: payloadHash,
    version: 1,
    consent_version: CONSENT_VERSION,
  }]);
  if (insErr) console.error('[export] Record opslaan mislukt:', insErr.message);

  // 9. Resultaat (voor de tijdelijke preview in Fase 2)
  return json({
    ok: true,
    export_no: exportNo,
    hash: payloadHash,
    generated_at: generatedAt,
    role,
    ai_ok: aiOk,
    parties: source.parties,
    counts: { messages: messages.length, attachments: attachments.length, confidential_own: source.confidential_notes_own.length },
    ai_summary: cleanSummary,
    disclaimer: meta.disclaimer,
  });
};
