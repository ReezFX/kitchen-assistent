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
  
  @media (max-width: 768px) {
    padding: 10px 16px; /* Slightly larger touch target on mobile */
    font-size: 15px;
    border-radius: 6px;
  }
  
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
          
          &:active {
            filter: brightness(0.85);
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
          
          &:active {
            background-color: var(--color-gray-100);
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
          
          &:active {
            filter: brightness(0.85);
          }
          
          &:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }
        `;
      case 'text':
        return `
          background-color: transparent;
          color: var(--color-primary);
          border: none;
          padding: 6px 12px;
          
          &:hover {
            background-color: rgba(255, 132, 51, 0.05);
          }
          
          &:active {
            background-color: rgba(255, 132, 51, 0.1);
          }
          
          &:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }
          
          @media (max-width: 768px) {
            padding: 8px 12px;
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
          
          &:active {
            filter: brightness(0.85);
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
  
  ${({ size }) => {
    switch (size) {
      case 'small':
        return `
          padding: 6px 12px;
          font-size: 12px;
          line-height: 20px;
          
          @media (max-width: 768px) {
            padding: 8px 12px;
            font-size: 13px;
          }
        `;
      case 'large':
        return `
          padding: 12px 24px;
          font-size: 16px;
          line-height: 28px;
          
          @media (max-width: 768px) {
            padding: 14px 24px;
            font-size: 16px;
          }
        `;
      default:
        return '';
    }
  }}
`;

const Button = ({ 
  children, 
  variant = 'primary', 
  $fullWidth = false,
  size = 'medium',
  type = 'button',
  ...rest 
}) => {
  return (
    <StyledButton
      type={type}
      variant={variant}
      $fullWidth={$fullWidth}
      size={size}
      {...rest}
    >
      {children}
    </StyledButton>
  );
};

export default Button; 