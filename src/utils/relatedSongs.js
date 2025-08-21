/**
 * Related Songs Discovery Utility
 * Finds songs with similar chord progressions based on various similarity metrics
 */

import { progressionToNashville } from './nashvilleNumbers';

/**
 * Calculate similarity score between two chord progressions
 * @param {string[]} prog1 - First progression
 * @param {string[]} prog2 - Second progression  
 * @param {string} key1 - Key of first progression
 * @param {string} key2 - Key of second progression
 * @returns {number} Similarity score (0-1)
 */
export const calculateProgressionSimilarity = (prog1, prog2, key1, key2) => {
  if (!prog1.length || !prog2.length) return 0;

  // Convert both progressions to Nashville numbers for key-independent comparison
  const nash1 = progressionToNashville(prog1, key1);
  const nash2 = progressionToNashville(prog2, key2);

  // Exact match gets highest score
  if (JSON.stringify(nash1) === JSON.stringify(nash2)) {
    return 1.0;
  }

  // Calculate common chord percentage
  const set1 = new Set(nash1);
  const set2 = new Set(nash2);
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  const chordSimilarity = intersection.size / union.size;

  // Calculate sequence similarity (how many chords appear in the same order)
  let sequenceSimilarity = 0;
  const minLength = Math.min(nash1.length, nash2.length);
  
  for (let i = 0; i < minLength; i++) {
    if (nash1[i] === nash2[i]) {
      sequenceSimilarity += 1;
    }
  }
  sequenceSimilarity = sequenceSimilarity / Math.max(nash1.length, nash2.length);

  // Calculate length similarity
  const lengthSimilarity = 1 - Math.abs(nash1.length - nash2.length) / Math.max(nash1.length, nash2.length);

  // Weighted combination of similarities
  return (chordSimilarity * 0.5) + (sequenceSimilarity * 0.3) + (lengthSimilarity * 0.2);
};

/**
 * Find songs with similar progressions to a given song
 * @param {Object} targetSong - The song to find similarities for
 * @param {Array} songDatabase - Array of all songs
 * @param {Object} options - Search options
 * @returns {Array} Array of related songs with similarity scores
 */
export const findRelatedSongs = (targetSong, songDatabase, options = {}) => {
  const {
    minSimilarity = 0.3,
    maxResults = 5,
    sameArtistBonus = 0.1,
    sameGenreBonus = 0.05,
    excludeSelf = true
  } = options;

  if (!targetSong || !songDatabase) return [];

  const relatedSongs = [];

  // Get all progressions from target song
  const targetProgressions = Object.entries(targetSong.sections).map(([sectionName, section]) => ({
    sectionName,
    progression: section.progression,
    key: targetSong.key
  }));

  songDatabase.forEach(song => {
    if (excludeSelf && song.songId === targetSong.songId) return;

    let maxSimilarity = 0;
    let bestMatch = null;

    // Compare each section of target song to each section of current song
    targetProgressions.forEach(targetSection => {
      Object.entries(song.sections).forEach(([sectionName, section]) => {
        const similarity = calculateProgressionSimilarity(
          targetSection.progression,
          section.progression,
          targetSong.key,
          song.key
        );

        if (similarity > maxSimilarity) {
          maxSimilarity = similarity;
          bestMatch = {
            targetSection: targetSection.sectionName,
            matchSection: sectionName,
            similarity
          };
        }
      });
    });

    // Apply bonuses
    if (song.artist === targetSong.artist) {
      maxSimilarity = Math.min(1.0, maxSimilarity + sameArtistBonus);
    }
    if (song.genre === targetSong.genre) {
      maxSimilarity = Math.min(1.0, maxSimilarity + sameGenreBonus);
    }

    // Only include if above minimum similarity threshold
    if (maxSimilarity >= minSimilarity) {
      relatedSongs.push({
        song,
        similarity: maxSimilarity,
        bestMatch
      });
    }
  });

  // Sort by similarity (descending) and limit results
  return relatedSongs
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, maxResults);
};

/**
 * Get similarity explanation text for UI display
 * @param {Object} match - Match object with similarity data
 * @returns {string} Human-readable explanation
 */
export const getSimilarityExplanation = (match) => {
  const { similarity, bestMatch } = match;
  const percentage = Math.round(similarity * 100);

  if (similarity >= 0.8) {
    return `${percentage}% similar - Very similar ${bestMatch.targetSection} and ${bestMatch.matchSection} progressions`;
  } else if (similarity >= 0.6) {
    return `${percentage}% similar - Similar chord progressions in ${bestMatch.targetSection}/${bestMatch.matchSection}`;
  } else if (similarity >= 0.4) {
    return `${percentage}% similar - Some common chord patterns`;
  } else {
    return `${percentage}% similar - Shares some musical elements`;
  }
};

/**
 * Group related songs by similarity level
 * @param {Array} relatedSongs - Array of related songs
 * @returns {Object} Grouped songs by similarity categories
 */
export const groupBySimilarity = (relatedSongs) => {
  return {
    verySimilar: relatedSongs.filter(s => s.similarity >= 0.7),
    similar: relatedSongs.filter(s => s.similarity >= 0.5 && s.similarity < 0.7),
    somewhatSimilar: relatedSongs.filter(s => s.similarity >= 0.3 && s.similarity < 0.5)
  };
};