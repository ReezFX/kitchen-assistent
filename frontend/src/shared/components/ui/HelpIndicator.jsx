import React, { useState } from 'react';
import styled from 'styled-components';
import { AnimatePresence, motion } from 'framer-motion';
import { FaQuestionCircle, FaTimes } from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext';

const Container = styled.div`
  position: relative;
`;

const HelpButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-secondary);
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease;
  margin: 0 auto;
  
  &:hover {
    color: var(--color-primary);
  }
  
  svg {
    font-size: 18px;
  }
  
  /* Only show on mobile */
  @media (min-width: 769px) {
    display: none;
  }
`;

const HelpContent = styled(motion.div)`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: ${props => props.theme === 'dark' ? 'var(--color-gray-900)' : 'var(--color-paper)'};
  padding: 24px 20px;
  border-radius: 16px 16px 0 0;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
  max-height: 70vh;
  overflow-y: auto;
  z-index: 1000;
  
  /* Add padding for bottom nav if needed */
  padding-bottom: calc(24px + env(safe-area-inset-bottom, 0px) + 60px);
`;

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
`;

const ContentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const ContentTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-secondary);
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  
  &:hover, &:active {
    background-color: var(--color-gray-100);
    color: var(--color-text-primary);
  }
`;

const ContentText = styled.div`
  font-size: 16px;
  line-height: 1.6;
  color: var(--color-text-secondary);
  
  p {
    margin-bottom: 12px;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
`;

// Animation variants
const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
};

const contentVariants = {
  hidden: { y: '100%' },
  visible: { 
    y: 0,
    transition: {
      type: 'spring',
      damping: 30,
      stiffness: 300
    }
  }
};

/**
 * HelpIndicator - Shows a help icon on mobile that reveals detailed descriptions when clicked
 * 
 * @param {Object} props
 * @param {String} props.title - Title for the help modal
 * @param {ReactNode} props.children - Content to display in the help modal
 * @param {String} [props.iconSize='18px'] - Size of the help icon
 */
const HelpIndicator = ({ title, children, iconSize = '18px' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme } = useTheme();
  
  const toggleHelp = () => {
    setIsOpen(!isOpen);
  };
  
  // Prevent body scrolling when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  return (
    <Container>
      <HelpButton onClick={toggleHelp} aria-label="Hilfe anzeigen">
        <FaQuestionCircle size={iconSize} />
      </HelpButton>
      
      <AnimatePresence>
        {isOpen && (
          <>
            <Overlay 
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={overlayVariants}
              onClick={toggleHelp}
            />
            
            <HelpContent
              theme={theme}
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={contentVariants}
            >
              <ContentHeader>
                <ContentTitle>{title}</ContentTitle>
                <CloseButton onClick={toggleHelp} aria-label="Schließen">
                  <FaTimes />
                </CloseButton>
              </ContentHeader>
              
              <ContentText>
                {children}
              </ContentText>
            </HelpContent>
          </>
        )}
      </AnimatePresence>
    </Container>
  );
};

export default HelpIndicator; 