import { useState, useEffect, useCallback } from 'react';
import recipeService from '../../core/api/recipeService';

export const useRecipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [currentRecipe, setCurrentRecipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all recipes
  const fetchRecipes = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await recipeService.getRecipes();
      setRecipes(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Fehler beim Laden der Rezepte');
      console.error('Error fetching recipes:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch recipes on mount
  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  // Get a recipe by ID
  const getRecipeById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await recipeService.getRecipeById(id);
      setCurrentRecipe(data);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Fehler beim Laden des Rezepts');
      console.error('Error fetching recipe:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new recipe
  const createRecipe = async (recipeData) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await recipeService.createRecipe(recipeData);
      setRecipes([data, ...recipes]);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Fehler beim Erstellen des Rezepts');
      console.error('Error creating recipe:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update a recipe
  const updateRecipe = useCallback(async (id, recipeData) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await recipeService.updateRecipe(id, recipeData);
      setRecipes(recipes.map(recipe => recipe._id === id ? data : recipe));
      
      if (currentRecipe && currentRecipe._id === id) {
        setCurrentRecipe(data);
      }
      
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Fehler beim Aktualisieren des Rezepts');
      console.error('Error updating recipe:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [recipes, currentRecipe]);

  // Delete a recipe
  const deleteRecipe = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      await recipeService.deleteRecipe(id);
      setRecipes(recipes.filter(recipe => recipe._id !== id));
      
      if (currentRecipe && currentRecipe._id === id) {
        setCurrentRecipe(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Fehler beim Löschen des Rezepts');
      console.error('Error deleting recipe:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [recipes, currentRecipe]);

  return {
    recipes,
    currentRecipe,
    loading,
    error,
    fetchRecipes,
    getRecipeById,
    createRecipe,
    updateRecipe,
    deleteRecipe
  };
}; 