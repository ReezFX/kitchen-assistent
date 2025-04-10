const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load env variables
dotenv.config();

// Connect to database
connectDB();

// Import routes
const aiRoutes = require('./routes/ai.routes');
const authRoutes = require('./routes/auth.routes');
const recipeRoutes = require('./routes/recipe.routes');

// Initialize app
const app = express();

// Tell Express to trust the X-Forwarded-* headers set by the reverse proxy
// Adjust the number '1' based on how many proxies are in front of your app
app.set('trust proxy', 1);

// Middleware

// Verbesserte CORS-Konfiguration für Entwicklungsumgebungen
app.use(cors({
  origin: function(origin, callback) {
    // In development, allow all origins
    if (process.env.NODE_ENV === 'development') {
      // Log die Anfragen für Debugging-Zwecke
      if (origin) {
        console.log(`CORS-Anfrage von Origin: ${origin}`);
      } else {
        console.log('CORS-Anfrage ohne Origin-Header');
      }
      return callback(null, true);
    }
    
    // Für Produktionsumgebungen hier strengere Regeln implementieren
    // z.B. eine Allowlist von Domains
    const allowedOrigins = [
      'http://localhost:3000', 
      // Weitere Produktion-Domains hier hinzufügen
    ];
    
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      console.log(`CORS blockiert für Origin: ${origin}`);
      callback(new Error('CORS nicht erlaubt für diese Origin'), false);
    }
  },
  credentials: true // Allow cookies/authorization headers
}));

// Erhöhen der Limits für JSON und URL-encodierte Daten
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Define routes
app.use('/api/ai', aiRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);

// Health check route
app.get('/', (req, res) => {
  res.json({ message: 'API is running' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  process.exit(1);
});
