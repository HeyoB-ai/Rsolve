
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

  // Translates text to a target language
  async translateText(text: string, targetLanguage: string = 'Nederlands'): Promise<string> {
    const client = this.ai;
    if (!client) return text;
    try {
      const response = await client.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ 
          parts: [{ 
            text: `Vertaal de volgende tekst naar het ${targetLanguage}. Houd de toon hetzelfde als het origineel. Geef ENKEL de vertaling terug, zonder extra uitleg.\n\nTekst: "${text}"` 
          }] 
        }],
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
        contents: [{ 
          parts: [{ 
            text: `Analyseer of de volgende tekst in het Nederlands is. Zo niet, welke taal is het? Antwoord in JSON formaat: {"isNonDutch": boolean, "language": string}.\n\nTekst: "${text}"` 
          }] 
        }],
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
      // Gebruik gemini-3-flash-preview voor snellere interactie en minder latency issues
      const response = await client.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{
          parts: [{
            text: `Je bent een ervaren en neutrale AI mediator voor de app Rsolve. 
            Context: Het conflict gaat over "${caseTitle}".
            Jouw doel: Help partijen om tot een gezamenlijke oplossing te komen die ze kunnen vastleggen in een VSO.
            
            Richtlijnen:
            - Antwoord altijd in de taal van de gebruikers (meestal Nederlands).
            - Wees kort, empathisch en zakelijk (max 50 woorden).
            - Vat standpunten samen als dat helpt en stel gerichte vragen.
            - Focus op de toekomst en oplossingen, niet op schuldvragen.
            - Als partijen er bijna uit zijn, suggereer dan een samenvatting van de afspraken.
            
            Chatgeschiedenis:
            ${historyString}
            
            Mediator:`
          }]
        }],
      });
      
      const text = response.text?.trim();
      if (!text) throw new Error("Lege response van model");
      return text;
    } catch (error) {
      console.error("Mediator response error:", error);
      // Gevarieerde fallback om herhaling te voorkomen
      const fallbacks = [
        "Ik hoor wat je zegt. Hoe kunnen we dit ombuigen naar een oplossing waar jullie beiden achter staan?",
        "Laten we kijken naar wat er nu nodig is om een stapje dichter bij een afspraak te komen.",
        "Dat is een duidelijk standpunt. Wat zou voor de ander een acceptabel compromis kunnen zijn?",
        "Begrepen. Laten we focussen op de feiten en wat jullie nodig hebben om dit dossier positief af te sluiten."
      ];
      return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }
  }

  // Genereert de formele tekst voor de VSO
  async generateVSOTerms(chatHistory: {sender: string, text: string}[], caseTitle: string): Promise<string> {
    const client = this.ai;
    if (!client) return "Geen afspraken kunnen genereren.";
    
    const historyString = chatHistory.map(m => `${m.sender}: ${m.text}`).join('\n');
    
    try {
      // Pro model voor complexe juridische formulering
      const response = await client.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: [{
          parts: [{
            text: `Analyseer dit mediation gesprek en stel een formele Vaststellingsovereenkomst (VSO) op. 
            Formuleer de afspraken juridisch correct maar in begrijpelijke taal.
            
            Onderwerp: ${caseTitle}
            
            Gesprek:
            ${historyString}
            
            Geef ENKEL de genummerde afspraken terug. Geen inleiding of extra tekst.`
          }]
        }],
      });
      return response.text?.trim() || "Partijen hebben geen duidelijke afspraken gemaakt in de chat.";
    } catch (error) {
      console.error("VSO Generation error:", error);
      return "Er is momenteel een probleem bij het opstellen van het document. Probeer het over een moment opnieuw.";
    }
  }

  async getMediatorSuggestion(context: string): Promise<string> {
    const client = this.ai;
    if (!client) return "Focus op een constructieve oplossing.";
    
    try {
      const response = await client.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{
          parts: [{
            text: `Je bent een AI Mediator assistent. Geef op basis van onderstaand gesprek een korte suggestie (max 30 woorden) aan de gebruiker om het gesprek vlot te trekken.
            
            Gesprek:
            ${context}
            
            Suggestie:`
          }]
        }],
      });
      return response.text?.trim() || "Probeer de ander te vragen wat zij als een eerlijke oplossing zien.";
    } catch (error) {
      console.error("Mediator suggestion error:", error);
      return "Blijf focussen op een resultaat dat voor beide partijen acceptabel is.";
    }
  }
}

export const geminiService = new GeminiService();
