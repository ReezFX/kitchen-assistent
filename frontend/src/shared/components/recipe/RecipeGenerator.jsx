import React, { useState } from 'react';
import styled from 'styled-components';
import { useAIService } from '../../hooks/useAIService';
import { useRecipes } from '../../hooks/useRecipes';
import { useAuth } from '../../hooks/useAuth';

import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import IngredientSelector from './IngredientSelector';

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const PreferencesContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Loading = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  font-weight: 500;
  color: #4f46e5;
`;

const Error = styled.div`
  color: #ef4444;
  padding: 10px;
  border-radius: 8px;
  background-color: #fee2e2;
  margin-bottom: 16px;
`;

const RecipeDisplay = styled.div`
  margin-top: 24px;
  padding: 20px;
  background-color: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
`;

const RecipeTitle = styled.h3`
  font-size: 22px;
  color: #1f2937;
  margin-bottom: 16px;
`;

const RecipeContent = styled.div`
  white-space: pre-wrap;
  line-height: 1.6;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 20px;
`;

const SuccessMessage = styled.div`
  color: #10b981;
  padding: 10px;
  border-radius: 8px;
  background-color: #ecfdf5;
  margin-bottom: 16px;
`;

const RecipeGenerator = () => {
  const [ingredients, setIngredients] = useState([]);
  const [preferences, setPreferences] = useState({
    diet: '',
    cuisine: '',
    difficulty: 'medium'
  });
  const [recipe, setRecipe] = useState(null);
  const [success, setSuccess] = useState('');
  
  const { generateRecipe, isLoading, error } = useAIService();
  const { createRecipe, loading: saveLoading } = useRecipes();
  const { isAuthenticated } = useAuth();

  const handlePreferenceChange = (e) => {
    const { name, value } = e.target;
    setPreferences({
      ...preferences,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (ingredients.length === 0) return;
    setSuccess('');
    
    try {
      const generatedRecipe = await generateRecipe(ingredients, preferences);
      setRecipe(generatedRecipe);
    } catch (error) {
      console.error('Fehler bei der Rezeptgenerierung:', error);
    }
  };

  const handleSaveRecipe = async () => {
    if (!recipe) return;
    setSuccess('');
    
    try {
      // Parse title from recipe text (simple approach, could be improved)
      const lines = recipe.text.split('\n');
      const title = lines[0].trim();
      
      // Create a structured recipe object
      const recipeData = {
        title,
        ingredients: ingredients.map(ing => ({ name: ing, amount: '', unit: '' })),
        steps: [],
        cuisine: preferences.cuisine || undefined,
        dietaryRestrictions: preferences.diet ? [preferences.diet] : [],
        difficulty: preferences.difficulty,
        isAIGenerated: true
      };
      
      await createRecipe(recipeData);
      setSuccess('Rezept erfolgreich gespeichert!');
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (error) {
      console.error('Fehler beim Speichern des Rezepts:', error);
    }
  };

  return (
    <Card title="Personalisiertes Rezept erstellen">
      <Form onSubmit={handleSubmit}>
        {error && <Error>{error}</Error>}
        {success && <SuccessMessage>{success}</SuccessMessage>}
        
        <div>
          <h4>Verfügbare Zutaten auswählen</h4>
          <IngredientSelector 
            selectedIngredients={ingredients} 
            onChange={setIngredients}
          />
        </div>
        
        <div>
          <h4>Präferenzen</h4>
          <PreferencesContainer>
            <Input
              label="Ernährungsform"
              name="diet"
              placeholder="z.B. Vegetarisch, Vegan, Keto"
              value={preferences.diet}
              onChange={handlePreferenceChange}
            />
            <Input
              label="Küchenstil"
              name="cuisine"
              placeholder="z.B. Italienisch, Asiatisch, Deutsch"
              value={preferences.cuisine}
              onChange={handlePreferenceChange}
            />
          </PreferencesContainer>
          
          <div>
            <label>Schwierigkeitsgrad</label>
            <select 
              name="difficulty"
              value={preferences.difficulty}
              onChange={handlePreferenceChange}
            >
              <option value="easy">Einfach</option>
              <option value="medium">Mittel</option>
              <option value="hard">Anspruchsvoll</option>
            </select>
          </div>
        </div>
        
        <Button 
          type="submit" 
          disabled={ingredients.length === 0 || isLoading}
          fullWidth
        >
          {isLoading ? 'Rezept wird erstellt...' : 'Rezept erstellen'}
        </Button>
      </Form>
      
      {isLoading && <Loading>Rezept wird generiert...</Loading>}
      
      {recipe && !isLoading && (
        <RecipeDisplay>
          <RecipeTitle>Dein Rezept</RecipeTitle>
          <RecipeContent>{recipe.text}</RecipeContent>
          
          {isAuthenticated && (
            <ButtonGroup>
              <Button 
                onClick={handleSaveRecipe}
                disabled={saveLoading}
              >
                {saveLoading ? 'Speichern...' : 'Rezept speichern'}
              </Button>
            </ButtonGroup>
          )}
        </RecipeDisplay>
      )}
    </Card>
  );
};

export default RecipeGenerator; 