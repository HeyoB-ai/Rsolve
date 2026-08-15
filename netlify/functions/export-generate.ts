// Rsolve Pro — Fase 2 + 3: stelt server-side een gestructureerd overdrachtsdossier samen
// en rendert het als professioneel PDF-document.
// Beveiliging: identificatie via het geheime partij-token (token -> case + rol),
// zodat een partij nooit gegevens van de andere partij kan exporteren (IDOR-veilig).
// Genereert: canonieke bron-payload + SHA-256-hash + neutrale AI-samenvatting + PDF
// in de privé-bucket 'exports' met een korte signed URL.
import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';
import { createHash } from 'node:crypto';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
const CONSENT_VERSION = 'v1';
const MAX_MESSAGES_FOR_AI = 400; // bescherming bij extreem lange gesprekken
const MAX_MESSAGES_FOR_PDF = 600; // volledige-conversatie-weergave begrenzen
const SIGNED_URL_TTL = 600; // seconden

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

// -- Tekst-sanering: StandardFont (WinAnsi) dekt Latijn-1 volledig; overige
//    letters (Pools/Turks/etc.) worden getranslitereerd, onbekende tekens -> '?'.
//    (Volledige Unicode/Arabisch volgt met een ingebedde font in Fase 4.)
const TRANSLIT: Record<string, string> = {
  'ł': 'l', 'Ł': 'L', 'ą': 'a', 'Ą': 'A', 'ę': 'e', 'Ę': 'E', 'ś': 's', 'Ś': 'S',
  'ż': 'z', 'Ż': 'Z', 'ź': 'z', 'Ź': 'Z', 'ć': 'c', 'Ć': 'C', 'ń': 'n', 'Ń': 'N',
  'ş': 's', 'Ş': 'S', 'ğ': 'g', 'Ğ': 'G', 'ı': 'i', 'İ': 'I',
  'č': 'c', 'Č': 'C', 'š': 's', 'Š': 'S', 'ž': 'z', 'Ž': 'Z', 'ř': 'r', 'Ř': 'R',
  'ě': 'e', 'Ě': 'E', 'ů': 'u', 'ā': 'a', 'ē': 'e', 'ī': 'i', 'ō': 'o', 'ū': 'u',
  '‘': "'", '’': "'", '“': '"', '”': '"',
  '–': '-', '—': '-', '…': '...', '•': '-', ' ': ' ',
};
function wa(input: any): string {
  const s = input == null ? '' : String(input);
  let out = '';
  for (const ch of s) {
    const c = ch.codePointAt(0) || 0;
    if (c === 9 || c === 10) { out += ch; continue; }
    if (c >= 32 && c <= 126) { out += ch; continue; }
    if (TRANSLIT[ch] !== undefined) { out += TRANSLIT[ch]; continue; }
    if (c === 0x20AC) { out += ch; continue; } // euroteken zit in WinAnsi
    if (c >= 0xA1 && c <= 0xFF) { out += ch; continue; } // Latijn-1 supplement
    out += '?';
  }
  return out;
}

function fmtDate(iso: string): string {
  try {
    const d = new Date(iso);
    const p = (n: number) => String(n).padStart(2, '0');
    return `${p(d.getUTCDate())}-${p(d.getUTCMonth() + 1)}-${d.getUTCFullYear()}`;
  } catch { return iso; }
}
function fmtDateTime(iso: string): string {
  try {
    const d = new Date(iso);
    const p = (n: number) => String(n).padStart(2, '0');
    return `${p(d.getUTCDate())}-${p(d.getUTCMonth() + 1)}-${d.getUTCFullYear()} ${p(d.getUTCHours())}:${p(d.getUTCMinutes())} UTC`;
  } catch { return iso; }
}

// ===================== PDF-RENDERING =====================
async function buildDossierPdf(d: {
  exportNo: string; type: 'summary' | 'full'; role: string; languageName: string;
  caseTitle: string; statusLabel: string; startedAt: string | null; hasVso: boolean;
  initiatorName: string; respondentName: string;
  summary: any; messages: any[]; ownNotes: any[];
  generatedAt: string; payloadHash: string; disclaimer: string;
}): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontB = await doc.embedFont(StandardFonts.HelveticaBold);

  const PAGE_W = 595.28, PAGE_H = 841.89, M = 56;
  const CW = PAGE_W - 2 * M;
  const BLUE = rgb(0.043, 0.314, 0.855);
  const DARK = rgb(0.059, 0.09, 0.165);
  const GRAY = rgb(0.39, 0.45, 0.55);
  const LIGHT = rgb(0.953, 0.957, 0.965);
  const BORDER = rgb(0.886, 0.91, 0.941);
  const WHITE = rgb(1, 1, 1);

  const pages: any[] = [];
  let page: any, y = 0;
  const addPage = () => { page = doc.addPage([PAGE_W, PAGE_H]); pages.push(page); y = PAGE_H - M; };
  const ensure = (h: number) => { if (y - h < M + 26) addPage(); };

  const wrap = (text: string, size: number, f: any, maxW: number): string[] => {
    const words = text.split(/\s+/).filter((w) => w.length);
    const out: string[] = []; let cur = '';
    for (let w of words) {
      while (f.widthOfTextAtSize(w, size) > maxW && w.length > 1) {
        let i = 1;
        while (i < w.length && f.widthOfTextAtSize(w.slice(0, i + 1), size) <= maxW) i++;
        if (cur) { out.push(cur); cur = ''; }
        out.push(w.slice(0, i)); w = w.slice(i);
      }
      const test = cur ? cur + ' ' + w : w;
      if (f.widthOfTextAtSize(test, size) <= maxW) cur = test;
      else { if (cur) out.push(cur); cur = w; }
    }
    if (cur) out.push(cur);
    return out.length ? out : [''];
  };

  const paragraph = (text: any, opts: any = {}) => {
    const size = opts.size || 10, f = opts.f || font, color = opts.color || DARK;
    const gap = opts.gap == null ? 5 : opts.gap, lh = opts.lh || 1.35, indent = opts.indent || 0;
    const src = wa(text);
    const lineH = size * lh;
    for (const raw of src.split('\n')) {
      if (raw.trim() === '') { y -= lineH * 0.6; continue; }
      for (const line of wrap(raw, size, f, CW - indent)) {
        ensure(lineH);
        page.drawText(line, { x: M + indent, y: y - size, size, font: f, color });
        y -= lineH;
      }
    }
    y -= gap;
  };

  const heading = (title: string, big = false) => {
    ensure(34);
    y -= 8;
    const size = big ? 15 : 12.5;
    page.drawRectangle({ x: M, y: y - size, width: 3.5, height: size + 2, color: BLUE });
    page.drawText(wa(title), { x: M + 10, y: y - size + 1.5, size, font: fontB, color: DARK });
    y -= size + 9;
    page.drawLine({ start: { x: M, y }, end: { x: PAGE_W - M, y }, thickness: 0.6, color: BORDER });
    y -= 12;
  };

  const subheading = (t: string) => {
    ensure(18);
    y -= 3;
    page.drawText(wa(t), { x: M, y: y - 9, size: 9.5, font: fontB, color: BLUE });
    y -= 15;
  };

  const field = (label: string, value: any) => {
    ensure(24);
    page.drawText(wa(label.toUpperCase()), { x: M, y: y - 8, size: 7.5, font: fontB, color: GRAY });
    y -= 12;
    paragraph(value || '—', { size: 10.5, gap: 7 });
  };

  const bullets = (items: any[]) => {
    if (!items || !items.length) { paragraph('—', { size: 9.5, color: GRAY, gap: 6 }); return; }
    for (const it of items) {
      const src = wa(typeof it === 'string' ? it : JSON.stringify(it));
      const lines = wrap(src, 10, font, CW - 16);
      let first = true;
      for (const line of lines) {
        ensure(10 * 1.35);
        if (first) page.drawText('-', { x: M + 3, y: y - 10, size: 10, font: fontB, color: BLUE });
        page.drawText(line, { x: M + 16, y: y - 10, size: 10, font, color: DARK });
        y -= 10 * 1.35;
        first = false;
      }
      y -= 2;
    }
  };

  // ---------- VOORBLAD ----------
  addPage();
  page.drawRectangle({ x: 0, y: PAGE_H - 150, width: PAGE_W, height: 150, color: BLUE });
  page.drawText('RSOLVE PRO', { x: M, y: PAGE_H - 78, size: 24, font: fontB, color: WHITE });
  page.drawText('Professioneel overdrachtsdossier', { x: M, y: PAGE_H - 104, size: 11, font, color: rgb(0.82, 0.88, 1) });

  y = PAGE_H - 150 - 42;
  page.drawText('Overdrachtsdossier', { x: M, y: y - 22, size: 22, font: fontB, color: DARK });
  y -= 34;
  paragraph(d.caseTitle, { size: 13, color: GRAY, gap: 22 });

  const boxH = 132;
  const boxTop = y;
  page.drawRectangle({ x: M, y: boxTop - boxH, width: CW, height: boxH, color: LIGHT, borderColor: BORDER, borderWidth: 1 });
  const col1 = M + 20, col2 = M + CW / 2 + 6;
  const coverField = (x: number, yy: number, label: string, val: string) => {
    page.drawText(wa(label.toUpperCase()), { x, y: yy, size: 7, font: fontB, color: GRAY });
    const lines = wrap(wa(val), 10.5, fontB, CW / 2 - 34);
    page.drawText(lines[0] || '—', { x, y: yy - 14, size: 10.5, font: fontB, color: DARK });
  };
  let iy = boxTop - 26;
  coverField(col1, iy, 'Dossiernummer', d.exportNo);
  coverField(col2, iy, 'Datum', fmtDate(d.generatedAt));
  iy -= 44;
  coverField(col1, iy, 'Type dossier', d.type === 'full' ? 'Volledig dossier' : 'Samenvatting');
  coverField(col2, iy, 'Dossiertaal', d.languageName);
  iy -= 44;
  coverField(col1, iy, 'Aangevraagd door', d.role === 'initiator' ? `Partij A - ${d.initiatorName}` : `Partij B - ${d.respondentName}`);
  coverField(col2, iy, 'Status', d.statusLabel);

  y = boxTop - boxH - 26;
  paragraph(`Partijen: ${d.initiatorName} (Partij A) en ${d.respondentName} (Partij B).`, { size: 10.5, gap: 14 });

  // disclaimer onderaan voorblad
  const discY = M + 46;
  page.drawRectangle({ x: M, y: discY - 6, width: CW, height: 58, color: rgb(0.98, 0.98, 0.99), borderColor: BORDER, borderWidth: 0.8 });
  page.drawText('BELANGRIJK', { x: M + 12, y: discY + 34, size: 7.5, font: fontB, color: GRAY });
  {
    const dl = wrap(wa(d.disclaimer), 8.5, font, CW - 24);
    let dy2 = discY + 22;
    for (const l of dl.slice(0, 3)) { page.drawText(l, { x: M + 12, y: dy2, size: 8.5, font, color: GRAY }); dy2 -= 11; }
  }

  // ---------- 1. ZAAKGEGEVENS ----------
  addPage();
  heading('1. Zaakgegevens');
  field('Onderwerp', d.caseTitle);
  field('Status', d.statusLabel);
  field('Gestart op', d.startedAt ? fmtDateTime(d.startedAt) : '—');
  field('Vaststellingsovereenkomst aanwezig', d.hasVso ? 'Ja' : 'Nee');

  // ---------- 2. PARTIJEN ----------
  heading('2. Betrokken partijen');
  field('Partij A (initiator)', d.initiatorName);
  field('Partij B (wederpartij)', d.respondentName);
  field('Dit dossier aangevraagd door', d.role === 'initiator' ? 'Partij A' : 'Partij B');

  // ---------- 3. AI-SAMENVATTING ----------
  const s = d.summary || {};
  heading('3. AI-samenvatting (automatisch gegenereerd)');
  paragraph('Onderstaande analyse is door AI opgesteld op basis van de gedeelde communicatie binnen Rsolve. Het betreft geen juridisch oordeel; er wordt geen schuld of gelijk uitgesproken en geen uitkomst gegarandeerd.', { size: 8.5, color: GRAY, gap: 12 });

  subheading('Omschrijving van het conflict');
  paragraph(s.conflict_description || '—');
  subheading('Professionele samenvatting');
  paragraph(s.professional_summary || '—');
  subheading('Chronologie');
  bullets((s.chronology || []).map((c: any) => (typeof c === 'string' ? c : `${c?.date ? c.date + ' — ' : ''}${c?.event || ''}`)));
  subheading('Standpunt Partij A');
  paragraph(s.standpoint_a || '—');
  subheading('Standpunt Partij B');
  paragraph(s.standpoint_b || '—');
  subheading('Belangen Partij A');
  paragraph(s.interests_a || '—');
  subheading('Belangen Partij B');
  paragraph(s.interests_b || '—');
  subheading('Punten van overeenstemming');
  bullets(s.agreements || []);
  subheading('Geschilpunten');
  bullets(s.disagreements || []);
  subheading('Genoemde bedragen en data');
  bullets(s.amounts_dates || []);
  subheading('Voorstellen');
  bullets((s.proposals || []).map((p: any) => (typeof p === 'string' ? p : `${p?.proposal || ''}  [${p?.status || 'onbekend'}]`)));
  subheading('Gedeeltelijke overeenstemming');
  paragraph(s.partial_agreement || '—');
  subheading('Huidige status');
  paragraph(s.current_status || '—');
  subheading('Openstaande vragen');
  bullets(s.open_questions || []);

  let sectionNo = 4;

  // ---------- (full) VOLLEDIGE CONVERSATIE ----------
  if (d.type === 'full') {
    heading(`${sectionNo}. Feitelijke basis — volledige conversatie (bron)`);
    sectionNo++;
    paragraph('Onderstaande weergave is de letterlijke communicatie zoals door de partijen en de mediator uitgewisseld binnen Rsolve. Dit is brontekst, niet door AI bewerkt.', { size: 8.5, color: GRAY, gap: 12 });
    const msgs = d.messages.slice(-MAX_MESSAGES_FOR_PDF);
    if (d.messages.length > MAX_MESSAGES_FOR_PDF) {
      paragraph(`(Alleen de laatste ${MAX_MESSAGES_FOR_PDF} berichten van in totaal ${d.messages.length} zijn opgenomen.)`, { size: 8, color: GRAY, gap: 8 });
    }
    for (const m of msgs) {
      const who = m.sender_id === 'mediator' ? 'Mediator'
        : m.sender_id === 'initiator' ? `Partij A (${d.initiatorName})`
        : m.sender_id === 'respondent' ? `Partij B (${d.respondentName})`
        : 'Systeem';
      const when = m.at ? ` · ${fmtDateTime(m.at)}` : '';
      const content = m.type === 'attachment' ? `[bijlage] ${m.content || ''}` : (m.content || '');
      if (!String(content).trim()) continue;
      ensure(24);
      page.drawText(wa(who + when), { x: M, y: y - 8, size: 8, font: fontB, color: BLUE });
      y -= 12;
      paragraph(content, { size: 9.5, gap: 8 });
    }
  }

  // ---------- VERTROUWELIJKE NOTITIES (alleen aanvrager) ----------
  if (d.ownNotes && d.ownNotes.length) {
    heading(`${sectionNo}. Vertrouwelijke notities (uitsluitend van de aanvrager)`);
    sectionNo++;
    paragraph('Deze notities zijn alleen door de aanvragende partij met Rsolve gedeeld en zijn niet aan de wederpartij getoond. Notities van de wederpartij zijn nooit in dit dossier opgenomen.', { size: 8.5, color: GRAY, gap: 12 });
    bullets(d.ownNotes.map((n: any) => n.content));
  }

  // ---------- INTEGRITEIT & VERIFICATIE ----------
  heading('Integriteit & verificatie');
  field('Dossiernummer', d.exportNo);
  field('Versie', '1');
  field('Gegenereerd op', fmtDateTime(d.generatedAt));
  field('Consent-versie', CONSENT_VERSION);
  field('SHA-256 hash (canonieke payload)', d.payloadHash);
  paragraph('Deze hash is een unieke digitale vingerafdruk van de onderliggende gegevens: wijzigt de inhoud, dan wijzigt de hash. Dit dossier is een geautomatiseerd overzicht en vormt geen gekwalificeerde elektronische handtekening of proces-verbaal.', { size: 8.5, color: GRAY });

  // ---------- VOETTEKST OP ELKE PAGINA ----------
  const total = pages.length;
  pages.forEach((p, i) => {
    const foot = `Rsolve Pro   ·   ${d.exportNo}   ·   ${d.payloadHash.slice(0, 12)}...   ·   pagina ${i + 1} / ${total}`;
    p.drawLine({ start: { x: M, y: M - 8 }, end: { x: PAGE_W - M, y: M - 8 }, thickness: 0.6, color: BORDER });
    p.drawText(wa(foot), { x: M, y: M - 20, size: 7, font, color: GRAY });
    const tag = 'VERTROUWELIJK';
    p.drawText(tag, { x: PAGE_W - M - fontB.widthOfTextAtSize(tag, 7), y: M - 20, size: 7, font: fontB, color: GRAY });
  });

  return await doc.save();
}
// ===================== EINDE PDF-RENDERING =====================

export default async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') return new Response('', { status: 204, headers: CORS });
  if (req.method !== 'POST') return json({ error: 'method' }, 405);

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !GEMINI_API_KEY) {
    console.error('[export] Ontbrekende server-configuratie.');
    return json({ error: 'not_configured' }, 500);
  }

  let token = '', type: 'summary' | 'full' = 'summary', language = 'nl', languageName = 'Nederlands';
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
  const statusCode = bothSigned ? 'overeenkomst_getekend' : hasVso ? 'vso_opgesteld' : 'in_behandeling';
  const statusLabel = bothSigned ? 'Overeenkomst getekend' : hasVso ? 'Vaststellingsovereenkomst opgesteld' : 'In behandeling';

  // 5. Bron-payload (feitelijke, door partijen geleverde informatie)
  const messagesForPayload = messages.map((m) => ({
    role: m.sender_id,
    name: m.sender_name,
    type: m.type,
    content: m.content,
    at: m.created_at,
  }));
  const source = {
    case: {
      id: caseId,
      title: caseRow.title || '',
      started_at: caseRow.created_at || null,
      status: statusCode,
      has_vso: hasVso,
      vso_terms: caseRow.vso_terms || null,
    },
    parties: { initiator: initiatorName, respondent: respondentName },
    messages: messagesForPayload,
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
  const disclaimer = 'Onderstaande samenvatting is automatisch opgesteld op basis van de communicatie binnen Rsolve en vormt geen juridisch oordeel.';
  const meta = {
    export_no: exportNo,
    case_id: caseId,
    requested_by_role: role,
    type,
    language,
    version: 1,
    consent_version: CONSENT_VERSION,
    generated_at: generatedAt,
    disclaimer,
  };
  const canonicalPayload = { meta, source, ai_summary: cleanSummary };
  const payloadHash = createHash('sha256').update(canonicalize(canonicalPayload)).digest('hex');

  // 8. PDF renderen + uploaden naar privé-bucket 'exports' + korte signed URL
  let pdfPath: string | null = null;
  let pdfUrl: string | null = null;
  let pdfError: string | null = null;
  try {
    const pdfBytes = await buildDossierPdf({
      exportNo, type, role, languageName,
      caseTitle: caseRow.title || '',
      statusLabel, startedAt: caseRow.created_at || null, hasVso,
      initiatorName, respondentName,
      summary: cleanSummary, messages: messagesForPayload, ownNotes: (ownNotes || []),
      generatedAt, payloadHash, disclaimer,
    });
    const path = `${caseId}/${exportNo}.pdf`;
    const up = await supabase.storage.from('exports').upload(path, Buffer.from(pdfBytes), {
      contentType: 'application/pdf', upsert: true,
    });
    if (up.error) throw up.error;
    const signed = await supabase.storage.from('exports').createSignedUrl(path, SIGNED_URL_TTL);
    if (signed.error) throw signed.error;
    pdfPath = path;
    pdfUrl = signed.data?.signedUrl || null;
  } catch (e: any) {
    pdfError = e?.message || String(e);
    console.error('[export] PDF-generatie/upload mislukt:', pdfError);
  }

  // 9. Export-record opslaan (audit + integriteit)
  const { error: insErr } = await supabase.from('exports').insert([{
    export_no: exportNo,
    case_id: caseId,
    requested_by_role: role,
    type,
    language,
    status: pdfPath ? 'rendered' : 'generated',
    payload_hash: payloadHash,
    version: 1,
    consent_version: CONSENT_VERSION,
    pdf_path: pdfPath,
  }]);
  if (insErr) console.error('[export] Record opslaan mislukt:', insErr.message);

  // 10. Resultaat (preview + download-URL)
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
    disclaimer,
    pdf_ready: Boolean(pdfUrl),
    pdf_url: pdfUrl,
    pdf_expires_in: pdfUrl ? SIGNED_URL_TTL : null,
    pdf_error: pdfError,
  });
};
