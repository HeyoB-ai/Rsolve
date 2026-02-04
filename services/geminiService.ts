import { GoogleGenAI, Type, HarmCategory, HarmBlockThreshold } from "@google/genai";

export interface ChatRoleConfig {
  initiator: string;
  respondent: string;
}

export interface AttachmentData {
  mimeType: string;
  data: string; // Base64
}

export class GeminiService {
  private get ai() {
    const apiKey = process.env.API_KEY;
    if (!apiKey) return null;
    return new GoogleGenAI({ apiKey });
  }

  // Added missing getMediatorSuggestion method for CaseDetails.tsx
  async getMediatorSuggestion(context: string): Promise<string> {
    const client = this.ai;
    if (!client) return "Blijf constructief in het gesprek.";
    try {
      const response = await client.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Je bent een neutrale AI mediator. Geef een korte, behulpzame suggestie (maximaal 2 zinnen) om het gesprek constructief te houden op basis van de volgende chatgeschiedenis:\n\n${context}\n\nSuggestie:`,
        config: {
          temperature: 0.7,
        }
      });
      // Accessing .text property directly
      return response.text?.trim() || "Blijf luisteren naar de behoeften van de ander.";
    } catch {
      return "Probeer de situatie vanuit het perspectief van de ander te bekijken.";
    }
  }

  async translateText(text: string, targetLanguage: string = 'Nederlands'): Promise<string> {
    const client = this.ai;
    if (!client) return text;
    try {
      const response = await client.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Vertaal enkel de tekst naar ${targetLanguage}: "${text}"`,
      });
      // Accessing .text property directly
      return response.text?.trim() || text;
    } catch { return text; }
  }

  async generateMediatorResponse(
    chatHistory: {sender: string, text: string, role: string}[], 
    caseTitle: string,
    roles: ChatRoleConfig,
    attachment?: AttachmentData
  ): Promise<string> {
    const client = this.ai;
    if (!client) return "Verbinding verbroken.";
    
    // Injecteer de huidige tijd
    const now = new Date().toLocaleString('nl-NL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    try {
      // Formatteren met fallbacks voor namen en tekst om 'undefined' te voorkomen
      const formattedHistory = chatHistory.map(m => {
        const role = m.role ? String(m.role).toUpperCase() : 'UNKNOWN';
        const name = m.sender || 'Deelnemer';
        const text = m.text || '(geen tekst)';
        return `[${role}] ${name}: ${text}`;
      }).join('\n');
    
      const parts: any[] = [];
      
      // 1. Text Prompt
      parts.push({
        text: `SYSTEEM INSTRUCTIE VOOR RSOLVE AI MEDIATOR:
HUIDIGE DATUM EN TIJD: ${now}. (Gebruik deze datum strikt voor alle referenties naar 'vandaag' of datumberekeningen).

Dossier: "${caseTitle}"

IDENTITEITEN (STRIKT VOLGEN):
- INITIATOR (Starter): ${roles.initiator}
- RESPONDENT (Genodigde): ${roles.respondent}

JOUW DOEL:
Begeleid dit conflict naar een oplossing. Wees neutraal, rustig en constructief.
Als er een document of foto is geüpload, analyseer deze dan en geef aan wat je ziet (bijv. "Ik zie dat je een factuur hebt gedeeld...").

PROTOCOL VOOR AFRONDING:
1. Als er een akkoord lijkt te zijn, vat je dit samen.
2. Leg uit wat een Vaststellingsovereenkomst (VSO) is: "Dit is een officieel juridisch document dat jullie afspraken bindend vastlegt."
3. VRAAG expliciet of ze willen dat je de VSO nu opstelt.
4. Voeg PAS wanneer beide partijen akkoord zijn de code [TRIGGER:VSO] toe aan je bericht. Doe dit nooit ongevraagd.

HUIDIG GESPREK:
${formattedHistory}

Mediator:`
      });

      // 2. Attachment (if any)
      if (attachment) {
        parts.push({
          inlineData: {
            mimeType: attachment.mimeType,
            data: attachment.data
          }
        });
        parts.push({
            text: "\n[Systeem info: De bovenstaande bijlage is zojuist toegevoegd aan het gesprek. Betrek dit in je reactie.]"
        });
      }

      const response = await client.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: { parts },
        config: {
          temperature: 0.3,
          safetySettings: [
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
          ]
        }
      });
      
      return response.text?.trim() || "Ik heb het ontvangen. Wil je hier iets over toelichten?";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "Ik probeer de situatie te begrijpen. Kunnen jullie kort samenvatten waar we nu staan?";
    }
  }

  async generateVSOTerms(chatHistory: {sender: string, text: string}[], caseTitle: string): Promise<string> {
    const client = this.ai;
    if (!client) throw new Error("No client");
    
    const now = new Date().toLocaleDateString('nl-NL', { year: 'numeric', month: 'long', day: 'numeric' });

    // Switching to Flash for speed
    const response = await client.models.generateContent({
      model: 'gemini-3-flash-preview', 
      contents: `Stel een formele Vaststellingsovereenkomst (VSO) op (Art. 7:900 BW) gebaseerd op dit mediation gesprek.
          Datum van opstellen: ${now}
          Onderwerp: ${caseTitle}
          Gesprek:
          ${chatHistory.map(m => `${m.sender}: ${m.text}`).join('\n')}
          
          Geef ENKEL de genummerde artikelen in juridisch correct Nederlands. Geef geen inleiding of slot.`,
      config: { 
        temperature: 0.1,
        safetySettings: [
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        ]
      }
    });
    
    return response.text?.trim() || "Kon geen VSO opstellen.";
  }
}

export const geminiService = new GeminiService();