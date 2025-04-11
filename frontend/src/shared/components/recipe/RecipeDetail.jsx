import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { useRecipes } from '../../hooks/useRecipes';
import { useAIService } from '../../hooks/useAIService';
import { API_BASE_URL } from '../../../core/api/api';
import ImageUpload from '../common/ImageUpload';
import Button from '../common/Button';
import { FaUtensils, FaClock, FaArrowRight, FaArrowLeft, FaEdit, FaTrash, FaChevronLeft, FaPaperPlane, FaListUl, FaClipboardList, FaInfoCircle, FaHeart, FaLightbulb, FaAppleAlt, FaBalanceScale, FaBook } from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext';
// import LoadingSpinner from '../common/LoadingSpinner'; // Auskommentiert: Modul nicht gefunden
// import ErrorMessage from '../common/ErrorMessage'; // Auskommentiert: Modul nicht gefunden
// import InteractiveAIChat from './InteractiveAIChat'; // Auskommentiert: Modul nicht gefunden
// import { toast } from 'react-toastify'; // Auskommentiert: Modul nicht gefunden
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // Auskommentiert: Modul nicht gefunden

// Container und Wrapper Komponenten
const PageContainer = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 20px 60px;
`;

const ContentWrapper = styled.div`
  background-color: var(--color-paper);
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
`;

const StatusContainer = styled.div`
  padding: 50px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 40vh;
`;

const Loading = styled.div`
  font-size: 18px;
  color: var(--color-primary);
  margin: 20px 0;
`;

const ErrorMessageStyled = styled.div`
  color: var(--color-danger);
  padding: 16px;
  border-radius: 8px;
  background-color: var(--color-danger-hover);
  margin-bottom: 20px;
  width: 100%;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid var(--color-border);
  
  @media (max-width: 600px) {
    flex-direction: column;
  }
`;

// Header-Komponenten
const HeaderTopRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 20px;
`;

const EditButton = styled.button`
  padding: 8px 16px;
  background-color: var(--color-background);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: var(--color-gray-100);
  }
  
  svg {
    font-size: 14px;
  }
`;

const ImageSection = styled.div`
  margin-bottom: 30px;
  background-color: var(--color-gray-50);
  padding: 20px;
  border-radius: 12px;
  border: 1px dashed var(--color-border);
  
  h3 {
    margin-bottom: 16px;
    font-size: 18px;
    font-weight: 600;
    color: var(--color-text-primary);
  }
`;

// Cook-Mode Komponenten
const CookModeContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--color-background);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  padding: 20px;
  overflow-y: auto;
`;

const CookModeHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 30px;
`;

const CookModeTitle = styled.h2`
  font-size: 24px;
  font-weight: 600;
  color: var(--color-primary);
`;

const CookModeCloseButton = styled.button`
  padding: 10px 16px;
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  font-weight: 600;
  
  &:hover {
    background-color: var(--color-primary-hover);
  }
`;

const CookModeStep = styled.div`
  background-color: var(--color-paper);
  padding: 40px 30px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  max-width: 800px;
  margin: 0 auto;
  position: relative;
`;

const StepNumber = styled.div`
  position: absolute;
  top: -20px;
  left: 30px;
  background-color: var(--color-primary);
  color: white;
  padding: 5px 15px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 14px;
`;

const StepContent = styled.div`
  font-size: 18px;
  line-height: 1.7;
  color: var(--color-text-primary);
  
  .step-title {
    font-size: 22px;
    font-weight: 600;
    margin-bottom: 16px;
    color: var(--color-text-primary);
  }
  
  .step-description {
    color: var(--color-text-secondary);
  }
  
  strong {
    color: var(--color-primary);
  }
`;

const CookModeNavButton = styled.button`
  padding: 12px 24px;
  background-color: ${props => props.className === 'next' ? 'var(--color-primary)' : 'var(--color-background)'};
  color: ${props => props.className === 'next' ? 'white' : 'var(--color-text-primary)'};
  border: ${props => props.className === 'next' ? 'none' : '1px solid var(--color-border)'};
  border-radius: 30px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background-color: ${props => props.className === 'next' ? 'var(--color-primary-hover)' : 'var(--color-gray-100)'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// --- Verbesserte Styling-Komponenten ---

const RecipeImageWrapper = styled.div`
  margin-bottom: 30px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: ${props => props.theme === 'dark' 
    ? '0 8px 20px rgba(0, 0, 0, 0.3)' 
    : '0 8px 20px rgba(0, 0, 0, 0.15)'};
  aspect-ratio: 16 / 9;
  background-color: ${props => props.theme === 'dark' 
    ? 'var(--color-gray-200)' 
    : 'var(--color-gray-100)'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 100px;
  position: relative;
  border: 1px solid var(--color-border);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 100px;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.5), transparent);
    pointer-events: none;
  }
`;

const RecipeTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 20px 0;
  line-height: 1.2;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 0;
    width: 60px;
    height: 3px;
    background-color: var(--color-primary);
    border-radius: 3px;
  }
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 20px 0;
`;

const Tag = styled.span`
  display: inline-block;
  background-color: ${props => props.theme === 'dark' 
    ? 'var(--color-gray-300)' 
    : 'var(--color-gray-200)'};
  color: ${props => props.theme === 'dark'
    ? 'var(--color-gray-900)' 
    : 'var(--color-text-secondary)'};
  font-size: 13px;
  font-weight: 500;
  padding: 6px 14px;
  border-radius: 20px;
  
  ${props => props.highlight ? `
    background-color: var(--color-primary-light);
    color: var(--color-primary);
    font-weight: 600;
  ` : ''}
`;

const RecipeHeader = styled.header`
  margin-bottom: 40px;
  padding-bottom: 30px;
  border-bottom: 1px solid var(--color-border);
  position: relative;
`;

const RecipeMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  color: var(--color-text-secondary);
  font-size: 15px;
  margin-top: 25px;
  background-color: ${props => props.theme === 'dark' 
    ? 'var(--color-gray-100)' 
    : 'var(--color-gray-50)'};
  padding: 16px;
  border-radius: 12px;
  border: 1px solid var(--color-border);
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  
  svg {
    color: var(--color-primary);
    font-size: 18px;
  }
  
  span {
    color: var(--color-text-secondary);
  }
  
  strong {
    color: var(--color-text-primary);
    font-weight: 600;
  }
`;

// --- Section Styles ---
const Section = styled.section`
  margin-bottom: 50px;
  position: relative;
`;

const SectionTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 25px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  gap: 12px;
  
  svg {
    color: var(--color-primary);
    font-size: 24px;
  }
`;

const SectionDescription = styled.div`
  font-size: 16px;
  line-height: 1.7;
  color: var(--color-text-secondary);
  
  p {
    margin-bottom: 16px;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

// --- Ingredient Styles ---
const IngredientList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
  
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const Ingredient = styled.li`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background-color: ${props => props.theme === 'dark' 
    ? 'var(--color-gray-200)' 
    : 'var(--color-gray-100)'};
  border-radius: 12px;
  font-size: 15px;
  border: 1px solid var(--color-border);
  transition: transform 0.2s ease;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  strong {
    color: var(--color-text-primary);
    font-weight: 600;
    min-width: 70px;
    text-align: right;
  }
  
  span {
    color: var(--color-text-secondary);
    flex-grow: 1;
  }
  
  &::before {
    content: '🥄';
    font-size: 20px;
    line-height: 1;
  }
`;

// --- Steps Styles ---
const StepsList = styled.ol`
  list-style: none;
  padding: 0;
  margin: 0;
  counter-reset: steps;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Step = styled.li`
  counter-increment: steps;
  display: flex;
  gap: 16px;
  background-color: ${props => props.theme === 'dark' 
    ? 'var(--color-paper)' 
    : 'var(--color-background)'};
  padding: 24px;
  border-radius: 12px;
  box-shadow: ${props => props.theme === 'dark' 
    ? '0 4px 8px rgba(0, 0, 0, 0.25)' 
    : '0 4px 8px rgba(0, 0, 0, 0.08)'};
  position: relative;
  line-height: 1.7;
  border: 1px solid var(--color-border);
  
  ${props => props.active ? `
    border: 2px solid var(--color-primary);
    box-shadow: 0 0 0 4px var(--color-primary-light);
  ` : ''}

  &::before {
    content: counter(steps);
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 36px;
    height: 36px;
    background-color: ${props => props.theme === 'dark' 
      ? 'var(--color-primary)' 
      : 'var(--color-primary)'};
    color: white;
    font-weight: 600;
    font-size: 16px;
    border-radius: 50%;
    flex-shrink: 0;
    margin-top: 2px;
  }

  .step-content {
    flex-grow: 1;
  }

  .step-title {
    font-weight: 600;
    font-size: 18px;
    margin-bottom: 10px;
    color: var(--color-text-primary);
  }
  
  .step-description,
  & > div:not(.step-title):not(.step-description) {
    font-size: 16px;
    color: var(--color-text-secondary);
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

  strong {
    font-weight: 600;
    color: var(--color-text-primary);
  }
`;

// --- Nutrition Styles ---
const NutritionSection = styled.div`
  background-color: ${props => props.theme === 'dark' 
    ? 'var(--color-gray-200)' 
    : 'var(--color-gray-100)'};
  border-radius: 16px;
  padding: 24px;
  border: 1px solid var(--color-border);
`;

const NutritionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 20px;
`;

const NutritionItem = styled.div`
  padding: 20px 16px;
  background-color: ${props => props.theme === 'dark' 
    ? 'var(--color-paper)' 
    : 'var(--color-background)'};
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  border: 1px solid var(--color-border);
  transition: transform 0.2s ease;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 12px rgba(0,0,0,0.1);
  }
  
  span:first-child {
    font-weight: 500;
    color: var(--color-text-secondary);
    margin-bottom: 8px;
    font-size: 14px;
  }
  
  span:last-child {
    font-size: 22px;
    font-weight: 700;
    color: var(--color-primary);
  }
`;

const CookModeControls = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 30px;
  justify-content: center;
`;

const FloatingActions = styled.div`
  position: fixed;
  bottom: 30px;
  right: 30px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  z-index: 10;
`;

const ActionButton = styled(Button)`
  border-radius: 50px;
  width: auto;
  display: flex;
  align-items: center;
  padding: 12px 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  gap: 8px;
  font-weight: 500;
  
  svg {
    font-size: 18px;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  }
`;

const Divider = styled.div`
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    var(--color-border) 50%,
    transparent 100%
  );
  margin: 40px 0;
`;

const RecipeImagePlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 80px;
  background: linear-gradient(135deg, var(--color-gray-200) 0%, var(--color-gray-100) 100%);
`;

const TipsContainer = styled.div`
  background-color: ${props => props.theme === 'dark' 
    ? 'var(--color-gray-100)' 
    : 'var(--color-primary-light)'};
  border-radius: 12px;
  padding: 24px;
  margin-top: 16px;
  
  ul {
    margin: 0;
    padding-left: 20px;
    
    li {
      margin-bottom: 12px;
      color: var(--color-text-secondary);
      line-height: 1.6;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
`;

// --- Component Logic ---

const RecipeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getRecipeById, deleteRecipe, error: recipesError } = useRecipes();
  const { getAssistance, isLoading: assistantLoading } = useAIService();
  const { theme } = useTheme();
  
  const [recipe, setRecipe] = useState(null);
  const [localError, setLocalError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [isImageUpdating, setIsImageUpdating] = useState(false);
  
  // const [messages, setMessages] = useState([
  //   { id: 1, text: 'Hallo! Ich bin dein Kochassistent. Stelle mir Fragen zu diesem Rezept.', isUser: false }
  // ]);
  // const [input, setInput] = useState('');
  // const messagesEndRef = useRef(null);
  
  const [isCookMode, setIsCookMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  
  const fetchRecipe = useCallback(async () => {
    if (!id) {
      setLocalError('Keine Rezept-ID gefunden');
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      setLocalError(null);
      const data = await getRecipeById(id);
      setRecipe(data);
    } catch (err) {
      console.error('Fehler beim Laden des Rezepts:', err);
      setLocalError(err.response?.data?.message || err.message || 'Das Rezept konnte nicht geladen werden.');
    } finally {
      setIsLoading(false);
    }
  }, [id, getRecipeById]);

  useEffect(() => {
    console.log('RecipeDetail: Fetch effect running, dependencies:', { id });
    fetchRecipe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, getRecipeById]);

  const handleDelete = async () => {
    if (window.confirm('Möchtest du dieses Rezept wirklich löschen?')) {
      try {
        setIsLoading(true);
        await deleteRecipe(id);
        navigate('/recipes');
      } catch (err) {
        console.error('Fehler beim Löschen des Rezepts:', err);
        setLocalError(err.response?.data?.message || err.message || 'Fehler beim Löschen des Rezepts');
        setIsLoading(false);
      }
    }
  };

  const handleRetry = () => {
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
    // Check for bold title format: **Title:** Description
    const hasHeadline = /^\*\*([^:]+):\*\*(.*)$/s.exec(text); // Use . to match newline, capture everything after :
    if (hasHeadline) {
      const [, title, description] = hasHeadline;
      // Sanitize title 
      const safeTitle = title.replace(/</g, "&lt;").replace(/>/g, "&gt;");
      
      // Trim description, remove potential leading ** and whitespace, then sanitize and process markdown
      const cleanedDescription = description.trim().replace(/^\*\*/, '').trim(); // Remove leading ** if present
      const safeDescription = cleanedDescription
          .replace(/</g, "&lt;").replace(/>/g, "&gt;") // Basic sanitization
          .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>'); // Convert internal **bold**
          
      // Wrap the extracted title in strong tags
      return `<div class="step-title"><strong>${safeTitle.trim()}</strong></div><div class="step-description">${safeDescription}</div>`; // Use safeDescription directly (already trimmed)
    }
    // Sanitize plain text step AND handle potential bold markdown within it
    const safeText = text
        .replace(/</g, "&lt;").replace(/>/g, "&gt;") // Basic sanitization
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>'); // Convert **bold**
    return `<div>${safeText}</div>`;
  };

  // useEffect(() => {
  //   messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  // }, [messages]);

  const createRecipeContext = useCallback((currentRecipe) => {
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
        const cleanedStep = step.replace(/\\*\\*([^:]+):\\*\\*\\s*/, '').replace(/<[^>]*>/g, '');
        context += `${index + 1}. ${cleanedStep}\n`;
      });
    }
    return context.substring(0, 4000);
  }, []);

  // const formatAssistantText = (text) => {
  //   if (!text) return '';
  //   let formattedText = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  //   let lines = formattedText.split('\\n');
  //   let isList = false;
  //   let resultLines = [];
  //   let listContent = '';
  //   for (let i = 0; i < lines.length; i++) {
  //     const line = lines[i];
  //     const trimmedLine = line.trim();
  //     if (trimmedLine.startsWith('*') && !trimmedLine.startsWith('**')) {
  //       if (!isList) {
  //         isList = true;
  //         listContent = '<ul>';
  //       }
  //       const listItemText = trimmedLine.substring(1).trim().replace(/</g, "&lt;").replace(/>/g, "&gt;");
  //       listContent += `<li>${listItemText}</li>`;
  //     } else {
  //       if (isList) {
  //         isList = false;
  //         listContent += '</ul>';
  //         resultLines.push(listContent);
  //         listContent = '';
  //       }
  //       resultLines.push(line.replace(/</g, "&lt;").replace(/>/g, "&gt;"));
  //     }
  //   }
  //   if (isList) {
  //     listContent += '</ul>';
  //     resultLines.push(listContent);
  //   }
  //   return resultLines.join('<br />');
  // };

  // const handleSendMessage = async (e) => {
  //   e.preventDefault();
  //   if (input.trim() === '' || !recipe) return;
  //   const userMessage = { id: Date.now(), text: input, isUser: true };
  //   setMessages(prev => [...prev, userMessage]);
  //   const currentInput = input;
  //   setInput('');
  //   try {
  //     const recipeContext = createRecipeContext(recipe);
  //     const assistantResponse = await getAssistance(currentInput, recipeContext);
  //     setMessages(prev => [
  //       ...prev, 
  //       { id: Date.now() + 1, text: assistantResponse, isUser: false }
  //     ]);
  //   } catch (error) {
  //     console.error('Fehler beim Kochassistenten:', error);
  //     setMessages(prev => [
  //       ...prev, 
  //       { 
  //         id: Date.now() + 1, 
  //         text: 'Entschuldigung, ich konnte deine Frage nicht beantworten.', 
  //         isUser: false 
  //       }
  //     ]);
  //   }
  // };

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
      
      // Use the API_BASE_URL directly from our api.js
      const apiUrl = API_BASE_URL;
      console.log(`Uploading to: ${apiUrl}/recipes/${id}/image`);
      
      const token = localStorage.getItem('token');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const response = await fetch(`${apiUrl}/recipes/${id}/image`, {
          method: 'POST',
          body: formData,
          signal: controller.signal,
          headers: {
            ...(token && { 'Authorization': `Bearer ${token}` })
          }
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
          let errorData = 'Upload fehlgeschlagen';
          try {
              errorData = await response.text();
          } catch (e) { /* ignore */ }
          throw new Error(`${errorData} (${response.status})`);
      }

      const updatedData = await response.json();
      setRecipe(updatedData); 
      setImageFile(null);
      setIsEditing(false);
    } catch (err) {
      console.error('Fehler beim Hochladen des Bildes:', err);
      
      // Provide a more helpful error message
      if (err.name === 'AbortError') {
        setLocalError('Der Upload wurde abgebrochen, da der Server nicht rechtzeitig geantwortet hat. Bitte versuchen Sie es später erneut.');
      } else if (err.message.includes('Failed to fetch') || err.name === 'TypeError') {
        setLocalError('Verbindung zum Server fehlgeschlagen. Bitte überprüfen Sie Ihre Internetverbindung oder kontaktieren Sie den Administrator.');
      } else {
        setLocalError(err.message || 'Fehler beim Hochladen des Bildes');
      }
    } finally {
      setIsImageUpdating(false);
    }
  };

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
    if (isEditing) {
      setImageFile(null); 
      setLocalError(null);
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
          {/* <LoadingSpinner /> // Auskommentiert */}
          <Loading>Rezept wird geladen...</Loading>
        </StatusContainer>
      </PageContainer>
    );
  }

  if (localError || recipesError) {
    return (
      <PageContainer>
        <StatusContainer>
          <ErrorMessageStyled>{localError || recipesError}</ErrorMessageStyled> {/* Ersetzt ErrorMessage */} 
          <ButtonContainer style={{ borderTop: 'none', marginTop: 0, justifyContent: 'space-around' }}>
            <ActionButton onClick={handleRetry}>
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
          <ErrorMessageStyled>Rezept nicht gefunden.</ErrorMessageStyled> {/* Ersetzt ErrorMessage */} 
           <ButtonContainer style={{ borderTop: 'none', marginTop: 0, justifyContent: 'center' }}>
            <ActionButton onClick={() => navigate('/recipes')} >
              Zurück zur Übersicht
            </ActionButton>
          </ButtonContainer>
        </StatusContainer>
      </PageContainer>
    );
  }

  if (isCookMode && recipe?.steps?.length > 0) {
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
              <FaEdit /> {isEditing ? 'Abbrechen' : 'Bild ändern'}
            </EditButton>
          </HeaderTopRow>
          
          {isEditing ? (
            <ImageSection>
              <h3>Rezeptbild ändern</h3>
              <ImageUpload 
                label="Neues Bild hochladen oder hierher ziehen" 
                onChange={handleImageChange}
                currentImage={recipe.image?.data ? `data:${recipe.image.contentType};base64,${recipe.image.data}` : null}
              />
              {imageFile && (
                <div style={{ marginTop: '16px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <ActionButton 
                    onClick={handleImageUpload}
                    disabled={isImageUpdating}
                    style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
                  >
                    {isImageUpdating ? 'Wird hochgeladen...' : 'Bild speichern'}
                  </ActionButton>
                   <ActionButton 
                    onClick={() => setImageFile(null)} 
                  >
                    Auswahl aufheben
                  </ActionButton>
                </div>
              )}
              {localError && imageFile && (
                <ErrorMessageStyled style={{ marginTop: '16px' }}>
                  {localError}
                </ErrorMessageStyled>
              )}
            </ImageSection>
          ) : (
            <RecipeImageWrapper theme={theme}>
              {recipe.image && recipe.image.data ? (
                <img 
                  src={`data:${recipe.image.contentType};base64,${recipe.image.data}`} 
                  alt={recipe.title} 
                />
              ) : (
                <span>{recipe.emoji || '🍽️'}</span> 
              )} 
            </RecipeImageWrapper>
          )}
          
          <TagsContainer>
            {recipe.tags && recipe.tags.map((tag, index) => (
              <Tag key={index}>{tag}</Tag>
            ))}
            {recipe.isAIGenerated && <Tag theme={theme}>KI-generiert</Tag>}
            {recipe.dietaryRestrictions?.map((diet, index) => (
              <Tag key={index} theme={theme}>{diet}</Tag>
            ))}
            {recipe.cuisine && <Tag theme={theme}>{recipe.cuisine}</Tag>}
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
        
        {recipe.description && (
          <Section>
            <SectionTitle>
              <FaInfoCircle /> Beschreibung
            </SectionTitle>
            <SectionDescription>
              {recipe.description.split('\\n\\n').map((para, index) => <p key={index}>{para}</p>)}
            </SectionDescription>
          </Section>
        )}
        
        {recipe.ingredients && recipe.ingredients.length > 0 && (
          <Section>
            <SectionTitle>
              <FaAppleAlt /> Zutaten
            </SectionTitle>
            <IngredientList>
              {recipe.ingredients.map((ingredient, index) => (
                <Ingredient key={index} theme={theme}>
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
        
        {recipe.steps && recipe.steps.length > 0 && (
          <Section>
            <SectionTitle>
              <FaClipboardList /> Zubereitung
            </SectionTitle>
            <StepsList>
              {recipe.steps.map((step, index) => (
                <Step 
                  key={index} 
                  theme={theme}
                  active={isCookMode && index === currentStep}
                >
                  <div className="step-content" dangerouslySetInnerHTML={{ __html: formatStepText(step) }} />
                </Step>
              ))}
            </StepsList>

            {!isCookMode && recipe.steps.length > 1 && (
              <CookModeControls>
                <ActionButton onClick={toggleCookMode} variant="primary">
                  <FaBook /> Schritt-für-Schritt-Modus starten
                </ActionButton>
              </CookModeControls>
            )}
          </Section>
        )}
        
        {recipe.nutrition && Object.keys(recipe.nutrition).length > 0 && (
          <Section>
            <SectionTitle>
              <FaBalanceScale /> Nährwerte (pro Portion)
            </SectionTitle>
            <NutritionSection theme={theme}>
              <NutritionGrid>
                {recipe.nutrition.calories && (
                  <NutritionItem theme={theme}>
                    <span>Kalorien</span>
                    <span>{recipe.nutrition.calories} kcal</span>
                  </NutritionItem>
                )}
                {recipe.nutrition.protein && (
                  <NutritionItem theme={theme}>
                    <span>Eiweiß</span>
                    <span>{recipe.nutrition.protein} g</span>
                  </NutritionItem>
                )}
                {recipe.nutrition.carbs && (
                  <NutritionItem theme={theme}>
                    <span>Kohlenhydrate</span>
                    <span>{recipe.nutrition.carbs} g</span>
                  </NutritionItem>
                )}
                {recipe.nutrition.fat && (
                  <NutritionItem theme={theme}>
                    <span>Fett</span>
                    <span>{recipe.nutrition.fat} g</span>
                  </NutritionItem>
                )}
              </NutritionGrid>
            </NutritionSection>
          </Section>
        )}

        {recipe.tips && recipe.tips.length > 0 && (
          <Section>
            <SectionTitle>
              <FaLightbulb /> Tipps
            </SectionTitle>
            <TipsContainer theme={theme}>
              <ul>
                {recipe.tips.map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            </TipsContainer>
          </Section>
        )}
        
        {/* Auskommentierter Assistant Section Block */} 
        {/* {recipe && (
          <AssistantSection>
            <AssistantTitle>Kochassistent</AssistantTitle>
            <AssistantDescription>Stelle Fragen zu diesem Rezept - der Assistent hilft dir bei der Zubereitung, gibt Tipps oder erklärt Techniken.</AssistantDescription>
            
            <ChatContainer>
              <MessagesContainer>
                {messages.map(message => (
                  <MessageBubble key={message.id} $isUser={message.isUser}>
                    {message.isUser ? 
                      message.text :
                      <div dangerouslySetInnerHTML={{ __html: formatAssistantText(message.text) }} />
                    }
                  </MessageBubble>
                ))}
                {assistantLoading && (
                   <MessageBubble $isUser={false}>
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
        )} */}
        
        <ButtonContainer>
          <ActionButton onClick={() => navigate('/recipes')} >
             <FaChevronLeft /> Zurück zur Übersicht
          </ActionButton>
          <ActionButton 
            onClick={handleDelete}
            $variant="danger"
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