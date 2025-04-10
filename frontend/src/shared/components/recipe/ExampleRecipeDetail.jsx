import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import Button from '../common/Button';
import { GradientButton } from '../ui/GradientButton';
import { FaUtensils, FaClock, FaChevronLeft, FaPaperPlane } from 'react-icons/fa';

// --- Base Styles inspired by Apple Design ---
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

const DemoHeader = styled.div`
  background-color: var(--color-primary-light);
  color: var(--color-primary);
  padding: 16px;
  text-align: center;
  border-radius: 12px 12px 0 0;
  font-weight: 600;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
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

// --- Assistant Styles ---
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

  ${props => props.isUser ? `
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

// --- Action Buttons ---
const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 40px;
  padding-top: 24px;
  border-top: 1px solid var(--color-gray-200);
`;

const RegistrationPrompt = styled.div`
  background: linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-primary) 100%);
  padding: 24px;
  border-radius: 12px;
  margin: 40px 0;
  color: white;
  text-align: center;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
`;

const PromptTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 12px;
`;

const PromptText = styled.p`
  margin-bottom: 20px;
  font-size: 16px;
  line-height: 1.5;
  opacity: 0.9;
`;

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
  background-color: var(--color-gray-200);
  color: var(--color-primary);
  
  &:hover {
    background-color: var(--color-gray-300);
  }
`;

const recipesData = [
  {
    id: 'gemuesefrittata',
    title: 'Gemüsereste-Frittata',
    emoji: '🥦',
    difficulty: 'easy',
    prepTime: 10,
    cookTime: 15,
    tags: ['Vegetarisch', 'Resteverwertung', 'KI-generiert'],
    description: 'Diese schnelle Gemüsefrittata ist perfekt, um übrig gebliebenes Gemüse aufzubrauchen und ein nahrhaftes, proteinreiches Gericht zu zaubern. Das Grundrezept kann beliebig variiert werden - nimm einfach, was der Kühlschrank hergibt!',
    ingredients: [
      { amount: 6, name: 'Eier' },
      { amount: 100, unit: 'ml', name: 'Milch' },
      { amount: 1, name: 'Zucchini (oder andere Gemüsereste)' },
      { amount: 1, name: 'Paprika (oder andere Gemüsereste)' },
      { amount: '200', unit: 'g', name: 'Kartoffeln, vorgekocht (oder Reste)' },
      { amount: 1, name: 'Zwiebel' },
      { amount: '100', unit: 'g', name: 'Käse, gerieben' },
      { amount: 2, unit: 'EL', name: 'Olivenöl' },
      { name: 'Salz und Pfeffer' },
      { name: 'Frische Kräuter (optional)' }
    ],
    steps: [
      'Vorbereitung: Den Backofen auf 180°C Umluft vorheizen. Eine ofenfeste Pfanne bereitstellen.',
      'Gemüse kleinschneiden: Zwiebel fein würfeln. Zucchini und Paprika in kleine Würfel schneiden. Vorgekochte Kartoffeln in dünne Scheiben schneiden.',
      'Gemüse anbraten: Olivenöl in einer ofenfesten Pfanne erhitzen. Zwiebeln glasig dünsten, dann das restliche Gemüse hinzufügen und 5-7 Minuten bei mittlerer Hitze anbraten.',
      'Eiermasse vorbereiten: In einer Schüssel Eier mit Milch verquirlen, mit Salz und Pfeffer würzen. Die Hälfte des Käses unterrühren.',
      'Frittata gießen: Die Eiermasse gleichmäßig über das Gemüse in der Pfanne gießen. Kurz auf dem Herd stocken lassen (ca. 2 Minuten).',
      'Backen: Die Pfanne in den vorgeheizten Ofen schieben und ca. 10-12 Minuten backen, bis die Frittata gestockt, aber noch saftig ist.',
      'Servieren: Mit dem restlichen Käse bestreuen und mit frischen Kräutern garnieren. In Stücke schneiden und servieren.'
    ],
    nutrition: {
      calories: '320',
      protein: '18',
      carbs: '15',
      fat: '22'
    }
  },
  {
    id: 'gebratenerreis',
    title: 'Gebratener Reis mit Resten',
    emoji: '🍚',
    difficulty: 'easy',
    prepTime: 5,
    cookTime: 15,
    tags: ['Schnell', 'One-Pot', 'KI-generiert'],
    description: 'Dieses einfache Gericht verwandelt übriggebliebenen Reis in eine köstliche Mahlzeit. Du kannst praktisch jedes Gemüse und jede Proteinquelle verwenden, die du zur Hand hast - ideal für die Resteverwertung!',
    ingredients: [
      { amount: '400', unit: 'g', name: 'gekochter Reis (vorzugsweise vom Vortag)' },
      { amount: '150', unit: 'g', name: 'gemischtes Gemüse (Erbsen, Mais, Karotten, etc.)' },
      { amount: '100', unit: 'g', name: 'Proteinquelle (Hähnchen, Tofu, Ei, etc.)' },
      { amount: 2, name: 'Eier (optional)' },
      { amount: 1, name: 'Zwiebel' },
      { amount: 2, name: 'Knoblauchzehen' },
      { amount: 2, unit: 'EL', name: 'Sojasoße' },
      { amount: 1, unit: 'EL', name: 'Sesamöl' },
      { amount: 2, unit: 'EL', name: 'Pflanzenöl' },
      { name: 'Salz und Pfeffer' },
      { name: 'Frühlingszwiebeln zum Garnieren' }
    ],
    steps: [
      'Vorbereitung: Gemüse in kleine Stücke schneiden. Zwiebel und Knoblauch fein hacken. Proteinquelle in mundgerechte Stücke schneiden.',
      'Anbraten der Proteine: In einer großen Pfanne oder einem Wok Öl erhitzen und die gewählte Proteinquelle anbraten, bis sie durchgegart ist. Zur Seite nehmen.',
      'Eier (falls verwendet): Eier verquirlen und in derselben Pfanne zu Rührei braten. Zur Seite nehmen.',
      'Gemüse anbraten: Mehr Öl hinzufügen, Zwiebeln und Knoblauch anbraten, bis sie duften. Das Gemüse hinzufügen und 3-4 Minuten anbraten.',
      'Reis hinzufügen: Den gekochten Reis in die Pfanne geben und unter Rühren anbraten, bis er heiß ist.',
      'Alles kombinieren: Proteine und Eier wieder hinzufügen, mit Sojasoße und Sesamöl würzen und alles gut vermischen.',
      'Abschmecken: Mit Salz und Pfeffer abschmecken und mit gehackten Frühlingszwiebeln garnieren.'
    ],
    nutrition: {
      calories: '450',
      protein: '20',
      carbs: '60',
      fat: '15'
    }
  },
  {
    id: 'gemuesesuppe',
    title: 'Suppe aus Gemüseenden',
    emoji: '🍲',
    difficulty: 'medium',
    prepTime: 15,
    cookTime: 30,
    tags: ['Vegan', 'Zero-Waste', 'KI-generiert'],
    description: 'Diese nährstoffreiche Suppe nutzt Gemüseabschnitte und -schalen, die normalerweise weggeworfen werden. Perfekt für eine nachhaltige Küche und überraschend voller Geschmack!',
    ingredients: [
      { name: 'Gemüseabschnitte und -schalen (z.B. Karottenschalen, Sellerieblätter, Zwiebelenden, Lauchgrün)' },
      { amount: 1, name: 'Zwiebel' },
      { amount: 2, name: 'Knoblauchzehen' },
      { amount: 1, unit: 'Stück', name: 'Ingwer (ca. 2 cm)' },
      { amount: 2, unit: 'EL', name: 'Olivenöl' },
      { amount: 1, unit: 'L', name: 'Wasser oder selbstgemachte Gemüsebrühe' },
      { amount: 2, name: 'Lorbeerblätter' },
      { amount: 1, unit: 'TL', name: 'getrockneter Thymian' },
      { amount: '200', unit: 'g', name: 'Kartoffeln, gewürfelt' },
      { amount: '100', unit: 'g', name: 'Linsen (optional)' },
      { name: 'Salz und Pfeffer' },
      { name: 'Frische Kräuter (z.B. Petersilie, Dill)' }
    ],
    steps: [
      'Gemüsereste vorbereiten: Alle Gemüseabschnitte und -schalen gründlich waschen. Zwiebel, Knoblauch und Ingwer schälen und hacken.',
      'Anschwitzen: In einem großen Topf Olivenöl erhitzen, Zwiebel, Knoblauch und Ingwer anschwitzen, bis sie duften (ca. 2-3 Minuten).',
      'Gemüsereste hinzufügen: Alle gewaschenen Gemüseabschnitte in den Topf geben und kurz mitbraten.',
      'Aufgießen: Mit Wasser oder Brühe aufgießen. Lorbeerblätter und Thymian hinzufügen.',
      'Kochen: Zum Kochen bringen, dann die Hitze reduzieren und 20-25 Minuten köcheln lassen.',
      'Würfeln und hinzufügen: In der Zwischenzeit Kartoffeln würfeln. Nach 10 Minuten Kochzeit die Kartoffeln (und Linsen, falls verwendet) zur Suppe geben.',
      'Pürieren: Die Suppe vom Herd nehmen, Lorbeerblätter entfernen und alles mit einem Stabmixer pürieren, bis eine glatte Konsistenz entsteht.',
      'Abschmecken: Mit Salz und Pfeffer würzen, mit frischen Kräutern garnieren und servieren.'
    ],
    nutrition: {
      calories: '180',
      protein: '6',
      carbs: '30',
      fat: '5'
    },
    tips: [
      'Je mehr verschiedene Gemüsesorten du verwendest, desto komplexer wird der Geschmack.',
      'Die Suppe kann eingefroren werden - perfekt für Zeiten, in denen du wenig Zeit zum Kochen hast.',
      'Für mehr Protein kannst du nach dem Pürieren eine Dose weiße Bohnen hinzufügen.'
    ]
  }
];

// Find recipe by ID
const findRecipeById = (id) => {
  return recipesData.find(recipe => recipe.id === id);
};

const ExampleRecipeDetail = ({ recipeId }) => {
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  // Static messages for the assistant
  const [messages, setMessages] = useState([
    { id: 1, text: 'Hallo! Ich bin dein Kochassistent. Stelle mir Fragen zu diesem Rezept.', isUser: false }
  ]);

  const recipe = findRecipeById(recipeId);

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
    const hasHeadline = /^([^:]+:)(.+)/.exec(text);
    if (hasHeadline) {
      const [, title, description] = hasHeadline;
      return `<div class="step-title">${title.trim()}</div><div class="step-description">${description.trim()}</div>`;
    }
    return `<div>${text}</div>`;
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (input.trim() === '') return;
    
    // Add user message
    const userMessage = { id: Date.now(), text: input, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    
    // Simulate assistant response
    setTimeout(() => {
      const demoResponses = [
        "Um dieses Rezept zu erleben, registriere dich bitte. Als angemeldeter Nutzer kannst du mit unserem KI-Assistenten interagieren und personalisierte Hilfe erhalten.",
        "Der volle Funktionsumfang des Kochassistenten steht nur registrierten Nutzern zur Verfügung. Möchtest du alle Features nutzen?",
        "Mit einem kostenlosen Account kannst du den Kochassistenten in Echtzeit nutzen und zu allen Rezepten individuelle Unterstützung bekommen!"
      ];
      
      const randomResponse = demoResponses[Math.floor(Math.random() * demoResponses.length)];
      setMessages(prev => [
        ...prev, 
        { id: Date.now() + 1, text: randomResponse, isUser: false }
      ]);
    }, 500);
  };

  if (!recipe) {
    return (
      <PageContainer>
        <ContentWrapper>
          <p>Beispielrezept nicht gefunden.</p>
          <ButtonContainer>
            <ActionButton onClick={() => navigate('/')}>
              <FaChevronLeft /> Zurück zur Startseite
            </ActionButton>
          </ButtonContainer>
        </ContentWrapper>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <ContentWrapper>
        <DemoHeader>
          <div>🧪 Beispielansicht - So könnte dein eigenes Rezept aussehen</div>
          <GradientButton as={Link} to="/register" size="small">
            Jetzt registrieren für eigene Rezepte
          </GradientButton>
        </DemoHeader>
        
        <RecipeHeader>
          <HeaderTopRow>
            <RecipeTitle>{recipe.title}</RecipeTitle>
          </HeaderTopRow>
          
          <RecipeImageWrapper>
            {recipe.emoji}
          </RecipeImageWrapper>
          
          <TagsContainer>
            {recipe.tags.map((tag, index) => (
              <Tag key={index}>{tag}</Tag>
            ))}
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
        
        {recipe.steps && recipe.steps.length > 0 && (
          <Section>
            <SectionHeader>
              <SectionTitle style={{ borderBottom: 'none', marginBottom: 0 }}>Zubereitung</SectionTitle>
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
            </NutritionSection>
          </Section>
        )}
        
        <RegistrationPrompt>
          <PromptTitle>Entdecke mehr personalisierte Rezepte</PromptTitle>
          <PromptText>
            Mit einem kostenlosen Account kannst du eigene Rezepte speichern, den Kochassistenten nutzen
            und Rezepte basierend auf deinen vorhandenen Zutaten generieren lassen.
          </PromptText>
          <GradientButton as={Link} to="/register">Jetzt kostenlos registrieren</GradientButton>
        </RegistrationPrompt>
        
        <AssistantSection>
          <AssistantTitle>Kochassistent</AssistantTitle>
          <AssistantDescription>Stelle Fragen zu diesem Rezept - der Assistent hilft dir bei der Zubereitung, gibt Tipps oder erklärt Techniken.</AssistantDescription>
          
          <ChatContainer>
            <MessagesContainer>
              {messages.map(message => (
                <MessageBubble key={message.id} isUser={message.isUser}>
                  {message.text}
                </MessageBubble>
              ))}
              <div ref={messagesEndRef} />
            </MessagesContainer>
            
            <InputContainer onSubmit={handleSendMessage}>
              <StyledInput
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Frage zum Rezept..."
              />
              <SendButton 
                type="submit" 
                disabled={input.trim() === ''}
                aria-label="Nachricht senden"
              >
                <FaPaperPlane />
              </SendButton>
            </InputContainer>
          </ChatContainer>
        </AssistantSection>
        
        <ButtonContainer>
          <ActionButton onClick={() => navigate('/')} >
             <FaChevronLeft /> Zurück zur Übersicht
          </ActionButton>
        </ButtonContainer>
      </ContentWrapper>
    </PageContainer>
  );
};

export default ExampleRecipeDetail; 