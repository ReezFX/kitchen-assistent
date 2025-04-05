# Kitchen Assistant

A lightweight, responsive web application for searching recipes and getting cooking guidance with AI-powered assistance. Designed to run efficiently on a Raspberry Pi and provide a tablet-friendly interface for use in the kitchen.

## Project Overview

Kitchen Assistant is a web application designed to help home cooks find recipes, follow cooking instructions, and receive AI-powered cooking advice. The application runs on a Raspberry Pi, making it an affordable, dedicated kitchen helper that can be accessed from any device on your home network, particularly optimized for tablet use.

## Features

- **Recipe Search**: Find recipes by name, ingredients, or tags
- **Recipe Filtering**: Filter recipes by categories like "vegetarian", "quick", "healthy", etc.
- **Detailed Recipe View**: Step-by-step instructions and ingredient lists
- **AI Cooking Assistant**: Ask for advice on cooking techniques, ingredient substitutions, or recipe modifications
- **Voice Input**: Use voice commands for hands-free operation while cooking
- **Responsive Design**: Optimized for tablet use in the kitchen
- **Lightweight**: Designed to run efficiently on a Raspberry Pi

## Technology Stack

- **Backend**: Python with Flask
- **Frontend**: HTML, CSS, and vanilla JavaScript
- **AI Integration**: Gemma AI API for cooking assistance
- **Data Storage**: JSON file-based recipe storage (upgradable to a database if needed)
- **Voice Recognition**: Web Speech API for voice input

## Setup Instructions

### Prerequisites

- Python 3.12 or newer
- Raspberry Pi (recommended: Pi 4 or newer) or any computer running Linux
- Git
- A device with a web browser for accessing the interface (tablet recommended)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/kitchen-assistant.git
   cd kitchen-assistant
   ```

2. Create and activate a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install the required packages:
   ```
   pip install -r backend/requirements.txt
   ```

4. Configure environment variables:
   ```
   cp backend/.env.sample backend/.env
   ```
   Edit the `.env` file and update the values as needed, especially the Gemma AI API key.

### Running the Application

1. Start the Flask application:
   ```
   cd backend
   python app.py
   ```

2. Access the application in your web browser:
   ```
   http://[raspberry-pi-ip-address]:5000
   ```
   Replace `[raspberry-pi-ip-address]` with the actual IP address of your Raspberry Pi.

## Usage Guide

### Finding Recipes

1. Use the search bar at the top to find recipes by name or ingredients
2. Click on filter tags to narrow down results
3. Browse the recipe list in the left panel
4. Click on a recipe to view details

### Using the AI Assistant

1. Select a recipe to view its details
2. Scroll down to the AI Kitchen Assistant section
3. Type a question about the recipe or cooking techniques
4. Alternatively, click the microphone icon to use voice input
5. The AI will provide helpful cooking advice

## Gemma AI Integration

The application uses Gemma AI for the intelligent cooking assistant. To enable this feature:

1. Sign up for an API key at [Gemma AI](https://gemma.ai) (replace with actual URL)
2. Add your API key to the `.env` file
3. Restart the application

Without a valid API key, the AI assistant feature will not function.

## Running on a Raspberry Pi

For optimal performance on a Raspberry Pi:

1. Use a Raspberry Pi 4 with at least 2GB RAM
2. Consider using a cooling solution if running for extended periods
3. For startup at boot, add to systemd:
   ```
   sudo nano /etc/systemd/system/kitchen-assistant.service
   ```
   Add the following content:
   ```
   [Unit]
   Description=Kitchen Assistant Web App
   After=network.target

   [Service]
   User=pi
   WorkingDirectory=/home/pi/kitchen-assistant/backend
   ExecStart=/home/pi/kitchen-assistant/venv/bin/python app.py
   Restart=always

   [Install]
   WantedBy=multi-user.target
   ```
   Then enable and start the service:
   ```
   sudo systemctl enable kitchen-assistant
   sudo systemctl start kitchen-assistant
   ```

4. Consider setting up a fixed IP address for easier access

## Development Guidelines

### Directory Structure

- `/backend` - Flask application, API endpoints, and recipe data
- `/backend/static` - Static assets for the frontend
- `/backend/templates` - HTML templates
- `/backend/recipes.json` - Recipe data

### Adding New Recipes

To add new recipes, edit the `backend/recipes.json` file following the existing format.

### Modifying the Frontend

The frontend is built with vanilla JavaScript for lightweight performance:
- HTML templates are in `/backend/templates`
- CSS and JavaScript are in `/backend/static`

### API Endpoints

- `GET /api/recipes` - Get all recipes with optional filtering via query parameters
- `GET /api/recipes/<id>` - Get a specific recipe by ID
- `POST /api/assistant` - Send a question to the AI assistant

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Recipe data is fictional and provided for demonstration purposes
- Built with accessibility and sustainability in mind
