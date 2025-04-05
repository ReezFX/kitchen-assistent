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
    assistantResponse: document.getElementById('assistant-response')
};

// State management
const state = {
    recipes: [],
    selectedRecipeId: null,
    activeFilters: new Set(),
    speechRecognition: null,
    isVoiceSupported: false
};

// Check if speech recognition is supported
function initSpeechRecognition() {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        state.speechRecognition = new SpeechRecognition();
        state.speechRecognition.continuous = false;
        state.speechRecognition.interimResults = false;
        state.speechRecognition.lang = 'en-US'; // Set language
        state.isVoiceSupported = true;
        
        // Add visual indicator for voice buttons
        if (elements.voiceSearchBtn) elements.voiceSearchBtn.classList.add('active');
        if (elements.voiceAssistantBtn) elements.voiceAssistantBtn.classList.add('active');
    } else {
        console.log('Speech recognition not supported');
        // Hide voice buttons if not supported
        if (elements.voiceSearchBtn) elements.voiceSearchBtn.style.display = 'none';
        if (elements.voiceAssistantBtn) elements.voiceAssistantBtn.style.display = 'none';
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
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        state.recipes = data;
        
        renderRecipeList(data);
    } catch (error) {
        console.error('Error fetching recipes:', error);
        elements.recipesContent.innerHTML = `<p class="error">Error loading recipes. Please try again.</p>`;
    } finally {
        elements.recipesLoading.classList.add('hidden');
    }
}

// Render the list of recipes
function renderRecipeList(recipes) {
    if (recipes.length === 0) {
        elements.recipesContent.innerHTML = '<p>No recipes found. Try a different search.</p>';
        return;
    }
    
    const fragment = document.createDocumentFragment();
    
    recipes.forEach(recipe => {
        const recipeCard = document.createElement('div');
        recipeCard.className = 'recipe-card';
        recipeCard.dataset.id = recipe.id;
        
        const tagsHtml = recipe.tags.map(tag => 
            `<span class="recipe-tag">${tag}</span>`
        ).join('');
        
        recipeCard.innerHTML = `
            <h3>${recipe.name}</h3>
            <div class="recipe-tags">${tagsHtml}</div>
        `;
        
        recipeCard.addEventListener('click', () => {
            selectRecipe(recipe.id);
        });
        
        fragment.appendChild(recipeCard);
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
    
    // Hide placeholder and show content
    elements.recipePlaceholder.classList.add('hidden');
    elements.recipeContent.classList.remove('hidden');
    
    // Populate recipe details
    elements.detailTitle.textContent = recipe.name;
    elements.detailCookTime.textContent = recipe.cook_time;
    
    
    // Ingredients
    elements.detailIngredients.innerHTML = '';
    recipe.ingredients.forEach(ingredient => {
        const li = document.createElement('li');
        li.className = 'ingredient-item';
        li.textContent = ingredient;
        elements.detailIngredients.appendChild(li);
    });
    
    // Instructions
    elements.detailInstructions.innerHTML = '';
    recipe.instructions.forEach(instruction => {
        const li = document.createElement('li');
        li.className = 'instruction-item';
        li.textContent = instruction;
        elements.detailInstructions.appendChild(li);
    });
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
    if (!state.isVoiceSupported) return;
    
    // Show user feedback that we're listening
    targetInput.placeholder = "Listening...";
    
    state.speechRecognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        targetInput.value = transcript;
        targetInput.placeholder = targetInput === elements.searchInput ? 
            "Search recipes..." : 
            "Example: How can I make this recipe vegetarian?";
        
        // If this was for search, submit the form
        if (targetInput === elements.searchInput) {
            elements.searchForm.dispatchEvent(new Event('submit'));
        }
    };
    
    state.speechRecognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        targetInput.placeholder = targetInput === elements.searchInput ? 
            "Search recipes..." : 
            "Example: How can I make this recipe vegetarian?";
    };
    
    state.speechRecognition.start();
}

// Ask the AI assistant
async function askAssistant() {
    const query = elements.assistantPrompt.value.trim();
    
    if (!query) {
        alert('Please enter a question for the assistant');
        return;
    }
    
    try {
        elements.assistantResponse.classList.add('hidden');
        elements.assistantLoading.classList.remove('hidden');
        
        const response = await fetch('/api/assistant', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        elements.assistantResponse.textContent = data.response || "I'm not sure how to answer that. Please try a different question.";
        elements.assistantResponse.classList.remove('hidden');
    } catch (error) {
        console.error('Assistant error:', error);
        elements.assistantResponse.textContent = `Error: ${error.message || 'Could not get a response from the assistant'}`;
        elements.assistantResponse.classList.remove('hidden');
    } finally {
        elements.assistantLoading.classList.add('hidden');
    }
}

// Event listeners
function setupEventListeners() {
    // Search form
    elements.searchForm.addEventListener('submit', handleSearch);
    
    // Filter tags
    elements.filterTags.forEach(tag => {
        tag.addEventListener('click', () => {
            toggleFilter(tag.getAttribute('data-tag'));
        });
    });
    
    // Voice search
    if (elements.voiceSearchBtn) {
        elements.voiceSearchBtn.addEventListener('click', () => {
            startVoiceInput(elements.searchInput);
        });
    }
    
    // Assistant
    if (elements.assistantBtn) {
        elements.assistantBtn.addEventListener('click', askAssistant);
    }
    
    // Voice assistant
    if (elements.voiceAssistantBtn) {
        elements.voiceAssistantBtn.addEventListener('click', () => {
            startVoiceInput(elements.assistantPrompt);
        });
    }
    
    // Enter key in assistant prompt
    elements.assistantPrompt.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            askAssistant();
        }
    });
}

// Initialize the application
function init() {
    // Set up voice recognition if available
    initSpeechRecognition();
    
    // Set up event listeners
    setupEventListeners();
    
    // Initial data load
    fetchRecipes();
}

// Start the application when the DOM is fully loaded
init();

