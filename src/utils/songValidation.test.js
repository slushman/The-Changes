/**
 * Unit tests for song validation utilities
 * Tests all validation functions and edge cases
 */

import {
  isValidChord,
  isValidTimestamp,
  validateSection,
  validateSong,
  validateDatabase,
  getDatabaseValidationStats,
  VALID_GENRES,
  VALID_DECADES,
  VALID_COMPLEXITY_LEVELS
} from './songValidation.js';

// Test data
const validChords = [
  'C', 'F#', 'Bb', 'Am', 'F#m', 'Bbm',
  'C7', 'Cmaj7', 'Cm7', 'CmMaj7', 'Cdim7', 'Cm7b5',
  'C9', 'Cmaj9', 'Cm9', 'C11', 'C13',
  'Csus2', 'Csus4', 'Cdim', 'Caug',
  'C/E', 'Am/C', 'F#m7/A', 'Gmaj7/B'
];

const invalidChords = [
  '', 'H', 'Cb#', 'C#b', 'Cmajor', 'C-minor',
  'C7sus2sus4', 'X', '123', 'C/', '/C',
  'C/H', 'Am/X'
];

const validTimestamps = ['0:00', '1:23', '12:45', '0:59', '10:00'];
const invalidTimestamps = ['', '1:60', '1:5', '1', ':30', '1:30:45', 'abc'];

const validSection = {
  progression: ['C', 'Am', 'F', 'G'],
  bars: 4,
  repetitions: 2,
  complexity: 'simple',
  audioTimestamp: {
    start: '0:30',
    end: '1:00'
  }
};

const validSong = {
  songId: 'test-song-2023',
  title: 'Test Song',
  artist: 'Test Artist',
  album: 'Test Album',
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
      repetitions: 2,
      complexity: 'simple',
      audioTimestamp: {
        start: '0:30',
        end: '1:00'
      }
    },
    chorus: {
      progression: ['F', 'C', 'G', 'Am'],
      bars: 4,
      repetitions: 1,
      complexity: 'simple',
      audioTimestamp: {
        start: '1:00',
        end: '1:30'
      }
    }
  },
  spotifyId: 'test-spotify-id',
  youtubeId: 'test-youtube-id'
};

describe('isValidChord', () => {
  test('validates correct chord names', () => {
    validChords.forEach(chord => {
      expect(isValidChord(chord)).toBe(true);
    });
  });

  test('rejects invalid chord names', () => {
    invalidChords.forEach(chord => {
      expect(isValidChord(chord)).toBe(false);
    });
  });

  test('handles non-string inputs', () => {
    expect(isValidChord(null)).toBe(false);
    expect(isValidChord(undefined)).toBe(false);
    expect(isValidChord(123)).toBe(false);
    expect(isValidChord({})).toBe(false);
    expect(isValidChord([])).toBe(false);
  });
});

describe('isValidTimestamp', () => {
  test('validates correct timestamp formats', () => {
    validTimestamps.forEach(timestamp => {
      expect(isValidTimestamp(timestamp)).toBe(true);
    });
  });

  test('rejects invalid timestamp formats', () => {
    invalidTimestamps.forEach(timestamp => {
      expect(isValidTimestamp(timestamp)).toBe(false);
    });
  });

  test('handles non-string inputs', () => {
    expect(isValidTimestamp(null)).toBe(false);
    expect(isValidTimestamp(undefined)).toBe(false);
    expect(isValidTimestamp(123)).toBe(false);
  });
});

describe('validateSection', () => {
  test('validates a correct section', () => {
    const result = validateSection(validSection, 'verse');
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('rejects invalid section names', () => {
    const result = validateSection(validSection, 'invalid-section');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Invalid section name: invalid-section');
  });

  test('rejects sections with invalid progressions', () => {
    const invalidSection = {
      ...validSection,
      progression: ['C', 'InvalidChord', 'F']
    };
    const result = validateSection(invalidSection, 'verse');
    expect(result.isValid).toBe(false);
    expect(result.errors.some(error => error.includes('Invalid chord'))).toBe(true);
  });

  test('rejects sections with empty progressions', () => {
    const invalidSection = {
      ...validSection,
      progression: []
    };
    const result = validateSection(invalidSection, 'verse');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Progression cannot be empty');
  });

  test('rejects sections with invalid bars', () => {
    const invalidSection = {
      ...validSection,
      bars: 0
    };
    const result = validateSection(invalidSection, 'verse');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Bars must be a positive integer');
  });

  test('rejects sections with invalid repetitions', () => {
    const invalidSection = {
      ...validSection,
      repetitions: -1
    };
    const result = validateSection(invalidSection, 'verse');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Repetitions must be a positive integer');
  });

  test('rejects sections with invalid complexity', () => {
    const invalidSection = {
      ...validSection,
      complexity: 'invalid'
    };
    const result = validateSection(invalidSection, 'verse');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Invalid complexity level: invalid');
  });

  test('rejects sections with invalid timestamps', () => {
    const invalidSection = {
      ...validSection,
      audioTimestamp: {
        start: '1:30',
        end: '1:00' // end before start
      }
    };
    const result = validateSection(invalidSection, 'verse');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Start timestamp must be before end timestamp');
  });

  test('handles null or undefined sections', () => {
    const result = validateSection(null, 'verse');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Section must be an object');
  });
});

describe('validateSong', () => {
  test('validates a correct song', () => {
    const result = validateSong(validSong);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('rejects songs missing required fields', () => {
    const invalidSong = { ...validSong };
    delete invalidSong.title;
    const result = validateSong(invalidSong);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(error => error.includes('title'))).toBe(true);
  });

  test('rejects songs with invalid genre', () => {
    const invalidSong = {
      ...validSong,
      genre: 'invalid-genre'
    };
    const result = validateSong(invalidSong);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Invalid genre: invalid-genre');
  });

  test('rejects songs with invalid decade', () => {
    const invalidSong = {
      ...validSong,
      decade: '1950s'
    };
    const result = validateSong(invalidSong);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Invalid decade: 1950s');
  });

  test('rejects songs with invalid year', () => {
    const invalidSong = {
      ...validSong,
      year: 1800
    };
    const result = validateSong(invalidSong);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Year must be a number between 1900 and current year');
  });

  test('rejects songs with invalid tempo', () => {
    const invalidSong = {
      ...validSong,
      tempo: 0
    };
    const result = validateSong(invalidSong);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Tempo must be a number between 1 and 300 BPM');
  });

  test('rejects songs with no sections', () => {
    const invalidSong = {
      ...validSong,
      sections: {}
    };
    const result = validateSong(invalidSong);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Song must have at least one section');
  });

  test('rejects songs with invalid sections', () => {
    const invalidSong = {
      ...validSong,
      sections: {
        verse: {
          ...validSection,
          progression: ['InvalidChord']
        }
      }
    };
    const result = validateSong(invalidSong);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(error => error.includes('Invalid chord'))).toBe(true);
  });

  test('handles null or undefined songs', () => {
    const result = validateSong(null);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Song must be an object');
  });
});

describe('validateDatabase', () => {
  test('validates a correct database', () => {
    const database = [validSong];
    const result = validateDatabase(database);
    expect(result.isValid).toBe(true);
    expect(result.validSongs).toBe(1);
    expect(result.totalSongs).toBe(1);
    expect(result.errors).toHaveLength(0);
  });

  test('detects duplicate song IDs', () => {
    const database = [validSong, validSong];
    const result = validateDatabase(database);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(`Duplicate song ID: ${validSong.songId}`);
  });

  test('handles mixed valid and invalid songs', () => {
    const invalidSong = { ...validSong };
    delete invalidSong.title;
    const database = [validSong, invalidSong];
    const result = validateDatabase(database);
    expect(result.isValid).toBe(false);
    expect(result.validSongs).toBe(1);
    expect(result.totalSongs).toBe(2);
  });

  test('handles empty database', () => {
    const result = validateDatabase([]);
    expect(result.isValid).toBe(true);
    expect(result.validSongs).toBe(0);
    expect(result.totalSongs).toBe(0);
  });

  test('rejects non-array input', () => {
    const result = validateDatabase('not an array');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Database must be an array');
  });
});

describe('getDatabaseValidationStats', () => {
  test('calculates correct statistics', () => {
    const database = [validSong];
    const stats = getDatabaseValidationStats(database);
    expect(stats.totalSongs).toBe(1);
    expect(stats.validSongs).toBe(1);
    expect(stats.invalidSongs).toBe(0);
    expect(stats.validationRate).toBe('100.0');
    expect(stats.hasErrors).toBe(false);
  });

  test('handles empty database', () => {
    const stats = getDatabaseValidationStats([]);
    expect(stats.totalSongs).toBe(0);
    expect(stats.validSongs).toBe(0);
    expect(stats.validationRate).toBe('0');
  });
});

describe('Validation constants', () => {
  test('VALID_GENRES contains expected genres', () => {
    expect(VALID_GENRES).toContain('rock');
    expect(VALID_GENRES).toContain('pop');
    expect(VALID_GENRES).toContain('jazz');
    expect(VALID_GENRES).not.toContain('invalid-genre');
  });

  test('VALID_DECADES contains expected decades', () => {
    expect(VALID_DECADES).toContain('70s');
    expect(VALID_DECADES).toContain('80s');
    expect(VALID_DECADES).toContain('90s');
    expect(VALID_DECADES).not.toContain('50s');
  });

  test('VALID_COMPLEXITY_LEVELS contains expected levels', () => {
    expect(VALID_COMPLEXITY_LEVELS).toContain('simple');
    expect(VALID_COMPLEXITY_LEVELS).toContain('intermediate');
    expect(VALID_COMPLEXITY_LEVELS).toContain('complex');
    expect(VALID_COMPLEXITY_LEVELS).not.toContain('expert');
  });
});