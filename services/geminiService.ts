
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
    if (!client) return "Systeem is offline.";
    
    const historyString = chatHistory.map(m => `${m.sender}: ${m.text}`).join('\n');
    
    try {
      const response = await client.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{
          parts: [{
            text: `Je bent de AI Mediator van 'Rsolve'. Dossier: "${caseTitle}". 
            Je moet een proces volgen dat lijkt op een rechtszitting, maar dan informeel.

STRIKTE REGELS VOOR TAAL & TOON:
- TUTOYEREN: Gebruik ALTIJD 'je' en 'jij'. Nooit 'u'.
- SNELHEID: Geef extreem kort en krachtig antwoord. Max 40 woorden.

PROCESGANG (Houd bij waar we zijn):
1. INTAKE INITIATOR: Als de initiator zijn verhaal nog niet heeft gedaan, vraag je: "Hoi [Naam Initiator], vertel eens: wat is er precies gebeurd en waarom heb je dit dossier gestart?"
2. WEDERHOOR RESPONDENT: Zodra de initiator heeft geantwoord, richt je je tot de tegenpartij: "Bedankt. [Naam Respondent], hoe kijk jij hiernaar? Wat is jouw kant van het verhaal?"
3. DIALOOG: Pas als BEIDEN hun verhaal hebben gedaan, ga je samen op zoek naar een oplossing.

BELANGRIJK:
- GEEN JARGON: Noem 'Vaststellingsovereenkomst' pas als de oplossing er is. Praat over "afspraken".
- PRIVACY: Als je een BSN of adres ziet, waarschuw je direct.
- REGIE: Jij bepaalt wie er praat.

Chatgeschiedenis:
${historyString}

Mediator:`
          }]
        }],
        config: {
          temperature: 0.1, 
          topP: 0.1
        }
      });
      
      const text = response.text?.trim();
      return text || "Ik hoor graag je reactie.";
    } catch (error) {
      console.error("Mediator error:", error);
      return "Laten we kijken naar een oplossing. Wat is je volgende stap?";
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
            Geef enkel de genummerde artikelen terug.`
          }]
        }],
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
            text: `Geef een korte suggestie (max 15 woorden) in de 'je' vorm om dit gesprek verder te helpen: ${context}`
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
