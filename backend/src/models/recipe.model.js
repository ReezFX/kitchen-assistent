const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  ingredients: [{ 
    name: String, 
    amount: String, 
    unit: String 
  }],
  steps: [{ type: String }],
  cuisine: String,
  dietaryRestrictions: [String],
  difficulty: String,
  prepTime: Number,
  cookTime: Number,
  nutrition: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isAIGenerated: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Index für schnelle Suche
recipeSchema.index({ title: 'text', 'ingredients.name': 'text' });

module.exports = mongoose.model('Recipe', recipeSchema); 