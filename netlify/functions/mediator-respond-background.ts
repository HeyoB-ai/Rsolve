// Netlify Background Function
// Wordt aangeroepen door een Supabase Database Webhook zodra er een nieuw bericht
// in de tabel `messages` wordt toegevoegd. Genereert server-side de mediator-reactie.
//
// De Gemini API-sleutel staat ALLEEN hier (Netlify env-var) en komt nooit in de browser.
// Een lock op de `cases`-rij voorkomt dubbele antwoorden; omdat de generatie hier draait
// en niet in de tab van de afzender, komt het antwoord ook als die de tab sluit.

import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from '@google/genai';

// --- Config uit environment (server-side, nooit in de client) ---
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || '';
// Modelnaam als env-var zodat je hem kunt wijzigen zonder code aan te passen.
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.6-flash';

// Gematigde safety-instellingen i.p.v. BLOCK_NONE: alleen zeer waarschijnlijk
// schadelijke content wordt geblokkeerd, zodat normale conflict-uitingen doorkomen.
const SAFETY = [
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
];

const LOCK_TIMEOUT_MS = 2 * 60 * 1000; // stale lock na 2 minuten vrijgeven

function buildPrompt(caseTitle: string, initiator: string, respondent: string, history: string) {
  const now = new Date().toLocaleString('nl-NL', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
  return `SYSTEEM INSTRUCTIE VOOR RSOLVE AI MEDIATOR:
HUIDIGE DATUM EN TIJD: ${now}. (Gebruik deze datum strikt voor alle referenties naar 'vandaag' of datumberekeningen).

Dossier: "${caseTitle}"

IDENTITEITEN (STRIKT VOLGEN):
- INITIATOR (Starter): ${initiator}
- RESPONDENT (Genodigde): ${respondent}

JOUW DOEL:
Begeleid dit conflict naar een oplossing. Wees neutraal, rustig en constructief.
Als er een document of foto is geüpload, analyseer deze dan en geef aan wat je ziet (bijv. "Ik zie dat je een factuur hebt gedeeld...").

PROTOCOL VOOR AFRONDING:
1. Als er een akkoord lijkt te zijn, vat je dit samen.
2. Leg uit wat een Vaststellingsovereenkomst (VSO) is: "Dit is een officieel juridisch document dat jullie afspraken bindend vastlegt."
3. VRAAG expliciet of ze willen dat je de VSO nu opstelt.
4. Voeg PAS wanneer beide partijen akkoord zijn de code [TRIGGER:VSO] toe aan je bericht. Doe dit nooit ongevraagd.

HUIDIG GESPREK:
${history}

Mediator:`;
}

export default async (req: Request): Promise<Response> => {
  // 1. Alleen POST
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  // 2. Webhook-secret verifiëren zodat niemand anders deze functie kan aanroepen
  if (!WEBHOOK_SECRET || req.headers.get('x-webhook-secret') !== WEBHOOK_SECRET) {
    return new Response('Unauthorized', { status: 401 });
  }

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !GEMINI_API_KEY) {
    console.error('[mediator] Ontbrekende server-configuratie (env-vars).');
    return new Response('Server not configured', { status: 500 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return new Response('Bad request', { status: 400 });
  }

  const record = body?.record;
  if (!record || !record.case_id) {
    return new Response('No record', { status: 200 });
  }

  // 3. Lus-preventie: alleen reageren op berichten van deelnemers,
  //    nooit op berichten van de mediator zelf of systeemberichten.
  const senderId = record.sender_id;
  const isParticipant = senderId === 'initiator' || senderId === 'respondent';
  const isUserContent = record.type === 'text' || record.type === 'attachment';
  if (!isParticipant || !isUserContent) {
    return new Response('Ignored (not a participant message)', { status: 200 });
  }

  const caseId = record.case_id;
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  // 4. Lock pakken (atomair): alleen als er niet al een generatie loopt
  //    of als een oude lock is verlopen.
  const staleCutoff = new Date(Date.now() - LOCK_TIMEOUT_MS).toISOString();
  const { data: locked, error: lockError } = await supabase
    .from('cases')
    .update({ mediator_busy: true, mediator_busy_at: new Date().toISOString() })
    .eq('id', caseId)
    .or(`mediator_busy.eq.false,mediator_busy_at.lt.${staleCutoff}`)
    .select('id');

  if (lockError) {
    console.error('[mediator] Lock-fout:', lockError.message);
    return new Response('Lock error', { status: 500 });
  }
  if (!locked || locked.length === 0) {
    // Er loopt al een generatie voor dit dossier -> netjes stoppen.
    return new Response('Already generating', { status: 200 });
  }

  try {
    // 5. Dossiergegevens ophalen (titel + namen voor de rollen)
    const { data: caseRow } = await supabase
      .from('cases')
      .select('*')
      .eq('id', caseId)
      .single();

    const caseTitle = caseRow?.title || record.case_title || 'Dossier';
    const initiatorName = caseRow?.initiator_name || 'Initiator';
    const respondentName = caseRow?.respondent_name || caseRow?.other_party || 'Respondent';

    // 6. Volledige gespreksgeschiedenis uit de database (betrouwbaarder dan de client)
    const { data: messages } = await supabase
      .from('messages')
      .select('sender_id, sender_name, content, type')
      .eq('case_id', caseId)
      .order('created_at', { ascending: true });

    const history = (messages || [])
      .filter((m) => m.type !== 'system' || !String(m.content || '').includes('[TRIGGER:VSO]'))
      .map((m) => {
        const role = m.sender_id ? String(m.sender_id).toUpperCase() : 'UNKNOWN';
        const name = m.sender_name || 'Deelnemer';
        const text = m.content || '(geen tekst)';
        return `[${role}] ${name}: ${text}`;
      })
      .join('\n');

    // 7. Prompt-onderdelen samenstellen
    const parts: any[] = [{ text: buildPrompt(caseTitle, initiatorName, respondentName, history) }];

    // 8. Bijlage meesturen indien het triggerbericht een upload is.
    //    De bucket is privé: we halen het bestand op met de service-role (download op pad).
    //    Oude berichten kunnen nog een publieke URL bevatten -> die ondersteunen we ook.
    if (record.type === 'attachment' && record.attachment_url) {
      try {
        const val: string = record.attachment_url;
        let buf: Buffer | null = null;
        let mimeType = 'application/octet-stream';
        if (/^https?:\/\//i.test(val)) {
          const fileRes = await fetch(val);
          if (fileRes.ok) {
            buf = Buffer.from(await fileRes.arrayBuffer());
            mimeType = fileRes.headers.get('content-type') || mimeType;
          }
        } else {
          const { data: fileData, error: dlError } = await supabase.storage.from('chat-uploads').download(val);
          if (!dlError && fileData) {
            buf = Buffer.from(await fileData.arrayBuffer());
            mimeType = fileData.type || mimeType;
          }
        }
        if (buf) {
          parts.push({ inlineData: { mimeType, data: buf.toString('base64') } });
          parts.push({ text: '\n[Systeem info: De bovenstaande bijlage is zojuist toegevoegd aan het gesprek. Betrek dit in je reactie.]' });
        }
      } catch (e) {
        console.error('[mediator] Bijlage ophalen mislukt:', e);
      }
    }

    // 9. Gemini aanroepen (sleutel staat veilig op de server)
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    let aiText = '';
    try {
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: { parts },
        config: { temperature: 0.3, safetySettings: SAFETY },
      });
      aiText = response.text?.trim() || '';
    } catch (e) {
      console.error('[mediator] Gemini-fout:', e);
      aiText = 'Ik probeer de situatie te begrijpen. Kunnen jullie kort samenvatten waar we nu staan?';
    }

    if (!aiText) {
      aiText = 'Ik heb het ontvangen. Wil je hier iets over toelichten?';
    }

    // 10. Antwoord terugschrijven. Bij een akkoord: VSO-trigger als systeembericht.
    if (aiText.includes('[TRIGGER:VSO]')) {
      const clean = aiText.replace('[TRIGGER:VSO]', '').trim();
      await supabase.from('messages').insert([{
        case_id: caseId,
        sender_id: 'mediator',
        sender_name: 'Mediator',
        content: (clean ? clean + ' ' : '') + '[TRIGGER:VSO]',
        type: 'system',
      }]);
    } else {
      await supabase.from('messages').insert([{
        case_id: caseId,
        sender_id: 'mediator',
        sender_name: 'Mediator',
        content: aiText,
        type: 'text',
      }]);
    }

    return new Response('ok', { status: 200 });
  } catch (e) {
    console.error('[mediator] Onverwachte fout:', e);
    return new Response('Error', { status: 500 });
  } finally {
    // 11. Lock altijd vrijgeven
    await supabase
      .from('cases')
      .update({ mediator_busy: false, mediator_busy_at: new Date().toISOString() })
      .eq('id', caseId);
  }
};
