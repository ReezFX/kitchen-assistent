import React from 'react';
import styled from 'styled-components';
import Card from '../../shared/components/common/Card';
import Button from '../../shared/components/common/Button';
import Input from '../../shared/components/common/Input';

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

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  margin-bottom: 16px;
  color: #1f2937;
`;

const PreferencesGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ProfilePage = () => {
  return (
    <Container>
      <Title>Benutzerprofil</Title>
      <Description>
        Verwalte deine persönlichen Einstellungen und Präferenzen für ein individuelles Kocherlebnis.
      </Description>
      
      <Card title="Deine Einstellungen">
        <Form>
          <div>
            <SectionTitle>Persönliche Informationen</SectionTitle>
            <Input 
              label="Name"
              name="name"
              placeholder="Dein Name"
            />
            <Input 
              label="E-Mail"
              name="email"
              type="email"
              placeholder="deine.email@beispiel.de"
            />
          </div>
          
          <div>
            <SectionTitle>Kochpräferenzen</SectionTitle>
            <PreferencesGrid>
              <div>
                <label>Ernährungsweise</label>
                <select name="diet">
                  <option value="">Keine Präferenz</option>
                  <option value="vegetarian">Vegetarisch</option>
                  <option value="vegan">Vegan</option>
                  <option value="gluten-free">Glutenfrei</option>
                  <option value="dairy-free">Laktosefrei</option>
                </select>
              </div>
              
              <div>
                <label>Bevorzugte Küche</label>
                <select name="cuisine">
                  <option value="">Alle Küchen</option>
                  <option value="italian">Italienisch</option>
                  <option value="asian">Asiatisch</option>
                  <option value="german">Deutsch</option>
                  <option value="mexican">Mexikanisch</option>
                  <option value="indian">Indisch</option>
                </select>
              </div>
              
              <div>
                <label>Kochfähigkeiten</label>
                <select name="skill">
                  <option value="beginner">Anfänger</option>
                  <option value="intermediate">Mittelstufe</option>
                  <option value="advanced">Fortgeschritten</option>
                </select>
              </div>
              
              <div>
                <label>Bevorzugte Sprache</label>
                <select name="language">
                  <option value="de">Deutsch</option>
                  <option value="en">Englisch</option>
                  <option value="fr">Französisch</option>
                  <option value="es">Spanisch</option>
                  <option value="it">Italienisch</option>
                </select>
              </div>
            </PreferencesGrid>
          </div>
          
          <Button type="button">Einstellungen speichern</Button>
        </Form>
      </Card>
    </Container>
  );
};

export default ProfilePage; 