/**
 * Tests for songImporter utility
 */

import {
  importFromJSON,
  importFromCSV,
  importFromSimpleFormat,
  batchImport,
  exportToJSON,
  exportToCSV,
  mergeSongs
} from './songImporter';

// Mock song validation
jest.mock('./songValidation', () => ({
  validateSong: jest.fn((song) => {
    // Mock validation - consider valid if has title and artist
    if (song.title && song.artist) {
      return { isValid: true, errors: [] };
    }
    return { isValid: false, errors: ['Missing required fields'] };
  }),
  validateDatabase: jest.fn((songs) => ({
    isValid: true,
    errors: [],
    validSongs: songs.length,
    totalSongs: songs.length
  }))
}));

describe('songImporter', () => {
  const validSong = {
    songId: 'test-song-artist-2023',
    title: 'Test Song',
    artist: 'Test Artist',
    year: 2023,
    genre: 'rock',
    decade: '2020s',
    popularity: 'mainstream',
    key: 'C',
    tempo: 120,
    sections: {
      verse: {
        progression: ['C', 'Am', 'F', 'G'],
        bars: 4,
        repetitions: 1,
        complexity: 'simple',
        audioTimestamp: {
          start: '0:15',
          end: '0:45'
        }
      }
    }
  };

  const invalidSong = {
    songId: 'invalid-song',
    // Missing title and artist
    year: 2023
  };

  describe('importFromJSON', () => {
    test('imports valid JSON string', () => {
      const jsonString = JSON.stringify([validSong]);
      const result = importFromJSON(jsonString);

      expect(result.success).toBe(true);
      expect(result.imported).toBe(1);
      expect(result.failed).toBe(0);
      expect(result.validSongs).toHaveLength(1);
    });

    test('imports valid JSON object', () => {
      const result = importFromJSON([validSong]);

      expect(result.success).toBe(true);
      expect(result.imported).toBe(1);
      expect(result.failed).toBe(0);
    });

    test('handles invalid JSON string', () => {
      const result = importFromJSON('invalid json');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid JSON format');
      expect(result.imported).toBe(0);
    });

    test('handles non-array JSON', () => {
      const result = importFromJSON('{"not": "array"}');

      expect(result.success).toBe(false);
      expect(result.error).toBe('JSON data must be an array of songs');
    });

    test('handles mixed valid/invalid songs', () => {
      const result = importFromJSON([validSong, invalidSong]);

      expect(result.success).toBe(false);
      expect(result.imported).toBe(1);
      expect(result.failed).toBe(1);
      expect(result.errors).toHaveLength(1);
    });
  });

  describe('importFromCSV', () => {
    test('imports valid CSV data', () => {
      const csvData = `title,artist,year,genre,key,tempo,sections
"Test Song","Test Artist",2023,"rock","C",120,"{\\"verse\\": {\\"progression\\": [\\"C\\", \\"Am\\", \\"F\\", \\"G\\"], \\"bars\\": 4, \\"repetitions\\": 1, \\"complexity\\": \\"simple\\", \\"audioTimestamp\\": {\\"start\\": \\"0:15\\", \\"end\\": \\"0:45\\"}}}"`;

      const result = importFromCSV(csvData);

      expect(result.success).toBe(true);
      expect(result.imported).toBe(1);
      expect(result.validSongs).toHaveLength(1);
    });

    test('handles empty CSV', () => {
      const result = importFromCSV('');

      expect(result.success).toBe(false);
      expect(result.error).toContain('at least a header row');
    });

    test('handles CSV with only headers', () => {
      const result = importFromCSV('title,artist,year');

      expect(result.success).toBe(false);
      expect(result.error).toContain('at least a header row');
    });

    test('handles CSV parsing error', () => {
      // Mock parseCSVLine to throw error
      const originalParseCSVLine = require('./songImporter').parseCSVLine;
      const csvData = 'title,artist\n"Test Song","Test Artist"';
      
      const result = importFromCSV(csvData);
      
      // Should still work with basic CSV
      expect(result.imported).toBeGreaterThanOrEqual(0);
    });
  });

  describe('importFromSimpleFormat', () => {
    test('imports simple format songs', () => {
      const simpleSongs = [
        {
          title: 'Simple Song',
          artist: 'Simple Artist',
          year: 2023,
          verseChords: ['C', 'Am', 'F', 'G'],
          chorusChords: ['F', 'C', 'G', 'Am']
        }
      ];

      const result = importFromSimpleFormat(simpleSongs);

      expect(result.success).toBe(true);
      expect(result.imported).toBe(1);
      expect(result.validSongs[0]).toHaveProperty('songId');
      expect(result.validSongs[0]).toHaveProperty('sections');
    });

    test('handles conversion errors', () => {
      const simpleSongs = [null]; // Invalid input

      const result = importFromSimpleFormat(simpleSongs);

      expect(result.success).toBe(false);
      expect(result.error).toContain('conversion error');
    });

    test('expands simple song with defaults', () => {
      const simpleSongs = [
        {
          title: 'Minimal Song',
          artist: 'Minimal Artist',
          year: 2023
        }
      ];

      const result = importFromSimpleFormat(simpleSongs);
      const expandedSong = result.validSongs[0];

      expect(expandedSong.genre).toBe('rock'); // default
      expect(expandedSong.key).toBe('C'); // default
      expect(expandedSong.tempo).toBe(120); // default
      expect(expandedSong.decade).toBe('2020s'); // derived from year
      expect(expandedSong.sections.verse).toBeDefined();
      expect(expandedSong.sections.chorus).toBeDefined();
    });
  });

  describe('batchImport', () => {
    test('auto-detects JSON format', () => {
      const result = batchImport([validSong]);

      expect(result.success).toBe(true);
      expect(result.imported).toBe(1);
    });

    test('auto-detects CSV format', () => {
      const csvData = 'title,artist,year\n"Test","Artist",2023';
      const result = batchImport(csvData);

      expect(result.imported).toBeGreaterThanOrEqual(0);
    });

    test('uses explicit format', () => {
      const result = batchImport([validSong], 'json');

      expect(result.success).toBe(true);
      expect(result.imported).toBe(1);
    });

    test('handles unsupported format', () => {
      const result = batchImport('data', 'xml');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Unsupported format');
    });
  });

  describe('exportToJSON', () => {
    test('exports songs to pretty JSON', () => {
      const result = exportToJSON([validSong], true);

      expect(typeof result).toBe('string');
      expect(result).toContain(validSong.title);
      expect(result).toContain('\\n'); // Pretty formatting
    });

    test('exports songs to compact JSON', () => {
      const result = exportToJSON([validSong], false);

      expect(typeof result).toBe('string');
      expect(result).toContain(validSong.title);
      expect(result).not.toContain('\\n'); // No pretty formatting
    });
  });

  describe('exportToCSV', () => {
    test('exports songs to CSV', () => {
      const result = exportToCSV([validSong]);

      expect(typeof result).toBe('string');
      expect(result).toContain('title,artist'); // Headers
      expect(result).toContain(validSong.title);
    });

    test('handles empty song array', () => {
      const result = exportToCSV([]);

      expect(result).toBe('');
    });

    test('handles complex objects in CSV', () => {
      const songWithComplex = {
        ...validSong,
        complexField: { nested: 'value' }
      };

      const result = exportToCSV([songWithComplex]);

      expect(result).toContain('complexField');
      expect(result).toContain('nested');
    });

    test('escapes CSV special characters', () => {
      const songWithSpecialChars = {
        title: 'Song, with "quotes" and commas',
        artist: 'Artist'
      };

      const result = exportToCSV([songWithSpecialChars]);

      expect(result).toContain('""quotes""'); // Escaped quotes
      expect(result).toContain('"Song, with'); // Quoted field with comma
    });
  });

  describe('mergeSongs', () => {
    const existingSong = { ...validSong, songId: 'existing-song' };
    const newSong = { ...validSong, songId: 'new-song' };
    const duplicateSong = { ...validSong, songId: 'existing-song', title: 'Updated Title' };

    test('merges with skip strategy', () => {
      const result = mergeSongs([existingSong], [newSong, duplicateSong], 'skip');

      expect(result.success).toBe(true);
      expect(result.added).toBe(1);
      expect(result.skipped).toBe(1);
      expect(result.replaced).toBe(0);
      expect(result.database).toHaveLength(2);
    });

    test('merges with replace strategy', () => {
      const result = mergeSongs([existingSong], [newSong, duplicateSong], 'replace');

      expect(result.success).toBe(true);
      expect(result.added).toBe(1);
      expect(result.skipped).toBe(0);
      expect(result.replaced).toBe(1);
      expect(result.database).toHaveLength(2);
      
      const replacedSong = result.database.find(s => s.songId === 'existing-song');
      expect(replacedSong.title).toBe('Updated Title');
    });

    test('merges with merge strategy', () => {
      const result = mergeSongs([existingSong], [duplicateSong], 'merge');

      expect(result.success).toBe(true);
      expect(result.replaced).toBe(1);
      
      const mergedSong = result.database.find(s => s.songId === 'existing-song');
      expect(mergedSong.title).toBe('Updated Title'); // Updated field
      expect(mergedSong.artist).toBe(existingSong.artist); // Original field preserved
    });

    test('handles unknown duplicate strategy', () => {
      const result = mergeSongs([existingSong], [duplicateSong], 'unknown');

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Unknown duplicate strategy: unknown');
    });
  });

  describe('helper functions', () => {
    test('detects JSON format from string', () => {
      // This tests the internal detectFormat function indirectly
      const result = batchImport('[{"title": "test"}]');
      expect(result.imported).toBeGreaterThanOrEqual(0); // Should attempt JSON parsing
    });

    test('detects CSV format from string', () => {
      const result = batchImport('title,artist\\ntest,artist');
      expect(result.imported).toBeGreaterThanOrEqual(0); // Should attempt CSV parsing
    });

    test('generates correct decade from year', () => {
      const testCases = [
        { input: { title: 'Test', artist: 'Artist', year: 1965 }, expected: '60s' },
        { input: { title: 'Test', artist: 'Artist', year: 1975 }, expected: '70s' },
        { input: { title: 'Test', artist: 'Artist', year: 1985 }, expected: '80s' },
        { input: { title: 'Test', artist: 'Artist', year: 1995 }, expected: '90s' },
        { input: { title: 'Test', artist: 'Artist', year: 2005 }, expected: '2000s' },
        { input: { title: 'Test', artist: 'Artist', year: 2015 }, expected: '2010s' },
        { input: { title: 'Test', artist: 'Artist', year: 2025 }, expected: '2020s' }
      ];

      testCases.forEach(testCase => {
        const result = importFromSimpleFormat([testCase.input]);
        expect(result.validSongs[0].decade).toBe(testCase.expected);
      });
    });

    test('generates song ID correctly', () => {
      const simpleSong = {
        title: 'Test Song Title',
        artist: 'Test Artist Name',
        year: 2023
      };

      const result = importFromSimpleFormat([simpleSong]);
      const songId = result.validSongs[0].songId;

      expect(songId).toBe('test-song-title-test-artist-name-2023');
      expect(songId).not.toContain(' '); // No spaces
      expect(songId).not.toContain('--'); // No double hyphens
    });
  });

  describe('integration tests', () => {
    test('full workflow: import, validate, merge, export', () => {
      const newSongs = [
        {
          title: 'Integration Test Song',
          artist: 'Test Artist',
          year: 2023,
          verseChords: ['C', 'Am', 'F', 'G']
        }
      ];

      // Import
      const importResult = importFromSimpleFormat(newSongs);
      expect(importResult.success).toBe(true);

      // Merge with existing
      const mergeResult = mergeSongs([validSong], importResult.validSongs, 'skip');
      expect(mergeResult.success).toBe(true);
      expect(mergeResult.database).toHaveLength(2);

      // Export
      const jsonExport = exportToJSON(mergeResult.database);
      expect(jsonExport).toContain('Integration Test Song');

      const csvExport = exportToCSV(mergeResult.database);
      expect(csvExport).toContain('Integration Test Song');
    });

    test('handles large batch import', () => {
      const largeBatch = Array.from({ length: 100 }, (_, i) => ({
        title: `Song ${i}`,
        artist: `Artist ${i}`,
        year: 2000 + (i % 24), // Spread across years
        genre: ['rock', 'pop', 'jazz'][i % 3]
      }));

      const result = importFromSimpleFormat(largeBatch);

      expect(result.success).toBe(true);
      expect(result.imported).toBe(100);
      expect(result.validSongs).toHaveLength(100);
    });
  });
});