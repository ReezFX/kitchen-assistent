import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useRecipes } from '../../hooks/useRecipes';
import { useAIService } from '../../hooks/useAIService';
import Button from '../common/Button';
import ImageUpload from '../common/ImageUpload';
import { FaUtensils, FaClock, FaArrowRight, FaArrowLeft, FaEdit, FaTrash, FaChevronLeft, FaPaperPlane } from 'react-icons/fa';

// --- Base Styles inspired by Apple Design ---

const PageContainer = styled.div`
  background-color: #f9f9f9; // Slightly off-white background
  min-height: 100vh;
  padding: 0; // Remove padding, handle within sections
`;

const ContentWrapper = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 20px; // Main content padding
  background-color: #ffffff; // White content area
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-radius: 16px; // Softer corners
  margin-top: 30px;
  margin-bottom: 30px;
`;

const RecipeHeader = styled.header`
  margin-bottom: 40px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e5e5e5; // Lighter separator
`;

const HeaderTopRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start; // Align items to the top
  margin-bottom: 24px;
`;

const RecipeTitle = styled.h1`
  font-size: 34px; // Larger title
  font-weight: 700;
  color: #1d1d1f; // Apple's near-black
  line-height: 1.2;
  margin: 0;
`;

const EditButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: #007aff; // Apple blue
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  padding: 8px; // Easier click target
  border-radius: 8px;
  transition: background-color 0.2s ease;
  margin-left: 16px; // Space from title

  &:hover {
    background-color: rgba(0, 122, 255, 0.1);
  }
`;

const RecipeImageWrapper = styled.div`
  margin-bottom: 24px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  aspect-ratio: 16 / 9; // Maintain aspect ratio
  background-color: #f0f0f0; // Placeholder color

  img {
    width: 100%;
    height: 100%;
    object-fit: cover; // Cover the area
    display: block;
  }
`;

const ImageSection = styled.div`
  margin-bottom: 24px;
  padding: 20px;
  background-color: #f2f2f7; // Light gray background for edit section
  border-radius: 12px;

  h3 {
    font-size: 18px;
    font-weight: 600;
    color: #1d1d1f;
    margin-top: 0;
    margin-bottom: 16px;
  }
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
`;

const Tag = styled.span`
  display: inline-block;
  background-color: #e5e5e5; // Lighter gray
  color: #555; // Darker gray text
  font-size: 13px;
  font-weight: 500;
  padding: 5px 12px;
  border-radius: 16px; // More rounded pills
`;

const RecipeMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 24px; // Increased gap
  color: #636366; // Apple's secondary text color
  font-size: 15px;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  
  span {
    color: #636366; // Secondary text
  }
  
  strong {
    color: #1d1d1f; // Primary text
    font-weight: 600;
  }
`;

// --- Section Styles ---

const Section = styled.section`
  margin-bottom: 40px;
`;

const SectionTitle = styled.h2`
  font-size: 24px;
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e5e5e5; // Subtle separator
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e5e5e5; // Subtle separator
`;

// --- Ingredient Styles ---

const IngredientList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  // Adjust grid columns for better spacing
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
`;

const Ingredient = styled.li`
  display: flex;
  align-items: baseline; // Align text baselines
  gap: 10px;
  padding: 12px;
  background-color: #f2f2f7; // Light gray background
  border-radius: 10px;
  font-size: 15px;
  
  strong {
    color: #1d1d1f; // Primary text
    font-weight: 600;
    min-width: 70px; // Adjust as needed
    text-align: right;
  }
  
  span {
    color: #3c3c43; // Slightly darker secondary
    flex-grow: 1;
  }
`;

// --- Steps Styles ---

const StepsList = styled.ol`
  list-style: none; // Remove default list styling
  padding: 0;
  margin: 0;
  counter-reset: steps;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Step = styled.li`
  counter-increment: steps;
  display: flex;
  gap: 16px;
  background-color: #ffffff; // White background for steps
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06); // Subtle shadow
  position: relative; // For the number
  line-height: 1.6;

  // Step Number Styling (Apple-like)
  &::before {
    content: counter(steps);
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 32px;
    height: 32px;
    background-color: #f2f2f7; // Light gray background
    color: #636366; // Secondary text color
    font-weight: 600;
    font-size: 16px;
    border-radius: 50%;
    flex-shrink: 0; // Prevent shrinking
    margin-top: 2px; // Align with first line of text
  }

  .step-content {
    flex-grow: 1;
  }

  .step-title {
    font-weight: 600;
    font-size: 17px;
    margin-bottom: 8px;
    color: #1d1d1f;
  }
  
  .step-description,
  & > div:not(.step-title):not(.step-description) { // Target direct content if no specific classes
    font-size: 15px;
    color: #3c3c43;
  }
  
  ul {
    margin-top: 10px;
    margin-bottom: 0;
    padding-left: 20px;
    list-style-type: disc;
    li {
      margin-bottom: 6px;
    }
  }

  strong { // Style bold text within steps
    font-weight: 600;
    color: #1d1d1f;
  }
`;

// --- Nutrition Styles ---

const NutritionSection = styled.div`
  background-color: #f2f2f7; // Light background
  border-radius: 12px;
  padding: 20px;
`;

const NutritionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); // Adjust size
  gap: 16px;
`;

const NutritionItem = styled.div`
  padding: 16px;
  background-color: #ffffff; // White cards for items
  border-radius: 10px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  align-items: center; // Center content
  text-align: center;
  
  span:first-child { // Label (e.g., 'Kalorien')
    font-weight: 500;
    color: #636366; // Secondary text
    margin-bottom: 6px;
    font-size: 14px;
  }
  
  span:last-child { // Value (e.g., '500 kcal')
    font-size: 20px;
    font-weight: 600;
    color: #1d1d1f;
  }
`;

const NutritionDetail = styled.div`
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e5e5e5;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
`;

const AdditionalNutrientItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 10px 12px;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  border: 1px solid #e5e5e5;
  font-size: 14px;
  
  span:first-child {
    font-weight: 500;
    color: #3c3c43;
  }
  
  span:last-child {
    font-weight: 600;
    color: #1d1d1f;
  }
`;

const NotesSection = styled.div`
  margin-top: 20px;
  padding: 16px;
  background-color: #ffffff;
  border-radius: 10px;
  border: 1px solid #e5e5e5;

  h4 {
    margin-top: 0;
    margin-bottom: 10px;
    font-size: 16px;
    font-weight: 600;
    color: #1d1d1f;
  }

  p,
  li {
    color: #3c3c43;
    line-height: 1.5;
    font-size: 15px;
  }

  ul {
    padding-left: 20px;
    margin-bottom: 0;
    li {
      margin-bottom: 8px;
    }
  }
`;

const WarningSection = styled.div`
  background-color: #fffbeb; 
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #fde68a; // Lighter yellow border
  display: flex;
  gap: 16px;
  align-items: flex-start;
  margin-top: 20px;

  .icon {
    background-color: #f59e0b; 
    border-radius: 50%;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    font-size: 16px;
    flex-shrink: 0;
    margin-top: 2px;
  }

  .text {
    h4 {
      margin: 0 0 4px 0;
      color: #92400e;
      font-size: 16px;
      font-weight: 600;
    }
    p {
      color: #92400e;
      margin: 0;
      font-size: 15px;
      line-height: 1.5;
    }
  }
`;

// --- Assistant Styles ---

const AssistantSection = styled.div`
  margin-top: 40px;
  padding-top: 30px;
  border-top: 1px solid #e5e5e5;
`;

const AssistantTitle = styled.h2`
  font-size: 24px;
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 12px;
`;

const AssistantDescription = styled.p`
  font-size: 15px;
  color: #636366;
  margin-bottom: 24px;
  line-height: 1.5;
`;

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 450px; // Slightly taller
  border: 1px solid #dcdcdc; // Subtle border
  border-radius: 12px;
  overflow: hidden; // Clip content
  background-color: #f2f2f7; // Light background for chat area
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const MessageBubble = styled.div`
  padding: 12px 18px;
  border-radius: 20px; // More rounded bubbles
  max-width: 75%;
  word-break: break-word;
  line-height: 1.5;
  font-size: 15px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

  ${props => props.isUser ? `
    align-self: flex-end;
    background-color: #007aff; // Apple blue
    color: white;
    border-bottom-right-radius: 6px; // Subtle tail
  ` : `
    align-self: flex-start;
    background-color: #ffffff; // White bubbles for assistant
    color: #1d1d1f;
    border: 1px solid #e5e5e5;
    border-bottom-left-radius: 6px; // Subtle tail
    
    & strong, & b {
      font-weight: 600;
    }
    
    & ul {
      margin-top: 8px;
      margin-bottom: 8px;
      padding-left: 20px;
    }
    
    & li {
      margin-bottom: 4px;
    }
  `}
`;

const InputContainer = styled.form`
  display: flex;
  gap: 12px;
  padding: 12px 16px;
  background-color: #e5e5e5; // Slightly darker input area background
  border-top: 1px solid #dcdcdc;
`;

const StyledInput = styled.input`
  flex: 1;
  padding: 10px 16px;
  border: 1px solid #c7c7cc; // Lighter border
  border-radius: 20px; // Pill shape
  font-size: 15px;
  background-color: #ffffff;
  color: #1d1d1f;
  
  &:focus {
    outline: none;
    border-color: #007aff;
    box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.2);
  }

  &::placeholder {
    color: #8e8e93;
  }
`;

const SendButton = styled.button`
  background-color: #007aff;
  color: white;
  border: none;
  border-radius: 50%; // Circular send button
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s ease;
  flex-shrink: 0;

  &:hover:not(:disabled) {
    background-color: #005ecb;
  }

  &:disabled {
    background-color: #a0c7ff; // Lighter blue when disabled
    cursor: not-allowed;
  }

  svg {
    font-size: 18px;
  }
`;

// --- Action Buttons ---

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between; // Space out buttons
  align-items: center;
  margin-top: 40px;
  padding-top: 24px;
  border-top: 1px solid #e5e5e5;
`;

// Reusable button styles (can replace ../common/Button if needed)
const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 500;
  border: none;
  border-radius: 10px;
  padding: 10px 18px;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;

  ${(props) => {
    switch (props.variant) {
      case 'danger':
        return `
          background-color: transparent;
          color: #ff3b30; // Apple red
          &:hover {
            background-color: rgba(255, 59, 48, 0.1);
          }
        `;
      case 'primary': // Example primary style
        return `
          background-color: #007aff;
          color: white;
          &:hover {
            background-color: #005ecb;
          }
        `;
      default: // Secondary / Default
        return `
          background-color: #e5e5e5;
          color: #007aff;
          &:hover {
            background-color: #dcdcdc;
          }
        `;
    }
  }}
`;

// --- Cook Mode Styles ---

const CookModeContainer = styled.div`
  position: fixed;
  inset: 0;
  background-color: #ffffff; // White background
  z-index: 1000;
  padding: 0; // No padding on container
  display: flex;
  flex-direction: column;
`;

const CookModeHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e5e5;
  background-color: rgba(255, 255, 255, 0.95); // Slightly transparent white
  backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
  z-index: 1;
`;

const CookModeTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const CookModeCloseButton = styled.button`
  background: none;
  border: none;
  color: #007aff;
  font-size: 17px;
  font-weight: 500;
  cursor: pointer;
  padding: 8px;
`;

const CookModeStep = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 40px 30px; // More vertical padding
  display: flex;
  flex-direction: column;
  align-items: center; // Center content horizontally
  text-align: center;
`;

const StepNumber = styled.div`
  font-size: 17px;
  font-weight: 600;
  color: #636366; // Secondary text
  margin-bottom: 12px;
  text-transform: uppercase;
`;

const StepContent = styled.div`
  max-width: 650px; // Limit width for readability
  width: 100%;
  font-size: 22px; // Larger font for cooking
  line-height: 1.6;
  margin-bottom: 30px;
  color: #1d1d1f;
  
  .step-title {
    font-size: 26px;
    font-weight: 700;
    margin-bottom: 15px;
  }
  
  .step-description,
  & > div:not(.step-title):not(.step-description) {
    font-size: 22px;
  }

  ul {
    text-align: left; // Align lists left
    display: inline-block; // Fit content width
    margin-top: 15px;
    padding-left: 25px;
    li {
      margin-bottom: 8px;
    }
  }

  strong {
    font-weight: 700;
  }
`;

const CookModeControls = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  max-width: 650px; // Match content width
  margin-top: auto; // Push controls to the bottom if content is short
  padding-top: 20px;
`;

const CookModeNavButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 24px;
  border-radius: 12px;
  font-size: 17px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  background-color: #f2f2f7; // Light gray background
  color: #007aff; // Blue text

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
  
  &:hover:not(:disabled) {
    background-color: #e5e5e5;
  }

  &.next {
    background-color: #007aff;
    color: white;
    &:hover:not(:disabled) {
      background-color: #005ecb;
    }
     &:disabled {
      background-color: #a0c7ff; // Lighter blue when disabled
      color: white;
      opacity: 1;
    }
  }

  svg {
    font-size: 18px;
  }
`;

const CookModeToggle = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background-color: #e5e5e5; // Default gray
  color: #007aff; // Blue text and icon
  border: none;
  border-radius: 10px;
  font-weight: 500;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: #dcdcdc;
  }
  
  svg {
    font-size: 16px;
  }
`;

// --- Loading & Error Styles ---

const StatusContainer = styled.div`
  max-width: 600px;
  margin: 40px auto;
  padding: 40px;
  background-color: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  text-align: center;
`;

const Loading = styled.div`
  font-weight: 500;
  color: #007aff; // Blue loading text
  font-size: 18px;
  padding: 40px;
`;

const ErrorMessage = styled.div`
  color: #ff3b30; // Red error text
  padding: 20px;
  border-radius: 12px;
  background-color: rgba(255, 59, 48, 0.1); // Light red background
  margin-bottom: 24px;
  font-size: 15px;
  line-height: 1.5;
`;

// --- Component Logic ---

const RecipeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getRecipeById, deleteRecipe, updateRecipe, error: recipesError } = useRecipes();
  const [recipe, setRecipe] = useState(null);
  const [localError, setLocalError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);
  const attemptRef = useRef(0);
  const MAX_ATTEMPTS = 1; 
  const [imageFile, setImageFile] = useState(null);
  const [isImageUpdating, setIsImageUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [messages, setMessages] = useState([
    { id: 1, text: 'Hallo! Ich bin dein Kochassistent. Stelle mir Fragen zu diesem Rezept.', isUser: false }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const { getAssistance, isLoading: assistantLoading } = useAIService();

  const [isCookMode, setIsCookMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  
  const processRecipeData = useCallback((recipeData) => {
    if (!recipeData) return null;
    const processed = { ...recipeData };
    if (processed.isAIGenerated && processed.difficulty === 'hard') {
      if (!processed.notes && processed.description) {
        const notesMatch = processed.description.match(/Wichtige Hinweise:([\s\S]+?)(?=\n\n|$)/i);
        if (notesMatch && notesMatch[1]) {
          processed.notes = notesMatch[1].trim().split('\n').filter(note => note.trim().length > 0);
        }
      }
      if (!processed.nutrition) processed.nutrition = {};
      if (!processed.nutrition.calories && processed.description) {
        const nutritionMatch = processed.description.match(/Nährwertangaben:[^:]*(?:Kalorien|kcal)[^:]*?(\d+)[^:]*?(?:kcal|kalorien)/i);
        if (nutritionMatch?.[1]) processed.nutrition.calories = nutritionMatch[1].trim();
        const proteinMatch = processed.description.match(/(?:Protein|Eiweiß)[^:]*?(\d+)[^:]*?g/i);
        if (proteinMatch?.[1]) processed.nutrition.protein = proteinMatch[1].trim();
        const carbsMatch = processed.description.match(/(?:Kohlenhydrate|Carbs)[^:]*?(\d+)[^:]*?g/i);
        if (carbsMatch?.[1]) processed.nutrition.carbs = carbsMatch[1].trim();
        const fatMatch = processed.description.match(/(?:Fett)[^:]*?(\d+)[^:]*?g/i);
        if (fatMatch?.[1]) processed.nutrition.fat = fatMatch[1].trim();
      }
      if (processed.steps?.length > 0) {
        processed.steps = processed.steps.map(step => {
          if (step.trim().match(/^[^:]+:$/) && processed.description) {
            const stepTitle = step.trim();
            const stepRegex = new RegExp(`${stepTitle}\\s*([^:]+?)(?=\\d+\\.\\s|$)`, 'i');
            const match = processed.description.match(stepRegex);
            if (match?.[1]) return `${stepTitle} ${match[1].trim()}`;
          }
          return step;
        });
      }
      if (!processed.tips && processed.description) {
        const tipsMatch = processed.description.match(/(?:Wichtige Hinweise|Tipps):([\s\S]+?)(?=\n\n|$)/i);
        if (tipsMatch?.[1]) {
          processed.tips = tipsMatch[1].trim().split(/\n\s*\n/).map(tip => tip.trim()).filter(tip => tip.length > 0);
        }
      }
    }
    return processed;
  }, []);

  const fetchRecipe = useCallback(async () => {
    if (!id) {
      setLocalError('Keine Rezept-ID gefunden');
      setIsLoading(false);
      return;
    }
    if (attemptRef.current >= MAX_ATTEMPTS) return;
    
    try {
      setIsLoading(true);
      setLocalError(null);
      setHasAttemptedFetch(true);
      attemptRef.current += 1;
      const data = await getRecipeById(id);
      const processedData = processRecipeData(data);
      setRecipe(processedData);
    } catch (err) {
      console.error('Fehler beim Laden des Rezepts:', err);
      setLocalError(err.message || 'Das Rezept konnte nicht geladen werden.');
    } finally {
      setIsLoading(false);
    }
  }, [id, getRecipeById, processRecipeData]);

  useEffect(() => {
    let isMounted = true;
    let timeoutId = null;
    const loadRecipe = async () => {
      if (isMounted && !hasAttemptedFetch) await fetchRecipe();
    };
    timeoutId = setTimeout(loadRecipe, 100);
    return () => { isMounted = false; if (timeoutId) clearTimeout(timeoutId); };
  }, [fetchRecipe, hasAttemptedFetch]);

  const handleDelete = async () => {
    if (window.confirm('Möchtest du dieses Rezept wirklich löschen?')) {
      try {
        setIsLoading(true);
        await deleteRecipe(id);
        navigate('/recipes');
      } catch (err) {
        console.error('Fehler beim Löschen des Rezepts:', err);
        setLocalError(err.message || 'Fehler beim Löschen des Rezepts');
        setIsLoading(false);
      }
    }
  };

  const handleRetry = () => {
    attemptRef.current = 0;
    setHasAttemptedFetch(false);
    setLocalError(null);
    fetchRecipe();
  };

  const getDifficultyText = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'Einfach';
      case 'medium': return 'Mittel';
      case 'hard': return 'Anspruchsvoll';
      default: return 'Mittel';
    }
  };

  const formatStepText = (text) => {
    if (!text) return '';
    let formattedText = text;
    const hasHeadline = /^([^:]+:)(.+)/.exec(text);
    if (hasHeadline) {
      const [, title, description] = hasHeadline;
      return `<div class="step-title">${title.trim()}</div><div class="step-description">${description.trim()}</div>`;
    }
    formattedText = formattedText.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    if (formattedText.trim().startsWith('*')) {
      let lines = formattedText.split('\n');
      let isList = false;
      let listContent = '';
      lines = lines.map(line => {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('*')) {
          if (!isList) {
            isList = true;
            listContent = '<ul>';
          }
          const listItemText = trimmedLine.substring(1).trim();
          listContent += `<li>${listItemText}</li>`;
          return null;
        } else {
          if (isList) {
            isList = false;
            listContent += '</ul>';
            const currentList = listContent;
            listContent = ''; // Reset for potential next list
            return currentList + line;
          }
          return line;
        }
      }).filter(line => line !== null);
      if (isList) listContent += '</ul>';
      formattedText = lines.join('\n') + (isList ? listContent : ''); // Append final list if needed
    }
    if (!hasHeadline && !formattedText.includes('<ul>') && !formattedText.includes('<strong>')) {
        return `<div>${formattedText}</div>`;
    }
    return formattedText;
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const createRecipeContext = (currentRecipe) => {
    if (!currentRecipe) return '';
    let context = `Rezept: ${currentRecipe.title}\n\n`;
    if (currentRecipe.ingredients?.length > 0) {
      context += "Zutaten:\n";
      currentRecipe.ingredients.forEach(ing => {
        const amount = ing.amount ? `${ing.amount} ${ing.unit || ''}` : '';
        context += `- ${amount} ${ing.name}\n`;
      });
      context += "\n";
    }
    if (currentRecipe.steps?.length > 0) {
      context += "Zubereitung:\n";
      currentRecipe.steps.forEach((step, index) => {
        const cleanedStep = step.replace(/<[^>]*>/g, '');
        context += `${index + 1}. ${cleanedStep}\n`;
      });
    }
    return context;
  };

  const formatAssistantText = (text) => {
    if (!text) return '';
    let formattedText = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    let lines = formattedText.split('\n');
    let isList = false;
    let resultLines = [];
    let listContent = '';
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]; // Don't trim lines here, preserve indentation for potential code blocks
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('*') && !trimmedLine.startsWith('**')) {
        if (!isList) {
          isList = true;
          listContent = '<ul>';
        }
        const listItemText = trimmedLine.substring(1).trim();
        listContent += `<li>${listItemText}</li>`;
      } else {
        if (isList) {
          isList = false;
          listContent += '</ul>';
          resultLines.push(listContent);
          listContent = ''; // Reset
        }
        resultLines.push(line);
      }
    }
    if (isList) {
      listContent += '</ul>';
      resultLines.push(listContent);
    }
    return resultLines.join('\n');
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (input.trim() === '' || !recipe) return;
    const userMessage = { id: Date.now(), text: input, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    try {
      const recipeContext = createRecipeContext(recipe);
      const assistantResponse = await getAssistance(currentInput, recipeContext);
      setMessages(prev => [
        ...prev, 
        { id: Date.now() + 1, text: assistantResponse, isUser: false }
      ]);
    } catch (error) {
      console.error('Fehler beim Kochassistenten:', error);
      setMessages(prev => [
        ...prev, 
        { 
          id: Date.now() + 1, 
          text: 'Entschuldigung, ich konnte deine Frage nicht beantworten.', 
          isUser: false 
        }
      ]);
    }
  };

  const handleImageChange = (file) => {
    setImageFile(file);
    setLocalError(null);
  };

  const handleImageUpload = async () => {
    if (!imageFile) return;
    setIsImageUpdating(true);
    setLocalError(null);
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/recipes/${id}/image`, {
          method: 'POST',
          body: formData,
          credentials: 'include' // Or handle auth token if needed
      });

      if (!response.ok) {
          const errorData = await response.text();
          throw new Error(`Upload fehlgeschlagen: ${response.status} ${errorData}`);
      }

      const updatedData = await response.json(); // Or use updateRecipe if it returns the updated recipe
      setRecipe(processRecipeData(updatedData)); // Re-process data
      setImageFile(null);
    } catch (err) {
      console.error('Fehler beim Hochladen des Bildes:', err);
      setLocalError(`Fehler beim Hochladen: ${err.message}`);
    } finally {
      setIsImageUpdating(false);
    }
  };

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
    if (isEditing) {
      setImageFile(null); 
      setLocalError(null); // Clear errors when cancelling edit
    }
  };

  const toggleCookMode = () => {
    setIsCookMode(!isCookMode);
    setCurrentStep(0);
  };

  const goToNextStep = () => {
    if (currentStep < (recipe?.steps?.length || 0) - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (isLoading) {
    return (
      <PageContainer>
        <StatusContainer>
          <Loading>Rezept wird geladen...</Loading>
        </StatusContainer>
      </PageContainer>
    );
  }

  const displayError = localError || recipesError;
  if (displayError) {
    return (
      <PageContainer>
        <StatusContainer>
          <ErrorMessage>{displayError}</ErrorMessage>
          <ButtonContainer style={{ borderTop: 'none', marginTop: 0 }}>
            <ActionButton onClick={handleRetry} variant="primary">
              Erneut versuchen
            </ActionButton>
            <ActionButton onClick={() => navigate('/recipes')} >
              Zurück zur Übersicht
            </ActionButton>
          </ButtonContainer>
        </StatusContainer>
      </PageContainer>
    );
  }

  if (!recipe) {
    return (
      <PageContainer>
        <StatusContainer>
          <ErrorMessage>Rezept nicht gefunden.</ErrorMessage>
           <ButtonContainer style={{ borderTop: 'none', marginTop: 0, justifyContent: 'center' }}>
            <ActionButton onClick={() => navigate('/recipes')} >
              Zurück zur Übersicht
            </ActionButton>
          </ButtonContainer>
        </StatusContainer>
      </PageContainer>
    );
  }

  if (isCookMode && recipe?.steps) {
    return (
      <CookModeContainer>
        <CookModeHeader>
          <CookModeTitle>{recipe.title}</CookModeTitle>
          <CookModeCloseButton onClick={toggleCookMode}>
            Fertig
          </CookModeCloseButton>
        </CookModeHeader>
        <CookModeStep>
          <StepNumber>Schritt {currentStep + 1} / {recipe.steps.length}</StepNumber>
          <StepContent dangerouslySetInnerHTML={{ __html: formatStepText(recipe.steps[currentStep]) }} />
          <CookModeControls>
            <CookModeNavButton 
              onClick={goToPrevStep} 
              disabled={currentStep === 0}
            >
              <FaArrowLeft /> Zurück
            </CookModeNavButton>
            <CookModeNavButton 
              className="next" 
              onClick={goToNextStep}
              disabled={currentStep === recipe.steps.length - 1}
            >
              Weiter <FaArrowRight />
            </CookModeNavButton>
          </CookModeControls>
        </CookModeStep>
      </CookModeContainer>
    );
  }

  return (
    <PageContainer>
      <ContentWrapper>
        <RecipeHeader>
          <HeaderTopRow>
            <RecipeTitle>{recipe.title}</RecipeTitle>
            <EditButton onClick={toggleEditMode}> 
              <FaEdit /> {isEditing ? 'Abbrechen' : 'Bearbeiten'}
            </EditButton>
          </HeaderTopRow>
          
          {(!isEditing || (recipe.image && recipe.image.data)) && ( 
            <RecipeImageWrapper>
               {recipe.image && recipe.image.data ? (
                 <img 
                   src={`data:${recipe.image.contentType};base64,${recipe.image.data}`} 
                   alt={recipe.title} 
                 />
               ) : (
                 <div style={{ /* Optional: Style for placeholder */ }}></div>
               )} 
            </RecipeImageWrapper>
          )}
          
          {isEditing && (
            <ImageSection>
              <h3>Rezeptbild ändern</h3>
              <ImageUpload 
                label="Neues Bild hochladen" 
                onChange={handleImageChange}
                currentImage={recipe.image?.data ? `data:${recipe.image.contentType};base64,${recipe.image.data}` : null}
              />
              
              {imageFile && (
                <div style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
                  <ActionButton 
                    onClick={handleImageUpload}
                    disabled={isImageUpdating}
                    variant="primary"
                  >
                    {isImageUpdating ? 'Wird hochgeladen...' : 'Bild speichern'}
                  </ActionButton>
                   <ActionButton 
                    onClick={() => setImageFile(null)} // Clear selection
                  >
                    Auswahl aufheben
                  </ActionButton>
                </div>
              )}
              
              {localError && imageFile && ( // Show upload error only when relevant
                <ErrorMessage style={{ marginTop: '16px' }}>
                  {localError}
                </ErrorMessage>
              )}
            </ImageSection>
          )}
          
          <TagsContainer>
            {recipe.isAIGenerated && <Tag>KI-generiert</Tag>}
            {recipe.dietaryRestrictions?.map((diet, index) => (
              <Tag key={index}>{diet}</Tag>
            ))}
            {recipe.cuisine && <Tag>{recipe.cuisine}</Tag>}
          </TagsContainer>
          
          <RecipeMeta>
            <MetaItem>
              <FaUtensils /> 
              <span>Schwierigkeit:</span>
              <strong>{getDifficultyText(recipe.difficulty)}</strong>
            </MetaItem>
            {(recipe.prepTime || recipe.cookTime) && (
              <MetaItem>
                <FaClock /> 
                <span>Zeit:</span>
                <strong>
                  {recipe.prepTime && `${recipe.prepTime} Min. Vorb.`}
                  {recipe.prepTime && recipe.cookTime && ' / '}
                  {recipe.cookTime && `${recipe.cookTime} Min. Kochz.`}
                </strong>
              </MetaItem>
            )}
          </RecipeMeta>
        </RecipeHeader>
        
        {recipe.isAIGenerated && recipe.description && (
          <Section>
            <div style={{ fontSize: '16px', lineHeight: '1.6', color: '#3c3c43' }}>
              {recipe.description.split('\n\n').map((para, index) => <p key={index}>{para}</p>)}
            </div>
          </Section>
        )}
        
        {recipe.ingredients && recipe.ingredients.length > 0 && (
          <Section>
            <SectionTitle>Zutaten</SectionTitle>
            <IngredientList>
              {recipe.ingredients.map((ingredient, index) => (
                <Ingredient key={index}>
                  {ingredient.amount || ingredient.unit ? (
                    <> 
                      <strong>{`${ingredient.amount || ''} ${ingredient.unit || ''}`.trim()}</strong>
                      <span>{ingredient.name}</span>
                    </>
                  ) : (
                    <span style={{ gridColumn: '1 / -1' }}>{ingredient.name}</span>
                  )}
                </Ingredient>
              ))}
            </IngredientList>
          </Section>
        )}

        {recipe.notes && recipe.notes.length > 0 && (
           <NotesSection style={{ backgroundColor: '#f0f7ff', borderColor: '#d6eaff' }}>
            <h4>Zubereitungshinweise</h4>
            <ul>
              {Array.isArray(recipe.notes) ? (
                recipe.notes.map((note, index) => (
                  <li key={index}>{note}</li>
                ))
              ) : (
                <li>{recipe.notes}</li> 
              )}
            </ul>
          </NotesSection>
        )}
        
        {recipe.steps && recipe.steps.length > 0 && (
          <Section>
            <SectionHeader>
              <SectionTitle style={{ borderBottom: 'none', marginBottom: 0 }}>Zubereitung</SectionTitle>
              <CookModeToggle onClick={toggleCookMode}>
                <FaUtensils /> Kochmodus
              </CookModeToggle>
            </SectionHeader>
            <StepsList>
              {recipe.steps.map((step, index) => (
                <Step key={index}>
                    <div className="step-content" dangerouslySetInnerHTML={{ __html: formatStepText(step) }} />
                </Step>
              ))}
            </StepsList>
          </Section>
        )}
        
        {recipe.nutrition && Object.keys(recipe.nutrition).length > 0 && ( 
          <Section>
            <SectionTitle>Nährwerte (ca. pro Portion)</SectionTitle>
            <NutritionSection>
              <NutritionGrid>
                {recipe.nutrition.calories && (
                  <NutritionItem>
                    <span>Kalorien</span>
                    <span>{recipe.nutrition.calories} kcal</span>
                  </NutritionItem>
                )}
                {recipe.nutrition.protein && (
                  <NutritionItem>
                    <span>Eiweiß</span>
                    <span>{recipe.nutrition.protein} g</span>
                  </NutritionItem>
                )}
                {recipe.nutrition.carbs && (
                  <NutritionItem>
                    <span>Kohlenhydrate</span>
                    <span>{recipe.nutrition.carbs} g</span>
                  </NutritionItem>
                )}
                {recipe.nutrition.fat && (
                  <NutritionItem>
                    <span>Fett</span>
                    <span>{recipe.nutrition.fat} g</span>
                  </NutritionItem>
                )}
              </NutritionGrid>
              
              {recipe.nutrition.additionalNutrients && Object.keys(recipe.nutrition.additionalNutrients).length > 0 && (
                <NutritionDetail>
                  {Object.entries(recipe.nutrition.additionalNutrients).map(([key, value], index) => (
                    <AdditionalNutrientItem key={index}>
                      <span>{key}</span>
                      <span>{value}</span>
                    </AdditionalNutrientItem>
                  ))}
                </NutritionDetail>
              )}
              
              {recipe.nutrition.notes && (
                <NotesSection style={{ marginTop: '20px', background: 'transparent', border: 'none', padding: 0 }}>
                  <p>{recipe.nutrition.notes}</p>
                </NotesSection>
              )}
            </NutritionSection>
          </Section>
        )}
        
        {recipe.difficulty === 'hard' && recipe.tips && recipe.tips.length > 0 && (
          <Section>
            <SectionTitle>Wichtige Hinweise & Tipps</SectionTitle>
             <NotesSection style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}>
              <ul>
                {recipe.tips.map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            </NotesSection>
          </Section>
        )}
        
        {recipe.difficulty === 'hard' && (
          <Section>
             <WarningSection>
                <div className="icon">!</div>
                <div className="text">
                  <h4>Anspruchsvolles Rezept</h4>
                  <p>Dieses Rezept erfordert fortgeschrittene Kochtechniken und Erfahrung. Bitte lesen Sie alle Schritte vor dem Beginn sorgfältig durch.</p>
                </div>
             </WarningSection>
          </Section>
        )}
        
        {recipe && (
          <AssistantSection>
            <AssistantTitle>Kochassistent</AssistantTitle>
            <AssistantDescription>Stelle Fragen zu diesem Rezept - der Assistent hilft dir bei der Zubereitung, gibt Tipps oder erklärt Techniken.</AssistantDescription>
            
            <ChatContainer>
              <MessagesContainer>
                {messages.map(message => (
                  <MessageBubble key={message.id} isUser={message.isUser}>
                    {message.isUser ? 
                      message.text : 
                      <div dangerouslySetInnerHTML={{ __html: formatAssistantText(message.text) }} />
                    }
                  </MessageBubble>
                ))}
                {assistantLoading && (
                   <MessageBubble isUser={false}>
                      <i>Schreibt...</i>
                   </MessageBubble>
                )}
                <div ref={messagesEndRef} />
              </MessagesContainer>
              
              <InputContainer onSubmit={handleSendMessage}>
                <StyledInput
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Frage zum Rezept..."
                  disabled={assistantLoading}
                />
                <SendButton 
                  type="submit" 
                  disabled={input.trim() === '' || assistantLoading}
                  aria-label="Nachricht senden"
                >
                  <FaPaperPlane />
                </SendButton>
              </InputContainer>
            </ChatContainer>
          </AssistantSection>
        )}
        
        <ButtonContainer>
          <ActionButton onClick={() => navigate('/recipes')} >
             <FaChevronLeft /> Zurück zur Übersicht
          </ActionButton>
          <ActionButton 
            onClick={handleDelete}
            variant="danger"
            disabled={isLoading}
          >
            <FaTrash /> Rezept löschen
          </ActionButton>
        </ButtonContainer>
      </ContentWrapper>
    </PageContainer>
  );
};

export default RecipeDetail;