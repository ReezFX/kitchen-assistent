const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ $or: [{ email }, { username }] });

    if (userExists) {
      return res.status(400).json({ 
        message: userExists.email === email 
          ? 'Benutzer mit dieser E-Mail existiert bereits' 
          : 'Benutzername bereits vergeben' 
      });
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password,
      preferences: {
        dietaryRestrictions: [],
        favoriteCuisines: [],
        ingredients: {
          favorites: [],
          allergies: []
        },
        cookingSkillLevel: 'intermediate'
      }
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        preferences: user.preferences,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Ungültige Benutzerdaten' });
    }
  } catch (error) {
    console.error('Fehler bei der Registrierung:', error);
    res.status(500).json({ message: 'Serverfehler bei der Registrierung' });
  }
};

// @desc    Login user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        preferences: user.preferences,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Ungültige E-Mail oder Passwort' });
    }
  } catch (error) {
    console.error('Fehler beim Login:', error);
    res.status(500).json({ message: 'Serverfehler beim Login' });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'Benutzer nicht gefunden' });
    }
  } catch (error) {
    console.error('Fehler beim Abrufen des Profils:', error);
    res.status(500).json({ message: 'Serverfehler beim Abrufen des Profils' });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.username = req.body.username || user.username;
      user.email = req.body.email || user.email;
      
      if (req.body.preferences) {
        // Konvertiere vorhandene Präferenzen in ein einfaches Objekt
        const currentPreferences = user.preferences.toObject();
        
        // Stelle sicher, dass die ingredients-Struktur korrekt ist
        let updatedIngredients = currentPreferences.ingredients;
        
        // Übernimm neue ingredients nur, wenn sie in den neuen Präferenzen enthalten sind
        if (req.body.preferences.ingredients) {
          updatedIngredients = {
            ...currentPreferences.ingredients,
            ...req.body.preferences.ingredients
          };
        }
        
        // Erstelle die aktualisierten Präferenzen
        const updatedPreferences = {
          ...currentPreferences,
          ...req.body.preferences,
          ingredients: updatedIngredients
        };
        
        // Aktualisiere das User-Objekt
        user.preferences = updatedPreferences;
      }
      
      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        preferences: updatedUser.preferences,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: 'Benutzer nicht gefunden' });
    }
  } catch (error) {
    console.error('Fehler beim Aktualisieren des Profils:', error);
    res.status(500).json({ message: 'Serverfehler beim Aktualisieren des Profils' });
  }
}; 