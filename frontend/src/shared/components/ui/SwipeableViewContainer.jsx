import React, { useState, useEffect, Children, useMemo, useCallback } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';

// Add hardware acceleration to all animated elements
const HardwareAccelerated = `
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000px;
  will-change: transform;
`;

const Container = styled.div`
  width: 100%;
  overflow: hidden;
  position: relative;
  touch-action: pan-y;
  ${HardwareAccelerated}
`;

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 16px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  
  /* Hide scrollbar */
  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar {
    display: none;
  }
  ${HardwareAccelerated}
`;

const Tab = styled.button`
  padding: 12px 16px;
  font-size: 14px;
  font-weight: ${props => props.active ? '600' : '500'};
  color: ${props => props.active ? 'var(--color-primary)' : 'var(--color-text-secondary)'};
  background: none;
  border: none;
  border-bottom: 2px solid ${props => props.active ? 'var(--color-primary)' : 'transparent'};
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  flex-shrink: 0;
  touch-action: manipulation;
  
  &:after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 100%;
    height: 2px;
    background-color: var(--color-primary);
    transform: scaleX(${props => props.active ? 1 : 0});
    transform-origin: left;
    transition: transform 0.3s ease;
  }
`;

const ViewsContainer = styled(motion.div)`
  display: flex;
  width: 100%;
  position: relative;
  ${HardwareAccelerated}
  touch-action: pan-x;
`;

const View = styled(motion.div)`
  width: 100%;
  flex-shrink: 0;
  ${HardwareAccelerated}
`;

const PageIndicator = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;
`;

const Dot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${props => props.active 
    ? 'var(--color-primary)' 
    : 'var(--color-gray-300)'};
  transition: all 0.3s ease;
  transform: scale(${props => props.active ? 1.2 : 1});
`;

// Optimized slide variants for smoother transitions
const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0.8 // Start with higher opacity for faster fade-in
  }),
  center: {
    x: 0,
    opacity: 1
  },
  exit: (direction) => ({
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0.8, // Higher exit opacity for faster fade-out
    position: 'absolute'
  })
};

const SwipeableViewContainer = ({ 
  children, 
  tabs, 
  activeTab = 0, 
  onChange,
  showDots = true,
  animationDuration = 0.15 // Even faster animation
}) => {
  const [activeIndex, setActiveIndex] = useState(activeTab);
  const [direction, setDirection] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  
  // Memoize children to avoid unnecessary re-renders
  const childrenArray = useMemo(() => Children.toArray(children), [children]);
  
  const x = useMotionValue(0);
  const dragThreshold = 40; // Reduced threshold for more responsive swipes
  
  // Update active index when prop changes
  useEffect(() => {
    if (activeTab !== activeIndex) {
      setDirection(activeTab > activeIndex ? 1 : -1);
      setActiveIndex(activeTab);
    }
  }, [activeTab, activeIndex]);
  
  // Memoize handlers to prevent unnecessary re-renders
  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);
  
  const handleDragEnd = useCallback((_, info) => {
    setIsDragging(false);
    const { offset, velocity } = info;
    
    // Handle swipe left (next tab)
    if ((offset.x < -dragThreshold) || (velocity.x < -300)) {
      if (activeIndex < childrenArray.length - 1) {
        setDirection(1);
        const newIndex = activeIndex + 1;
        setActiveIndex(newIndex);
        onChange && onChange(newIndex);
      }
    } 
    // Handle swipe right (previous tab)
    else if ((offset.x > dragThreshold) || (velocity.x > 300)) {
      if (activeIndex > 0) {
        setDirection(-1);
        const newIndex = activeIndex - 1;
        setActiveIndex(newIndex);
        onChange && onChange(newIndex);
      }
    }
  }, [activeIndex, childrenArray.length, dragThreshold, onChange]);
  
  const handleTabClick = useCallback((index) => {
    if (index !== activeIndex) {
      setDirection(index > activeIndex ? 1 : -1);
      setActiveIndex(index);
      onChange && onChange(index);
    }
  }, [activeIndex, onChange]);
  
  // Optimize gesture constraints
  const dragConstraints = useMemo(() => ({ left: 0, right: 0 }), []);
  
  return (
    <Container>
      {tabs && (
        <TabsContainer>
          {tabs.map((tab, index) => (
            <Tab 
              key={index}
              active={index === activeIndex}
              onClick={() => handleTabClick(index)}
            >
              {tab}
            </Tab>
          ))}
        </TabsContainer>
      )}
      
      <ViewsContainer
        drag={!isDragging ? "x" : false}
        dragConstraints={dragConstraints}
        dragElastic={0.01} // Even less elasticity for faster response
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        style={{ x }}
        dragTransition={{ 
          power: 0.05, // Lower power for more immediate control
          timeConstant: 200, // Shorter time constant
          modifyTarget: target => Math.round(target / 5) * 5
        }}
      >
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <View
            key={activeIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { 
                type: "spring", 
                duration: animationDuration, 
                bounce: 0,
                stiffness: 500, // Higher stiffness for immediate response
                damping: 40  // Higher damping to prevent oscillation
              },
              opacity: { duration: animationDuration * 0.5 } // Faster opacity change
            }}
          >
            {childrenArray[activeIndex]}
          </View>
        </AnimatePresence>
      </ViewsContainer>
      
      {showDots && childrenArray.length > 1 && (
        <PageIndicator>
          {childrenArray.map((_, index) => (
            <Dot 
              key={index} 
              active={index === activeIndex}
              onClick={() => handleTabClick(index)}
            />
          ))}
        </PageIndicator>
      )}
    </Container>
  );
};

export default React.memo(SwipeableViewContainer); 