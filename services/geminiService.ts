
import { GoogleGenAI, Type } from "@google/genai";

export interface ChatRoleConfig {
  initiator: string;
  respondent: string;
}

export class GeminiService {
  private get ai() {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.warn("Gemini API Key ontbreekt in process.env.API_KEY");
      return null;
    }
    return new GoogleGenAI({ apiKey });
  }

  async translateText(text: string, targetLanguage: string = 'Nederlands'): Promise<string> {
    const client = this.ai;
    if (!client) return text;
    try {
      const response = await client.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ 
          parts: [{ 
            text: `Vertaal de volgende tekst naar het ${targetLanguage}. Geef ENKEL de vertaling terug.\n\nTekst: "${text}"` 
          }] 
        }],
      });
      return response.text?.trim() || text;
    } catch (error) {
      return text;
    }
  }

  async generateMediatorResponse(
    chatHistory: {sender: string, text: string}[], 
    caseTitle: string,
    roles: ChatRoleConfig
  ): Promise<string> {
    const client = this.ai;
    if (!client) return "Ik ben even de verbinding kwijt. Blijf constructief.";
    
    const historyString = chatHistory.map(m => `${m.sender}: ${m.text}`).join('\n');
    
    try {
      const response = await client.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{
          parts: [{
            text: `Je bent de Senior AI Mediator van 'Rsolve'. 
Dossier: "${caseTitle}".

DEELNEMERS:
- Initiator (heeft de zaak gestart): ${roles.initiator}
- Respondent (is uitgenodigd): ${roles.respondent}

JOUW OPDRACHT:
Begeleid dit gesprek naar een oplossing. Wees neutraal, sturend en empathisch.

CRUCIALE REGELS:
1. De Initiator (${roles.initiator}) heeft dit dossier geopend. Als de Respondent (${roles.respondent}) vraagt wat de bedoeling is, vraag dan aan de INITIATOR om de situatie en het probleem eerst kort uit te leggen.
2. Wanneer er een duidelijke oplossing of akkoord is bereikt:
   - Leg EERST uit dat je nu een 'Vaststellingsovereenkomst' (VSO) gaat opstellen.
   - Vertel dat dit een juridisch document is waarin de gemaakte afspraken officieel worden vastgelegd om toekomstige discussies te voorkomen.
   - Voeg PAS DAARNA exact deze tekst toe aan het einde: "[ACTION:GENERATE_VSO]".
3. Gebruik geen juridisch jargon, maar praat menselijk.

Chatgeschiedenis:
${historyString}

Mediator:`
          }]
        }],
        config: {
          temperature: 0.7,
        }
      });
      
      const text = response.text?.trim();
      return text || `Ik begrijp het. Laten we kijken hoe we hier samen uitkomen.`;
    } catch (error) {
      console.error("Mediator error:", error);
      return "Ik zie dat de verbinding even hapert. Laten we teruggaan naar de kern van jullie afspraak.";
    }
  }

  async generateVSOTerms(chatHistory: {sender: string, text: string}[], caseTitle: string): Promise<string> {
    const client = this.ai;
    if (!client) return "Geen afspraken kunnen genereren wegens ontbrekende configuratie.";
    
    try {
      // Gebruik Flash voor VSO generatie voor maximale stabiliteit en snelheid
      const response = await client.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{
          parts: [{
            text: `Stel een formele Vaststellingsovereenkomst (VSO) op op basis van dit mediation gesprek. 
            Onderwerp: ${caseTitle}
            Gesprek:
            ${chatHistory.map(m => `${m.sender}: ${m.text}`).join('\n')}
            
            EISEN:
            - Gebruik juridisch correct Nederlands (Art. 7:900 BW).
            - Formuleer heldere, genummerde artikelen.
            - Zorg voor een artikel over finale kwijting.
            - Geef ENKEL de artikelen terug.`
          }]
        }],
        config: {
          temperature: 0.1, // Lager voor meer consistentie in juridische teksten
        }
      });
      
      const result = response.text?.trim();
      if (!result) throw new Error("Lege respons van AI");
      return result;
    } catch (error) {
      console.error("VSO Generation Error:", error);
      throw error;
    }
  }

  async getMediatorSuggestion(context: string): Promise<string> {
    const client = this.ai;
    if (!client) return "Focus op een oplossing.";
    try {
      const response = await client.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{
          parts: [{
            text: `Geef een korte suggestie (max 15 woorden) om dit gesprek vooruit te helpen: ${context}`
          }]
        }],
      });
      return response.text?.trim() || "Vraag wat de ander nodig heeft.";
    } catch (error) {
      return "Blijf constructief.";
    }
  }
}

export const geminiService = new GeminiService();
