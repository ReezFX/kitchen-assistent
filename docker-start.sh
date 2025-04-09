#!/bin/bash

# Farben für die Ausgabe
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starte Kitchen-Assistant Docker-Umgebung...${NC}"

# Prüfe, ob Docker installiert ist
if ! command -v docker &> /dev/null; then
    echo "Docker ist nicht installiert. Bitte installiere Docker und Docker Compose."
    exit 1
fi

# Prüfe, ob Docker Compose installiert ist
if ! command -v docker-compose &> /dev/null; then
    echo "Docker Compose ist nicht installiert. Bitte installiere Docker Compose."
    exit 1
fi

# Prüfe, ob .env existiert, sonst kopiere .env.example
if [ ! -f .env ]; then
    echo "Erstelle .env-Datei..."
    cp .env.example .env 2>/dev/null || echo "# Google Gemini API-Schlüssel (muss vom Benutzer ausgefüllt werden)
GEMINI_API_KEY=your_gemini_api_key_here" > .env
    echo -e "${YELLOW}Bitte fülle den GEMINI_API_KEY in der .env-Datei aus!${NC}"
    echo
fi

# Starte Docker Compose
echo "Starte Container..."
docker-compose up -d

# Warte kurz, bis die Container gestartet sind
sleep 5

# Zeige Status der Container
echo
echo -e "${GREEN}Container Status:${NC}"
docker-compose ps

echo
echo -e "${GREEN}Die Anwendung ist nun erreichbar unter:${NC}"
echo -e "Frontend: ${YELLOW}http://localhost:3000${NC}"
echo -e "Backend API: ${YELLOW}http://localhost:5000${NC}"
echo -e "MongoDB: ${YELLOW}mongodb://localhost:27017${NC}"
echo
echo -e "${YELLOW}Hinweis: Um die Container zu stoppen, verwende 'docker-compose down'${NC}" 