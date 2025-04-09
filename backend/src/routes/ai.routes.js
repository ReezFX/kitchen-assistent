const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');
const authMiddleware = require('../middleware/auth');

// Routes that require authentication
router.use(authMiddleware);

// Recipe generation
router.post('/generate-recipe', aiController.generateRecipe);

// Cooking assistant
router.post('/cooking-assistant', aiController.getAssistance);

// Translation
router.post('/translate', aiController.translateContent);

module.exports = router; 