/**
 * Chord Substitution and Progression Variation Utility
 * Provides music theory-based chord substitutions and progression variations
 */

import { chordToNashville, nashvilleToChord } from './nashvilleNumbers';

/**
 * Common chord substitution patterns based on music theory
 */
const SUBSTITUTION_RULES = {
  // Major chord substitutions
  '1': ['vi', '3', 'vi/3'], // I can go to vi, iii
  '2': ['4', '7dim'], // ii can go to IV, vii°
  '2m': ['4', '7dim'], // ii can go to IV, vii°
  '3': ['1', 'vi'], // iii can go to I, vi
  '3m': ['1', 'vi'], // iii can go to I, vi
  '4': ['2m', '6', '1'], // IV can go to ii, vi, I
  '5': ['7dim', '3', '2m/5'], // V can go to vii°, iii, ii/V
  '6': ['4', '1'], // vi can go to IV, I
  '6m': ['4', '1'], // vi can go to IV, I
  '7dim': ['5', '3'], // vii° can go to V, iii

  // Extended chord substitutions
  '17': ['1'], // I7 can resolve to I
  '27': ['5'], // ii7 can resolve to V
  '2m7': ['5'], // iim7 can resolve to V
  '57': ['1'], // V7 can resolve to I
  '6m7': ['2m7', '57'], // vim7 can go to iim7, V7

  // Tritone substitutions (jazz)
  'V7': ['bII7'], // Tritone sub
  '57': ['b27'], // Tritone sub

  // Modal substitutions
  'bVII': ['4', '1'], // bVII (modal) can go to IV, I
  'bIII': ['6m', '4'], // bIII (modal) can go to vim, IV
};

/**
 * Common progression variation patterns
 */
const PROGRESSION_VARIATIONS = {
  // Circle of fifths progressions
  'fifths': {
    pattern: ['6m', '2m', '5', '1'],
    description: 'Circle of fifths progression',
    variations: [
      ['6m', '2m7', '5', '1'],
      ['6m7', '2m7', '57', '1'],
      ['6m', '4', '5', '1'], // Modified with IV
    ]
  },

  // Jazz turnarounds
  'turnaround': {
    pattern: ['1', '6m', '2m', '5'],
    description: 'Jazz turnaround',
    variations: [
      ['1', '6m7', '2m7', '57'],
      ['1maj7', '6m7', '2m7', '57'],
      ['1', '3', '6m', '5'], // Chromatic approach
    ]
  },

  // Pop progressions
  'pop': {
    pattern: ['1', '5', '6m', '4'],
    description: 'Pop progression (I-V-vi-IV)',
    variations: [
      ['1', '5', '6m', '4'],
      ['6m', '4', '1', '5'], // vi-IV-I-V
      ['4', '1', '5', '6m'], // IV-I-V-vi
      ['6m', '1', '4', '5'], // vi-I-IV-V
    ]
  },

  // Blues progressions
  'blues': {
    pattern: ['1', '1', '1', '1', '4', '4', '1', '1', '5', '4', '1', '5'],
    description: '12-bar blues',
    variations: [
      ['17', '17', '17', '17', '47', '47', '17', '17', '57', '47', '17', '57'], // All dominant 7ths
      ['1', '4', '1', '1', '4', '4', '1', '1', '5', '4', '1', '5'], // Quick IV
    ]
  },

  // Modal progressions
  'modal': {
    pattern: ['1', 'bVII', '4', '1'],
    description: 'Modal progression (mixolydian)',
    variations: [
      ['1', 'bVII', 'bIII', '4'],
      ['6m', 'bVII', '1', '4'],
      ['4', 'bVII', '1', '1'],
    ]
  }
};

/**
 * Get chord substitution suggestions for a specific chord
 * @param {string} chord - Chord name or Nashville number
 * @param {string} key - Key signature
 * @param {Object} context - Surrounding context (previous/next chords)
 * @returns {Array} Array of substitution suggestions
 */
export const getChordSubstitutions = (chord, key, context = {}) => {
  const { previousChord, nextChord, position } = context;
  
  // Convert chord to Nashville number for analysis
  const nashvilleNumber = chordToNashville(chord, key);
  
  if (!nashvilleNumber) return [];

  // Get basic substitutions from rules
  const basicSubs = SUBSTITUTION_RULES[nashvilleNumber] || [];
  
  // Generate contextual substitutions
  const contextualSubs = [];
  
  // Add chromatic approach chords
  if (nextChord) {
    const nextNashville = chordToNashville(nextChord, key);
    if (nextNashville) {
      const chromaticApproach = getChromaticApproach(nashvilleNumber, nextNashville);
      if (chromaticApproach) {
        contextualSubs.push(chromaticApproach);
      }
    }
  }

  // Add secondary dominants
  const secondaryDominant = getSecondaryDominant(nashvilleNumber);
  if (secondaryDominant) {
    contextualSubs.push(secondaryDominant);
  }

  // Convert Nashville numbers back to chord names
  const allSubs = [...new Set([...basicSubs, ...contextualSubs])];
  
  return allSubs.map(nashvilleSub => {
    const chordName = nashvilleToChord(nashvilleSub, key);
    return {
      chord: chordName,
      nashville: nashvilleSub,
      type: getSubstitutionType(nashvilleNumber, nashvilleSub),
      description: getSubstitutionDescription(nashvilleNumber, nashvilleSub)
    };
  }).filter(sub => sub.chord && sub.chord !== chord);
};

/**
 * Get chromatic approach chord suggestions
 */
const getChromaticApproach = (currentNashville, targetNashville) => {
  // Add logic for chromatic approaches
  const chromaticMap = {
    '1': ['#1dim', 'b1'],
    '2m': ['#2dim', 'b2'],
    '5': ['#5dim', 'b5'],
  };
  
  return chromaticMap[targetNashville]?.[0];
};

/**
 * Get secondary dominant suggestions
 */
const getSecondaryDominant = (nashvilleNumber) => {
  const secondaryDominants = {
    '2m': '6/2', // V/ii
    '3m': '7/3', // V/iii
    '4': '1/4',  // V/IV
    '5': '2/5',  // V/V
    '6m': '3/6', // V/vi
  };
  
  return secondaryDominants[nashvilleNumber];
};

/**
 * Determine the type of substitution
 */
const getSubstitutionType = (original, substitution) => {
  if (substitution.includes('7')) return 'extended';
  if (substitution.includes('/')) return 'secondary';
  if (substitution.includes('b') || substitution.includes('#')) return 'chromatic';
  if (substitution.includes('dim')) return 'diminished';
  return 'diatonic';
};

/**
 * Get human-readable description of substitution
 */
const getSubstitutionDescription = (original, substitution) => {
  const descriptions = {
    'diatonic': 'Diatonic substitution - stays within the key',
    'extended': 'Extended chord - adds color and sophistication',
    'secondary': 'Secondary dominant - creates forward motion',
    'chromatic': 'Chromatic approach - smooth voice leading',
    'diminished': 'Diminished chord - creates tension and movement',
  };
  
  const type = getSubstitutionType(original, substitution);
  return descriptions[type] || 'Alternative chord choice';
};

/**
 * Generate progression variations based on common patterns
 * @param {Array} progression - Original progression (Nashville numbers or chord names)
 * @param {string} key - Key signature
 * @param {Object} options - Variation options
 * @returns {Array} Array of progression variations
 */
export const getProgressionVariations = (progression, key, options = {}) => {
  const { maxVariations = 5, includeModalInterchange = true, includeJazzHarmony = false } = options;
  
  // Convert progression to Nashville numbers for analysis
  const nashvilleProgression = progression.map(chord => chordToNashville(chord, key)).filter(Boolean);
  
  const variations = [];
  
  // 1. Chord extension variations
  variations.push({
    progression: addChordExtensions(nashvilleProgression).map(n => nashvilleToChord(n, key)).filter(Boolean),
    description: 'Extended chords (7ths, 9ths)',
    type: 'extensions',
    complexity: 'intermediate'
  });

  // 2. Inversion variations
  variations.push({
    progression: addInversions(nashvilleProgression).map(n => nashvilleToChord(n, key)).filter(Boolean),
    description: 'Bass note variations and inversions',
    type: 'inversions',
    complexity: 'intermediate'
  });

  // 3. Substitution variations
  const substitutedProgression = applySubstitutions(nashvilleProgression);
  if (substitutedProgression.length > 0) {
    variations.push({
      progression: substitutedProgression.map(n => nashvilleToChord(n, key)).filter(Boolean),
      description: 'Chord substitutions',
      type: 'substitutions',
      complexity: 'advanced'
    });
  }

  // 4. Modal interchange variations
  if (includeModalInterchange) {
    const modalProgression = addModalInterchange(nashvilleProgression);
    if (modalProgression.length > 0) {
      variations.push({
        progression: modalProgression.map(n => nashvilleToChord(n, key)).filter(Boolean),
        description: 'Modal interchange (borrowed chords)',
        type: 'modal',
        complexity: 'advanced'
      });
    }
  }

  // 5. Jazz harmony variations
  if (includeJazzHarmony) {
    const jazzProgression = addJazzHarmony(nashvilleProgression);
    if (jazzProgression.length > 0) {
      variations.push({
        progression: jazzProgression.map(n => nashvilleToChord(n, key)).filter(Boolean),
        description: 'Jazz harmony (secondary dominants, tritone subs)',
        type: 'jazz',
        complexity: 'advanced'
      });
    }
  }

  // 6. Rhythmic variations (chord repetitions and subdivisions)
  variations.push({
    progression: createRhythmicVariation(nashvilleProgression).map(n => nashvilleToChord(n, key)).filter(Boolean),
    description: 'Rhythmic variation (repeated chords)',
    type: 'rhythmic',
    complexity: 'simple'
  });

  return variations
    .filter(variation => variation.progression.every(chord => chord)) // Remove invalid chords
    .slice(0, maxVariations);
};

/**
 * Add chord extensions (7ths, 9ths, etc.)
 */
const addChordExtensions = (nashvilleProgression) => {
  return nashvilleProgression.map(chord => {
    // Handle null/undefined chords
    if (!chord || typeof chord !== 'string') return chord;
    
    if (!chord.includes('7') && !chord.includes('9')) {
      // Add 7th to appropriate chords
      if (chord === '5' || chord === '1' || chord.includes('m')) {
        return chord + '7';
      }
    }
    return chord;
  });
};

/**
 * Add bass note variations and inversions
 */
const addInversions = (nashvilleProgression) => {
  return nashvilleProgression.map((chord, index) => {
    // Add bass notes for smoother voice leading
    if (index < nashvilleProgression.length - 1) {
      const nextChord = nashvilleProgression[index + 1];
      // Add simple bass movement
      if (chord === '1' && nextChord === '6m') {
        return '1'; // Could be 1/3 for smoother bass
      }
    }
    return chord;
  });
};

/**
 * Apply chord substitutions to progression
 */
const applySubstitutions = (nashvilleProgression) => {
  return nashvilleProgression.map(chord => {
    const subs = SUBSTITUTION_RULES[chord];
    if (subs && subs.length > 0) {
      // Use first substitution for variation
      return subs[0];
    }
    return chord;
  });
};

/**
 * Add modal interchange chords
 */
const addModalInterchange = (nashvilleProgression) => {
  const modalChords = ['bVII', 'bIII', 'bVI', '4m'];
  
  return nashvilleProgression.map((chord, index) => {
    // Occasionally substitute with modal chords
    if (chord === '4' && Math.random() > 0.5) {
      return '4m'; // Minor iv chord (modal interchange)
    }
    if (chord === '1' && index === nashvilleProgression.length - 1) {
      return 'bVII'; // bVII before final resolution
    }
    return chord;
  });
};

/**
 * Add jazz harmony elements
 */
const addJazzHarmony = (nashvilleProgression) => {
  return nashvilleProgression.map((chord, index) => {
    // Add secondary dominants before target chords
    if (index < nashvilleProgression.length - 1) {
      const nextChord = nashvilleProgression[index + 1];
      if (nextChord === '2m') {
        return '6/2'; // V/ii
      }
      if (nextChord === '6m') {
        return '3/6'; // V/vi
      }
    }
    return chord;
  });
};

/**
 * Create rhythmic variations with chord repetitions
 */
const createRhythmicVariation = (nashvilleProgression) => {
  const result = [];
  nashvilleProgression.forEach((chord, index) => {
    result.push(chord);
    // Occasionally repeat chords for rhythmic interest
    if (index % 2 === 0 && result.length < 8) {
      result.push(chord);
    }
  });
  return result;
};

/**
 * Analyze progression and suggest improvements
 * @param {Array} progression - Chord progression
 * @param {string} key - Key signature
 * @returns {Object} Analysis with suggestions
 */
export const analyzeProgression = (progression, key) => {
  const nashvilleProgression = progression.map(chord => chordToNashville(chord, key)).filter(Boolean);
  
  const analysis = {
    keyCenter: key,
    length: progression.length,
    complexity: determineComplexity(nashvilleProgression),
    commonPatterns: findCommonPatterns(nashvilleProgression),
    suggestions: [],
    quality: scoreProgression(nashvilleProgression)
  };

  // Generate suggestions based on analysis
  if (analysis.complexity === 'simple') {
    analysis.suggestions.push('Try adding 7th chords for more sophistication');
  }
  
  if (!nashvilleProgression.includes('5')) {
    analysis.suggestions.push('Consider adding a V chord for stronger resolution');
  }

  if (progression.length < 4) {
    analysis.suggestions.push('Extend the progression for more musical development');
  }

  return analysis;
};

/**
 * Determine progression complexity
 */
const determineComplexity = (nashvilleProgression) => {
  const complexChords = nashvilleProgression.filter(chord => 
    chord && typeof chord === 'string' && (
      chord.includes('7') || chord.includes('9') || chord.includes('/') || chord.includes('b') || chord.includes('#')
    )
  );
  
  if (complexChords.length === 0) return 'simple';
  if (complexChords.length <= nashvilleProgression.length / 2) return 'intermediate';
  return 'advanced';
};

/**
 * Find common progression patterns
 */
const findCommonPatterns = (nashvilleProgression) => {
  const patterns = [];
  const progressionStr = nashvilleProgression.join('-');
  
  Object.entries(PROGRESSION_VARIATIONS).forEach(([key, pattern]) => {
    const patternStr = pattern.pattern.join('-');
    if (progressionStr.includes(patternStr)) {
      patterns.push(pattern.description);
    }
  });
  
  return patterns;
};

/**
 * Score progression quality (0-100)
 */
const scoreProgression = (nashvilleProgression) => {
  let score = 50; // Base score
  
  // Bonus for including dominant function
  if (nashvilleProgression.includes('5') || nashvilleProgression.includes('57')) {
    score += 15;
  }
  
  // Bonus for good voice leading
  if (hasGoodVoiceLeading(nashvilleProgression)) {
    score += 10;
  }
  
  // Bonus for appropriate length
  if (nashvilleProgression.length >= 4 && nashvilleProgression.length <= 8) {
    score += 10;
  }
  
  // Bonus for variety
  const uniqueChords = new Set(nashvilleProgression);
  if (uniqueChords.size >= Math.min(4, nashvilleProgression.length)) {
    score += 15;
  }
  
  return Math.min(100, Math.max(0, score));
};

/**
 * Check for good voice leading
 */
const hasGoodVoiceLeading = (nashvilleProgression) => {
  // Simplified voice leading check
  let goodMovements = 0;
  
  for (let i = 0; i < nashvilleProgression.length - 1; i++) {
    const current = nashvilleProgression[i];
    const next = nashvilleProgression[i + 1];
    
    // Strong progressions: V-I, ii-V, vi-IV, etc.
    if ((current === '5' && next === '1') ||
        (current === '2m' && next === '5') ||
        (current === '6m' && next === '4')) {
      goodMovements++;
    }
  }
  
  return goodMovements >= nashvilleProgression.length / 3;
};