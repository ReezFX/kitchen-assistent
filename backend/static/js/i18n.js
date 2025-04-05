/**
 * i18n.js - Internationalization functionality for the Kitchen Assistant
 */

// Main i18n object that contains all internationalization functionality
const i18n = {
    // Properties
    supportedLanguages: ['en', 'de'],
    currentLanguage: 'en', // Default language
    translations: {}, // Will hold the loaded translations
    
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
        
        // Load translations for the current language
        await this.loadTranslations(this.currentLanguage);
        
        // Apply translations to the page
        this.applyTranslations();
        
        // Update UI to reflect current language
        this.updateLanguageToggle();
        
        // Set up event listeners for language toggle buttons
        this.setupEventListeners();
        
        console.log(`i18n system initialized with language: ${this.currentLanguage}`);
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
        
        console.log('Applied translations to all DOM elements');
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
        
        // Load new translations
        await this.loadTranslations(language);
        
        // Apply new translations
        this.applyTranslations();
        
        // Update UI to reflect language change
        this.updateLanguageToggle();
        
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
    }
};

// Make i18n available globally
window.i18n = i18n;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    i18n.init();
});

