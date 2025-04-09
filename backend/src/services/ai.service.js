const { GoogleGenerativeAI } = require("@google/generative-ai");

class AIService {
  constructor() {
    this.ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.ai.getGenerativeModel({ model: "gemini-2.0-flash" });
  }

  async generateRecipe(ingredients, preferences) {
    const prompt = `Erstelle ein Rezept mit folgenden Zutaten: ${ingredients.join(', ')}. 
                  Berücksichtige folgende Präferenzen: ${JSON.stringify(preferences)}
                  Format: Titel, Zutaten mit Mengen, Schritte, Nährwertangaben.`;
    
    try {
      const result = await this.model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000
        }
      });
      
      return result.response.text();
    } catch (error) {
      console.error('Error generating recipe:', error);
      throw error;
    }
  }

  async provideCookingAssistance(question, recipeContext) {
    const prompt = `Im Kontext dieses Rezepts: ${recipeContext}\nMeine Frage: ${question}`;
    
    try {
      const result = await this.model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 500
        }
      });
      
      return result.response.text();
    } catch (error) {
      console.error('Error providing cooking assistance:', error);
      throw error;
    }
  }

  async translateContent(content, targetLanguage) {
    const prompt = `Übersetze den folgenden Text ins ${targetLanguage}: ${content}`;
    
    try {
      const result = await this.model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 1000
        }
      });
      
      return result.response.text();
    } catch (error) {
      console.error('Error translating content:', error);
      throw error;
    }
  }
}

module.exports = AIService; 