import os
import json
import logging
import io
from pathlib import Path
from flask import Flask, request, jsonify, render_template, send_from_directory, redirect, url_for
import requests
from PIL import Image
from dotenv import load_dotenv
import google.generativeai as genai
import sounddevice as sd
import numpy as np
import asyncio

# Load environment variables
load_dotenv()

# Load Google Custom Search API credentials
GOOGLE_CSE_API_KEY = os.getenv('GOOGLE_CSE_API_KEY')
GOOGLE_CSE_ID = os.getenv('GOOGLE_CSE_ID')
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

# Configure GenAI client
model = None
chat_session = None
audio_stream = None

try:
    # Configure GenAI with API key
    api_key = os.getenv('GOOGLE_API_KEY')
    if not api_key:
        raise ValueError("GOOGLE_API_KEY environment variable not set")
    
    # Configure the API with the API key
    genai.configure(api_key=api_key)
    
    # Set up model configuration
    model_name = "gemini-2.0-flash"
    
    # Setup generation configuration
    generation_config = {
        "max_output_tokens": 500,
        "temperature": 0.1,
    }
    
    # Create a generative model instance
    model = genai.GenerativeModel(model_name, generation_config=generation_config)
    
    # Initialize audio stream if possible
    audio_stream = asyncio.Queue()
    
    try:
        # Check for available audio devices
        devices = sd.query_devices()
        if not devices:
            raise ValueError("No audio devices available")
        
        # Define callback for audio processing
        def callback(indata, frames, time, status):
            if status:
                print(status)
            audio_stream.put_nowait(indata.copy())
        
        # Start audio input stream
        sd.InputStream(
            channels=1,
            samplerate=16000,
            callback=callback
        ).start()
        logging.info("Audio stream initialized successfully")
    except Exception as e:
        logging.warning(f"Audio device not available: {str(e)}")
        logging.info("Continuing without audio capabilities")
        # With the new API, audio configuration is typically handled at request time
        # so we don't need to modify the client configuration
    
except Exception as e:
    logging.error(f"Failed to initialize GenAI client: {str(e)}")

# Recipe image cache directory
IMAGE_CACHE_DIR = os.path.join(os.path.dirname(__file__), 'static', 'img', 'recipes')

# Ensure the cache directory exists
os.makedirs(IMAGE_CACHE_DIR, exist_ok=True)

def get_recipe_image_path(recipe_id):
    """Get the path to a recipe image, check if it already exists"""
    # Check if we already have an image for this recipe
    cache_path = os.path.join(IMAGE_CACHE_DIR, f"recipe_{recipe_id}.jpg")
    
    # Return the path if the image exists
    if os.path.exists(cache_path):
        return f"/static/img/recipes/recipe_{recipe_id}.jpg"
    
    return None

def generate_recipe_image_query(recipe):
    """Generate a query for recipe image search using AI"""
    if model is None:
        # Fallback: use recipe name and main ingredients
        main_ingredients = recipe.get('ingredients', [])[:3]
        main_ingredients_str = ', '.join(main_ingredients)
        return f"{recipe['name']} with {main_ingredients_str} - food photography, professional, high quality"
    
    try:
        # Use Gemini to generate a better image description
        prompt = f"""
        Generate a short, specific phrase (10-15 words max) that would make a good search term 
        for finding a professional food photograph of this dish.
        Focus on visual aspects, main ingredients, and presentation style.
        Recipe: {recipe['name']}
        Main ingredients: {', '.join(recipe['ingredients'][:5])}
        Cuisine type: {', '.join(recipe['tags'])}
        
        Just return the search phrase, nothing else.
        """
        
        response = model.generate_content(prompt)
        
        if hasattr(response, 'text') and response.text:
            # Clean up the response
            query = response.text.strip().strip('"\'').strip()
            # Add quality modifiers
            query += " - food photography, professional, high quality"
            return query
        else:
            # Fallback
            main_ingredients = recipe.get('ingredients', [])[:3]
            main_ingredients_str = ', '.join(main_ingredients)
            return f"{recipe['name']} with {main_ingredients_str} - food photography, professional, high quality"
    
    except Exception as e:
        logging.error(f"Error generating image query: {str(e)}")
        # Fallback
        return f"{recipe['name']} - food photography, professional, high quality"

def get_google_image(query):
    """Get an image from Google Custom Search based on query"""
    try:
        # Ensure we have the required API keys
        if not GOOGLE_CSE_API_KEY or not GOOGLE_CSE_ID:
            logging.error("Google Custom Search API key or CSE ID not found in environment variables")
            return None

        # Form the query URL for Google Custom Search API
        base_url = "https://customsearch.googleapis.com/customsearch/v1"
        params = {
            "q": query,
            "cx": GOOGLE_CSE_ID,
            "key": GOOGLE_CSE_API_KEY,
            "searchType": "image",
            "rights": "cc_publicdomain,cc_attribute,cc_sharealike,cc_noncommercial,cc_nonderived",
            "num": 5,  # Request multiple images to have options if some fail
            "safe": "active",  # Ensure safe search is on
            "imgType": "photo",  # Prefer actual photos
        }
        
        # Make the request to Google Custom Search API
        response = requests.get(base_url, params=params, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            
            # Check if we have any image results
            if 'items' in data and len(data['items']) > 0:
                # Loop through items to find a suitable image
                for item in data['items']:
                    if 'link' in item:
                        return item['link']
                        
            # If we reach here, no suitable images were found
            logging.warning(f"No suitable images found for query: {query}")
            return None
        else:
            logging.error(f"Error fetching image from Google: {response.status_code}, {response.text}")
            return None
            
    except Exception as e:
        logging.error(f"Exception when fetching image from Google: {str(e)}")
        return None

def get_recipe_image_fallback(recipe):
    """Get a fallback image for the recipe based on its tags"""
    # Create the fallback image directory if it doesn't exist
    fallback_dir = os.path.join(os.path.dirname(__file__), 'static', 'img', 'fallbacks')
    os.makedirs(fallback_dir, exist_ok=True)
    
    # Map of recipe categories to fallback image names
    # We'll create a mapping of common recipe tags to general food categories
    category_mapping = {
        # Main dish categories
        'meat': ['beef', 'steak', 'pork', 'lamb', 'meat'],
        'poultry': ['chicken', 'turkey', 'duck', 'poultry'],
        'seafood': ['fish', 'salmon', 'tuna', 'seafood', 'shrimp', 'shellfish'],
        'vegetarian': ['vegetarian', 'vegan', 'plant-based'],
        'pasta': ['pasta', 'noodle', 'spaghetti', 'macaroni'],
        'soup': ['soup', 'stew', 'broth'],
        'salad': ['salad', 'slaw'],
        'breakfast': ['breakfast', 'brunch', 'eggs', 'pancake', 'waffle'],
        
        # Dessert categories
        'dessert': ['dessert', 'sweet', 'cake', 'pie', 'cookie', 'pastry'],
        'fruit': ['fruit', 'berry', 'apple', 'banana', 'mango'],
        
        # Baked goods
        'bread': ['bread', 'dough', 'baking'],
        
        # Default
        'default': ['meal', 'dinner', 'lunch', 'food']
    }
    
    # Find the best matching category for this recipe
    best_category = 'default'
    
    if recipe and 'tags' in recipe:
        for tag in recipe['tags']:
            tag_lower = tag.lower()
            for category, keywords in category_mapping.items():
                if any(keyword in tag_lower for keyword in keywords):
                    best_category = category
                    break
            if best_category != 'default':
                break
    
    # Generate an image from an online placeholder service
    fallback_image_url = f"https://via.placeholder.com/800x600/e2e8f0/1a202c?text=Recipe:{best_category.title()}"
    
    # Cache path for this recipe
    cache_path = os.path.join(IMAGE_CACHE_DIR, f"recipe_{recipe['id']}.jpg")
    
    # If we already have an image cached, don't bother fetching a new one
    if os.path.exists(cache_path):
        return f"/static/img/recipes/recipe_{recipe['id']}.jpg"
    
    try:
        # Download the placeholder image
        response = requests.get(fallback_image_url, stream=True, timeout=5)
        
        if response.status_code == 200:
            with open(cache_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=1024):
                    if chunk:
                        f.write(chunk)
            
            return f"/static/img/recipes/recipe_{recipe['id']}.jpg"
    except Exception as e:
        logging.error(f"Error creating fallback image: {str(e)}")
        return None
    
    return None

def download_and_cache_image(image_url, recipe_id):
    """Download an image and cache it locally"""
    try:
        # Download the image
        response = requests.get(image_url, stream=True, timeout=5)
        
        if response.status_code == 200:
            # Save the image to cache
            cache_path = os.path.join(IMAGE_CACHE_DIR, f"recipe_{recipe_id}.jpg")
            
            # Process image to ensure it's a reasonable size
            img = Image.open(io.BytesIO(response.content))
            
            # Resize to a reasonable size if needed
            max_size = (800, 800)
            img.thumbnail(max_size, Image.LANCZOS)
            
            # Save as JPEG
            img.convert('RGB').save(cache_path, "JPEG", quality=85)
            
            return f"/static/img/recipes/recipe_{recipe_id}.jpg"
        else:
            logging.error(f"Error downloading image: {response.status_code}")
            return None
            
    except Exception as e:
        logging.error(f"Error processing image: {str(e)}")
        return None

# Routes
@app.route('/')
def index():
    """Serve the main page"""
    return render_template('index.html')

@app.route('/recipe/<int:recipe_id>')
def recipe_detail(recipe_id):
    """Route to show a specific recipe detail page"""
    # Find the recipe by ID
    recipe = next((r for r in RECIPES if r['id'] == recipe_id), None)
    
    if not recipe:
        # Redirect to home page if recipe not found
        return redirect(url_for('index'))
    
    # Pass the recipe ID to the template
    return render_template('recipe_detail.html', recipe_id=recipe_id)
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

@app.route('/api/recipes/<int:recipe_id>/image', methods=['GET'])
def get_recipe_image(recipe_id):
    """API endpoint to get an image for a recipe"""
    # Check if we already have an image for this recipe
    image_path = get_recipe_image_path(recipe_id)
    
    if image_path:
        return jsonify({"image_url": image_path})
    
    # Find the recipe
    recipe = next((r for r in RECIPES if r['id'] == recipe_id), None)
    if not recipe:
        return jsonify({"error": "Recipe not found"}), 404
    
    # Generate a query for the image
    query = generate_recipe_image_query(recipe)
    
    try:
        # Get an image URL from Google Images
        image_url = get_google_image(query)
        
        if image_url:
            # Download and cache the image
            cached_path = download_and_cache_image(image_url, recipe_id)
            
            if cached_path:
                return jsonify({"image_url": cached_path})
    except Exception as e:
        logging.error(f"Error fetching image from Google Images: {str(e)}")
        # Continue to fallback
    
    # If we get here, try to use a fallback image
    fallback_image_path = get_recipe_image_fallback(recipe)
    
    if fallback_image_path:
        return jsonify({"image_url": fallback_image_path})
    else:
        return jsonify({"error": "Could not find or create an image for this recipe"}), 500

@app.route('/api/assistant', methods=['POST'])
def gemma_assistant():
    """API endpoint to interact with Gemini AI for recipe assistance"""
    if model is None:
        logging.warning("GenAI model not initialized, using fallback response")
        return gemma_assistant_fallback()
    
    data = request.json
    user_query = data.get('query', '')
    
    if not user_query:
        return jsonify({"error": "No query provided"}), 400
    
    try:
        # Generate content directly using the model
        response = model.generate_content(user_query)
        
        # Extract the response text
        if hasattr(response, 'text') and response.text:
            return jsonify({"response": response.text})
        else:
            return jsonify({"error": "No response received from AI"}), 500
            
    except Exception as e:
        logging.error(f"Unexpected error: {str(e)}")
        return jsonify({"error": f"An unexpected error occurred: {str(e)}"}), 500

@app.route('/api/assistant/fallback', methods=['POST'])
def gemma_assistant_fallback():
    """API endpoint to interact with Gemini AI for recipe assistance (fallback)"""
    data = request.json
    user_query = data.get('query', '')
    
    if not user_query:
        return jsonify({"error": "No query provided"}), 400
    
    try:
        # Generate a simple fallback response when API access fails
        query = user_query.lower()
        
        # Basic keyword matching for common recipe questions
        if any(word in query for word in ["substitute", "replacement", "instead of"]):
            return jsonify({"response": "For ingredient substitutions, you can often use: olive oil instead of butter, applesauce instead of oil, Greek yogurt instead of sour cream, or honey instead of sugar. What specific ingredient are you looking to replace?"})
        
        elif any(word in query for word in ["vegetarian", "vegan", "plant-based"]):
            return jsonify({"response": "To make a recipe vegetarian, you can replace meat with tofu, tempeh, seitan, lentils, beans, or mushrooms. For binding, you can use flax eggs (1 tbsp ground flaxseed + 3 tbsp water) instead of eggs."})
        
        elif any(word in query for word in ["gluten", "gluten-free", "celiac"]):
            return jsonify({"response": "For gluten-free cooking, you can substitute regular flour with almond flour, rice flour, or a gluten-free flour blend. Always check that other ingredients like soy sauce or broths are labeled gluten-free."})
        
        elif any(word in query for word in ["store", "keep", "refrigerate", "freeze"]):
            return jsonify({"response": "Most cooked dishes can be stored in the refrigerator for 3-4 days. For freezing, cool completely, portion into airtight containers, and freeze for up to 2-3 months. Label with the date for best results."})
        
        elif any(word in query for word in ["double", "half", "scale", "portion"]):
            return jsonify({"response": "To scale a recipe, multiply or divide all ingredients by the same ratio. For baking recipes, it's better to use weight measurements rather than volume for accuracy when scaling."})
        
        else:
            return jsonify({"response": "I'm currently operating in offline mode. For specific recipe advice, please try common substitutions or adjustments, or check a reliable cookbook. You can also search online or try again later when the service is fully available."})
            
    except Exception as e:
        logging.error(f"Unexpected error: {str(e)}")
        return jsonify({"error": f"An unexpected error occurred: {str(e)}"}), 500

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
    
    # Set system instructions for the model
    if model is not None:
        try:
            # Define the system instruction for the cooking assistant
            system_instruction = """
You are a helpful cooking assistant that provides advice on recipes, ingredients, 
substitutions, and cooking techniques. Keep your responses focused on cooking, food, 
and kitchen assistance. Be friendly and supportive, offering practical advice that 
home cooks can implement.
"""
            # Recreate the model with system instructions
            # Note: In google-generativeai 0.8.4, we might need to include 
            # the system instructions in each prompt instead
            logging.info("System instruction prepared for the cooking assistant")
            
        except Exception as e:
            logging.warning(f"Failed to set system instructions: {str(e)}")
    
    app.run(debug=debug_mode, host=host, port=port)
