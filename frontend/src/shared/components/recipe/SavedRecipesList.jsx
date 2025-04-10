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
  color: var(--color-text-primary);
`;

const RecipeInfo = styled.div`
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-bottom: 8px;
`;

const Tag = styled.span`
  display: inline-block;
  background-color: var(--color-gray-200);
  color: var(--color-gray-600);
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
  background-color: var(--color-gray-50);
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
  color: var(--color-primary);
`;

const Error = styled.div`
  color: var(--color-danger);
  padding: 16px;
  border-radius: 8px;
  background-color: var(--color-danger-hover);
  margin-top: 20px;
`;

// Neue Komponente für das Thumbnail
const ThumbnailContainer = styled.div`
  width: 100%;
  height: 160px;
  overflow: hidden;
  border-radius: 8px;
  margin-bottom: 12px;
  position: relative;
  background-color: var(--color-gray-100);
`;

const RecipeThumbnail = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;

  ${RecipeCard}:hover & {
    transform: scale(1.05);
  }
`;

const PlaceholderThumbnail = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-gray-400);
  font-size: 36px;
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 12px;
`;

const SavedRecipesList = () => {
  const navigate = useNavigate();
  const { recipes, deleteRecipe, loading, error } = useRecipes();
  
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
  
  // Helper function to get text for difficulty
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
        <h3>Keine Rezepte gefunden</h3>
        <p>Du hast noch keine Rezepte gespeichert. Erstelle dein erstes Rezept!</p>
      </EmptyState>
    );
  }
  
  return (
    <RecipeGrid>
      {recipes.map((recipe) => (
        <RecipeCard key={recipe._id}>
          {/* Thumbnail hinzufügen */}
          <ThumbnailContainer>
            {recipe.image && recipe.image.data ? (
              <RecipeThumbnail 
                src={`data:${recipe.image.contentType};base64,${recipe.image.data}`} 
                alt={recipe.title}
              />
            ) : (
              <PlaceholderThumbnail>🍽️</PlaceholderThumbnail>
            )}
          </ThumbnailContainer>
          
          <RecipeTitle>{recipe.title}</RecipeTitle>
          
          <RecipeInfo>
            <div>Schwierigkeit: {getDifficultyText(recipe.difficulty)}</div>
            {recipe.cuisine && <div>Küche: {recipe.cuisine}</div>}
          </RecipeInfo>
          
          <TagsContainer>
            {recipe.isAIGenerated && <Tag>KI-generiert</Tag>}
            {recipe.dietaryRestrictions && recipe.dietaryRestrictions.map((diet, index) => (
              <Tag key={index}>{diet}</Tag>
            ))}
          </TagsContainer>
          
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