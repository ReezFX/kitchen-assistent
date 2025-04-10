const { GoogleGenerativeAI } = require("@google/generative-ai");

class AIService {
  constructor() {
    this.ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.ai.getGenerativeModel({ model: "gemini-2.0-flash" });
  }

  async generateRecipe(ingredients, preferences, systemPrompt) {
    const prompt = systemPrompt || `Du bist ein professioneller Koch-Assistent. Erstelle ein detailliertes Rezept basierend auf den bereitgestellten Zutaten: ${ingredients.join(', ')}. Berücksichtige folgende Präferenzen: ${JSON.stringify(preferences)}.
Gib die Antwort NUR im folgenden Markdown-Format aus:

# Titel: [Rezeptname]

**Emoji:** [Passendes Emoji für das Rezept]

**Tags:** [Tag1], [Tag2], [Tag3 (inkl. Ernährungsform und Küchenstil falls relevant)]

**Schwierigkeit:** [easy|medium|hard]
**Zubereitungszeit:** [Zahl] Minuten
**Kochzeit:** [Zahl] Minuten

## Beschreibung
[2-3 Sätze, die das Gericht beschreiben]

## Zutaten
- [Menge] [Einheit] [Zutat 1]
- [Menge] [Einheit] [Zutat 2]
...

## Zubereitung
1. **[Optionaler Titel für Schritt 1]:** [Anleitung Schritt 1]
2. **[Optionaler Titel für Schritt 2]:** [Anleitung Schritt 2]
...

## Nährwerte (ca. pro Portion)
- Kalorien: [Wert] kcal
- Protein: [Wert] g
- Kohlenhydrate: [Wert] g
- Fett: [Wert] g

## Tipps
- [Tipp 1]
- [Tipp 2]

Stelle sicher, dass ALLE angegebenen Zutaten im Rezept verwendet werden. Jeder Schritt der Zubereitung sollte detailliert sein. Verwende die Schwierigkeitsgrade 'easy', 'medium' oder 'hard'. Gib die Zeiten als reine Zahl an.
**WICHTIG: Alle Sektionen (insbesondere Zutaten und Nährwerte) müssen IMMER vollständig ausgegeben werden, unabhängig vom gewählten Schwierigkeitsgrad.**`;
    
    try {
      // Combine system instructions and user-specific details into a single user prompt
      const fullUserPrompt = `${prompt}

---

Zutaten: ${ingredients.join(', ')}
Präferenzen: ${JSON.stringify(preferences)}`;

      const result = await this.model.generateContent({
        contents: [
          { role: "user", parts: [{ text: fullUserPrompt }] }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2500
        }
      });
      
      // Log the raw response text before returning
      console.log("Raw AI Response Text:", result.response.text());
      
      return result.response.text();
    } catch (error) {
      console.error('Error generating recipe:', error);
      // Log the full error object for more details, especially API-specific errors
      console.error('Full Gemini API Error:', JSON.stringify(error, null, 2)); 
      throw error;
    }
  }

  async provideCookingAssistance(question, recipeContext) {
    const prompt = `Im Kontext dieses Rezepts: ${recipeContext}\nMeine Frage: ${question}`;
    
    try {
      const result = await this.model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 500
        }
      });
      
      return result.response.text();
    } catch (error) {
      console.error('Error providing cooking assistance:', error);
      throw error;
    }
  }

  async translateContent(content, targetLanguage) {
    const prompt = `Übersetze den folgenden Text ins ${targetLanguage}: ${content}`;
    
    try {
      const result = await this.model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 1000
        }
      });
      
      return result.response.text();
    } catch (error) {
      console.error('Error translating content:', error);
      throw error;
    }
  }
}

module.exports = AIService; 