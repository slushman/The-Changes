/**
 * Nashville Number System utilities
 * Converts chord names to numbers based on key position
 */

// Circle of fifths for key relationships (currently unused but kept for future features)
// const CIRCLE_OF_FIFTHS = [
//   'C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'F', 'Bb', 'Eb', 'Ab'
// ];

// Major scale intervals
const MAJOR_SCALE_INTERVALS = [0, 2, 4, 5, 7, 9, 11];

// Nashville number system mapping
const NASHVILLE_NUMBERS = ['1', '2', '3', '4', '5', '6', '7'];

// Chord quality symbols for Nashville system
const CHORD_QUALITIES = {
  'major': '',
  'minor': 'm',
  'diminished': '°',
  'augmented': '+',
  'dominant7': '7',
  'major7': 'maj7',
  'minor7': 'm7',
  'diminished7': '°7',
  'half-diminished7': 'ø7',
  'suspended2': 'sus2',
  'suspended4': 'sus4',
  'add9': 'add9',
  'major9': 'maj9',
  'minor9': 'm9',
  'dominant9': '9'
};

/**
 * Get the chromatic note number (0-11) for a note
 * @param {string} note - Note name (C, C#, Db, etc.)
 * @returns {number} - Chromatic position (0-11)
 */
function getNoteNumber(note) {
  const noteMap = {
    'C': 0, 'C#': 1, 'Db': 1,
    'D': 2, 'D#': 3, 'Eb': 3,
    'E': 4, 'F': 5,
    'F#': 6, 'Gb': 6, 'G': 7,
    'G#': 8, 'Ab': 8, 'A': 9,
    'A#': 10, 'Bb': 10, 'B': 11
  };
  
  return noteMap[note] !== undefined ? noteMap[note] : 0;
}

/**
 * Parse a chord symbol into root note and quality
 * @param {string} chord - Chord symbol (Am7, F#maj7, etc.)
 * @returns {Object} - {root: string, quality: string}
 */
function parseChordSymbol(chord) {
  if (!chord || typeof chord !== 'string') {
    return { root: 'C', quality: 'major' };
  }
  
  const chordStr = chord.trim();
  let root, quality;
  
  // Extract root note (handle sharps and flats)
  if (chordStr.length >= 2 && (chordStr[1] === '#' || chordStr[1] === 'b')) {
    root = chordStr.substring(0, 2);
    quality = chordStr.substring(2);
  } else {
    root = chordStr[0];
    quality = chordStr.substring(1);
  }
  
  // Normalize quality - preserve the original quality string for extended chords
  if (!quality) {
    quality = 'major';
  } else if (quality === 'm') {
    quality = 'minor';
  } else if (quality === 'maj7' || quality === 'M7') {
    quality = 'major7';
  } else if (quality === 'maj9' || quality === 'M9') {
    quality = 'major9';
  } else if (quality === 'm7') {
    quality = 'minor7';
  } else if (quality === 'm9') {
    quality = 'minor9';
  } else if (quality === '7') {
    quality = 'dominant7';
  } else if (quality === '9') {
    quality = 'dominant9';
  } else if (quality === 'dim' || quality === '°') {
    quality = 'diminished';
  } else if (quality === 'aug' || quality === '+') {
    quality = 'augmented';
  } else if (quality === 'sus2') {
    quality = 'suspended2';
  } else if (quality === 'sus4') {
    quality = 'suspended4';
  } else if (quality === 'add9') {
    quality = 'add9';
  }
  
  return { root, quality };
}

/**
 * Convert a chord to Nashville number based on key
 * @param {string} chord - Chord symbol (Am7, F#maj7, etc.)
 * @param {string} key - Key signature (C, G, F#, etc.)
 * @returns {string} - Nashville number (1, 2m, 3, 4, 5, 6m, 7°, etc.)
 */
export function chordToNashville(chord, key = 'C') {
  const { root, quality } = parseChordSymbol(chord);
  const keyRoot = parseChordSymbol(key).root;
  
  const rootNumber = getNoteNumber(root);
  const keyNumber = getNoteNumber(keyRoot);
  
  // Calculate the interval from the key
  let interval = (rootNumber - keyNumber + 12) % 12;
  
  // Find the scale degree (1-7)
  const scalePosition = MAJOR_SCALE_INTERVALS.indexOf(interval);
  
  if (scalePosition !== -1) {
    // It's a diatonic chord
    const number = NASHVILLE_NUMBERS[scalePosition];
    const qualitySymbol = CHORD_QUALITIES[quality] || '';
    
    // Determine if the chord fits the natural major scale harmony
    const expectedQuality = getExpectedQuality(scalePosition + 1);
    
    if (quality === expectedQuality) {
      // Natural diatonic chord
      return number + (quality === 'minor' || quality === 'diminished' ? CHORD_QUALITIES[quality] : '');
    } else {
      // Modified chord (e.g., major 3 instead of minor 3)
      return number + qualitySymbol;
    }
  } else {
    // Chromatic chord - determine best flat/sharp representation
    const qualitySymbol = CHORD_QUALITIES[quality] || '';
    
    // For chromatic notes, check which scale degree gives the most natural representation
    const possibilities = [];
    
    for (let i = 0; i < MAJOR_SCALE_INTERVALS.length; i++) {
      const scaleNote = (keyNumber + MAJOR_SCALE_INTERVALS[i]) % 12;
      const flatNote = (scaleNote - 1 + 12) % 12;
      const sharpNote = (scaleNote + 1) % 12;
      
      if (rootNumber === flatNote) {
        possibilities.push({ symbol: 'b' + NASHVILLE_NUMBERS[i], degree: i + 1, type: 'flat' });
      } else if (rootNumber === sharpNote) {
        possibilities.push({ symbol: '#' + NASHVILLE_NUMBERS[i], degree: i + 1, type: 'sharp' });
      }
    }
    
    if (possibilities.length > 0) {
      // Prefer flat notation for notes that are naturally flat in common usage
      // (e.g., Bb as b7 rather than #6)
      const flatOption = possibilities.find(p => p.type === 'flat');
      const sharpOption = possibilities.find(p => p.type === 'sharp');
      
      // Prefer b7 over #6, b3 over #2, etc.
      if (flatOption && (flatOption.degree === 7 || flatOption.degree === 3 || flatOption.degree === 6)) {
        return flatOption.symbol + qualitySymbol;
      } else if (sharpOption && (sharpOption.degree === 4 || sharpOption.degree === 1 || sharpOption.degree === 5)) {
        return sharpOption.symbol + qualitySymbol;
      } else if (flatOption) {
        return flatOption.symbol + qualitySymbol;
      } else {
        return sharpOption.symbol + qualitySymbol;
      }
    }
    
    // Fallback: find closest scale degree
    let closestInterval = 0;
    let minDistance = 12;
    
    for (let i = 0; i < MAJOR_SCALE_INTERVALS.length; i++) {
      const distance = Math.abs(interval - MAJOR_SCALE_INTERVALS[i]);
      if (distance < minDistance) {
        minDistance = distance;
        closestInterval = i;
      }
    }
    
    return NASHVILLE_NUMBERS[closestInterval] + qualitySymbol;
  }
}

/**
 * Get the expected chord quality for a scale degree in major key
 * @param {number} degree - Scale degree (1-7)
 * @returns {string} - Expected quality
 */
function getExpectedQuality(degree) {
  const majorKeyQualities = {
    1: 'major',     // I
    2: 'minor',     // ii
    3: 'minor',     // iii
    4: 'major',     // IV
    5: 'major',     // V
    6: 'minor',     // vi
    7: 'diminished' // vii°
  };
  
  return majorKeyQualities[degree] || 'major';
}

/**
 * Convert a chord progression to Nashville numbers
 * @param {Array<string>} chords - Array of chord symbols
 * @param {string} key - Key signature
 * @returns {Array<string>} - Array of Nashville numbers
 */
export function progressionToNashville(chords, key = 'C') {
  if (!Array.isArray(chords)) {
    return [];
  }
  
  return chords.map(chord => chordToNashville(chord, key));
}

/**
 * Convert Nashville number back to chord symbol
 * @param {string} nashvilleNumber - Nashville number (1, 2m, #4°, etc.)
 * @param {string} key - Key signature
 * @returns {string} - Chord symbol
 */
export function nashvilleToChord(nashvilleNumber, key = 'C') {
  if (!nashvilleNumber || typeof nashvilleNumber !== 'string') {
    return 'C';
  }
  
  const keyRoot = parseChordSymbol(key).root;
  const keyNumber = getNoteNumber(keyRoot);
  
  let number = nashvilleNumber;
  let isSharp = false;
  let isFlat = false;
  
  // Handle sharps and flats
  if (number.startsWith('#')) {
    isSharp = true;
    number = number.substring(1);
  } else if (number.startsWith('b')) {
    isFlat = true;
    number = number.substring(1);
  }
  
  // Extract the degree and quality - handle patterns like '57' properly
  let degree, qualitySymbol;
  
  // Handle single digit degree with quality (e.g., '57' = degree 5, quality 7)
  if (number.length >= 2 && /^\d\d/.test(number)) {
    degree = parseInt(number[0]);
    qualitySymbol = number.substring(1);
  } else {
    const degreeMatch = number.match(/^(\d+)(.*)/);
    if (!degreeMatch) {
      return keyRoot;
    }
    degree = parseInt(degreeMatch[1]);
    qualitySymbol = degreeMatch[2];
  }
  
  if (degree < 1 || degree > 7) {
    return keyRoot; // Return the key root instead of 'C'
  }
  
  // Get the base interval
  let interval = MAJOR_SCALE_INTERVALS[degree - 1];
  
  // Apply sharps and flats
  if (isSharp) {
    interval = (interval + 1) % 12;
  } else if (isFlat) {
    interval = (interval - 1 + 12) % 12;
  }
  
  // Calculate the root note
  const rootNumber = (keyNumber + interval) % 12;
  const rootNote = getNoteFromNumber(rootNumber);
  
  // Convert quality symbol back to chord quality
  const quality = getQualityFromSymbol(qualitySymbol);
  
  // Only append qualitySymbol for non-major chords, but preserve seventh extensions
  if (quality === 'major' && !qualitySymbol.includes('7') && !qualitySymbol.includes('9')) {
    return rootNote;
  }
  return rootNote + qualitySymbol;
}

/**
 * Get note name from chromatic number
 * @param {number} number - Chromatic position (0-11)
 * @returns {string} - Note name
 */
function getNoteFromNumber(number) {
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  return notes[number] || 'C';
}

/**
 * Get quality from Nashville symbol
 * @param {string} symbol - Quality symbol (m, °, 7, etc.)
 * @returns {string} - Quality name
 */
function getQualityFromSymbol(symbol) {
  const symbolMap = {
    '': 'major',
    'm': 'minor',
    '°': 'diminished',
    '+': 'augmented',
    '7': 'dominant7',
    'maj7': 'major7',
    'm7': 'minor7',
    '°7': 'diminished7',
    'ø7': 'half-diminished7',
    'sus2': 'suspended2',
    'sus4': 'suspended4',
    'add9': 'add9',
    'maj9': 'major9',
    'm9': 'minor9',
    '9': 'dominant9'
  };
  
  return symbolMap[symbol] || 'major';
}

/**
 * Detect the key of a chord progression
 * @param {Array<string>} chords - Array of chord symbols
 * @returns {string} - Most likely key
 */
export function detectKey(chords) {
  if (!Array.isArray(chords) || chords.length === 0) {
    return 'C';
  }
  
  // Enhanced key detection based on chord frequency and harmonic weights
  const chordCounts = {};
  const roots = chords.map(chord => {
    const parsed = parseChordSymbol(chord);
    return parsed.root || 'C'; // Fallback to C for invalid chords
  }).filter(root => root.match(/^[A-G][#b]?$/)); // Only valid note names
  
  if (roots.length === 0) {
    return 'C';
  }
  
  roots.forEach(root => {
    chordCounts[root] = (chordCounts[root] || 0) + 1;
  });
  
  // Weight commonly used chord progressions
  // In major keys, look for I-IV-V relationships
  const possibleKeys = Object.keys(chordCounts);
  let bestKey = 'C';
  let bestScore = 0;
  
  possibleKeys.forEach(key => {
    let score = chordCounts[key] * 2; // Base score from frequency
    
    // Check for common chord relationships in this key
    const keyNum = getNoteNumber(key);
    const fourth = getNoteFromNumber((keyNum + 5) % 12); // IV chord
    const fifth = getNoteFromNumber((keyNum + 7) % 12); // V chord
    
    if (chordCounts[fourth]) score += chordCounts[fourth];
    if (chordCounts[fifth]) score += chordCounts[fifth];
    
    if (score > bestScore) {
      bestScore = score;
      bestKey = key;
    }
  });
  
  return bestKey;
}

/**
 * Get common Nashville number progressions
 * @returns {Object} - Common progressions with their names
 */
export function getCommonProgressions() {
  return {
    'I-V-vi-IV': ['1', '5', '6m', '4'],
    'vi-IV-I-V': ['6m', '4', '1', '5'],
    'I-vi-IV-V': ['1', '6m', '4', '5'],
    'ii-V-I': ['2m', '5', '1'],
    'I-IV-V': ['1', '4', '5'],
    'vi-V-IV-V': ['6m', '5', '4', '5'],
    'I-V-vi-iii-IV-I-IV-V': ['1', '5', '6m', '3m', '4', '1', '4', '5'],
    'I-bVII-IV': ['1', 'b7', '4'],
    'i-bVII-bVI-bVII': ['1m', 'b7', 'b6', 'b7']
  };
}