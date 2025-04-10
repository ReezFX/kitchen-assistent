import React from 'react';
import styled from 'styled-components';
import { useTheme } from '../../context/ThemeContext';
import { motion } from 'framer-motion';

const ToggleContainer = styled.button`
  background: ${props => props.theme === 'dark' ? 
    'linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%)' : 
    'linear-gradient(135deg, #f9fafb 0%, #e5e7eb 100%)'
  };
  border: 2px solid ${props => props.theme === 'dark' ? 
    'var(--color-gray-300)' : 
    'var(--color-gray-300)'
  };
  border-radius: 30px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 5px;
  position: relative;
  width: 60px;
  height: 32px;
  transition: all 0.3s ease;
  box-shadow: ${props => props.theme === 'dark' ? 
    '0 2px 5px rgba(0, 0, 0, 0.5)' :
    '0 2px 5px rgba(0, 0, 0, 0.1)'
  };

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px var(--color-primary);
  }
`;

const Icons = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 50%;
  transition: opacity 0.3s ease;
  font-size: 16px;
  z-index: 1;
  opacity: ${props => props.active ? 1 : 0.3};
`;

const SunIcon = styled(Icons)`
  color: var(--color-maize);
`;

const MoonIcon = styled(Icons)`
  color: var(--color-maize);
`;

const ToggleThumb = styled(motion.span)`
  position: absolute;
  top: 2px;
  left: 2px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%);
  transition: transform 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
`;

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <ToggleContainer 
      onClick={toggleTheme} 
      theme={theme}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <SunIcon active={theme === 'light'}>☀️</SunIcon>
      <MoonIcon active={theme === 'dark'}>🌙</MoonIcon>
      <ToggleThumb 
        initial={false}
        animate={{ 
          x: theme === 'light' ? 2 : 28
        }}
      />
    </ToggleContainer>
  );
};

export default ThemeToggle; 