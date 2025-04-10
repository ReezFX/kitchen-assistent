import React, { useRef, useState, useEffect, useCallback } from 'react';
import styled, { keyframes, createGlobalStyle } from 'styled-components';
import { Link } from 'react-router-dom';
import { motion, useInView, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import Button from '../../shared/components/common/Button';
import Card from '../../shared/components/common/Card';
import SavedRecipesList from '../../shared/components/recipe/SavedRecipesList';
import { GradientButton } from '../../shared/components/ui/GradientButton';
import { GlowingEffect } from '../../shared/components/ui/GlowingEffect';
import '../../shared/components/ui/glowing-effect.css';
import { useAuth } from '../../shared/hooks/useAuth';
import { useTheme } from '../../shared/context/ThemeContext';

// Add global smooth scrolling
const GlobalScrollStyle = createGlobalStyle`
  html {
    scroll-behavior: smooth;
    touch-action: manipulation; /* Improve touch responsiveness */
  }
  
  /* For iOS Safari and other mobile browsers */
  @supports (-webkit-overflow-scrolling: touch) {
    body {
      -webkit-overflow-scrolling: touch;
      /* Prevent rubber-band scrolling on iOS */
      overscroll-behavior-y: none;
    }
    
    /* Fix for iOS 100vh issue */
    .vh-fix {
      height: 100vh;
      height: -webkit-fill-available;
    }
  }
  
  /* For Firefox */
  * {
    scrollbar-width: thin;
    scrollbar-color: var(--color-primary) transparent;
  }
  
  /* For Chrome, Edge, and Safari */
  *::-webkit-scrollbar {
    width: 8px;
  }
  
  *::-webkit-scrollbar-track {
    background: transparent;
  }
  
  *::-webkit-scrollbar-thumb {
    background-color: var(--color-primary);
    border-radius: 10px;
    border: 2px solid transparent;
  }
  
  /* Optimize animation performance on mobile */
  @media (max-width: 768px) {
    .will-change-opacity {
      will-change: opacity;
    }
    .will-change-transform {
      will-change: transform;
    }
  }
`;

// Updated Gradient Text component with CSS variables
const GradientText = styled.span`
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: inline-block;
  font-weight: inherit;
`;

const HeroTitle = styled.h1`
  font-size: clamp(2.5rem, 5vw, 3.5rem);
  font-weight: 800;
  letter-spacing: -0.025em;
  margin-bottom: 24px;
  line-height: 1.1;
`;

const HeroSubtitle = styled.p`
  font-size: clamp(1.125rem, 2vw, 1.25rem);
  max-width: 700px;
  margin: 0 auto 40px;
  line-height: 1.6;
  opacity: 0.95;
  font-weight: 400;
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: center;
  gap: 16px;
  
  @media (max-width: 640px) {
    flex-direction: column;
    align-items: center;
    width: 100%;
    max-width: 280px;
    margin: 0 auto;
  }
`;

const StyledLink = styled(Link)`
  display: block;
  text-decoration: none;
  
  @media (max-width: 640px) {
    width: 100%;
  }
  
  &:hover, &:focus {
    text-decoration: none;
  }
`;

const GradientButtonLink = ({ to, children, $variant }) => (
  <StyledLink to={to}>
    <GradientButton $variant={$variant}>{children}</GradientButton>
  </StyledLink>
);

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 40px;
  
  @media (max-width: 768px) {
    margin-bottom: 30px;
  }
  
  @media (max-width: 480px) {
    margin-bottom: 24px;
  }
`;

const SectionTitle = styled.h2`
  font-size: clamp(1.75rem, 3vw, 2.25rem);
  font-weight: 700;
  margin-bottom: 12px;
  color: var(--color-dark);
  
  @media (max-width: 480px) {
    margin-bottom: 8px;
  }
`;

const GradientTitle = styled(SectionTitle)`
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const SectionDescription = styled.p`
  font-size: 1.125rem;
  max-width: 800px;
  margin: 0 auto;
  color: var(--color-text);
  line-height: 1.6;
  
  @media (max-width: 768px) {
    font-size: 1rem;
    max-width: 95%;
  }
`;

const FeatureCard = styled(Card)`
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 32px;
  border-radius: 16px;
  background-color: var(--color-paper-light);
  box-shadow: ${props => props.theme === 'dark'
    ? '0 10px 30px rgba(0, 0, 0, 0.2), 0 1px 3px rgba(0, 0, 0, 0.1)'
    : '0 10px 30px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.05)'
  };
  border: 1px solid var(--color-border);
  transition: transform 0.2s ease-out, box-shadow 0.2s ease-out, background-color 0.3s ease;
  z-index: 1;
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: ${props => props.theme === 'dark'
      ? '0 20px 40px rgba(0, 0, 0, 0.3), 0 1px 5px rgba(0, 0, 0, 0.1)'
      : '0 20px 40px rgba(0, 0, 0, 0.08), 0 1px 5px rgba(0, 0, 0, 0.03)'
    };
  }
  
  @media (max-width: 768px) {
    padding: 24px;
  }
  
  @media (max-width: 480px) {
    padding: 20px;
  }
`;

const FeatureIcon = styled.div`
  font-size: 48px;
  margin-bottom: 24px;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const FeatureTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 12px;
  color: var(--color-dark);
`;

const FeatureDescription = styled.p`
  color: var(--color-text);
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 24px;
`;

// New marketing components for non-authenticated users
const HeroButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 40px;
  width: 100%;
  
  @media (max-width: 640px) {
    flex-direction: column;
    align-items: center;
    max-width: 280px;
    margin-left: auto;
    margin-right: auto;
  }
`;

const HeroStats = styled.div`
  display: flex;
  justify-content: center;
  gap: 48px;
  margin-top: 48px;
  
  @media (max-width: 768px) {
    gap: 24px;
  }
  
  @media (max-width: 640px) {
    flex-wrap: wrap;
    gap: 16px;
  }
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  
  @media (max-width: 640px) {
    min-width: 100px;
    margin-bottom: 16px;
  }
`;

const StatNumber = styled.div`
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 8px;
  background: linear-gradient(135deg, var(--color-maize) 0%, white 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  
  @media (max-width: 640px) {
    font-size: 2rem;
  }
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  opacity: 0.9;
`;

const QuoteIcon = styled.div`
  font-size: 2rem;
  color: var(--color-primary);
  margin-bottom: 16px;
  opacity: 0.4;
`;

const TestimonialText = styled.p`
  font-size: 1rem;
  font-style: italic;
  color: var(--color-text-primary);
  margin-bottom: 16px;
  flex: 1;
`;

const TestimonialAuthor = styled.div`
  display: flex;
  align-items: center;
  margin-top: auto;
`;

const AuthorAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--color-gray-200);
  margin-right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
`;

const AuthorInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const AuthorName = styled.div`
  font-weight: 600;
  color: var(--color-text-primary);
  font-size: 0.9rem;
`;

const AuthorTitle = styled.div`
  color: var(--color-text-secondary);
  font-size: 0.8rem;
`;

const StepNumber = styled.div`
  position: absolute;
  top: -20px;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: white;
  font-size: 1.25rem;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
`;

const StepIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 16px;
  margin-top: 8px;
`;

const StepTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--color-text-primary);
`;

const StepDescription = styled.p`
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  line-height: 1.5;
`;

const USPCard = styled.div`
  background: linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-primary) 100%);
  border-radius: 24px;
  padding: 40px;
  text-align: center;
  color: white;
  position: relative;
  overflow: hidden;
  box-shadow: ${props => props.theme === 'dark'
    ? '0 15px 30px rgba(0, 0, 0, 0.25)'
    : '0 15px 30px rgba(0, 0, 0, 0.1)'
  };
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
      radial-gradient(circle at 20% 20%, rgba(255, 255, 255, ${props => props.theme === 'dark' ? '0.15' : '0.2'}) 0%, transparent 30%),
      radial-gradient(circle at 80% 80%, rgba(255, 255, 255, ${props => props.theme === 'dark' ? '0.15' : '0.2'}) 0%, transparent 30%);
    z-index: 0;
  }
`;

const USPContent = styled.div`
  position: relative;
  z-index: 1;
  max-width: 100%;
  margin: 0 auto;
`;

const USPTitle = styled.h2`
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 16px;
`;

const USPText = styled.p`
  font-size: 1.25rem;
  margin: 0 auto;
  opacity: 0.9;
  max-width: 100%;
`;

const RecipeCard = styled(Card)`
  display: flex;
  flex-direction: column;
  height: 100%;
  transition: transform 0.2s ease-out, box-shadow 0.2s ease-out, background-color 0.3s ease;
  background-color: var(--color-paper-light);
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: ${props => props.theme === 'dark'
      ? '0 8px 20px rgba(0, 0, 0, 0.3)'
      : '0 8px 20px rgba(0, 0, 0, 0.1)'
    };
  }
`;

const RecipeTitle = styled.h3`
  font-size: 18px;
  margin-bottom: 8px;
  color: var(--color-text-primary);
`;

const RecipeInfo = styled.div`
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-bottom: 8px;
`;

const Tag = styled.span`
  display: inline-block;
  background-color: var(--color-gray-200);
  color: var(--color-gray-600);
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;
  margin-right: 6px;
  margin-bottom: 6px;
`;

const ThumbnailContainer = styled.div`
  width: 100%;
  height: 160px;
  overflow: hidden;
  border-radius: 8px;
  margin-bottom: 12px;
  position: relative;
  background-color: var(--color-gray-100);
`;

const RecipeThumbnail = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  background: linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-accent) 20%);
  
  ${RecipeCard}:hover & {
    transform: scale(1.05);
  }
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 12px;
`;

const RecipeDescription = styled.p`
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-bottom: 16px;
  line-height: 1.4;
`;

// --- Updated Animation Variants (More Variety) ---
const sectionViewVariants = (delay = 0) => ({
  hidden: { opacity: 0, y: 60 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.8, 
      ease: [0.6, 0.01, 0.05, 0.95],
      delay: delay
    } 
  }
});

const gridViewVariants = (staggerAmount = 0.1, delayAmount = 0.1) => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: staggerAmount,
      delayChildren: delayAmount,
      when: "beforeChildren"
    }
  }
});

// Define internal variants FIRST
const itemFadeUp = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

const iconPopIn = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    transition: { type: "spring", stiffness: 200, damping: 15, delay: 0.1 } 
  }
};

const textSlideIn = (delay = 0.05) => ({
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0, 
      transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1], delay: delay } 
    }
});

const buttonAppear = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut", delay: 0.2 } }
};

const imageZoomIn = {
    hidden: { opacity: 0, scale: 1.05 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] } }
};

const numberSlideUp = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut", delay: 0.05 } }
};

// Now define variants that USE the internal ones
const heroContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.1,
      staggerChildren: 0.15,
    }
  }
};

const heroTitleWordVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1],
    }
  }
};

const heroSubtitleVariants = { ...itemFadeUp, visible: { ...itemFadeUp.visible, transition: { ...itemFadeUp.visible.transition, duration: 0.5 } } };
const heroButtonAppear = { ...buttonAppear };
const heroStatsContainerVariants = { ...gridViewVariants(0.1, 0) };
const heroStatItemVariants = { ...itemFadeUp };

// UPDATED: Card variants now stagger children
const cardViewVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { 
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1], 
      staggerChildren: 0.06,
      delayChildren: 0.1 
    }
  }
};

const stepCardViewVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: { 
    opacity: 1, 
    x: 0, 
    transition: { 
      duration: 0.5, 
      ease: "easeOut", 
      staggerChildren: 0.08, 
      delayChildren: 0.1 
    } 
  }
};

const testimonialCardViewVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { 
      type: "spring", 
      stiffness: 100, 
      damping: 12, 
      staggerChildren: 0.06, 
      delayChildren: 0.15 
    }
  }
};

// Simplify the AnimatedSection implementation to avoid potential issues
const AnimatedSection = ({ children, variants, className, as = 'section', style, useParallax = false, parallaxAmount = -50, staggerChildren = false, staggerDelay = 0.1 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { 
    once: true, 
    amount: 0.15
  }); 
  
  // Handle mobile vs desktop differently
  const isMobile = useRef(window.innerWidth <= 768).current;
  
  // Determine the component to render
  const Component = motion[as] || motion.section;

  // Simplified parallax with fewer transformations
  const { scrollYProgress } = useScroll({ 
    target: ref, 
    offset: ["start end", "end start"] 
  });
  
  // Reduce parallax effect on mobile for better performance
  const mobileParallaxAmount = parallaxAmount * 0.5;
  
  // Always call useTransform unconditionally to follow React Hook rules
  const parallaxY = useTransform(
    scrollYProgress, 
    [0, 1], 
    [0, isMobile ? mobileParallaxAmount : parallaxAmount]
  );
  
  // Then use its value conditionally
  const yValue = useParallax ? parallaxY : 0;

  return (
    <Component
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants}
      className={`${className} ${useParallax ? 'will-change-transform' : ''}`}
      style={{ 
        ...style, 
        y: yValue
      }}
    >
      {children}
    </Component>
  );
};

// Define a reusable child animation variant for staggered animations
const childAnimVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1]
    }
  }
};

// Simple component to wrap child elements for staggered animations
const AnimatedItem = ({ children, className, style, delay = 0 }) => {
  const variant = {
    ...childAnimVariant,
    visible: {
      ...childAnimVariant.visible,
      transition: {
        ...childAnimVariant.visible.transition,
        delay
      }
    }
  };

  return (
    <motion.div
      variants={variant}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
};

// --- Styled Components (Wrap relevant ones with AnimatedSection or motion) ---
const MotionContainer = styled(motion.div)`
  max-width: 100%;
  width: 100%;
  margin: 0 auto;
  padding: 24px;
  background-color: var(--color-paper-light);
  backdrop-filter: blur(5px);
  border-radius: 16px;
  box-shadow: ${props => props.theme === 'dark' 
    ? '0 8px 32px rgba(0, 0, 0, 0.4)' 
    : '0 8px 32px rgba(59, 44, 53, 0.1)'
  };
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
  min-height: 100vh; /* Ensure container is tall enough */
  min-height: -webkit-fill-available; /* iOS height fix */
  position: relative; /* Ensure proper stacking context */
  
  @media (max-width: 768px) {
    padding: 16px 12px;
    border-radius: 0;
    overflow-x: hidden; /* Prevent horizontal scrolling on mobile */
  }
`;

// Define CSS Keyframes for the gradient animation
const gradientAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

// Change from motion.section to section, remove motion props later
const HeroSectionStyled = styled.section` 
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, var(--color-dark) 0%, var(--color-primary) 100%);
  background-size: 200% 200%;
  color: white;
  padding: ${props => props.$isAuthenticated ? '60px 40px' : '100px 40px'};
  text-align: center;
  border-radius: 24px;
  margin-bottom: 60px;
  box-shadow: ${props => props.theme === 'dark'
    ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
    : '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
  };
  
  // Apply the CSS animation
  animation: ${gradientAnimation} 15s linear infinite;
  
  // Add simple opacity transition if needed
  opacity: 1; // Start visible
  transition: opacity 0.7s ease-out; // Simple fade-in (optional)

  &::before { 
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(
      circle at center,
      rgba(255, 255, 255, ${props => props.theme === 'dark' ? '0.05' : '0.1'}) 0%,
      rgba(255, 255, 255, 0) 70%
    );
    z-index: 0;
  }
  
  @media (max-width: 768px) {
    padding: ${props => props.$isAuthenticated ? '40px 20px' : '60px 20px'};
    border-radius: 16px;
    margin-bottom: 40px;
  }
  
  @media (max-width: 480px) {
    padding: ${props => props.$isAuthenticated ? '30px 16px' : '50px 16px'};
  }
`;

// Keep MotionHeroContent for internal animations
const MotionHeroContent = styled(motion.div)`
  position: relative;
  z-index: 1;
`;

const MotionRecipesSection = styled(AnimatedSection).attrs({ 
  useParallax: true, 
  parallaxAmount: -20
})`
  margin-bottom: 60px;
  position: relative;
  padding: 40px;
  border-radius: 24px;
  background: var(--color-secondary-light);
  border: 1px solid var(--color-border);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
`;

const MotionUSPSection = styled(AnimatedSection).attrs({ 
  useParallax: true, 
  parallaxAmount: 10
})`
  margin-top: -30px;
  margin-bottom: 60px;
  position: relative;
  z-index: 2;
`;

const MotionExampleRecipesSection = styled(AnimatedSection).attrs({ 
  useParallax: true, 
  parallaxAmount: -15
})`
  margin-bottom: 60px;
`;

const MotionStepSection = styled(AnimatedSection)`
  margin-bottom: 80px;
`;

const MotionFeatureSection = styled(AnimatedSection).attrs({ 
  useParallax: true, 
  parallaxAmount: -20
})`
  margin-bottom: 60px;
`;

const MotionTestimonialSection = styled(AnimatedSection).attrs({ 
  useParallax: true, 
  parallaxAmount: 10
})`
  margin-bottom: 60px;
  padding: 40px;
  border-radius: 24px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: ${props => props.theme === 'dark'
    ? '0 8px 32px rgba(0, 0, 0, 0.2)'
    : '0 8px 32px rgba(0, 0, 0, 0.1)'
  };
`;

const MotionFeatureGrid = styled(AnimatedSection).attrs({ 
  as: 'div', 
  staggerChildren: true,
  staggerDelay: 0.15
})`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
  
  @media (max-width: 1200px) {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const MotionRecipeGrid = styled(AnimatedSection).attrs({ 
  as: 'div',
  staggerChildren: true,
  staggerDelay: 0.12
})`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-top: 20px;
  
  @media (max-width: 1200px) {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 16px;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const MotionStepGrid = styled(AnimatedSection).attrs({ 
  as: 'div',
  staggerChildren: true,
  staggerDelay: 0.15
})`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 40px;
  margin-top: 40px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 30px;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 40px; /* Keep larger gap for steps when stacked */
  }
`;

const MotionTestimonialGrid = styled(AnimatedSection).attrs({ 
  as: 'div',
  staggerChildren: true,
  staggerDelay: 0.18
})`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-top: 40px;
`;

const MotionFeatureCardWrapper = styled(AnimatedItem)`
  position: relative;
  height: 100%;
  border-radius: 16px;
`;

const MotionRecipeCardWrapper = styled(AnimatedItem)`
  position: relative;
  height: 100%;
  border-radius: 16px;
`;

const MotionFeatureCard = styled(motion(FeatureCard))`
  transform-style: preserve-3d;
  transition: transform 0.3s ease-out, box-shadow 0.3s ease-out, background-color 0.3s ease;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  
  @media (max-width: 768px) {
    min-height: 300px;
  }
  
  @media (max-width: 480px) {
    min-height: auto;
  }
  
  &:hover {
    transform: translateY(-8px) scale(1.01);
  }
`;

const MotionRecipeCard = styled(motion(RecipeCard))`
  transform-style: preserve-3d;
  transition: transform 0.3s ease-out, box-shadow 0.3s ease-out, background-color 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
  
  @media (max-width: 480px) {
    min-height: 350px;
  }
`;

const MotionStepCard = styled(motion.div)`
  position: relative;
  padding: 24px;
  border-radius: 16px;
  background: var(--color-paper-light);
  box-shadow: ${props => props.theme === 'dark'
    ? '0 10px 30px rgba(0, 0, 0, 0.2)'
    : '0 10px 30px rgba(0, 0, 0, 0.05)'
  };
  border: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: background-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease;
  transform-style: preserve-3d;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: ${props => props.theme === 'dark'
      ? '0 15px 35px rgba(0, 0, 0, 0.25)'
      : '0 15px 35px rgba(0, 0, 0, 0.08)'
    };
  }
`;

const MotionTestimonialCard = styled(motion.div)`
  background: ${props => props.theme === 'dark'
    ? 'rgba(40, 40, 40, 0.7)'
    : 'rgba(255, 255, 255, 0.7)'
  };
  border-radius: 16px;
  padding: 24px;
  box-shadow: ${props => props.theme === 'dark'
    ? '0 4px 20px rgba(0, 0, 0, 0.2)'
    : '0 4px 20px rgba(0, 0, 0, 0.05)'
  };
  display: flex;
  flex-direction: column;
  border: 1px solid ${props => props.theme === 'dark'
    ? 'var(--color-gray-300)'
    : 'var(--color-gray-200)'
  };
  transition: background-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease;
  transform-style: preserve-3d;
  
  &:hover {
    transform: translateY(-5px) scale(1.02);
    box-shadow: ${props => props.theme === 'dark'
      ? '0 10px 30px rgba(0, 0, 0, 0.3)'
      : '0 10px 30px rgba(0, 0, 0, 0.1)'
    };
  }
`;

// Update the card hover effect for smoother transitions
const cardHoverEffect = { 
  scale: 1.02, 
  y: -8, 
  transition: { 
    duration: 0.3,
    ease: [0.25, 0.1, 0.25, 1]
  } 
};

// Add the slide animation components after the existing animations
const slideIn = keyframes`
  from {
    opacity: 0;
    transform: scale(1.05) translateX(5%);
  }
  to {
    opacity: 1;
    transform: scale(1) translateX(0);
  }
`;

const slideOut = keyframes`
  0% {
    opacity: 1;
    transform: scale(1) translateX(0);
  }
  100% {
    opacity: 0;
    transform: scale(0.95) translateX(-5%);
  }
`;

// Add the slideshow container and related components
const SlideContainer = styled.div`
  height: 400px;
  border-radius: 16px;
  margin: 40px auto;
  position: relative;
  overflow: hidden;
  box-shadow: ${({ theme }) => 
    theme === 'dark'
      ? '0 10px 30px rgba(0, 0, 0, 0.3), 0 0 50px rgba(var(--color-primary-rgb), 0.15)'
      : '0 10px 30px rgba(0, 0, 0, 0.15)'
  };
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  max-width: 100%;
  width: 100%;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: ${({ theme }) => 
      theme === 'dark'
        ? '0 15px 40px rgba(0, 0, 0, 0.4), 0 0 60px rgba(var(--color-primary-rgb), 0.2)'
        : '0 15px 40px rgba(0, 0, 0, 0.2)'
    };
  }
  
  @media (max-width: 768px) {
    height: 300px;
    margin: 30px auto;
  }
  
  @media (max-width: 480px) {
    height: 250px;
    margin: 20px auto;
    border-radius: 12px;
  }
`;

const Slide = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url(${props => props.image});
  background-size: cover;
  background-position: center;
  animation: ${props => props.$entering ? slideIn : (props.$exiting ? slideOut : 'none')} 0.9s ease forwards;
  animation-delay: ${props => props.$exiting ? '0.1s' : '0s'};
  opacity: ${props => props.$active || props.$exiting ? 1 : 0};
  z-index: ${props => props.$active ? 2 : (props.$exiting ? 1 : 0)};
`;

const SlideshowRecipeTitle = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background: linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0));
  color: white;
  padding: 1.5rem;
  font-weight: 600;
  z-index: 3;
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
  display: flex;
  flex-direction: column;
  
  span {
    font-size: 0.9rem;
    opacity: 0.9;
    margin-top: 5px;
    font-weight: 400;
  }
`;

const ProgressBar = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  right: 10px;
  height: 3px;
  background: rgba(255, 255, 255, 0.3);
  z-index: 3;
  border-radius: 2px;
  overflow: hidden;
`;

const Progress = styled.div`
  height: 100%;
  background-color: var(--color-primary);
  width: ${props => props.$progress}%;
  transition: width 0.1s linear;
`;

// Update the RecipeSlideshow component to fix linter errors and restore progress animation
const RecipeSlideshow = ({ theme }) => {
  const recipes = [
    { 
      id: 1, 
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
      title: 'Frischer Gemüsesalat',
      description: 'Knackiges Gemüse mit Quinoa und Avocado'
    },
    { 
      id: 2, 
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38',
      title: 'Hausgemachte Pizza',
      description: 'Mit frischem Basilikum und Büffelmozzarella'
    },
    { 
      id: 3, 
      image: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543',
      title: 'Gebratener Lachs',
      description: 'Mit Zitrone und Kräutern auf Gemüsebett'
    },
    { 
      id: 4, 
      image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836',
      title: 'Mediterranes Grillgericht',
      description: 'Mit Oliven, Feta und frischen Kräutern'
    },
    { 
      id: 5, 
      image: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601',
      title: 'Frühstücks-Bowl',
      description: 'Mit Joghurt, frischen Früchten und Granola'
    }
  ];

  const SLIDE_DURATION = 8000; // 8 seconds per slide
  const ANIMATION_DURATION = 1000; // Animation duration in ms
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const [prevSlide, setPrevSlide] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState([]);
  const slideshowRef = useRef(null);
  const intervalRef = useRef(null);
  const progressIntervalRef = useRef(null);
  
  // Add image preloading
  useEffect(() => {
    const preloadImages = async () => {
      const promises = recipes.map((recipe) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.src = recipe.image;
          img.onload = () => {
            setImagesLoaded(prev => [...prev, recipe.id]);
            resolve();
          };
          img.onerror = resolve; // Continue even if an image fails to load
        });
      });
      
      // Wait for all images to load or 5 seconds, whichever comes first
      const timeout = new Promise(resolve => setTimeout(resolve, 5000));
      await Promise.race([Promise.all(promises), timeout]);
    };
    
    preloadImages();
  }, []);
  
  // Add swipe gesture handling for mobile
  const goToNextSlide = useCallback(() => {
    if (!isAnimating) {
      setIsAnimating(true);
      setPrevSlide(currentSlide);
      
      // Set the new slide index
      setCurrentSlide((prev) => (prev + 1) % recipes.length);
      
      // Keep progress bar at 100% during transition
      setProgress(100);
      
      // Reset progress after animation completes
      setTimeout(() => {
        setProgress(0);
        setIsAnimating(false);
      }, ANIMATION_DURATION);
      
      // Keep the previous slide reference a bit longer for the animation
      setTimeout(() => {
        setPrevSlide(null);
      }, ANIMATION_DURATION + 200);
    }
  }, [currentSlide, isAnimating, recipes.length]);
  
  const goToPrevSlide = useCallback(() => {
    if (!isAnimating) {
      setIsAnimating(true);
      setPrevSlide(currentSlide);
      
      // Set the new slide index (handle wrapping around to the end)
      setCurrentSlide((prev) => (prev - 1 + recipes.length) % recipes.length);
      
      // Keep progress bar at 100% during transition
      setProgress(100);
      
      // Reset progress after animation completes
      setTimeout(() => {
        setProgress(0);
        setIsAnimating(false);
      }, ANIMATION_DURATION);
      
      // Keep the previous slide reference a bit longer for the animation
      setTimeout(() => {
        setPrevSlide(null);
      }, ANIMATION_DURATION + 200);
    }
  }, [currentSlide, isAnimating, recipes.length]);
  
  // Handle touch events for mobile swipe
  useEffect(() => {
    if (!slideshowRef.current) return;
    
    let touchStartX = 0;
    let touchEndX = 0;
    
    const handleTouchStart = (e) => {
      touchStartX = e.changedTouches[0].screenX;
    };
    
    const handleTouchEnd = (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    };
    
    const handleSwipe = () => {
      // Detect direction
      if (touchStartX - touchEndX > 50) {
        // Swipe left - next slide
        goToNextSlide();
      } else if (touchEndX - touchStartX > 50) {
        // Swipe right - previous slide
        goToPrevSlide();
      }
    };
    
    const slideElement = slideshowRef.current;
    slideElement.addEventListener('touchstart', handleTouchStart, { passive: true });
    slideElement.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    return () => {
      if (slideElement) {
        slideElement.removeEventListener('touchstart', handleTouchStart);
        slideElement.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [goToNextSlide, goToPrevSlide]);
  
  // Add parallax effect to the slideshow
  const { scrollYProgress } = useScroll({
    target: slideshowRef,
    offset: ["start end", "end start"]
  });
  
  // Restore progress animation
  useEffect(() => {
    // Don't start progress animation during slide transition
    if (isAnimating) return;
    
    // Start the progress animation
    const progressStep = 100 / (SLIDE_DURATION / 50); // Calculate progress increment
    
    progressIntervalRef.current = setInterval(() => {
      setProgress(prev => {
        // When progress reaches 100, trigger slide change
        if (prev >= 100) {
          goToNextSlide();
          return 100; // Keep at 100% during transition
        }
        return prev + progressStep;
      });
    }, 50);
    
    // Clean up interval on unmount or when dependencies change
    return () => {
      clearInterval(progressIntervalRef.current);
    };
  }, [goToNextSlide, isAnimating]);

  // Set up slide change timer
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      // This is a backup timer in case the progress-based trigger fails
      if (progress >= 99 && !isAnimating) {
        goToNextSlide();
      }
    }, SLIDE_DURATION);

    return () => {
      clearInterval(intervalRef.current);
    };
  }, [goToNextSlide, progress, isAnimating]);
  
  // Create subtle scale and opacity effects based on scroll
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.95, 1, 0.98]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 1], [0.8, 1, 0.9]);

  return (
    <motion.div
      ref={slideshowRef}
      style={{
        scale,
        opacity,
        willChange: 'transform, opacity',
        transformStyle: 'preserve-3d'
      }}
      className="will-change-transform"
    >
      <SlideContainer theme={theme}>
        <ProgressBar>
          <Progress $progress={progress} />
        </ProgressBar>
        
        <AnimatePresence>
          {recipes.map((recipe, index) => (
            (index === currentSlide || index === prevSlide) && (
              <Slide 
                key={recipe.id}
                image={recipe.image}
                $active={index === currentSlide}
                $entering={index === currentSlide && prevSlide !== null}
                $exiting={index === prevSlide}
                style={{ 
                  opacity: imagesLoaded.includes(recipe.id) ? undefined : 0 
                }}
              />
            )
          ))}
        </AnimatePresence>
        
        <SlideshowRecipeTitle>
          {recipes[currentSlide].title}
          <span>{recipes[currentSlide].description}</span>
        </SlideshowRecipeTitle>
      </SlideContainer>
    </motion.div>
  );
};

// Create a simplified fallback component we can use if things fail
const SimplePage = ({ children, theme }) => {
  return (
    <div style={{
      maxWidth: '100%',
      width: '100%',
      margin: '0 auto',
      padding: '24px',
      backgroundColor: 'var(--color-paper-light)',
      borderRadius: '16px',
      boxShadow: theme === 'dark' 
        ? '0 8px 32px rgba(0, 0, 0, 0.4)' 
        : '0 8px 32px rgba(59, 44, 53, 0.1)',
      minHeight: '100vh'
    }}>
      {children}
    </div>
  );
};

// Add a helper to check if menu button is visible
const checkMenuVisibility = () => {
  // Check if the hamburger menu is currently displayed
  // This will return true for mobile devices where the menu button is visible
  const header = document.querySelector('header');
  if (!header) return false;
  
  const hamburgerButton = header.querySelector('button[aria-label="Menu"]');
  return hamburgerButton && window.getComputedStyle(hamburgerButton).display !== 'none';
};

// Add handlers to ensure menu interaction works properly
const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const { theme } = useTheme();
  const [hasError, setHasError] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [menuVisible, setMenuVisible] = useState(false);

  const heroSubtitleText = isAuthenticated 
    ? "Entdecke Rezepte basierend auf deinen Zutaten, erhalte Unterstützung beim Kochen und profitiere von intelligenten Funktionen für ein besseres Kocherlebnis."
    : "Verwandle Reste in köstliche Gerichte! Entdecke tausende KI-generierte Rezepte basierend auf deinen vorhandenen Zutaten und reduziere Lebensmittelabfälle.";

  // Simple error boundary for the HomePage
  useEffect(() => {
    const handleError = (error) => {
      console.error('HomePage error caught:', error);
      setHasError(true);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);
  
  // Detect screen size changes
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      
      // Check hamburger menu visibility on resize
      setMenuVisible(checkMenuVisibility());
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Check for hamburger menu clicks
  useEffect(() => {
    // Handle clicks on the hamburger menu
    const handleMenuClick = () => {
      // Update state based on current menu visibility
      setTimeout(() => {
        setMenuVisible(document.body.style.overflow === 'hidden');
      }, 100);
    };
    
    const hamburgerButton = document.querySelector('button[aria-label="Menu"]');
    if (hamburgerButton) {
      hamburgerButton.addEventListener('click', handleMenuClick);
      return () => hamburgerButton.removeEventListener('click', handleMenuClick);
    }
  }, [isMobile]);
  
  // Handle link clicks to close the menu
  const handleLinkClick = () => {
    if (menuVisible) {
      const hamburgerButton = document.querySelector('button[aria-label="Menu"]');
      if (hamburgerButton) {
        hamburgerButton.click(); // Close the menu by clicking the button
      }
    }
  };

  // If we have an error, render a simplified page
  if (hasError) {
    return (
      <SimplePage theme={theme}>
        <h1>Dein KI-gestützter Koch-Assistent</h1>
        <p>{heroSubtitleText}</p>
        {isAuthenticated ? (
          <Button as={Link} to="/recipes" variant="primary">
            Rezepte entdecken
          </Button>
        ) : (
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', margin: '32px 0' }}>
            <Button as={Link} to="/register" variant="primary">
              Kostenlos starten
            </Button>
            <Button as={Link} to="/login" variant="secondary">
              Anmelden
            </Button>
          </div>
        )}
      </SimplePage>
    );
  }

  // Regular rendering if no errors
  return (
    <>
      <GlobalScrollStyle />
      <MotionContainer 
        initial="hidden" 
        animate="visible" 
        variants={{ visible: { transition: { } } }}
        theme={theme}
        onClick={menuVisible ? handleLinkClick : undefined}
      >
        <HeroSectionStyled 
          $isAuthenticated={isAuthenticated}
          theme={theme}
        >
          <MotionHeroContent
            initial="hidden"
            animate="visible"
            variants={heroContainerVariants}
          >
            <motion.div variants={itemFadeUp}>
              <HeroTitle>
                <motion.span style={{ display: 'inline-block' }} variants={heroTitleWordVariants}>Dein&nbsp;</motion.span>
                <motion.span style={{ display: 'inline-block' }} variants={heroTitleWordVariants}><GradientText>KI-gestützter</GradientText>&nbsp;</motion.span>
                <motion.span style={{ display: 'inline-block' }} variants={heroTitleWordVariants}>Koch-Assistent</motion.span>
              </HeroTitle>
            </motion.div>
            
            <motion.div variants={heroSubtitleVariants}>
              <HeroSubtitle>{heroSubtitleText}</HeroSubtitle>
            </motion.div>
            
            {isAuthenticated ? (
              <motion.div variants={heroButtonAppear}><ButtonWrapper>
                <GradientButtonLink to="/recipes" $variant="primary" onClick={handleLinkClick}>
                  Rezepte entdecken
                </GradientButtonLink>
              </ButtonWrapper></motion.div>
            ) : (
              <motion.div variants={heroButtonAppear}><HeroButtons>
                <GradientButtonLink to="/register" $variant="primary" onClick={handleLinkClick}>
                  Kostenlos starten
                </GradientButtonLink>
                <GradientButtonLink to="/login" $variant="variant" onClick={handleLinkClick}>
                  Anmelden
                </GradientButtonLink>
              </HeroButtons></motion.div>
            )}
            
            {!isAuthenticated && (
              <motion.div variants={heroStatsContainerVariants}>
                <HeroStats>
                  <motion.div variants={heroStatItemVariants}><StatItem>
                    <StatNumber>5.000+</StatNumber>
                    <StatLabel>Verfügbare Rezepte</StatLabel>
                  </StatItem></motion.div>
                  <motion.div variants={heroStatItemVariants}><StatItem>
                    <StatNumber>2.500+</StatNumber>
                    <StatLabel>Zufriedene Nutzer</StatLabel>
                  </StatItem></motion.div>
                  <motion.div variants={heroStatItemVariants}><StatItem>
                    <StatNumber>98%</StatNumber>
                    <StatLabel>Positive Bewertungen</StatLabel>
                  </StatItem></motion.div>
                </HeroStats>
              </motion.div>
            )}
          </MotionHeroContent>
        </HeroSectionStyled>

        <AnimatedSection
          variants={sectionViewVariants(0.2)}
          className="container mx-auto py-12 px-4"
        >
          <SectionHeader>
            <GradientTitle>Entdecke unsere beliebtesten Rezepte</GradientTitle>
            <SectionDescription>
              Lass dich von unseren köstlichen Gerichten inspirieren und entdecke neue Favoriten für deine Küche.
            </SectionDescription>
          </SectionHeader>
          
          <RecipeSlideshow theme={theme} />
        </AnimatedSection>

        {isAuthenticated ? (
          <MotionRecipesSection variants={sectionViewVariants()} theme={theme}>
            <motion.div variants={itemFadeUp}><SectionHeader>
              <SectionTitle>Deine <GradientText>gespeicherten</GradientText> Rezepte</SectionTitle>
              <SectionDescription>
                Schneller Zugriff auf deine Lieblingsrezepte und kürzlich erstellte Gerichte
              </SectionDescription>
            </SectionHeader></motion.div>
            
            <motion.div variants={itemFadeUp}><SavedRecipesList /></motion.div>
          </MotionRecipesSection>
        ) : null}
        
        {!isAuthenticated && (
          <div style={{ 
            display: 'flex', 
            flexDirection: isMobile ? 'column' : 'row', 
            flexWrap: 'wrap', 
            gap: isMobile ? '2rem' : '3rem',
            margin: '0',
            padding: isMobile ? '1rem 0' : '2rem 0'
          }}>
            <div style={{ 
              flex: '1 1 48%', 
              minWidth: isMobile ? '100%' : '400px',
              maxWidth: '100%',
              margin: '0'
            }}>
              <MotionUSPSection variants={sectionViewVariants(0.1)} theme={theme}>
                <USPCard theme={theme}>
                  <USPContent>
                    <motion.div variants={itemFadeUp}><USPTitle>Kein Lebensmittelverschwendung mehr!</USPTitle></motion.div>
                    <motion.div variants={itemFadeUp}><USPText>
                      Aus Resten wird Genuss! Unser KI-Rezeptgenerator zaubert aus deinen übrigen Zutaten leckere Gerichte, statt sie wegzuwerfen. Egal was in deinem Kühlschrank übrig ist – die KI findet immer einen Weg, daraus etwas Schmackhaftes zu kreieren.
                    </USPText></motion.div>
                  </USPContent>
                </USPCard>
              </MotionUSPSection>
            </div>
            
            <div style={{ 
              flex: '1 1 48%', 
              minWidth: isMobile ? '100%' : '400px',
              maxWidth: '100%',
              margin: '0'
            }}>
              <MotionStepSection variants={sectionViewVariants(0.1)} theme={theme}>
                <motion.div variants={itemFadeUp}><SectionHeader>
                  <GradientTitle>In 3 einfachen Schritten zu deinem perfekten Rezept</GradientTitle>
                  <SectionDescription>
                    Unser Koch-Assistent macht es dir so einfach wie nie zuvor, passende Rezepte zu finden und zuzubereiten
                  </SectionDescription>
                </SectionHeader></motion.div>
                
                <MotionStepGrid variants={gridViewVariants(0.15)} theme={theme}>
                  <MotionStepCard variants={stepCardViewVariants} theme={theme}>
                    <motion.div variants={numberSlideUp}><StepNumber>1</StepNumber></motion.div>
                    <motion.div variants={iconPopIn}><StepIcon>🥕</StepIcon></motion.div>
                    <motion.div variants={textSlideIn(0.1)}><StepTitle>Zutaten eingeben</StepTitle></motion.div>
                    <motion.div variants={itemFadeUp}><StepDescription>
                      Teile uns mit, welche Zutaten du zu Hause hast oder was du verbrauchen möchtest
                    </StepDescription></motion.div>
                  </MotionStepCard>
                  
                  <MotionStepCard variants={stepCardViewVariants} theme={theme}>
                    <motion.div variants={numberSlideUp}><StepNumber>2</StepNumber></motion.div>
                    <motion.div variants={iconPopIn}><StepIcon>✨</StepIcon></motion.div>
                    <motion.div variants={textSlideIn(0.1)}><StepTitle>KI generiert Rezepte</StepTitle></motion.div>
                    <motion.div variants={itemFadeUp}><StepDescription>
                      Unsere KI findet passende Rezepte basierend auf deinen Zutaten und Präferenzen
                    </StepDescription></motion.div>
                  </MotionStepCard>
                  
                  <MotionStepCard variants={stepCardViewVariants} theme={theme}>
                    <motion.div variants={numberSlideUp}><StepNumber>3</StepNumber></motion.div>
                    <motion.div variants={iconPopIn}><StepIcon>🍽️</StepIcon></motion.div>
                    <motion.div variants={textSlideIn(0.1)}><StepTitle>Kochen & Genießen</StepTitle></motion.div>
                    <motion.div variants={itemFadeUp}><StepDescription>
                      Folge der Schritt-für-Schritt-Anleitung und genieße dein perfekt zubereitetes Gericht
                    </StepDescription></motion.div>
                  </MotionStepCard>
                </MotionStepGrid>
              </MotionStepSection>
            </div>
          </div>
        )}
        
        {!isAuthenticated && (
          <MotionExampleRecipesSection variants={sectionViewVariants()} theme={theme}>
            <motion.div variants={itemFadeUp}><SectionHeader>
              <GradientTitle>Beispielrezepte aus Resten</GradientTitle>
              <SectionDescription>
                Sieh dir an, was du mit übrigen Zutaten zaubern kannst
              </SectionDescription>
            </SectionHeader></motion.div>
            
            <MotionRecipeGrid variants={gridViewVariants()} theme={theme}>
              <MotionRecipeCardWrapper variants={cardViewVariants} whileHover={cardHoverEffect}>
                <GlowingEffect
                  variant="carrot"
                  spread={40}
                  glow={true}
                  disabled={false}
                  proximity={64}
                  inactiveZone={0.01}
                  borderWidth={2}
                />
                <MotionRecipeCard theme={theme}>
                  <motion.div variants={imageZoomIn}><ThumbnailContainer>
                    <RecipeThumbnail>🥦</RecipeThumbnail>
                  </ThumbnailContainer></motion.div>
                  <motion.div variants={textSlideIn(0.1)}><RecipeTitle>Gemüsereste-Frittata</RecipeTitle></motion.div>
                  <motion.div variants={itemFadeUp}><RecipeInfo>
                    <div>Schwierigkeit: Einfach</div>
                    <div>Zubereitungszeit: 25 Min.</div>
                  </RecipeInfo></motion.div>
                  <motion.div variants={itemFadeUp}><RecipeDescription>
                    Verwerte übrige Gemüsereste wie Brokkoli, Paprika und Kartoffeln in einer leckeren Frittata mit Eiern und Käse.
                  </RecipeDescription></motion.div>
                  <motion.div variants={itemFadeUp}><TagsContainer>
                    <Tag>KI-generiert</Tag>
                    <Tag>Vegetarisch</Tag>
                    <Tag>Resteverwertung</Tag>
                  </TagsContainer></motion.div>
                  <motion.div variants={buttonAppear}><Button as={Link} to="/example-recipe/gemuesefrittata" variant="primary">
                    Rezept ansehen
                  </Button></motion.div>
                </MotionRecipeCard>
              </MotionRecipeCardWrapper>
              
              <MotionRecipeCardWrapper variants={cardViewVariants} whileHover={cardHoverEffect}>
                <GlowingEffect
                  variant="mint"
                  spread={40}
                  glow={true}
                  disabled={false}
                  proximity={64}
                  inactiveZone={0.01}
                  borderWidth={2}
                />
                <MotionRecipeCard theme={theme}>
                  <motion.div variants={imageZoomIn}><ThumbnailContainer>
                    <RecipeThumbnail>🍚</RecipeThumbnail>
                  </ThumbnailContainer></motion.div>
                  <motion.div variants={textSlideIn(0.1)}><RecipeTitle>Gebratener Reis mit Resten</RecipeTitle></motion.div>
                  <motion.div variants={itemFadeUp}><RecipeInfo>
                    <div>Schwierigkeit: Einfach</div>
                    <div>Zubereitungszeit: 20 Min.</div>
                  </RecipeInfo></motion.div>
                  <motion.div variants={itemFadeUp}><RecipeDescription>
                    Aus übriggebliebenem Reis und kleinen Mengen Gemüse, Ei und Fleisch entsteht ein köstliches Gericht in nur einer Pfanne.
                  </RecipeDescription></motion.div>
                  <motion.div variants={itemFadeUp}><TagsContainer>
                    <Tag>KI-generiert</Tag>
                    <Tag>Schnell</Tag>
                    <Tag>One-Pot</Tag>
                  </TagsContainer></motion.div>
                  <motion.div variants={buttonAppear}><Button as={Link} to="/example-recipe/gebratenerreis" variant="primary">
                    Rezept ansehen
                  </Button></motion.div>
                </MotionRecipeCard>
              </MotionRecipeCardWrapper>
              
              <MotionRecipeCardWrapper variants={cardViewVariants} whileHover={cardHoverEffect}>
                <GlowingEffect
                  variant="turmeric"
                  spread={40}
                  glow={true}
                  disabled={false}
                  proximity={64}
                  inactiveZone={0.01}
                  borderWidth={2}
                />
                <MotionRecipeCard theme={theme}>
                  <motion.div variants={imageZoomIn}><ThumbnailContainer>
                    <RecipeThumbnail>🍲</RecipeThumbnail>
                  </ThumbnailContainer></motion.div>
                  <motion.div variants={textSlideIn(0.1)}><RecipeTitle>Suppe aus Gemüseenden</RecipeTitle></motion.div>
                  <motion.div variants={itemFadeUp}><RecipeInfo>
                    <div>Schwierigkeit: Mittel</div>
                    <div>Zubereitungszeit: 45 Min.</div>
                  </RecipeInfo></motion.div>
                  <motion.div variants={itemFadeUp}><RecipeDescription>
                    Statt wegzuwerfen: Aus Gemüseenden, -schalen und übrigen Kräutern wird eine nahrhafte und leckere Suppe.
                  </RecipeDescription></motion.div>
                  <motion.div variants={itemFadeUp}><TagsContainer>
                    <Tag>KI-generiert</Tag>
                    <Tag>Vegan</Tag>
                    <Tag>Zero-Waste</Tag>
                  </TagsContainer></motion.div>
                  <motion.div variants={buttonAppear}><Button as={Link} to="/example-recipe/gemuesesuppe" variant="primary">
                    Rezept ansehen
                  </Button></motion.div>
                </MotionRecipeCard>
              </MotionRecipeCardWrapper>
            </MotionRecipeGrid>
          </MotionExampleRecipesSection>
        )}
        
        <div style={{ 
          display: 'flex', 
          flexDirection: 'row', 
          flexWrap: 'wrap', 
          gap: '3.5rem',
          margin: '0',
          padding: '2rem 0 1rem'
        }}>
          <div style={{ 
            flex: '1 1 65%', 
            minWidth: '450px',
            maxWidth: '100%',
            margin: '0' 
          }}>
            <MotionFeatureSection variants={sectionViewVariants()} theme={theme}>
              <motion.div variants={itemFadeUp}><SectionHeader>
                <GradientTitle>Funktionen & Möglichkeiten</GradientTitle>
                <SectionDescription>
                  Entdecke alle Werkzeuge, die deine Kocherfahrung auf ein neues Level heben
                </SectionDescription>
              </SectionHeader></motion.div>
              
              <MotionFeatureGrid variants={gridViewVariants()} theme={theme}>
                <MotionFeatureCardWrapper variants={childAnimVariant}>
                  <GlowingEffect
                    variant="carrot"
                    spread={40}
                    glow={true}
                    disabled={false}
                    proximity={64}
                    inactiveZone={0.01}
                    borderWidth={2}
                  />
                  <MotionFeatureCard theme={theme}>
                    <motion.div variants={iconPopIn}><FeatureIcon role="img" aria-label="Rezepte">🍲</FeatureIcon></motion.div>
                    <motion.div variants={textSlideIn(0.1)}><FeatureTitle>Personalisierte Rezepte</FeatureTitle></motion.div>
                    <motion.div variants={itemFadeUp}><FeatureDescription>
                      Generiere Rezepte basierend auf den Zutaten, die du zu Hause hast, 
                      und deinen persönlichen Präferenzen.
                    </FeatureDescription></motion.div>
                    <motion.div variants={buttonAppear}>{isAuthenticated ? (
                      <Button as={Link} to="/recipes" variant="primary" style={{ marginTop: 'auto' }}>
                        Rezept erstellen
                      </Button>
                    ) : (
                      <Button variant="secondary" style={{ marginTop: 'auto' }}>
                        Mehr erfahren
                      </Button>
                    )}</motion.div>
                  </MotionFeatureCard>
                </MotionFeatureCardWrapper>
                
                <MotionFeatureCardWrapper variants={childAnimVariant}>
                  <GlowingEffect
                    variant="mint"
                    spread={40}
                    glow={true}
                    disabled={false}
                    proximity={64}
                    inactiveZone={0.01}
                    borderWidth={2}
                  />
                  <MotionFeatureCard theme={theme}>
                    <motion.div variants={iconPopIn}><FeatureIcon role="img" aria-label="Übersetzung">🌍</FeatureIcon></motion.div>
                    <motion.div variants={textSlideIn(0.1)}><FeatureTitle>Mehrsprachige Unterstützung</FeatureTitle></motion.div>
                    <motion.div variants={itemFadeUp}><FeatureDescription>
                      Übersetze Rezepte und Anleitungen in deine bevorzugte Sprache für
                      eine nahtlose Kocherfahrung.
                    </FeatureDescription></motion.div>
                    <motion.div variants={buttonAppear}>{isAuthenticated ? (
                      <Button as={Link} to="/profile" variant="primary" style={{ marginTop: 'auto' }}>
                        Profil anpassen
                      </Button>
                    ) : (
                      <Button variant="secondary" style={{ marginTop: 'auto' }}>
                        Mehr erfahren
                      </Button>
                    )}</motion.div>
                  </MotionFeatureCard>
                </MotionFeatureCardWrapper>
                
                <MotionFeatureCardWrapper variants={childAnimVariant}>
                  <GlowingEffect
                    variant="turmeric"
                    spread={40}
                    glow={true}
                    disabled={false}
                    proximity={64}
                    inactiveZone={0.01}
                    borderWidth={2}
                  />
                  <MotionFeatureCard theme={theme}>
                    <motion.div variants={iconPopIn}><FeatureIcon role="img" aria-label="Einkaufsliste">🛒</FeatureIcon></motion.div>
                    <motion.div variants={textSlideIn(0.1)}><FeatureTitle>Automatische Einkaufsliste</FeatureTitle></motion.div>
                    <motion.div variants={itemFadeUp}><FeatureDescription>
                      Erstelle automatisch Einkaufslisten aus deinen ausgewählten Rezepten
                      und speichere sie für deinen nächsten Einkauf.
                    </FeatureDescription></motion.div>
                    <motion.div variants={buttonAppear}>{isAuthenticated ? (
                      <Button as={Link} to="/shopping" variant="primary" style={{ marginTop: 'auto' }}>
                        Zur Einkaufsliste
                      </Button>
                    ) : (
                      <Button variant="secondary" style={{ marginTop: 'auto' }}>
                        Mehr erfahren
                      </Button>
                    )}</motion.div>
                  </MotionFeatureCard>
                </MotionFeatureCardWrapper>
              </MotionFeatureGrid>
            </MotionFeatureSection>
          </div>
          
          {!isAuthenticated && (
            <div style={{ 
              flex: '1 1 30%', 
              minWidth: '350px',
              maxWidth: '100%',
              margin: '0'
            }}>
              <MotionTestimonialSection variants={sectionViewVariants(0.1)} theme={theme}>
                <motion.div variants={itemFadeUp}><SectionHeader>
                  <GradientTitle>Was unsere Nutzer sagen</GradientTitle>
                  <SectionDescription>
                    Erfahre, wie Koch-Assistent das kulinarische Leben unserer Nutzer verändert hat
                  </SectionDescription>
                </SectionHeader></motion.div>
                
                <MotionTestimonialGrid variants={gridViewVariants(0.1, 0.2)} theme={theme} style={{ flexDirection: 'column' }}>
                  <MotionTestimonialCard variants={testimonialCardViewVariants} theme={theme}>
                    <motion.div variants={iconPopIn}><QuoteIcon>❝</QuoteIcon></motion.div>
                    <motion.div variants={itemFadeUp}><TestimonialText>
                      "Seit ich den Koch-Assistenten nutze, werfe ich kaum noch Lebensmittel weg. 
                      Die App schlägt mir immer passende Rezepte vor, wenn ich Zutaten verbrauchen muss."
                    </TestimonialText></motion.div>
                    <motion.div variants={itemFadeUp}><TestimonialAuthor>
                      <AuthorAvatar>👩</AuthorAvatar>
                      <AuthorInfo>
                        <AuthorName>Sarah M.</AuthorName>
                        <AuthorTitle>Nutzerin seit 6 Monaten</AuthorTitle>
                      </AuthorInfo>
                    </TestimonialAuthor></motion.div>
                  </MotionTestimonialCard>
                  
                  <MotionTestimonialCard variants={testimonialCardViewVariants} theme={theme}>
                    <motion.div variants={iconPopIn}><QuoteIcon>❝</QuoteIcon></motion.div>
                    <motion.div variants={itemFadeUp}><TestimonialText>
                      "Die KI-Vorschläge sind erstaunlich kreativ! Ich habe schon so viele neue Gerichte 
                      entdeckt, die ich jetzt regelmäßig koche. Absolute Empfehlung für jeden Hobbykoch."
                    </TestimonialText></motion.div>
                    <motion.div variants={itemFadeUp}><TestimonialAuthor>
                      <AuthorAvatar>👨</AuthorAvatar>
                      <AuthorInfo>
                        <AuthorName>Thomas K.</AuthorName>
                        <AuthorTitle>Hobbykoch & Food-Blogger</AuthorTitle>
                      </AuthorInfo>
                    </TestimonialAuthor></motion.div>
                  </MotionTestimonialCard>
                  
                  <MotionTestimonialCard variants={testimonialCardViewVariants} theme={theme}>
                    <motion.div variants={iconPopIn}><QuoteIcon>❝</QuoteIcon></motion.div>
                    <motion.div variants={itemFadeUp}><TestimonialText>
                      "Als berufstätige Mutter spare ich so viel Zeit bei der Mahlzeitenplanung. 
                      Die Einkaufslisten-Funktion ist genial und der Koch-Assistent hilft mir, wenn 
                      ich mal nicht weiter weiß."
                    </TestimonialText></motion.div>
                    <motion.div variants={itemFadeUp}><TestimonialAuthor>
                      <AuthorAvatar>👩</AuthorAvatar>
                      <AuthorInfo>
                        <AuthorName>Lisa T.</AuthorName>
                        <AuthorTitle>Familienmutter & Vielbeschäftigte</AuthorTitle>
                      </AuthorInfo>
                    </TestimonialAuthor></motion.div>
                  </MotionTestimonialCard>
                </MotionTestimonialGrid>
              </MotionTestimonialSection>
            </div>
          )}
        </div>
      </MotionContainer>
    </>
  );
};

export default HomePage; 