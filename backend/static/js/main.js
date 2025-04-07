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
    translatedRecipes: {}, // Cache for translated recipes
    speechSynthesis: window.speechSynthesis,
    isSpeechSynthesisSupported: !!window.speechSynthesis,
    isSpeaking: false
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
        console.warn('Speech recognition not supported');
        // Hide voice buttons if not supported
        if (elements.voiceSearchBtn) elements.voiceSearchBtn.style.display = 'none';
        if (elements.voiceAssistantBtn) elements.voiceAssistantBtn.style.display = 'none';
    }
}

// Check if speech synthesis is supported
function initSpeechSynthesis() {
    console.log('Initializing speech synthesis...');
    if (state.isSpeechSynthesisSupported) {
        console.log('Speech synthesis supported');
        // Pre-load voices if necessary (optional, can improve performance on some browsers)
        state.speechSynthesis.getVoices(); 
    } else {
        console.warn('Speech synthesis not supported');
        // Optionally, provide feedback to the user that voice output won't work
        // Maybe disable a 'read aloud' button if one existed
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
    
    // Stop any ongoing speech synthesis on error
    if (state.isSpeechSynthesisSupported && state.speechSynthesis.speaking) {
        state.speechSynthesis.cancel();
        state.isSpeaking = false;
        // Reset any speaking indicators if used
    }
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
        elements.recipesContent.innerHTML = '<p class="text-center text-gray-500 my-4 text-sm" data-i18n="recipe_cards.no_recipes">No recipes found. Try a different search.</p>';
        return;
    }
    
    const fragment = document.createDocumentFragment();
    const cardsToLoadImagesFor = []; // Keep track of cards needing images
    
    recipes.forEach(recipe => {
        const cardWrapper = document.createElement('div');
        cardWrapper.className = 'recipe-card-wrapper';
        
        const recipeCard = document.createElement('div');
        recipeCard.className = 'recipe-card';
        recipeCard.dataset.id = recipe.id;
        
        // Create recipe card HTML with improved compact layout
        recipeCard.innerHTML = `
            <div class="recipe-image">
                <div class="w-full h-full flex items-center justify-center text-gray-400">
                    <i class="fas fa-utensils text-2xl"></i>
                </div>
            </div>
            <div class="recipe-content">
                <h3 class="recipe-title">${recipe.name}</h3>
                <div class="recipe-time">
                    <i class="fas fa-clock mr-1 text-xs"></i>
                    <span>${recipe.cook_time || '30'} min</span>
                </div>
                <div class="recipe-tags">
                    ${recipe.tags.slice(0, 2).map(tag => 
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
        
        // Add card and ID to the list for image loading later
        cardsToLoadImagesFor.push({ cardElement: recipeCard, recipeId: recipe.id });
    });
    
    elements.recipesContent.innerHTML = '';
    elements.recipesContent.appendChild(fragment);
    
    // Now that cards are in the DOM, load images
    cardsToLoadImagesFor.forEach(item => {
        loadRecipeCardImage(item.cardElement, item.recipeId);
    });
    
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
    
    // Disable assistant button while listening
    if (elements.voiceAssistantBtn) {
        elements.voiceAssistantBtn.disabled = true; 
        elements.voiceAssistantBtn.classList.add('opacity-50', 'cursor-not-allowed');
        // Remove focus style if present
        elements.voiceAssistantBtn.blur(); 
    }
    
    state.speechRecognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        targetInput.value = transcript;
        elements.voiceFeedback.textContent = 'Processing...';
        
        // Reset voice button state
        if (elements.voiceAssistantBtn) {
            elements.voiceAssistantBtn.disabled = false;
            elements.voiceAssistantBtn.classList.remove('opacity-50', 'cursor-not-allowed', 'bg-blue-500');
            elements.voiceAssistantBtn.classList.add('bg-gray-100');
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
        
        // Reset voice button state
        if (elements.voiceAssistantBtn) {
             elements.voiceAssistantBtn.disabled = false;
             elements.voiceAssistantBtn.classList.remove('opacity-50', 'cursor-not-allowed', 'bg-blue-500');
             elements.voiceAssistantBtn.classList.add('bg-gray-100');
        }
        
        // Reset listening state
        state.isListening = false;
        elements.voiceFeedback.classList.add('hidden');
    };
    
    state.speechRecognition.onend = () => {
        // Reset voice button state only if not currently processing a result
        if (!state.speechRecognition.result) { 
            if (elements.voiceAssistantBtn) {
                 elements.voiceAssistantBtn.disabled = false;
                 elements.voiceAssistantBtn.classList.remove('opacity-50', 'cursor-not-allowed', 'bg-blue-500');
                 elements.voiceAssistantBtn.classList.add('bg-gray-100');
            }
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
        // Ensure synthesis isn't running
        if (state.isSpeechSynthesisSupported && state.speechSynthesis.speaking) {
            state.speechSynthesis.cancel(); 
        }
        state.speechRecognition.start();
    } catch (error) {
        console.error('Error starting speech recognition:', error);
        showError('Error starting voice recognition. Please try again.');
        // Ensure button is re-enabled on error
        if (elements.voiceAssistantBtn) {
             elements.voiceAssistantBtn.disabled = false;
             elements.voiceAssistantBtn.classList.remove('opacity-50', 'cursor-not-allowed', 'bg-blue-500');
             elements.voiceAssistantBtn.classList.add('bg-gray-100');
        }
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
        
        // Speak the response if supported
        speakText(responseText); 
        
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
        elements.searchForm.addEventListener('submit', (e) => {
             handleSearch(e);
             // Stop any ongoing speech when submitting search
             stopSpeaking(); 
        });
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
            stopSpeaking(); // Stop speaking before starting new input
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
            stopSpeaking(); // Stop speaking before starting new input
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

/**
 * Initialize the application
 */
async function init() {
    console.log('Initializing application...');
    
    // Set up voice recognition if available
    initSpeechRecognition();
    
    // Set up speech synthesis if available
    initSpeechSynthesis(); 
    
    // Set up event listeners
    setupEventListeners();
    setupTranslationEventListeners();
    
    // Load recipes
    try {
        await loadInitialRecipes();
        
        // Check if we need to translate recipes based on the current language
        if (window.i18n && window.i18n.currentLanguage !== 'en') {
            console.log('Translating initial recipes to', window.i18n.currentLanguage);
            await translateRecipeList(state.recipes, window.i18n.currentLanguage);
        }
    } catch (error) {
        console.error('Error during initialization:', error);
    }
    
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
    const imagePlaceholder = recipeCard.querySelector('.recipe-image div');
    
    // Ensure placeholder exists
    if (!imagePlaceholder) {
        console.error('Could not find image placeholder for recipe card:', recipeId);
        return;
    }
    
    try {
        const response = await fetch(`/api/recipes/${recipeId}/image`);
        
        if (!response.ok) {
            console.warn(`Failed to fetch image info for recipe ${recipeId}: ${response.status}`);
            // Keep the default placeholder icon
            return;
        }
        
        const data = await response.json();
        
        if (data.image_url) {
            const img = document.createElement('img');
            img.src = data.image_url;
            img.alt = recipeCard.querySelector('h3')?.textContent || 'Recipe image'; // Add null check
            img.className = 'w-full h-full object-cover rounded-t-lg opacity-0 transition-opacity duration-500'; // Start hidden
            
            // Handle successful image loading
            img.onload = () => {
                // Clear placeholder and append image
                imagePlaceholder.innerHTML = ''; 
                imagePlaceholder.appendChild(img);
                // Fade in the image
                requestAnimationFrame(() => {
                    img.classList.remove('opacity-0');
                });
            };
            
            // Handle image loading errors
            img.onerror = () => {
                console.warn(`Failed to load image from URL: ${data.image_url} for recipe ${recipeId}`);
                // Ensure the placeholder icon remains or is restored
                if (!imagePlaceholder.querySelector('i.fas.fa-utensils')) {
                     imagePlaceholder.innerHTML = '<i class="fas fa-utensils text-2xl"></i>';
                }
            };
            
            // Setting the src triggers the loading attempt
            // No need to append immediately, handled by onload
        } else {
            // API returned ok, but no image_url. Keep placeholder.
             console.log(`No image URL provided for recipe ${recipeId}`);
        }
    } catch (error) {
        console.error(`Error in loadRecipeCardImage for recipe ${recipeId}:`, error);
        // Ensure placeholder icon remains in case of fetch error
        if (imagePlaceholder && !imagePlaceholder.querySelector('i.fas.fa-utensils')) {
             imagePlaceholder.innerHTML = '<i class="fas fa-utensils text-2xl"></i>';
        }
    }
}

/**
 * Load initial recipes when the application starts
 * @returns {Promise<Array>} - The loaded recipes
 */
async function loadInitialRecipes() {
    console.log('Loading initial recipes...');
    
    try {
        // Use the existing fetchRecipes function to load recipes
        // Ensure recipes are loaded before proceeding with translation checks
        await fetchRecipes(); 
        return state.recipes; // Return the loaded recipes from state
    } catch (error) {
        console.error('Error loading initial recipes:', error);
        throw error;
    }
}

// Start the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded');
    init();
});

// --- New Speech Synthesis Functions ---

// Function to speak text using SpeechSynthesis
function speakText(text) {
    if (!state.isSpeechSynthesisSupported) {
        console.warn("Speech synthesis not supported, cannot speak.");
        return;
    }
    
    // Clean up text for speech (remove markdown, etc.)
    // A simple approach: use the displayed text content, or strip basic markdown
    let textToSpeak = text.replace(/\*\*/g, ''); // Remove bold markers
    textToSpeak = textToSpeak.replace(/\n/g, ' '); // Replace newlines with spaces

    // Stop any currently playing speech
    stopSpeaking();

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    
    // Optionally set voice, rate, pitch etc.
    // utterance.voice = state.speechSynthesis.getVoices().find(voice => voice.lang === 'en-US');
    utterance.lang = 'en-US'; // Match the input language or make dynamic
    utterance.rate = 1; 
    utterance.pitch = 1; 

    utterance.onstart = () => {
        console.log("Speech synthesis started.");
        state.isSpeaking = true;
        // Add visual feedback if needed (e.g., change button style)
        if (elements.voiceAssistantBtn) {
            // Example: Indicate speaking state - choose a suitable style
            // elements.voiceAssistantBtn.classList.add('speaking-indicator'); 
        }
    };

    utterance.onend = () => {
        console.log("Speech synthesis finished.");
        state.isSpeaking = false;
        // Remove visual feedback
         if (elements.voiceAssistantBtn) {
            // elements.voiceAssistantBtn.classList.remove('speaking-indicator');
        }
    };

    utterance.onerror = (event) => {
        console.error("Speech synthesis error:", event.error);
        state.isSpeaking = false;
        showError(`Speech synthesis error: ${event.error}`);
        // Remove visual feedback
        if (elements.voiceAssistantBtn) {
            // elements.voiceAssistantBtn.classList.remove('speaking-indicator');
        }
    };

    state.speechSynthesis.speak(utterance);
}

// Function to stop ongoing speech
function stopSpeaking() {
    if (state.isSpeechSynthesisSupported && state.speechSynthesis.speaking) {
        console.log("Stopping speech synthesis.");
        state.speechSynthesis.cancel();
        state.isSpeaking = false;
         // Remove visual feedback if applied
         if (elements.voiceAssistantBtn) {
            // elements.voiceAssistantBtn.classList.remove('speaking-indicator');
        }
    }
}

// --- End of New Functions ---
