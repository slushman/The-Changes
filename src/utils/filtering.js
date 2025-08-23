/**
 * Filtering utilities for song database
 * Provides functions to filter songs by various criteria
 */

import { songDatabase } from '../data/songDatabase.js';

/**
 * Filter songs by multiple criteria without requiring a chord progression search
 * @param {Array} database - The song database to search
 * @param {Object} filters - Filter criteria
 * @param {string} filters.genre - Genre filter
 * @param {string} filters.decade - Decade filter  
 * @param {string} filters.complexity - Complexity level filter
 * @param {string} filters.section - Section type filter
 * @param {string} filters.popularity - Popularity level filter
 * @returns {Array} Array of filtered songs
 */
export const searchByFilters = (database = songDatabase, filters = {}) => {
  const {
    genre,
    decade,
    complexity,
    section,
    popularity
  } = filters;

  if (!Array.isArray(database)) {
    return [];
  }

  const results = [];

  database.forEach(song => {
    // Apply song-level filters
    if (genre && song.genre.toLowerCase() !== genre.toLowerCase()) return;
    if (decade && song.decade !== decade) return;
    if (popularity && song.popularity !== popularity) return;

    // Check if any section matches the criteria
    const matchingSections = Object.entries(song.sections).filter(([sectionName, sectionData]) => {
      // Apply section-level filters
      if (section && sectionName !== section) return false;
      if (complexity && sectionData.complexity !== complexity) return false;
      return true;
    });

    // If we have matching sections, add the song to results
    if (matchingSections.length > 0) {
      // Add each matching section as a separate result
      matchingSections.forEach(([sectionName, sectionData]) => {
        results.push({
          ...song,
          matchedSection: sectionName,
          sectionData,
          matchType: 'filter',
          score: 1.0 // Perfect match for filter criteria
        });
      });
    }
  });

  return results;
};

/**
 * Get available filter values from the database
 * @param {Array} database - The song database to analyze
 * @returns {Object} Object containing arrays of available filter values
 */
export const getAvailableFilters = (database = songDatabase) => {
  const genres = new Set();
  const decades = new Set();
  const complexities = new Set();
  const sections = new Set();
  const popularities = new Set();

  database.forEach(song => {
    genres.add(song.genre);
    decades.add(song.decade);
    popularities.add(song.popularity);

    Object.entries(song.sections).forEach(([sectionName, sectionData]) => {
      sections.add(sectionName);
      complexities.add(sectionData.complexity);
    });
  });

  return {
    genres: Array.from(genres).sort(),
    decades: Array.from(decades).sort(),
    complexities: Array.from(complexities).sort(),
    sections: Array.from(sections).sort(),
    popularities: Array.from(popularities).sort()
  };
};

/**
 * Count songs matching filter criteria
 * @param {Array} database - The song database to search
 * @param {Object} filters - Filter criteria
 * @returns {number} Count of matching songs
 */
export const countFilteredSongs = (database = songDatabase, filters = {}) => {
  return searchByFilters(database, filters).length;
};

export default {
  searchByFilters,
  getAvailableFilters,
  countFilteredSongs
};