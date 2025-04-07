/**
 * i18n.js - Internationalization functionality for the Kitchen Assistant
 */

// Main i18n object that contains all internationalization functionality
const i18n = {
    // Properties
    supportedLanguages: ['en', 'de'],
    currentLanguage: 'en', // Default language
    translations: {}, // Holds static UI translations from JSON
    translatedRecipes: {}, // Holds translated recipe content (ingredients/instructions)
    uiTranslationsCache: {}, // Holds dynamically translated UI elements (headings, buttons etc.)
    
    /**
     * Initialize the internationalization functionality
     */
    init: async function() {
        console.log('Initializing i18n system...');
        
        // Load language preference
        const savedLanguage = localStorage.getItem('language');
        if (savedLanguage && this.supportedLanguages.includes(savedLanguage)) {
            this.currentLanguage = savedLanguage;
        }
        
        // Load all caches first
        this.loadCachedTranslations(); // Static
        this.loadCachedRecipeTranslations(); // Recipes
        this.loadCachedUiTranslations(); // Dynamic UI
        
        // Load static translations from server if cache was empty/failed
        if (Object.keys(this.translations).length === 0) {
            await this.loadTranslations(this.currentLanguage);
        }
        
        // Apply all available translations (static + cached dynamic UI) synchronously
        const appliedDynamicTexts = this.applyAllAvailableTranslations();
        
        // Update UI toggle early
        this.updateLanguageToggle();
        
        // Asynchronously fetch any dynamic translations *not* found in cache
        // Pass the set of already applied texts to avoid re-translating/re-applying
        await this.fetchAndApplyMissingUiTranslations(appliedDynamicTexts);
        
        // Set up event listeners last
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
     * Load cached dynamic UI translations from localStorage
     */
    loadCachedUiTranslations: function() {
        try {
            const cachedUiTranslations = localStorage.getItem(`ui-translations-${this.currentLanguage}`);
            if (cachedUiTranslations) {
                this.uiTranslationsCache = JSON.parse(cachedUiTranslations);
                console.log(`Loaded ${Object.keys(this.uiTranslationsCache).length} cached UI translations for ${this.currentLanguage}`);
                return true;
            }
        } catch (error) {
            console.error('Error loading cached UI translations:', error);
            this.uiTranslationsCache = {}; // Reset cache on error
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
     * Save dynamic UI translations to localStorage
     */
    saveUiTranslationsToCache: function() {
        try {
            localStorage.setItem(`ui-translations-${this.currentLanguage}`, JSON.stringify(this.uiTranslationsCache));
            console.log(`Saved ${Object.keys(this.uiTranslationsCache).length} UI translations to localStorage for ${this.currentLanguage}`);
        } catch (error) {
            console.error('Error saving UI translations to cache:', error);
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
     * Apply static translations from the main translations object.
     * Separated for clarity, called by applyAllAvailableTranslations.
     */
    applyStaticTranslations: function() {
        console.log('Applying static translations...');
        // Apply translations based on data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.getNestedTranslation(this.translations, key);
            if (translation !== null && translation !== undefined) {
                if (element.tagName === 'INPUT' && element.type === 'text' || element.tagName === 'TEXTAREA') {
                    element.placeholder = translation;
                } else {
                    element.textContent = translation;
                }
            } else {
                console.warn(`Missing static translation for key: ${key}`);
            }
        });

        // Apply translations based on data-i18n-placeholder attribute
        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            const translation = this.getNestedTranslation(this.translations, key);
            if (translation !== null && translation !== undefined) {
                element.placeholder = translation;
            } else {
                console.warn(`Missing static placeholder translation for key: ${key}`);
            }
        });
         // Also translate assistant elements which use static keys
         this.translateAssistantElements();
         console.log('Finished applying static translations.');
    },

    /**
     * Applies ALL available translations (static + cached dynamic UI) synchronously.
     * @returns {Set<string>} A set of original text strings for dynamic elements that were translated from the cache.
     */
    applyAllAvailableTranslations: function() {
        console.log('Applying all available translations (static + cached dynamic)...');
        // Apply static translations first
        this.applyStaticTranslations();

        // Now apply cached dynamic UI translations
        const appliedDynamicTexts = new Set();
        const cachedUi = this.uiTranslationsCache[this.currentLanguage] || {};
        
        if (Object.keys(cachedUi).length > 0) {
             console.log(`Applying ${Object.keys(cachedUi).length} cached dynamic UI translations...`);
             // Find elements potentially needing dynamic translation
             const potentialElements = document.querySelectorAll('h1:not([data-i18n]), h2:not([data-i18n]), h3:not([data-i18n]), p:not([data-i18n]), button:not([data-i18n]), span:not([data-i18n]), a:not([data-i18n]), label:not([data-i18n])');

             potentialElements.forEach(el => {
                 const originalText = el.textContent?.trim();
                 if (originalText && cachedUi[originalText]) {
                     const translatedText = cachedUi[originalText];
                     if (translatedText !== originalText) {
                         el.textContent = translatedText;
                         appliedDynamicTexts.add(originalText);
                     }
                 }
             });
             console.log(`Applied cached translations for ${appliedDynamicTexts.size} dynamic text strings.`);
        } else {
            console.log('No cached dynamic UI translations to apply.');
        }

        return appliedDynamicTexts;
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
        
        if (!this.supportedLanguages.includes(language) || language === this.currentLanguage) {
             if (language === this.currentLanguage) console.log(`Already in language: ${language}`);
             else console.error(`Language "${language}" is not supported`);
            return;
        }
        
        this.currentLanguage = language;
        localStorage.setItem('language', language);
        
        // Load caches for new language
        this.loadCachedTranslations();
        this.loadCachedRecipeTranslations();
        this.loadCachedUiTranslations();

        // Load static from server if needed
        if (Object.keys(this.translations).length === 0) {
            await this.loadTranslations(language);
        }
        
        // Apply all available (static + cached dynamic)
        const appliedDynamicTexts = this.applyAllAvailableTranslations();
        
        // Update toggle
        this.updateLanguageToggle();

        // Fetch and apply missing dynamic translations
        await this.fetchAndApplyMissingUiTranslations(appliedDynamicTexts);
        
        console.log(`Successfully switched to language: ${language}`);
        
        // Dispatch event
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
     * Fetches translations via API for dynamic UI elements NOT found in cache and applies them.
     * @param {Set<string>} alreadyAppliedTexts - A set of original texts already translated from cache.
     */
    fetchAndApplyMissingUiTranslations: async function(alreadyAppliedTexts = new Set()) {
        if (this.currentLanguage === 'en') return; // Skip if English
        
        console.log('Checking for missing dynamic UI translations...');
        
        try {
            // Collect potentially dynamic elements and their texts
            const textsNeedingApiTranslation = {};
            const elementMap = new Map(); // Map original text -> [elements]
            
             document.querySelectorAll('h1:not([data-i18n]), h2:not([data-i18n]), h3:not([data-i18n]), p:not([data-i18n]), button:not([data-i18n]), span:not([data-i18n]), a:not([data-i18n]), label:not([data-i18n])').forEach(el => {
                const text = el.textContent?.trim();
                // Only consider if text exists AND wasn't already applied from cache
                if (text && !alreadyAppliedTexts.has(text)) {
                    // Prepare for API call
                    if (!textsNeedingApiTranslation[text]) {
                        textsNeedingApiTranslation[text] = text; 
                    }
                    // Map elements for applying results later
                    if (!elementMap.has(text)) {
                        elementMap.set(text, []);
                    }
                    elementMap.get(text).push(el);
                }
            });

            // If no texts need API translation, we're done
            if (Object.keys(textsNeedingApiTranslation).length === 0) {
                console.log('No missing dynamic UI translations require API call.');
                return;
            }
            
            console.log(`Calling API to translate ${Object.keys(textsNeedingApiTranslation).length} missing UI text strings.`);
            const apiResults = await this.translateUIElements(textsNeedingApiTranslation, this.currentLanguage);
            
            // Process API results: apply translations and update cache
            let newCacheEntries = false;
            console.log('Applying newly fetched dynamic UI translations...');
            for (const originalText in apiResults) {
                const translatedText = apiResults[originalText];
                
                // Apply if translation is valid and different
                if (translatedText && translatedText !== originalText && elementMap.has(originalText)) {
                    elementMap.get(originalText).forEach(el => {
                        el.textContent = translatedText;
                    });

                    // Update cache
                    if (!this.uiTranslationsCache[this.currentLanguage]) {
                        this.uiTranslationsCache[this.currentLanguage] = {};
                    }
                    if (this.uiTranslationsCache[this.currentLanguage][originalText] !== translatedText) {
                        this.uiTranslationsCache[this.currentLanguage][originalText] = translatedText;
                        newCacheEntries = true;
                    }
                } 
            }
            
            // Save updated cache if necessary
            if (newCacheEntries) {
                this.saveUiTranslationsToCache();
            }
             console.log('Finished applying newly fetched dynamic UI translations.');

        } catch (error) {
            console.error('Error fetching/applying missing page UI translations:', error);
        }
    }
};

// Make i18n available globally
window.i18n = i18n;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    i18n.init();
});


