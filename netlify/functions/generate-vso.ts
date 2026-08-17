// Genereert de artikelen van de Vaststellingsovereenkomst (VSO) server-side.
// De client roept deze functie aan i.p.v. Gemini rechtstreeks.
import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from '@google/genai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.6-flash';

const SAFETY = [
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
];

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};

export default async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') return new Response('', { status: 204, headers: CORS });
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: CORS });

  let history: { sender: string; text: string }[] = [];
  let caseTitle = 'Dossier';
  try {
    const body = await req.json();
    history = Array.isArray(body?.history) ? body.history : [];
    caseTitle = String(body?.caseTitle || 'Dossier');
  } catch {
    return new Response(JSON.stringify({ result: '' }), { status: 400, headers: CORS });
  }

  if (!GEMINI_API_KEY) {
    return new Response(JSON.stringify({ result: 'Kon geen VSO opstellen.' }), { status: 200, headers: CORS });
  }

  const now = new Date().toLocaleDateString('nl-NL', { year: 'numeric', month: 'long', day: 'numeric' });
  const convo = history.map((m) => `${m.sender}: ${m.text}`).join('\n');

  try {
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: `Stel een Vaststellingsovereenkomst (VSO) op die de afspraken van de partijen vastlegt, gebaseerd op dit mediation gesprek.
          Datum van opstellen: ${now}
          Onderwerp: ${caseTitle}
          Gesprek:
          ${convo}

          STRIKTE REGELS:
          - Baseer je UITSLUITEND op de afspraken die de partijen in het gesprek daadwerkelijk hebben gemaakt. Verzin GEEN extra afspraken, rechten, verplichtingen, bedragen, termijnen of boetes die niet zijn afgesproken.
          - Dit document legt de EIGEN afspraken van de partijen vast; het is geen juridisch advies of juridisch oordeel. Noem geen wetsartikelen als onderbouwing van de inhoud en presenteer geen wettelijke normen als vaststaand feit.
          - Schrijf helder en zakelijk in het Nederlands.
          - Voeg als LAATSTE genummerde artikel altijd deze slotbepaling toe: "Deze overeenkomst legt uitsluitend de door partijen zelf gemaakte afspraken vast en vormt geen juridisch advies of juridische toetsing. Partijen wordt aangeraden de overeenkomst bij twijfel te laten controleren door een jurist of advocaat."

          Geef ENKEL de genummerde artikelen. Geef geen inleiding of afsluitende tekst buiten de artikelen.`,
      config: { temperature: 0.1, safetySettings: SAFETY },
    });
    return new Response(JSON.stringify({ result: response.text?.trim() || 'Kon geen VSO opstellen.' }), { status: 200, headers: CORS });
  } catch (e) {
    console.error('[generate-vso] fout:', e);
    return new Response(JSON.stringify({ result: 'Kon geen VSO opstellen.' }), { status: 500, headers: CORS });
  }
};
