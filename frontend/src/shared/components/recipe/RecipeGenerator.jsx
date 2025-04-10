/* eslint-disable */
import React, { useState } from 'react';
import styled from 'styled-components';
import { useAIService } from '../../hooks/useAIService';
import { useRecipes } from '../../hooks/useRecipes';
import { useAuth } from '../../hooks/useAuth';
import { FaUtensils, FaClock } from 'react-icons/fa';

import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import IngredientSelector from './IngredientSelector';
import ImageUpload from '../common/ImageUpload';

// --- Base Styles inspired by Apple Design ---
const PageContainer = styled.div`
  background-color: var(--color-background-light);
  min-height: 100vh;
  padding: 20px;
`;

const ContentWrapper = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 20px;
  background-color: var(--color-background);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-radius: 16px;
  margin-top: 30px;
  margin-bottom: 30px;
`;

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
  color: var(--color-primary);
`;

const Error = styled.div`
  color: var(--color-danger);
  padding: 10px;
  border-radius: 8px;
  background-color: var(--color-danger-hover);
  margin-bottom: 16px;
`;

// Define options for dropdowns
const dietOptions = [
  { value: '', label: 'Keine Angabe' },
  { value: 'Vegetarisch', label: 'Vegetarisch' },
  { value: 'Vegan', label: 'Vegan' },
  { value: 'Glutenfrei', label: 'Glutenfrei' },
  { value: 'Laktosefrei', label: 'Laktosefrei' },
  { value: 'Keto', label: 'Keto' },
  { value: 'Low Carb', label: 'Low Carb' },
  { value: 'Pescetarisch', label: 'Pescetarisch' },
];

const cuisineOptions = [
  { value: '', label: 'Keine Angabe' },
  { value: 'Deutsch', label: 'Deutsch' },
  { value: 'Italienisch', label: 'Italienisch' },
  { value: 'Asiatisch', label: 'Asiatisch' },
  { value: 'Mexikanisch', label: 'Mexikanisch' },
  { value: 'Indisch', label: 'Indisch' },
  { value: 'Mediterran', label: 'Mediterran' },
  { value: 'Orientalisch', label: 'Orientalisch' },
  { value: 'Französisch', label: 'Französisch' },
];

// --- Recipe Display Styles ---

const RecipeDisplay = styled.div`
  margin-top: 24px;
  background-color: var(--color-background);
  border-radius: 16px;
  border: 1px solid var(--color-gray-200);
`;

const RecipeHeader = styled.header`
  margin-bottom: 40px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--color-gray-200);
`;

const HeaderTopRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
`;

const RecipeTitle = styled.h1`
  font-size: 34px;
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1.2;
  margin: 0;
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
`;

const Tag = styled.span`
  display: inline-block;
  background-color: var(--color-gray-200);
  color: var(--color-text-secondary);
  font-size: 13px;
  font-weight: 500;
  padding: 5px 12px;
  border-radius: 16px;
`;

const RecipeMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  color: var(--color-text-secondary);
  font-size: 15px;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  
  span {
    color: var(--color-text-secondary);
  }
  
  strong {
    color: var(--color-text-primary);
    font-weight: 600;
  }
`;

// --- Section Styles ---
const Section = styled.section`
  margin-bottom: 40px;
  padding: 0 20px;
`;

const SectionTitle = styled.h2`
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--color-gray-200);
`;

// --- Ingredient Styles ---
const IngredientList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
`;

const Ingredient = styled.li`
  display: flex;
  align-items: baseline;
  gap: 10px;
  padding: 12px;
  background-color: var(--color-gray-100);
  border-radius: 10px;
  font-size: 15px;
  
  strong {
    color: var(--color-text-primary);
    font-weight: 600;
    min-width: 70px;
    text-align: right;
  }
  
  span {
    color: var(--color-text-secondary);
    flex-grow: 1;
  }
`;

// --- Steps Styles ---
const StepsList = styled.ol`
  list-style: none;
  padding: 0;
  margin: 0;
  counter-reset: steps;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Step = styled.li`
  counter-increment: steps;
  display: flex;
  gap: 16px;
  background-color: var(--color-background);
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  position: relative;
  line-height: 1.6;

  &::before {
    content: counter(steps);
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 32px;
    height: 32px;
    background-color: var(--color-gray-100);
    color: var(--color-text-secondary);
    font-weight: 600;
    font-size: 16px;
    border-radius: 50%;
    flex-shrink: 0;
    margin-top: 2px;
  }

  .step-content {
    flex-grow: 1;
  }

  .step-title {
    font-weight: 600;
    font-size: 17px;
    margin-bottom: 8px;
    color: var(--color-text-primary);
  }
  
  .step-description,
  & > div:not(.step-title):not(.step-description) {
    font-size: 15px;
    color: var(--color-text-secondary);
  }
  
  ul {
    margin-top: 10px;
    margin-bottom: 0;
    padding-left: 20px;
    list-style-type: disc;
    li {
      margin-bottom: 6px;
    }
  }

  strong {
    font-weight: 600;
    color: var(--color-text-primary);
  }
`;

// --- Nutrition Styles ---
const NutritionSection = styled.div`
  background-color: var(--color-gray-100);
  border-radius: 12px;
  padding: 20px;
`;

const NutritionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
`;

const NutritionItem = styled.div`
  padding: 16px;
  background-color: var(--color-background);
  border-radius: 10px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  
  span:first-child {
    font-weight: 500;
    color: var(--color-text-secondary);
    margin-bottom: 6px;
    font-size: 14px;
  }
  
  span:last-child {
    font-size: 20px;
    font-weight: 600;
    color: var(--color-text-primary);
  }
`;

const ExtractedTitle = styled.div`
  margin-top: 10px;
  padding: 8px 12px;
  background-color: var(--color-gray-100);
  border-radius: 6px;
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-bottom: 10px;
  border-left: 3px solid var(--color-primary);
`;

const RecipeContent = styled.div`
  white-space: pre-wrap;
  line-height: 1.6;
  padding: 20px;
  
  strong {
    font-weight: 600;
  }
`;

const RecipeImageWrapper = styled.div`
  margin-bottom: 24px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  aspect-ratio: 16 / 9;
  background-color: var(--color-gray-100);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 20px;
  padding: 20px;
  border-top: 1px solid var(--color-gray-200);
`;

const SuccessMessage = styled.div`
  color: var(--color-success, #10b981);
  padding: 12px 16px;
  border-radius: 8px;
  background-color: var(--color-success-bg, #ecfdf5);
  margin-bottom: 16px;
  border: 1px solid var(--color-success-border, #a7f3d0);
  display: flex;
  align-items: center;
  font-weight: 500;
  
  &::before {
    content: '✓';
    margin-right: 8px;
    font-weight: bold;
  }
`;

const RecipeGenerator = () => {
  const [ingredients, setIngredients] = useState([]);
  const [preferences, setPreferences] = useState({
    diet: '',
    cuisine: '',
    difficulty: 'medium',
    prepTime: '',
    cookTime: '',
  });
  const [recipe, setRecipe] = useState(null);
  const [success, setSuccess] = useState('');
  const [recipeImage, setRecipeImage] = useState(null);
  const [error, setError] = useState('');
  
  const { generateRecipe, isLoading, error: aiError } = useAIService();
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
      // Create custom system prompt to guide the AI
      const systemPrompt = `
Du bist ein professioneller Koch-Assistent. Erstelle ein detailliertes Rezept basierend auf den bereitgestellten Zutaten und Präferenzen. 
Formatiere das Rezept wie folgt:

# Titel: [Rezeptname]

**Tags:** [Tag1], [Tag2], [Tag3 (inklusive der angegebenen Ernährungsform und Küchenstil)]

**Schwierigkeit:** ${preferences.difficulty || 'medium'}
**Zubereitungszeit:** ${preferences.prepTime || '15'} Minuten
**Kochzeit:** ${preferences.cookTime || '20'} Minuten

## Beschreibung
[2-3 Sätze, die das Gericht beschreiben]

## Zutaten
- [Menge] [Einheit] [Zutat 1]
- [Menge] [Einheit] [Zutat 2]
...

## Zubereitung
1. [Erster Schritt mit detaillierter Anleitung]
2. [Zweiter Schritt mit detaillierter Anleitung]
...

## Nährwerte (pro Portion)
- Kalorien: [Wert] kcal
- Protein: [Wert] g
- Kohlenhydrate: [Wert] g
- Fett: [Wert] g

## Tipps
- [Tipp 1]
- [Tipp 2]

Verwende klare, umsetzbare Anweisungen. Jeder Schritt sollte ausführlich erklärt werden, bei Bedarf mit Temperaturangaben und Zeitangaben. Achte darauf, dass alle angegebenen Zutaten im Rezept verwendet werden.`;

      const generatedRecipe = await generateRecipe(ingredients, preferences, systemPrompt);
      setRecipe(generatedRecipe);
    } catch (error) {
      console.error('Fehler bei der Rezeptgenerierung:', error);
    }
  };

  const handleImageChange = (file) => {
    setRecipeImage(file);
  };

  const handleSaveRecipe = async () => {
    if (!recipe) return;
    setSuccess('');
    
    try {
      // Parse and extract recipe components from the AI-generated text
      const recipeData = parseRecipeText(recipe.text);
      
      // Process image separately if available
      if (recipeImage) {
        try {
          const reader = new FileReader();
          
          const readImagePromise = new Promise((resolve, reject) => {
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = () => reject(new Error('Fehler beim Lesen der Bilddatei.'));
            reader.readAsDataURL(recipeImage);
          });
          
          const base64data = await readImagePromise;
          const contentType = recipeImage.type;
          
          // Remove the data:image/jpeg;base64, part
          const base64Image = base64data.split(',')[1];
          
          // Add image to recipe data
          recipeData.image = {
            data: base64Image,
            contentType
          };
        } catch (imgErr) {
          console.error('Fehler bei der Bildverarbeitung:', imgErr);
          // Continue without image if there's an error processing it
        }
      }
      
      const savedRecipe = await createRecipe(recipeData);
      setRecipeImage(null);
      setSuccess('Rezept erfolgreich gespeichert!');
      
      // Hide success message after 5 seconds
      setTimeout(() => {
        setSuccess('');
      }, 5000);
    } catch (error) {
      console.error('Fehler beim Speichern des Rezepts:', error);
      if (error.response && error.response.status === 413) {
        setError('Das Bild ist zu groß für den Upload. Bitte verwenden Sie ein kleineres Bild.');
        } else {
        setError(error.response?.data?.message || 'Fehler beim Speichern des Rezepts.');
      }
    }
  };

  // Parse the AI-generated recipe text into structured data based on the new markdown format
  const parseRecipeText = (text) => {
    const recipeData = {
      isAIGenerated: true,
      title: '',
      emoji: '',
      tags: [],
      difficulty: 'medium',
      prepTime: null,
      cookTime: null,
      description: '',
      ingredients: [],
      steps: [],
      nutrition: {},
      tips: [],
    };

    // Helper function for robust section extraction
    const extractSection = (heading) => {
      // Find the start of the heading line
      const headingRegex = new RegExp(`^## ${heading}[^\n]*`, 'm');
      const headingMatch = text.match(headingRegex);
      
      if (!headingMatch) return '';
      
      // Find the index immediately after the heading line
      const startIndex = headingMatch.index + headingMatch[0].length + 1; // +1 for the newline
      
      // Find the index of the next heading (## or #) or end of string
      const nextHeadingRegex = /^#{1,2}\s/gm; // Match next # or ## at start of a line
      nextHeadingRegex.lastIndex = startIndex; // Start searching after the current heading
      const nextMatch = nextHeadingRegex.exec(text);
      
      // Determine the end index
      const endIndex = nextMatch ? nextMatch.index : text.length;
      
      // Extract the content between the indices
      return text.substring(startIndex, endIndex).trim();
    };

    // Extract title
    const titleMatch = text.match(/^# Titel:\s*(.+)$/m);
    recipeData.title = titleMatch ? titleMatch[1].trim() : "Generiertes Rezept";

    // Extract emoji
    const emojiMatch = text.match(/^\*\*Emoji:\*\*\s*(.+)$/m);
    recipeData.emoji = emojiMatch ? emojiMatch[1].trim() : '';

    // Extract tags
    const tagsMatch = text.match(/^\*\*Tags:\*\*\s*(.+)$/m);
    recipeData.tags = tagsMatch ? tagsMatch[1].split(',').map(tag => tag.trim()) : [];

    // Extract difficulty
    const difficultyMatch = text.match(/^\*\*Schwierigkeit:\*\*\s*(easy|medium|hard)$/im);
    recipeData.difficulty = difficultyMatch ? difficultyMatch[1].toLowerCase() : 'medium';

    // Extract prepTime
    const prepTimeMatch = text.match(/^\*\*Zubereitungszeit:\*\*\s*(\d+)\s*Minuten$/im);
    recipeData.prepTime = prepTimeMatch ? parseInt(prepTimeMatch[1], 10) : null;

    // Extract cookTime
    const cookTimeMatch = text.match(/^\*\*Kochzeit:\*\*\s*(\d+)\s*Minuten$/im);
    recipeData.cookTime = cookTimeMatch ? parseInt(cookTimeMatch[1], 10) : null;

    // Extract sections using the helper function
    recipeData.description = extractSection('Beschreibung');
    const ingredientsText = extractSection('Zutaten');
    const stepsText = extractSection('Zubereitung');
    const tipsText = extractSection('Tipps');
    const nutritionTextRaw = extractSection('Nährwerte'); // Extract nutrition block too

    // Extract ingredients from its section text
    if (ingredientsText) {
      const ingredientLines = ingredientsText.split('\n').filter(line => line.trim().startsWith('-'));
      ingredientLines.forEach(line => {
        const ingredientText = line.replace(/^-\s*/, '').trim();
        // Updated regex to better capture various units and amounts
        const match = ingredientText.match(/^(?:([\d.,]+)\s*)?(?:(EL|TL|ml|g|kg|l|Stück|Prise|Dose|Packung|Tasse[n]?|[a-zA-ZäöüÄÖÜß]+)\s+)?(.+)$/i);
        if (match) {
          const [, amount, unit, name] = match;
          recipeData.ingredients.push({
            amount: amount ? amount.replace(',', '.') : '', // Normalize comma to dot if needed
            unit: unit || '',
            name: name.trim()
          });
        } else {
          recipeData.ingredients.push({ amount: '', unit: '', name: ingredientText });
        }
      });
    }

    // Extract steps from its section text
    if (stepsText) {
      recipeData.steps = stepsText.split('\n')
        .filter(line => /^(\d+)\.\s/.test(line.trim()))
        .map(line => line.replace(/^(\d+)\.\s*/, '').trim());
    }

    // Extract nutrition data from its raw block
    if (nutritionTextRaw) {
      // Adjusted regex to capture digits after skipping non-digit characters
      const caloriesMatch = nutritionTextRaw.match(/-\s*Kalorien:[^\d]*(\d+)/i);
      if (caloriesMatch) recipeData.nutrition.calories = caloriesMatch[1];
      const proteinMatch = nutritionTextRaw.match(/-\s*(?:Protein|Eiweiß):[^\d]*(\d+)/i);
      if (proteinMatch) recipeData.nutrition.protein = proteinMatch[1];
      const carbsMatch = nutritionTextRaw.match(/-\s*Kohlenhydrate:[^\d]*(\d+)/i);
      if (carbsMatch) recipeData.nutrition.carbs = carbsMatch[1];
      const fatMatch = nutritionTextRaw.match(/-\s*Fett:[^\d]*(\d+)/i);
      if (fatMatch) recipeData.nutrition.fat = fatMatch[1];
    }

    // Extract tips from its section text
    if (tipsText) {
      recipeData.tips = tipsText.split('\n')
        .filter(line => line.trim().startsWith('-'))
        .map(line => line.replace(/^-\s*/, '').trim());
    }

    // Add other preference data that might not be explicitly in the text
    recipeData.preferences = { ...preferences }; // Store original preferences
    if (!recipeData.tags.includes(preferences.diet) && preferences.diet) recipeData.tags.push(preferences.diet);
    if (!recipeData.tags.includes(preferences.cuisine) && preferences.cuisine) recipeData.tags.push(preferences.cuisine);

    return recipeData;
  };

  // Function to format recipe text with proper HTML for preview
  const formatRecipeText = (text) => {
    if (!text) return '';
    
    // Convert markdown headings to HTML
    let formattedText = text.replace(/^# (.+)$/gm, '<h1>$1</h1>');
    formattedText = formattedText.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    
    // Format bold text
    formattedText = formattedText.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    
    // Convert markdown lists to HTML lists
    const lines = formattedText.split('\n');
    let inList = false;
    let resultLines = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();
      
      if (trimmedLine.startsWith('-')) {
        if (!inList) {
          inList = true;
          resultLines.push('<ul style="list-style-type: disc; padding-left: 20px; margin: 8px 0;">');
        }
        // Extract text after the dash and add to list
        const listItemText = trimmedLine.substring(1).trim();
        resultLines.push(`<li style="margin-bottom: 4px;">${listItemText}</li>`);
      } else if (trimmedLine.match(/^\d+\./)) {
        if (inList) {
          // End previous unordered list if exists
          inList = false;
          resultLines.push('</ul>');
        }
        
        // For numbered lists, we'll just style them inline
        const numberMatch = trimmedLine.match(/^(\d+)\.\s*(.+)$/);
        if (numberMatch) {
          const [, number, content] = numberMatch;
          resultLines.push(`<div style="display: flex; margin-bottom: 8px;">
            <div style="min-width: 24px; font-weight: bold; margin-right: 8px;">${number}.</div>
            <div>${content}</div>
          </div>`);
        } else {
          resultLines.push(line);
        }
      } else {
        if (inList) {
          // End current list
          inList = false;
          resultLines.push('</ul>');
        }
        resultLines.push(line);
      }
    }
    
    // If we had a list at the end of text, close it
    if (inList) {
      resultLines.push('</ul>');
    }
    
    return resultLines.join('\n');
  };

  // Function to prepare recipe data for preview
  const prepareRecipePreview = () => {
    if (!recipe) return null;
    
    return parseRecipeText(recipe.text); // Use the parsed data directly
  };

  const recipePreview = recipe ? prepareRecipePreview() : null;
  const getDifficultyText = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'Einfach';
      case 'medium': return 'Mittel';
      case 'hard': return 'Anspruchsvoll';
      default: return 'Mittel';
    }
  };

  const formatStepText = (text) => {
    if (!text) return '';
    const hasHeadline = /^([^:]+:)(.+)/.exec(text);
    if (hasHeadline) {
      const [, title, description] = hasHeadline;
      return `<div class="step-title">${title.trim()}</div><div class="step-description">${description.trim()}</div>`;
    }
    return `<div>${text}</div>`;
  };

  return (
    <PageContainer>
      <ContentWrapper>
        <Card title="Personalisiertes Rezept erstellen">
          <Form onSubmit={handleSubmit}>
            {error && <Error>{error}</Error>}
            {aiError && <Error>{aiError}</Error>}
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
                <div>
                  <label htmlFor="diet-select">Ernährungsform</label>
                  <select 
                    id="diet-select"
                    name="diet"
                    value={preferences.diet}
                    onChange={handlePreferenceChange}
                  >
                    {dietOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="cuisine-select">Küchenstil</label>
                  <select 
                    id="cuisine-select"
                    name="cuisine"
                    value={preferences.cuisine}
                    onChange={handlePreferenceChange}
                  >
                    {cuisineOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </PreferencesContainer>
              
              <PreferencesContainer style={{ marginTop: '16px' }}>
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
                <PreferencesContainer>
                  <Input
                    label="Vorbereitungszeit (Min.)"
                    name="prepTime"
                    type="number"
                    placeholder="15"
                    value={preferences.prepTime}
                    onChange={handlePreferenceChange}
                  />
                  <Input
                    label="Kochzeit (Min.)"
                    name="cookTime"
                    type="number"
                    placeholder="20"
                    value={preferences.cookTime}
                    onChange={handlePreferenceChange}
                  />
                </PreferencesContainer>
              </PreferencesContainer>
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
          
          {recipePreview && !isLoading && (
            <RecipeDisplay>
              <RecipeHeader>
                <HeaderTopRow>
                  <RecipeTitle>{recipePreview.title}</RecipeTitle>
                </HeaderTopRow>
                
                <TagsContainer>
                  <Tag>KI-generiert</Tag>
                  {recipePreview.dietaryRestrictions?.map((diet, index) => (
                    <Tag key={index}>{diet}</Tag>
                  ))}
                  {recipePreview.cuisine && <Tag>{recipePreview.cuisine}</Tag>}
                </TagsContainer>
                
                <RecipeMeta>
                  <MetaItem>
                    <FaUtensils /> 
                    <span>Schwierigkeit:</span>
                    <strong>{getDifficultyText(recipePreview.difficulty)}</strong>
                  </MetaItem>
                  {(recipePreview.prepTime || recipePreview.cookTime) && (
                    <MetaItem>
                      <FaClock /> 
                      <span>Zeit:</span>
                      <strong>
                        {recipePreview.prepTime && `${recipePreview.prepTime} Min. Vorb.`}
                        {recipePreview.prepTime && recipePreview.cookTime && ' / '}
                        {recipePreview.cookTime && `${recipePreview.cookTime} Min. Kochz.`}
                      </strong>
                    </MetaItem>
                  )}
                </RecipeMeta>
              </RecipeHeader>
              
              {recipePreview.description && (
                <Section>
                  <div style={{ fontSize: '16px', lineHeight: '1.6', color: 'var(--color-text-secondary)' }}>
                    {recipePreview.description.split('\n\n').map((para, index) => <p key={index}>{para}</p>)}
                  </div>
                </Section>
              )}
              
              {recipePreview.ingredients && recipePreview.ingredients.length > 0 && (
                <Section>
                  <SectionTitle>Zutaten</SectionTitle>
                  <IngredientList>
                    {recipePreview.ingredients.map((ingredient, index) => (
                      <Ingredient key={index}>
                        {ingredient.amount || ingredient.unit ? (
                          <> 
                            <strong>{`${ingredient.amount || ''} ${ingredient.unit || ''}`.trim()}</strong>
                            <span>{ingredient.name}</span>
                          </>
                        ) : (
                          <span style={{ gridColumn: '1 / -1' }}>{ingredient.name}</span>
                        )}
                      </Ingredient>
                    ))}
                  </IngredientList>
                </Section>
              )}
              
              {recipePreview.steps && recipePreview.steps.length > 0 && (
                <Section>
                  <SectionTitle>Zubereitung</SectionTitle>
                  <StepsList>
                    {recipePreview.steps.map((step, index) => (
                      <Step key={index}>
                        <div className="step-content" dangerouslySetInnerHTML={{ __html: formatStepText(step) }} />
                      </Step>
                    ))}
                  </StepsList>
                </Section>
              )}
              
              {recipePreview.nutrition && Object.keys(recipePreview.nutrition).length > 0 && ( 
                <Section>
                  <SectionTitle>Nährwerte (ca. pro Portion)</SectionTitle>
                  <NutritionSection>
                    <NutritionGrid>
                      {recipePreview.nutrition.calories && (
                        <NutritionItem>
                          <span>Kalorien</span>
                          <span>{recipePreview.nutrition.calories} kcal</span>
                        </NutritionItem>
                      )}
                      {recipePreview.nutrition.protein && (
                        <NutritionItem>
                          <span>Eiweiß</span>
                          <span>{recipePreview.nutrition.protein} g</span>
                        </NutritionItem>
                      )}
                      {recipePreview.nutrition.carbs && (
                        <NutritionItem>
                          <span>Kohlenhydrate</span>
                          <span>{recipePreview.nutrition.carbs} g</span>
                        </NutritionItem>
                      )}
                      {recipePreview.nutrition.fat && (
                        <NutritionItem>
                          <span>Fett</span>
                          <span>{recipePreview.nutrition.fat} g</span>
                        </NutritionItem>
                      )}
                    </NutritionGrid>
                  </NutritionSection>
                </Section>
              )}
              
              {recipePreview.tips && recipePreview.tips.length > 0 && (
                <Section>
                  <SectionTitle>Tipps</SectionTitle>
                  <ul>
                    {recipePreview.tips.map((tip, index) => (
                      <li key={index}>{tip}</li>
                    ))}
                  </ul>
                </Section>
              )}

              {isAuthenticated && (
                <>
                  <div style={{ margin: '20px', padding: '20px 0', borderTop: '1px solid var(--color-gray-200)' }}>
                    <h4>Rezeptbild hinzufügen (optional)</h4>
                    <ImageUpload 
                      onChange={handleImageChange}
                    />
                  </div>
                  
                  <ButtonGroup>
                    <Button 
                      onClick={handleSaveRecipe}
                      disabled={saveLoading}
                    >
                      {saveLoading ? 'Speichern...' : 'Rezept speichern'}
                    </Button>
                  </ButtonGroup>
                </>
              )}
            </RecipeDisplay>
          )}
          
          {/* Fallback display if preview parsing fails but raw text exists */}
          {!recipePreview && recipe && !isLoading && (
            <RecipeDisplay>
              <RecipeTitle>Dein Rezept (Vorschau fehlgeschlagen)</RecipeTitle>
              {recipe.text && recipe.text.toLowerCase().includes('titel:') && (
                <ExtractedTitle>
                  Erkannter Titel: {recipe.text.match(/titel\s*:\s*([^\n]+)/i)?.[1] || "Nicht gefunden"}
                </ExtractedTitle>
              )}
              <RecipeContent dangerouslySetInnerHTML={{ __html: formatRecipeText(recipe.text) }} />
              
              {isAuthenticated && (
                <>
                  <div style={{ margin: '20px', padding: '20px 0', borderTop: '1px solid var(--color-gray-200)' }}>
                    <h4>Rezeptbild hinzufügen (optional)</h4>
                    <ImageUpload 
                      onChange={handleImageChange}
                    />
                  </div>
                  
                  <ButtonGroup>
                    <Button 
                      onClick={handleSaveRecipe}
                      disabled={saveLoading}
                    >
                      {saveLoading ? 'Speichern...' : 'Rezept speichern'}
                    </Button>
                  </ButtonGroup>
                </>
              )}
            </RecipeDisplay>
          )}
        </Card>
      </ContentWrapper>
    </PageContainer>
  );
};

export default RecipeGenerator;