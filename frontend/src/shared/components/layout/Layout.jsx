import React from 'react';
import styled from 'styled-components';
import Header from './Header';

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--color-gray-50);
  overflow-x: hidden;
  width: 100%;
  position: relative;
`;

const Main = styled.main`
  flex: 1;
  padding: 24px;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    padding: 16px 12px;
  }
`;

const Layout = ({ children }) => {
  return (
    <Container>
      <Header />
      <Main>{children}</Main>
    </Container>
  );
};

export default Layout; 