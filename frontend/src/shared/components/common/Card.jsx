import React from 'react';
import styled from 'styled-components';

const StyledCard = styled.div`
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  width: 100%;
  transition: box-shadow 0.3s ease;
  
  &:hover {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  }
`;

const CardHeader = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const CardTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
`;

const CardContent = styled.div`
  padding: 20px;
  flex-grow: 1;
`;

const CardFooter = styled.div`
  padding: 16px 20px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

const Card = ({ 
  title, 
  children, 
  footer, 
  headerAction, 
  ...rest 
}) => {
  return (
    <StyledCard {...rest}>
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