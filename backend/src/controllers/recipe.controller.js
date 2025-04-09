const Recipe = require('../models/recipe.model');

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