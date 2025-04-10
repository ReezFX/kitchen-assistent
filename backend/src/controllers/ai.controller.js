const AIService = require('../services/ai.service');
const CacheService = require('../services/cache.service');
const Recipe = require('../models/recipe.model');

// Initialize services
const aiService = new AIService();
const cacheService = new CacheService();

exports.generateRecipe = async (req, res) => {
  try {
    const { ingredients, preferences, systemPrompt } = req.body;
    
    // Input validation
    if (!ingredients || ingredients.length === 0) {
      return res.status(400).json({ message: 'Zutaten erforderlich' });
    }
    
    // Create a cache key based on the request
    const cacheKey = `recipe:${ingredients.sort().join(',')}:${JSON.stringify(preferences)}:${systemPrompt ? 'custom' : 'default'}`;
    
    // Use cached AI request
    const recipeText = await cacheService.cachedAIRequest(cacheKey, () => {
      return aiService.generateRecipe(ingredients, preferences, systemPrompt);
    });
    
    // Parse the recipe (simple version for now)
    // In a real implementation, you'd parse the AI response into structured data
    const recipe = {
      text: recipeText,
      ingredients,
      preferences,
      isAIGenerated: true
    };
    
    res.json({ recipe });
  } catch (error) {
    console.error('Fehler bei der Rezeptgenerierung:', error);
    res.status(500).json({ message: 'Interner Serverfehler' });
  }
};

exports.getAssistance = async (req, res) => {
  try {
    const { question, recipeContext } = req.body;
    
    // Input validation
    if (!question) {
      return res.status(400).json({ message: 'Frage erforderlich' });
    }
    
    // Create a cache key based on the request
    const cacheKey = `assistance:${question}:${recipeContext ? recipeContext.substring(0, 50) : ''}`;
    
    // Use cached AI request
    const assistance = await cacheService.cachedAIRequest(cacheKey, () => {
      return aiService.provideCookingAssistance(question, recipeContext || '');
    });
    
    res.json({ assistance });
  } catch (error) {
    console.error('Fehler beim Kochassistenten:', error);
    res.status(500).json({ message: 'Interner Serverfehler' });
  }
};

exports.translateContent = async (req, res) => {
  try {
    const { content, targetLanguage } = req.body;
    
    // Input validation
    if (!content || !targetLanguage) {
      return res.status(400).json({ message: 'Inhalt und Zielsprache erforderlich' });
    }
    
    // Create a cache key based on the request
    const cacheKey = `translate:${content.substring(0, 50)}:${targetLanguage}`;
    
    // Use cached AI request
    const translatedContent = await cacheService.cachedAIRequest(cacheKey, () => {
      return aiService.translateContent(content, targetLanguage);
    });
    
    res.json({ translatedContent });
  } catch (error) {
    console.error('Fehler bei der Übersetzung:', error);
    res.status(500).json({ message: 'Interner Serverfehler' });
  }
}; 