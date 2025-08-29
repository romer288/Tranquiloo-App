
// Enhanced language detection with better accuracy and context awareness
const spanishKeywords = [
  'hola', 'como', 'estas', 'que', 'tal', 'bien', 'mal', 'gracias', 'por', 'favor',
  'si', 'no', 'yo', 'tu', 'el', 'ella', 'nosotros', 'ustedes', 'ellos', 'donde',
  'cuando', 'porque', 'quien', 'cual', 'muy', 'mas', 'menos', 'antes', 'despues',
  'ahora', 'aqui', 'alli', 'alla', 'este', 'esta', 'esto', 'ese', 'esa', 'eso',
  'aquel', 'aquella', 'aquello', 'mi', 'tu', 'su', 'nuestro', 'vuestro', 'suyo',
  'mio', 'tuyo', 'suya', 'nuestra', 'vuestra', 'suyas', 'ansiedad', 'miedo',
  'preocupacion', 'estres', 'nervioso', 'nerviosa', 'triste', 'feliz', 'enojado',
  'enojada', 'cansado', 'cansada', 'ayuda', 'necesito', 'quiero', 'puedo',
  'tengo', 'soy', 'estoy', 'siento', 'pienso', 'creo', 'trabajo', 'familia',
  'amigos', 'problemas', 'dificultades', 'solucion', 'mejor', 'peor', 'tambien',
  'pero', 'con', 'sin', 'para', 'desde', 'hasta', 'sobre', 'entre', 'durante',
  'mientras', 'aunque', 'siempre', 'nunca', 'todavia', 'ya', 'solo', 'tambien'
];

const englishKeywords = [
  'hello', 'how', 'are', 'you', 'what', 'good', 'bad', 'thanks', 'please',
  'yes', 'no', 'i', 'me', 'my', 'we', 'they', 'where', 'when', 'why', 'who',
  'which', 'very', 'more', 'less', 'before', 'after', 'now', 'here', 'there',
  'this', 'that', 'these', 'those', 'anxiety', 'fear', 'worry', 'stress',
  'nervous', 'sad', 'happy', 'angry', 'tired', 'help', 'need', 'want', 'can',
  'have', 'am', 'is', 'are', 'feel', 'think', 'work', 'family', 'friends',
  'problems', 'difficulties', 'solution', 'better', 'worse', 'also', 'but',
  'with', 'without', 'for', 'from', 'to', 'about', 'between', 'during',
  'while', 'although', 'always', 'never', 'still', 'already', 'only', 'too'
];

// Spanish-specific patterns and character combinations
const spanishPatterns = [
  /ñ/g, // Spanish ñ character
  /[áéíóúü]/g, // Spanish accented vowels
  /\b(el|la|los|las)\s+\w+/g, // Spanish articles
  /\b\w+ción\b/g, // Spanish -ción endings
  /\b\w+ado\b/g, // Spanish -ado endings
  /\b\w+iendo\b/g, // Spanish -iendo endings (gerund)
  /\bque\s+\w+/g, // "que" patterns
  /\bpor\s+\w+/g, // "por" patterns
  /\bestoy\s+\w+/g, // "estoy" patterns
  /\btengo\s+\w+/g // "tengo" patterns
];

// English-specific patterns
const englishPatterns = [
  /\b(the|a|an)\s+\w+/g, // English articles
  /\b\w+ing\b/g, // English -ing endings
  /\b\w+ed\b/g, // English -ed endings
  /\b(i|I)\s+(am|have|will|can|feel)/g, // "I" patterns
  /\b(you|You)\s+(are|have|will|can)/g, // "You" patterns
  /\bhow\s+are\s+you/gi, // Common English greeting
  /\bi\s+feel/gi // Common English expression
];

export const detectLanguage = (text: string): 'en' | 'es' => {
  console.log('Detecting language for text:', text.substring(0, 100) + '...');
  
  // Early return for very short text
  if (text.length < 3) {
    console.log('Text too short, defaulting to English');
    return 'en';
  }

  const normalizedText = text.toLowerCase()
    .replace(/[áàäâ]/g, 'a')
    .replace(/[éèëê]/g, 'e')
    .replace(/[íìïî]/g, 'i')
    .replace(/[óòöô]/g, 'o')
    .replace(/[úùüû]/g, 'u')
    .replace(/ñ/g, 'n');

  const words = normalizedText.split(/\s+/).filter(word => word.length > 1);
  
  let spanishScore = 0;
  let englishScore = 0;

  // Score based on keyword matches
  words.forEach(word => {
    if (spanishKeywords.includes(word)) {
      spanishScore += 2; // Higher weight for exact matches
    }
    if (englishKeywords.includes(word)) {
      englishScore += 2;
    }
  });

  // Score based on pattern matches
  spanishPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      spanishScore += matches.length * 3; // Higher weight for patterns
    }
  });

  englishPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      englishScore += matches.length * 3;
    }
  });

  // Check for definitive Spanish phrases (high confidence)
  const spanishDefinitivePatterns = [
    /\bcómo\s+estás?\b/gi,
    /\bcómo\s+está\b/gi,
    /\bme\s+siento\b/gi,
    /\btengo\s+miedo\b/gi,
    /\bestoy\s+(bien|mal|triste|feliz|nervioso|nerviosa)\b/gi,
    /\bnecesito\s+ayuda\b/gi,
    /\bqué\s+tal\b/gi,
    /\bmuy\s+bien\b/gi,
    /\bno\s+sé\b/gi,
    /\bpor\s+favor\b/gi
  ];

  spanishDefinitivePatterns.forEach(pattern => {
    if (pattern.test(text)) {
      spanishScore += 10; // Very high confidence
    }
  });

  // Check for definitive English phrases
  const englishDefinitivePatterns = [
    /\bhow\s+are\s+you\b/gi,
    /\bi\s+am\b/gi,
    /\bi\s+feel\b/gi,
    /\bi\s+need\s+help\b/gi,
    /\bi\s+have\b/gi,
    /\bi\s+want\b/gi,
    /\bthank\s+you\b/gi,
    /\bwhat's\s+up\b/gi,
    /\bhow's\s+it\s+going\b/gi
  ];

  englishDefinitivePatterns.forEach(pattern => {
    if (pattern.test(text)) {
      englishScore += 10; // Very high confidence
    }
  });

  // Character frequency analysis for additional confidence
  const spanishChars = (text.match(/[ñáéíóúü]/g) || []).length;
  const englishSpecificWords = words.filter(word => 
    ['through', 'though', 'thought', 'the', 'they', 'their', 'there'].includes(word)
  ).length;

  spanishScore += spanishChars * 5;
  englishScore += englishSpecificWords * 3;

  // Sentence structure analysis
  const hasSpanishStructure = /\b(el|la|los|las)\s+\w+\s+(es|son|está|están)\b/gi.test(text);
  const hasEnglishStructure = /\b(the|a|an)\s+\w+\s+(is|are|was|were)\b/gi.test(text);

  if (hasSpanishStructure) spanishScore += 8;
  if (hasEnglishStructure) englishScore += 8;

  console.log(`Language scores - Spanish: ${spanishScore}, English: ${englishScore}`);
  
  // Require a minimum confidence gap to avoid false positives
  const minConfidenceGap = 3;
  const result = spanishScore > englishScore + minConfidenceGap ? 'es' : 'en';
  
  console.log(`Detected language: ${result} (confidence gap: ${Math.abs(spanishScore - englishScore)})`);
  
  return result;
};

// Function to validate language consistency in a conversation
export const validateLanguageConsistency = (previousLanguage: 'en' | 'es', currentText: string): 'en' | 'es' => {
  const detectedLanguage = detectLanguage(currentText);
  
  // If the detected language is different, require higher confidence
  if (detectedLanguage !== previousLanguage) {
    console.log(`Language switch detected: ${previousLanguage} -> ${detectedLanguage}`);
    
    // Re-analyze with stricter criteria
    const words = currentText.toLowerCase().split(/\s+/).filter(word => word.length > 2);
    const targetKeywords = detectedLanguage === 'es' ? spanishKeywords : englishKeywords;
    const strongMatches = words.filter(word => targetKeywords.includes(word)).length;
    
    // Require at least 30% of words to be strong language indicators for a switch
    const confidence = strongMatches / words.length;
    
    if (confidence < 0.3) {
      console.log(`Insufficient confidence (${confidence}) for language switch, keeping ${previousLanguage}`);
      return previousLanguage;
    }
  }
  
  return detectedLanguage;
};
