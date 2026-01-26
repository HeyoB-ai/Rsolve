
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
            text: `Vertaal de volgende tekst naar het ${targetLanguage}. Geef ENKEL de vertaling terug.\n\nTekst: "${text}"` 
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
        model: 'gemini-3-flash-preview', // Gewijzigd naar Flash voor snelheid
        contents: [{
          parts: [{
            text: `Je bent de Senior AI Mediator van 'Rsolve'. Dossier: "${caseTitle}". 
            
JOUW OPDRACHT:
Help deze mensen hun conflict op te lossen. Reageer direct, menselijk en constructief.

REGELS:
1. Reageer ALTIJD eerst kort op de laatste zin van de gebruiker.
2. Gebruik geen mediation-clichés. Praat als een coach.
3. Bij een akkoord voeg je "[ACTION:GENERATE_VSO]" toe aan je bericht.
4. Antwoord in de taal van de vrager.

Chatgeschiedenis:
${historyString}

Mediator:`
          }]
        }],
        config: {
          // Thinking budget verwijderd voor minimale latency in chat
          temperature: 0.7,
        }
      });
      
      const text = response.text?.trim();
      return text || "Ik hoor wat je zegt. Hoe kijkt de andere partij hiernaar?";
    } catch (error) {
      console.error("Mediator error:", error);
      return "Ik zie dat de verbinding even hapert. Laten we teruggaan naar de kern van jullie afspraak.";
    }
  }

  async generateVSOTerms(chatHistory: {sender: string, text: string}[], caseTitle: string): Promise<string> {
    const client = this.ai;
    if (!client) return "Geen afspraken kunnen genereren.";
    try {
      // Voor de VSO gebruiken we wel het krachtigere Pro model omdat nauwkeurigheid hier cruciaal is
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
