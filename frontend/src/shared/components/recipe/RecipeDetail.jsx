import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { useRecipes } from '../../hooks/useRecipes';
import { useAIService } from '../../hooks/useAIService';
import ImageUpload from '../common/ImageUpload';
import { FaUtensils, FaClock, FaArrowRight, FaArrowLeft, FaEdit, FaTrash, FaChevronLeft, FaPaperPlane } from 'react-icons/fa';
// import LoadingSpinner from '../common/LoadingSpinner'; // Auskommentiert: Modul nicht gefunden
// import ErrorMessage from '../common/ErrorMessage'; // Auskommentiert: Modul nicht gefunden
// import InteractiveAIChat from './InteractiveAIChat'; // Auskommentiert: Modul nicht gefunden
// import { toast } from 'react-toastify'; // Auskommentiert: Modul nicht gefunden
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // Auskommentiert: Modul nicht gefunden

// --- Styles copied from ExampleRecipeDetail.jsx ---

const PageContainer = styled.div`
  background-color: var(--color-background-light);
  min-height: 100vh;
  padding: 0;
`;

const ContentWrapper = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 20px;
  background-color: var(--color-background);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-radius: 16px;
  margin-top: 30px;
  margin-bottom: 30px;
`;

const RecipeHeader = styled.header`
  margin-bottom: 40px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--color-gray-200);
`;

const HeaderTopRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
`;

const RecipeTitle = styled.h1`
  font-size: 34px;
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1.2;
  margin: 0;
`;

const RecipeImageWrapper = styled.div`
  margin-bottom: 24px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  aspect-ratio: 16 / 9;
  background-color: var(--color-gray-100);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 100px;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

const ImageSection = styled.div`
  margin-bottom: 24px;
  padding: 20px;
  background-color: #f2f2f7;
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
  background-color: var(--color-gray-200);
  color: var(--color-text-secondary);
  font-size: 13px;
  font-weight: 500;
  padding: 5px 12px;
  border-radius: 16px;
`;

const RecipeMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  color: var(--color-text-secondary);
  font-size: 15px;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  
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
  margin-bottom: 40px;
`;

const SectionTitle = styled.h2`
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--color-gray-200);
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--color-gray-200);
`;

// --- Ingredient Styles ---
const IngredientList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
`;

const Ingredient = styled.li`
  display: flex;
  align-items: baseline;
  gap: 10px;
  padding: 12px;
  background-color: var(--color-gray-100);
  border-radius: 10px;
  font-size: 15px;
  
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
`;

// --- Steps Styles ---
const StepsList = styled.ol`
  list-style: none;
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
  background-color: var(--color-background);
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  position: relative;
  line-height: 1.6;

  &::before {
    content: counter(steps);
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 32px;
    height: 32px;
    background-color: var(--color-gray-100);
    color: var(--color-text-secondary);
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
    font-size: 17px;
    margin-bottom: 8px;
    color: var(--color-text-primary);
  }
  
  .step-description,
  & > div:not(.step-title):not(.step-description) {
    font-size: 15px;
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
  background-color: var(--color-gray-100);
  border-radius: 12px;
  padding: 20px;
`;

const NutritionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
`;

const NutritionItem = styled.div`
  padding: 16px;
  background-color: var(--color-background);
  border-radius: 10px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  
  span:first-child {
    font-weight: 500;
    color: var(--color-text-secondary);
    margin-bottom: 6px;
    font-size: 14px;
  }
  
  span:last-child {
    font-size: 20px;
    font-weight: 600;
    color: var(--color-text-primary);
  }
`;

// --- Tips/Notes Styles (can combine if structure is similar) ---
const NotesSection = styled.div`
  margin-top: 20px;
  padding: 16px;
  background-color: var(--color-gray-100);
  border-radius: 12px;

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    li {
      color: var(--color-text-secondary);
      line-height: 1.5;
      font-size: 15px;
      padding: 8px 0;
      border-bottom: 1px solid var(--color-gray-200);
      &:last-child {
        border-bottom: none;
      }
    }
  }
`;

// --- Assistant Styles (Copied from Example) ---
const AssistantSection = styled.div`
  margin-top: 40px;
  padding-top: 30px;
  border-top: 1px solid var(--color-gray-200);
`;

const AssistantTitle = styled.h2`
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 12px;
`;

const AssistantDescription = styled.p`
  font-size: 15px;
  color: var(--color-text-secondary);
  margin-bottom: 24px;
  line-height: 1.5;
`;

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 300px;
  border: 1px solid var(--color-gray-200);
  border-radius: 12px;
  overflow: hidden;
  background-color: var(--color-gray-100);
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
  border-radius: 20px;
  max-width: 75%;
  word-break: break-word;
  line-height: 1.5;
  font-size: 15px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

  ${props => props.$isUser ? `
    align-self: flex-end;
    background-color: var(--color-primary);
    color: white;
    border-bottom-right-radius: 6px;
  ` : `
    align-self: flex-start;
    background-color: var(--color-background);
    color: var(--color-text-primary);
    border: 1px solid var(--color-gray-200);
    border-bottom-left-radius: 6px;
    
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
  background-color: var(--color-gray-200);
  border-top: 1px solid var(--color-gray-300);
`;

const StyledInput = styled.input`
  flex: 1;
  padding: 10px 16px;
  border: 1px solid var(--color-gray-300);
  border-radius: 20px;
  font-size: 15px;
  background-color: var(--color-background);
  color: var(--color-text-primary);
  
  &:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.2);
  }

  &::placeholder {
    color: var(--color-text-tertiary);
  }
`;

const SendButton = styled.button`
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s ease;
  flex-shrink: 0;

  &:hover:not(:disabled) {
    background-color: var(--color-primary-dark);
  }

  &:disabled {
    background-color: var(--color-primary-light);
    cursor: not-allowed;
  }

  svg {
    font-size: 18px;
  }
`;

// --- Action Buttons (Adopted from Example) ---
const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 40px;
  padding-top: 24px;
  border-top: 1px solid var(--color-gray-200);
`;

// Use a simpler ActionButton or keep the previous versatile one
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
    switch (props.$variant) {
      case 'danger':
        return `
          background-color: transparent;
          color: var(--color-danger);
        `;
      default:
        return `
          background-color: var(--color-gray-200);
          color: var(--color-primary);
        `;
    }
  }}

  &:hover {
    ${(props) => {
      switch (props.$variant) {
        case 'danger':
          return `
            background-color: var(--color-danger-hover);
          `;
        default:
          return `
            background-color: var(--color-gray-300);
          `;
      }
    }}
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

// Keep EditButton styling (slightly modified for consistency)
const EditButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: var(--color-primary);
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: background-color 0.2s ease;
  margin-left: 16px; 

  &:hover {
    background-color: var(--color-gray-100);
  }
`;

// Keep Cook Mode Styles (mostly unchanged)
const CookModeContainer = styled.div`
  position: fixed;
  inset: 0;
  background-color: var(--color-background); 
  z-index: 1000;
  padding: 0;
  display: flex;
  flex-direction: column;
`;

const CookModeHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-gray-200);
  background-color: var(--color-background-translucent); 
  backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
  z-index: 1;
`;

const CookModeTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const CookModeCloseButton = styled.button`
  background: none;
  border: none;
  color: var(--color-primary);
  font-size: 17px;
  font-weight: 500;
  cursor: pointer;
  padding: 8px;
`;

const CookModeStep = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 40px 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const StepNumber = styled.div`
  font-size: 17px;
  font-weight: 600;
  color: var(--color-text-secondary); 
  margin-bottom: 12px;
  text-transform: uppercase;
`;

const StepContent = styled.div`
  max-width: 650px;
  width: 100%;
  font-size: 22px; 
  line-height: 1.6;
  margin-bottom: 30px;
  color: var(--color-text);
  
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
    text-align: left;
    display: inline-block;
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
  max-width: 650px; 
  margin-top: auto; 
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
  background-color: var(--color-gray-100); 
  color: var(--color-primary); 

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
  
  &:hover:not(:disabled) {
    background-color: var(--color-gray-200);
  }

  &.next {
    background-color: var(--color-primary);
    color: white;
    &:hover:not(:disabled) {
      background-color: var(--color-primary-dark);
    }
     &:disabled {
      background-color: var(--color-primary-light); 
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
  background-color: var(--color-gray-200); 
  color: var(--color-primary);
  border: none;
  border-radius: 10px;
  font-weight: 500;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: var(--color-gray-300);
  }
  
  svg {
    font-size: 16px;
  }
`;

// --- Loading & Error Styles (Adopted from Example/Improved) ---
const StatusContainer = styled.div`
  max-width: 600px;
  margin: 40px auto;
  padding: 40px;
  background-color: var(--color-background);
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  text-align: center;
`;

const Loading = styled.div`
  font-weight: 500;
  color: var(--color-primary);
  font-size: 18px;
  padding: 40px;
`;

// Manuell definierte Error Message Komponente als Ersatz
const ErrorMessageStyled = styled.div` 
  color: var(--color-danger);
  padding: 20px;
  border-radius: 12px;
  background-color: var(--color-danger-hover);
  margin-bottom: 24px;
  font-size: 15px;
  line-height: 1.5;
`;

// --- Component Logic ---

const RecipeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getRecipeById, deleteRecipe, error: recipesError } = useRecipes();
  const { getAssistance, isLoading: assistantLoading } = useAIService();
  
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
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${apiUrl}/recipes/${id}/image`, {
          method: 'POST',
          body: formData,
          headers: {
            ...(token && { 'Authorization': `Bearer ${token}` })
          }
      });

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
      setLocalError(err.message || 'Fehler beim Hochladen des Bildes');
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
            <RecipeImageWrapper>
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
            {recipe.isAIGenerated && <Tag>KI-generiert</Tag>}
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
            <div style={{ fontSize: '16px', lineHeight: '1.6', color: 'var(--color-text-secondary)' }}>
              {recipe.description.split('\\n\\n').map((para, index) => <p key={index}>{para}</p>)}
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
        
        {recipe.nutrition && (recipe.nutrition.calories || recipe.nutrition.protein || recipe.nutrition.carbs || recipe.nutrition.fat) && ( 
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
            </NutritionSection>
          </Section>
        )}

        {recipe.tips && recipe.tips.length > 0 && (
          <Section>
             <SectionTitle>Tipps</SectionTitle>
             <NotesSection>
              <ul>
                {recipe.tips.map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            </NotesSection>
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