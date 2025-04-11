import React, { forwardRef } from 'react';
import styled from 'styled-components';

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
  width: 100%;
  
  @media (max-width: 768px) {
    margin-bottom: 12px;
  }
`;

const Label = styled.label`
  font-size: 14px;
  margin-bottom: 8px;
  font-weight: 500;
  color: var(--color-text-secondary);
  
  @media (max-width: 768px) {
    font-size: 13px;
    margin-bottom: 6px;
  }
`;

const StyledInput = styled.input`
  padding: 10px 12px;
  border: 1px solid ${props => props.error ? 'var(--color-danger)' : 'var(--color-gray-300)'};
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s ease-in-out;
  background-color: var(--color-paper);
  color: var(--color-text-primary);

  &:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 2px rgba(255, 132, 51, 0.1);
  }

  &:disabled {
    background-color: var(--color-gray-100);
    cursor: not-allowed;
  }
  
  @media (max-width: 768px) {
    padding: 8px 10px;
    font-size: 14px;
    border-radius: 6px;
  }
`;

const StyledSelect = styled.select`
  padding: 10px 12px;
  border: 1px solid ${props => props.error ? 'var(--color-danger)' : 'var(--color-gray-300)'};
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s ease-in-out;
  background-color: var(--color-paper);
  color: var(--color-text-primary);
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 1em;
  padding-right: 30px;

  &:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 2px rgba(255, 132, 51, 0.1);
  }

  &:disabled {
    background-color: var(--color-gray-100);
    cursor: not-allowed;
  }
  
  @media (max-width: 768px) {
    padding: 8px 10px;
    padding-right: 30px;
    font-size: 14px;
    border-radius: 6px;
  }
`;

const ErrorMessage = styled.span`
  color: var(--color-danger);
  font-size: 12px;
  margin-top: 4px;
  
  @media (max-width: 768px) {
    font-size: 11px;
  }
`;

const Input = forwardRef(({
  label,
  name,
  error,
  type = 'text',
  options,
  ...rest
}, ref) => {
  if (type === 'select' && options) {
    return (
      <InputWrapper>
        {label && <Label htmlFor={name}>{label}</Label>}
        <StyledSelect
          ref={ref}
          id={name}
          name={name}
          error={error}
          {...rest}
        >
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </StyledSelect>
        {error && <ErrorMessage>{error}</ErrorMessage>}
      </InputWrapper>
    );
  }
  
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