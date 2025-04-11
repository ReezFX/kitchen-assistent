import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import RecipeGenerator from '../../shared/components/recipe/RecipeGenerator';
import SavedRecipesList from '../../shared/components/recipe/SavedRecipesList';
import { useAuth } from '../../shared/hooks/useAuth';
import { useTheme } from '../../shared/context/ThemeContext';
import { FaUtensils, FaBook, FaMagic, FaCarrot, FaAppleAlt, FaBreadSlice, FaPizzaSlice } from 'react-icons/fa';
import { SwipeableViewContainer, PullToRefresh } from '../../shared/components/ui';

// Add hardware acceleration to all containers
const HardwareAccelerated = `
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000px;
  will-change: transform;
`;

const Container = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 20px;
  position: relative;
  ${HardwareAccelerated}
  
  @media (max-width: 768px) {
    padding: 0;
  }
`;

const PageHeader = styled.div`
  margin: 2rem 0 3rem;
  text-align: center;
  position: relative;
  
  @media (max-width: 768px) {
    margin: 0;
    /* Hide the header completely on mobile since title is in MobileHeader */
    display: none;
  }
`;

const Title = styled(motion.h1)`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: var(--color-text-primary);
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  
  svg {
    margin-right: 12px;
    color: var(--color-primary);
  }
  
  @media (max-width: 768px) {
    font-size: 1.8rem;
    margin-bottom: 0.5rem;
  }
`;

const Description = styled(motion.p)`
  font-size: 1.1rem;
  color: var(--color-text-secondary);
  margin-bottom: 2rem;
  line-height: 1.6;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
  
  @media (max-width: 768px) {
    display: none; /* Hide description on mobile devices */
  }
`;

const DecorativeIcon = styled.div`
  position: absolute;
  opacity: 0.15;
  z-index: 0;
  color: var(--color-primary);
  transform: rotate(${props => props.rotate || '0deg'});
  
  svg {
    width: ${props => props.size || '40px'};
    height: ${props => props.size || '40px'};
  }
  
  @media (max-width: 768px) {
    display: none;
  }
`;

// Faster animation
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      duration: 0.3,
      ease: "easeOut"
    }
  }
};

const ContentContainer = styled.div`
  ${HardwareAccelerated}
  @media (max-width: 768px) {
    margin-top: 0;
  }
`;

// Component that pre-renders both tabs for faster switching
const PreloadedTabs = ({ children }) => {
  const childrenArray = React.Children.toArray(children);
  
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {childrenArray.map((child, index) => (
        <div key={index} style={{ 
          display: 'block', 
          visibility: 'hidden',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '0',
          overflow: 'hidden',
          pointerEvents: 'none'
        }}>
          {child}
        </div>
      ))}
    </div>
  );
};

const RecipesPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { theme } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [tabsReady, setTabsReady] = useState(false);
  
  // Prepare tabs based on authentication status (memoized)
  const tabs = useMemo(() => 
    isAuthenticated 
      ? ['Rezeptgenerator', 'Gespeicherte Rezepte'] 
      : ['Rezeptgenerator'],
    [isAuthenticated]
  );
  
  // Initialize activeTab based on URL parameters
  const [activeTab, setActiveTab] = useState(() => {
    // Check URL query parameters for tab selection
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    
    if (isAuthenticated && tabParam === 'saved') {
      return 1; // Show saved recipes tab
    } else if (tabParam === 'generator') {
      return 0; // Show generator tab
    }
    
    // Default tab
    return 0;
  });
  
  // Preload tabs after initial render for faster switching
  useEffect(() => {
    // Use requestIdleCallback or setTimeout to preload tabs without blocking rendering
    const timeoutId = setTimeout(() => {
      setTabsReady(true);
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, []);
  
  // Update tab when URL changes (memoized)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    
    if (isAuthenticated && tabParam === 'saved') {
      setActiveTab(1); // Show saved recipes tab
    } else if (tabParam === 'generator' || !tabParam) {
      setActiveTab(0); // Show generator tab
    }
  }, [location.search, isAuthenticated]);
  
  // Listen for tab change events from MobileBottomNavigation (memoized)
  useEffect(() => {
    const handleTabChange = (event) => {
      const { tab } = event.detail;
      if (tab === 'saved' && isAuthenticated) {
        setActiveTab(1);
      } else if (tab === 'generator') {
        setActiveTab(0);
      }
    };
    
    window.addEventListener('tabchange', handleTabChange);
    return () => {
      window.removeEventListener('tabchange', handleTabChange);
    };
  }, [isAuthenticated]);
  
  // Use requestAnimationFrame to make URL updates smoother
  useEffect(() => {
    const tabName = activeTab === 0 ? 'generator' : 'saved';
    const currentParams = new URLSearchParams(location.search);
    const currentTab = currentParams.get('tab');
    
    // Only update URL if the tab in URL doesn't match current active tab
    if (tabName !== currentTab) {
      requestAnimationFrame(() => {
        navigate(`/recipes?tab=${tabName}`, { replace: true });
      });
    }
  }, [activeTab, navigate, location.search]);
  
  // Memoize handlers to prevent unnecessary re-renders
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    
    // Shorter timeout for better UX
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setRefreshing(false);
  }, []);
  
  const handleTabChange = useCallback((index) => {
    setActiveTab(index);
  }, []);
  
  // Memoize child components to prevent unnecessary re-renders
  const recipeGeneratorComponent = useMemo(() => <RecipeGenerator />, []);
  const savedRecipesComponent = useMemo(() => isAuthenticated && <SavedRecipesList />, [isAuthenticated]);
  
  return (
    <Container>
      <PageHeader>
        <Title
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <FaUtensils /> Rezepte
        </Title>
        
        <Description
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          Erstelle personalisierte Rezepte basierend auf den Zutaten, die du zu Hause hast,
          oder verwalte deine Sammlung von gespeicherten Lieblingsrezepten.
        </Description>
        
        {/* Dekorative Icons */}
        <DecorativeIcon style={{ top: '0', left: '5%' }} size="35px" rotate="-15deg">
          <FaCarrot />
        </DecorativeIcon>
        
        <DecorativeIcon style={{ top: '20%', right: '10%' }} size="30px" rotate="10deg">
          <FaAppleAlt />
        </DecorativeIcon>
        
        <DecorativeIcon style={{ bottom: '-10%', left: '15%' }} size="28px" rotate="-5deg">
          <FaBreadSlice />
        </DecorativeIcon>
        
        <DecorativeIcon style={{ bottom: '30%', right: '5%' }} size="32px" rotate="15deg">
          <FaPizzaSlice />
        </DecorativeIcon>
      </PageHeader>
      
      <ContentContainer>
        {/* Hidden preload container to warm up components */}
        {!tabsReady && (
          <PreloadedTabs>
            {recipeGeneratorComponent}
            {savedRecipesComponent}
          </PreloadedTabs>
        )}
        
        <PullToRefresh onRefresh={handleRefresh} disabled={refreshing}>
          <SwipeableViewContainer 
            tabs={tabs}
            activeTab={activeTab}
            onChange={handleTabChange}
            showDots={false}
          >
            {recipeGeneratorComponent}
            {savedRecipesComponent}
          </SwipeableViewContainer>
        </PullToRefresh>
      </ContentContainer>
    </Container>
  );
};

export default React.memo(RecipesPage); 