/**
 * Chord search utilities and algorithms
 * Provides powerful search functionality for finding chord progressions across song sections
 */

import songDatabase from '../data/songDatabase.js';

/**
 * Searches for songs containing a specific chord progression
 * @param {Array} searchProgression - Array of chord names to search for
 * @param {Object} options - Search options
 * @returns {Array} - Array of matching songs with match details
 */
export const searchByProgression = (searchProgression, options = {}) => {
  const {
    exactMatch = false,          // Whether to match exactly or allow partial matches
    caseSensitive = false,       // Whether chord matching is case sensitive
    allowTransposition = false,  // Whether to find transposed versions
    sectionFilter = null,        // Filter by specific section types
    genreFilter = null,         // Filter by genre
    decadeFilter = null,        // Filter by decade
    complexityFilter = null,    // Filter by complexity
    popularityFilter = null     // Filter by popularity
  } = options;

  if (!Array.isArray(searchProgression) || searchProgression.length === 0) {
    return [];
  }

  const normalizedSearch = caseSensitive 
    ? searchProgression 
    : searchProgression.map(chord => chord.toLowerCase());

  const results = [];

  songDatabase.forEach(song => {
    // Apply song-level filters first
    if (genreFilter && song.genre.toLowerCase() !== genreFilter.toLowerCase()) return;
    if (decadeFilter && song.decade !== decadeFilter) return;
    if (popularityFilter && song.popularity !== popularityFilter) return;

    // Search through each section of the song
    Object.entries(song.sections).forEach(([sectionName, sectionData]) => {
      // Apply section-level filters
      if (sectionFilter && sectionName !== sectionFilter) return;
      if (complexityFilter && sectionData.complexity !== complexityFilter) return;

      const sectionProgression = caseSensitive 
        ? sectionData.progression 
        : sectionData.progression.map(chord => chord.toLowerCase());

      // Find matches in this section
      const matches = findProgressionMatches(
        normalizedSearch, 
        sectionProgression, 
        { exactMatch, allowTransposition }
      );

      matches.forEach(match => {
        results.push({
          ...song,
          matchedSection: sectionName,
          sectionData,
          matchDetails: match,
          searchProgression: searchProgression,
          confidence: calculateMatchConfidence(match, searchProgression.length, sectionProgression.length)
        });
      });
    });
  });

  // Sort results by confidence (highest first)
  return results.sort((a, b) => b.confidence - a.confidence);
};

/**
 * Finds all matches of a search progression within a section progression
 * @param {Array} searchProgression - Normalized search progression
 * @param {Array} sectionProgression - Normalized section progression  
 * @param {Object} options - Search options
 * @returns {Array} - Array of match objects
 */
const findProgressionMatches = (searchProgression, sectionProgression, options = {}) => {
  const { exactMatch, allowTransposition } = options;
  const matches = [];

  if (exactMatch) {
    // Find exact sequence matches
    for (let i = 0; i <= sectionProgression.length - searchProgression.length; i++) {
      const slice = sectionProgression.slice(i, i + searchProgression.length);
      if (progressionsMatch(searchProgression, slice, { allowTransposition })) {
        matches.push({
          type: 'exact',
          startIndex: i,
          endIndex: i + searchProgression.length - 1,
          matchedChords: sectionProgression.slice(i, i + searchProgression.length),
          originalChords: searchProgression
        });
      }
    }
  } else {
    // Find partial matches and subsequences
    const partialMatches = findPartialMatches(searchProgression, sectionProgression, { allowTransposition });
    matches.push(...partialMatches);
  }

  return matches;
};

/**
 * Finds partial matches and subsequences
 * @param {Array} searchProgression - Search progression
 * @param {Array} sectionProgression - Section progression
 * @param {Object} options - Options
 * @returns {Array} - Partial matches
 */
const findPartialMatches = (searchProgression, sectionProgression, options = {}) => {
  const { allowTransposition } = options;
  const matches = [];

  // Find contiguous subsequences
  for (let searchStart = 0; searchStart < searchProgression.length; searchStart++) {
    for (let searchEnd = searchStart + 1; searchEnd <= searchProgression.length; searchEnd++) {
      const searchSubseq = searchProgression.slice(searchStart, searchEnd);
      
      // Skip single chord matches unless it's the full search
      if (searchSubseq.length === 1 && searchProgression.length > 1) continue;

      for (let sectionStart = 0; sectionStart <= sectionProgression.length - searchSubseq.length; sectionStart++) {
        const sectionSubseq = sectionProgression.slice(sectionStart, sectionStart + searchSubseq.length);
        
        if (progressionsMatch(searchSubseq, sectionSubseq, { allowTransposition })) {
          matches.push({
            type: 'partial',
            startIndex: sectionStart,
            endIndex: sectionStart + searchSubseq.length - 1,
            matchedChords: sectionSubseq,
            originalChords: searchSubseq,
            searchStartIndex: searchStart,
            searchEndIndex: searchEnd - 1,
            coverage: searchSubseq.length / searchProgression.length
          });
        }
      }
    }
  }

  // Remove duplicate matches and keep best ones
  return deduplicateMatches(matches);
};

/**
 * Checks if two progressions match
 * @param {Array} prog1 - First progression
 * @param {Array} prog2 - Second progression
 * @param {Object} options - Options
 * @returns {boolean} - Whether progressions match
 */
const progressionsMatch = (prog1, prog2, options = {}) => {
  const { allowTransposition } = options;
  
  if (prog1.length !== prog2.length) return false;

  // Direct match
  if (prog1.every((chord, i) => chord === prog2[i])) {
    return true;
  }

  // Transposition match (if enabled)
  if (allowTransposition) {
    return isTransposition(prog1, prog2);
  }

  return false;
};

/**
 * Checks if one progression is a transposition of another
 * @param {Array} prog1 - First progression
 * @param {Array} prog2 - Second progression
 * @returns {boolean} - Whether one is a transposition of the other
 */
const isTransposition = (prog1, prog2) => {
  if (prog1.length !== prog2.length) return false;
  
  // Simple implementation: check if the interval pattern is the same
  // This is a basic version - could be enhanced with more music theory
  
  const getChordRoot = (chord) => {
    const match = chord.match(/^([A-G][b#]?)/);
    return match ? match[1] : chord;
  };

  const noteToSemitone = {
    'c': 0, 'c#': 1, 'db': 1, 'd': 2, 'd#': 3, 'eb': 3, 'e': 4, 'f': 5,
    'f#': 6, 'gb': 6, 'g': 7, 'g#': 8, 'ab': 8, 'a': 9, 'a#': 10, 'bb': 10, 'b': 11
  };

  const getIntervals = (progression) => {
    const intervals = [];
    for (let i = 1; i < progression.length; i++) {
      const prev = noteToSemitone[getChordRoot(progression[i-1]).toLowerCase()] || 0;
      const curr = noteToSemitone[getChordRoot(progression[i]).toLowerCase()] || 0;
      intervals.push((curr - prev + 12) % 12);
    }
    return intervals;
  };

  const intervals1 = getIntervals(prog1);
  const intervals2 = getIntervals(prog2);

  return intervals1.every((interval, i) => interval === intervals2[i]);
};

/**
 * Removes duplicate matches and keeps the best ones
 * @param {Array} matches - Array of match objects
 * @returns {Array} - Deduplicated matches
 */
const deduplicateMatches = (matches) => {
  const uniqueMatches = new Map();

  matches.forEach(match => {
    const key = `${match.startIndex}-${match.endIndex}`;
    const existing = uniqueMatches.get(key);
    
    if (!existing || match.coverage > existing.coverage) {
      uniqueMatches.set(key, match);
    }
  });

  return Array.from(uniqueMatches.values());
};

/**
 * Calculates confidence score for a match
 * @param {Object} match - Match object
 * @param {number} searchLength - Length of search progression
 * @param {number} sectionLength - Length of section progression
 * @returns {number} - Confidence score (0-1)
 */
const calculateMatchConfidence = (match, searchLength, sectionLength) => {
  let confidence = 0;

  // Base confidence from coverage
  if (match.type === 'exact') {
    confidence = 1.0;
  } else {
    confidence = match.coverage || 0;
  }

  // Boost for longer matches
  const matchLength = match.endIndex - match.startIndex + 1;
  const lengthBonus = Math.min(matchLength / 8, 0.2); // Up to 20% bonus for 8+ chord matches
  confidence += lengthBonus;

  // Boost for matches at important positions (start of progression)
  if (match.startIndex === 0) {
    confidence += 0.1;
  }

  // Penalize very short matches in long sections
  if (matchLength < 3 && sectionLength > 6) {
    confidence *= 0.8;
  }

  return Math.min(confidence, 1.0);
};

/**
 * Searches for songs by individual chords
 * @param {Array} chords - Array of chord names
 * @param {Object} options - Search options
 * @returns {Array} - Songs containing any of the specified chords
 */
export const searchByChords = (chords, options = {}) => {
  const {
    requireAll = false,  // Whether all chords must be present
    caseSensitive = false,
    sectionFilter = null,
    genreFilter = null,
    decadeFilter = null
  } = options;

  if (!Array.isArray(chords) || chords.length === 0) {
    return [];
  }

  const normalizedChords = caseSensitive 
    ? chords 
    : chords.map(chord => chord.toLowerCase());

  const results = [];

  songDatabase.forEach(song => {
    // Apply filters
    if (genreFilter && song.genre.toLowerCase() !== genreFilter.toLowerCase()) return;
    if (decadeFilter && song.decade !== decadeFilter) return;

    const songChords = new Set();
    const matchingSections = [];

    Object.entries(song.sections).forEach(([sectionName, sectionData]) => {
      if (sectionFilter && sectionName !== sectionFilter) return;

      const sectionChords = caseSensitive 
        ? sectionData.progression 
        : sectionData.progression.map(chord => chord.toLowerCase());

      const foundChords = normalizedChords.filter(chord => sectionChords.includes(chord));
      
      if (foundChords.length > 0) {
        matchingSections.push({
          sectionName,
          sectionData,
          matchedChords: foundChords
        });
        foundChords.forEach(chord => songChords.add(chord));
      }
    });

    // Check if song meets the requirements
    const hasAllChords = normalizedChords.every(chord => songChords.has(chord));
    const hasAnyChords = songChords.size > 0;

    if ((requireAll && hasAllChords) || (!requireAll && hasAnyChords)) {
      results.push({
        ...song,
        matchedChords: Array.from(songChords),
        matchingSections,
        chordCoverage: songChords.size / normalizedChords.length
      });
    }
  });

  // Sort by chord coverage (highest first)
  return results.sort((a, b) => b.chordCoverage - a.chordCoverage);
};

/**
 * Gets suggestions for chord progressions based on partial input
 * @param {Array} partialProgression - Incomplete progression
 * @param {number} maxSuggestions - Maximum number of suggestions
 * @returns {Array} - Suggested continuations
 */
export const getProgressionSuggestions = (partialProgression, maxSuggestions = 10) => {
  if (!Array.isArray(partialProgression) || partialProgression.length === 0) {
    return [];
  }

  const suggestions = new Map();

  songDatabase.forEach(song => {
    Object.values(song.sections).forEach(section => {
      const progression = section.progression.map(chord => chord.toLowerCase());
      
      // Find where partial progression appears
      for (let i = 0; i <= progression.length - partialProgression.length; i++) {
        const slice = progression.slice(i, i + partialProgression.length);
        const normalizedPartial = partialProgression.map(chord => chord.toLowerCase());
        
        if (slice.every((chord, idx) => chord === normalizedPartial[idx])) {
          // Found a match, get the next chord(s)
          if (i + partialProgression.length < progression.length) {
            const nextChord = progression[i + partialProgression.length];
            const suggestionKey = [...partialProgression, nextChord].join('-');
            
            if (!suggestions.has(suggestionKey)) {
              suggestions.set(suggestionKey, {
                progression: [...partialProgression, nextChord],
                count: 0,
                examples: []
              });
            }
            
            const suggestion = suggestions.get(suggestionKey);
            suggestion.count++;
            suggestion.examples.push({
              song: song.title,
              artist: song.artist,
              section: Object.keys(song.sections).find(key => song.sections[key] === section)
            });
          }
        }
      }
    });
  });

  // Convert to array and sort by frequency
  return Array.from(suggestions.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, maxSuggestions);
};

const chordSearchUtils = {
  searchByProgression,
  searchByChords,
  getProgressionSuggestions
};

export default chordSearchUtils;