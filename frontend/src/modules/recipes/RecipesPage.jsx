import React from 'react';
import styled from 'styled-components';
import RecipeGenerator from '../../shared/components/recipe/RecipeGenerator';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: 28px;
  margin-bottom: 24px;
  color: #1f2937;
`;

const Description = styled.p`
  font-size: 16px;
  color: #6b7280;
  margin-bottom: 32px;
  line-height: 1.5;
`;

const RecipesPage = () => {
  return (
    <Container>
      <Title>Rezeptgenerator</Title>
      <Description>
        Erstelle personalisierte Rezepte basierend auf den Zutaten, die du zu Hause hast. 
        Gib deine verfügbaren Zutaten ein und wähle deine Präferenzen, 
        um ein maßgeschneidertes Rezept zu erhalten.
      </Description>
      
      <RecipeGenerator />
    </Container>
  );
};

export default RecipesPage; 