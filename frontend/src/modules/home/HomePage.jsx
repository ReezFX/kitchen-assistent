import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import Button from '../../shared/components/common/Button';
import Card from '../../shared/components/common/Card';

const HeroSection = styled.section`
  background-color: #4f46e5;
  color: white;
  padding: 60px 20px;
  text-align: center;
  border-radius: 12px;
  margin-bottom: 40px;
`;

const HeroTitle = styled.h1`
  font-size: 36px;
  margin-bottom: 16px;
`;

const HeroSubtitle = styled.p`
  font-size: 18px;
  max-width: 600px;
  margin: 0 auto 32px;
  line-height: 1.5;
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
`;

const FeatureCard = styled(Card)`
  display: flex;
  flex-direction: column;
  height: 100%;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const FeatureIcon = styled.div`
  font-size: 36px;
  margin-bottom: 16px;
`;

const HomePage = () => {
  return (
    <>
      <HeroSection>
        <HeroTitle>Willkommen beim KI-gestützten Koch-Assistenten</HeroTitle>
        <HeroSubtitle>
          Entdecke Rezepte basierend auf deinen Zutaten, erhalte Unterstützung beim Kochen 
          und profitiere von intelligenten Funktionen für ein besseres Kocherlebnis.
        </HeroSubtitle>
        <Button as={Link} to="/recipes">
          Rezepte entdecken
        </Button>
      </HeroSection>
      
      <FeatureGrid>
        <FeatureCard>
          <FeatureIcon role="img" aria-label="Rezepte">🍲</FeatureIcon>
          <h3>Personalisierte Rezepte</h3>
          <p>
            Generiere Rezepte basierend auf den Zutaten, die du zu Hause hast, 
            und deinen persönlichen Präferenzen.
          </p>
          <Button as={Link} to="/recipes" style={{ marginTop: 'auto' }}>
            Rezept erstellen
          </Button>
        </FeatureCard>
        
        <FeatureCard>
          <FeatureIcon role="img" aria-label="Assistent">👨‍🍳</FeatureIcon>
          <h3>Intelligenter Kochassistent</h3>
          <p>
            Stelle Fragen während des Kochvorgangs und erhalte sofortige Hilfe 
            zu Techniken, Ersatzzutaten und mehr.
          </p>
          <Button as={Link} to="/cooking-assistant" style={{ marginTop: 'auto' }}>
            Assistent öffnen
          </Button>
        </FeatureCard>
        
        <FeatureCard>
          <FeatureIcon role="img" aria-label="Übersetzung">🌍</FeatureIcon>
          <h3>Mehrsprachige Unterstützung</h3>
          <p>
            Übersetze Rezepte und Anleitungen in deine bevorzugte Sprache für
            eine nahtlose Kocherfahrung.
          </p>
          <Button as={Link} to="/profile" style={{ marginTop: 'auto' }}>
            Profil anpassen
          </Button>
        </FeatureCard>
      </FeatureGrid>
    </>
  );
};

export default HomePage; 