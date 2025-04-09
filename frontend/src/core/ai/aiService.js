import api from '../api/api';

class AIService {
  // Generate a recipe based on ingredients and preferences
  async generateRecipe(ingredients, preferences) {
    try {
      const response = await api.post('/ai/generate-recipe', {
        ingredients,
        preferences
      });
      return response.data.recipe;
    } catch (error) {
      console.error('Error generating recipe:', error);
      throw error;
    }
  }

  // Get cooking assistance
  async getAssistance(question, recipeContext) {
    try {
      const response = await api.post('/ai/cooking-assistant', {
        question,
        recipeContext
      });
      return response.data.assistance;
    } catch (error) {
      console.error('Error getting cooking assistance:', error);
      throw error;
    }
  }

  // Translate content
  async translateContent(content, targetLanguage) {
    try {
      const response = await api.post('/ai/translate', {
        content,
        targetLanguage
      });
      return response.data.translatedContent;
    } catch (error) {
      console.error('Error translating content:', error);
      throw error;
    }
  }
}

// Erstelle eine Instanz und exportiere sie
const aiService = new AIService();
export default aiService; 