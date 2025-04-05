#!/bin/bash
#
# Kitchen Assistant Application Launcher
# This script sets up the environment and starts the Flask application
#

# Set text colors for better readability
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=====================================${NC}"
echo -e "${BLUE}  Kitchen Assistant Startup Script   ${NC}"
echo -e "${BLUE}=====================================${NC}"

# Change to the script's directory
cd "$(dirname "$0")"

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Error: Python 3 is not installed. Please install Python 3 before running this script.${NC}"
    exit 1
fi

# Check if virtual environment exists
if [ -d "venv" ]; then
    echo -e "${GREEN}Found virtual environment. Activating...${NC}"
    source venv/bin/activate
    if [ $? -ne 0 ]; then
        echo -e "${RED}Failed to activate virtual environment. Please check if it's properly created.${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}No virtual environment found. Running with system Python.${NC}"
    echo -e "${YELLOW}It's recommended to create a virtual environment:${NC}"
    echo -e "${YELLOW}  python3 -m venv venv${NC}"
    echo -e "${YELLOW}  source venv/bin/activate${NC}"
    echo -e "${YELLOW}  pip install -r backend/requirements.txt${NC}"
fi

# Check for .env file
if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}Warning: No .env file found in backend directory.${NC}"
    echo -e "${YELLOW}Creating .env from sample file...${NC}"
    
    if [ -f "backend/.env.sample" ]; then
        cp backend/.env.sample backend/.env
        echo -e "${YELLOW}Created .env file from sample. Please edit backend/.env to configure your settings.${NC}"
    else
        echo -e "${RED}No .env.sample file found. Creating a basic .env file...${NC}"
        echo "FLASK_DEBUG=True" > backend/.env
        echo "FLASK_HOST=0.0.0.0" >> backend/.env
        echo "FLASK_PORT=5000" >> backend/.env
        echo "GEMMA_API_URL=https://api.gemma.ai/v1" >> backend/.env
        echo "GEMMA_API_KEY=your_api_key_here" >> backend/.env
        echo -e "${YELLOW}Created a basic .env file. Please edit backend/.env to configure your settings.${NC}"
    fi
else
    echo -e "${GREEN}Found .env file.${NC}"
fi

# Check for recipes.json
if [ ! -f "backend/recipes.json" ]; then
    echo -e "${YELLOW}Warning: No recipes.json file found. The application will start with an empty recipe list.${NC}"
fi

# Check if required packages are installed
echo -e "${BLUE}Checking for required packages...${NC}"
if [ -f "venv/bin/pip" ]; then
    PIP="venv/bin/pip"
else
    PIP="pip"
fi

$PIP install -q -r backend/requirements.txt
if [ $? -ne 0 ]; then
    echo -e "${RED}Error installing required packages. Please run:${NC}"
    echo -e "${RED}  pip install -r backend/requirements.txt${NC}"
    exit 1
fi

# Get the local IP address
IP_ADDRESS=$(hostname -I | awk '{print $1}')
if [ -z "$IP_ADDRESS" ]; then
    IP_ADDRESS="localhost"
fi

echo -e "${GREEN}Starting Kitchen Assistant Application...${NC}"
echo -e "${GREEN}The application will be available at:${NC}"
echo -e "${GREEN}  http://$IP_ADDRESS:5000${NC}"
echo -e "${GREEN}Press CTRL+C to stop the application${NC}"

# Start the Flask application
cd backend
python app.py

# Handle exit
echo -e "${BLUE}Application stopped.${NC}"

