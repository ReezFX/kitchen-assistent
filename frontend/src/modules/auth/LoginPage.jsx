import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '../../shared/hooks/useAuth';
import { useTheme } from '../../shared/context/ThemeContext';
import Card from '../../shared/components/common/Card';
import Button from '../../shared/components/common/Button';
import Input from '../../shared/components/common/Input';

// Animations
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const PageWrapper = styled.div`
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  overflow: hidden;
`;

const Container = styled.div`
  max-width: 420px;
  width: 100%;
  z-index: 1;
`;

const Logo = styled.div`
  text-align: center;
  margin-bottom: 25px;
  opacity: 0;
  animation: ${fadeIn} 0.7s ease forwards;
  
  svg {
    height: 70px;
    width: auto;
    filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
    transition: transform 0.3s ease;
    
    &:hover {
      transform: scale(1.05);
    }
  }
`;

const LoginCard = styled(Card)`
  backdrop-filter: blur(10px);
  background-color: ${({ theme }) => 
    theme === 'dark' 
      ? 'rgba(30, 30, 30, 0.8)' 
      : 'rgba(255, 255, 255, 0.8)'
  };
  background-image: ${({ theme }) => 
    theme === 'dark'
      ? 'linear-gradient(135deg, rgba(40, 40, 40, 0.9), rgba(20, 20, 20, 0.6))'
      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(245, 245, 245, 0.8))'
  };
  background-size: 400px 400px;
  background-position: center;
  background-blend-mode: overlay;
  border-radius: 16px;
  box-shadow: ${({ theme }) => 
    theme === 'dark'
      ? '0 10px 20px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1), 0 0 40px rgba(255, 130, 67, 0.05)'
      : '0 10px 20px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05), 0 0 40px rgba(255, 130, 67, 0.1)'
  };
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  position: relative;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: ${({ theme }) => 
    theme === 'dark'
      ? '0 14px 28px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.15), 0 0 50px rgba(255, 130, 67, 0.08)'
      : '0 14px 28px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.07), 0 0 50px rgba(255, 130, 67, 0.15)'
    };
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: ${({ theme }) => 
      theme === 'dark'
        ? `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100' fill='%23ffffff' opacity='0.03'%3E%3Cpath d='M30,40 C35,40 40,35 40,30 C40,25 35,20 30,20 C25,20 20,25 20,30 C20,35 25,40 30,40 Z M50,80 C55,80 60,75 60,70 C60,65 55,60 50,60 C45,60 40,65 40,70 C40,75 45,80 50,80 Z M70,40 C75,40 80,35 80,30 C80,25 75,20 70,20 C65,20 60,25 60,30 C60,35 65,40 70,40 Z'/%3E%3C/svg%3E")`
        : `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100' fill='%23FF8243' opacity='0.05'%3E%3Cpath d='M30,40 C35,40 40,35 40,30 C40,25 35,20 30,20 C25,20 20,25 20,30 C20,35 25,40 30,40 Z M50,80 C55,80 60,75 60,70 C60,65 55,60 50,60 C45,60 40,65 40,70 C40,75 45,80 50,80 Z M70,40 C75,40 80,35 80,30 C80,25 75,20 70,20 C65,20 60,25 60,30 C60,35 65,40 70,40 Z'/%3E%3C/svg%3E")`
    };
    opacity: 0.4;
    z-index: -1;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 5px;
    background: linear-gradient(90deg, var(--color-primary), var(--color-accent));
  }
`;

// Add a GradientText component
const GradientText = styled.span`
  background: linear-gradient(90deg, var(--color-primary), var(--color-accent));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
`;

const NormalText = styled.span`
  color: var(--color-text-primary);
  margin-left: 8px;
`;

const Title = styled.h1`
  font-size: 32px;
  margin-bottom: 12px;
  text-align: center;
  font-weight: 700;
  letter-spacing: -0.5px;
  opacity: 0;
  animation: ${fadeIn} 0.7s ease forwards;
  display: flex;
  justify-content: center;
  align-items: baseline;
  flex-wrap: wrap;
`;

const Subtitle = styled.p`
  color: var(--color-text-secondary);
  text-align: center;
  margin-bottom: 32px;
  font-size: 16px;
  font-weight: 400;
  letter-spacing: -0.2px;
  opacity: 0;
  animation: ${fadeIn} 0.7s ease forwards 0.1s;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormElement = styled.div`
  opacity: 0;
  animation: ${fadeIn} 0.5s ease forwards;
  animation-delay: ${props => props.delay}s;
  position: relative;
  z-index: 1;
  
  &:focus-within label {
    color: var(--color-primary);
    transform: translateY(-2px);
  }
`;

const Error = styled.div`
  background-color: ${({ theme }) => 
    theme === 'dark' 
      ? 'rgba(220, 38, 38, 0.2)' 
      : '#fee2e2'
  };
  color: ${({ theme }) => 
    theme === 'dark' 
      ? '#f87171' 
      : '#ef4444'
  };
  padding: 12px 16px;
  border-radius: 10px;
  margin-bottom: 16px;
  font-size: 14px;
  border: 1px solid ${({ theme }) => 
    theme === 'dark' 
      ? 'rgba(220, 38, 38, 0.3)' 
      : 'rgba(220, 38, 38, 0.2)'
  };
  backdrop-filter: blur(8px);
  animation: ${fadeIn} 0.5s ease forwards;
`;

const StyledButton = styled(Button)`
  height: 48px;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.3s ease;
  background: ${props => props.theme === 'dark' 
    ? 'linear-gradient(145deg, var(--color-primary), var(--color-primary-dark))' 
    : 'var(--color-primary)'};
  position: relative;
  overflow: hidden;
  z-index: 1;
    
  &:active {
    transform: scale(0.98);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.7s ease;
    z-index: -1;
  }
  
  &:hover::before {
    left: 100%;
  }
`;

const LinkContainer = styled.div`
  text-align: center;
  margin-top: 24px;
  font-size: 14px;
  color: var(--color-text-secondary);
  opacity: 0;
  animation: ${fadeIn} 0.5s ease forwards 0.7s;
  
  a {
    color: var(--color-primary);
    font-weight: 500;
    margin-left: 5px;
    transition: all 0.3s ease;
    position: relative;
    
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
      opacity: 0.8;
      text-decoration: none;
      
      &::after {
        width: 100%;
      }
    }
  }
`;

const RememberMeContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 5px;
  opacity: 0;
  animation: ${fadeIn} 0.5s ease forwards;
  animation-delay: 0.6s;
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  
  input {
    margin-right: 8px;
    position: relative;
    appearance: none;
    width: 16px;
    height: 16px;
    border: 1px solid ${({ theme }) => 
      theme === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)'
    };
    border-radius: 4px;
    outline: none;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:checked {
      background-color: var(--color-primary);
      border-color: var(--color-primary);
      
      &::after {
        content: '';
        position: absolute;
        top: 2px;
        left: 5px;
        width: 5px;
        height: 10px;
        border: solid white;
        border-width: 0 2px 2px 0;
        transform: rotate(45deg);
      }
    }
    
    &:hover {
      border-color: var(--color-primary);
    }
  }
  
  label {
    font-size: 14px;
    color: var(--color-text-secondary);
    cursor: pointer;
  }
`;

const ForgotPassword = styled(Link)`
  font-size: 14px;
  color: var(--color-text-secondary);
  transition: all 0.3s ease;
  position: relative;
  
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
    color: var(--color-primary);
    text-decoration: none;
    
    &::after {
      width: 100%;
    }
  }
`;

const OrDivider = styled.div`
  position: relative;
  text-align: center;
  margin: 25px 0;
  opacity: 0;
  animation: ${fadeIn} 0.5s ease forwards;
  animation-delay: 0.7s;
  
  &::before {
    content: "";
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 1px;
    background-color: ${({ theme }) => 
      theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
    };
  }
  
  span {
    position: relative;
    background-color: ${({ theme }) => 
      theme === 'dark' ? 'rgba(30, 30, 30, 0.8)' : 'rgba(255, 255, 255, 0.8)'
    };
    padding: 0 15px;
    font-size: 14px;
    color: var(--color-text-secondary);
  }
`;

const DecorationCircle = styled.div`
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(45deg, var(--color-primary), var(--color-primary-light));
  opacity: ${props => props.theme === 'dark' ? 0.3 : 0.2};
  filter: blur(50px);
  z-index: 0;
  animation: ${float} 6s ease-in-out infinite;
  animation-delay: ${props => props.delay || 0}s;
`;

const DecorativeDot = styled.div`
  position: absolute;
  width: ${props => props.size || 6}px;
  height: ${props => props.size || 6}px;
  border-radius: 50%;
  background-color: ${props => props.color || 'var(--color-primary)'};
  opacity: ${props => props.theme === 'dark' ? 0.5 : 0.7};
  z-index: 0;
  animation: ${props => props.animation === 'float' ? float : pulse} ${props => props.duration || 6}s ease-in-out infinite;
  animation-delay: ${props => props.delay || 0}s;
`;

const AppInfo = styled.div`
  text-align: center;
  margin-top: 30px;
  font-size: 12px;
  color: var(--color-text-secondary);
  opacity: 0.7;
  opacity: 0;
  animation: ${fadeIn} 0.5s ease forwards 0.9s;
  
  a {
    color: var(--color-primary);
    font-weight: 500;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

// Add styled Input component
const StyledInput = styled(Input)`
  label {
    font-weight: 500;
    transition: color 0.3s ease, transform 0.3s ease;
  }
  
  input {
    border-radius: 10px;
    padding: 12px 16px;
    font-size: 15px;
    transition: all 0.3s ease;
    background-color: ${({ theme }) => 
      theme === 'dark' ? 'rgba(20, 20, 20, 0.6)' : 'rgba(255, 255, 255, 0.8)'
    };
    border: 1px solid ${({ theme }) => 
      theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'
    };
    
    &:focus {
      transform: translateY(-1px);
      box-shadow: 0 4px 10px rgba(var(--color-primary-rgb), 0.1);
      border-color: var(--color-primary);
    }
    
    &::placeholder {
      opacity: 0.5;
    }
  }
`;

// Add food-related decorative elements
const FoodIcon = styled.div`
  position: absolute;
  width: ${props => props.size || '32px'};
  height: ${props => props.size || '32px'};
  opacity: ${props => props.theme === 'dark' ? 0.5 : 0.7};
  z-index: 0;
  transform: rotate(${props => props.rotate || '0deg'});
  transition: transform 0.3s ease;
  
  svg {
    width: 100%;
    height: 100%;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
  }
  
  &:hover {
    transform: rotate(${props => props.rotate || '0deg'}) scale(1.1);
  }
`;

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [formError, setFormError] = useState('');
  const [mounted, setMounted] = useState(false);
  
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();
  const { theme } = useTheme();
  
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    // Validation
    if (!formData.email || !formData.password) {
      setFormError('Bitte gib deine E-Mail und dein Passwort ein');
      return;
    }
    
    try {
      await login(formData.email, formData.password, formData.rememberMe);
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      // Error is handled by the auth context and displayed below
    }
  };

  return (
    <PageWrapper>
      <Container>
        <Logo>
          <svg viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <path d="M30 20C38.2843 20 45 26.7157 45 35C45 43.2843 38.2843 50 30 50C21.7157 50 15 43.2843 15 35C15 26.7157 21.7157 20 30 20Z" fill="var(--color-primary)" filter="url(#glow)"/>
            <path d="M70 10C78.2843 10 85 16.7157 85 25C85 33.2843 78.2843 40 70 40C61.7157 40 55 33.2843 55 25C55 16.7157 61.7157 10 70 10Z" fill="var(--color-accent)" fillOpacity="0.8" filter="url(#glow)"/>
            <path d="M60 30C68.2843 30 75 36.7157 75 45C75 53.2843 68.2843 60 60 60C51.7157 60 45 53.2843 45 45C45 36.7157 51.7157 30 60 30Z" fill="var(--color-primary-dark)" fillOpacity="0.9" filter="url(#glow)"/>
          </svg>
        </Logo>
        
        {/* Food decorative elements */}
        <FoodIcon 
          style={{ top: '15%', left: '5%' }}
          size="30px"
          rotate="-15deg"
          theme={theme}
        >
          <svg viewBox="0 0 24 24" fill={theme === 'dark' ? 'var(--color-primary-light)' : 'var(--color-primary)'}>
            <path d="M8.1,13.34L3.91,9.16C2.35,7.59 2.35,5.06 3.91,3.5L10.93,10.5L8.1,13.34M14.88,11.53L13.41,13L20.29,19.88L18.88,21.29L12,14.41L5.12,21.29L3.71,19.88L13.47,10.12C12.76,8.59 13.26,6.44 14.85,4.85C16.76,2.93 19.5,2.57 20.96,4.03C22.43,5.5 22.07,8.24 20.15,10.15C18.56,11.74 16.41,12.24 14.88,11.53Z" />
          </svg>
        </FoodIcon>

        <FoodIcon 
          style={{ top: '20%', right: '7%' }}
          size="36px"
          rotate="10deg"
          theme={theme}
        >
          <svg viewBox="0 0 24 24" fill={theme === 'dark' ? 'var(--color-accent)' : 'var(--color-accent)'}>
            <path d="M15.5,21L14,8H16.23L15.1,3.46L16.84,3L18.09,8H22L20.5,21H15.5M5,11H10A3,3 0 0,1 13,14H2A3,3 0 0,1 5,11M13,18V21H2V18H13M3,15H12V17H3V15Z" />
          </svg>
        </FoodIcon>

        <FoodIcon 
          style={{ bottom: '15%', left: '7%' }}
          size="32px"
          rotate="-5deg"
          theme={theme}
        >
          <svg viewBox="0 0 24 24" fill={theme === 'dark' ? 'var(--color-maize)' : 'var(--color-maize)'}>
            <path d="M4,3H20A1,1 0 0,1 21,4V5H3V4A1,1 0 0,1 4,3M3,9H21V10H3V9M3,14H21V15H3V14M3,19H21V20A1,1 0 0,1 20,21H4A1,1 0 0,1 3,20V19Z" />
          </svg>
        </FoodIcon>

        <FoodIcon 
          style={{ bottom: '20%', right: '6%' }}
          size="28px"
          rotate="15deg"
          theme={theme}
        >
          <svg viewBox="0 0 24 24" fill={theme === 'dark' ? 'var(--color-primary)' : 'var(--color-primary-dark)'}>
            <path d="M8.1,13.34L3.91,9.16C2.35,7.59 2.35,5.06 3.91,3.5L10.93,10.5L8.1,13.34M14.88,11.53L13.41,13L20.29,19.88L18.88,21.29L12,14.41L5.12,21.29L3.71,19.88L13.47,10.12C12.76,8.59 13.26,6.44 14.85,4.85C16.76,2.93 19.5,2.57 20.96,4.03C22.43,5.5 22.07,8.24 20.15,10.15C18.56,11.74 16.41,12.24 14.88,11.53Z" />
          </svg>
        </FoodIcon>

        <Title>
          <GradientText>Willkommen</GradientText>
          <NormalText>zurück</NormalText>
        </Title>
        <Subtitle>Melde dich an, um deine Kochreise fortzusetzen</Subtitle>
        
        <LoginCard theme={theme}>
          <Form onSubmit={handleSubmit}>
            {(error || formError) && (
              <Error theme={theme}>{formError || error}</Error>
            )}
            
            <FormElement delay={0.3}>
              <StyledInput
                label="E-Mail"
                name="email"
                type="email"
                placeholder="deine.email@beispiel.de"
                value={formData.email}
                onChange={handleChange}
                required
                theme={theme}
              />
            </FormElement>
            
            <FormElement delay={0.4}>
              <StyledInput
                label="Passwort"
                name="password"
                type="password"
                placeholder="Dein Passwort"
                value={formData.password}
                onChange={handleChange}
                required
                theme={theme}
              />
              
              <RememberMeContainer>
                <CheckboxContainer>
                  <input
                    type="checkbox"
                    id="rememberMe"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                  />
                  <label htmlFor="rememberMe">Angemeldet bleiben</label>
                </CheckboxContainer>
                
                <ForgotPassword to="/forgot-password">
                  Passwort vergessen?
                </ForgotPassword>
              </RememberMeContainer>
            </FormElement>
            
            <FormElement delay={0.5}>
              <StyledButton 
                type="submit" 
                $fullWidth 
                disabled={loading}
                theme={theme}
              >
                {loading ? 'Anmelden...' : 'Anmelden'}
              </StyledButton>
            </FormElement>
          </Form>
          
          <LinkContainer>
            Noch kein Konto? <Link to="/register">Registrieren</Link>
          </LinkContainer>
        </LoginCard>
        
        <AppInfo>
          <p>© 2025 Kitchen Assistant • <Link to="/privacy">Datenschutz</Link> • <Link to="/terms">Nutzungsbedingungen</Link></p>
        </AppInfo>
      </Container>
    </PageWrapper>
  );
};

export default LoginPage; 