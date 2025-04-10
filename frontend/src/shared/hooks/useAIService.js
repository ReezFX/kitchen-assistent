import { useState } from 'react';
import aiService from '../../core/ai/aiService';

export const useAIService = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateRecipe = async (ingredients, preferences, systemPrompt) => {
    setIsLoading(true);
    setError(null);
    try {
      const recipe = await aiService.generateRecipe(ingredients, preferences, systemPrompt);
      setIsLoading(false);
      return recipe;
    } catch (err) {
      setError(err.response?.data?.message || 'Fehler bei der Rezeptgenerierung');
      setIsLoading(false);
      throw err;
    }
  };

  const getAssistance = async (question, recipeContext) => {
    setIsLoading(true);
    setError(null);
    try {
      const assistance = await aiService.getAssistance(question, recipeContext);
      setIsLoading(false);
      return assistance;
    } catch (err) {
      setError(err.response?.data?.message || 'Fehler beim Kochassistenten');
      setIsLoading(false);
      throw err;
    }
  };

  const translateContent = async (content, targetLanguage) => {
    setIsLoading(true);
    setError(null);
    try {
      const translatedContent = await aiService.translateContent(content, targetLanguage);
      setIsLoading(false);
      return translatedContent;
    } catch (err) {
      setError(err.response?.data?.message || 'Fehler bei der Übersetzung');
      setIsLoading(false);
      throw err;
    }
  };

  return {
    generateRecipe,
    getAssistance,
    translateContent,
    isLoading,
    error
  };
}; 