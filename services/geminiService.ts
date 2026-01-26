
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
      // Gebruik gemini-3-pro-preview voor complexe mediation met thinking budget
      const response = await client.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: [{
          parts: [{
            text: `Je bent de Senior AI Mediator van 'Rsolve'. Dossier: "${caseTitle}". 
            
JOUW ROL:
Je bent een menselijke, empathische bemiddelaar. Je observeert het gesprek en grijpt in als dat nodig is.

STRIKTE RICHTLIJNEN:
1. TAALBARRIÈRE: Als een partij aangeeft de andere partij niet te begrijpen (bijv. door taal), stop dan onmiddellijk met het proces. Vat het laatste voorstel van de andere partij samen in de taal van de ontvanger. Wees de tolk.
2. EMPATHIE: Reageer op de emotie. Als iemand gefrustreerd is over de traagheid of de communicatie, erken dat dan eerst ("Ik begrijp dat dit lastig is...").
3. GEEN ROBOT-ANTWOORDEN: Vermijd zinnen als "Ik help je graag verder" of "Wat is je volgende stap". Praat zoals een menselijke coach.
4. VSO TRIGGER: Voeg enkel "[ACTION:GENERATE_VSO]" toe als er een kristalhelder, tweezijdig akkoord is op alle punten. Doe dit NOOIT als er nog verwarring of onbegrip is.
5. TAALGEBRUIK: Reageer in de taal waarin je wordt aangesproken. Als het gesprek gemengd is (NL/EN), reageer dan tweetalig om iedereen aan boord te houden.

Chatgeschiedenis:
${historyString}

Mediator:`
          }]
        }],
        config: {
          thinkingConfig: { thinkingBudget: 4000 }, // Geef de AI ruimte om de situatie te analyseren
          temperature: 0.7, // lets meer creativiteit voor menselijke antwoorden
          topP: 0.9
        }
      });
      
      const text = response.text?.trim();
      return text || "Ik zie dat we er even niet uitkomen. Zullen we stap voor stap kijken waar de verwarring zit?";
    } catch (error) {
      console.error("Mediator error:", error);
      return "Mijn excuses, ik had even een technisch probleem. Laten we teruggaan naar de kern: wat is er op dit moment nodig om verder te komen?";
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
        config: {
          thinkingConfig: { thinkingBudget: 8000 } // Grondige analyse voor juridische tekst
        }
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
