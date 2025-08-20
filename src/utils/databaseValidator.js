/**
 * Database validation runner and reporting utilities
 * Provides easy-to-use functions for validating the song database
 */

import { validateDatabase, getDatabaseValidationStats } from './songValidation.js';
import songDatabase from '../data/songDatabase.js';

/**
 * Validates the current song database and returns a detailed report
 * @returns {Object} - Detailed validation report
 */
export const validateCurrentDatabase = () => {
  const validation = validateDatabase(songDatabase);
  const stats = getDatabaseValidationStats(songDatabase);
  
  return {
    ...validation,
    stats,
    timestamp: new Date().toISOString()
  };
};

/**
 * Prints a formatted validation report to console
 * @param {Object} validationResult - Result from validateDatabase
 */
export const printValidationReport = (validationResult = null) => {
  const result = validationResult || validateCurrentDatabase();
  
  console.log('\n=== SONG DATABASE VALIDATION REPORT ===');
  console.log(`Timestamp: ${result.timestamp}`);
  console.log(`Total Songs: ${result.totalSongs}`);
  console.log(`Valid Songs: ${result.validSongs}`);
  console.log(`Invalid Songs: ${result.totalSongs - result.validSongs}`);
  console.log(`Validation Rate: ${result.stats.validationRate}%`);
  console.log(`Overall Status: ${result.isValid ? '✅ PASSED' : '❌ FAILED'}`);
  
  if (result.errors.length > 0) {
    console.log('\n--- DATABASE-LEVEL ERRORS ---');
    result.errors.forEach(error => console.log(`  ❌ ${error}`));
  }
  
  if (Object.keys(result.songErrors).length > 0) {
    console.log('\n--- SONG-LEVEL ERRORS ---');
    Object.entries(result.songErrors).forEach(([songName, errors]) => {
      console.log(`\n  🎵 ${songName}:`);
      errors.forEach(error => console.log(`    ❌ ${error}`));
    });
  }
  
  if (result.isValid) {
    console.log('\n🎉 All songs in the database are valid!');
  }
  
  console.log('\n=== END REPORT ===\n');
};

/**
 * Quick validation check that returns boolean
 * @returns {boolean} - Whether the database is valid
 */
export const isDatabaseValid = () => {
  const result = validateCurrentDatabase();
  return result.isValid;
};

/**
 * Gets summary statistics about the database
 * @returns {Object} - Database statistics
 */
export const getDatabaseSummary = () => {
  const stats = getDatabaseValidationStats(songDatabase);
  
  // Additional statistics
  const genres = [...new Set(songDatabase.map(song => song.genre))];
  const decades = [...new Set(songDatabase.map(song => song.decade))];
  const totalSections = songDatabase.reduce((acc, song) => 
    acc + Object.keys(song.sections || {}).length, 0
  );
  const averageSectionsPerSong = totalSections / songDatabase.length;
  
  return {
    ...stats,
    genres: genres.sort(),
    decades: decades.sort(),
    totalSections,
    averageSectionsPerSong: Math.round(averageSectionsPerSong * 10) / 10,
    genreCount: genres.length,
    decadeCount: decades.length
  };
};

export default {
  validateCurrentDatabase,
  printValidationReport,
  isDatabaseValid,
  getDatabaseSummary
};