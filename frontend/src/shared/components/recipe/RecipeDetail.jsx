import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useRecipes } from '../../hooks/useRecipes';
import Card from '../common/Card';
import Button from '../common/Button';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const RecipeHeader = styled.div`
  margin-bottom: 24px;
`;

const RecipeTitle = styled.h1`
  font-size: 28px;
  margin-bottom: 12px;
  color: #1f2937;
`;

const RecipeMeta = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  color: #6b7280;
  font-size: 14px;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const Section = styled.div`
  margin-bottom: 24px;
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  margin-bottom: 16px;
  color: #1f2937;
`;

const IngredientList = styled.ul`
  list-style: none;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 8px;
`;

const Ingredient = styled.li`
  display: flex;
  gap: 8px;
  padding: 8px;
  background-color: #f9fafb;
  border-radius: 4px;
`;

const StepsList = styled.ol`
  padding-left: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Step = styled.li`
  padding: 8px;
  background-color: #f9fafb;
  border-radius: 4px;
`;

const Tag = styled.span`
  display: inline-block;
  background-color: #e5e7eb;
  color: #4b5563;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;
  margin-right: 6px;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 32px;
`;

const Loading = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  font-weight: 500;
  color: #4f46e5;
`;

const Error = styled.div`
  color: #ef4444;
  padding: 16px;
  border-radius: 8px;
  background-color: #fee2e2;
  margin-top: 20px;
`;

const RecipeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getRecipeById, deleteRecipe, loading, error } = useRecipes();
  const [recipe, setRecipe] = useState(null);
  const [localError, setLocalError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const retryCount = useRef(0);
  const maxRetries = 2;
  
  // Fetch recipe on component mount als useCallback-Funktion, um sie in useEffect zu verwenden
  const fetchRecipe = useCallback(async () => {
    if (!id) {
      setLocalError('Keine Rezept-ID gefunden');
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      setLocalError(null);
      const data = await getRecipeById(id);
      setRecipe(data);
      retryCount.current = 0; // Reset retry count on success
    } catch (err) {
      console.error('Fehler beim Laden des Rezepts:', err);
      
      // Prevent continuous retries
      if (retryCount.current >= maxRetries) {
        setLocalError(err.message || 'Das Rezept konnte nicht geladen werden. Bitte versuchen Sie es später noch einmal.');
        setIsLoading(false);
        return;
      }
      retryCount.current += 1;
    } finally {
      setIsLoading(false);
    }
  }, [id, getRecipeById]);
  
  useEffect(() => {
    let isMounted = true;
    
    const loadRecipe = async () => {
      if (isMounted) {
        await fetchRecipe();
      }
    };
    
    loadRecipe();
    
    return () => {
      isMounted = false;
    };
  }, [fetchRecipe]);
  
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
  
  const getDifficultyText = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'Einfach';
      case 'medium': return 'Mittel';
      case 'hard': return 'Anspruchsvoll';
      default: return 'Mittel';
    }
  };
  
  // Zeige Loading-Zustand
  if (isLoading) {
    return <Loading>Rezept wird geladen...</Loading>;
  }
  
  // Zeige Error-Zustand
  if (localError || error) {
    return <Error>{localError || error}</Error>;
  }
  
  // Zeige Meldung, wenn kein Rezept gefunden wurde
  if (!recipe) {
    return <Error>Rezept nicht gefunden.</Error>;
  }
  
  return (
    <Container>
      <Card>
        <RecipeHeader>
          <RecipeTitle>{recipe.title}</RecipeTitle>
          
          <div>
            {recipe.isAIGenerated && <Tag>KI-generiert</Tag>}
            {recipe.dietaryRestrictions && recipe.dietaryRestrictions.map((diet, index) => (
              <Tag key={index}>{diet}</Tag>
            ))}
            {recipe.cuisine && <Tag>{recipe.cuisine}</Tag>}
          </div>
          
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
                <Step key={index}>{step}</Step>
              ))}
            </StepsList>
          </Section>
        )}
        
        {recipe.nutrition && (
          <Section>
            <SectionTitle>Nährwerte</SectionTitle>
            <div>
              {recipe.nutrition.calories && <div>Kalorien: {recipe.nutrition.calories} kcal</div>}
              {recipe.nutrition.protein && <div>Eiweiß: {recipe.nutrition.protein} g</div>}
              {recipe.nutrition.carbs && <div>Kohlenhydrate: {recipe.nutrition.carbs} g</div>}
              {recipe.nutrition.fat && <div>Fett: {recipe.nutrition.fat} g</div>}
            </div>
          </Section>
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