import React, { useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { Link } from 'react-router-dom';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import Button from '../../shared/components/common/Button';
import Card from '../../shared/components/common/Card';
import SavedRecipesList from '../../shared/components/recipe/SavedRecipesList';
import { GradientButton } from '../../shared/components/ui/GradientButton';
import { GlowingEffect } from '../../shared/components/ui/GlowingEffect';
import '../../shared/components/ui/glowing-effect.css';
import { useAuth } from '../../shared/hooks/useAuth';

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
  }
`;

const StyledLink = styled(Link)`
  display: block;
  text-decoration: none;
  
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
`;

const SectionTitle = styled.h2`
  font-size: clamp(1.75rem, 3vw, 2.25rem);
  font-weight: 700;
  margin-bottom: 12px;
  color: var(--color-dark);
`;

const GradientTitle = styled(SectionTitle)`
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const SectionDescription = styled.p`
  font-size: 1.125rem;
  max-width: 600px;
  margin: 0 auto;
  color: var(--color-text);
  line-height: 1.6;
`;

const FeatureCard = styled(Card)`
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 32px;
  border-radius: 16px;
  background: white;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05), 
              0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--color-border);
  transition: transform 0.2s ease-out, box-shadow 0.2s ease-out;
  z-index: 1;
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08), 
                0 1px 5px rgba(0, 0, 0, 0.03);
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
  
  @media (max-width: 640px) {
    flex-direction: column;
    align-items: center;
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
  }
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StatNumber = styled.div`
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 8px;
  background: linear-gradient(135deg, var(--color-maize) 0%, white 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
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
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
      radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.2) 0%, transparent 30%),
      radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.2) 0%, transparent 30%);
    z-index: 0;
  }
`;

const USPContent = styled.div`
  position: relative;
  z-index: 1;
  max-width: 800px;
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
  max-width: 700px;
`;

const RecipeCard = styled(Card)`
  display: flex;
  flex-direction: column;
  height: 100%;
  transition: transform 0.2s ease-out, box-shadow 0.2s ease-out;
  
  &:hover {
    transform: translateY(-4px);
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

// --- Helper Component for InView Animation (with optional Parallax) ---
const AnimatedSection = ({ children, variants, className, as = 'section', style, useParallax = false, parallaxAmount = -50 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 }); 
  const MotionComponent = motion[as];

  // Parallax Logic - Hooks must be called unconditionally
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, parallaxAmount]);

  // Conditionally apply the parallax effect to the style
  const finalY = useParallax ? parallaxY : undefined;

  return (
    <MotionComponent
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants}
      className={className}
      style={{ ...style, y: finalY }}
    >
      {children}
    </MotionComponent>
  );
};

// --- Styled Components (Wrap relevant ones with AnimatedSection or motion) ---
const MotionContainer = styled(motion.div)`
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  background-color: var(--color-paper-light);
  backdrop-filter: blur(5px);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(59, 44, 53, 0.1);
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
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  
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
      rgba(255, 255, 255, 0.1) 0%,
      rgba(255, 255, 255, 0) 70%
    );
    z-index: 0;
  }
`;

// Keep MotionHeroContent for internal animations
const MotionHeroContent = styled(motion.div)`
  position: relative;
  z-index: 1;
`;

const MotionRecipesSection = styled(AnimatedSection).attrs({ useParallax: true, parallaxAmount: -60 })`
  margin-bottom: 60px;
  position: relative;
  padding: 40px;
  border-radius: 24px;
  background: var(--color-secondary-light);
  border: 1px solid var(--color-border);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
`;

const MotionUSPSection = styled(AnimatedSection).attrs({ useParallax: true, parallaxAmount: 30 })`
  margin-top: -30px;
  margin-bottom: 60px;
  position: relative;
  z-index: 2;
`;

const MotionExampleRecipesSection = styled(AnimatedSection).attrs({ useParallax: true, parallaxAmount: -40 })`
  margin-bottom: 60px;
`;

const MotionStepSection = styled(AnimatedSection)`
  margin-bottom: 80px;
`;

const MotionFeatureSection = styled(AnimatedSection).attrs({ useParallax: true, parallaxAmount: -50 })`
  margin-bottom: 60px;
`;

const MotionTestimonialSection = styled(AnimatedSection).attrs({ useParallax: true, parallaxAmount: 20 })`
  margin-bottom: 60px;
  padding: 40px;
  border-radius: 24px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
`;

const MotionFeatureGrid = styled(AnimatedSection).attrs({ as: 'div' })`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
`;

const MotionRecipeGrid = styled(AnimatedSection).attrs({ as: 'div' })`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

const MotionStepGrid = styled(AnimatedSection).attrs({ as: 'div' })`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 40px;
  margin-top: 40px;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const MotionTestimonialGrid = styled(AnimatedSection).attrs({ as: 'div' })`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-top: 40px;
`;

const MotionFeatureCardWrapper = styled(motion.div)`
  position: relative;
  height: 100%;
  border-radius: 16px;
`;

const MotionRecipeCardWrapper = styled(motion.div)`
  position: relative;
  height: 100%;
  border-radius: 16px;
`;

const MotionFeatureCard = styled(motion(FeatureCard))``;
const MotionRecipeCard = styled(motion(RecipeCard))``;
const MotionStepCard = styled(motion.div)`
  position: relative;
  padding: 24px;
  border-radius: 16px;
  background: white;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--color-gray-100);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;
const MotionTestimonialCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.7);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
`;

const cardHoverEffect = { scale: 1.03, y: -5, transition: { duration: 0.2 } };

const HomePage = () => {
  const { isAuthenticated } = useAuth();

  const heroSubtitleText = isAuthenticated 
    ? "Entdecke Rezepte basierend auf deinen Zutaten, erhalte Unterstützung beim Kochen und profitiere von intelligenten Funktionen für ein besseres Kocherlebnis."
    : "Verwandle Reste in köstliche Gerichte! Entdecke tausende KI-generierte Rezepte basierend auf deinen vorhandenen Zutaten und reduziere Lebensmittelabfälle.";

  return (
    <MotionContainer 
      initial="hidden" 
      animate="visible" 
      variants={{ visible: { transition: { } } }}
    >
      <HeroSectionStyled 
        $isAuthenticated={isAuthenticated}
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
              <GradientButtonLink to="/recipes" $variant="primary">
                Rezepte entdecken
              </GradientButtonLink>
            </ButtonWrapper></motion.div>
          ) : (
            <motion.div variants={heroButtonAppear}><HeroButtons>
              <GradientButtonLink to="/register" $variant="primary">
                Kostenlos starten
              </GradientButtonLink>
              <GradientButtonLink to="/login" $variant="variant">
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

      {isAuthenticated ? (
        <MotionRecipesSection variants={sectionViewVariants()}>
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
        <MotionUSPSection variants={sectionViewVariants(0.1)}>
          <USPCard>
            <USPContent>
              <motion.div variants={itemFadeUp}><USPTitle>Kein Lebensmittelverschwendung mehr!</USPTitle></motion.div>
              <motion.div variants={itemFadeUp}><USPText>
                Aus Resten wird Genuss! Unser KI-Rezeptgenerator zaubert aus deinen übrigen Zutaten leckere Gerichte, statt sie wegzuwerfen. Egal was in deinem Kühlschrank übrig ist – die KI findet immer einen Weg, daraus etwas Schmackhaftes zu kreieren.
              </USPText></motion.div>
            </USPContent>
          </USPCard>
        </MotionUSPSection>
      )}
      
      {!isAuthenticated && (
        <MotionExampleRecipesSection variants={sectionViewVariants()}>
          <motion.div variants={itemFadeUp}><SectionHeader>
            <GradientTitle>Beispielrezepte aus Resten</GradientTitle>
            <SectionDescription>
              Sieh dir an, was du mit übrigen Zutaten zaubern kannst
            </SectionDescription>
          </SectionHeader></motion.div>
          
          <MotionRecipeGrid variants={gridViewVariants()}>
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
              <MotionRecipeCard>
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
              <MotionRecipeCard>
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
              <MotionRecipeCard>
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
      
      {!isAuthenticated && (
        <MotionStepSection variants={sectionViewVariants(0.1)}>
          <motion.div variants={itemFadeUp}><SectionHeader>
            <GradientTitle>In 3 einfachen Schritten zu deinem perfekten Rezept</GradientTitle>
            <SectionDescription>
              Unser Koch-Assistent macht es dir so einfach wie nie zuvor, passende Rezepte zu finden und zuzubereiten
            </SectionDescription>
          </SectionHeader></motion.div>
          
          <MotionStepGrid variants={gridViewVariants(0.15)}>
            <MotionStepCard variants={stepCardViewVariants}>
              <motion.div variants={numberSlideUp}><StepNumber>1</StepNumber></motion.div>
              <motion.div variants={iconPopIn}><StepIcon>🥕</StepIcon></motion.div>
              <motion.div variants={textSlideIn(0.1)}><StepTitle>Zutaten eingeben</StepTitle></motion.div>
              <motion.div variants={itemFadeUp}><StepDescription>
                Teile uns mit, welche Zutaten du zu Hause hast oder was du verbrauchen möchtest
              </StepDescription></motion.div>
            </MotionStepCard>
            
            <MotionStepCard variants={stepCardViewVariants}>
              <motion.div variants={numberSlideUp}><StepNumber>2</StepNumber></motion.div>
              <motion.div variants={iconPopIn}><StepIcon>✨</StepIcon></motion.div>
              <motion.div variants={textSlideIn(0.1)}><StepTitle>KI generiert Rezepte</StepTitle></motion.div>
              <motion.div variants={itemFadeUp}><StepDescription>
                Unsere KI findet passende Rezepte basierend auf deinen Zutaten und Präferenzen
              </StepDescription></motion.div>
            </MotionStepCard>
            
            <MotionStepCard variants={stepCardViewVariants}>
              <motion.div variants={numberSlideUp}><StepNumber>3</StepNumber></motion.div>
              <motion.div variants={iconPopIn}><StepIcon>🍽️</StepIcon></motion.div>
              <motion.div variants={textSlideIn(0.1)}><StepTitle>Kochen & Genießen</StepTitle></motion.div>
              <motion.div variants={itemFadeUp}><StepDescription>
                Folge der Schritt-für-Schritt-Anleitung und genieße dein perfekt zubereitetes Gericht
              </StepDescription></motion.div>
            </MotionStepCard>
          </MotionStepGrid>
        </MotionStepSection>
      )}
      
      <MotionFeatureSection variants={sectionViewVariants()}>
        <motion.div variants={itemFadeUp}><SectionHeader>
          <GradientTitle>Funktionen & Möglichkeiten</GradientTitle>
          <SectionDescription>
            Entdecke alle Werkzeuge, die deine Kocherfahrung auf ein neues Level heben
          </SectionDescription>
        </SectionHeader></motion.div>
        
        <MotionFeatureGrid variants={gridViewVariants()}>
          <MotionFeatureCardWrapper variants={cardViewVariants}>
            <GlowingEffect
              variant="carrot"
              spread={40}
              glow={true}
              disabled={false}
              proximity={64}
              inactiveZone={0.01}
              borderWidth={2}
            />
            <MotionFeatureCard>
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
          
          <MotionFeatureCardWrapper variants={cardViewVariants}>
            <GlowingEffect
              variant="mint"
              spread={40}
              glow={true}
              disabled={false}
              proximity={64}
              inactiveZone={0.01}
              borderWidth={2}
            />
            <MotionFeatureCard>
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
          
          <MotionFeatureCardWrapper variants={cardViewVariants}>
            <GlowingEffect
              variant="turmeric"
              spread={40}
              glow={true}
              disabled={false}
              proximity={64}
              inactiveZone={0.01}
              borderWidth={2}
            />
            <MotionFeatureCard>
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
      
      {!isAuthenticated && (
        <MotionTestimonialSection variants={sectionViewVariants(0.1)}>
          <motion.div variants={itemFadeUp}><SectionHeader>
            <GradientTitle>Was unsere Nutzer sagen</GradientTitle>
            <SectionDescription>
              Erfahre, wie Koch-Assistent das kulinarische Leben unserer Nutzer verändert hat
            </SectionDescription>
          </SectionHeader></motion.div>
          
          <MotionTestimonialGrid variants={gridViewVariants(0.1, 0.2)}>
            <MotionTestimonialCard variants={testimonialCardViewVariants}>
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
            
            <MotionTestimonialCard variants={testimonialCardViewVariants}>
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
            
            <MotionTestimonialCard variants={testimonialCardViewVariants}>
              <motion.div variants={iconPopIn}><QuoteIcon>❝</QuoteIcon></motion.div>
              <motion.div variants={itemFadeUp}><TestimonialText>
                "Als berufstätige Mutter spare ich so viel Zeit bei der Mahlzeitenplanung. 
                Die Einkaufslisten-Funktion ist genial und der Koch-Assistent hilft mir, wenn 
                ich mal nicht weiter weiß."
              </TestimonialText></motion.div>
              <motion.div variants={itemFadeUp}><TestimonialAuthor>
                <AuthorAvatar>👩‍👧</AuthorAvatar>
                <AuthorInfo>
                  <AuthorName>Lisa T.</AuthorName>
                  <AuthorTitle>Familienmutter & Vielbeschäftigte</AuthorTitle>
                </AuthorInfo>
              </TestimonialAuthor></motion.div>
            </MotionTestimonialCard>
          </MotionTestimonialGrid>
        </MotionTestimonialSection>
      )}
    </MotionContainer>
  );
};

export default HomePage; 