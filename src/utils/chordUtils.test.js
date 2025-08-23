/**
 * Unit tests for chord utilities
 * Tests chord parsing, normalization, and music theory functions
 */

import {
  parseChord,
  normalizeNote,
  normalizeChord,
  normalizeChordProgression,
  transposeChord,
  transposeProgression,
  getInterval,
  getEnharmonicEquivalents,
  analyzeKey,
  parseProgressionInput,
  getChordSuggestions
} from './chordUtils.js';

describe('parseChord', () => {
  test('parses basic major chords', () => {
    const result = parseChord('C');
    expect(result).toEqual({
      original: 'C',
      root: 'C',
      quality: 'maj',
      bass: null,
      isSlashChord: false
    });
  });

  test('parses minor chords', () => {
    const result = parseChord('Am');
    expect(result).toEqual({
      original: 'Am',
      root: 'A',
      quality: 'm',
      bass: null,
      isSlashChord: false
    });
  });

  test('parses seventh chords', () => {
    const result = parseChord('Cmaj7');
    expect(result).toEqual({
      original: 'Cmaj7',
      root: 'C',
      quality: 'maj7',
      bass: null,
      isSlashChord: false
    });
  });

  test('parses slash chords', () => {
    const result = parseChord('C/E');
    expect(result).toEqual({
      original: 'C/E',
      root: 'C',
      quality: 'maj',
      bass: 'E',
      isSlashChord: true
    });
  });

  test('parses complex slash chords', () => {
    const result = parseChord('Am7/G');
    expect(result).toEqual({
      original: 'Am7/G',
      root: 'A',
      quality: 'm7',
      bass: 'G',
      isSlashChord: true
    });
  });

  test('parses chords with sharps and flats', () => {
    expect(parseChord('F#')).toMatchObject({ root: 'F#', quality: 'maj' });
    expect(parseChord('Bb')).toMatchObject({ root: 'A#', quality: 'maj' }); // Normalized to sharp
    expect(parseChord('C#m')).toMatchObject({ root: 'C#', quality: 'm' });
  });

  test('handles case insensitive input', () => {
    expect(parseChord('c')).toMatchObject({ root: 'C', quality: 'maj' });
    expect(parseChord('am')).toMatchObject({ root: 'A', quality: 'm' });
    expect(parseChord('FMAJ7')).toMatchObject({ root: 'F', quality: 'maj7' });
  });

  test('handles various chord quality notations', () => {
    expect(parseChord('CM7')).toMatchObject({ quality: 'maj7' });
    expect(parseChord('C-')).toMatchObject({ quality: 'm' });
    expect(parseChord('C°')).toMatchObject({ quality: 'dim' });
    expect(parseChord('C+')).toMatchObject({ quality: 'aug' });
  });

  test('returns null for invalid chords', () => {
    expect(parseChord('')).toBeNull();
    expect(parseChord('H')).toBeNull();
    expect(parseChord('invalid')).toBeNull();
    expect(parseChord(null)).toBeNull();
    expect(parseChord(undefined)).toBeNull();
  });

  test('handles whitespace', () => {
    expect(parseChord(' C ')).toMatchObject({ root: 'C', quality: 'maj' });
    expect(parseChord('  Am7  ')).toMatchObject({ root: 'A', quality: 'm7' });
  });
});

describe('normalizeNote', () => {
  test('normalizes note names to sharp notation', () => {
    expect(normalizeNote('Db')).toBe('C#');
    expect(normalizeNote('Eb')).toBe('D#');
    expect(normalizeNote('Gb')).toBe('F#');
    expect(normalizeNote('Ab')).toBe('G#');
    expect(normalizeNote('Bb')).toBe('A#');
  });

  test('keeps already normalized notes', () => {
    expect(normalizeNote('C')).toBe('C');
    expect(normalizeNote('F#')).toBe('F#');
    expect(normalizeNote('G')).toBe('G');
  });

  test('handles case insensitive input', () => {
    expect(normalizeNote('c')).toBe('C');
    expect(normalizeNote('f#')).toBe('F#');
    expect(normalizeNote('bb')).toBe('A#');
  });

  test('returns null for invalid notes', () => {
    expect(normalizeNote('H')).toBeNull();
    expect(normalizeNote('invalid')).toBeNull();
    expect(normalizeNote('')).toBeNull();
    expect(normalizeNote(null)).toBeNull();
  });
});

describe('normalizeChord', () => {
  test('normalizes chord notation', () => {
    expect(normalizeChord('Cmaj')).toBe('C');
    expect(normalizeChord('Am')).toBe('Am');
    expect(normalizeChord('C7')).toBe('C7');
    expect(normalizeChord('Cmaj7')).toBe('Cmaj7');
  });

  test('normalizes enharmonic equivalents', () => {
    expect(normalizeChord('Db')).toBe('C#');
    expect(normalizeChord('Bbm')).toBe('A#m');
  });

  test('normalizes slash chords', () => {
    expect(normalizeChord('C/E')).toBe('C/E');
    expect(normalizeChord('Am/C')).toBe('Am/C');
    expect(normalizeChord('Db/F')).toBe('C#/F');
  });

  test('returns null for invalid chords', () => {
    expect(normalizeChord('invalid')).toBeNull();
    expect(normalizeChord('')).toBeNull();
    expect(normalizeChord(null)).toBeNull();
  });
});

describe('normalizeChordProgression', () => {
  test('normalizes array of chords', () => {
    const input = ['C', 'Am', 'F', 'G'];
    const result = normalizeChordProgression(input);
    expect(result).toEqual(['C', 'Am', 'F', 'G']);
  });

  test('normalizes and filters invalid chords', () => {
    const input = ['C', 'invalid', 'Am', '', 'F'];
    const result = normalizeChordProgression(input);
    expect(result).toEqual(['C', 'Am', 'F']);
  });

  test('normalizes enharmonic chords', () => {
    const input = ['Db', 'Bb', 'Eb'];
    const result = normalizeChordProgression(input);
    expect(result).toEqual(['C#', 'A#', 'D#']);
  });

  test('handles empty array', () => {
    expect(normalizeChordProgression([])).toEqual([]);
  });

  test('handles non-array input', () => {
    expect(normalizeChordProgression(null)).toEqual([]);
    expect(normalizeChordProgression('not an array')).toEqual([]);
  });
});

describe('transposeChord', () => {
  test('transposes chord up by semitones', () => {
    expect(transposeChord('C', 2)).toBe('D');
    expect(transposeChord('C', 7)).toBe('G');
    expect(transposeChord('Am', 3)).toBe('Cm');
  });

  test('transposes chord down by semitones', () => {
    expect(transposeChord('C', -2)).toBe('A#');
    expect(transposeChord('G', -7)).toBe('C');
  });

  test('handles wrapping around octave', () => {
    expect(transposeChord('C', 12)).toBe('C'); // Full octave
    expect(transposeChord('C', 13)).toBe('C#'); // Octave + 1
    expect(transposeChord('C', -1)).toBe('B');
  });

  test('transposes complex chords', () => {
    expect(transposeChord('Cmaj7', 2)).toBe('Dmaj7');
    expect(transposeChord('Am7', 5)).toBe('Dm7');
  });

  test('transposes slash chords', () => {
    expect(transposeChord('C/E', 2)).toBe('D/F#');
    expect(transposeChord('Am/C', 3)).toBe('Cm/D#');
  });

  test('returns null for invalid input', () => {
    expect(transposeChord('invalid', 2)).toBeNull();
    expect(transposeChord(null, 2)).toBeNull();
  });
});

describe('transposeProgression', () => {
  test('transposes entire progression', () => {
    const input = ['C', 'Am', 'F', 'G'];
    const result = transposeProgression(input, 2);
    expect(result).toEqual(['D', 'Bm', 'G', 'A']);
  });

  test('filters out invalid chords after transposition', () => {
    const input = ['C', 'invalid', 'Am'];
    const result = transposeProgression(input, 2);
    expect(result).toEqual(['D', 'Bm']);
  });

  test('handles empty progression', () => {
    expect(transposeProgression([], 2)).toEqual([]);
  });

  test('handles non-array input', () => {
    expect(transposeProgression(null, 2)).toEqual([]);
  });
});

describe('getInterval', () => {
  test('calculates intervals between notes', () => {
    expect(getInterval('C', 'D')).toBe(2);
    expect(getInterval('C', 'G')).toBe(7);
    expect(getInterval('C', 'C')).toBe(0);
    expect(getInterval('G', 'C')).toBe(5); // G to C is 5 semitones up
  });

  test('handles enharmonic equivalents', () => {
    expect(getInterval('C', 'Db')).toBe(1);
    expect(getInterval('C', 'C#')).toBe(1);
  });

  test('returns null for invalid notes', () => {
    expect(getInterval('C', 'invalid')).toBeNull();
    expect(getInterval('invalid', 'C')).toBeNull();
  });
});

describe('getEnharmonicEquivalents', () => {
  test('finds enharmonic equivalents', () => {
    const equivalents = getEnharmonicEquivalents('C#');
    expect(equivalents).toContain('Db');
  });

  test('finds equivalents for complex chords', () => {
    const equivalents = getEnharmonicEquivalents('C#m7');
    expect(equivalents).toContain('Dbm7');
  });

  test('returns empty array for chords with no common enharmonic equivalent', () => {
    const equivalents = getEnharmonicEquivalents('C');
    expect(equivalents).toEqual([]);
  });

  test('handles invalid input', () => {
    expect(getEnharmonicEquivalents('invalid')).toEqual([]);
  });
});

describe('analyzeKey', () => {
  test('analyzes major key progressions', () => {
    const progression = ['C', 'Am', 'F', 'G'];
    const result = analyzeKey(progression);
    
    expect(result).toHaveProperty('likelyKeys');
    expect(result).toHaveProperty('confidence');
    expect(Array.isArray(result.likelyKeys)).toBe(true);
    expect(result.likelyKeys.length).toBeGreaterThan(0);
    
    // Should suggest C major as likely key
    const topKey = result.likelyKeys[0];
    expect(['C', 'Am'].includes(topKey.key)).toBe(true);
  });

  test('analyzes minor key progressions', () => {
    const progression = ['Am', 'F', 'C', 'G'];
    const result = analyzeKey(progression);
    
    expect(result.likelyKeys.length).toBeGreaterThan(0);
    // Could be A minor or C major
  });

  test('handles empty progression', () => {
    const result = analyzeKey([]);
    expect(result.likelyKeys).toEqual([]);
    expect(result.confidence).toBe(0);
  });

  test('handles single chord', () => {
    const result = analyzeKey(['C']);
    expect(result.likelyKeys.length).toBeGreaterThan(0);
  });

  test('returns confidence scores', () => {
    const progression = ['C', 'Am', 'F', 'G'];
    const result = analyzeKey(progression);
    
    result.likelyKeys.forEach(key => {
      expect(key).toHaveProperty('confidence');
      expect(typeof key.confidence).toBe('number');
      expect(key.confidence).toBeGreaterThanOrEqual(0);
      expect(key.confidence).toBeLessThanOrEqual(1);
    });
  });
});

describe('parseProgressionInput', () => {
  test('parses space-separated chords', () => {
    const result = parseProgressionInput('C Am F G');
    expect(result).toEqual(['C', 'Am', 'F', 'G']);
  });

  test('parses comma-separated chords', () => {
    const result = parseProgressionInput('C, Am, F, G');
    expect(result).toEqual(['C', 'Am', 'F', 'G']);
  });

  test('parses dash-separated chords', () => {
    const result = parseProgressionInput('C - Am - F - G');
    expect(result).toEqual(['C', 'Am', 'F', 'G']);
  });

  test('parses mixed separators', () => {
    const result = parseProgressionInput('C, Am - F G');
    expect(result).toEqual(['C', 'Am', 'F', 'G']);
  });

  test('handles extra whitespace', () => {
    const result = parseProgressionInput('  C   Am  F   G  ');
    expect(result).toEqual(['C', 'Am', 'F', 'G']);
  });

  test('filters invalid chords', () => {
    const result = parseProgressionInput('C invalid Am F');
    expect(result).toEqual(['C', 'Am', 'F']);
  });

  test('handles empty input', () => {
    expect(parseProgressionInput('')).toEqual([]);
    expect(parseProgressionInput('   ')).toEqual([]);
    expect(parseProgressionInput(null)).toEqual([]);
  });
});

describe('getChordSuggestions', () => {
  test('suggests chords based on partial input', () => {
    const suggestions = getChordSuggestions('C');
    expect(suggestions.length).toBeGreaterThan(0);
    expect(suggestions).toContain('C');
    expect(suggestions).toContain('Cm');
    expect(suggestions).toContain('C7');
  });

  test('suggests chords with sharps and flats', () => {
    const suggestions = getChordSuggestions('F#');
    expect(suggestions).toContain('F#');
    expect(suggestions).toContain('F#m');
  });

  test('limits number of suggestions', () => {
    const suggestions = getChordSuggestions('C', 3);
    expect(suggestions.length).toBeLessThanOrEqual(3);
  });

  test('handles partial chord quality input', () => {
    const suggestions = getChordSuggestions('Cm');
    expect(suggestions).toContain('Cm');
    expect(suggestions).toContain('Cm7');
  });

  test('handles empty or invalid input', () => {
    expect(getChordSuggestions('')).toEqual([]);
    expect(getChordSuggestions(null)).toEqual([]);
  });

  test('returns suggestions in logical order', () => {
    const suggestions = getChordSuggestions('C');
    // Basic chord should come before extensions
    const cIndex = suggestions.indexOf('C');
    const c7Index = suggestions.indexOf('C7');
    if (cIndex !== -1 && c7Index !== -1) {
      expect(cIndex).toBeLessThan(c7Index);
    }
  });
});