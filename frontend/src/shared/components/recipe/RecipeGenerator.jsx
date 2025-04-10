/* eslint-disable */
import React, { useState } from 'react';
import styled from 'styled-components';
import { useAIService } from '../../hooks/useAIService';
import { useRecipes } from '../../hooks/useRecipes';
import { useAuth } from '../../hooks/useAuth';

import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import IngredientSelector from './IngredientSelector';
import ImageUpload from '../common/ImageUpload';

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

const RecipeDisplay = styled.div`
  margin-top: 24px;
  padding: 20px;
  background-color: var(--color-gray-50);
  border-radius: 8px;
  border: 1px solid var(--color-gray-200);
`;

const RecipeTitle = styled.h3`
  font-size: 22px;
  color: var(--color-text-primary);
  margin-bottom: 16px;
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
  
  strong {
    font-weight: 600;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 20px;
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
    difficulty: 'medium'
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
      const generatedRecipe = await generateRecipe(ingredients, preferences);
      
      // Check if the response might be truncated
      if (generatedRecipe && generatedRecipe.text) {
        // Check for potential truncation signs
        const text = generatedRecipe.text;
        const lastChar = text.charAt(text.length - 1);
        const lastFewChars = text.substring(text.length - 5);
        
        // If the text ends abruptly with a number followed by a dot, or with a colon, or with markdown
        const seemsTruncated = (
          /\d+\.\s*$/.test(lastFewChars) || // Ends with a number followed by a dot
          lastChar === ':' ||              // Ends with a colon
          lastFewChars.includes('**') ||   // Ends with markdown
          (text.match(/\*\*/g) || []).length % 2 !== 0 // Uneven number of ** (unclosed bold)
        );
        
        if (seemsTruncated) {
          console.warn('Möglicherweise unvollständige API-Antwort erkannt:', lastFewChars);
          // Append a note for the user
          generatedRecipe.text += '\n\n[Hinweis: Es könnte sein, dass nicht der gesamte Text angezeigt wird. Bitte passen Sie die Komplexität an oder versuchen Sie es erneut mit weniger Zutaten.]';
        }
      }
      
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
      // Parse title from recipe text
      const lines = recipe.text.split('\n');
      
      // Default to first line
      let title = lines[0].trim();
      let foundExactTitle = false;
      
      console.log("Extrahiere Titel aus:", lines.slice(0, 20));
      
      // Helper function to clean title from markdown stars
      const cleanTitle = (title) => {
        if (!title) return '';
        
        // Remove markdown formatting stars at beginning or end
        let cleanedTitle = title.replace(/^\*\*/, '').replace(/\*\*$/, '');
        
        // Remove any remaining markdown formatting (bold, italic, etc)
        cleanedTitle = cleanedTitle.replace(/\*\*/g, '').replace(/\*/g, '');
        
        // Remove backticks (code formatting)
        cleanedTitle = cleanedTitle.replace(/`/g, '');
        
        // Remove any leading/trailing whitespace
        cleanedTitle = cleanedTitle.trim();
        
        return cleanedTitle;
      };
      
      // First pass: Look EXACTLY for "Titel:" in any case (HIGHEST PRIORITY)
      let titleFound = false;
      for (let i = 0; i < 40 && i < lines.length; i++) {
        const line = lines[i].trim();
        console.log(`Prüfe Zeile ${i} auf Titel: "${line}"`);
        
        // Check for exact "Titel:" pattern with different capitalizations and formats
        if (line.toLowerCase().startsWith('titel:') || line.match(/^titel\s*:/i)) {
          // Extract everything after the colon
          let titlePart = '';
          const colonIndex = line.indexOf(':');
          if (colonIndex !== -1 && colonIndex < line.length - 1) {
            titlePart = line.substring(colonIndex + 1).trim();
            if (titlePart) {
              console.log(`!!! TITEL GEFUNDEN !!! in Zeile ${i}: "${line}" -> Extrahiert: "${titlePart}"`);
              title = cleanTitle(titlePart);
              titleFound = true;
              foundExactTitle = true;
              break;
            }
          }
        }
      }
      
      // TITEL HIGHER PRIORITY: If we still haven't found a title, check for "Titel:" anywhere in the first 50 lines
      if (!titleFound) {
        const titleLine = lines.slice(0, 50).find(line => 
          line.toLowerCase().includes('titel:') && !line.toLowerCase().includes('untertitel:')
        );
        
        if (titleLine) {
          const colonIndex = titleLine.toLowerCase().indexOf('titel:') + 6;
          if (colonIndex < titleLine.length) {
            const titlePart = titleLine.substring(colonIndex).trim();
            if (titlePart) {
              console.log(`!!! TITEL DURCH INCLUDES GEFUNDEN !!! "${titleLine}" -> Extrahiert: "${titlePart}"`);
              title = cleanTitle(titlePart);
              titleFound = true;
              foundExactTitle = true;
            }
          }
        }
      }
      
      // Second pass: If we didn't find a title with "Titel:", look for the real recipe title
      if (!foundExactTitle) {
        console.log("Kein expliziter Titel gefunden, suche nach alternativem Titel...");
        // If current title is likely a greeting or introduction
        if (title.toLowerCase().includes('hier ist') || 
            title.toLowerCase().includes('absolut') ||
            title.startsWith('Ein ') ||
            title.includes('!')) {
          
          // Look for a line that looks like a title
          for (let i = 1; i < 20 && i < lines.length; i++) {
            const line = lines[i].trim();
            
            // Skip empty lines and long lines
            if (!line || line.length > 80 || line.length < 4) continue;
            
            // Skip lines that are part of other sections
            if (line.toLowerCase().includes('zutaten') ||
                line.toLowerCase().includes('beschreibung') ||
                line.toLowerCase().includes('anleitung') ||
                line.toLowerCase().includes('schritte') ||
                line.includes(':')) continue;
                
            // If it looks like a title (not too long, not too short, not ALL CAPS)
            if (line !== line.toUpperCase() && 
                !line.includes('!') && 
                !line.includes('?')) {
              console.log(`Möglicher Titel gefunden: "${line}"`);
              title = cleanTitle(line);  // <- Clean the title
              break;
            }
          }
        }
      }
      
      // Third pass: look specifically for patterns that commonly indicate recipe titles
      if (!foundExactTitle && (title.toLowerCase().includes('hier ist') || title.includes('!'))) {
        console.log("Suche nach speziellen Titelmustern...");
        
        // Look for lines that match typical recipe title patterns
        for (let i = 0; i < 30 && i < lines.length; i++) {
          const line = lines[i].trim();
          
          // Skip empty lines
          if (!line) continue;
          
          // Pattern 1: Title often appears right after "Hier ist ein Rezept..." or similar introductions
          if (i > 0) {
            const prevLine = lines[i-1].trim().toLowerCase();
            if ((prevLine.includes('hier ist') || prevLine.includes('rezept')) && 
                line.length > 5 && line.length < 70 && 
                !line.includes(':') && !line.toLowerCase().includes('zutaten')) {
              console.log(`Titelmuster 1 gefunden: "${line}"`);
              title = cleanTitle(line);  // <- Clean the title
              foundExactTitle = true;
              break;
            }
          }
          
          // Pattern 2: Title is often a short, standalone line that's capitalized and contains specific keywords
          const titleKeywords = ['keto', 'salat', 'suppe', 'auflauf', 'brot', 'kuchen', 'pfanne', 'toast', 'hähnchen', 'vegetarisch'];
          const containsTitleKeyword = titleKeywords.some(keyword => 
            line.toLowerCase().includes(keyword)
          );
          
          if (containsTitleKeyword && 
              line.length > 8 && line.length < 70 && 
              !line.includes(':') && 
              line !== line.toLowerCase() && // Some capitalization
              !line.toLowerCase().includes('zutaten') &&
              !line.toLowerCase().includes('schritte')) {
            console.log(`Titelmuster 2 gefunden: "${line}"`);
            title = cleanTitle(line);  // <- Clean the title
            foundExactTitle = true;
            break;
          }
        }
      }
      
      // Final title safety check - make sure we don't have an ingredient or other problematic text as title
      if (!foundExactTitle) {
        // If title starts with a star or is a measurement, it's probably not a title
        if (title.startsWith('*') || 
            /^\d+\s+[gmltLkgELTesps]+/.test(title) || // Measurement pattern with units
            /^\d+x/.test(title) || // Measurement pattern like "2x..."
            title.toLowerCase().includes('zutaten:') ||
            title.toLowerCase().includes('beschreibung:')) {
          console.log(`Problematischer Titel erkannt, setze Standard-Titel: "${title}"`);
          title = "Keto-Rezept";  // Default title as fallback
        } else {
          console.log(`Titel scheint in Ordnung zu sein: "${title}"`);
        }
      }
      
      console.log(`Finaler Titel nach allen Prüfungen: "${title}"`);

      // Final cleaning of the title - ensure all markdown is removed
      title = cleanTitle(title);
      console.log(`Finaler Titel nach Bereinigung: "${title}"`);
      
      // Parse ingredients from recipe text
      let extractedIngredients = [];
      let inIngredients = false;
      let inSteps = false;
      let steps = [];
      
      // Iterate through all lines to extract ingredients and steps
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        if (line === '') continue;
        
        // Check for section headers
        const lineLC = line.toLowerCase();
        
        // Debug log for section detection
        console.log(`Zeile ${i}: "${line}" - inIngredients: ${inIngredients}, inSteps: ${inSteps}`);
        
        // More robust ingredients section detection
        if (lineLC.includes('zutaten:') || 
            line === 'Zutaten' || 
            lineLC === 'zutaten' ||
            lineLC.startsWith('zutaten für') ||
            (lineLC === 'zutaten' && lines[i+1] && lines[i+1].includes(':')) ||
            lineLC.includes('benötigte zutaten')) {
          console.log(`Zutaten-Abschnitt gefunden in Zeile ${i}: "${line}"`);
          inIngredients = true;
          inSteps = false;
          continue;
        }
        
        // Skip lines that are clearly ingredient lines but might appear before the "Zutaten" header
        if (!inIngredients && (line.startsWith('*') || /^\d+[\.,]?\s+g\s+/.test(line) || /^\d+\s+ml\s+/.test(line))) {
          console.log(`Potenzielle Zutat übersprungen, da noch nicht im Zutatenbereich: "${line}"`);
          continue;
        }
        
        // More robust steps section detection
        if (lineLC.includes('schritte:') || 
            lineLC.includes('zubereitung:') || 
            lineLC.includes('anleitung:') ||
            line === 'Schritte' ||
            line === 'Zubereitung' ||
            line === 'Anleitung' ||
            lineLC === 'zubereitung' ||
            lineLC === 'anleitung' ||
            lineLC === 'schritte' ||
            lineLC.includes('so wird es gemacht')) {
          console.log(`Zubereitungs-Abschnitt gefunden in Zeile ${i}: "${line}"`);
          inIngredients = false;
          inSteps = true;
          continue;
        }
        
        // End sections when a new section starts
        if ((lineLC.includes('nährwert') || 
             lineLC.includes('hinweis') ||
             lineLC.includes('tipps')) && 
            (inIngredients || inSteps)) {
          console.log(`Ende des Abschnitts erkannt in Zeile ${i}: "${line}"`);
          inIngredients = false;
          inSteps = false;
        }
        
        // Extract ingredients
        if (inIngredients && line) {
          // Check if line is a section header for ingredients (e.g. "Für die Sauce:")
          if (line.includes(':') && !line.match(/^\d+\.\s+/) && !line.match(/^\*\s+/) && !line.startsWith('- ')) {
            const sectionName = line.trim();
            extractedIngredients.push({ 
              name: `**${sectionName}**`, 
              amount: '',
              unit: ''
            });
            continue;
          }
          
          // Check if line is a numbered or bulleted ingredient
          let ingredient = line;
          if (/^\d+\.\s+/.test(line)) {
            ingredient = line.replace(/^\d+\.\s+/, '').trim();
          } else if (/^\*\s+/.test(line) || line.startsWith('- ')) {
            ingredient = line.replace(/^[\*\-]\s+/, '').trim();
          }
          
          // Try to parse amount, unit and name
          let amount = '';
          let unit = '';
          let name = ingredient;
          
          // Try to handle different formats:
          // 1. "200 g Mehl" or "2 EL Öl"
          // 2. "Mehl - 200 g" 
          // 3. "Avocado, reif"
          
          // Format: "200 g Mehl"
          const standardMatch = ingredient.match(/^([\d\/\.,]+)\s*([a-zA-ZäöüÄÖÜß]+|EL|TL|Prise|Stück|Dose|Packung|Tasse)\s+(.+)$/);
          if (standardMatch) {
            amount = standardMatch[1];
            unit = standardMatch[2];
            name = standardMatch[3];
          } 
          // Format: "Mehl - 200 g"
          else if (ingredient.includes(' - ')) {
            const parts = ingredient.split(' - ');
            name = parts[0].trim();
            if (parts[1]) {
              const amountMatch = parts[1].match(/^([\d\/\.,]+)\s*([a-zA-ZäöüÄÖÜß]+|EL|TL)$/);
              if (amountMatch) {
                amount = amountMatch[1];
                unit = amountMatch[2];
              } else {
                // Just in case it's just an amount without unit
                amount = parts[1].trim();
              }
            }
          }
          
          extractedIngredients.push({ 
            name: name, 
            amount: amount,
            unit: unit
          });
        }
        
        // Extract steps
        if (inSteps && line) {
          // Check if this is a main step (e.g. "1. Keto-Hummus zubereiten:")
          if ((/^\d+\.\s+/.test(line) && line.endsWith(':')) || 
              (line.endsWith(':') && !lineLC.includes('nährwertangaben'))) {
            // Create a new step with the header
            let stepText = line.replace(/^\d+\.\s*/, '').trim();
            // Format as bold
            stepText = `**${stepText}**`;
            steps.push(stepText);
          }
          // Check if this is a substep bullet point
          else if (/^\s+[\*\-•]\s+/.test(line) || line.match(/^\s+\d+\.\s+/)) {
            // If there's a previous step, append this as a bullet point
            if (steps.length > 0) {
              // Get the last step
              const lastStep = steps[steps.length - 1];
              
              // If the last step doesn't have a list yet, start one
              if (!lastStep.includes('<ul>')) {
                steps[steps.length - 1] = `${lastStep}\n<ul>`;
              }
              
              // Add the bullet point
              const bulletText = line.replace(/^\s+[\*\-•]\s+/, '').replace(/^\s+\d+\.\s+/, '').trim();
              steps[steps.length - 1] = `${steps[steps.length - 1]}\n<li>${bulletText}</li>`;
            }
          }
          // If the previous step has an open list and this is not a bullet, close the list
          else if (steps.length > 0 && steps[steps.length - 1].includes('<ul>') && 
                   !steps[steps.length - 1].includes('</ul>') && 
                   !line.match(/^\s+[\*\-•]\s+/) && 
                   !line.match(/^\s+\d+\.\s+/)) {
            steps[steps.length - 1] = `${steps[steps.length - 1]}\n</ul>`;
            
            // And add this line as a new step if not empty
            if (line.trim()) {
              // Remove numbering like "1." or "1. " from the beginning
              let step = line.replace(/^\d+\.\s*/, '').trim();
              if (step) {
                steps.push(step);
              }
            }
          }
          // Regular step
          else if (line.trim()) {
            // Remove numbering like "1." or "1. " from the beginning
            let step = line.replace(/^\d+\.\s*/, '').trim();
            if (step) {
              steps.push(step);
            }
          }
        }
      }
      
      // Close any open lists in steps
      for (let i = 0; i < steps.length; i++) {
        if (steps[i].includes('<ul>') && !steps[i].includes('</ul>')) {
          steps[i] = `${steps[i]}\n</ul>`;
        }
      }
      
      // If no ingredients were found, use the provided ingredients
      if (extractedIngredients.length === 0) {
        extractedIngredients = ingredients.map(ing => ({ name: ing, amount: '', unit: '' }));
      }
      
      console.log(`Extrahierte Zutaten:`, extractedIngredients);
      console.log(`Extrahierte Schritte:`, steps);
      
      // Create recipe data object without image first
      const recipeData = {
        title,
        ingredients: extractedIngredients,
        steps: steps,
        cuisine: preferences.cuisine || undefined,
        dietaryRestrictions: preferences.diet ? [preferences.diet] : [],
        difficulty: preferences.difficulty,
        isAIGenerated: true
      };
      
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
      
      // eslint-disable-next-line
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

  // Function to format recipe text with proper HTML
  const formatRecipeText = (text) => {
    if (!text) return '';
    
    // Ensure text is not truncated by ensuring any unclosed markdown is fixed
    let formattedText = text;
    
    // Fix any unclosed markdown at the end (like ** without closing **)
    if ((formattedText.match(/\*\*/g) || []).length % 2 !== 0) {
      formattedText = formattedText.replace(/\*\*([^*]*)$/, '**$1**');
    }
    
    // Format text with bold headlines
    formattedText = formattedText.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    
    // Convert markdown lists to HTML lists
    const lines = formattedText.split('\n');
    let inList = false;
    let listHtml = '';
    let resultLines = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();
      
      if (trimmedLine.startsWith('*')) {
        if (!inList) {
          inList = true;
          listHtml = '<ul style="list-style-type: disc; padding-left: 20px; margin: 8px 0;">';
        }
        // Extract text after the asterisk and add to list
        const listItemText = trimmedLine.substring(1).trim();
        listHtml += `<li style="margin-bottom: 4px;">${listItemText}</li>`;
      } else {
        if (inList) {
          // End current list
          inList = false;
          listHtml += '</ul>';
          resultLines.push(listHtml);
        }
        resultLines.push(line);
      }
    }
    
    // If we had a list at the end of text, close it
    if (inList) {
      listHtml += '</ul>';
      resultLines.push(listHtml);
    }
    
    return resultLines.join('\n');
  };

  return (
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
          {recipe.text && recipe.text.toLowerCase().includes('titel:') && (
            <ExtractedTitle>
              Erkannter Titel: {recipe.text.match(/titel\s*:\s*([^\n]+)/i)?.[1] || "Nicht gefunden"}
            </ExtractedTitle>
          )}
          <RecipeContent dangerouslySetInnerHTML={{ __html: formatRecipeText(recipe.text) }} />
          
          {isAuthenticated && (
            <>
              <div style={{ marginTop: '20px' }}>
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
  );
};

export default RecipeGenerator; 