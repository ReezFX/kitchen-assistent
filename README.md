# KI-gestützter Koch-Assistent

Eine moderne Web-Anwendung, die Hobbyköche mit KI-gestützten Funktionen unterstützt, einschließlich Rezeptgenerierung, Kochassistenz und mehrsprachigen Inhalten. Basierend auf React und der Google AI Studio API (Gemini).

## Funktionen

- **Rezeptgenerierung**: Erstellt Rezepte basierend auf verfügbaren Zutaten und Ernährungspräferenzen
- **Kochassistent**: Beantwortet Fragen während des Kochvorgangs in Echtzeit
- **Übersetzung**: Übersetzt Rezepte und Anleitungen in verschiedene Sprachen

## Technologie-Stack

### Frontend
- React
- React Router
- Styled Components
- Axios

### Backend
- Node.js mit Express
- MongoDB
- JWT für Authentifizierung
- Google AI Studio API (Gemini)

## Fortschritt

### Backend
- [x] Grundstruktur erstellt
- [x] MongoDB-Modelle für Rezepte und Benutzer
- [x] AI Service mit Gemini API Integration
- [x] Caching für effiziente API-Nutzung
- [x] API-Routen für Rezeptgenerierung
- [x] API-Routen für Kochassistenten
- [x] API-Routen für Übersetzung
- [x] Authentifizierungsmiddleware
- [ ] Benutzerregistrierung und Login
- [ ] Rezeptspeicherung und -verwaltung
- [ ] Benutzereinstellungen speichern

### Frontend
- [x] Projektstruktur eingerichtet
- [x] Routing mit React Router
- [x] Layout-Komponenten (Header, Layout)
- [x] UI-Komponenten (Button, Input, Card)
- [x] Rezeptgenerator-Komponente
- [x] Zutatenselektor-Komponente
- [x] Kochassistent mit Chat-Funktionalität
- [x] Profilseite (Basisversion)
- [x] Homepage mit Feature-Vorstellung
- [ ] Benutzerauthentifizierung UI
- [ ] Gespeicherte Rezepte verwalten
- [ ] Responsive Design Optimierungen

### Allgemein
- [x] Projektsetup (React, Node.js)
- [x] Basisarchitektur nach Entwicklungsplan
- [x] KI-Integration
- [ ] Tests implementieren
- [ ] Deployment-Konfiguration

## Installation

### Voraussetzungen
- Node.js (v14 oder höher)
- MongoDB (lokale Installation oder Cloud-Service)
- Google AI Studio API-Schlüssel

### Backend einrichten

1. In das Backend-Verzeichnis wechseln:
   ```
   cd backend
   ```

2. Abhängigkeiten installieren:
   ```
   npm install
   ```

3. Umgebungsvariablen konfigurieren:
   Kopiere die `.env.example` Datei zu `.env` und aktualisiere die Werte:
   ```
   PORT=5000
   NODE_ENV=development
   MONGO_URI=mongodb://localhost:27017/kitchen-assistant
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRE=30d
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. Server starten:
   ```
   npm run dev
   ```

### Frontend einrichten

1. In das Frontend-Verzeichnis wechseln:
   ```
   cd frontend
   ```

2. Abhängigkeiten installieren:
   ```
   npm install
   ```

3. Entwicklungsserver starten:
   ```
   npm start
   ```

## Verwendung

Nach dem Start beider Server kannst du die Anwendung unter `http://localhost:3000` aufrufen.

## Projektstruktur

```
kitchen-assistant/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── models/
│   │   │   ├── routes/
│   │   │   ├── services/
│   │   │   ├── middleware/
│   │   │   ├── config/
│   │   │   └── server.js
│   │   └── package.json
├── frontend/
│   ├── src/
│   │   ├── core/
│   │   │   ├── ai/
│   │   │   ├── api/
│   │   │   └── utils/
│   │   ├── modules/
│   │   │   ├── recipes/
│   │   │   ├── cooking-guide/
│   │   │   ├── shopping-list/
│   │   │   └── user-profile/
│   │   ├── shared/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── context/
│   │   └── App.js
│   └── package.json
└── README.md
```

## Lizenz

MIT 