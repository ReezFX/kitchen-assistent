import React from 'react';
import styled from 'styled-components';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

const HeaderContainer = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 100;
  background-color: var(--color-background-translucent);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  /* Fallback for browsers that don't support backdrop-filter */
  @supports not ((-webkit-backdrop-filter: blur(10px)) or (backdrop-filter: blur(10px))) {
    background-color: var(--color-background);
  }
  box-shadow: ${({ $isScrolled }) => 
    $isScrolled ? '0 2px 8px rgba(0, 0, 0, 0.1)' : 'none'};
  transition: box-shadow 0.3s ease, background-color 0.3s ease;
  height: 40px; /* Reduced height */
  
  /* Only show on mobile */
  @media (min-width: 769px) {
    display: none;
  }
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 0 16px;
`;

const PageTitle = styled(motion.h1)`
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
  text-align: center;
`;

// GradientText component for a more appealing header title
const GradientText = styled.span`
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: inline-block;
  font-weight: 700;
`;

// Define page titles for each route
const getPageTitle = (pathname) => {
  // Extract the first segment of the path
  const path = pathname.split('/')[1] || '/';
  
  // Map routes to titles
  switch (path) {
    case '/':
      return 'Home';
    case 'recipes':
      return 'Rezepte';
    case 'profile':
      return 'Profil';
    case 'login':
      return 'Anmelden';
    case 'register':
      return 'Registrieren';
    case 'about':
      return 'Über uns';
    case 'settings':
      return 'Einstellungen';
    default:
      // Check if this is a recipe detail page
      if (pathname.startsWith('/recipes/')) {
        return 'Rezept Details';
      }
      return 'Kitchen Assistant';
  }
};

const MobileHeader = () => {
  const { theme } = useTheme();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = React.useState(false);
  
  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  // Get the title for current route
  const pageTitle = getPageTitle(location.pathname);
  
  return (
    <HeaderContainer $isScrolled={isScrolled} data-theme={theme}>
      <HeaderContent>
        <PageTitle
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <GradientText>{pageTitle}</GradientText>
        </PageTitle>
      </HeaderContent>
    </HeaderContainer>
  );
};

export default MobileHeader; 