const Recipe = require('../models/recipe.model');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Setup multer for memory storage with increased size limit
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit (erhöht von 2MB)
}).single('image');

// @desc    Create a new recipe
// @route   POST /api/recipes
// @access  Private
exports.createRecipe = async (req, res) => {
  try {
    const { 
      title, 
      ingredients, 
      steps, 
      cuisine, 
      dietaryRestrictions, 
      difficulty,
      prepTime,
      cookTime,
      nutrition,
      isAIGenerated
    } = req.body;

    const recipe = await Recipe.create({
      title,
      ingredients,
      steps,
      cuisine,
      dietaryRestrictions,
      difficulty,
      prepTime,
      cookTime,
      nutrition,
      creator: req.user._id,
      isAIGenerated: isAIGenerated || false
    });

    res.status(201).json(recipe);
  } catch (error) {
    console.error('Fehler beim Erstellen des Rezepts:', error);
    res.status(500).json({ message: 'Serverfehler beim Erstellen des Rezepts' });
  }
};

// @desc    Get all recipes by user
// @route   GET /api/recipes
// @access  Private
exports.getRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.find({ creator: req.user._id }).sort({ createdAt: -1 });
    res.json(recipes);
  } catch (error) {
    console.error('Fehler beim Abrufen der Rezepte:', error);
    res.status(500).json({ message: 'Serverfehler beim Abrufen der Rezepte' });
  }
};

// @desc    Get recipe by ID
// @route   GET /api/recipes/:id
// @access  Private
exports.getRecipeById = async (req, res) => {
  try {
    // Verwende lean() für bessere Performance bei read-only Operationen
    const recipe = await Recipe.findById(req.params.id).lean();
    
    if (!recipe) {
      return res.status(404).json({ message: 'Rezept nicht gefunden' });
    }

    // Check if recipe belongs to user
    if (recipe.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Nicht autorisiert' });
    }

    res.json(recipe);
  } catch (error) {
    console.error('Fehler beim Abrufen des Rezepts:', error);
    
    // Besseres Fehlerhandling mit spezifischen Fehlermeldungen
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Ungültige Rezept-ID' });
    }
    
    res.status(500).json({ message: 'Serverfehler beim Abrufen des Rezepts' });
  }
};

// @desc    Update recipe
// @route   PUT /api/recipes/:id
// @access  Private
exports.updateRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    
    if (!recipe) {
      return res.status(404).json({ message: 'Rezept nicht gefunden' });
    }

    // Check if recipe belongs to user
    if (recipe.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Nicht autorisiert' });
    }

    const updatedRecipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedRecipe);
  } catch (error) {
    console.error('Fehler beim Aktualisieren des Rezepts:', error);
    res.status(500).json({ message: 'Serverfehler beim Aktualisieren des Rezepts' });
  }
};

// @desc    Delete recipe
// @route   DELETE /api/recipes/:id
// @access  Private
exports.deleteRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    
    if (!recipe) {
      return res.status(404).json({ message: 'Rezept nicht gefunden' });
    }

    // Check if recipe belongs to user
    if (recipe.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Nicht autorisiert' });
    }

    await Recipe.deleteOne({ _id: req.params.id });
    res.json({ message: 'Rezept entfernt' });
  } catch (error) {
    console.error('Fehler beim Löschen des Rezepts:', error);
    res.status(500).json({ message: 'Serverfehler beim Löschen des Rezepts' });
  }
};

// @desc    Upload recipe image via FormData
// @route   POST /api/recipes/:id/image
// @access  Private
exports.uploadImage = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    
    if (!recipe) {
      return res.status(404).json({ message: 'Rezept nicht gefunden' });
    }

    // Check if recipe belongs to user
    if (recipe.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Nicht autorisiert' });
    }

    // Use multer to handle the multipart form data
    upload(req, res, async function(err) {
      if (err) {
        console.error('Fehler beim Hochladen des Bildes:', err);
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({ 
              message: 'Die Bilddatei ist zu groß (max. 10MB erlaubt)' 
            });
          }
          return res.status(400).json({ message: `Fehler beim Upload: ${err.message}` });
        }
        return res.status(500).json({ message: 'Serverfehler beim Hochladen des Bildes' });
      }
      
      // If no file was uploaded
      if (!req.file) {
        return res.status(400).json({ message: 'Keine Datei hochgeladen' });
      }
      
      const fileSize = req.file.size / 1024 / 1024; // Größe in MB
      console.log(`Bild empfangen: ${req.file.originalname}, Größe: ${fileSize.toFixed(2)}MB`);
      
      try {
        // Convert buffer to base64
        const imageBuffer = req.file.buffer;
        const base64Image = imageBuffer.toString('base64');
        
        // Update recipe with the image
        recipe.image = {
          data: base64Image,
          contentType: req.file.mimetype
        };
        
        await recipe.save();
        res.json(recipe);
      } catch (saveErr) {
        console.error('Fehler beim Speichern des Bildes:', saveErr);
        res.status(500).json({ message: 'Fehler beim Speichern des Bildes in der Datenbank' });
      }
    });
  } catch (error) {
    console.error('Fehler beim Hochladen des Bildes:', error);
    res.status(500).json({ message: 'Serverfehler beim Hochladen des Bildes' });
  }
}; 