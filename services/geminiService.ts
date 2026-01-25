
import { GoogleGenAI, Type } from "@google/genai";

export class GeminiService {
  private get ai() {
    const apiKey = process.env.API_KEY;
    if (!apiKey) return null;
    return new GoogleGenAI({ apiKey });
  }

  // Translates text to a target language
  async translateText(text: string, targetLanguage: string = 'Nederlands'): Promise<string> {
    const client = this.ai;
    if (!client) return text;
    try {
      const response = await client.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Vertaal de volgende tekst naar het ${targetLanguage}. Houd de toon hetzelfde als het origineel. Geef ENKEL de vertaling terug, zonder extra uitleg.\n\nTekst: "${text}"`,
      });
      return response.text?.trim() || text;
    } catch (error) {
      console.error("Translation error:", error);
      return text;
    }
  }

  // Detects if text is in Dutch and identifies the language if not
  async detectNonDutch(text: string): Promise<{ isNonDutch: boolean, language: string }> {
    const client = this.ai;
    if (!client || text.length < 10) return { isNonDutch: false, language: 'Nederlands' };
    try {
      const response = await client.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analyseer of de volgende tekst in het Nederlands is. Zo niet, welke taal is het? Antwoord in JSON formaat: {"isNonDutch": boolean, "language": string}.\n\nTekst: "${text}"`,
        config: { responseMimeType: "application/json" }
      });
      const jsonStr = response.text || '{"isNonDutch": false}';
      return JSON.parse(jsonStr);
    } catch (error) {
      return { isNonDutch: false, language: 'Nederlands' };
    }
  }

  // Generates a response from the mediator for the chat flow
  async generateMediatorResponse(chatHistory: {sender: string, text: string}[], caseTitle: string): Promise<string> {
    const client = this.ai;
    if (!client) return "Ik ben momenteel offline, maar blijf vooral respectvol met elkaar in gesprek.";
    
    const historyString = chatHistory.map(m => `${m.sender}: ${m.text}`).join('\n');
    
    try {
      const response = await client.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Je bent een wereldklasse mediator voor de app Rsolve. 
        Context: Twee partijen proberen een conflict op te lossen genaamd "${caseTitle}".
        Jouw taak: Observeer het gesprek, blijf neutraal, wees empathisch en stuur aan op een concrete oplossing (VSO). 
        Regels:
        - Antwoord in de taal waarin de partijen spreken (meestal Nederlands).
        - Houd het kort en krachtig (max 60 woorden).
        - Stel verhelderende vragen of doe suggesties voor een compromis.
        - Als partijen akkoord lijken, vat de afspraken dan samen.
        
        Recent gesprek:
        ${historyString}
        
        Mediator:`,
      });
      return response.text?.trim() || "Hoe kunnen we tot een oplossing komen die voor beiden werkt?";
    } catch (error) {
      console.error("Mediator response error:", error);
      return "Laten we focussen op de feiten en wat jullie nodig hebben om dit af te sluiten.";
    }
  }

  // Nieuwe methode: Genereert de formele tekst voor de VSO
  async generateVSOTerms(chatHistory: {sender: string, text: string}[], caseTitle: string): Promise<string> {
    const client = this.ai;
    if (!client) return "Geen afspraken kunnen genereren.";
    
    const historyString = chatHistory.map(m => `${m.sender}: ${m.text}`).join('\n');
    
    try {
      const response = await client.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Analyseer het volgende chatgesprek van een mediation sessie en stel een formele Vaststellingsovereenkomst (VSO) op. 
        Formuleer de gemaakte afspraken in juridisch heldere, maar begrijpelijke taal.
        
        Titel van het geschil: ${caseTitle}
        
        Chatgeschiedenis:
        ${historyString}
        
        Geef ENKEL de genummerde afspraken terug (bijv. 1. Partij A betaalt..., 2. De goederen worden...). Gebruik geen inleiding of afsluiting.`,
      });
      return response.text?.trim() || "Partijen hebben geen duidelijke afspraken gemaakt in de chat.";
    } catch (error) {
      console.error("VSO Generation error:", error);
      return "Fout bij het genereren van de overeenkomst.";
    }
  }

  async getMediatorSuggestion(context: string): Promise<string> {
    const client = this.ai;
    if (!client) return "Focus on finding a constructive middle ground.";
    
    try {
      const response = await client.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `You are an AI Mediator assistant. Based on the conversation history below, provide a short, helpful suggestion (max 40 words) for the user to help move the dispute towards a resolution.
        
        History:
        ${context}
        
        Assistant Suggestion:`,
      });
      return response.text?.trim() || "Consider asking for specific evidence to clarify the situation.";
    } catch (error) {
      console.error("Mediator suggestion error:", error);
      return "Focus on finding an outcome that works for both sides.";
    }
  }
}

export const geminiService = new GeminiService();
