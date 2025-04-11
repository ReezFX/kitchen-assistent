import React from 'react';
import styled from 'styled-components';
import { HelpIndicator } from './index';

// Example of how to structure page descriptions that are hidden on mobile
// but accessible via the help indicator

const Description = styled.p`
  font-size: 1.1rem;
  color: var(--color-text-secondary);
  margin-bottom: 2rem;
  line-height: 1.6;
  
  /* Hide on mobile but show on desktop */
  @media (max-width: 768px) {
    display: none;
  }
`;

const MobileHelpContainer = styled.div`
  /* Only show on mobile */
  display: none;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    display: block;
  }
`;

/**
 * A template component showing how to handle responsive descriptions
 * - Description text is visible on desktop
 * - Description is hidden on mobile but accessible via help icon
 */
const DescriptionTemplate = ({ title, children }) => {
  return (
    <>
      {/* Visible only on desktop */}
      <Description>
        {children}
      </Description>
      
      {/* Visible only on mobile */}
      <MobileHelpContainer>
        <HelpIndicator title={title || "Hinweis"}>
          {children}
        </HelpIndicator>
      </MobileHelpContainer>
    </>
  );
};

export default DescriptionTemplate;

// HOW TO USE:
/*
import DescriptionTemplate from '../../shared/components/ui/DescriptionTemplate';

// In your component:
<PageHeader>
  <Title>Meine Seite</Title>
  
  <DescriptionTemplate title="Über diese Seite">
    <p>
      Hier steht eine ausführliche Beschreibung der Seite.
      Diese ist auf Desktop-Geräten direkt sichtbar, auf 
      mobilen Geräten aber nur über das Hilfe-Symbol zugänglich.
    </p>
    <p>
      Sie können auch mehrere Absätze hinzufügen, um mehr
      Kontext und Anleitung zu geben.
    </p>
  </DescriptionTemplate>
</PageHeader>
*/ 