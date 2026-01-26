
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
    if (!client) return "Ik ben momenteel offline. Blijf respectvol met elkaar in gesprek.";
    
    const historyString = chatHistory.map(m => `${m.sender}: ${m.text}`).join('\n');
    
    try {
      const response = await client.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{
          parts: [{
            text: `Je bent de AI Mediator van 'Rsolve'. Jouw doel is om partijen te helpen een conflict over "${caseTitle}" op te lossen via een Vaststellingsovereenkomst (VSO).

STRIKTE RICHTLIJNEN:
1. ONBOARDING: Als een partij net is binnengekomen of vraagt "Wat is dit?", leg dan kort uit: Rsolve is een neutraal platform waar jullie via chat, begeleid door AI, tot een rechtsgeldige oplossing komen zonder advocaten.
2. PRIVACY: Scan de laatste berichten op BSN-nummers (9 cijfers) of specifieke woonadressen. Als je dit ziet, begin je antwoord met: "LET OP: Deel geen BSN of adresgegevens in deze chat voor jullie eigen veiligheid."
3. GEEN CLICHÉS: Gebruik NOOIT zinloze zinnen zoals "Dat is een duidelijk standpunt" als iemand een vraag stelt. Geef direct antwoord op de vraag of emotie.
4. NEUTRAAL & DOELGERICHT: Vat samen, stel open vragen en stuur aan op concrete afspraken voor de VSO.
5. KORT: Maximaal 60 woorden per bericht.

Chatgeschiedenis:
${historyString}

Mediator:`
          }]
        }],
        config: {
          temperature: 0.7, // Iets lager voor meer consistentie en minder hallucinaties
          topP: 0.8
        }
      });
      
      const text = response.text?.trim();
      if (!text) throw new Error("Lege response");
      return text;
    } catch (error) {
      console.error("Mediator error:", error);
      const fallbacks = [
        "Ik ben er om jullie te helpen dit conflict op te lossen. Wat is voor jou op dit moment de belangrijkste volgende stap?",
        "Laten we kijken naar de feiten van dit dossier. Welke oplossing zou voor beide partijen werkbaar zijn?",
        "Mijn excuses, ik had een tijdelijke storing. Laten we verder gaan met het bespreken van de afspraken voor jullie VSO."
      ];
      return fallbacks[Math.floor(Math.random() * fallbacks.length)];
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
