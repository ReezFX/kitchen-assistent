/**
 * Kitchen Assistant - Frontend JavaScript
 * Handles recipe display, search, filtering, and AI assistant integration
 */

// DOM Elements
const elements = {
    // Search and filters
    searchForm: document.getElementById('search-form'),
    searchInput: document.getElementById('search-input'),
    voiceSearchBtn: document.getElementById('voice-search-btn'),
    filtersContainer: document.getElementById('filters'),
    filterTags: document.querySelectorAll('.filter-tag'),
    
    // Recipe display
    recipesLoading: document.getElementById('recipes-loading'),
    recipesContent: document.getElementById('recipes-content'),
    recipePlaceholder: document.getElementById('recipe-placeholder'),
    recipeContent: document.getElementById('recipe-content'),
    
    // Recipe detail elements
    detailTitle: document.getElementById('detail-title'),
    detailCookTime: document.getElementById('detail-cook-time'),
    detailIngredients: document.getElementById('detail-ingredients'),
    detailInstructions: document.getElementById('detail-instructions'),
    
    // Assistant
    assistantPrompt: document.getElementById('assistant-prompt'),
    voiceAssistantBtn: document.getElementById('voice-assistant-btn'),
    assistantBtn: document.getElementById('assistant-btn'),
    assistantLoading: document.getElementById('assistant-loading'),
    assistantResponse: document.getElementById('assistant-response'),
    voiceFeedback: document.getElementById('voice-feedback')
};

// Log element initialization
console.log('DOM Elements:', elements);

// State management
const state = {
    recipes: [],
    selectedRecipeId: null,
    activeFilters: new Set(),
    speechRecognition: null,
    isVoiceSupported: false,
    isListening: false,
    lastError: null,
    translatedRecipes: {} // Cache for translated recipes
};

// Log initial state
console.log('Initial State:', state);

// Check if speech recognition is supported
function initSpeechRecognition() {
    console.log('Initializing speech recognition...');
    
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
        console.log('Speech recognition supported');
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        state.speechRecognition = new SpeechRecognition();
        state.speechRecognition.continuous = false;
        state.speechRecognition.interimResults = false;
        state.speechRecognition.lang = 'en-US';
        state.isVoiceSupported = true;
        
        // Add visual indicator for voice buttons
        if (elements.voiceSearchBtn) elements.voiceSearchBtn.classList.add('active');
        if (elements.voiceAssistantBtn) elements.voiceAssistantBtn.classList.add('active');
        
        console.log('Speech recognition initialized successfully');
    } else {
        console.log('Speech recognition not supported');
        // Hide voice buttons if not supported
        if (elements.voiceSearchBtn) elements.voiceSearchBtn.style.display = 'none';
        if (elements.voiceAssistantBtn) elements.voiceAssistantBtn.style.display = 'none';
    }
}

// Show error message with visual feedback
function showError(message) {
    state.lastError = message;
    elements.assistantResponse.innerHTML = `<p>Error: ${message}</p>`;
    elements.assistantResponse.classList.remove('hidden');
    elements.assistantResponse.classList.add('text-red-600');
    
    // Log the error to console
    console.error('UI Error:', message);
}

// Clear error message
function clearError() {
    if (state.lastError) {
        elements.assistantResponse.classList.remove('text-red-600');
        state.lastError = null;
    }
}

// Fetch recipes from the API
async function fetchRecipes(query = '', tag = '') {
    try {
        elements.recipesLoading.classList.remove('hidden');
        elements.recipesContent.innerHTML = '';
        
        let url = '/api/recipes';
        const params = new URLSearchParams();
        
        if (query) params.append('q', query);
        if (tag) params.append('tag', tag);
        
        if (params.toString()) {
            url += '?' + params.toString();
        }
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}\nResponse: ${await response.text()}`);
        }
        
        const data = await response.json();
        state.recipes = data;
        
        renderRecipeList(data);
    } catch (error) {
        console.error('Error fetching recipes:', error);
        elements.recipesContent.innerHTML = `<p class="error">Error loading recipes: ${error.message}</p>`;
    } finally {
        elements.recipesLoading.classList.add('hidden');
    }
}

// Render the list of recipes
function renderRecipeList(recipes) {
    if (recipes.length === 0) {
        elements.recipesContent.innerHTML = '<p class="text-center text-gray-500 my-8" data-i18n="recipe_cards.no_recipes">No recipes found. Try a different search.</p>';
        return;
    }
    
    const fragment = document.createDocumentFragment();
    
    recipes.forEach(recipe => {
        const cardWrapper = document.createElement('div');
        cardWrapper.className = 'recipe-card-wrapper';
        
        const recipeCard = document.createElement('div');
        recipeCard.className = 'recipe-card';
        recipeCard.dataset.id = recipe.id;
        
        // Create recipe card HTML with improved layout
        recipeCard.innerHTML = `
            <div class="recipe-image">
                <div class="w-full h-full flex items-center justify-center text-gray-400">
                    <i class="fas fa-utensils text-3xl"></i>
                </div>
            </div>
            <div class="recipe-content">
                <h3 class="recipe-title">${recipe.name}</h3>
                <div class="recipe-time">
                    <i class="fas fa-clock mr-1"></i>
                    <span>${recipe.cook_time || '30'} min</span>
                </div>
                <div class="recipe-tags">
                    ${recipe.tags.slice(0, 3).map(tag => 
                        `<span class="recipe-tag">${tag}</span>`
                    ).join('')}
                </div>
            </div>
        `;
        
        recipeCard.addEventListener('click', () => {
            window.location.href = `/recipe/${recipe.id}`;
        });
        
        cardWrapper.appendChild(recipeCard);
        fragment.appendChild(cardWrapper);
        
        // Load recipe image after adding the card to fragment
        loadRecipeCardImage(recipeCard, recipe.id);
    });
    
    elements.recipesContent.innerHTML = '';
    elements.recipesContent.appendChild(fragment);
    
    // If we have recipes but none selected, select the first one
    if (recipes.length > 0 && !state.selectedRecipeId) {
        selectRecipe(recipes[0].id);
    }
}

// Select and display a recipe
function selectRecipe(recipeId) {
    state.selectedRecipeId = recipeId;
    
    // Highlight the selected recipe in the list
    const recipeCards = document.querySelectorAll('.recipe-card');
    recipeCards.forEach(card => {
        if (parseInt(card.dataset.id) === recipeId) {
            card.classList.add('active');
        } else {
            card.classList.remove('active');
        }
    });
    
    // Find the selected recipe
    const recipe = state.recipes.find(r => r.id === recipeId);
    
    if (!recipe) {
        console.error('Recipe not found:', recipeId);
        return;
    }
    
    // Check if elements exist before using them
    if (elements.recipePlaceholder) {
        elements.recipePlaceholder.classList.add('hidden');
    }
    
    if (elements.recipeContent) {
        elements.recipeContent.classList.remove('hidden');
    }
    
    // Check if detail elements exist before populating
    if (elements.detailTitle) {
        elements.detailTitle.textContent = recipe.name;
    }
    
    if (elements.detailCookTime) {
        elements.detailCookTime.textContent = recipe.cook_time;
    }
    
    // Ingredients
    if (elements.detailIngredients) {
        elements.detailIngredients.innerHTML = '';
        recipe.ingredients.forEach(ingredient => {
            const li = document.createElement('li');
            li.className = 'ingredient-item';
            li.textContent = ingredient;
            elements.detailIngredients.appendChild(li);
        });
    }
    
    // Instructions
    if (elements.detailInstructions) {
        elements.detailInstructions.innerHTML = '';
        recipe.instructions.forEach(instruction => {
            const li = document.createElement('li');
            li.className = 'instruction-item';
            li.textContent = instruction;
            elements.detailInstructions.appendChild(li);
        });
    }
}

function handleSearch(e) {
    e.preventDefault();
    const query = elements.searchInput.value.trim();
    const tag = Array.from(state.activeFilters).join(',');
    fetchRecipes(query, tag);
}

// Toggle filter tags
function toggleFilter(tag) {
    if (state.activeFilters.has(tag)) {
        state.activeFilters.delete(tag);
    } else {
        state.activeFilters.add(tag);
    }
    
    // Update UI to show active filters
    elements.filterTags.forEach(element => {
        const filterTag = element.getAttribute('data-tag');
        if (state.activeFilters.has(filterTag)) {
            element.classList.add('active');
        } else {
            element.classList.remove('active');
        }
    });
    
    // Apply filters (if there's a search query already)
    if (elements.searchInput.value.trim() || state.activeFilters.size > 0) {
        const query = elements.searchInput.value.trim();
        const tag = Array.from(state.activeFilters).join(',');
        fetchRecipes(query, tag);
    }
}

// Voice search functionality
function startVoiceInput(targetInput) {
    if (!state.isVoiceSupported) {
        showError('Voice recognition is not supported in your browser');
        return;
    }
    
    // Show listening feedback
    state.isListening = true;
    elements.voiceFeedback.textContent = 'Listening...';
    elements.voiceFeedback.classList.remove('hidden');
    
    if (elements.voiceAssistantBtn) {
        elements.voiceAssistantBtn.classList.add('bg-blue-500');
        elements.voiceAssistantBtn.classList.remove('bg-gray-100');
        elements.voiceAssistantBtn.style.cursor = 'not-allowed';
    }
    
    state.speechRecognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        targetInput.value = transcript;
        elements.voiceFeedback.textContent = 'Processing...';
        
        // Reset voice button
        if (elements.voiceAssistantBtn) {
            elements.voiceAssistantBtn.classList.remove('bg-blue-500');
            elements.voiceAssistantBtn.classList.add('bg-gray-100');
            elements.voiceAssistantBtn.style.cursor = 'pointer';
        }
        
        // If this was for search, submit the form
        if (targetInput === elements.searchInput) {
            elements.searchForm.dispatchEvent(new Event('submit'));
        }
        
        // Reset listening state
        state.isListening = false;
        elements.voiceFeedback.classList.add('hidden');
        clearError();
    };
    
    state.speechRecognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        showError('Error with voice recognition. Please try again.');
        
        // Reset voice button
        if (elements.voiceAssistantBtn) {
            elements.voiceAssistantBtn.classList.remove('bg-blue-500');
            elements.voiceAssistantBtn.classList.add('bg-gray-100');
            elements.voiceAssistantBtn.style.cursor = 'pointer';
        }
        
        // Reset listening state
        state.isListening = false;
        elements.voiceFeedback.classList.add('hidden');
    };
    
    state.speechRecognition.onend = () => {
        // Reset voice button
        if (elements.voiceAssistantBtn) {
            elements.voiceAssistantBtn.classList.remove('bg-blue-500');
            elements.voiceAssistantBtn.classList.add('bg-gray-100');
            elements.voiceAssistantBtn.style.cursor = 'pointer';
        }
        
        // Reset listening state
        state.isListening = false;
        elements.voiceFeedback.classList.add('hidden');
        
        // If we didn't get any results, show an error
        if (!state.speechRecognition.result) {
            showError('No speech detected. Please try speaking louder and clearly.');
        }
    };
    
    try {
        state.speechRecognition.start();
    } catch (error) {
        console.error('Error starting speech recognition:', error);
        showError('Error starting voice recognition. Please try again.');
    }
}

// Format AI response text to HTML using markdown-it
function formatAIResponse(text) {
    if (!text) return '';
    
    // Pre-process text to handle indented content better
    // This ensures indented blocks are properly preserved
    let processedText = text;
    
    // Create markdown-it instance with appropriate options
    const md = window.markdownit({
        html: false,        // Disable HTML tags in source
        breaks: true,       // Convert '\n' in paragraphs into <br>
        linkify: true,      // Autoconvert URL-like text to links
        typographer: true,  // Enable some language-neutral replacement + quotes beautification
        // Add code block highlighting options
        highlight: function(str, lang) {
            return ''; // Minimal highlighting
        }
    });
    
    // Special handling for indented content
    // This treats indented content as proper lists
    processedText = processedText.replace(/(\n\s{4,})(.*)/g, function(match, indent, content) {
        // Convert indented lines to proper list items if they don't start with a list marker
        if (!content.match(/^[\*\-\+\d\.]/)) {
            return '\n* ' + content.trim();
        }
        return match;
    });
    
    // Special handling for recipe sections
    // Makes sure sections with bold headers are properly formatted
    processedText = processedText.replace(/\*\*(.*?)\*\*:(.*?)(?=\n\s*\*\*|$)/gs, function(match, header, content) {
        return '**' + header + '**:\n' + content.trim() + '\n\n';
    });
    
    // Render the markdown to HTML
    const html = md.render(processedText);
    
    // Return the rendered HTML
    return html;
}

// Ask the AI assistant
async function askAssistant() {
    const query = elements.assistantPrompt.value.trim();
    
    if (!query) {
        showError('Please enter a question for the assistant');
        return;
    }
    
    try {
        // Show loading state
        elements.assistantResponse.classList.add('hidden');
        elements.assistantLoading.classList.remove('hidden');
        clearError();
        
        const response = await fetch('/api/assistant', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}\nResponse: ${await response.text()}`);
        }
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        
        // Format and show response
        const responseText = data.response || "I'm not sure how to answer that. Please try a different question.";
        elements.assistantResponse.innerHTML = formatAIResponse(responseText);
        elements.assistantResponse.classList.remove('hidden');
    } catch (error) {
        console.error('Assistant error details:', error);
        showError(error.message || 'Could not get a response from the assistant');
    } finally {
        elements.assistantLoading.classList.add('hidden');
    }
}

// Event listeners
function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // Search form
    if (elements.searchForm) {
        elements.searchForm.addEventListener('submit', handleSearch);
        console.log('Search form listener set up');
    }
    
    // Filter tags
    if (elements.filterTags) {
        elements.filterTags.forEach(tag => {
            tag.addEventListener('click', () => {
                toggleFilter(tag.getAttribute('data-tag'));
            });
        });
        console.log('Filter tags listeners set up');
    }
    
    // Voice search
    if (elements.voiceSearchBtn) {
        elements.voiceSearchBtn.addEventListener('click', () => {
            startVoiceInput(elements.searchInput);
        });
        console.log('Voice search button listener set up');
    }
    
    // Assistant
    if (elements.assistantBtn) {
        elements.assistantBtn.addEventListener('click', askAssistant);
        console.log('Assistant button listener set up');
    }
    
    // Voice assistant
    if (elements.voiceAssistantBtn) {
        elements.voiceAssistantBtn.addEventListener('click', () => {
            startVoiceInput(elements.assistantPrompt);
        });
        console.log('Voice assistant button listener set up');
    }
    
    // Enter key in assistant prompt
    if (elements.assistantPrompt) {
        elements.assistantPrompt.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                askAssistant();
            }
        });
        console.log('Assistant prompt keypress listener set up');
    }
}

/**
 * Handle recipe translation on the detail page
 * @param {number} recipeId - ID of the recipe to translate 
 * @param {string} language - Target language for translation
 */
async function handleRecipeDetailTranslation(recipeId, language) {
    if (!recipeId || language === 'en') return;
    
    try {
        console.log(`Handling recipe detail translation for recipe ${recipeId} to ${language}`);
        
        // Find the recipe
        const recipe = state.recipes.find(r => r.id === recipeId);
        if (!recipe) {
            // If not in state, try to fetch it
            try {
                const response = await fetch(`/api/recipes/${recipeId}`);
                if (response.ok) {
                    const fetchedRecipe = await response.json();
                    // Add to recipes array
                    state.recipes.push(fetchedRecipe);
                    // Now translate it
                    await translateAndUpdateRecipeDetail(fetchedRecipe, language);
                } else {
                    console.error(`Could not fetch recipe ${recipeId} for translation`);
                }
            } catch (error) {
                console.error(`Error fetching recipe ${recipeId}:`, error);
            }
            return;
        }
        
        // Translate the found recipe
        await translateAndUpdateRecipeDetail(recipe, language);
        
    } catch (error) {
        console.error(`Error handling recipe detail translation:`, error);
    }
}

/**
 * Translate a recipe and update the detail view
 * @param {Object} recipe - The recipe object to translate
 * @param {string} language - The target language 
 */
async function translateAndUpdateRecipeDetail(recipe, language) {
    try {
        // Translate the recipe
        const translatedRecipe = await translateRecipe(recipe, language);
        
        if (!translatedRecipe) return;
        
        // Update the UI with translated content
        if (elements.detailTitle) {
            elements.detailTitle.textContent = translatedRecipe.name;
        }
        
        // Ingredients
        if (elements.detailIngredients) {
            elements.detailIngredients.innerHTML = '';
            translatedRecipe.ingredients.forEach(ingredient => {
                const li = document.createElement('li');
                li.className = 'ingredient-item';
                li.textContent = ingredient;
                elements.detailIngredients.appendChild(li);
            });
        }
        
        // Instructions
        if (elements.detailInstructions) {
            elements.detailInstructions.innerHTML = '';
            translatedRecipe.instructions.forEach(instruction => {
                const li = document.createElement('li');
                li.className = 'instruction-item';
                li.textContent = instruction;
                elements.detailInstructions.appendChild(li);
            });
        }
        
        console.log(`Recipe detail view updated with translated content`);
    } catch (error) {
        console.error('Error translating and updating recipe detail:', error);
    }
}

/**
 * Set up translation-related event listeners
 */
function setupTranslationEventListeners() {
    console.log('Setting up translation event listeners...');
    
    // Listen for language changes
    document.addEventListener('languageChanged', async (event) => {
        console.log('Language changed event received:', event.detail.language);
        const language = event.detail.language;
        
        // If we have recipes loaded, translate them
        if (state.recipes && state.recipes.length > 0) {
            await translateRecipeList(state.recipes, language);
        }
        
        // If we're on a recipe detail page
        if (state.selectedRecipeId) {
            await handleRecipeDetailTranslation(state.selectedRecipeId, language);
        }
    });
    
    // Listen for recipe translation requests
    document.addEventListener('recipeTranslationNeeded', async (event) => {
        console.log('Recipe translation needed event received:', event.detail);
        const { recipeId, language } = event.detail;
        
        if (recipeId && language) {
            await handleRecipeDetailTranslation(recipeId, language);
        }
    });
    
    // Listen for recipe list translation requests
    document.addEventListener('recipeListTranslationNeeded', async (event) => {
        console.log('Recipe list translation needed event received:', event.detail);
        const { language } = event.detail;
        
        if (language && state.recipes && state.recipes.length > 0) {
            await translateRecipeList(state.recipes, language);
        }
    });
    
    console.log('Translation event listeners set up');
}

// Initialize the application
function init() {
    console.log('Initializing application...');
    
    // Set up voice recognition if available
    initSpeechRecognition();
    
    // Set up event listeners
    setupEventListeners();
    
    // Initial data load
    fetchRecipes();
    
    console.log('Application initialized');
}

/**
 * Translate a single recipe
 * @param {Object} recipe - The recipe to translate
 * @param {string} language - The target language
 * @returns {Promise<Object>} - The translated recipe
 */
async function translateRecipe(recipe, language) {
    if (!recipe || !recipe.id || !window.i18n) return recipe;
    if (language === 'en') return recipe; // No translation needed for English
    
    const cacheKey = `${recipe.id}-${language}`;
    
    // Check cache first
    if (state.translatedRecipes[cacheKey]) {
        console.log(`Using cached translation for recipe ${recipe.id} in ${language}`);
        return state.translatedRecipes[cacheKey];
    }
    
    try {
        console.log(`Translating recipe ${recipe.id} to ${language}...`);
        const translatedRecipe = await window.i18n.getTranslatedRecipe(recipe, language);
        
        if (translatedRecipe) {
            // Cache the translation
            state.translatedRecipes[cacheKey] = translatedRecipe;
            return translatedRecipe;
        }
    } catch (error) {
        console.error(`Error translating recipe ${recipe.id}:`, error);
    }
    
    return recipe; // Return original if translation fails
}

/**
 * Translate a list of recipes
 * @param {Array} recipes - Array of recipe objects to translate
 * @param {string} language - The target language
 * @returns {Promise<void>} - Promise that resolves when all translations are complete
 */
async function translateRecipeList(recipes, language) {
    if (!recipes || !recipes.length || !window.i18n) {
        renderRecipeList(recipes);
        return;
    }
    
    if (language === 'en') {
        renderRecipeList(recipes);
        return;
    }
    
    try {
        console.log(`Translating ${recipes.length} recipes to ${language}...`);
        
        // Create a copy of the recipes array to avoid modifying the original
        const translatedRecipes = [...recipes];
        
        // First render the original content to show something quickly
        renderRecipeList(recipes);
        
        // Then translate each recipe and update the display
        for (let i = 0; i < recipes.length; i++) {
            const recipe = recipes[i];
            const translatedRecipe = await translateRecipe(recipe, language);
            
            // Update the recipe in the array
            translatedRecipes[i] = translatedRecipe;
            
            // Update any displayed recipe names in the list
            const recipeCard = document.querySelector(`.recipe-card[data-id="${recipe.id}"]`);
            if (recipeCard) {
                const nameElement = recipeCard.querySelector('h3');
                if (nameElement) {
                    nameElement.textContent = translatedRecipe.name;
                }
            }
        }
        
        // If we're on the recipe detail page and have a recipe selected
        if (state.selectedRecipeId) {
            // Update the recipe detail view with the translated content
            const translatedRecipe = translatedRecipes.find(r => r.id === state.selectedRecipeId);
            if (translatedRecipe) {
                // Update the detail view with translated content
                if (elements.detailTitle) {
                    elements.detailTitle.textContent = translatedRecipe.name;
                }
                
                if (elements.detailIngredients) {
                    elements.detailIngredients.innerHTML = '';
                    translatedRecipe.ingredients.forEach(ingredient => {
                        const li = document.createElement('li');
                        li.className = 'ingredient-item';
                        li.textContent = ingredient;
                        elements.detailIngredients.appendChild(li);
                    });
                }
                
                if (elements.detailInstructions) {
                    elements.detailInstructions.innerHTML = '';
                    translatedRecipe.instructions.forEach(instruction => {
                        const li = document.createElement('li');
                        li.className = 'instruction-item';
                        li.textContent = instruction;
                        elements.detailInstructions.appendChild(li);
                    });
                }
            }
        }
        
        console.log(`Successfully translated ${recipes.length} recipes to ${language}`);
    } catch (error) {
        console.error('Error translating recipe list:', error);
        // Ensure we at least show the original content if translation fails
        renderRecipeList(recipes);
    }
}

// Load and display an image for a recipe card
async function loadRecipeCardImage(recipeCard, recipeId) {
    try {
        const response = await fetch(`/api/recipes/${recipeId}/image`);
        
        if (!response.ok) {
            return;
        }
        
        const data = await response.json();
        
        if (data.image_url) {
            // Find the image placeholder
            const imagePlaceholder = recipeCard.querySelector('.recipe-image div');
            
            // Replace placeholder with actual image
            if (imagePlaceholder) {
                imagePlaceholder.innerHTML = '';
                const img = document.createElement('img');
                img.src = data.image_url;
                img.alt = recipeCard.querySelector('h3').textContent;
                img.className = 'w-full h-full object-cover rounded-t-lg';
                imagePlaceholder.appendChild(img);
            }
        }
    } catch (error) {
        console.error('Error loading recipe card image:', error);
    }
}

// Start the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded');
    init();
});
