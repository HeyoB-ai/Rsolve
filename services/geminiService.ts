
import { GoogleGenAI, Type } from "@google/genai";

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
            text: `Vertaal de volgende tekst naar het ${targetLanguage}. Houd de toon hetzelfde als het origineel. Geef ENKEL de vertaling terug.\n\nTekst: "${text}"` 
          }] 
        }],
      });
      return response.text?.trim() || text;
    } catch (error) {
      return text;
    }
  }

  async generateMediatorResponse(chatHistory: {sender: string, text: string}[], caseTitle: string): Promise<string> {
    const client = this.ai;
    if (!client) return "Ik ben even de verbinding kwijt. Blijf constructief.";
    
    const historyString = chatHistory.map(m => `${m.sender}: ${m.text}`).join('\n');
    
    try {
      const response = await client.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: [{
          parts: [{
            text: `Je bent de Senior AI Mediator van 'Rsolve'. Dossier: "${caseTitle}". 
            
JOUW OPDRACHT:
Help deze mensen hun conflict op te lossen. Je bent intelligenter, empathischer en scherper dan een standaard chatbot.

STRIKTE PRIORITEITEN:
1. COMMUNICATIECHECK: Als de laatste spreker aangeeft iets niet te begrijpen of een andere taal spreekt, dan is jouw ENIGE taak om die barrière te doorbreken. Vertaal de essentie van het laatste voorstel/bericht naar de taal van de ontvanger.
2. ADRESSEER DE LAATSTE ZIN: Begin je antwoord ALTIJD met een directe reactie op wat er net gezegd is. Geen algemene inleidingen.
3. WEES MENSELIJK: Gebruik geen mediation-clichés. Praat als een ervaren coach. Tutoyeer (jij/je).
4. VSO LOGICA: Alleen als er een onbetwistbaar akkoord is, voeg je "[ACTION:GENERATE_VSO]" toe. Als er taalverwarring is, is een VSO verboden.
5. TAAL: Antwoord in de taal van de vrager. Bij een gemengd gesprek reageer je tweetalig (bijv. NL boven, EN onder).

Chatgeschiedenis:
${historyString}

Mediator:`
          }]
        }],
        config: {
          thinkingConfig: { thinkingBudget: 4000 },
          temperature: 0.6,
          topP: 0.8
        }
      });
      
      const text = response.text?.trim();
      return text || "Ik merk dat de communicatie stroef loopt. Zullen we even pas op de plaats maken? Waar gaat het mis?";
    } catch (error) {
      console.error("Mediator error:", error);
      return "Ik zie dat de verbinding even hapert. Laten we teruggaan naar de kern van jullie afspraak.";
    }
  }

  async generateVSOTerms(chatHistory: {sender: string, text: string}[], caseTitle: string): Promise<string> {
    const client = this.ai;
    if (!client) return "Geen afspraken kunnen genereren.";
    try {
      const response = await client.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: [{
          parts: [{
            text: `Stel een formele Vaststellingsovereenkomst (VSO) op op basis van dit mediation gesprek. 
            Onderwerp: ${caseTitle}
            Gesprek:
            ${chatHistory.map(m => `${m.sender}: ${m.text}`).join('\n')}
            Geef enkel de genummerde artikelen terug in juridisch correct Nederlands.`
          }]
        }],
        config: {
          thinkingConfig: { thinkingBudget: 8000 }
        }
      });
      return response.text?.trim() || "Kon geen VSO opstellen.";
    } catch (error) {
      return "Er is een probleem bij het opstellen van het document.";
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
            text: `Geef een korte suggestie (max 15 words) in the user's language to help move this conversation forward: ${context}`
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
