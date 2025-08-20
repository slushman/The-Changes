/**
 * Data validation utilities for song database structure
 * Ensures data integrity and consistency for chord progression data
 */

// Valid chord patterns and naming conventions
const VALID_CHORD_PATTERNS = [
  // Basic triads
  /^[A-G][b#]?$/,                    // C, F#, Bb
  /^[A-G][b#]?m$/,                   // Am, F#m, Bbm
  /^[A-G][b#]?dim$/,                 // Cdim, F#dim
  /^[A-G][b#]?aug$/,                 // Caug, F#aug
  
  // Seventh chords
  /^[A-G][b#]?7$/,                   // C7, F#7
  /^[A-G][b#]?maj7$/,                // Cmaj7, F#maj7
  /^[A-G][b#]?m7$/,                  // Cm7, F#m7
  /^[A-G][b#]?mMaj7$/,               // CmMaj7
  /^[A-G][b#]?dim7$/,                // Cdim7
  /^[A-G][b#]?m7b5$/,                // Cm7b5
  
  // Extended chords
  /^[A-G][b#]?9$/,                   // C9
  /^[A-G][b#]?maj9$/,                // Cmaj9
  /^[A-G][b#]?m9$/,                  // Cm9
  /^[A-G][b#]?11$/,                  // C11
  /^[A-G][b#]?13$/,                  // C13
  
  // Sus chords
  /^[A-G][b#]?sus2$/,                // Csus2
  /^[A-G][b#]?sus4$/,                // Csus4
  
  // Slash chords
  /^[A-G][b#]?[^\/]*\/[A-G][b#]?$/   // C/E, Am/C, etc.
];

const VALID_GENRES = [
  'rock', 'pop', 'jazz', 'blues', 'country', 'folk', 'reggae', 
  'hip-hop', 'r&b', 'soul', 'funk', 'disco', 'electronic', 
  'alternative', 'grunge', 'punk', 'metal', 'indie', 'classical'
];

const VALID_DECADES = ['60s', '70s', '80s', '90s', '2000s', '2010s', '2020s'];

const VALID_POPULARITY_LEVELS = ['mainstream', 'deep-cut', 'underground'];

const VALID_COMPLEXITY_LEVELS = ['simple', 'intermediate', 'complex'];

const VALID_SECTION_NAMES = [
  'intro', 'verse', 'chorus', 'bridge', 'outro', 'pre-chorus', 
  'post-chorus', 'instrumental', 'solo', 'breakdown', 'interlude'
];

/**
 * Validates a chord name against known patterns
 * @param {string} chord - The chord name to validate
 * @returns {boolean} - Whether the chord is valid
 */
export const isValidChord = (chord) => {
  if (typeof chord !== 'string' || chord.length === 0) {
    return false;
  }
  
  return VALID_CHORD_PATTERNS.some(pattern => pattern.test(chord));
};

/**
 * Validates a time timestamp format (mm:ss)
 * @param {string} timestamp - The timestamp to validate
 * @returns {boolean} - Whether the timestamp is valid
 */
export const isValidTimestamp = (timestamp) => {
  if (typeof timestamp !== 'string') return false;
  
  const timeRegex = /^\d{1,2}:\d{2}$/;
  if (!timeRegex.test(timestamp)) return false;
  
  const [minutes, seconds] = timestamp.split(':').map(Number);
  return seconds >= 0 && seconds < 60 && minutes >= 0;
};

/**
 * Validates a song section structure
 * @param {Object} section - The section object to validate
 * @param {string} sectionName - The name of the section
 * @returns {Object} - Validation result with isValid and errors
 */
export const validateSection = (section, sectionName) => {
  const errors = [];
  
  if (!section || typeof section !== 'object') {
    return { isValid: false, errors: ['Section must be an object'] };
  }
  
  // Validate section name
  if (!VALID_SECTION_NAMES.includes(sectionName)) {
    errors.push(`Invalid section name: ${sectionName}`);
  }
  
  // Validate progression
  if (!Array.isArray(section.progression)) {
    errors.push('Progression must be an array');
  } else {
    if (section.progression.length === 0) {
      errors.push('Progression cannot be empty');
    }
    
    section.progression.forEach((chord, index) => {
      if (!isValidChord(chord)) {
        errors.push(`Invalid chord at position ${index}: ${chord}`);
      }
    });
  }
  
  // Validate bars
  if (typeof section.bars !== 'number' || section.bars <= 0 || !Number.isInteger(section.bars)) {
    errors.push('Bars must be a positive integer');
  }
  
  // Validate repetitions
  if (typeof section.repetitions !== 'number' || section.repetitions <= 0 || !Number.isInteger(section.repetitions)) {
    errors.push('Repetitions must be a positive integer');
  }
  
  // Validate complexity
  if (!VALID_COMPLEXITY_LEVELS.includes(section.complexity)) {
    errors.push(`Invalid complexity level: ${section.complexity}`);
  }
  
  // Validate audio timestamp
  if (section.audioTimestamp) {
    if (typeof section.audioTimestamp !== 'object') {
      errors.push('Audio timestamp must be an object');
    } else {
      if (!isValidTimestamp(section.audioTimestamp.start)) {
        errors.push(`Invalid start timestamp: ${section.audioTimestamp.start}`);
      }
      if (!isValidTimestamp(section.audioTimestamp.end)) {
        errors.push(`Invalid end timestamp: ${section.audioTimestamp.end}`);
      }
      
      // Check that start is before end
      if (section.audioTimestamp.start && section.audioTimestamp.end) {
        const startSeconds = timeToSeconds(section.audioTimestamp.start);
        const endSeconds = timeToSeconds(section.audioTimestamp.end);
        if (startSeconds >= endSeconds) {
          errors.push('Start timestamp must be before end timestamp');
        }
      }
    }
  }
  
  return { isValid: errors.length === 0, errors };
};

/**
 * Validates a complete song object
 * @param {Object} song - The song object to validate
 * @returns {Object} - Validation result with isValid and errors
 */
export const validateSong = (song) => {
  const errors = [];
  
  if (!song || typeof song !== 'object') {
    return { isValid: false, errors: ['Song must be an object'] };
  }
  
  // Required string fields
  const requiredStringFields = ['songId', 'title', 'artist', 'genre', 'decade', 'popularity', 'key'];
  requiredStringFields.forEach(field => {
    if (typeof song[field] !== 'string' || song[field].length === 0) {
      errors.push(`${field} must be a non-empty string`);
    }
  });
  
  // Validate specific field values
  if (song.genre && !VALID_GENRES.includes(song.genre)) {
    errors.push(`Invalid genre: ${song.genre}`);
  }
  
  if (song.decade && !VALID_DECADES.includes(song.decade)) {
    errors.push(`Invalid decade: ${song.decade}`);
  }
  
  if (song.popularity && !VALID_POPULARITY_LEVELS.includes(song.popularity)) {
    errors.push(`Invalid popularity level: ${song.popularity}`);
  }
  
  // Validate numeric fields
  if (typeof song.year !== 'number' || song.year < 1900 || song.year > new Date().getFullYear()) {
    errors.push('Year must be a number between 1900 and current year');
  }
  
  if (typeof song.tempo !== 'number' || song.tempo <= 0 || song.tempo > 300) {
    errors.push('Tempo must be a number between 1 and 300 BPM');
  }
  
  // Validate sections
  if (!song.sections || typeof song.sections !== 'object') {
    errors.push('Sections must be an object');
  } else {
    if (Object.keys(song.sections).length === 0) {
      errors.push('Song must have at least one section');
    }
    
    Object.entries(song.sections).forEach(([sectionName, section]) => {
      const sectionValidation = validateSection(section, sectionName);
      if (!sectionValidation.isValid) {
        errors.push(`Section "${sectionName}": ${sectionValidation.errors.join(', ')}`);
      }
    });
  }
  
  // Validate optional streaming IDs (if present)
  if (song.spotifyId && (typeof song.spotifyId !== 'string' || song.spotifyId.length === 0)) {
    errors.push('Spotify ID must be a non-empty string if provided');
  }
  
  if (song.youtubeId && (typeof song.youtubeId !== 'string' || song.youtubeId.length === 0)) {
    errors.push('YouTube ID must be a non-empty string if provided');
  }
  
  return { isValid: errors.length === 0, errors };
};

/**
 * Validates an entire song database array
 * @param {Array} database - Array of song objects
 * @returns {Object} - Validation result with detailed information
 */
export const validateDatabase = (database) => {
  if (!Array.isArray(database)) {
    return { isValid: false, errors: ['Database must be an array'], validSongs: 0, totalSongs: 0 };
  }
  
  const results = {
    isValid: true,
    errors: [],
    validSongs: 0,
    totalSongs: database.length,
    songErrors: {}
  };
  
  const songIds = new Set();
  
  database.forEach((song, index) => {
    const validation = validateSong(song);
    
    if (!validation.isValid) {
      results.isValid = false;
      results.songErrors[`Song ${index + 1} (${song?.title || 'Unknown'})`] = validation.errors;
    } else {
      results.validSongs++;
    }
    
    // Check for duplicate song IDs
    if (song?.songId) {
      if (songIds.has(song.songId)) {
        results.isValid = false;
        results.errors.push(`Duplicate song ID: ${song.songId}`);
      }
      songIds.add(song.songId);
    }
  });
  
  return results;
};

/**
 * Helper function to convert mm:ss timestamp to total seconds
 * @param {string} timestamp - Time in mm:ss format
 * @returns {number} - Total seconds
 */
const timeToSeconds = (timestamp) => {
  const [minutes, seconds] = timestamp.split(':').map(Number);
  return minutes * 60 + seconds;
};

/**
 * Gets validation statistics for a database
 * @param {Array} database - Song database array
 * @returns {Object} - Statistics about the database
 */
export const getDatabaseValidationStats = (database) => {
  const validation = validateDatabase(database);
  
  return {
    isValid: validation.isValid,
    totalSongs: validation.totalSongs,
    validSongs: validation.validSongs,
    invalidSongs: validation.totalSongs - validation.validSongs,
    validationRate: validation.totalSongs > 0 ? (validation.validSongs / validation.totalSongs * 100).toFixed(1) : '0',
    hasErrors: validation.errors.length > 0 || Object.keys(validation.songErrors).length > 0
  };
};

// Export validation constants for use in other modules
export {
  VALID_GENRES,
  VALID_DECADES,
  VALID_POPULARITY_LEVELS,
  VALID_COMPLEXITY_LEVELS,
  VALID_SECTION_NAMES
};