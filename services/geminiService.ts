
import { GoogleGenAI } from "@google/genai";

export class GeminiService {
  private ai: GoogleGenAI | null = null;

  constructor() {
    const apiKey = process.env.API_KEY;
    if (apiKey) {
      this.ai = new GoogleGenAI({ apiKey });
    } else {
      console.warn("Gemini API Key ontbreekt. AI functionaliteit is uitgeschakeld.");
    }
  }

  async translateText(text: string, targetLanguage: string = 'Nederlands'): Promise<string> {
    if (!this.ai) return text;
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Vertaal de volgende tekst naar het ${targetLanguage}. Houd de toon professioneel maar begrijpelijk voor particulieren. Geef ENKEL de vertaling terug.\n\nTekst: "${text}"`,
      });
      return response.text?.trim() || "Vertaling niet beschikbaar";
    } catch (error) {
      console.error("Translation error:", error);
      return text;
    }
  }

  async getMediatorSuggestion(caseContext: string): Promise<string> {
    if (!this.ai) return "Focus op een gezamenlijke oplossing.";
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Je bent een expert mediator voor Rsolve. Help particulieren om een conflict op te lossen. Geef één kort, actiegericht advies in het Nederlands. Maximaal 30 woorden.\n\nContext: ${caseContext}`,
      });
      return response.text || "Blijf respectvol communiceren.";
    } catch (error) {
      return "Focus op een win-win oplossing.";
    }
  }
}

export const geminiService = new GeminiService();
