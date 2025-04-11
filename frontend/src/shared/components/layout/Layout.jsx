import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Header from './Header';
import { useTheme } from '../../context/ThemeContext';
import { MobileLayout } from '../ui';

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--color-background);
  overflow-x: hidden;
  width: 100%;
  position: relative;
  transition: background-color var(--transition), color var(--transition);
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  position: relative;
  padding-bottom: var(--space-8);
  
  /* Add padding to account for the sticky header on small screens */
  @media (max-width: 768px) {
    padding-top: var(--space-2);
    /* Add padding to bottom to account for the bottom navigation bar */
    padding-bottom: calc(var(--space-20) + var(--space-4));
  }
`;

const ContentWrapper = styled.div`
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: var(--space-6) var(--space-4);
  
  @media (max-width: 768px) {
    padding: var(--space-4) var(--space-3);
  }
  
  @media (max-width: 480px) {
    padding: var(--space-3) var(--space-2);
  }
`;

const Footer = styled.footer`
  margin-top: auto;
  padding: var(--space-6) var(--space-4);
  background-color: var(--color-paper);
  border-top: 1px solid var(--color-border);
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  text-align: center;
  display: ${props => props.$hideFooter ? 'none' : 'block'};
  
  @media (max-width: 768px) {
    padding: var(--space-4) var(--space-3);
  }
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-4);
  
  @media (max-width: 640px) {
    flex-direction: column;
    gap: var(--space-2);
  }
`;

const FooterLinks = styled.div`
  display: flex;
  gap: var(--space-4);
  
  @media (max-width: 640px) {
    gap: var(--space-3);
  }
`;

const FooterLink = styled.a`
  color: var(--color-text-secondary);
  text-decoration: none;
  font-size: 0.875rem;
  transition: color var(--transition-fast);
  
  &:hover {
    color: var(--color-primary);
    text-decoration: none;
  }
`;

const Layout = ({ children, hideFooter = false }) => {
  const { theme } = useTheme();
  const currentYear = new Date().getFullYear();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Render different layouts for mobile and desktop
  if (isMobile) {
    return (
      <MobileLayout hideNavigation={false}>
        {children}
        {!hideFooter && (
          <Footer $hideFooter={hideFooter}>
            <FooterContent>
              <div>© {currentYear} Koch-Assistent</div>
              <FooterLinks>
                <FooterLink href="/about">Über uns</FooterLink>
                <FooterLink href="/privacy">Datenschutz</FooterLink>
                <FooterLink href="/terms">Nutzungsbedingungen</FooterLink>
              </FooterLinks>
            </FooterContent>
          </Footer>
        )}
      </MobileLayout>
    );
  }
  
  // Desktop layout
  return (
    <Container data-theme={theme}>
      <Header />
      <MainContent>
        <ContentWrapper>
          {children}
        </ContentWrapper>
        
        <Footer $hideFooter={hideFooter}>
          <FooterContent>
            <div>© {currentYear} Koch-Assistent</div>
            <FooterLinks>
              <FooterLink href="/about">Über uns</FooterLink>
              <FooterLink href="/privacy">Datenschutz</FooterLink>
              <FooterLink href="/terms">Nutzungsbedingungen</FooterLink>
            </FooterLinks>
          </FooterContent>
        </Footer>
      </MainContent>
    </Container>
  );
};

export default Layout;