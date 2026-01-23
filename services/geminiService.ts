
import { GoogleGenAI } from "@google/genai";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async translateText(text: string, targetLanguage: string = 'Nederlands'): Promise<string> {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Vertaal de volgende tekst naar het ${targetLanguage}. Houd de toon professioneel maar begrijpelijk voor particulieren. Geef ENKEL de vertaling terug.\n\nTekst: "${text}"`,
      });
      return response.text?.trim() || "Vertaling niet beschikbaar";
    } catch (error) {
      console.error("Translation error:", error);
      return "Fout: Kon niet vertalen.";
    }
  }

  async getMediatorSuggestion(caseContext: string): Promise<string> {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Je bent een expert mediator voor Rsolve. Help particulieren (buren, ex-partners, huurders/verhuurders) om een conflict op te lossen. Geef één kort, actiegericht advies in het Nederlands om tot een Vaststellingsovereenkomst (VSO) te komen. Maximaal 40 woorden.\n\nContext: ${caseContext}`,
      });
      return response.text || "Blijf respectvol communiceren en focus op een gezamenlijke oplossing.";
    } catch (error) {
      return "Focus op het vinden van een win-win oplossing.";
    }
  }
}

export const geminiService = new GeminiService();
