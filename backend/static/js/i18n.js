/**
 * i18n.js - Internationalization functionality for the Kitchen Assistant
 */

// Main i18n object that contains all internationalization functionality
const i18n = {
    // Properties
    supportedLanguages: ['en', 'de'],
    currentLanguage: 'en', // Default language
    translations: {}, // Will hold the loaded translations
    translatedRecipes: {}, // Will hold translated recipe content
    
    /**
     * Initialize the internationalization functionality
     */
    init: async function() {
        console.log('Initializing i18n system...');
        
        // Try to load saved language preference from localStorage
        const savedLanguage = localStorage.getItem('language');
        if (savedLanguage && this.supportedLanguages.includes(savedLanguage)) {
            this.currentLanguage = savedLanguage;
            console.log(`Using saved language preference: ${this.currentLanguage}`);
        }
        
        // Load cached translations if available
        this.loadCachedTranslations();
        
        // Load translations from server if needed
        if (Object.keys(this.translations).length === 0) {
            await this.loadTranslations(this.currentLanguage);
        }
        
        // Load cached recipe translations if available
        this.loadCachedRecipeTranslations();
        
        // Apply translations to the page
        this.applyTranslations();
        
        // Update UI to reflect current language
        this.updateLanguageToggle();
        
        // Set up event listeners for language toggle buttons
        this.setupEventListeners();
        
        console.log(`i18n system initialized with language: ${this.currentLanguage}`);
    },
    
    /**
     * Load cached translations from localStorage
     */
    loadCachedTranslations: function() {
        try {
            const cachedTranslations = localStorage.getItem(`translations-${this.currentLanguage}`);
            if (cachedTranslations) {
                this.translations = JSON.parse(cachedTranslations);
                console.log(`Loaded cached translations for ${this.currentLanguage} from localStorage`);
                return true;
            }
        } catch (error) {
            console.error('Error loading cached translations:', error);
        }
        return false;
    },
    
    /**
     * Load cached recipe translations from localStorage
     */
    loadCachedRecipeTranslations: function() {
        try {
            const cachedRecipeTranslations = localStorage.getItem(`recipe-translations-${this.currentLanguage}`);
            if (cachedRecipeTranslations) {
                this.translatedRecipes = JSON.parse(cachedRecipeTranslations);
                console.log(`Loaded ${Object.keys(this.translatedRecipes).length} cached recipe translations for ${this.currentLanguage}`);
                return true;
            }
        } catch (error) {
            console.error('Error loading cached recipe translations:', error);
        }
        return false;
    },
    
    /**
     * Save translations to localStorage
     */
    saveTranslationsToCache: function() {
        try {
            localStorage.setItem(`translations-${this.currentLanguage}`, JSON.stringify(this.translations));
            console.log(`Saved translations for ${this.currentLanguage} to localStorage`);
        } catch (error) {
            console.error('Error saving translations to cache:', error);
        }
    },
    
    /**
     * Save recipe translations to localStorage
     */
    saveRecipeTranslationsToCache: function() {
        try {
            localStorage.setItem(`recipe-translations-${this.currentLanguage}`, JSON.stringify(this.translatedRecipes));
            console.log(`Saved ${Object.keys(this.translatedRecipes).length} recipe translations to localStorage`);
        } catch (error) {
            console.error('Error saving recipe translations to cache:', error);
        }
    },
    
    /**
     * Load translations for the specified language
     * @param {string} language - The language code to load translations for
     */
    loadTranslations: async function(language) {
        try {
            console.log(`Loading translations for ${language}...`);
            const response = await fetch(`/static/js/translations/${language}.json`);
            
            if (!response.ok) {
                throw new Error(`Failed to load ${language} translations: ${response.status} ${response.statusText}`);
            }
            
            const translations = await response.json();
            this.translations = translations;
            
            // Cache the translations in localStorage
            this.saveTranslationsToCache();
            
            console.log(`Successfully loaded translations for ${language}`);
        } catch (error) {
            console.error('Error loading translations:', error);
            // Fallback to empty translations
            this.translations = {};
        }
    },
    
    /**
     * Get a nested translation value using dot notation
     * @param {object} obj - The translation object
     * @param {string} path - The dot-notation path to the translation
     * @returns {string|null} The translation or null if not found
     */
    getNestedTranslation: function(obj, path) {
        if (!path) return null;
        
        const keys = path.split('.');
        let current = obj;
        
        for (const key of keys) {
            if (current === undefined || current === null || !Object.prototype.hasOwnProperty.call(current, key)) {
                return null;
            }
            current = current[key];
        }
        
        return current;
    },
    
    /**
     * Get a translated string for a given key
     * @param {string} key - The translation key (can use dot notation for nested keys)
     * @param {object} replacements - Optional object with replacement values
     * @returns {string} The translated string or the key itself if no translation found
     */
    translate: function(key, replacements = {}) {
        // Get translation using nested key support
        let translation = this.getNestedTranslation(this.translations, key);
        
        // Fall back to the key itself if no translation found
        if (translation === null || translation === undefined) {
            console.warn(`Missing translation for key: ${key}`);
            translation = key;
        }
        
        // Apply any replacements ({placeholder} syntax)
        Object.keys(replacements).forEach(placeholder => {
            translation = translation.replace(new RegExp(`{${placeholder}}`, 'g'), replacements[placeholder]);
        });
        
        return translation;
    },
    
    /**
     * Get a translated version of a recipe using the Google AI API
     * @param {Object} recipe - The recipe object to translate
     * @param {string} language - The target language code (e.g., 'de')
     * @returns {Promise<Object>} - The translated recipe or null if translation failed
     */
    getTranslatedRecipe: async function(recipe, language) {
        if (!recipe || language === 'en') {
            return recipe; // Return original if no recipe or already in English
        }
        
        try {
            // Create a cache key for this recipe and language
            const cacheKey = `recipe-${recipe.id}-${language}`;
            
            // Check if we have a cached translation in memory
            if (this.translatedRecipes[cacheKey]) {
                console.log(`Using in-memory cached translation for recipe ${recipe.id}`);
                return this.translatedRecipes[cacheKey];
            }
            
            console.log(`Translating recipe ${recipe.id} to ${language} using API`);
            
            // Prepare the recipe data to translate (name, ingredients, instructions)
            const recipeData = {
                id: recipe.id,
                name: recipe.name,
                ingredients: recipe.ingredients,
                instructions: recipe.instructions
            };
            
            // Call the backend API to translate the recipe
            const response = await fetch('/api/translate-recipe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    recipe: recipeData,
                    target_language: language
                })
            });
            
            if (!response.ok) {
                throw new Error(`Translation API error: ${response.status} ${response.statusText}`);
            }
            
            const translatedRecipe = await response.json();
            
            // Cache the result in memory
            this.translatedRecipes[cacheKey] = translatedRecipe;
            
            // Save to localStorage
            this.saveRecipeTranslationsToCache();
            
            console.log(`Successfully translated recipe ${recipe.id} to ${language}`);
            return translatedRecipe;
            
        } catch (error) {
            console.error('Error translating recipe:', error);
            // In case of error, return the original recipe
            return recipe;
        }
    },
    
    /**
     * Apply translations to the page based on data-i18n attributes
     */
    applyTranslations: function() {
        console.log('Applying translations to DOM elements...');
        
        // Find all elements with data-i18n attribute
        const elements = document.querySelectorAll('[data-i18n]');
        
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.getNestedTranslation(this.translations, key);
            
            // Check if we have a translation for this key
            if (translation !== null && translation !== undefined) {
                // Handle element types differently
                if (element.tagName === 'INPUT' && element.type === 'text') {
                    element.placeholder = translation;
                } else {
                    element.textContent = translation;
                }
            } else {
                console.warn(`Missing translation for key: ${key}`);
            }
        });
        
        // Also translate all elements with placeholder translations
        const placeholders = document.querySelectorAll('[data-i18n-placeholder]');
        placeholders.forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            const translation = this.getNestedTranslation(this.translations, key);
            
            if (translation !== null && translation !== undefined) {
                element.placeholder = translation;
            } else {
                console.warn(`Missing placeholder translation for key: ${key}`);
            }
        });
        
        // Ensure the AI Assistant elements are translated
        this.translateAssistantElements();
        
        console.log('Applied translations to all DOM elements');
    },

    /**
     * Specifically translate AI Assistant elements that might be dynamically added
     */
    translateAssistantElements: function() {
        // Assistant title
        const assistantTitle = document.querySelector('[data-i18n="assistant.recipe_title"]');
        if (assistantTitle) {
            const translation = this.getNestedTranslation(this.translations, 'assistant.recipe_title');
            if (translation) {
                assistantTitle.textContent = translation;
            }
        }
        
        // Assistant description
        const assistantDesc = document.querySelector('[data-i18n="assistant.recipe_description"]');
        if (assistantDesc) {
            const translation = this.getNestedTranslation(this.translations, 'assistant.recipe_description');
            if (translation) {
                assistantDesc.textContent = translation;
            }
        }
        
        // Assistant placeholder
        const assistantInput = document.querySelector('[data-i18n-placeholder="assistant.recipe_placeholder"]');
        if (assistantInput) {
            const translation = this.getNestedTranslation(this.translations, 'assistant.recipe_placeholder');
            if (translation) {
                assistantInput.placeholder = translation;
            }
        }
        
        // Assistant button
        const assistantBtn = document.querySelector('[data-i18n="assistant.ask_button"]');
        if (assistantBtn) {
            const translation = this.getNestedTranslation(this.translations, 'assistant.ask_button');
            if (translation) {
                assistantBtn.textContent = translation;
            }
        }
        
        // Thinking text
        const thinkingText = document.querySelector('[data-i18n="assistant.thinking"]');
        if (thinkingText) {
            const translation = this.getNestedTranslation(this.translations, 'assistant.thinking');
            if (translation) {
                thinkingText.textContent = translation;
            }
        }
    },
    
    /**
     * Switch to a new language
     * @param {string} language - The language code to switch to
     */
    switchLanguage: async function(language) {
        console.log(`Switching language to: ${language}`);
        
        if (!this.supportedLanguages.includes(language)) {
            console.error(`Language "${language}" is not supported`);
            return;
        }
        
        // Save the new language preference
        this.currentLanguage = language;
        localStorage.setItem('language', language);
        
        // Try to load from cache first
        if (!this.loadCachedTranslations()) {
            // If not in cache, load from server
            await this.loadTranslations(language);
        }
        
        // Load cached recipe translations if available
        this.loadCachedRecipeTranslations();
        
        // Apply new translations
        this.applyTranslations();
        
        // Update UI to reflect language change
        this.updateLanguageToggle();

        // Translate dynamic content using the AI API
        await this.translatePageUI();
        
        console.log(`Successfully switched to language: ${language}`);
        
        // Dispatch a custom event that other scripts can listen for
        document.dispatchEvent(new CustomEvent('languageChanged', { 
            detail: { language: language } 
        }));
    },
    
    /**
     * Update the language toggle UI to reflect the current language
     */
    updateLanguageToggle: function() {
        console.log('Updating language toggle UI...');
        
        // Get all language toggle buttons
        const enButtons = document.querySelectorAll('[data-language="en"]');
        const deButtons = document.querySelectorAll('[data-language="de"]');
        
        // Highlight the current language button, unhighlight others
        if (this.currentLanguage === 'en') {
            enButtons.forEach(btn => {
                btn.classList.add('bg-blue-500', 'text-white');
                btn.classList.remove('bg-gray-100', 'text-gray-700');
            });
            
            deButtons.forEach(btn => {
                btn.classList.add('bg-gray-100', 'text-gray-700');
                btn.classList.remove('bg-blue-500', 'text-white');
            });
        } else if (this.currentLanguage === 'de') {
            deButtons.forEach(btn => {
                btn.classList.add('bg-blue-500', 'text-white');
                btn.classList.remove('bg-gray-100', 'text-gray-700');
            });
            
            enButtons.forEach(btn => {
                btn.classList.add('bg-gray-100', 'text-gray-700');
                btn.classList.remove('bg-blue-500', 'text-white');
            });
        }
        
        console.log('Updated language toggle UI');
    },
    
    /**
     * Set up event listeners for language toggle buttons
     */
    setupEventListeners: function() {
        console.log('Setting up language toggle event listeners...');
        
        // Get all language toggle buttons
        const languageButtons = document.querySelectorAll('[data-language]');
        
        // Add click event listener to each button
        languageButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                const language = event.currentTarget.getAttribute('data-language');
                if (language) {
                    this.switchLanguage(language);
                }
            });
        });
        
        console.log('Set up language toggle event listeners');
    },
    
    /**
     * Translate UI elements using the backend API
     * This is used when static translations are not available
     * @param {Object} elements - Key-value pairs of elements to translate
     * @param {string} language - Target language code
     * @returns {Promise<Object>} - Translated elements
     */
    translateUIElements: async function(elements, language) {
        if (!elements || Object.keys(elements).length === 0 || language === 'en') {
            return elements; // No need to translate
        }
        
        try {
            console.log(`Translating ${Object.keys(elements).length} UI elements to ${language}`);
            
            // Call the backend API
            const response = await fetch('/api/translate-ui', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    elements: elements,
                    target_language: language
                })
            });
            
            if (!response.ok) {
                throw new Error(`Translation API error: ${response.status} ${response.statusText}`);
            }
            
            const translatedElements = await response.json();
            console.log(`Successfully translated UI elements to ${language}`);
            return translatedElements;
            
        } catch (error) {
            console.error('Error translating UI elements:', error);
            return elements; // Return originals in case of error
        }
    },
    
    /**
     * Translate the current page UI using the Google AI API
     * This is used for dynamic content that isn't covered by standard translations
     */
    translatePageUI: async function() {
        if (this.currentLanguage === 'en') return; // Skip if English
        
        try {
            // Collect all translatable elements that don't have data-i18n attributes
            // These are typically dynamic elements that aren't covered by static translations
            const elementsToTranslate = {};
            
            // Look for headings without data-i18n
            document.querySelectorAll('h1:not([data-i18n]), h2:not([data-i18n]), h3:not([data-i18n])').forEach(el => {
                if (el.textContent.trim()) {
                    elementsToTranslate[`heading-${Math.random().toString(36).substr(2, 9)}`] = el.textContent.trim();
                }
            });
            
            // Look for paragraphs without data-i18n
            document.querySelectorAll('p:not([data-i18n])').forEach(el => {
                if (el.textContent.trim()) {
                    elementsToTranslate[`paragraph-${Math.random().toString(36).substr(2, 9)}`] = el.textContent.trim();
                }
            });
            
            // Look for buttons without data-i18n
            document.querySelectorAll('button:not([data-i18n])').forEach(el => {
                if (el.textContent.trim()) {
                    elementsToTranslate[`button-${Math.random().toString(36).substr(2, 9)}`] = el.textContent.trim();
                }
            });
            
            // If we found elements to translate
            if (Object.keys(elementsToTranslate).length > 0) {
                console.log(`Found ${Object.keys(elementsToTranslate).length} dynamic UI elements to translate`);
                
                // Get translations
                const translations = await this.translateUIElements(elementsToTranslate, this.currentLanguage);
                
                // Map of original text to translated text
                const translationMap = {};
                for (const key in elementsToTranslate) {
                    const originalText = elementsToTranslate[key];
                    const translatedText = translations[key];
                    if (translatedText && originalText !== translatedText) {
                        translationMap[originalText] = translatedText;
                    }
                }
                
                // Apply translations to all matching elements
                for (const originalText in translationMap) {
                    const translatedText = translationMap[originalText];
                    
                    document.querySelectorAll('h1, h2, h3, p, button, span, a, label').forEach(el => {
                        if (el.textContent.trim() === originalText) {
                            el.textContent = translatedText;
                        }
                    });
                }
                
                console.log(`Applied dynamic translations to UI elements`);
            }
        } catch (error) {
            console.error('Error translating page UI:', error);
        }
    }
};

// Make i18n available globally
window.i18n = i18n;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    i18n.init();
});

