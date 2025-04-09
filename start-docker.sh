#!/bin/bash

# Farben für die Ausgabe
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting Kitchen-Assistant Docker Environment...${NC}"

# Prüfe, ob die Umgebungsvariable GEMINI_API_KEY gesetzt ist
if [ -z "$GEMINI_API_KEY" ]; then
  echo -e "${YELLOW}GEMINI_API_KEY is not set. You can set it with:${NC}"
  echo "export GEMINI_API_KEY=your_api_key"
  echo -e "${YELLOW}Using value from backend/.env if available${NC}"
  
  # Versuche, den API-Key aus der .env-Datei zu extrahieren
  if [ -f backend/.env ]; then
    GEMINI_API_KEY=$(grep GEMINI_API_KEY backend/.env | cut -d= -f2)
    if [ -z "$GEMINI_API_KEY" ]; then
      echo -e "${YELLOW}Could not find GEMINI_API_KEY in backend/.env${NC}"
      echo -e "${YELLOW}Please set your GEMINI API key in backend/.env or as an environment variable${NC}"
    else
      export GEMINI_API_KEY
      echo -e "${GREEN}Found GEMINI_API_KEY in backend/.env${NC}"
    fi
  else
    echo -e "${YELLOW}backend/.env file not found${NC}"
  fi
fi

# Starte Docker Compose
echo -e "${GREEN}Starting Docker containers...${NC}"
docker-compose up -d

# Status anzeigen
echo -e "${GREEN}Container status:${NC}"
docker-compose ps

echo
echo -e "${GREEN}You can access the application at:${NC}"
echo -e "Frontend: ${YELLOW}http://localhost:3000${NC}"
echo -e "Backend API: ${YELLOW}http://localhost:5000${NC}"
echo
echo -e "${YELLOW}To stop the containers, run:${NC} docker-compose down" 