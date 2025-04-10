import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../shared/hooks/useAuth';
import Card from '../../shared/components/common/Card';
import Button from '../../shared/components/common/Button';
import Input from '../../shared/components/common/Input';
import { GradientButton } from '../../shared/components/ui/GradientButton';
import { GlowingEffect } from '../../shared/components/ui/GlowingEffect';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 100px);
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  
  @media (min-width: 1024px) {
    flex-direction: row;
    align-items: center;
    gap: 4rem;
  }
`;

const LeftSection = styled.div`
  flex: 1;
  margin-bottom: 2rem;
  
  @media (min-width: 1024px) {
    margin-bottom: 0;
  }
`;

const RightSection = styled.div`
  flex: 1;
  position: relative;
`;

const FormCard = styled(Card)`
  background-color: var(--color-background-translucent);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid var(--color-gray-200);
  padding: 2rem;
  border-radius: 20px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
`;

const CardWrapper = styled.div`
  position: relative;
  border-radius: 20px;
  z-index: 1;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  font-weight: 800;
  color: var(--color-text-primary);
  
  span {
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const Subtitle = styled.p`
  font-size: 1.25rem;
  margin-bottom: 2.5rem;
  color: var(--color-text-secondary);
  max-width: 500px;
  line-height: 1.6;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const InputWrapper = styled.div`
  position: relative;
`;

const ErrorMessage = styled.div`
  background-color: var(--color-danger-hover);
  color: var(--color-danger);
  padding: 1rem;
  border-radius: 12px;
  margin-bottom: 1rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  
  &::before {
    content: "⚠️";
    margin-right: 0.5rem;
  }
`;

const LinkContainer = styled.div`
  text-align: center;
  margin-top: 1.5rem;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  
  a {
    color: var(--color-primary);
    font-weight: 500;
    text-decoration: none;
    margin-left: 0.5rem;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const FeatureList = styled.div`
  margin-top: 3rem;
`;

const FeatureItem = styled.div`
  display: flex;
  align-items: flex-start;
  margin-bottom: 1.5rem;
`;

const FeatureIcon = styled.div`
  font-size: 1.5rem;
  margin-right: 1rem;
  color: var(--color-primary);
`;

const FeatureText = styled.div`
  flex: 1;
`;

const FeatureTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: var(--color-text-primary);
`;

const FeatureDescription = styled.p`
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  line-height: 1.5;
`;

const Background = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: -1;
  overflow: hidden;
  border-radius: 20px;
  opacity: 0.2;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
      url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z' fill='%23FF8C42' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E"),
      radial-gradient(circle at 25% 25%, var(--color-primary-light) 0%, transparent 40%),
      radial-gradient(circle at 75% 75%, var(--color-accent) 0%, transparent 40%);
    z-index: -1;
  }
`;

const CircleDecoration = styled.div`
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-accent) 100%);
  opacity: 0.15;
  
  &.circle1 {
    width: 300px;
    height: 300px;
    top: -150px;
    right: -100px;
  }
  
  &.circle2 {
    width: 200px;
    height: 200px;
    bottom: -100px;
    left: -50px;
  }
`;

const ImagePlaceholder = styled.div`
  height: 300px;
  background: linear-gradient(135deg, var(--color-primary-light), var(--color-accent));
  border-radius: 20px;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  color: white;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  position: relative;
  
  @media (min-width: 1024px) {
    height: 400px;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, transparent 50%);
  }
`;

const StyledGradientButton = styled(GradientButton)`
  margin-top: 0.5rem;
  font-size: 1rem;
`;

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [formError, setFormError] = useState('');
  
  const { register, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    // Validation
    if (!formData.username || !formData.email || !formData.password) {
      setFormError('Bitte fülle alle Felder aus');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwörter stimmen nicht überein');
      return;
    }
    
    if (formData.password.length < 6) {
      setFormError('Passwort muss mindestens 6 Zeichen lang sein');
      return;
    }
    
    try {
      await register(formData.username, formData.email, formData.password);
      navigate('/');
    } catch (err) {
      console.error('Registration error:', err);
      // Error is handled by the auth context and displayed below
    }
  };

  return (
    <PageContainer>
      <LeftSection>
        <Title>
          Dein persönlicher <span>Koch-Assistent</span>
        </Title>
        <Subtitle>
          Erstelle einen Account und entdecke personalisierte Rezepte, automatische Einkaufslisten und vieles mehr!
        </Subtitle>
        
        <CardWrapper>
          <GlowingEffect
            spread={40}
            glow={true}
            disabled={false}
            proximity={64}
            inactiveZone={0.01}
            borderWidth={2}
          />
          <FormCard>
            <Form onSubmit={handleSubmit}>
              {(error || formError) && (
                <ErrorMessage>{formError || error}</ErrorMessage>
              )}
              
              <InputWrapper>
                <Input
                  label="Benutzername"
                  name="username"
                  type="text"
                  placeholder="Dein Benutzername"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </InputWrapper>
              
              <InputWrapper>
                <Input
                  label="E-Mail"
                  name="email"
                  type="email"
                  placeholder="deine.email@beispiel.de"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </InputWrapper>
              
              <InputWrapper>
                <Input
                  label="Passwort"
                  name="password"
                  type="password"
                  placeholder="Dein Passwort"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </InputWrapper>
              
              <InputWrapper>
                <Input
                  label="Passwort bestätigen"
                  name="confirmPassword"
                  type="password"
                  placeholder="Passwort wiederholen"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </InputWrapper>
              
              <StyledGradientButton 
                type="submit" 
                disabled={loading}
              >
                {loading ? 'Registrierung...' : 'Jetzt kostenlos registrieren'}
              </StyledGradientButton>
            </Form>
            
            <LinkContainer>
              Bereits registriert?<Link to="/login">Jetzt anmelden</Link>
            </LinkContainer>
            
            <Background />
            <CircleDecoration className="circle1" />
            <CircleDecoration className="circle2" />
          </FormCard>
        </CardWrapper>
      </LeftSection>
      
      <RightSection>
        <ImagePlaceholder>
          👨‍🍳
        </ImagePlaceholder>
        
        <FeatureList>
          <FeatureItem>
            <FeatureIcon>🍲</FeatureIcon>
            <FeatureText>
              <FeatureTitle>Personalisierte Rezepte</FeatureTitle>
              <FeatureDescription>
                Entdecke Rezepte, die perfekt zu deinen Zutaten und Vorlieben passen.
              </FeatureDescription>
            </FeatureText>
          </FeatureItem>
          
          <FeatureItem>
            <FeatureIcon>🛒</FeatureIcon>
            <FeatureText>
              <FeatureTitle>Automatische Einkaufslisten</FeatureTitle>
              <FeatureDescription>
                Plane deine Mahlzeiten und erstelle automatisch Einkaufslisten für alle benötigten Zutaten.
              </FeatureDescription>
            </FeatureText>
          </FeatureItem>
          
          <FeatureItem>
            <FeatureIcon>💬</FeatureIcon>
            <FeatureText>
              <FeatureTitle>KI-Kochassistent</FeatureTitle>
              <FeatureDescription>
                Erhalte Echtzeit-Unterstützung beim Kochen mit unserem intelligenten Assistenten.
              </FeatureDescription>
            </FeatureText>
          </FeatureItem>
        </FeatureList>
      </RightSection>
    </PageContainer>
  );
};

export default RegisterPage; 