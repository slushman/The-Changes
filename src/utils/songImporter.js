/**
 * Data import utilities for batch song addition to the database
 * Supports CSV, JSON, and structured data formats
 */

import { validateSong } from './songValidation.js';

/**
 * Import songs from JSON format
 * @param {string|Object} jsonData - JSON string or parsed object containing songs
 * @returns {Object} - Import result with success/error information
 */
export function importFromJSON(jsonData) {
  try {
    const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
    
    if (!Array.isArray(data)) {
      return {
        success: false,
        error: 'JSON data must be an array of songs',
        imported: 0,
        failed: 0
      };
    }

    return validateAndProcessSongs(data);
  } catch (error) {
    return {
      success: false,
      error: `Invalid JSON format: ${error.message}`,
      imported: 0,
      failed: 0
    };
  }
}

/**
 * Import songs from CSV format
 * @param {string} csvData - CSV string data
 * @returns {Object} - Import result with success/error information
 */
export function importFromCSV(csvData) {
  try {
    const lines = csvData.trim().split('\n');
    if (lines.length < 2) {
      return {
        success: false,
        error: 'CSV must have at least a header row and one data row',
        imported: 0,
        failed: 0
      };
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const songs = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      const song = {};
      
      headers.forEach((header, index) => {
        const value = values[index] || '';
        
        // Convert specific fields to appropriate types
        switch (header.toLowerCase()) {
          case 'year':
          case 'tempo':
            song[header] = parseInt(value) || 0;
            break;
          case 'sections':
            try {
              song[header] = JSON.parse(value);
            } catch {
              song[header] = {};
            }
            break;
          default:
            song[header] = value;
        }
      });
      
      songs.push(song);
    }

    return validateAndProcessSongs(songs);
  } catch (error) {
    return {
      success: false,
      error: `CSV parsing error: ${error.message}`,
      imported: 0,
      failed: 0
    };
  }
}

/**
 * Import songs from a simplified format (for easy manual entry)
 * @param {Array} simpleSongs - Array of simplified song objects
 * @returns {Object} - Import result with success/error information
 */
export function importFromSimpleFormat(simpleSongs) {
  try {
    const expandedSongs = simpleSongs.map(song => expandSimpleSong(song));
    return validateAndProcessSongs(expandedSongs);
  } catch (error) {
    return {
      success: false,
      error: `Simple format conversion error: ${error.message}`,
      imported: 0,
      failed: 0
    };
  }
}

/**
 * Batch import utility that detects format and imports accordingly
 * @param {string|Object|Array} data - Data in various formats
 * @param {string} format - Optional format hint ('json', 'csv', 'simple')
 * @returns {Object} - Import result
 */
export function batchImport(data, format = 'auto') {
  if (format === 'auto') {
    format = detectFormat(data);
  }

  switch (format.toLowerCase()) {
    case 'json':
      return importFromJSON(data);
    case 'csv':
      return importFromCSV(data);
    case 'simple':
      return importFromSimpleFormat(data);
    default:
      return {
        success: false,
        error: `Unsupported format: ${format}`,
        imported: 0,
        failed: 0
      };
  }
}

/**
 * Validate and process imported songs
 * @param {Array} songs - Array of song objects to validate
 * @returns {Object} - Processing result
 */
function validateAndProcessSongs(songs) {
  const results = {
    success: true,
    imported: 0,
    failed: 0,
    errors: [],
    validSongs: [],
    invalidSongs: []
  };

  songs.forEach((song, index) => {
    const validation = validateSong(song);
    
    if (validation.isValid) {
      results.validSongs.push(song);
      results.imported++;
    } else {
      results.invalidSongs.push({
        index: index + 1,
        song,
        errors: validation.errors
      });
      results.failed++;
      results.errors.push(`Song ${index + 1}: ${validation.errors.join(', ')}`);
    }
  });

  if (results.failed > 0) {
    results.success = false;
  }

  return results;
}

/**
 * Expand a simplified song format into full database format
 * @param {Object} simpleSong - Simplified song object
 * @returns {Object} - Full song object
 */
function expandSimpleSong(simpleSong) {
  const {
    title,
    artist,
    year,
    genre = 'rock',
    key = 'C',
    tempo = 120,
    verseChords = ['C', 'Am', 'F', 'G'],
    chorusChords = ['F', 'C', 'G', 'Am'],
    complexity = 'simple',
    ...otherFields
  } = simpleSong;

  // Generate songId from title and artist
  const songId = `${title}-${artist}-${year}`
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  // Determine decade from year
  const decade = getDecadeFromYear(year);

  // Create basic sections
  const sections = {
    verse: {
      progression: verseChords,
      bars: verseChords.length,
      repetitions: 1,
      complexity,
      audioTimestamp: {
        start: "0:15",
        end: "0:45"
      }
    },
    chorus: {
      progression: chorusChords,
      bars: chorusChords.length,
      repetitions: 1,
      complexity,
      audioTimestamp: {
        start: "0:45",
        end: "1:15"
      }
    }
  };

  return {
    songId,
    title,
    artist,
    year,
    genre,
    decade,
    popularity: 'mainstream',
    key,
    tempo,
    sections,
    ...otherFields
  };
}

/**
 * Parse a CSV line handling quoted values
 * @param {string} line - CSV line to parse
 * @returns {Array} - Array of values
 */
function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  values.push(current.trim());
  return values;
}

/**
 * Detect data format from input
 * @param {*} data - Input data
 * @returns {string} - Detected format
 */
function detectFormat(data) {
  if (typeof data === 'string') {
    const trimmed = data.trim();
    if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
      return 'json';
    }
    if (trimmed.includes(',') && trimmed.includes('\n')) {
      return 'csv';
    }
  } else if (Array.isArray(data)) {
    return 'json';
  }
  
  return 'simple';
}

/**
 * Get decade string from year
 * @param {number} year - Year number
 * @returns {string} - Decade string
 */
function getDecadeFromYear(year) {
  if (year >= 2020) return '2020s';
  if (year >= 2010) return '2010s';
  if (year >= 2000) return '2000s';
  if (year >= 1990) return '90s';
  if (year >= 1980) return '80s';
  if (year >= 1970) return '70s';
  if (year >= 1960) return '60s';
  return '50s';
}

/**
 * Export songs to JSON format
 * @param {Array} songs - Array of song objects
 * @param {boolean} pretty - Whether to format JSON nicely
 * @returns {string} - JSON string
 */
export function exportToJSON(songs, pretty = true) {
  return JSON.stringify(songs, null, pretty ? 2 : 0);
}

/**
 * Export songs to CSV format
 * @param {Array} songs - Array of song objects
 * @returns {string} - CSV string
 */
export function exportToCSV(songs) {
  if (!songs.length) return '';
  
  // Get all unique keys from all songs
  const allKeys = new Set();
  songs.forEach(song => {
    Object.keys(song).forEach(key => allKeys.add(key));
  });
  
  const headers = Array.from(allKeys).sort();
  const csvRows = [headers.join(',')];
  
  songs.forEach(song => {
    const row = headers.map(header => {
      let value = song[header] || '';
      
      // Handle complex objects by JSON stringifying
      if (typeof value === 'object') {
        value = JSON.stringify(value);
      }
      
      // Escape quotes and wrap in quotes if contains comma
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        value = `"${value.replace(/"/g, '""')}"`;
      }
      
      return value;
    });
    
    csvRows.push(row.join(','));
  });
  
  return csvRows.join('\n');
}

/**
 * Merge imported songs with existing database, handling duplicates
 * @param {Array} existingSongs - Current song database
 * @param {Array} newSongs - Songs to merge
 * @param {string} duplicateStrategy - How to handle duplicates ('skip', 'replace', 'merge')
 * @returns {Object} - Merge result
 */
export function mergeSongs(existingSongs, newSongs, duplicateStrategy = 'skip') {
  const existingIds = new Set(existingSongs.map(song => song.songId));
  const results = {
    added: 0,
    skipped: 0,
    replaced: 0,
    errors: []
  };
  
  const mergedDatabase = [...existingSongs];
  
  newSongs.forEach(newSong => {
    if (existingIds.has(newSong.songId)) {
      switch (duplicateStrategy) {
        case 'skip':
          results.skipped++;
          break;
        case 'replace':
          const index = mergedDatabase.findIndex(song => song.songId === newSong.songId);
          mergedDatabase[index] = newSong;
          results.replaced++;
          break;
        case 'merge':
          const existingIndex = mergedDatabase.findIndex(song => song.songId === newSong.songId);
          mergedDatabase[existingIndex] = { ...mergedDatabase[existingIndex], ...newSong };
          results.replaced++;
          break;
        default:
          results.errors.push(`Unknown duplicate strategy: ${duplicateStrategy}`);
      }
    } else {
      mergedDatabase.push(newSong);
      existingIds.add(newSong.songId);
      results.added++;
    }
  });
  
  return {
    ...results,
    database: mergedDatabase,
    success: results.errors.length === 0
  };
}