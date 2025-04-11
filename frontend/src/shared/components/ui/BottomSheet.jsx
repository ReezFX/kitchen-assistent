import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { FaTimes, FaGripLines } from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext';

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  touch-action: none;
`;

const Sheet = styled(motion.div)`
  position: relative;
  width: 100%;
  border-radius: 16px 16px 0 0;
  background-color: ${props => props.theme === 'dark' ? 'var(--color-gray-900)' : 'var(--color-paper)'};
  overflow: hidden;
  padding-bottom: env(safe-area-inset-bottom, 20px);
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
  touch-action: none;
  
  @media (min-width: 769px) {
    width: 500px;
    max-height: 90vh;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid var(--color-border);
  position: relative;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
  flex-grow: 1;
  text-align: center;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: var(--color-text-secondary);
  
  &:hover, &:focus {
    color: var(--color-text-primary);
  }
`;

const Content = styled.div`
  padding: 16px;
  overflow-y: auto;
  max-height: 70vh;
  
  /* iOS momentum scrolling */
  -webkit-overflow-scrolling: touch;
`;

const DragHandle = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: grab;
  color: var(--color-text-secondary);
  
  &:active {
    cursor: grabbing;
  }
`;

const DragIndicator = styled.div`
  width: 40px;
  height: 4px;
  background-color: var(--color-gray-300);
  border-radius: 4px;
`;

const BottomSheet = ({
  isOpen,
  onClose,
  title,
  children,
  height = '50vh',
  showHandle = true,
  snapPoints = ['25vh', '50vh', '90vh'],
  initialSnapPoint = 1,
}) => {
  const { theme } = useTheme();
  const [currentSnapPoint, setCurrentSnapPoint] = useState(initialSnapPoint);
  const y = useMotionValue(0);
  
  // Reset snap point when sheet opens
  useEffect(() => {
    if (isOpen) {
      setCurrentSnapPoint(initialSnapPoint);
    }
  }, [isOpen, initialSnapPoint]);
  
  // Convert snapPoints to pixel values
  const getSnapPointInPixels = (snapPoint) => {
    if (typeof snapPoint === 'number') return snapPoint;
    
    if (typeof snapPoint === 'string' && snapPoint.endsWith('vh')) {
      const vh = parseInt(snapPoint) / 100;
      return window.innerHeight * vh;
    }
    
    return 0;
  };
  
  const handleDragEnd = (_, info) => {
    const { velocity, offset } = info;
    const offsetY = offset.y;
    
    // If the user is swiping down with high velocity, close the sheet
    if (velocity.y > 500) {
      onClose();
      return;
    }
    
    // Find the closest snap point
    const snapPointsInPixels = snapPoints.map(getSnapPointInPixels);
    let closestSnapPoint = 0;
    let closestDistance = Infinity;
    
    snapPointsInPixels.forEach((snapPoint, index) => {
      const distance = Math.abs(offsetY - snapPoint);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestSnapPoint = index;
      }
    });
    
    // If we're too close to the bottom of the screen, close the sheet
    if (closestSnapPoint === snapPoints.length - 1 && snapPointsInPixels[closestSnapPoint] > window.innerHeight * 0.7) {
      onClose();
    } else {
      setCurrentSnapPoint(closestSnapPoint);
    }
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <Overlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <Sheet
            theme={theme}
            initial={{ y: '100%' }}
            animate={{ 
              y: getSnapPointInPixels(snapPoints[currentSnapPoint]),
              transition: { 
                type: 'spring', 
                damping: 30, 
                stiffness: 300,
              }
            }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.3 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 500 }}
            dragElastic={0.1}
            onDragEnd={handleDragEnd}
            style={{ y }}
          >
            {showHandle && (
              <DragHandle>
                <DragIndicator />
              </DragHandle>
            )}
            
            <Header>
              <Title>{title}</Title>
              <CloseButton onClick={onClose}>
                <FaTimes />
              </CloseButton>
            </Header>
            
            <Content>
              {children}
            </Content>
          </Sheet>
        </Overlay>
      )}
    </AnimatePresence>
  );
};

export default BottomSheet; 