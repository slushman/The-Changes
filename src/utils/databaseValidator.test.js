/**
 * Unit tests for database validator utilities
 * Tests validation runner and reporting functions
 */

import {
  validateCurrentDatabase,
  printValidationReport,
  isDatabaseValid,
  getDatabaseSummary
} from './databaseValidator.js';

// Mock console methods for testing
const originalConsoleLog = console.log;
const mockConsoleLog = jest.fn();

describe('Database Validator', () => {
  beforeEach(() => {
    console.log = mockConsoleLog;
    mockConsoleLog.mockClear();
  });

  afterEach(() => {
    console.log = originalConsoleLog;
  });

  describe('validateCurrentDatabase', () => {
    test('returns validation result object', () => {
      const result = validateCurrentDatabase();
      
      expect(typeof result).toBe('object');
      expect(result).toHaveProperty('isValid');
      expect(result).toHaveProperty('totalSongs');
      expect(result).toHaveProperty('validSongs');
      expect(result).toHaveProperty('errors');
      expect(result).toHaveProperty('stats');
      expect(result).toHaveProperty('timestamp');
      
      expect(typeof result.isValid).toBe('boolean');
      expect(typeof result.totalSongs).toBe('number');
      expect(typeof result.validSongs).toBe('number');
      expect(Array.isArray(result.errors)).toBe(true);
      expect(typeof result.stats).toBe('object');
      expect(typeof result.timestamp).toBe('string');
    });

    test('timestamp is valid ISO string', () => {
      const result = validateCurrentDatabase();
      const timestamp = new Date(result.timestamp);
      expect(timestamp instanceof Date).toBe(true);
      expect(!isNaN(timestamp.getTime())).toBe(true);
    });
  });

  describe('isDatabaseValid', () => {
    test('returns boolean', () => {
      const result = isDatabaseValid();
      expect(typeof result).toBe('boolean');
    });

    test('matches validateCurrentDatabase result', () => {
      const validationResult = validateCurrentDatabase();
      const booleanResult = isDatabaseValid();
      expect(booleanResult).toBe(validationResult.isValid);
    });
  });

  describe('getDatabaseSummary', () => {
    test('returns comprehensive summary', () => {
      const summary = getDatabaseSummary();
      
      expect(typeof summary).toBe('object');
      expect(summary).toHaveProperty('isValid');
      expect(summary).toHaveProperty('totalSongs');
      expect(summary).toHaveProperty('validSongs');
      expect(summary).toHaveProperty('invalidSongs');
      expect(summary).toHaveProperty('validationRate');
      expect(summary).toHaveProperty('genres');
      expect(summary).toHaveProperty('decades');
      expect(summary).toHaveProperty('totalSections');
      expect(summary).toHaveProperty('averageSectionsPerSong');
      expect(summary).toHaveProperty('genreCount');
      expect(summary).toHaveProperty('decadeCount');
      
      expect(Array.isArray(summary.genres)).toBe(true);
      expect(Array.isArray(summary.decades)).toBe(true);
      expect(typeof summary.totalSections).toBe('number');
      expect(typeof summary.averageSectionsPerSong).toBe('number');
      expect(typeof summary.genreCount).toBe('number');
      expect(typeof summary.decadeCount).toBe('number');
    });

    test('genres are sorted', () => {
      const summary = getDatabaseSummary();
      const sortedGenres = [...summary.genres].sort();
      expect(summary.genres).toEqual(sortedGenres);
    });

    test('decades are sorted', () => {
      const summary = getDatabaseSummary();
      const sortedDecades = [...summary.decades].sort();
      expect(summary.decades).toEqual(sortedDecades);
    });

    test('counts match array lengths', () => {
      const summary = getDatabaseSummary();
      expect(summary.genreCount).toBe(summary.genres.length);
      expect(summary.decadeCount).toBe(summary.decades.length);
    });

    test('average sections per song is reasonable', () => {
      const summary = getDatabaseSummary();
      expect(summary.averageSectionsPerSong).toBeGreaterThan(0);
      expect(summary.averageSectionsPerSong).toBeLessThan(20); // Reasonable upper bound
    });
  });

  describe('printValidationReport', () => {
    test('prints report without errors', () => {
      expect(() => {
        printValidationReport();
      }).not.toThrow();
      
      expect(mockConsoleLog).toHaveBeenCalled();
    });

    test('accepts custom validation result', () => {
      const customResult = {
        isValid: true,
        totalSongs: 5,
        validSongs: 5,
        errors: [],
        songErrors: {},
        stats: { validationRate: '100.0' },
        timestamp: new Date().toISOString()
      };
      
      expect(() => {
        printValidationReport(customResult);
      }).not.toThrow();
      
      expect(mockConsoleLog).toHaveBeenCalled();
    });

    test('includes validation status in output', () => {
      printValidationReport();
      
      const output = mockConsoleLog.mock.calls.map(call => call[0]).join(' ');
      expect(output).toMatch(/(✅ PASSED|❌ FAILED)/);
    });

    test('includes database stats in output', () => {
      printValidationReport();
      
      const output = mockConsoleLog.mock.calls.map(call => call[0]).join(' ');
      expect(output).toMatch(/Total Songs:/);
      expect(output).toMatch(/Valid Songs:/);
      expect(output).toMatch(/Validation Rate:/);
    });
  });
});

describe('Integration Tests', () => {
  test('current database should be valid', () => {
    const isValid = isDatabaseValid();
    const summary = getDatabaseSummary();
    
    // If database is invalid, print details for debugging
    if (!isValid) {
      console.log('\n--- DATABASE VALIDATION FAILED ---');
      printValidationReport();
      console.log('Summary:', summary);
    }
    
    expect(isValid).toBe(true);
    expect(summary.validationRate).toBe('100.0');
  });

  test('database has reasonable content', () => {
    const summary = getDatabaseSummary();
    
    expect(summary.totalSongs).toBeGreaterThanOrEqual(10);
    expect(summary.genreCount).toBeGreaterThanOrEqual(3);
    expect(summary.decadeCount).toBeGreaterThanOrEqual(3);
    expect(summary.totalSections).toBeGreaterThan(summary.totalSongs);
  });
});