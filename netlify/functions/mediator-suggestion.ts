// Geeft een korte coaching-suggestie (gebruikt in CaseDetails). Server-side proxy.
import { GoogleGenAI } from '@google/genai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.6-flash';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};

const FALLBACK = 'Blijf luisteren naar de behoeften van de ander.';

export default async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') return new Response('', { status: 204, headers: CORS });
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: CORS });

  let context = '';
  try {
    const body = await req.json();
    context = String(body?.context || '');
  } catch {
    return new Response(JSON.stringify({ result: FALLBACK }), { status: 400, headers: CORS });
  }

  if (!GEMINI_API_KEY) {
    return new Response(JSON.stringify({ result: 'Blijf constructief in het gesprek.' }), { status: 200, headers: CORS });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: `Je bent een neutrale AI mediator. Geef een korte, behulpzame suggestie (maximaal 2 zinnen) om het gesprek constructief te houden op basis van de volgende chatgeschiedenis:\n\n${context}\n\nSuggestie:`,
      config: { temperature: 0.7 },
    });
    return new Response(JSON.stringify({ result: response.text?.trim() || FALLBACK }), { status: 200, headers: CORS });
  } catch (e) {
    console.error('[mediator-suggestion] fout:', e);
    return new Response(JSON.stringify({ result: 'Probeer de situatie vanuit het perspectief van de ander te bekijken.' }), { status: 200, headers: CORS });
  }
};
