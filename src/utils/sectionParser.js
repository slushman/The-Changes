/**
 * Section Parser - Converts freeform textarea input to structured song sections
 * Handles flexible section naming and chord progression parsing
 */

/**
 * Parse freeform text input into structured song sections
 * @param {string} sectionsText - Raw text input from textarea
 * @returns {Object} - Structured sections object
 */
export function parseSectionsText(sectionsText) {
  if (!sectionsText || typeof sectionsText !== 'string') {
    return {};
  }

  const lines = sectionsText.split('\n');
  const sections = {};
  let currentSection = null;

  for (let line of lines) {
    const trimmed = line.trim();
    
    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    // Check if this line defines a new section (contains colon)
    if (trimmed.includes(':')) {
      const colonIndex = trimmed.indexOf(':');
      const sectionName = trimmed.substring(0, colonIndex).trim().toLowerCase();
      const chordsText = trimmed.substring(colonIndex + 1).trim();

      if (sectionName && chordsText) {
        // Parse chords from the text after the colon
        const chords = parseChords(chordsText);
        
        if (chords.length > 0) {
          sections[sectionName] = createSectionObject(chords, sectionName);
          currentSection = sectionName;
        }
      }
    } 
    // If we're in a section and this line doesn't have a colon, 
    // treat it as additional chords for the current section
    else if (currentSection && trimmed) {
      const additionalChords = parseChords(trimmed);
      if (additionalChords.length > 0) {
        sections[currentSection].progression = [
          ...sections[currentSection].progression,
          ...additionalChords
        ];
        // Recalculate bars after adding chords
        sections[currentSection].bars = sections[currentSection].progression.length;
      }
    }
  }

  return sections;
}

/**
 * Parse chord text into array of individual chords
 * @param {string} chordsText - Space-separated chord text
 * @returns {Array} - Array of chord names
 */
function parseChords(chordsText) {
  if (!chordsText || typeof chordsText !== 'string') {
    return [];
  }

  // Split by spaces and filter out empty strings
  const chords = chordsText
    .split(/\s+/)
    .map(chord => chord.trim())
    .filter(chord => chord.length > 0)
    .filter(chord => !chord.startsWith('(') || chord.endsWith(')')); // Filter out parenthetical comments unless complete

  // Basic chord validation - allow common chord patterns
  const validChords = chords.filter(chord => {
    // Remove parenthetical comments for validation
    const cleanChord = chord.replace(/\([^)]*\)/, '').trim();
    
    // Basic chord pattern - letter, optional sharp/flat, optional chord type
    const chordPattern = /^[A-G][#b]?[^/]*?(\/[A-G][#b]?)?$/;
    return chordPattern.test(cleanChord);
  });

  return validChords;
}

/**
 * Create a structured section object from chord array
 * @param {Array} chords - Array of chord names
 * @param {string} sectionName - Name of the section
 * @returns {Object} - Structured section object
 */
function createSectionObject(chords, sectionName) {
  const complexity = determineComplexity(chords);
  const bars = chords.length; // Simple assumption: 1 chord per bar
  
  return {
    progression: chords,
    bars: bars,
    repetitions: 1,
    complexity: complexity,
    audioTimestamp: {
      start: "0:00",
      end: "0:30" // Default placeholder
    }
  };
}

/**
 * Determine the complexity level based on the chords used
 * @param {Array} chords - Array of chord names
 * @returns {string} - Complexity level: 'simple', 'intermediate', or 'complex'
 */
function determineComplexity(chords) {
  if (!chords || chords.length === 0) {
    return 'simple';
  }

  let complexityScore = 0;

  chords.forEach(chord => {
    const cleanChord = chord.replace(/\([^)]*\)/, '').trim();
    
    // Simple triads = 0 points
    if (/^[A-G][#b]?m?$/.test(cleanChord)) {
      // Basic major/minor chord
      complexityScore += 0;
    }
    // Seventh chords = 1 point each
    else if (/^[A-G][#b]?.*7/.test(cleanChord)) {
      complexityScore += 1;
    }
    // Sus chords = 1 point each
    else if (/sus/.test(cleanChord)) {
      complexityScore += 1;
    }
    // Slash chords = 1 point each
    else if (/\//.test(cleanChord)) {
      complexityScore += 1;
    }
    // Extended chords (9, 11, 13) = 2 points each
    else if (/[9|11|13]/.test(cleanChord)) {
      complexityScore += 2;
    }
    // Diminished/augmented = 2 points each
    else if (/(dim|aug)/.test(cleanChord)) {
      complexityScore += 2;
    }
    // Other complex chords = 1 point
    else {
      complexityScore += 1;
    }
  });

  const avgComplexity = complexityScore / chords.length;

  if (avgComplexity <= 0.3) {
    return 'simple';
  } else if (avgComplexity <= 1.0) {
    return 'intermediate';
  } else {
    return 'complex';
  }
}

/**
 * Validate parsed sections for common issues
 * @param {Object} sections - Parsed sections object
 * @returns {Object} - Validation result with isValid and errors
 */
export function validateParsedSections(sections) {
  const errors = [];
  
  if (!sections || typeof sections !== 'object') {
    return { isValid: false, errors: ['No sections found'] };
  }

  const sectionNames = Object.keys(sections);
  
  if (sectionNames.length === 0) {
    errors.push('At least one section is required');
  }

  sectionNames.forEach(sectionName => {
    const section = sections[sectionName];
    
    if (!section.progression || section.progression.length === 0) {
      errors.push(`Section "${sectionName}" has no chords`);
    }
    
    if (section.progression && section.progression.length > 16) {
      errors.push(`Section "${sectionName}" has too many chords (${section.progression.length}). Consider breaking it into multiple sections.`);
    }
  });

  return { isValid: errors.length === 0, errors };
}

/**
 * Generate example sections text for help/placeholder
 * @returns {string} - Example formatted text
 */
export function getExampleSectionsText() {
  return `verse: C Am F G
chorus: F C G Am F C G Am
bridge: Am F C G
verse2: C Am F G
outro: F G C`;
}

/**
 * Convert sections back to text format (for editing)
 * @param {Object} sections - Structured sections object
 * @returns {string} - Formatted text representation
 */
export function sectionsToText(sections) {
  if (!sections || typeof sections !== 'object') {
    return '';
  }

  return Object.entries(sections)
    .map(([sectionName, section]) => {
      if (section.progression && Array.isArray(section.progression)) {
        return `${sectionName}: ${section.progression.join(' ')}`;
      }
      return '';
    })
    .filter(line => line.length > 0)
    .join('\n');
}

const sectionParser = {
  parseSectionsText,
  validateParsedSections,
  getExampleSectionsText,
  sectionsToText
};

export default sectionParser;