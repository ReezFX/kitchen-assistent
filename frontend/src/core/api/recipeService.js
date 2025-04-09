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
      const { data } = await api.get(`/recipes/${id}`);
      return data;
    } catch (error) {
      console.error(`Error fetching recipe with ID ${id}:`, error);
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