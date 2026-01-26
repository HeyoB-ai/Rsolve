
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
    if (!client) return "Systeem is momenteel offline.";
    
    const historyString = chatHistory.map(m => `${m.sender}: ${m.text}`).join('\n');
    
    try {
      const response = await client.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{
          parts: [{
            text: `Je bent de AI Mediator van 'Rsolve'. Dossier: "${caseTitle}". 
            Je moet een gestructureerd proces volgen, vergelijkbaar met een rechtszitting:

STRIKTE VOLGORDE:
1. WELKOM & UITLEG (Reeds gedaan in eerste bericht): Leg uit dat Rsolve neutraal is en helpt bij een eerlijke oplossing.
2. INTAKE INITIATOR: Als de initiator nog niet uitgebreid zijn verhaal heeft gedaan, vraag hem/haar dan: "Kunt u toelichten wat er precies is gebeurd en waarom u dit dossier bent gestart?"
3. WEDERHOOR RESPONDENT: Zodra de initiator heeft gesproken, richt je je direct tot de andere partij: "Nu we het standpunt van de initiator hebben gehoord: hoe kijkt u tegen deze situatie aan? Wat is uw kant van het verhaal?"
4. DIALOOG: Pas als beide partijen hun standpunt hebben gedeeld, start je de bemiddeling naar een oplossing.

RICHTLIJNEN:
- GEEN JARGON: Noem 'Vaststellingsovereenkomst' pas als er een oplossing is. Praat over "afspraken" of "oplossing".
- NEUTRAAL & SNEL: Geef direct antwoord. Maximaal 50 woorden.
- REGIE: Jij bepaalt wie er aan het woord is. Als iemand buiten zijn beurt spreekt, breng de focus terug.
- PRIVACY: Waarschuw bij BSN-nummers of adressen.

Chatgeschiedenis:
${historyString}

Mediator:`
          }]
        }],
        config: {
          temperature: 0.2, // Lager voor snellere, meer consistente antwoorden
          topP: 0.8
        }
      });
      
      const text = response.text?.trim();
      return text || "Ik hoor graag jullie reactie.";
    } catch (error) {
      console.error("Mediator error:", error);
      return "Laten we bij de feiten blijven. Wat is volgens u de volgende stap naar een oplossing?";
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
            text: `Geef een korte suggestie (max 20 woorden) aan de gebruiker om dit gesprek positief verder te helpen: ${context}`
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
