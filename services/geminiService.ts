
import { GoogleGenAI, Type } from "@google/genai";

export interface ChatRoleConfig {
  initiator: string;
  respondent: string;
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
    roles: ChatRoleConfig
  ): Promise<string> {
    const client = this.ai;
    if (!client) return "Verbinding verbroken.";
    
    // We formatteren de geschiedenis zeer strikt zodat de AI geen rollen verwisselt
    const formattedHistory = chatHistory.map(m => `[${m.role.toUpperCase()}] ${m.sender}: ${m.text}`).join('\n');
    
    try {
      const response = await client.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `SYSTEEM INSTRUCTIE VOOR RSOLVE AI MEDIATOR:
Dossier: "${caseTitle}"

IDENTITEITEN (STRIKT VOLGEN):
- INITIATOR (Starter): ${roles.initiator}
- RESPONDENT (Genodigde): ${roles.respondent}

JOUW DOEL:
Begeleid dit conflict naar een oplossing.

PROTOCOL VOOR AFRONDING:
1. Als er een akkoord lijkt te zijn, vat je dit samen.
2. Leg uit wat een Vaststellingsovereenkomst (VSO) is: "Dit is een officieel juridisch document dat jullie afspraken bindend vastlegt."
3. VRAAG expliciet of ze willen dat je de VSO nu opstelt.
4. Voeg PAS wanneer beide partijen akkoord zijn de code [TRIGGER:VSO] toe aan je bericht. Doe dit nooit ongevraagd.

PROTOCOL VOOR VRAGEN:
- Als de Respondent vraagt wat de bedoeling is, vraag dan aan de Initiator (${roles.initiator}) om de situatie toe te lichten.

HUIDIG GESPREK:
${formattedHistory}

Mediator:`,
        config: {
          temperature: 0.3, // Lager voor meer logische consistentie
        }
      });
      
      // Accessing .text property directly
      return response.text?.trim() || "Ik luister. Hoe kan ik helpen?";
    } catch (error) {
      return "Ik ervaar een korte storing in mijn analyse. Laten we bij de kern blijven.";
    }
  }

  async generateVSOTerms(chatHistory: {sender: string, text: string}[], caseTitle: string): Promise<string> {
    const client = this.ai;
    if (!client) throw new Error("No client");
    
    // Drafting a VSO is a complex reasoning task, using gemini-3-pro-preview per guidelines
    const response = await client.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Stel een formele Vaststellingsovereenkomst (VSO) op (Art. 7:900 BW) gebaseerd op dit mediation gesprek:
          Onderwerp: ${caseTitle}
          Gesprek:
          ${chatHistory.map(m => `${m.sender}: ${m.text}`).join('\n')}
          
          Geef ENKEL de genummerde artikelen in juridisch correct Nederlands. Geef geen inleiding of slot.`,
      config: { temperature: 0.1 }
    });
    
    // Accessing .text property directly
    return response.text?.trim() || "Kon geen VSO opstellen.";
  }
}

export const geminiService = new GeminiService();
