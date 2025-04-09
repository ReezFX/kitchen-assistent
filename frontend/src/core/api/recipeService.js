import api from './api';

const recipeService = {
  // Get all recipes for the authenticated user
  getRecipes: async () => {
    try {
      const { data } = await api.get('/recipes');
      return data;
    } catch (error) {
      console.error('Error fetching recipes:', error);
      throw error;
    }
  },

  // Get a single recipe by ID
  getRecipeById: async (id) => {
    try {
      // Mit zusätzlichen Optionen für diese spezifische Anfrage
      const config = {
        timeout: 45000, // 45 Sekunden für diese spezifische Anfrage
      };
      const { data } = await api.get(`/recipes/${id}`, config);
      return data;
    } catch (error) {
      console.error(`Error fetching recipe with ID ${id}:`, error);
      // Spezifischeres Fehlerhandling
      if (error.code === 'ECONNABORTED') {
        throw new Error('Die Anfrage hat zu lange gedauert. Bitte versuchen Sie es später erneut.');
      } else if (error.response) {
        // Server hat mit einem Fehlercode geantwortet
        const errorMsg = error.response.data?.message || `Fehler (${error.response.status}): Rezept konnte nicht geladen werden.`;
        throw new Error(errorMsg);
      } else if (error.request) {
        // Die Anfrage wurde gestellt, aber keine Antwort erhalten
        throw new Error('Server nicht erreichbar. Bitte überprüfen Sie Ihre Internetverbindung.');
      }
      throw error;
    }
  },

  // Create a new recipe
  createRecipe: async (recipeData) => {
    try {
      const { data } = await api.post('/recipes', recipeData);
      return data;
    } catch (error) {
      console.error('Error creating recipe:', error);
      throw error;
    }
  },

  // Update an existing recipe
  updateRecipe: async (id, recipeData) => {
    try {
      const { data } = await api.put(`/recipes/${id}`, recipeData);
      return data;
    } catch (error) {
      console.error(`Error updating recipe with ID ${id}:`, error);
      throw error;
    }
  },

  // Delete a recipe
  deleteRecipe: async (id) => {
    try {
      const { data } = await api.delete(`/recipes/${id}`);
      return data;
    } catch (error) {
      console.error(`Error deleting recipe with ID ${id}:`, error);
      throw error;
    }
  }
};

export default recipeService; 