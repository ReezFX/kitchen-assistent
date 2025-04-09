# Docker-Testumgebung für Kitchen-Assistant

Diese Anleitung erklärt, wie du die Docker-Testumgebung für den Kitchen-Assistant einrichten und verwenden kannst.

## Voraussetzungen

Bevor du beginnen kannst, müssen folgende Komponenten installiert sein:

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Umgebungsvariablen

Die Anwendung benötigt einen Google Gemini API-Schlüssel für die KI-Funktionen. Dieser kann auf zwei Arten bereitgestellt werden:

1. In der `backend/.env`-Datei: `GEMINI_API_KEY=dein_api_schlüssel`
2. Als Umgebungsvariable: `export GEMINI_API_KEY=dein_api_schlüssel`

## Schnellstart

1. Stelle sicher, dass du den Google Gemini API-Schlüssel konfiguriert hast
2. Führe das Startskript aus:

```bash
./start-docker.sh
```

Die Anwendung ist dann unter folgenden URLs erreichbar:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Manuelles Starten der Container

Alternativ kannst du die Container auch manuell starten:

```bash
# Mit GEMINI_API_KEY als Umgebungsvariable
export GEMINI_API_KEY=dein_api_schlüssel
docker-compose up -d

# Oder direkt mit dem API-Schlüssel
GEMINI_API_KEY=dein_api_schlüssel docker-compose up -d
```

## Stoppen der Container

Um die Container zu stoppen, führe folgenden Befehl aus:

```bash
docker-compose down
```

## Container-Logs ansehen

Um die Logs der Container anzusehen:

```bash
# Alle Container
docker-compose logs -f

# Nur ein bestimmter Service
docker-compose logs -f frontend
docker-compose logs -f backend
docker-compose logs -f mongodb
```

## Datenbank Management

Die MongoDB Datenbank ist unter `mongodb://localhost:27017` erreichbar. Die Daten werden im Docker-Volume `mongodb_data` gespeichert und bleiben auch nach dem Neustart der Container erhalten.

## Fehlerbehebung

### Änderungen am Code werden nicht übernommen

Da die Anwendung im Development-Modus läuft, sollten Änderungen am Code automatisch erkannt werden. Falls nicht:

```bash
# Neu bauen und starten
docker-compose up -d --build
```

### GEMINI_API_KEY Fehler

Wenn du Fehler im Zusammenhang mit dem GEMINI_API_KEY siehst, stelle sicher, dass er korrekt konfiguriert ist:

```bash
# In backend/.env prüfen
cat backend/.env | grep GEMINI_API_KEY

# Oder als Umgebungsvariable setzen
export GEMINI_API_KEY=dein_api_schlüssel
```

### Container-Status prüfen

```bash
docker-compose ps
``` 