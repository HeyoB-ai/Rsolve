// Client-side service. Bevat GEEN Gemini-sleutel meer: alle AI-calls lopen via
// server-side Netlify Functions. De mediator-reactie in het gesprek wordt volledig
// server-side gegenereerd (door de Supabase webhook), dus die staat hier niet meer.

async function callFunction(path: string, payload: any): Promise<string> {
  const res = await fetch(`/.netlify/functions/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Function ${path} gaf status ${res.status}`);
  const data = await res.json();
  return typeof data?.result === 'string' ? data.result : '';
}

export class GeminiService {
  async getMediatorSuggestion(context: string): Promise<string> {
    try {
      const result = await callFunction('mediator-suggestion', { context });
      return result || 'Blijf luisteren naar de behoeften van de ander.';
    } catch {
      return 'Probeer de situatie vanuit het perspectief van de ander te bekijken.';
    }
  }

  async translateText(text: string, targetLanguage: string = 'Nederlands'): Promise<string> {
    try {
      const result = await callFunction('translate', { text, targetLanguage });
      return result || text;
    } catch {
      return text;
    }
  }

  async generateVSOTerms(chatHistory: { sender: string; text: string }[], caseTitle: string): Promise<string> {
    try {
      const result = await callFunction('generate-vso', { history: chatHistory, caseTitle });
      return result || 'Kon geen VSO opstellen.';
    } catch {
      return 'Kon geen VSO opstellen.';
    }
  }
}

export const geminiService = new GeminiService();
