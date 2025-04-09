import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Card from '../../shared/components/common/Card';
import Button from '../../shared/components/common/Button';
import Input from '../../shared/components/common/Input';
import { useAuth } from '../../shared/hooks/useAuth';

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

const SuccessMessage = styled.div`
  background-color: #ecfdf5;
  color: #10b981;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 16px;
`;

const ErrorMessage = styled.div`
  background-color: #fee2e2;
  color: #ef4444;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 16px;
`;

const ProfilePage = () => {
  const { user, updateProfile, loading, error } = useAuth();
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    preferences: {
      dietaryRestrictions: '',
      favoriteCuisines: '',
      cookingSkillLevel: 'intermediate',
      language: 'de'
    }
  });

  // Load user data when component mounts
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        preferences: {
          dietaryRestrictions: user.preferences?.dietaryRestrictions?.join(', ') || '',
          favoriteCuisines: user.preferences?.favoriteCuisines?.join(', ') || '',
          cookingSkillLevel: user.preferences?.cookingSkillLevel || 'intermediate',
          language: 'de' // Default language
        }
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(false);
    
    try {
      // Format preferences for API
      const formattedPreferences = {
        ...formData.preferences,
        dietaryRestrictions: formData.preferences.dietaryRestrictions
          ? formData.preferences.dietaryRestrictions.split(',').map(item => item.trim())
          : [],
        favoriteCuisines: formData.preferences.favoriteCuisines
          ? formData.preferences.favoriteCuisines.split(',').map(item => item.trim())
          : []
      };
      
      await updateProfile({
        username: formData.username,
        email: formData.email,
        preferences: formattedPreferences
      });
      
      setSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
    }
  };

  return (
    <Container>
      <Title>Benutzerprofil</Title>
      <Description>
        Verwalte deine persönlichen Einstellungen und Präferenzen für ein individuelles Kocherlebnis.
      </Description>
      
      <Card title="Deine Einstellungen">
        <Form onSubmit={handleSubmit}>
          {success && (
            <SuccessMessage>Deine Einstellungen wurden erfolgreich gespeichert!</SuccessMessage>
          )}
          
          {error && (
            <ErrorMessage>{error}</ErrorMessage>
          )}
          
          <div>
            <SectionTitle>Persönliche Informationen</SectionTitle>
            <Input 
              label="Name"
              name="username"
              placeholder="Dein Name"
              value={formData.username}
              onChange={handleChange}
            />
            <Input 
              label="E-Mail"
              name="email"
              type="email"
              placeholder="deine.email@beispiel.de"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          
          <div>
            <SectionTitle>Kochpräferenzen</SectionTitle>
            <PreferencesGrid>
              <div>
                <label>Ernährungsweise</label>
                <Input
                  name="preferences.dietaryRestrictions"
                  placeholder="z.B. Vegetarisch, Vegan, Glutenfrei"
                  value={formData.preferences.dietaryRestrictions}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label>Bevorzugte Küche</label>
                <Input
                  name="preferences.favoriteCuisines"
                  placeholder="z.B. Italienisch, Asiatisch, Indisch"
                  value={formData.preferences.favoriteCuisines}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label>Kochfähigkeiten</label>
                <select 
                  name="preferences.cookingSkillLevel"
                  value={formData.preferences.cookingSkillLevel}
                  onChange={handleChange}
                >
                  <option value="beginner">Anfänger</option>
                  <option value="intermediate">Mittelstufe</option>
                  <option value="advanced">Fortgeschritten</option>
                </select>
              </div>
              
              <div>
                <label>Bevorzugte Sprache</label>
                <select 
                  name="preferences.language"
                  value={formData.preferences.language}
                  onChange={handleChange}
                >
                  <option value="de">Deutsch</option>
                  <option value="en">Englisch</option>
                  <option value="fr">Französisch</option>
                  <option value="es">Spanisch</option>
                  <option value="it">Italienisch</option>
                </select>
              </div>
            </PreferencesGrid>
          </div>
          
          <Button 
            type="submit"
            disabled={loading}
          >
            {loading ? 'Speichern...' : 'Einstellungen speichern'}
          </Button>
        </Form>
      </Card>
    </Container>
  );
};

export default ProfilePage; 