import React from 'react';
import styled from 'styled-components';

const StyledCard = styled.div`
  background-color: var(--color-paper-light);
  border-radius: 12px;
  box-shadow: ${props => props.theme === 'dark' 
    ? '0 4px 8px rgba(0, 0, 0, 0.25)' 
    : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'};
  overflow: hidden;
  display: flex;
  flex-direction: column;
  width: 100%;
  transition: box-shadow 0.3s ease, background-color 0.3s ease;
  border: 1px solid var(--color-border);
  
  @media (max-width: 768px) {
    border-radius: 10px;
    box-shadow: ${props => props.theme === 'dark' 
      ? '0 3px 6px rgba(0, 0, 0, 0.22)' 
      : '0 3px 5px -1px rgba(0, 0, 0, 0.08), 0 2px 3px -1px rgba(0, 0, 0, 0.05)'};
  }
  
  &:hover {
    box-shadow: ${props => props.theme === 'dark'
      ? '0 10px 20px rgba(0, 0, 0, 0.35)'
      : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'};
  }
`;

const CardHeader = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  @media (max-width: 768px) {
    padding: 12px 16px;
  }
`;

const CardTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
  
  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const CardContent = styled.div`
  padding: 20px;
  flex-grow: 1;
  
  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const CardFooter = styled.div`
  padding: 16px 20px;
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  
  @media (max-width: 768px) {
    padding: 12px 16px;
    gap: 8px;
    flex-direction: column;
  }
`;

const Card = ({ 
  title, 
  children, 
  footer, 
  headerAction,
  theme,
  ...rest 
}) => {
  return (
    <StyledCard theme={theme} {...rest}>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {headerAction && headerAction}
        </CardHeader>
      )}
      <CardContent>
        {children}
      </CardContent>
      {footer && (
        <CardFooter>
          {footer}
        </CardFooter>
      )}
    </StyledCard>
  );
};

export default Card; 