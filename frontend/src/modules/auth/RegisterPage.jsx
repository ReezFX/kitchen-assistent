import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '../../shared/hooks/useAuth';
import { useTheme } from '../../shared/context/ThemeContext';
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
  background-color: ${({ theme }) => 
    theme === 'dark' 
      ? 'rgba(22, 22, 24, 0.95)' 
      : 'rgba(255, 255, 255, 0.95)'
  };
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid ${({ theme }) => 
    theme === 'dark' 
      ? 'rgba(255, 255, 255, 0.08)' 
      : 'var(--color-gray-200)'
  };
  padding: 2rem;
  border-radius: 20px;
  position: relative;
  overflow: hidden;
  box-shadow: ${({ theme }) => 
    theme === 'dark'
      ? '0 10px 30px rgba(0, 0, 0, 0.3)'
      : '0 10px 40px rgba(0, 0, 0, 0.1)'
  };
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: ${({ theme }) => 
    theme === 'dark'
      ? '0 14px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.08)'
      : '0 14px 50px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)'
    };
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: linear-gradient(90deg, var(--color-primary), var(--color-accent));
  }
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
    background-clip: text;
    text-fill-color: transparent;
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
  
  input {
    border-radius: 10px;
    padding: 12px 16px;
    font-size: 15px;
    transition: all 0.3s ease;
    background-color: ${({ theme }) => 
      theme === 'dark' ? 'rgba(40, 40, 44, 0.5)' : 'white'
    };
    border: 1px solid ${({ theme }) => 
      theme === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'var(--color-gray-200)'
    };
    color: ${({ theme }) => 
      theme === 'dark' ? 'rgba(255, 255, 255, 0.95)' : 'var(--color-text-primary)'
    };
    width: 100%;
    
    &:focus {
      transform: translateY(-1px);
      box-shadow: 0 4px 10px rgba(var(--color-primary-rgb), 0.15);
      border-color: var(--color-primary);
      background-color: ${({ theme }) => 
        theme === 'dark' ? 'rgba(50, 50, 55, 0.7)' : 'white'
      };
      outline: none;
    }
    
    &::placeholder {
      opacity: ${({ theme }) => theme === 'dark' ? 0.6 : 0.5};
      color: ${({ theme }) => theme === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'inherit'};
    }
  }
  
  label {
    font-weight: 500;
    margin-bottom: 8px;
    display: block;
    color: ${({ theme }) => 
      theme === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'var(--color-text-secondary)'
    };
    transition: color 0.3s ease;
  }
`;

const ErrorMessage = styled.div`
  background-color: ${({ theme }) => 
    theme === 'dark' 
      ? 'rgba(220, 38, 38, 0.2)' 
      : 'var(--color-danger-hover)'
  };
  color: ${({ theme }) => 
    theme === 'dark' 
      ? '#f87171' 
      : 'var(--color-danger)'
  };
  padding: 1rem;
  border-radius: 12px;
  margin-bottom: 1rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  border: 1px solid ${({ theme }) => 
    theme === 'dark' 
      ? 'rgba(220, 38, 38, 0.3)' 
      : 'transparent'
  };
  
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
    position: relative;
    transition: color 0.3s ease;
    
    &::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      width: 0;
      height: 1px;
      background-color: var(--color-primary);
      transition: width 0.3s ease;
    }
    
    &:hover {
      text-decoration: none;
      
      &::after {
        width: 100%;
      }
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
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateX(5px);
  }
`;

const FeatureIcon = styled.div`
  font-size: 1.5rem;
  margin-right: 1rem;
  color: var(--color-primary);
  opacity: ${({ theme }) => theme === 'dark' ? 0.9 : 1};
  filter: ${({ theme }) => theme === 'dark' ? 'drop-shadow(0 0 8px rgba(var(--color-primary-rgb), 0.4))' : 'none'};
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
  opacity: ${({ theme }) => theme === 'dark' ? 0.15 : 0.2};
  
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
  opacity: ${({ theme }) => theme === 'dark' ? 0.1 : 0.15};
  filter: ${({ theme }) => theme === 'dark' ? 'blur(40px)' : 'blur(30px)'};
  
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

const SlideContainer = styled.div`
  height: 300px;
  border-radius: 20px;
  margin-bottom: 2rem;
  position: relative;
  overflow: hidden;
  box-shadow: ${({ theme }) => 
    theme === 'dark'
      ? '0 10px 30px rgba(0, 0, 0, 0.3), 0 0 50px rgba(var(--color-primary-rgb), 0.15)'
      : '0 10px 30px rgba(0, 0, 0, 0.15)'
  };
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: ${({ theme }) => 
      theme === 'dark'
        ? '0 15px 40px rgba(0, 0, 0, 0.4), 0 0 60px rgba(var(--color-primary-rgb), 0.2)'
        : '0 15px 40px rgba(0, 0, 0, 0.2)'
    };
  }
  
  @media (min-width: 1024px) {
    height: 400px;
  }
`;

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: scale(1.05) translateX(5%);
  }
  to {
    opacity: 1;
    transform: scale(1) translateX(0);
  }
`;

const slideOut = keyframes`
  0% {
    opacity: 1;
    transform: scale(1) translateX(0);
  }
  100% {
    opacity: 0;
    transform: scale(0.95) translateX(-5%);
  }
`;

const Slide = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url(${props => props.image});
  background-size: cover;
  background-position: center;
  animation: ${props => props.entering ? slideIn : (props.exiting ? slideOut : 'none')} 0.9s ease forwards;
  animation-delay: ${props => props.exiting ? '0.1s' : '0s'};
  opacity: ${props => props.active || props.exiting ? 1 : 0};
  z-index: ${props => props.active ? 2 : (props.exiting ? 1 : 0)};
`;

const RecipeTitle = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background: linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0));
  color: white;
  padding: 1.5rem;
  font-weight: 600;
  z-index: 3;
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
  display: flex;
  flex-direction: column;
  
  span {
    font-size: 0.9rem;
    opacity: 0.9;
    margin-top: 5px;
    font-weight: 400;
  }
`;

const ProgressBar = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  right: 10px;
  height: 3px;
  background: rgba(255, 255, 255, 0.3);
  z-index: 3;
  border-radius: 2px;
  overflow: hidden;
`;

const Progress = styled.div`
  height: 100%;
  background-color: var(--color-primary);
  width: ${props => props.progress}%;
  transition: width 0.1s linear;
`;

const StyledGradientButton = styled(GradientButton)`
  margin-top: 0.5rem;
  font-size: 1rem;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.7s ease;
    z-index: 1;
  }
  
  &:hover::before {
    left: 100%;
  }
`;

const FormHeader = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: ${({ theme }) => 
    theme === 'dark' ? 'rgba(255, 255, 255, 0.95)' : 'var(--color-text-primary)'
  };
  position: relative;
  display: inline-block;
  
  &::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: -8px;
    width: 40px;
    height: 3px;
    background: var(--color-primary);
    border-radius: 3px;
  }
`;

const RecipeSlideshow = ({ theme }) => {
  const recipes = [
    { 
      id: 1, 
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
      title: 'Frischer Gemüsesalat',
      description: 'Knackiges Gemüse mit Quinoa und Avocado'
    },
    { 
      id: 2, 
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38',
      title: 'Hausgemachte Pizza',
      description: 'Mit frischem Basilikum und Büffelmozzarella'
    },
    { 
      id: 3, 
      image: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543',
      title: 'Gebratener Lachs',
      description: 'Mit Zitrone und Kräutern auf Gemüsebett'
    },
    { 
      id: 4, 
      image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836',
      title: 'Mediterranes Grillgericht',
      description: 'Mit Oliven, Feta und frischen Kräutern'
    },
    { 
      id: 5, 
      image: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601',
      title: 'Frühstücks-Bowl',
      description: 'Mit Joghurt, frischen Früchten und Granola'
    }
  ];

  const SLIDE_DURATION = 8000; // 8 seconds per slide
  const ANIMATION_DURATION = 1000; // Animation duration in ms
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const [prevSlide, setPrevSlide] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef(null);
  const progressIntervalRef = useRef(null);

  const goToNextSlide = useCallback(() => {
    if (!isAnimating) {
      setIsAnimating(true);
      setPrevSlide(currentSlide);
      
      // Set the new slide index
      setCurrentSlide((prev) => (prev + 1) % recipes.length);
      
      // Keep progress bar at 100% during transition
      setProgress(100);
      
      // Reset progress after animation completes
      setTimeout(() => {
        setProgress(0);
        setIsAnimating(false);
      }, ANIMATION_DURATION);
      
      // Keep the previous slide reference a bit longer for the animation
      setTimeout(() => {
        setPrevSlide(null);
      }, ANIMATION_DURATION + 200);
    }
  }, [currentSlide, isAnimating, recipes.length]);

  useEffect(() => {
    // Don't start progress animation during slide transition
    if (isAnimating) return;
    
    // Start the progress animation
    const progressStep = 100 / (SLIDE_DURATION / 50); // Calculate progress increment
    
    progressIntervalRef.current = setInterval(() => {
      setProgress(prev => {
        // When progress reaches 100, trigger slide change
        if (prev >= 100) {
          goToNextSlide();
          return 100; // Keep at 100% during transition
        }
        return prev + progressStep;
      });
    }, 50);
    
    // Clean up interval on unmount or when dependencies change
    return () => {
      clearInterval(progressIntervalRef.current);
    };
  }, [goToNextSlide, isAnimating]);

  // Set up slide change timer
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      // This is a backup timer in case the progress-based trigger fails
      if (progress >= 99 && !isAnimating) {
        goToNextSlide();
      }
    }, SLIDE_DURATION);

    return () => {
      clearInterval(intervalRef.current);
    };
  }, [goToNextSlide, progress, isAnimating]);

  return (
    <SlideContainer theme={theme}>
      <ProgressBar>
        <Progress progress={progress} />
      </ProgressBar>
      
      {recipes.map((recipe, index) => (
        (index === currentSlide || index === prevSlide) && (
          <Slide 
            key={recipe.id}
            image={recipe.image}
            active={index === currentSlide}
            entering={index === currentSlide && prevSlide !== null}
            exiting={index === prevSlide}
          />
        )
      ))}
      
      <RecipeTitle>
        {recipes[currentSlide].title}
        <span>{recipes[currentSlide].description}</span>
      </RecipeTitle>
    </SlideContainer>
  );
};

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
  const { theme } = useTheme();

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
    
    // Validate form
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      setFormError('Bitte fülle alle Felder aus');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setFormError('Die Passwörter stimmen nicht überein');
      return;
    }
    
    if (formData.password.length < 8) {
      setFormError('Das Passwort muss mindestens 8 Zeichen lang sein');
      return;
    }
    
    try {
      await register(formData.username, formData.email, formData.password);
      navigate('/');
    } catch (err) {
      console.error('Registration error:', err);
      // Error is handled by the auth context
    }
  };

  return (
    <PageContainer>
      <LeftSection>
        <Title>
          Beginne deine <span>kulinarische Reise</span>
        </Title>
        <Subtitle>
          Registriere dich jetzt und entdecke eine Welt voller köstlicher Rezepte, die auf dich warten.
        </Subtitle>
        
        <RecipeSlideshow theme={theme} />
        
        <FeatureList>
          <FeatureItem>
            <FeatureIcon theme={theme}>🔍</FeatureIcon>
            <FeatureText>
              <FeatureTitle>Entdecke neue Rezepte</FeatureTitle>
              <FeatureDescription>
                Stöbere durch Tausende von Rezepten und finde deine nächste kulinarische Inspiration.
              </FeatureDescription>
            </FeatureText>
          </FeatureItem>
          
          <FeatureItem>
            <FeatureIcon theme={theme}>🔖</FeatureIcon>
            <FeatureText>
              <FeatureTitle>Speichere deine Favoriten</FeatureTitle>
              <FeatureDescription>
                Bewahre alle deine Lieblingsrezepte an einem Ort auf und greife jederzeit darauf zu.
              </FeatureDescription>
            </FeatureText>
          </FeatureItem>
          
          <FeatureItem>
            <FeatureIcon theme={theme}>🍽️</FeatureIcon>
            <FeatureText>
              <FeatureTitle>Plane deine Mahlzeiten</FeatureTitle>
              <FeatureDescription>
                Erstelle Wochenpläne und organisiere deine Einkäufe mühelos mit unserer Planungshilfe.
              </FeatureDescription>
            </FeatureText>
          </FeatureItem>
        </FeatureList>
      </LeftSection>
      
      <RightSection>
        <CardWrapper>
          <CircleDecoration className="circle1" theme={theme} />
          <CircleDecoration className="circle2" theme={theme} />
          
          <FormCard theme={theme}>
            <Form onSubmit={handleSubmit}>
              <FormHeader theme={theme}>Registrieren</FormHeader>
              
              {(error || formError) && (
                <ErrorMessage theme={theme}>{formError || error}</ErrorMessage>
              )}
              
              <InputWrapper theme={theme}>
                <label htmlFor="username">Benutzername</label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Dein Benutzername"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </InputWrapper>
              
              <InputWrapper theme={theme}>
                <label htmlFor="email">E-Mail</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="deine.email@beispiel.de"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </InputWrapper>
              
              <InputWrapper theme={theme}>
                <label htmlFor="password">Passwort</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Mindestens 8 Zeichen"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </InputWrapper>
              
              <InputWrapper theme={theme}>
                <label htmlFor="confirmPassword">Passwort bestätigen</label>
                <input
                  id="confirmPassword"
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
                {loading ? 'Registrierung läuft...' : 'Registrieren'}
              </StyledGradientButton>
              
              <LinkContainer>
                Bereits ein Konto?<Link to="/login">Anmelden</Link>
              </LinkContainer>
            </Form>
          </FormCard>
        </CardWrapper>
      </RightSection>
    </PageContainer>
  );
};

export default RegisterPage; 