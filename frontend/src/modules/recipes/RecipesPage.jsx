import React, { useState } from 'react';
import styled from 'styled-components';
import RecipeGenerator from '../../shared/components/recipe/RecipeGenerator';
import SavedRecipesList from '../../shared/components/recipe/SavedRecipesList';
import { useAuth } from '../../shared/hooks/useAuth';

const Container = styled.div`
  max-width: 1000px;
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

const TabContainer = styled.div`
  display: flex;
  margin-bottom: 24px;
  border-bottom: 1px solid #e5e7eb;
`;

const Tab = styled.button`
  padding: 12px 24px;
  background: none;
  border: none;
  font-size: 16px;
  font-weight: 500;
  color: ${props => props.active ? '#4f46e5' : '#6b7280'};
  border-bottom: 2px solid ${props => props.active ? '#4f46e5' : 'transparent'};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    color: #4f46e5;
  }
`;

const RecipesPage = () => {
  const [activeTab, setActiveTab] = useState('generator');
  const { isAuthenticated } = useAuth();
  
  return (
    <Container>
      <Title>Rezepte</Title>
      <Description>
        Erstelle personalisierte Rezepte basierend auf den Zutaten, die du zu Hause hast,
        oder sieh dir deine gespeicherten Rezepte an.
      </Description>
      
      <TabContainer>
        <Tab 
          active={activeTab === 'generator'} 
          onClick={() => setActiveTab('generator')}
        >
          Rezeptgenerator
        </Tab>
        {isAuthenticated && (
          <Tab 
            active={activeTab === 'saved'} 
            onClick={() => setActiveTab('saved')}
          >
            Gespeicherte Rezepte
          </Tab>
        )}
      </TabContainer>
      
      {activeTab === 'generator' ? (
        <RecipeGenerator />
      ) : (
        <SavedRecipesList />
      )}
    </Container>
  );
};

export default RecipesPage; 