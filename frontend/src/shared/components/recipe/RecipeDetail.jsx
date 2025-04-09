import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useRecipes } from '../../hooks/useRecipes';
import { useAIService } from '../../hooks/useAIService';
import Card from '../common/Card';
import Button from '../common/Button';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const RecipeHeader = styled.div`
  margin-bottom: 32px;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 16px;
`;

const RecipeTitle = styled.h1`
  font-size: 32px;
  margin-bottom: 16px;
  color: #1f2937;
  font-weight: 700;
`;

const RecipeMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 16px;
  color: #6b7280;
  font-size: 14px;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  
  span {
    color: #6b7280;
  }
  
  strong {
    color: #4b5563;
    font-weight: 600;
  }
`;

const Section = styled.div`
  margin-bottom: 32px;
  padding-bottom: 16px;
`;

const SectionTitle = styled.h2`
  font-size: 22px;
  margin-bottom: 20px;
  color: #1f2937;
  font-weight: 600;
  padding-bottom: 8px;
  border-bottom: 2px solid #f3f4f6;
`;

const IngredientList = styled.ul`
  list-style: none;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
`;

const Ingredient = styled.li`
  display: flex;
  gap: 10px;
  padding: 10px 12px;
  background-color: #f9fafb;
  border-radius: 6px;
  border-left: 3px solid #4f46e5;
  
  strong {
    color: #4b5563;
    font-weight: 600;
    min-width: 80px;
  }
  
  span {
    color: #1f2937;
  }
`;

const StepsList = styled.ol`
  padding-left: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  counter-reset: steps;
  
  & > li {
    counter-increment: steps;
    position: relative;
  }
  
  & > li::before {
    content: counter(steps);
    position: absolute;
    left: -36px;
    top: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    background-color: #4f46e5;
    color: white;
    font-weight: 600;
    border-radius: 50%;
  }
`;

const Step = styled.li`
  padding: 12px 16px;
  background-color: #f9fafb;
  border-radius: 8px;
  line-height: 1.6;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  
  strong {
    font-weight: 600;
    color: #4b5563;
  }
  
  ul {
    margin-top: 8px;
    margin-bottom: 8px;
  }
  
  ul li {
    margin-bottom: 4px;
  }
`;

const NutritionSection = styled.div`
  margin-top: 24px;
  background-color: #f0f9ff;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e0f2fe;
`;

const NutritionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
  margin-top: 12px;
`;

const NutritionItem = styled.div`
  padding: 10px;
  background-color: white;
  border-radius: 6px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  
  span:first-child {
    font-weight: 500;
    color: #4b5563;
    margin-bottom: 4px;
  }
  
  span:last-child {
    font-size: 18px;
    font-weight: 600;
    color: #1f2937;
  }
`;

const Tag = styled.span`
  display: inline-block;
  background-color: #e5e7eb;
  color: #4b5563;
  font-size: 12px;
  font-weight: 500;
  padding: 4px 10px;
  border-radius: 16px;
  margin-right: 8px;
  margin-bottom: 8px;
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 12px;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
`;

const Loading = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px;
  font-weight: 500;
  color: #4f46e5;
  font-size: 18px;
`;

const Error = styled.div`
  color: #ef4444;
  padding: 16px;
  border-radius: 8px;
  background-color: #fee2e2;
  margin-top: 20px;
`;

// Chat Komponenten
const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 400px;
  margin-top: 32px;
  border-top: 1px solid #e5e7eb;
  padding-top: 24px;
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background-color: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
`;

const MessageBubble = styled.div`
  padding: 12px 16px;
  border-radius: 16px;
  max-width: 80%;
  word-break: break-word;
  line-height: 1.5;
  
  ${props => props.isUser ? `
    align-self: flex-end;
    background-color: #4f46e5;
    color: white;
    border-bottom-right-radius: 4px;
  ` : `
    align-self: flex-start;
    background-color: #f3f4f6;
    color: #1f2937;
    border-bottom-left-radius: 4px;
    
    & strong, & b {
      font-weight: 600;
    }
    
    & ul {
      margin-top: 8px;
      margin-bottom: 8px;
      padding-left: 20px;
    }
    
    & li {
      margin-bottom: 4px;
    }
  `}
`;

const InputContainer = styled.form`
  display: flex;
  gap: 8px;
  padding: 16px 0;
`;

const StyledInput = styled.input`
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 24px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #4f46e5;
    box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1);
  }
`;

const AssistantSection = styled.div`
  margin-top: 40px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
`;

const AssistantTitle = styled.h2`
  font-size: 22px;
  margin-bottom: 16px;
  color: #1f2937;
  font-weight: 600;
`;

const RecipeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getRecipeById, deleteRecipe, error } = useRecipes();
  const [recipe, setRecipe] = useState(null);
  const [localError, setLocalError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);
  const attemptRef = useRef(0);
  const MAX_ATTEMPTS = 1; // Only try once to prevent flickering
  
  // Kochassistent States
  const [messages, setMessages] = useState([
    { id: 1, text: 'Hallo! Ich bin dein Kochassistent. Stelle mir Fragen zu diesem Rezept.', isUser: false }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const { getAssistance, isLoading: assistantLoading } = useAIService();
  
  // Fetch recipe on component mount
  const fetchRecipe = useCallback(async () => {
    if (!id) {
      setLocalError('Keine Rezept-ID gefunden');
      setIsLoading(false);
      return;
    }

    if (attemptRef.current >= MAX_ATTEMPTS) {
      // Don't retry if we've already reached max attempts
      return;
    }
    
    try {
      setIsLoading(true);
      setLocalError(null);
      
      // Track that we've attempted a fetch
      setHasAttemptedFetch(true);
      attemptRef.current += 1;
      
      const data = await getRecipeById(id);
      setRecipe(data);
    } catch (err) {
      console.error('Fehler beim Laden des Rezepts:', err);
      setLocalError(err.message || 'Das Rezept konnte nicht geladen werden. Bitte versuchen Sie es später noch einmal.');
    } finally {
      setIsLoading(false);
    }
  }, [id, getRecipeById]);
  
  useEffect(() => {
    let isMounted = true;
    let timeoutId = null;
    
    const loadRecipe = async () => {
      if (isMounted && !hasAttemptedFetch) {
        await fetchRecipe();
      }
    };
    
    // Use a small timeout to prevent immediate refetching
    timeoutId = setTimeout(loadRecipe, 100);
    
    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [fetchRecipe, hasAttemptedFetch]);
  
  const handleDelete = async () => {
    if (window.confirm('Möchtest du dieses Rezept wirklich löschen?')) {
      try {
        setIsLoading(true);
        await deleteRecipe(id);
        navigate('/recipes');
      } catch (err) {
        console.error('Fehler beim Löschen des Rezepts:', err);
        setLocalError(err.message || 'Fehler beim Löschen des Rezepts');
        setIsLoading(false);
      }
    }
  };
  
  const handleRetry = () => {
    attemptRef.current = 0;
    setHasAttemptedFetch(false);
    setLocalError(null);
    fetchRecipe();
  };
  
  const getDifficultyText = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'Einfach';
      case 'medium': return 'Mittel';
      case 'hard': return 'Anspruchsvoll';
      default: return 'Mittel';
    }
  };
  
  // Function to format step text with proper HTML
  const formatStepText = (text) => {
    if (!text) return '';
    
    // Format text with bold headlines
    let formattedText = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    
    // Convert bullet points (* item) to list items
    if (formattedText.trim().startsWith('*')) {
      // If the step starts with a bullet list, format it as HTML list
      let lines = formattedText.split('\n');
      let isList = false;
      let listContent = '';
      
      lines = lines.map(line => {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('*')) {
          if (!isList) {
            isList = true;
            listContent = '<ul style="list-style-type: disc; padding-left: 20px; margin: 8px 0;">';
          }
          // Extract text after the asterisk, trim it, and add to list
          const listItemText = trimmedLine.substring(1).trim();
          listContent += `<li style="margin-bottom: 4px;">${listItemText}</li>`;
          return null; // Will be filtered out
        } else if (isList && trimmedLine === '') {
          // Empty line after list
          isList = false;
          listContent += '</ul>';
          return listContent;
        } else {
          // Regular line
          if (isList) {
            // End list if we encounter a non-list line
            isList = false;
            listContent += '</ul>';
            return listContent + line;
          }
          return line;
        }
      }).filter(line => line !== null);
      
      // If list is still open at the end, close it
      if (isList) {
        listContent += '</ul>';
        lines.push(listContent);
      }
      
      formattedText = lines.join('\n');
    }
    
    return formattedText;
  };
  
  // Automatisches Scrollen, wenn neue Nachrichten ankommen
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Hilfsfunktion zum Erstellen eines Rezeptkontexts aus dem aktuellen Rezept
  const createRecipeContext = (recipe) => {
    if (!recipe) return '';
    
    let context = `Rezept: ${recipe.title}\n\n`;
    
    if (recipe.ingredients && recipe.ingredients.length > 0) {
      context += "Zutaten:\n";
      recipe.ingredients.forEach(ing => {
        const amount = ing.amount ? `${ing.amount} ${ing.unit || ''}` : '';
        context += `- ${amount} ${ing.name}\n`;
      });
      context += "\n";
    }
    
    if (recipe.steps && recipe.steps.length > 0) {
      context += "Zubereitung:\n";
      recipe.steps.forEach((step, index) => {
        // Entferne HTML-Tags aus den Schritten
        const cleanedStep = step.replace(/<[^>]*>/g, '');
        context += `${index + 1}. ${cleanedStep}\n`;
      });
    }
    
    return context;
  };
  
  // Formatierungsfunktion für Assistentenantworten hinzufügen
  const formatAssistantText = (text) => {
    if (!text) return '';
    
    // Format text with bold headlines
    let formattedText = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    
    // Convert bullet points (* item) to list items
    let lines = formattedText.split('\n');
    let isList = false;
    let resultLines = [];
    let listContent = '';
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('*') && !line.startsWith('**')) {
        if (!isList) {
          isList = true;
          listContent = '<ul>';
        }
        // Extract text after the asterisk, trim it, and add to list
        const listItemText = line.substring(1).trim();
        listContent += `<li>${listItemText}</li>`;
      } else {
        if (isList) {
          // End current list
          isList = false;
          listContent += '</ul>';
          resultLines.push(listContent);
        }
        resultLines.push(line);
      }
    }
    
    // If we had a list at the end of text, close it
    if (isList) {
      listContent += '</ul>';
      resultLines.push(listContent);
    }
    
    return resultLines.join('\n');
  };
  
  // Nachricht senden
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (input.trim() === '' || !recipe) return;
    
    // Benutzernachricht hinzufügen
    const userMessage = { id: Date.now(), text: input, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    
    try {
      // Rezeptkontext erstellen
      const recipeContext = createRecipeContext(recipe);
      
      // Antwort vom AI-Service holen
      const assistantResponse = await getAssistance(input, recipeContext);
      
      // Assistentenantwort hinzufügen
      setMessages(prev => [
        ...prev, 
        { id: Date.now() + 1, text: assistantResponse, isUser: false }
      ]);
    } catch (error) {
      console.error('Fehler beim Kochassistenten:', error);
      setMessages(prev => [
        ...prev, 
        { 
          id: Date.now() + 1, 
          text: 'Entschuldigung, ich konnte deine Frage nicht beantworten. Bitte versuche es später noch einmal.', 
          isUser: false 
        }
      ]);
    }
  };
  
  // Zeige Loading-Zustand
  if (isLoading) {
    return (
      <Container>
        <Card>
          <Loading>Rezept wird geladen...</Loading>
        </Card>
      </Container>
    );
  }
  
  // Zeige Error-Zustand
  if (localError || error) {
    return (
      <Container>
        <Card>
          <Error>{localError || error}</Error>
          <ButtonContainer>
            <Button onClick={handleRetry} variant="primary">
              Erneut versuchen
            </Button>
            <Button onClick={() => navigate('/recipes')} variant="secondary">
              Zurück zur Übersicht
            </Button>
          </ButtonContainer>
        </Card>
      </Container>
    );
  }
  
  // Zeige Meldung, wenn kein Rezept gefunden wurde
  if (!recipe) {
    return (
      <Container>
        <Card>
          <Error>Rezept nicht gefunden.</Error>
          <ButtonContainer>
            <Button onClick={() => navigate('/recipes')} variant="secondary">
              Zurück zur Übersicht
            </Button>
          </ButtonContainer>
        </Card>
      </Container>
    );
  }
  
  // Render recipe content
  return (
    <Container>
      <Card>
        <RecipeHeader>
          <RecipeTitle>{recipe.title}</RecipeTitle>
          
          <TagsContainer>
            {recipe.isAIGenerated && <Tag>KI-generiert</Tag>}
            {recipe.dietaryRestrictions && recipe.dietaryRestrictions.map((diet, index) => (
              <Tag key={index}>{diet}</Tag>
            ))}
            {recipe.cuisine && <Tag>{recipe.cuisine}</Tag>}
          </TagsContainer>
          
          <RecipeMeta>
            <MetaItem>
              <span>Schwierigkeit:</span>
              <strong>{getDifficultyText(recipe.difficulty)}</strong>
            </MetaItem>
            {recipe.prepTime && (
              <MetaItem>
                <span>Zubereitungszeit:</span>
                <strong>{recipe.prepTime} Min.</strong>
              </MetaItem>
            )}
            {recipe.cookTime && (
              <MetaItem>
                <span>Kochzeit:</span>
                <strong>{recipe.cookTime} Min.</strong>
              </MetaItem>
            )}
          </RecipeMeta>
        </RecipeHeader>
        
        <Section>
          <SectionTitle>Zutaten</SectionTitle>
          <IngredientList>
            {recipe.ingredients.map((ingredient, index) => (
              <Ingredient key={index}>
                {ingredient.amount && ingredient.unit ? (
                  <>
                    <strong>{ingredient.amount} {ingredient.unit}</strong>
                    <span>{ingredient.name}</span>
                  </>
                ) : (
                  <span>{ingredient.name}</span>
                )}
              </Ingredient>
            ))}
          </IngredientList>
        </Section>
        
        {recipe.steps && recipe.steps.length > 0 && (
          <Section>
            <SectionTitle>Zubereitung</SectionTitle>
            <StepsList>
              {recipe.steps.map((step, index) => (
                <Step key={index} dangerouslySetInnerHTML={{ __html: formatStepText(step) }} />
              ))}
            </StepsList>
          </Section>
        )}
        
        {recipe.nutrition && (
          <Section>
            <SectionTitle>Nährwerte</SectionTitle>
            <NutritionSection>
              <NutritionGrid>
                {recipe.nutrition.calories && (
                  <NutritionItem>
                    <span>Kalorien</span>
                    <span>{recipe.nutrition.calories} kcal</span>
                  </NutritionItem>
                )}
                {recipe.nutrition.protein && (
                  <NutritionItem>
                    <span>Eiweiß</span>
                    <span>{recipe.nutrition.protein} g</span>
                  </NutritionItem>
                )}
                {recipe.nutrition.carbs && (
                  <NutritionItem>
                    <span>Kohlenhydrate</span>
                    <span>{recipe.nutrition.carbs} g</span>
                  </NutritionItem>
                )}
                {recipe.nutrition.fat && (
                  <NutritionItem>
                    <span>Fett</span>
                    <span>{recipe.nutrition.fat} g</span>
                  </NutritionItem>
                )}
              </NutritionGrid>
            </NutritionSection>
          </Section>
        )}
        
        {recipe && (
          <AssistantSection>
            <AssistantTitle>Kochassistent</AssistantTitle>
            <p>Stelle Fragen zu diesem Rezept - der Assistent hilft dir bei der Zubereitung.</p>
            
            <ChatContainer>
              <MessagesContainer>
                {messages.map(message => (
                  <MessageBubble key={message.id} isUser={message.isUser}>
                    {message.isUser ? 
                      message.text : 
                      <div dangerouslySetInnerHTML={{ __html: formatAssistantText(message.text) }} />
                    }
                  </MessageBubble>
                ))}
                <div ref={messagesEndRef} />
              </MessagesContainer>
              
              <InputContainer onSubmit={handleSendMessage}>
                <StyledInput
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Stelle eine Frage zum Rezept..."
                  disabled={assistantLoading}
                />
                <Button 
                  type="submit" 
                  disabled={input.trim() === '' || assistantLoading}
                >
                  {assistantLoading ? 'Sendet...' : 'Senden'}
                </Button>
              </InputContainer>
            </ChatContainer>
          </AssistantSection>
        )}
        
        <ButtonContainer>
          <Button 
            onClick={() => navigate('/recipes')}
            variant="secondary"
          >
            Zurück zur Übersicht
          </Button>
          <Button 
            onClick={handleDelete}
            variant="danger"
          >
            Rezept löschen
          </Button>
        </ButtonContainer>
      </Card>
    </Container>
  );
};

export default RecipeDetail;