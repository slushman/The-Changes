/**
 * Chord parsing, normalization, and music theory utilities
 * Provides consistent chord handling for search and analysis
 */

// Mapping of note names to semitone values (C = 0)
const NOTE_TO_SEMITONE = {
  'c': 0, 'c#': 1, 'db': 1, 'd': 2, 'd#': 3, 'eb': 3, 'e': 4, 'f': 5,
  'f#': 6, 'gb': 6, 'g': 7, 'g#': 8, 'ab': 8, 'a': 9, 'a#': 10, 'bb': 10, 'b': 11
};

// Reverse mapping for semitone to note names (prefer sharps by default)
const SEMITONE_TO_NOTE = [
  'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'
];

// Alternative note names mapping (currently unused but kept for future features)
// const NOTE_ALIASES = {
//   'db': 'c#', 'eb': 'd#', 'gb': 'f#', 'ab': 'g#', 'bb': 'a#'
// };

// Chord quality patterns and their standardized forms
const CHORD_QUALITIES = {
  // Major chords
  '': 'maj',
  'maj': 'maj',
  'major': 'maj',
  'M': 'maj',
  
  // Minor chords
  'm': 'm',
  'min': 'm',
  'minor': 'm',
  '-': 'm',
  
  // Diminished
  'dim': 'dim',
  'diminished': 'dim',
  '°': 'dim',
  'o': 'dim',
  
  // Augmented
  'aug': 'aug',
  'augmented': 'aug',
  '+': 'aug',
  
  // Seventh chords
  '7': '7',
  'dom7': '7',
  'dominant7': '7',
  'maj7': 'maj7',
  'major7': 'maj7',
  'M7': 'maj7',
  'm7': 'm7',
  'minor7': 'm7',
  '-7': 'm7',
  'mMaj7': 'minMaj7',
  'mM7': 'minMaj7',
  'dim7': 'dim7',
  'm7b5': 'm7b5',
  'ø7': 'm7b5',
  
  // Extended chords
  '9': '9',
  'maj9': 'maj9',
  'm9': 'm9',
  '11': '11',
  'maj11': 'maj11',
  'm11': 'm11',
  '13': '13',
  'maj13': 'maj13',
  'm13': 'm13',
  
  // Sus chords
  'sus2': 'sus2',
  'sus4': 'sus4',
  'sus': 'sus4', // Default sus to sus4
  
  // Add chords
  'add9': 'add9',
  'add2': 'add9', // add2 is same as add9
  'add11': 'add11',
  'add4': 'add11', // add4 is same as add11
  
  // Power chords
  '5': '5',
  'power': '5'
};

/**
 * Parses a chord string into its components
 * @param {string} chordString - The chord to parse (e.g., "Am7", "F#maj7", "C/E")
 * @returns {Object} - Parsed chord object or null if invalid
 */
export const parseChord = (chordString) => {
  if (!chordString || typeof chordString !== 'string') {
    return null;
  }

  const chord = chordString.trim();
  if (chord.length === 0) {
    return null;
  }

  // Handle slash chords (e.g., "C/E", "Am/C")
  const slashIndex = chord.lastIndexOf('/');
  let bassNote = null;
  let mainChord = chord;

  if (slashIndex > 0 && slashIndex < chord.length - 1) {
    bassNote = chord.substring(slashIndex + 1);
    mainChord = chord.substring(0, slashIndex);
  }

  // Parse the main chord
  const chordMatch = mainChord.match(/^([A-G][b#]?)(.*)$/i);
  if (!chordMatch) {
    return null;
  }

  const [, root, qualityString] = chordMatch;
  const normalizedRoot = normalizeNote(root);
  const quality = normalizeChordQuality(qualityString);

  if (!normalizedRoot) {
    return null;
  }

  const result = {
    original: chordString,
    root: normalizedRoot,
    quality: quality || 'maj',
    bass: bassNote ? normalizeNote(bassNote) : null,
    isSlashChord: bassNote !== null
  };

  return result;
};

/**
 * Normalizes a note name to a standard format
 * @param {string} note - Note name (e.g., "C#", "Db", "F#")
 * @returns {string} - Normalized note name or null if invalid
 */
export const normalizeNote = (note) => {
  if (!note || typeof note !== 'string') {
    return null;
  }

  const normalized = note.toLowerCase().trim();
  
  // Check if it's a valid note
  if (NOTE_TO_SEMITONE.hasOwnProperty(normalized)) {
    // Convert to preferred sharp notation
    const semitone = NOTE_TO_SEMITONE[normalized];
    return SEMITONE_TO_NOTE[semitone];
  }

  return null;
};

/**
 * Normalizes chord quality to standard format
 * @param {string} quality - Chord quality string
 * @returns {string} - Normalized quality
 */
export const normalizeChordQuality = (quality) => {
  if (!quality) return 'maj';
  
  const trimmed = quality.trim();
  // Try exact match first (preserves case)
  if (CHORD_QUALITIES[trimmed]) {
    return CHORD_QUALITIES[trimmed];
  }
  
  // Then try lowercase
  const normalized = trimmed.toLowerCase();
  return CHORD_QUALITIES[normalized] || quality;
};

/**
 * Normalizes a chord to a standard format
 * @param {string} chordString - Chord to normalize
 * @returns {string} - Normalized chord string or null if invalid
 */
export const normalizeChord = (chordString) => {
  const parsed = parseChord(chordString);
  if (!parsed) return null;

  let normalized = parsed.root;
  
  // Add quality (except for major chords where we omit 'maj')
  if (parsed.quality && parsed.quality !== 'maj') {
    normalized += parsed.quality;
  }

  // Add bass note for slash chords
  if (parsed.isSlashChord && parsed.bass) {
    normalized += '/' + parsed.bass;
  }

  return normalized;
};

/**
 * Normalizes an array of chords
 * @param {Array} chords - Array of chord strings
 * @returns {Array} - Array of normalized chord strings
 */
export const normalizeChordProgression = (chords) => {
  if (!Array.isArray(chords)) return [];
  
  return chords
    .map(chord => normalizeChord(chord))
    .filter(chord => chord !== null);
};

/**
 * Transposes a chord to a different key
 * @param {string} chordString - Chord to transpose
 * @param {number} semitones - Number of semitones to transpose (positive = up, negative = down)
 * @returns {string} - Transposed chord or null if invalid
 */
export const transposeChord = (chordString, semitones) => {
  const parsed = parseChord(chordString);
  if (!parsed) return null;

  const transposeNote = (note) => {
    const originalSemitone = NOTE_TO_SEMITONE[note.toLowerCase()];
    const newSemitone = (originalSemitone + semitones + 12) % 12;
    return SEMITONE_TO_NOTE[newSemitone];
  };

  const newRoot = transposeNote(parsed.root);
  const newBass = parsed.bass ? transposeNote(parsed.bass) : null;

  let result = newRoot;
  if (parsed.quality !== 'maj') {
    result += parsed.quality;
  }
  if (newBass) {
    result += '/' + newBass;
  }

  return result;
};

/**
 * Transposes an entire chord progression
 * @param {Array} chords - Array of chord strings
 * @param {number} semitones - Number of semitones to transpose
 * @returns {Array} - Transposed chord progression
 */
export const transposeProgression = (chords, semitones) => {
  if (!Array.isArray(chords)) return [];
  
  return chords
    .map(chord => transposeChord(chord, semitones))
    .filter(chord => chord !== null);
};

/**
 * Calculates the interval between two notes in semitones
 * @param {string} note1 - First note
 * @param {string} note2 - Second note
 * @returns {number} - Interval in semitones (0-11)
 */
export const getInterval = (note1, note2) => {
  const norm1 = normalizeNote(note1);
  const norm2 = normalizeNote(note2);
  
  if (!norm1 || !norm2) return null;
  
  const semitone1 = NOTE_TO_SEMITONE[norm1.toLowerCase()];
  const semitone2 = NOTE_TO_SEMITONE[norm2.toLowerCase()];
  
  return (semitone2 - semitone1 + 12) % 12;
};

/**
 * Gets all possible enharmonic equivalents of a chord
 * @param {string} chordString - Chord to get equivalents for
 * @returns {Array} - Array of enharmonically equivalent chords
 */
export const getEnharmonicEquivalents = (chordString) => {
  const parsed = parseChord(chordString);
  if (!parsed) return [];

  const equivalents = [];
  const rootSemitone = NOTE_TO_SEMITONE[parsed.root.toLowerCase()];
  
  // Find all note names for this semitone
  const alternativeRoots = Object.keys(NOTE_TO_SEMITONE)
    .filter(note => NOTE_TO_SEMITONE[note] === rootSemitone)
    .map(note => note.charAt(0).toUpperCase() + note.slice(1));

  alternativeRoots.forEach(root => {
    let equivalent = root;
    if (parsed.quality !== 'maj') {
      equivalent += parsed.quality;
    }
    if (parsed.bass) {
      equivalent += '/' + parsed.bass;
    }
    
    if (equivalent !== chordString) {
      equivalents.push(equivalent);
    }
  });

  return equivalents;
};

/**
 * Analyzes the key signature of a chord progression
 * @param {Array} chords - Array of chord strings
 * @returns {Object} - Key analysis with likely keys and confidence scores
 */
export const analyzeKey = (chords) => {
  if (!Array.isArray(chords) || chords.length === 0) {
    return { likelyKeys: [], confidence: 0 };
  }

  const normalizedChords = normalizeChordProgression(chords);
  const keyScores = {};

  // For each possible key, calculate how well the chords fit
  for (let i = 0; i < 12; i++) {
    const keyNote = SEMITONE_TO_NOTE[i];
    const majorScore = calculateKeyFit(normalizedChords, keyNote, 'major');
    const minorScore = calculateKeyFit(normalizedChords, keyNote, 'minor');
    
    keyScores[keyNote] = majorScore;
    keyScores[keyNote + 'm'] = minorScore;
  }

  // Sort by score and return top candidates
  const sortedKeys = Object.entries(keyScores)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([key, score]) => ({ key, confidence: score }));

  return {
    likelyKeys: sortedKeys,
    confidence: sortedKeys.length > 0 ? sortedKeys[0].confidence : 0
  };
};

/**
 * Calculates how well a chord progression fits a given key
 * @param {Array} chords - Normalized chord progression
 * @param {string} keyNote - Root note of the key
 * @param {string} mode - 'major' or 'minor'
 * @returns {number} - Fit score (0-1)
 */
const calculateKeyFit = (chords, keyNote, mode) => {
  const keyRoot = NOTE_TO_SEMITONE[keyNote.toLowerCase()];
  let score = 0;
  let totalWeight = 0;

  // Define scale degrees and their weights for scoring
  const majorScaleDegrees = [0, 2, 4, 5, 7, 9, 11]; // Major scale intervals
  const minorScaleDegrees = [0, 2, 3, 5, 7, 8, 10]; // Natural minor scale intervals
  const scaleDegrees = mode === 'major' ? majorScaleDegrees : minorScaleDegrees;

  chords.forEach((chord, index) => {
    const parsed = parseChord(chord);
    if (!parsed) return;

    const chordRoot = NOTE_TO_SEMITONE[parsed.root.toLowerCase()];
    const interval = (chordRoot - keyRoot + 12) % 12;
    
    // Weight: first and last chords are more important
    const weight = (index === 0 || index === chords.length - 1) ? 2 : 1;
    totalWeight += weight;

    // Check if chord root is in the key
    if (scaleDegrees.includes(interval)) {
      score += weight;
      
      // Bonus for tonic chords
      if (interval === 0) {
        score += weight * 0.5;
      }
    }
  });

  return totalWeight > 0 ? Math.min(1, score / totalWeight) : 0;
};

/**
 * Parses user input for chord progressions with flexible formatting
 * @param {string} input - User input string
 * @returns {Array} - Array of parsed chord names
 */
export const parseProgressionInput = (input) => {
  if (!input || typeof input !== 'string') {
    return [];
  }

  // Split by common separators and clean up
  const chords = input
    .split(/[\s,|-]+/)
    .map(chord => chord.trim())
    .filter(chord => chord.length > 0)
    .map(chord => normalizeChord(chord))
    .filter(chord => chord !== null);

  return chords;
};

/**
 * Suggests chord completions based on partial input
 * @param {string} partialChord - Partial chord input
 * @param {number} maxSuggestions - Maximum suggestions to return
 * @returns {Array} - Array of chord suggestions
 */
export const getChordSuggestions = (partialChord, maxSuggestions = 10) => {
  if (!partialChord || typeof partialChord !== 'string') {
    return [];
  }

  const partial = partialChord.toLowerCase().trim();
  const suggestions = [];

  // Get all possible chord types for the root note
  if (partial.length >= 1) {
    // Find matching root notes
    const possibleRoots = Object.keys(NOTE_TO_SEMITONE)
      .filter(note => note.toLowerCase().startsWith(partial.charAt(0).toLowerCase()))
      .map(note => note.charAt(0).toUpperCase() + note.slice(1));

    possibleRoots.forEach(root => {
      // Check if the partial starts with this root or root + accidental
      const rootMatches = partial.toLowerCase().startsWith(root.toLowerCase()) || 
                         partial.toLowerCase().startsWith((root + '#').toLowerCase()) ||
                         partial.toLowerCase().startsWith((root + 'b').toLowerCase());
      
      if (rootMatches || partial.length === 1) {
        // Add common chord types
        const commonQualities = ['', 'm', '7', 'maj7', 'm7', 'sus4', 'sus2', 'dim', 'aug'];
        commonQualities.forEach(quality => {
          const chord = root + quality;
          if (chord.toLowerCase().startsWith(partial.toLowerCase())) {
            suggestions.push(chord);
          }
        });
      }
    });

    // Also check for chord roots with accidentals
    ['#', 'b'].forEach(accidental => {
      possibleRoots.forEach(root => {
        const accidentalRoot = root + accidental;
        if (partial.toLowerCase().startsWith(accidentalRoot.toLowerCase())) {
          const commonQualities = ['', 'm', '7', 'maj7', 'm7', 'sus4', 'sus2', 'dim', 'aug'];
          commonQualities.forEach(quality => {
            const chord = accidentalRoot + quality;
            if (chord.toLowerCase().startsWith(partial.toLowerCase())) {
              suggestions.push(chord);
            }
          });
        }
      });
    });
  }

  return suggestions.slice(0, maxSuggestions);
};

const chordUtils = {
  parseChord,
  normalizeNote,
  normalizeChord,
  normalizeChordProgression,
  transposeChord,
  transposeProgression,
  getInterval,
  getEnharmonicEquivalents,
  analyzeKey,
  parseProgressionInput,
  getChordSuggestions
};

export default chordUtils;