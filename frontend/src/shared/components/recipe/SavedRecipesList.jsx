import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useRecipes } from '../../hooks/useRecipes';
import Card from '../common/Card';
import Button from '../common/Button';

const RecipeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

const RecipeCard = styled(Card)`
  display: flex;
  flex-direction: column;
  height: 100%;
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-4px);
  }
`;

const RecipeTitle = styled.h3`
  font-size: 18px;
  margin-bottom: 8px;
  color: #1f2937;
`;

const RecipeInfo = styled.div`
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 8px;
`;

const Tag = styled.span`
  display: inline-block;
  background-color: #e5e7eb;
  color: #4b5563;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;
  margin-right: 6px;
  margin-bottom: 6px;
`;

const ButtonContainer = styled.div`
  margin-top: auto;
  display: flex;
  gap: 8px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  background-color: #f9fafb;
  border-radius: 8px;
  margin-top: 20px;
`;

const EmptyStateIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
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

const SavedRecipesList = () => {
  const { recipes, loading, error, deleteRecipe } = useRecipes();
  const navigate = useNavigate();
  
  const handleViewRecipe = (id) => {
    navigate(`/recipes/${id}`);
  };
  
  const handleDeleteRecipe = async (id) => {
    if (window.confirm('Möchtest du dieses Rezept wirklich löschen?')) {
      try {
        await deleteRecipe(id);
      } catch (error) {
        console.error('Fehler beim Löschen des Rezepts:', error);
      }
    }
  };
  
  // Helper function to get difficulty in German
  const getDifficultyText = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'Einfach';
      case 'medium': return 'Mittel';
      case 'hard': return 'Anspruchsvoll';
      default: return 'Mittel';
    }
  };
  
  if (loading) {
    return <Loading>Rezepte werden geladen...</Loading>;
  }
  
  if (error) {
    return <Error>{error}</Error>;
  }
  
  if (recipes.length === 0) {
    return (
      <EmptyState>
        <EmptyStateIcon>📝</EmptyStateIcon>
        <h3>Keine gespeicherten Rezepte</h3>
        <p>Du hast noch keine Rezepte gespeichert. Erstelle dein erstes Rezept!</p>
      </EmptyState>
    );
  }
  
  return (
    <RecipeGrid>
      {recipes.map((recipe) => (
        <RecipeCard key={recipe._id}>
          <RecipeTitle>{recipe.title}</RecipeTitle>
          
          <RecipeInfo>
            <div>Schwierigkeit: {getDifficultyText(recipe.difficulty)}</div>
            {recipe.cuisine && <div>Küche: {recipe.cuisine}</div>}
          </RecipeInfo>
          
          <div>
            {recipe.isAIGenerated && <Tag>KI-generiert</Tag>}
            {recipe.dietaryRestrictions && recipe.dietaryRestrictions.map((diet, index) => (
              <Tag key={index}>{diet}</Tag>
            ))}
          </div>
          
          <ButtonContainer>
            <Button 
              onClick={() => handleViewRecipe(recipe._id)}
              variant="primary"
            >
              Ansehen
            </Button>
            <Button 
              onClick={() => handleDeleteRecipe(recipe._id)}
              variant="danger"
            >
              Löschen
            </Button>
          </ButtonContainer>
        </RecipeCard>
      ))}
    </RecipeGrid>
  );
};

export default SavedRecipesList; 