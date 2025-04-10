import React from 'react';
import styled from 'styled-components';
import Header from './Header';
import { useTheme } from '../../context/ThemeContext';

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--color-background);
  overflow-x: hidden;
  width: 100%;
  position: relative;
  transition: background-color 0.3s ease, color 0.3s ease;
`;

const Main = styled.main`
  flex: 1;
  padding: 24px;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  color: var(--color-text-secondary);
  
  @media (max-width: 768px) {
    padding: 16px 12px;
  }
`;

const Layout = ({ children }) => {
  const { theme } = useTheme();
  
  return (
    <Container data-theme={theme}>
      <Header />
      <Main>{children}</Main>
    </Container>
  );
};

export default Layout; 