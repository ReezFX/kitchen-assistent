import React from 'react';
import styled from 'styled-components';

const StyledButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  line-height: 24px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  
  ${({ variant }) => {
    switch (variant) {
      case 'primary':
        return `
          background-color: var(--color-primary);
          color: white;
          border: none;
          
          &:hover {
            filter: brightness(0.9);
          }
          
          &:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }
        `;
      case 'secondary':
        return `
          background-color: white;
          color: var(--color-secondary);
          border: 1px solid var(--color-secondary);
          
          &:hover {
            background-color: var(--color-paper);
          }
          
          &:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }
        `;
      case 'danger':
        return `
          background-color: var(--color-danger);
          color: white;
          border: none;
          
          &:hover {
            filter: brightness(0.9);
          }
          
          &:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }
        `;
      default:
        return `
          background-color: var(--color-primary);
          color: white;
          border: none;
          
          &:hover {
            filter: brightness(0.9);
          }
          
          &:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }
        `;
    }
  }}
  
  ${({ $fullWidth }) => $fullWidth && `
    width: 100%;
  `}
`;

const Button = ({ 
  children, 
  variant = 'primary', 
  $fullWidth = false, 
  type = 'button',
  ...rest 
}) => {
  return (
    <StyledButton
      type={type}
      variant={variant}
      $fullWidth={$fullWidth}
      {...rest}
    >
      {children}
    </StyledButton>
  );
};

export default Button; 