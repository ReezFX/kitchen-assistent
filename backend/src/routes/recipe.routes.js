const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipe.controller');
const protect = require('../middleware/auth');

// All recipe routes require authentication
router.use(protect);

// Routes for recipe management
router.route('/')
  .post(recipeController.createRecipe)
  .get(recipeController.getRecipes);

// Route for image upload
router.route('/:id/image')
  .post(recipeController.uploadImage);

router.route('/:id')
  .get(recipeController.getRecipeById)
  .put(recipeController.updateRecipe)
  .delete(recipeController.deleteRecipe);

module.exports = router; 