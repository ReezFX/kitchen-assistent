import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaHome, FaUtensils, FaUser, FaPlus, FaBookmark } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';

const NavContainer = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: ${props => props.theme === 'dark' ? 'var(--color-gray-900)' : 'var(--color-paper)'};
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-around;
  z-index: 1000;
  padding: 8px 0 calc(8px + env(safe-area-inset-bottom, 0));
  border-top: 1px solid var(--color-border);
  
  /* Hide on desktop */
  @media (min-width: 769px) {
    display: none;
  }
`;

const NavItem = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  padding: 8px 0;
  flex: 1;
  color: ${props => props.isActive 
    ? 'var(--color-primary)' 
    : 'var(--color-text-secondary)'};
  font-size: 0.75rem;
  font-weight: ${props => props.isActive ? '600' : '500'};
  position: relative;
  transition: color 0.2s ease;
  cursor: pointer;
  
  &:active {
    opacity: 0.7;
  }
`;

const IconWrapper = styled.div`
  position: relative;
  margin-bottom: 4px;
  
  svg {
    font-size: 22px;
    z-index: 2;
    position: relative;
  }
`;

const Label = styled.span`
  font-size: 10px;
  margin-top: 2px;
`;

const Indicator = styled(motion.div)`
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background-color: var(--color-primary);
  position: absolute;
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%);
`;

const AddButton = styled(motion.button)`
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  position: relative;
  bottom: 10px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  
  svg {
    font-size: 20px;
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const MobileBottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { theme } = useTheme();
  
  const isPathActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const handleNavigate = (path) => {
    if (path === '/profile' && !isAuthenticated) {
      navigate('/login');
    } else {
      navigate(path);
    }
  };
  
  // Check if we're already on the RecipesPage
  const isOnRecipesPage = location.pathname === '/recipes';
  
  // Navigate to recipe list directly with a tab parameter
  const handleRecipesNavigate = () => {
    if (isOnRecipesPage) {
      // If we're already on the recipes page, just change the URL
      const params = new URLSearchParams(location.search);
      params.set('tab', 'saved');
      
      // Use replaceState to directly update the URL without navigation
      window.history.replaceState(null, '', `/recipes?${params.toString()}`);
      
      // Create a custom event to notify RecipesPage of the tab change
      const event = new CustomEvent('tabchange', { detail: { tab: 'saved' } });
      window.dispatchEvent(event);
    } else {
      // Otherwise navigate to recipes with a query parameter
      navigate('/recipes?tab=saved');
    }
  };
  
  // Navigate to recipe generator
  const handleGeneratorNavigate = () => {
    if (isOnRecipesPage) {
      // If we're already on the recipes page, just change the URL
      const params = new URLSearchParams(location.search);
      params.set('tab', 'generator');
      
      // Use replaceState to directly update the URL without navigation
      window.history.replaceState(null, '', `/recipes?${params.toString()}`);
      
      // Create a custom event to notify RecipesPage of the tab change
      const event = new CustomEvent('tabchange', { detail: { tab: 'generator' } });
      window.dispatchEvent(event);
    } else {
      // Otherwise navigate
      navigate('/recipes?tab=generator');
    }
  };
  
  return (
    <NavContainer theme={theme}>
      <NavItem 
        isActive={isPathActive('/')}
        onClick={() => handleNavigate('/')}
      >
        <IconWrapper>
          <FaHome />
          {isPathActive('/') && <Indicator layoutId="navIndicator" />}
        </IconWrapper>
        <Label>Home</Label>
      </NavItem>
      
      <NavItem 
        isActive={isPathActive('/recipes')}
        onClick={handleRecipesNavigate}
      >
        <IconWrapper>
          <FaUtensils />
          {isPathActive('/recipes') && <Indicator layoutId="navIndicator" />}
        </IconWrapper>
        <Label>Rezepte</Label>
      </NavItem>
      
      <NavItem>
        <AddButton 
          whileTap={{ scale: 0.92 }}
          onClick={handleGeneratorNavigate}
        >
          <FaPlus />
        </AddButton>
        <Label>&nbsp;</Label>
      </NavItem>
      
      <NavItem 
        isActive={isPathActive('/saved')}
        onClick={() => isAuthenticated ? handleRecipesNavigate() : handleNavigate('/login')}
      >
        <IconWrapper>
          <FaBookmark />
          {isPathActive('/saved') && <Indicator layoutId="navIndicator" />}
        </IconWrapper>
        <Label>Gespeichert</Label>
      </NavItem>
      
      <NavItem 
        isActive={isPathActive('/profile')}
        onClick={() => handleNavigate('/profile')}
      >
        <IconWrapper>
          <FaUser />
          {isPathActive('/profile') && <Indicator layoutId="navIndicator" />}
        </IconWrapper>
        <Label>Profil</Label>
      </NavItem>
    </NavContainer>
  );
};

export default MobileBottomNavigation; 