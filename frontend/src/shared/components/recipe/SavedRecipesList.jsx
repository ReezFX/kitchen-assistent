import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useRecipes } from '../../hooks/useRecipes';
import Card from '../common/Card';
import Button from '../common/Button';
import { useTheme } from '../../context/ThemeContext';
import { FaUtensils, FaClock, FaSearch, FaStar, FaRegStar, FaTrashAlt, FaEye } from 'react-icons/fa';
import { GradientButton } from '../ui/GradientButton';

const RecipeGridContainer = styled.div`
  position: relative;
  margin-bottom: 40px;
`;

const SearchContainer = styled.div`
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
`;

const SearchBox = styled.div`
  position: relative;
  flex: 1;
  min-width: 250px;
  max-width: 400px;
  
  svg {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--color-gray-400);
    font-size: 16px;
  }
`;

const SearchInput = styled.input`
  padding: 12px 12px 12px 40px;
  border-radius: 10px;
  border: 1px solid var(--color-border);
  width: 100%;
  font-size: 14px;
  background-color: var(--color-background);
  color: var(--color-text-primary);
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px var(--color-primary-light);
  }
  
  &::placeholder {
    color: var(--color-gray-400);
  }
`;

const SortSelect = styled.select`
  padding: 12px;
  border-radius: 10px;
  border: 1px solid var(--color-border);
  background-color: var(--color-background);
  color: var(--color-text-primary);
  font-size: 14px;
  min-width: 150px;
  cursor: pointer;
`;

const RecipeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 25px;
  margin-top: 20px;
`;

const RecipeCard = styled(motion.div)`
  background-color: var(--color-paper-light);
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
  transition: all 0.3s ease;
  border: 1px solid var(--color-border);
  box-shadow: ${props => props.theme === 'dark' 
    ? '0 4px 8px rgba(0, 0, 0, 0.25)' 
    : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'};
  
  &:hover {
    transform: translateY(-6px);
    box-shadow: ${props => props.theme === 'dark'
      ? '0 10px 20px rgba(0, 0, 0, 0.35)'
      : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'};
  }
`;

const RecipeContent = styled.div`
  padding: 16px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

const RecipeTitle = styled.h3`
  font-size: 18px;
  margin-bottom: 10px;
  color: var(--color-text-primary);
  font-weight: 600;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
`;

const RecipeInfo = styled.div`
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-bottom: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const RecipeInfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  
  svg {
    color: var(--color-primary);
    font-size: 14px;
  }
`;

const Tag = styled.span`
  display: inline-block;
  background-color: ${props => props.theme === 'dark' 
    ? 'var(--color-gray-300)'
    : 'var(--color-gray-200)'};
  color: ${props => props.theme === 'dark'
    ? 'var(--color-gray-900)'
    : 'var(--color-gray-600)'};
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 20px;
  margin-right: 6px;
  margin-bottom: 6px;
  white-space: nowrap;
  
  ${props => props.highlight && `
    background-color: var(--color-primary-light);
    color: var(--color-primary);
  `}
`;

const ButtonContainer = styled.div`
  margin-top: auto;
  display: flex;
  gap: 10px;
  padding-top: 16px;
  border-top: 1px solid var(--color-border);
`;

const ActionButton = styled(Button)`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  
  svg {
    font-size: 14px;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 40px;
  background-color: ${props => props.theme === 'dark' 
    ? 'var(--color-gray-100)' 
    : 'var(--color-gray-50)'};
  border-radius: 12px;
  margin-top: 20px;
  border: 1px dashed var(--color-border);
  position: relative;
`;

const EmptyStateIcon = styled.div`
  font-size: 60px;
  margin-bottom: 20px;
  color: var(--color-primary);
`;

const Loading = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px;
  font-weight: 500;
  color: var(--color-primary);
  font-size: 18px;
`;

const Error = styled.div`
  color: var(--color-danger);
  padding: 16px;
  border-radius: 8px;
  background-color: var(--color-danger-hover);
  margin-top: 20px;
`;

// Neue Komponente für das Thumbnail
const ThumbnailContainer = styled.div`
  position: relative;
  width: 100%;
  height: 180px;
  overflow: hidden;
`;

const RecipeThumbnail = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;

  ${RecipeCard}:hover & {
    transform: scale(1.08);
  }
`;

const FavoriteButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.9);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--color-primary);
  font-size: 18px;
  transition: all 0.2s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
  
  &:hover {
    background-color: white;
    transform: scale(1.1);
  }
`;

const DifficultyBadge = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 5px;
  
  svg {
    font-size: 12px;
  }
`;

const PlaceholderThumbnail = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--color-gray-200) 0%, var(--color-gray-100) 100%);
  color: var(--color-primary);
  font-size: 60px;
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 16px;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 30px;
  gap: 8px;
`;

const PaginationButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid var(--color-border);
  background-color: ${props => props.active ? 'var(--color-primary)' : 'var(--color-background)'};
  color: ${props => props.active ? 'white' : 'var(--color-text-primary)'};
  font-weight: ${props => props.active ? '600' : '400'};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background-color: ${props => props.active ? 'var(--color-primary)' : 'var(--color-gray-100)'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ITEMS_PER_PAGE = 6;

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: "easeOut"
    }
  })
};

const SavedRecipesList = () => {
  const navigate = useNavigate();
  const { recipes, deleteRecipe, loading, error } = useRecipes();
  const { theme } = useTheme();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('newest');
  const [favorites, setFavorites] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  
  const toggleFavorite = (id) => {
    setFavorites(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  
  const handleViewRecipe = (id) => {
    navigate(`/recipes/${id}`);
  };
  
  const handleDeleteRecipe = async (id, event) => {
    event.stopPropagation();
    if (window.confirm('Möchtest du dieses Rezept wirklich löschen?')) {
      try {
        await deleteRecipe(id);
      } catch (error) {
        console.error('Fehler beim Löschen des Rezepts:', error);
      }
    }
  };
  
  // Helper function to get text for difficulty
  const getDifficultyText = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'Einfach';
      case 'medium': return 'Mittel';
      case 'hard': return 'Anspruchsvoll';
      default: return 'Mittel';
    }
  };
  
  // Filter and sort recipes
  const filteredRecipes = recipes
    .filter(recipe => 
      recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (recipe.cuisine && recipe.cuisine.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (recipe.tags && recipe.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
    )
    .sort((a, b) => {
      if (sortOption === 'newest') {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      } else if (sortOption === 'oldest') {
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      } else if (sortOption === 'alphabetical') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredRecipes.length / ITEMS_PER_PAGE);
  const paginatedRecipes = filteredRecipes.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  if (loading) {
    return <Loading>Deine kulinarische Sammlung wird geladen<span>...</span></Loading>;
  }
  
  if (error) {
    return <Error>{error}</Error>;
  }
  
  if (recipes.length === 0) {
    return (
      <EmptyState theme={theme}>
        <EmptyStateIcon>📝</EmptyStateIcon>
        <h2 style={{ marginBottom: '12px', color: 'var(--color-text-primary)' }}>
          Deine Rezeptsammlung ist noch leer
        </h2>
        <p style={{ marginBottom: '24px', color: 'var(--color-text-secondary)', maxWidth: '500px', margin: '0 auto 30px' }}>
          Du hast noch keine Rezepte gespeichert. Erstelle dein erstes personalisiertes Rezept mit unserem Rezeptgenerator!
        </p>
        <GradientButton onClick={() => navigate('/recipes')} $variant="variant">
          Erstes Rezept erstellen
        </GradientButton>
      </EmptyState>
    );
  }
  
  return (
    <RecipeGridContainer>
      <SearchContainer>
        <SearchBox>
          <FaSearch />
          <SearchInput
            type="text"
            placeholder="Rezepte durchsuchen..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </SearchBox>
        
        <SortSelect 
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
        >
          <option value="newest">Neueste zuerst</option>
          <option value="oldest">Älteste zuerst</option>
          <option value="alphabetical">Alphabetisch</option>
        </SortSelect>
      </SearchContainer>
      
      {filteredRecipes.length === 0 ? (
        <EmptyState theme={theme}>
          <EmptyStateIcon>🔍</EmptyStateIcon>
          <h3>Keine Rezepte gefunden</h3>
          <p>Versuche es mit anderen Suchbegriffen oder erstelle ein neues Rezept.</p>
        </EmptyState>
      ) : (
        <>
          <RecipeGrid>
            {paginatedRecipes.map((recipe, index) => (
              <RecipeCard 
                key={recipe._id}
                theme={theme}
                onClick={() => handleViewRecipe(recipe._id)}
                variants={cardVariants}
                custom={index}
                initial="hidden"
                animate="visible"
                whileHover={{ scale: 1.02 }}
              >
                <ThumbnailContainer>
                  {recipe.image && recipe.image.data ? (
                    <RecipeThumbnail 
                      src={`data:${recipe.image.contentType};base64,${recipe.image.data}`} 
                      alt={recipe.title}
                    />
                  ) : (
                    <PlaceholderThumbnail>
                      {recipe.emoji || '🍽️'}
                    </PlaceholderThumbnail>
                  )}
                  
                  <FavoriteButton 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(recipe._id);
                    }}
                  >
                    {favorites[recipe._id] ? <FaStar /> : <FaRegStar />}
                  </FavoriteButton>
                  
                  <DifficultyBadge>
                    <FaUtensils />
                    {getDifficultyText(recipe.difficulty)}
                  </DifficultyBadge>
                </ThumbnailContainer>
                
                <RecipeContent>
                  <RecipeTitle>{recipe.title}</RecipeTitle>
                  
                  <RecipeInfo>
                    {recipe.cuisine && (
                      <RecipeInfoItem>
                        <FaUtensils />
                        <span>{recipe.cuisine}</span>
                      </RecipeInfoItem>
                    )}
                    {(recipe.prepTime || recipe.cookTime) && (
                      <RecipeInfoItem>
                        <FaClock />
                        <span>
                          {recipe.prepTime && `${recipe.prepTime} Min.`}
                          {recipe.prepTime && recipe.cookTime && ' + '}
                          {recipe.cookTime && `${recipe.cookTime} Min.`}
                        </span>
                      </RecipeInfoItem>
                    )}
                  </RecipeInfo>
                  
                  <TagsContainer>
                    {recipe.isAIGenerated && (
                      <Tag theme={theme} highlight={true}>KI-generiert</Tag>
                    )}
                    {recipe.dietaryRestrictions && recipe.dietaryRestrictions.map((diet, index) => (
                      <Tag key={index} theme={theme}>{diet}</Tag>
                    ))}
                    {recipe.tags && recipe.tags.slice(0, 2).map((tag, index) => (
                      <Tag key={index} theme={theme}>{tag}</Tag>
                    ))}
                  </TagsContainer>
                  
                  <ButtonContainer>
                    <ActionButton 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewRecipe(recipe._id);
                      }}
                      variant="primary"
                    >
                      <FaEye /> Ansehen
                    </ActionButton>
                    <ActionButton 
                      onClick={(e) => handleDeleteRecipe(recipe._id, e)}
                      variant="danger"
                    >
                      <FaTrashAlt /> Löschen
                    </ActionButton>
                  </ButtonContainer>
                </RecipeContent>
              </RecipeCard>
            ))}
          </RecipeGrid>
          
          {totalPages > 1 && (
            <Pagination>
              <PaginationButton
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                &lt;
              </PaginationButton>
              
              {[...Array(totalPages)].map((_, i) => (
                <PaginationButton
                  key={i}
                  active={currentPage === i + 1}
                  onClick={() => handlePageChange(i + 1)}
                >
                  {i + 1}
                </PaginationButton>
              ))}
              
              <PaginationButton
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                &gt;
              </PaginationButton>
            </Pagination>
          )}
        </>
      )}
    </RecipeGridContainer>
  );
};

export default SavedRecipesList; 