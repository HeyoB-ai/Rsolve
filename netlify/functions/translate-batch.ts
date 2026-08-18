// Bulk-vertaling: vertaalt een array van teksten in één keer, zodat de "live
// vertaalknop" op de site niet honderden losse calls hoeft te doen.
import { GoogleGenAI } from '@google/genai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.6-flash';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};

export default async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') return new Response('', { status: 204, headers: CORS });
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: CORS });

  let texts: string[] = [];
  let targetLanguage = 'English';
  try {
    const body = await req.json();
    texts = Array.isArray(body?.texts) ? body.texts.map((t: any) => String(t)) : [];
    targetLanguage = String(body?.targetLanguage || 'English');
  } catch {
    return new Response(JSON.stringify({ result: [] }), { status: 400, headers: CORS });
  }

  // Niets te doen of geen sleutel: geef het origineel terug (fail-safe).
  if (!texts.length || !GEMINI_API_KEY) {
    return new Response(JSON.stringify({ result: texts }), { status: 200, headers: CORS });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents:
        `Je krijgt een JSON-array met UI-teksten van een website. Vertaal ELKE string naar ${targetLanguage}.\n` +
        `Regels:\n` +
        `- Geef ALLEEN een JSON-array van strings terug, exact dezelfde lengte en volgorde als de invoer.\n` +
        `- Vertaal de merknaam "Rsolve"/"RSOLVE" NIET; laat die ongewijzigd.\n` +
        `- Laat getallen, bedragen (zoals € 3,99), e-mailadressen en URL's ongewijzigd.\n` +
        `- Vertaal natuurlijk en beknopt; behoud de betekenis en toon.\n\n` +
        `Invoer:\n${JSON.stringify(texts)}`,
      config: { temperature: 0.2, responseMimeType: 'application/json' },
    });

    let out: any = texts;
    try {
      const parsed = JSON.parse(response.text || '[]');
      if (Array.isArray(parsed) && parsed.length === texts.length) {
        out = parsed.map((v: any, i: number) => (typeof v === 'string' && v.trim() ? v : texts[i]));
      }
    } catch {
      /* val terug op origineel */
    }
    return new Response(JSON.stringify({ result: out }), { status: 200, headers: CORS });
  } catch (e) {
    console.error('[translate-batch] fout:', e);
    return new Response(JSON.stringify({ result: texts }), { status: 200, headers: CORS });
  }
};
