import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import Button from './common/Button';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
`;

const ErrorCode = styled.h1`
  font-size: 120px;
  margin: 0;
  color: var(--color-primary);
  font-weight: 700;
`;

const Title = styled.h2`
  font-size: 24px;
  margin: 16px 0;
  color: var(--color-text-primary);
`;

const Message = styled.p`
  font-size: 16px;
  color: var(--color-text-secondary);
  margin-bottom: 24px;
  max-width: 500px;
`;

const NotFoundPage = () => {
  return (
    <Container>
      <ErrorCode>404</ErrorCode>
      <Title>Seite nicht gefunden</Title>
      <Message>
        Die angeforderte Seite existiert nicht oder ist nicht mehr verfügbar.
      </Message>
      <Button as={Link} to="/">
        Zurück zur Startseite
      </Button>
    </Container>
  );
};

export default NotFoundPage; 