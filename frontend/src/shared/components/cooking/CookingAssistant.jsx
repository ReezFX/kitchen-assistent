import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useAIService } from '../../hooks/useAIService';
import Card from '../common/Card';
import Button from '../common/Button';

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 500px;
  max-height: 70vh;
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const MessageBubble = styled.div`
  padding: 12px 16px;
  border-radius: 16px;
  max-width: 80%;
  word-break: break-word;
  
  ${props => props.isUser ? `
    align-self: flex-end;
    background-color: #4f46e5;
    color: white;
    border-bottom-right-radius: 4px;
  ` : `
    align-self: flex-start;
    background-color: #f3f4f6;
    color: #1f2937;
    border-bottom-left-radius: 4px;
  `}
`;

const InputContainer = styled.form`
  display: flex;
  gap: 8px;
  padding: 16px;
  border-top: 1px solid #e5e7eb;
`;

const StyledInput = styled.input`
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 24px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #4f46e5;
    box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1);
  }
`;

const RecipeContextArea = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  resize: vertical;
  min-height: 100px;
  margin-bottom: 16px;
  
  &:focus {
    outline: none;
    border-color: #4f46e5;
    box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1);
  }
`;

const CookingAssistant = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: 'Hallo! Ich bin dein Kochassistent. Wie kann ich dir heute helfen?', isUser: false }
  ]);
  const [input, setInput] = useState('');
  const [recipeContext, setRecipeContext] = useState('');
  const messagesEndRef = useRef(null);
  
  const { getAssistance, isLoading, error } = useAIService();
  
  // Auto-scroll to the bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (input.trim() === '') return;
    
    // Add user message
    const userMessage = { id: Date.now(), text: input, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    
    try {
      // Get response from AI
      const assistantResponse = await getAssistance(input, recipeContext);
      
      // Add assistant message
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
          text: 'Entschuldigung, ich konnte deine Frage nicht beantworten. Bitte versuche es später noch einmal.', 
          isUser: false 
        }
      ]);
    }
  };
  
  return (
    <Card title="Kochassistent">
      <div>
        <h4>Rezeptkontext (optional)</h4>
        <p>Füge hier dein aktuelles Rezept ein, damit der Assistent bessere Antworten geben kann.</p>
        <RecipeContextArea
          value={recipeContext}
          onChange={(e) => setRecipeContext(e.target.value)}
          placeholder="Füge hier dein Rezept ein oder lasse es leer für allgemeine Fragen"
        />
      </div>
      
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
            placeholder="Stelle eine Frage..."
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            disabled={input.trim() === '' || isLoading}
          >
            {isLoading ? 'Sendet...' : 'Senden'}
          </Button>
        </InputContainer>
      </ChatContainer>
    </Card>
  );
};

export default CookingAssistant; 