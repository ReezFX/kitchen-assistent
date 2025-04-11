import React, { useState, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { motion, useSpring, useTransform, useMotionValue } from 'framer-motion';

// Hardware acceleration CSS
const HardwareAccelerated = `
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000px;
  will-change: transform;
`;

const Container = styled.div`
  position: relative;
  overflow: hidden;
  touch-action: pan-y;
  ${HardwareAccelerated}
`;

const PullArea = styled(motion.div)`
  width: 100%;
  overflow: visible;
  ${HardwareAccelerated}
`;

const IndicatorWrapper = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  pointer-events: none;
  width: 100%;
  z-index: 10;
  ${HardwareAccelerated}
`;

const LoadingIndicator = styled(motion.div)`
  width: 40px;
  height: 40px;
  background-color: var(--color-background);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  pointer-events: none;
  ${HardwareAccelerated}
  
  svg {
    color: var(--color-primary);
    animation: ${({ $refreshing }) => $refreshing ? 'spin 1s linear infinite' : 'none'};
    font-size: 20px;
  }
  
  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const PullToRefresh = ({ 
  children, 
  onRefresh, 
  pullDistance = 80,
  disabled = false,
  loadingIndicator
}) => {
  const [refreshing, setRefreshing] = useState(false);
  const containerRef = useRef(null);
  const pullStartY = useRef(0);
  const isDragging = useRef(false);
  
  // Use motion values for smoother animations
  const y = useMotionValue(0);
  const opacity = useTransform(y, [0, pullDistance * 0.3, pullDistance], [0, 0.5, 1]);
  const scale = useTransform(y, [0, pullDistance * 0.3, pullDistance], [0.8, 0.9, 1]);
  const rotation = useTransform(y, [0, pullDistance * 0.5, pullDistance], [0, 180, 360]);

  // Use spring for smoother animation when releasing
  const springY = useSpring(y, { stiffness: 400, damping: 30 });
  
  const handleTouchStart = useCallback((e) => {
    if (disabled || refreshing) return;
    const touchY = e.touches[0].clientY;
    
    // Only enable pull-to-refresh when at the top of the container
    if (containerRef.current.scrollTop <= 0) {
      pullStartY.current = touchY;
      isDragging.current = true;
    }
  }, [disabled, refreshing]);
  
  const handleTouchMove = useCallback((e) => {
    if (!isDragging.current || disabled || refreshing) return;
    
    const touchY = e.touches[0].clientY;
    const pullDistance = Math.max(0, touchY - pullStartY.current);
    
    // Add resistance to pull
    const resistance = 0.4;
    const newY = pullDistance * resistance;
    
    y.set(newY);
    
    // Prevent default to avoid page overscroll on some browsers
    if (newY > 5) {
      e.preventDefault();
    }
  }, [disabled, refreshing, y]);
  
  const handleTouchEnd = useCallback(async () => {
    if (!isDragging.current || disabled) return;
    isDragging.current = false;

    const currentY = y.get();
    
    // If pulled enough, trigger refresh
    if (currentY >= pullDistance && !refreshing) {
      setRefreshing(true);
      
      try {
        if (onRefresh) {
          await onRefresh();
        }
      } finally {
        // Return to original position with a slight delay for UX
        setTimeout(() => {
          y.set(0);
          setRefreshing(false);
        }, 400);
      }
    } else {
      // Return to original position
      y.set(0);
    }
  }, [disabled, onRefresh, pullDistance, refreshing, y]);
  
  // Default loading icon
  const DefaultLoadingIcon = () => (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 18V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4.93 4.93L7.76 7.76" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16.24 16.24L19.07 19.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 12H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18 12H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4.93 19.07L7.76 16.24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16.24 7.76L19.07 4.93" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
  
  return (
    <Container 
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ touchAction: refreshing ? 'none' : 'pan-y' }}
    >
      <IndicatorWrapper style={{ top: springY }}>
        <LoadingIndicator 
          $refreshing={refreshing}
          style={{ 
            opacity,
            scale,
            rotate: rotation
          }}
        >
          {loadingIndicator || <DefaultLoadingIcon />}
        </LoadingIndicator>
      </IndicatorWrapper>
      
      <PullArea
        style={{ y: springY }}
      >
        {children}
      </PullArea>
    </Container>
  );
};

export default React.memo(PullToRefresh); 