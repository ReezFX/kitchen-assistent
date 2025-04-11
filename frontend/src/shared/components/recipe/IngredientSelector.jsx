import React, { useState } from 'react';
import styled from 'styled-components';
import Button from '../common/Button';
import Input from '../common/Input';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  
  @media (max-width: 768px) {
    gap: 12px;
  }
`;

const InputRow = styled.div`
  display: flex;
  gap: 8px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 8px;
  }
`;

const MobileAddButton = styled(Button)`
  @media (max-width: 768px) {
    margin-top: 4px;
  }
`;

const IngredientList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
  
  @media (max-width: 768px) {
    gap: 6px;
  }
`;

const IngredientTag = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border-radius: 16px;
  background-color: var(--color-gray-200);
  font-size: 14px;
  
  @media (max-width: 768px) {
    font-size: 13px;
    padding: 4px 6px;
  }
`;

const RemoveButton = styled.button`
  border: none;
  background: none;
  color: var(--color-gray-500);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  font-size: 16px;
  
  &:hover {
    color: var(--color-danger);
  }
  
  @media (max-width: 768px) {
    font-size: 18px; /* Slightly larger touch target on mobile */
    padding: 4px;
  }
`;

const EmptyState = styled.div`
  padding: 16px;
  text-align: center;
  background-color: var(--color-gray-50);
  border-radius: 8px;
  color: var(--color-gray-500);
  font-size: 14px;
  
  @media (max-width: 768px) {
    padding: 12px;
    font-size: 13px;
  }
`;

const IngredientSelector = ({ selectedIngredients, onChange }) => {
  const [newIngredient, setNewIngredient] = useState('');

  const handleAddIngredient = () => {
    if (newIngredient.trim() === '') return;
    if (selectedIngredients.includes(newIngredient.trim())) return;
    
    onChange([...selectedIngredients, newIngredient.trim()]);
    setNewIngredient('');
  };

  const handleRemoveIngredient = (ingredient) => {
    onChange(selectedIngredients.filter(item => item !== ingredient));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddIngredient();
    }
  };

  return (
    <Container>
      <InputRow>
        <Input
          placeholder="Zutat eingeben"
          value={newIngredient}
          onChange={(e) => setNewIngredient(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <MobileAddButton 
          type="button"
          onClick={handleAddIngredient}
          disabled={newIngredient.trim() === ''}
        >
          Hinzufügen
        </MobileAddButton>
      </InputRow>
      
      {selectedIngredients.length > 0 ? (
        <IngredientList>
          {selectedIngredients.map((ingredient, index) => (
            <IngredientTag key={index}>
              {ingredient}
              <RemoveButton 
                type="button"
                onClick={() => handleRemoveIngredient(ingredient)}
                aria-label={`${ingredient} entfernen`}
              >
                ×
              </RemoveButton>
            </IngredientTag>
          ))}
        </IngredientList>
      ) : (
        <EmptyState>
          Keine Zutaten ausgewählt. Fügen Sie Zutaten hinzu, um ein Rezept zu erstellen.
        </EmptyState>
      )}
    </Container>
  );
};

export default IngredientSelector; 