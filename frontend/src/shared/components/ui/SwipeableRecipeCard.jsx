import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { FaBookmark, FaHeart, FaShare, FaRegHeart, FaRegBookmark } from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext';

const CardContainer = styled(motion.div)`
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  background-color: var(--color-paper);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 16px;
  touch-action: pan-y;
  transform-origin: center;
  border: 1px solid var(--color-border);
  
  @media (min-width: 769px) {
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    
    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
    }
  }
`;

const CardImage = styled.div`
  width: 100%;
  height: 200px;
  background-image: ${props => props.imageUrl ? `url(${props.imageUrl})` : 'none'};
  background-color: ${props => props.imageUrl ? 'transparent' : 'var(--color-gray-200)'};
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  
  /* Gradient overlay for better text readability */
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 100px;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.6), transparent);
    pointer-events: none;
  }
`;

const CardContent = styled.div`
  padding: 16px;
`;

const CardTitle = styled.h3`
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
`;

const CardMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: var(--color-text-secondary);
`;

const Tags = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 8px;
  flex-wrap: wrap;
`;

const Tag = styled.span`
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 12px;
  background-color: var(--color-gray-100);
  color: var(--color-text-secondary);
`;

const CardActions = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 12px 16px;
  border-top: 1px solid var(--color-border);
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--color-text-secondary);
  padding: 6px 10px;
  font-size: 14px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover, &:active {
    background-color: var(--color-gray-100);
    color: var(--color-primary);
  }
  
  svg {
    font-size: 16px;
  }
`;

const SwipeIndicator = styled(motion.div)`
  position: absolute;
  top: 0;
  height: 100%;
  width: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  z-index: 0;
  
  &.like {
    left: 0;
    background-color: #4caf50;
  }
  
  &.save {
    right: 0;
    background-color: #2196f3;
  }
`;

const SwipeableRecipeCard = ({ 
  recipe, 
  onLike, 
  onSave,
  onShare,
  isLiked = false,
  isSaved = false
}) => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  
  // Set up swipe functionality
  const x = useMotionValue(0);
  const background = useTransform(
    x, 
    [-150, 0, 150], 
    [
      'rgba(76, 175, 80, 0.2)', 
      'rgba(0, 0, 0, 0)', 
      'rgba(33, 150, 243, 0.2)'
    ]
  );
  
  const handleDragEnd = (_, info) => {
    const { offset } = info;
    
    if (offset.x < -100) {
      onLike && onLike(recipe.id);
    } else if (offset.x > 100) {
      onSave && onSave(recipe.id);
    }
  };
  
  const handleCardClick = () => {
    navigate(`/recipes/${recipe.id}`);
  };
  
  return (
    <CardContainer 
      style={{ background }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      whileTap={{ scale: 0.98 }}
      onClick={handleCardClick}
    >
      <AnimatePresence>
        {x.get() < -50 && (
          <SwipeIndicator 
            className="like"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <FaHeart />
          </SwipeIndicator>
        )}
        
        {x.get() > 50 && (
          <SwipeIndicator 
            className="save"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <FaBookmark />
          </SwipeIndicator>
        )}
      </AnimatePresence>
      
      <CardImage 
        imageUrl={recipe.imageUrl} 
        style={{ x }}
      >
        {!recipe.imageUrl && recipe.emoji}
      </CardImage>
      
      <CardContent>
        <CardTitle>{recipe.title}</CardTitle>
        <CardMeta>
          <span>{recipe.prepTime + recipe.cookTime} Min.</span>
          <span>{recipe.difficulty === 'easy' ? 'Einfach' : recipe.difficulty === 'medium' ? 'Mittel' : 'Anspruchsvoll'}</span>
        </CardMeta>
        
        <Tags>
          {recipe.tags && recipe.tags.slice(0, 3).map((tag, index) => (
            <Tag key={index}>{tag}</Tag>
          ))}
        </Tags>
      </CardContent>
      
      <CardActions>
        <ActionButton onClick={(e) => { e.stopPropagation(); onLike && onLike(recipe.id); }}>
          {isLiked ? <FaHeart color="var(--color-danger)" /> : <FaRegHeart />}
          {isLiked ? 'Gefällt dir' : 'Gefällt mir'}
        </ActionButton>
        
        <ActionButton onClick={(e) => { e.stopPropagation(); onShare && onShare(recipe.id); }}>
          <FaShare />
          Teilen
        </ActionButton>
        
        <ActionButton onClick={(e) => { e.stopPropagation(); onSave && onSave(recipe.id); }}>
          {isSaved ? <FaBookmark color="var(--color-primary)" /> : <FaRegBookmark />}
          {isSaved ? 'Gespeichert' : 'Speichern'}
        </ActionButton>
      </CardActions>
    </CardContainer>
  );
};

export default SwipeableRecipeCard; 