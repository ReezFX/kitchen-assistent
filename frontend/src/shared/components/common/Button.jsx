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
          background-color: #4f46e5;
          color: white;
          border: none;
          
          &:hover {
            background-color: #4338ca;
          }
          
          &:disabled {
            background-color: #c7d2fe;
            cursor: not-allowed;
          }
        `;
      case 'secondary':
        return `
          background-color: white;
          color: #4f46e5;
          border: 1px solid #4f46e5;
          
          &:hover {
            background-color: #f3f4f6;
          }
          
          &:disabled {
            color: #9ca3af;
            border-color: #9ca3af;
            cursor: not-allowed;
          }
        `;
      case 'danger':
        return `
          background-color: #ef4444;
          color: white;
          border: none;
          
          &:hover {
            background-color: #dc2626;
          }
          
          &:disabled {
            background-color: #fca5a5;
            cursor: not-allowed;
          }
        `;
      default:
        return `
          background-color: #4f46e5;
          color: white;
          border: none;
          
          &:hover {
            background-color: #4338ca;
          }
          
          &:disabled {
            background-color: #c7d2fe;
            cursor: not-allowed;
          }
        `;
    }
  }}
  
  ${({ fullWidth }) => fullWidth && `
    width: 100%;
  `}
`;

const Button = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  type = 'button',
  ...rest 
}) => {
  return (
    <StyledButton
      type={type}
      variant={variant}
      fullWidth={fullWidth}
      {...rest}
    >
      {children}
    </StyledButton>
  );
};

export default Button; 