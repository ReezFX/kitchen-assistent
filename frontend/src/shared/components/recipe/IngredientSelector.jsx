import React, { useState } from 'react';
import styled from 'styled-components';
import Button from '../common/Button';
import Input from '../common/Input';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const InputRow = styled.div`
  display: flex;
  gap: 8px;
`;

const IngredientList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
`;

const IngredientTag = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border-radius: 16px;
  background-color: #e5e7eb;
  font-size: 14px;
`;

const RemoveButton = styled.button`
  border: none;
  background: none;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  font-size: 16px;
  
  &:hover {
    color: #ef4444;
  }
`;

const EmptyState = styled.div`
  padding: 16px;
  text-align: center;
  background-color: #f9fafb;
  border-radius: 8px;
  color: #6b7280;
  font-size: 14px;
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
        <Button 
          type="button"
          onClick={handleAddIngredient}
          disabled={newIngredient.trim() === ''}
        >
          Hinzufügen
        </Button>
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