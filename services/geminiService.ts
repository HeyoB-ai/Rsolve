
import { GoogleGenAI } from "@google/genai";

export class GeminiService {
  // Use a helper to always get a fresh client instance with the latest API key
  private get ai() {
    const apiKey = process.env.API_KEY;
    if (!apiKey) return null;
    return new GoogleGenAI({ apiKey });
  }

  async translateText(text: string, targetLanguage: string = 'Nederlands'): Promise<string> {
    const client = this.ai;
    if (!client) return text;
    try {
      const response = await client.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Vertaal de volgende tekst naar het ${targetLanguage}. Houd de toon hetzelfde als het origineel. Geef ENKEL de vertaling terug, zonder extra uitleg.\n\nTekst: "${text}"`,
      });
      // response.text is a property, not a method.
      return response.text?.trim() || text;
    } catch (error) {
      console.error("Translation error:", error);
      return text;
    }
  }

  async detectNonDutch(text: string): Promise<{ isNonDutch: boolean, language: string }> {
    const client = this.ai;
    if (!client || text.length < 10) return { isNonDutch: false, language: 'Nederlands' };
    try {
      const response = await client.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analyseer of de volgende tekst in het Nederlands is. Zo niet, welke taal is het? Antwoord in JSON formaat: {"isNonDutch": boolean, "language": string}.\n\nTekst: "${text}"`,
        config: { responseMimeType: "application/json" }
      });
      // response.text is a property
      const jsonStr = response.text || '{"isNonDutch": false}';
      const result = JSON.parse(jsonStr);
      return result;
    } catch (error) {
      console.error("Detection error:", error);
      return { isNonDutch: false, language: 'Nederlands' };
    }
  }

  async getMediatorSuggestion(caseContext: string): Promise<string> {
    const client = this.ai;
    if (!client) return "Focus op een gezamenlijke oplossing.";
    try {
      const response = await client.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Je bent een expert mediator voor Rsolve. Help particulieren om een conflict op te lossen. Geef één kort, actiegericht advies in het Nederlands. Maximaal 30 woorden.\n\nContext: ${caseContext}`,
      });
      // response.text is a property
      return response.text || "Blijf respectvol communiceren.";
    } catch (error) {
      console.error("Mediator suggestion error:", error);
      return "Focus op een win-win oplossing.";
    }
  }
}

export const geminiService = new GeminiService();
