import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useTheme } from '../../context/ThemeContext';
import MobileBottomNavigation from './MobileBottomNavigation';
import MobileHeader from './MobileHeader';

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--color-background);
  width: 100%;
  position: relative;
  overflow-x: hidden;
  
  @media (min-width: 769px) {
    // Apply desktop-specific styles
    overflow-x: visible;
  }
`;

const Content = styled.div`
  flex: 1;
  padding: 0 16px 16px 16px;
  margin-top: 40px; /* Use margin instead of padding for header space */
  padding-top: 0;
  padding-bottom: calc(16px + 60px + env(safe-area-inset-bottom, 0px)); /* Account for bottom nav */
  width: 100%;
  max-width: 100%;
  margin-left: auto;
  margin-right: auto;
  
  @media (min-width: 769px) {
    max-width: 1200px;
    padding: 24px;
    padding-bottom: 24px;
    padding-top: 24px;
    margin-top: 0;
  }
`;

const MobileLayout = ({ children, hideNavigation = false, hideHeader = false }) => {
  const { theme } = useTheme();
  
  // Set viewport height for mobile browsers (fixes the 100vh issue)
  useEffect(() => {
    const setVh = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    setVh();
    window.addEventListener('resize', setVh);
    
    return () => {
      window.removeEventListener('resize', setVh);
    };
  }, []);

  return (
    <Container data-theme={theme}>
      {!hideHeader && <MobileHeader />}
      <Content>
        {children}
      </Content>
      {!hideNavigation && <MobileBottomNavigation />}
    </Container>
  );
};

export default MobileLayout; 