// Vertaal-proxy. De client roept deze functie aan i.p.v. Gemini rechtstreeks,
// zodat de API-sleutel in de browser verdwijnt.
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

  let text = '';
  let targetLanguage = 'Nederlands';
  try {
    const body = await req.json();
    text = String(body?.text || '');
    targetLanguage = String(body?.targetLanguage || 'Nederlands');
  } catch {
    return new Response(JSON.stringify({ result: '' }), { status: 400, headers: CORS });
  }

  if (!text.trim() || !GEMINI_API_KEY) {
    return new Response(JSON.stringify({ result: text }), { status: 200, headers: CORS });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: `Vertaal enkel de tekst naar ${targetLanguage}: "${text}"`,
    });
    return new Response(JSON.stringify({ result: response.text?.trim() || text }), { status: 200, headers: CORS });
  } catch (e) {
    console.error('[translate] fout:', e);
    return new Response(JSON.stringify({ result: text }), { status: 200, headers: CORS });
  }
};
