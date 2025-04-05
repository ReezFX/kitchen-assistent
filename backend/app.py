import os
import json
import logging
from pathlib import Path
from flask import Flask, request, jsonify, render_template, send_from_directory
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Flask application
app = Flask(__name__, 
            static_folder='static',
            template_folder='templates')

# Load recipes from JSON file
def load_recipes():
    """Load recipes from recipes.json file with error handling"""
    try:
        recipes_path = Path(__file__).parent / 'recipes.json'
        with open(recipes_path, 'r') as file:
            return json.load(file)
    except FileNotFoundError:
        logging.error("recipes.json file not found")
        return []
    except json.JSONDecodeError:
        logging.error("Invalid JSON in recipes.json file")
        return []
    except Exception as e:
        logging.error(f"Error loading recipes: {str(e)}")
        return []

# Load recipe data from JSON file
RECIPES = load_recipes()

# Gemma AI API configuration
GEMMA_API_URL = os.getenv('GEMMA_API_URL', 'https://api.gemma.ai/v1')
GEMMA_API_KEY = os.getenv('GEMMA_API_KEY', '')

# Routes
@app.route('/')
def index():
    """Serve the main page"""
    return render_template('index.html')

@app.route('/api/recipes', methods=['GET'])
def get_recipes():
    """API endpoint to get recipes, with optional filtering"""
    search_term = request.args.get('q', '').lower()
    tag = request.args.get('tag', '').lower()
    
    filtered_recipes = RECIPES
    
    # Filter by search term (match in name or ingredients)
    if search_term:
        filtered_recipes = [
            recipe for recipe in filtered_recipes
            if search_term in recipe['name'].lower() or
            any(search_term in ingredient.lower() for ingredient in recipe['ingredients'])
        ]
    
    # Filter by tag
    if tag:
        filtered_recipes = [
            recipe for recipe in filtered_recipes
            if tag in recipe['tags']
        ]
    
    return jsonify(filtered_recipes)

@app.route('/api/recipes/<int:recipe_id>', methods=['GET'])
def get_recipe(recipe_id):
    """API endpoint to get a specific recipe by ID"""
    recipe = next((r for r in RECIPES if r['id'] == recipe_id), None)
    if recipe:
        return jsonify(recipe)
    return jsonify({"error": "Recipe not found"}), 404

@app.route('/api/assistant', methods=['POST'])
def gemma_assistant():
    """API endpoint to interact with Gemma AI or fallback to local response generation"""
    data = request.json
    user_query = data.get('query', '')
    
    # Log the incoming query
    logging.info(f"Received assistant query: {user_query}")
    
    if not user_query:
        logging.warning("Empty query received")
        return jsonify({"error": "No query provided"}), 400
    
    # First try with the Gemma AI API if configured
    if GEMMA_API_KEY:
        try:
            logging.info(f"Attempting to use Gemma AI API at: {GEMMA_API_URL}")
            
            # First attempt - with the original structure
            try:
                response = requests.post(
                    f"{GEMMA_API_URL}/generate",
                    headers={
                        "Authorization": f"Bearer {GEMMA_API_KEY}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "prompt": f"Recipe assistance: {user_query}",
                        "max_tokens": 150
                    },
                    timeout=10  # Add timeout to prevent hanging
                )
                
                logging.info(f"Gemma API response status: {response.status_code}")
                
                if response.status_code == 200:
                    ai_response = response.json()
                    return jsonify({"response": ai_response.get("text", "")})
                else:
                    logging.warning(f"Gemma API error: {response.status_code}, {response.text[:200]}")
                    # If first attempt failed, we'll try the fallback options
            except requests.RequestException as e:
                logging.warning(f"Request exception with first API attempt: {str(e)}")
                # Continue to fallback options
                
            # Second attempt - alternate API structure
            try:
                # Some APIs use a different structure
                response = requests.post(
                    f"{GEMMA_API_URL}/completions",  # Try a different endpoint
                    headers={
                        "Authorization": f"Bearer {GEMMA_API_KEY}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": "gemma-7b-it",  # Specify model if required
                        "messages": [
                            {"role": "system", "content": "You are a helpful kitchen assistant that provides cooking advice and recipe information."},
                            {"role": "user", "content": user_query}
                        ],
                        "temperature": 0.7,
                        "max_tokens": 150
                    },
                    timeout=10
                )
                
                if response.status_code == 200:
                    ai_response = response.json()
                    # Handle different response structures
                    if "choices" in ai_response and len(ai_response["choices"]) > 0:
                        return jsonify({"response": ai_response["choices"][0].get("message", {}).get("content", "")})
                    return jsonify({"response": ai_response.get("text", "")})
                else:
                    logging.warning(f"Alternate API structure also failed: {response.status_code}")
                    # Fall through to local fallback
            except requests.RequestException as e:
                logging.warning(f"Request exception with second API attempt: {str(e)}")
                # Fall through to local fallback
                
        except Exception as e:
            logging.error(f"Error communicating with Gemma AI: {str(e)}")
            # Continue to fallback mechanisms
    else:
        logging.warning("No Gemma API key configured, using fallback")

    # Fallback mechanism - provide a simple local response based on the query
    fallback_response = generate_fallback_response(user_query)
    logging.info("Using fallback response mechanism")
    return jsonify({"response": fallback_response})

def generate_fallback_response(query):
    """Generate a simple fallback response when API access fails"""
    query = query.lower()
    
    # Basic keyword matching for common recipe questions
    if any(word in query for word in ["substitute", "replacement", "instead of"]):
        return "For ingredient substitutions, you can often use: olive oil instead of butter, applesauce instead of oil, Greek yogurt instead of sour cream, or honey instead of sugar. What specific ingredient are you looking to replace?"
    
    elif any(word in query for word in ["vegetarian", "vegan", "plant-based"]):
        return "To make a recipe vegetarian, you can replace meat with tofu, tempeh, seitan, lentils, beans, or mushrooms. For binding, you can use flax eggs (1 tbsp ground flaxseed + 3 tbsp water) instead of eggs."
    
    elif any(word in query for word in ["gluten", "gluten-free", "celiac"]):
        return "For gluten-free cooking, you can substitute regular flour with almond flour, rice flour, or a gluten-free flour blend. Always check that other ingredients like soy sauce or broths are labeled gluten-free."
    
    elif any(word in query for word in ["store", "keep", "refrigerate", "freeze"]):
        return "Most cooked dishes can be stored in the refrigerator for 3-4 days. For freezing, cool completely, portion into airtight containers, and freeze for up to 2-3 months. Label with the date for best results."
    
    elif any(word in query for word in ["double", "half", "scale", "portion"]):
        return "To scale a recipe, multiply or divide all ingredients by the same ratio. For baking recipes, it's better to use weight measurements rather than volume for accuracy when scaling."
    
    else:
        return "I'm currently operating in offline mode. For specific recipe advice, please try common substitutions or adjustments, or check a reliable cookbook. You can also search online or try again later when the service is fully available."

# For development purposes, we need to serve the frontend files
@app.route('/frontend/<path:path>')
def serve_frontend(path):
    """Serve frontend files during development"""
    return send_from_directory('../frontend', path)

if __name__ == '__main__':
    # In production, use a proper WSGI server like gunicorn
    debug_mode = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    host = os.getenv('FLASK_HOST', '0.0.0.0')  # Accessible from other devices on the network
    port = int(os.getenv('FLASK_PORT', 5000))
    
    app.run(debug=debug_mode, host=host, port=port)

