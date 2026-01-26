
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
            
STRIKTE INSTRUCTIES VOOR DE FINALE FASE:
1. HERKEN AKKOORD: Als partijen 'ja', 'akkoord', 'prima' zeggen op een concreet voorstel, OF als jij zojuist hebt gezegd dat je de VSO gaat maken:
   - STOP met het stellen van vragen als "Wat vind je ervan?".
   - VAT de afspraak kort samen (bijv. "Helder: aanstaande donderdag de overdracht van de stereo voor 200 euro").
   - VOEG ALTIJD de tekst "[ACTION:GENERATE_VSO]" toe aan het einde van je bericht.
2. VERMIJD FALLBACKS: Geef nooit een antwoord als "Ik heb je begrepen. Wat is je volgende stap?" als er al een akkoord is of als de sfeer positief is naar een oplossing.
3. TOON: Tutoyeer altijd (jij/je). Blijf resultaatgericht.
4. LENGTE: Maximaal 40 woorden.

Chatgeschiedenis:
${historyString}

Mediator:`
          }]
        }],
        config: {
          temperature: 0.2, // Lager voor meer consistentie
          topP: 0.5
        }
      });
      
      const text = response.text?.trim();
      return text || "Ik help jullie graag verder. Laten we de afspraak nu concreet maken.";
    } catch (error) {
      console.error("Mediator error:", error);
      return "Ik zie dat jullie er bijna uit zijn. Zullen we de afspraak nu definitief vastleggen?";
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
