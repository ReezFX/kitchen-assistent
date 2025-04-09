import React from 'react';
import styled from 'styled-components';
import CookingAssistant from '../../shared/components/cooking/CookingAssistant';

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

const CookingAssistantPage = () => {
  return (
    <Container>
      <Title>Kochassistent</Title>
      <Description>
        Dein persönlicher KI-Kochassistent beantwortet alle deine Fragen während des Kochens.
        Egal ob Tipps zu Kochtechniken, Ersatzzutaten oder Fehlerbehebung - der Assistent ist für dich da.
      </Description>
      
      <CookingAssistant />
    </Container>
  );
};

export default CookingAssistantPage; 