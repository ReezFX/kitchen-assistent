import React, { forwardRef } from 'react';
import styled from 'styled-components';

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
  width: 100%;
`;

const Label = styled.label`
  font-size: 14px;
  margin-bottom: 8px;
  font-weight: 500;
  color: var(--color-text-secondary);
`;

const StyledInput = styled.input`
  padding: 10px 12px;
  border: 1px solid ${props => props.error ? 'var(--color-danger)' : 'var(--color-gray-300)'};
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s ease-in-out;

  &:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 2px rgba(255, 132, 51, 0.1);
  }

  &:disabled {
    background-color: var(--color-gray-100);
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.span`
  color: var(--color-danger);
  font-size: 12px;
  margin-top: 4px;
`;

const Input = forwardRef(({
  label,
  name,
  error,
  type = 'text',
  ...rest
}, ref) => {
  return (
    <InputWrapper>
      {label && <Label htmlFor={name}>{label}</Label>}
      <StyledInput
        ref={ref}
        type={type}
        id={name}
        name={name}
        error={error}
        {...rest}
      />
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </InputWrapper>
  );
});

export default Input; 