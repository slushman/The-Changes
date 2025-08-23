/**
 * Unit tests for song database structure and utility functions
 * Tests the actual song data and database operations
 */

import songDatabase, {
  getDatabaseStats,
  getSongById,
  getSongsByGenre,
  getSongsByDecade
} from './songDatabase.js';
import { validateDatabase } from '../utils/songValidation.js';

describe('Song Database', () => {
  test('database is an array', () => {
    expect(Array.isArray(songDatabase)).toBe(true);
  });

  test('database contains songs', () => {
    expect(songDatabase.length).toBeGreaterThan(0);
  });

  test('all songs in database are valid', () => {
    const validation = validateDatabase(songDatabase);
    if (!validation.isValid) {
      console.error('Database validation errors:', validation.errors);
      console.error('Song errors:', validation.songErrors);
    }
    expect(validation.isValid).toBe(true);
  });

  test('all songs have unique IDs', () => {
    const songIds = songDatabase.map(song => song.songId);
    const uniqueIds = new Set(songIds);
    expect(uniqueIds.size).toBe(songIds.length);
  });

  test('all songs have required fields', () => {
    const requiredFields = [
      'songId', 'title', 'artist', 'year', 'genre', 
      'decade', 'popularity', 'key', 'tempo', 'sections'
    ];
    
    songDatabase.forEach(song => {
      requiredFields.forEach(field => {
        expect(song).toHaveProperty(field);
        expect(song[field]).toBeDefined();
        expect(song[field]).not.toBe('');
      });
    });
  });

  test('all songs have at least one section', () => {
    songDatabase.forEach(song => {
      expect(typeof song.sections).toBe('object');
      expect(Object.keys(song.sections).length).toBeGreaterThan(0);
    });
  });

  test('all sections have required properties', () => {
    const requiredSectionFields = ['progression', 'bars', 'repetitions', 'complexity'];
    
    songDatabase.forEach(song => {
      Object.values(song.sections).forEach(section => {
        requiredSectionFields.forEach(field => {
          expect(section).toHaveProperty(field);
          expect(section[field]).toBeDefined();
        });
        
        // Progression should be non-empty array
        expect(Array.isArray(section.progression)).toBe(true);
        expect(section.progression.length).toBeGreaterThan(0);
        
        // Bars and repetitions should be positive integers
        expect(typeof section.bars).toBe('number');
        expect(section.bars).toBeGreaterThan(0);
        expect(typeof section.repetitions).toBe('number');
        expect(section.repetitions).toBeGreaterThan(0);
      });
    });
  });

  test('years are within reasonable range', () => {
    const currentYear = new Date().getFullYear();
    songDatabase.forEach(song => {
      expect(song.year).toBeGreaterThanOrEqual(1900);
      expect(song.year).toBeLessThanOrEqual(currentYear);
    });
  });

  test('tempos are within reasonable range', () => {
    songDatabase.forEach(song => {
      expect(song.tempo).toBeGreaterThan(0);
      expect(song.tempo).toBeLessThan(300);
    });
  });
});

describe('Database Utility Functions', () => {
  describe('getDatabaseStats', () => {
    test('returns correct statistics', () => {
      const stats = getDatabaseStats();
      
      expect(typeof stats).toBe('object');
      expect(typeof stats.totalSongs).toBe('number');
      expect(Array.isArray(stats.genres)).toBe(true);
      expect(Array.isArray(stats.decades)).toBe(true);
      expect(typeof stats.totalSections).toBe('number');
      
      expect(stats.totalSongs).toBe(songDatabase.length);
      expect(stats.totalSections).toBeGreaterThan(0);
      expect(stats.genres.length).toBeGreaterThan(0);
      expect(stats.decades.length).toBeGreaterThan(0);
    });

    test('genres are unique', () => {
      const stats = getDatabaseStats();
      const uniqueGenres = new Set(stats.genres);
      expect(uniqueGenres.size).toBe(stats.genres.length);
    });

    test('decades are unique', () => {
      const stats = getDatabaseStats();
      const uniqueDecades = new Set(stats.decades);
      expect(uniqueDecades.size).toBe(stats.decades.length);
    });
  });

  describe('getSongById', () => {
    test('returns correct song for valid ID', () => {
      const firstSong = songDatabase[0];
      const foundSong = getSongById(firstSong.songId);
      
      expect(foundSong).toBeDefined();
      expect(foundSong.songId).toBe(firstSong.songId);
      expect(foundSong.title).toBe(firstSong.title);
    });

    test('returns undefined for invalid ID', () => {
      const foundSong = getSongById('non-existent-id');
      expect(foundSong).toBeUndefined();
    });

    test('handles null/undefined input', () => {
      expect(getSongById(null)).toBeUndefined();
      expect(getSongById(undefined)).toBeUndefined();
    });
  });

  describe('getSongsByGenre', () => {
    test('returns songs matching genre', () => {
      const stats = getDatabaseStats();
      const firstGenre = stats.genres[0];
      const songs = getSongsByGenre(firstGenre);
      
      expect(Array.isArray(songs)).toBe(true);
      expect(songs.length).toBeGreaterThan(0);
      
      songs.forEach(song => {
        expect(song.genre.toLowerCase()).toBe(firstGenre.toLowerCase());
      });
    });

    test('returns empty array for non-existent genre', () => {
      const songs = getSongsByGenre('non-existent-genre');
      expect(Array.isArray(songs)).toBe(true);
      expect(songs.length).toBe(0);
    });

    test('is case insensitive', () => {
      const stats = getDatabaseStats();
      if (stats.genres.length > 0) {
        const genre = stats.genres[0];
        const songsLower = getSongsByGenre(genre.toLowerCase());
        const songsUpper = getSongsByGenre(genre.toUpperCase());
        
        expect(songsLower.length).toBe(songsUpper.length);
      }
    });
  });

  describe('getSongsByDecade', () => {
    test('returns songs matching decade', () => {
      const stats = getDatabaseStats();
      const firstDecade = stats.decades[0];
      const songs = getSongsByDecade(firstDecade);
      
      expect(Array.isArray(songs)).toBe(true);
      expect(songs.length).toBeGreaterThan(0);
      
      songs.forEach(song => {
        expect(song.decade).toBe(firstDecade);
      });
    });

    test('returns empty array for non-existent decade', () => {
      const songs = getSongsByDecade('50s');
      expect(Array.isArray(songs)).toBe(true);
      expect(songs.length).toBe(0);
    });
  });
});

describe('Database Content Validation', () => {
  test('contains diverse genres', () => {
    const stats = getDatabaseStats();
    // Should have at least 3 different genres
    expect(stats.genres.length).toBeGreaterThanOrEqual(3);
    
    // Check for some expected genres
    const genresLower = stats.genres.map(g => g.toLowerCase());
    expect(genresLower.some(g => ['rock', 'pop', 'alternative'].includes(g))).toBe(true);
  });

  test('spans multiple decades', () => {
    const stats = getDatabaseStats();
    // Should have songs from at least 3 different decades
    expect(stats.decades.length).toBeGreaterThanOrEqual(3);
  });

  test('has songs with different section types', () => {
    const allSectionTypes = new Set();
    
    songDatabase.forEach(song => {
      Object.keys(song.sections).forEach(sectionName => {
        allSectionTypes.add(sectionName);
      });
    });
    
    // Should have at least verse and chorus
    expect(allSectionTypes.has('verse')).toBe(true);
    expect(allSectionTypes.has('chorus')).toBe(true);
    
    // Should have variety of section types
    expect(allSectionTypes.size).toBeGreaterThanOrEqual(3);
  });

  test('has songs with different complexity levels', () => {
    const complexityLevels = new Set();
    
    songDatabase.forEach(song => {
      Object.values(song.sections).forEach(section => {
        complexityLevels.add(section.complexity);
      });
    });
    
    // Should have at least simple complexity
    expect(complexityLevels.has('simple')).toBe(true);
    
    // Ideally should have multiple complexity levels
    expect(complexityLevels.size).toBeGreaterThan(0);
  });

  test('has audio timestamps for sections', () => {
    let sectionsWithTimestamps = 0;
    let totalSections = 0;
    
    songDatabase.forEach(song => {
      Object.values(song.sections).forEach(section => {
        totalSections++;
        if (section.audioTimestamp && 
            section.audioTimestamp.start && 
            section.audioTimestamp.end) {
          sectionsWithTimestamps++;
        }
      });
    });
    
    // Most sections should have timestamps
    const timestampRatio = sectionsWithTimestamps / totalSections;
    expect(timestampRatio).toBeGreaterThan(0.5); // At least 50%
  });
});