
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
        model: 'gemini-3-flash-preview',
        contents: [{
          parts: [{
            text: `Je bent de AI Mediator van 'Rsolve'. Dossier: "${caseTitle}". 
            Je leidt een gestructureerd proces naar een oplossing.

STRIKTE GEDRAGSREGELS:
1. HERKEN CONSENSUS: Als partijen zeggen "prima", "akkoord", "is goed", of een concreet voorstel accepteren, reageer dan enthousiast en vat de afspraak kort samen. 
2. INTRODUCEER VSO: Zodra er een akkoord is, zeg je: "Mooi dat jullie eruit zijn! Zal ik deze afspraken nu officieel vastleggen in een document? Dat noemen we een Vaststellingsovereenkomst (VSO). Daarmee is de zaak juridisch afgehandeld."
3. PROCESFASE:
   - Intake: Vraag de initiator om zijn verhaal (als dat er nog niet is).
   - Wederhoor: Vraag de tegenpartij om zijn kant (na de intake).
   - Dialoog: Help ze bij het onderhandelen over bedragen of tijden.
4. TOON: Tutoyeer altijd (jij/je). Wees empathisch maar zakelijk. 
5. KORT: Maximaal 45 woorden. Geen herhaling van clichés.

Chatgeschiedenis:
${historyString}

Mediator:`
          }]
        }],
        config: {
          temperature: 0.4, 
          topP: 0.8
        }
      });
      
      const text = response.text?.trim();
      return text || "Ik heb je begrepen. Wat vind jij van dit voorstel?";
    } catch (error) {
      console.error("Mediator error:", error);
      return "Ik hoor dat jullie stappen zetten richting een oplossing. Hoe kunnen we dit nu concreet maken?";
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
