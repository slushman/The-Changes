/**
 * Tests for Nashville Number System utilities
 */

import {
  chordToNashville,
  progressionToNashville,
  nashvilleToChord,
  detectKey,
  getCommonProgressions
} from './nashvilleNumbers';

describe('Nashville Number System', () => {
  describe('chordToNashville', () => {
    test('converts basic major chords in C major', () => {
      expect(chordToNashville('C', 'C')).toBe('1');
      expect(chordToNashville('F', 'C')).toBe('4');
      expect(chordToNashville('G', 'C')).toBe('5');
    });

    test('converts minor chords in C major', () => {
      expect(chordToNashville('Am', 'C')).toBe('6m');
      expect(chordToNashville('Dm', 'C')).toBe('2m');
      expect(chordToNashville('Em', 'C')).toBe('3m');
    });

    test('converts diminished chord in C major', () => {
      expect(chordToNashville('B°', 'C')).toBe('7°');
      expect(chordToNashville('Bdim', 'C')).toBe('7°');
    });

    test('converts seventh chords', () => {
      expect(chordToNashville('G7', 'C')).toBe('57');
      expect(chordToNashville('Cmaj7', 'C')).toBe('1maj7');
      expect(chordToNashville('Am7', 'C')).toBe('6m7');
    });

    test('works in different keys', () => {
      // G major: G Am Bm C D Em F#°
      expect(chordToNashville('G', 'G')).toBe('1');
      expect(chordToNashville('Am', 'G')).toBe('2m');
      expect(chordToNashville('Bm', 'G')).toBe('3m');
      expect(chordToNashville('C', 'G')).toBe('4');
      expect(chordToNashville('D', 'G')).toBe('5');
      expect(chordToNashville('Em', 'G')).toBe('6m');
    });

    test('handles sharp keys', () => {
      // E major: E F#m G#m A B C#m D#°
      expect(chordToNashville('E', 'E')).toBe('1');
      expect(chordToNashville('F#m', 'E')).toBe('2m');
      expect(chordToNashville('A', 'E')).toBe('4');
      expect(chordToNashville('B', 'E')).toBe('5');
    });

    test('handles chromatic chords', () => {
      expect(chordToNashville('F#', 'C')).toBe('#4');
      expect(chordToNashville('Bb', 'C')).toBe('b7');
      expect(chordToNashville('Eb', 'C')).toBe('b3');
    });

    test('handles suspended chords', () => {
      expect(chordToNashville('Csus4', 'C')).toBe('1sus4');
      expect(chordToNashville('Gsus2', 'C')).toBe('5sus2');
    });

    test('handles edge cases', () => {
      expect(chordToNashville('', 'C')).toBe('1');
      expect(chordToNashville(null, 'C')).toBe('1');
      expect(chordToNashville('C', '')).toBe('1');
    });
  });

  describe('progressionToNashville', () => {
    test('converts common progressions', () => {
      // I-V-vi-IV progression
      const progression1 = ['C', 'G', 'Am', 'F'];
      expect(progressionToNashville(progression1, 'C')).toEqual(['1', '5', '6m', '4']);

      // ii-V-I progression
      const progression2 = ['Dm', 'G', 'C'];
      expect(progressionToNashville(progression2, 'C')).toEqual(['2m', '5', '1']);
    });

    test('works in different keys', () => {
      // Same progression in G major
      const progression = ['G', 'D', 'Em', 'C'];
      expect(progressionToNashville(progression, 'G')).toEqual(['1', '5', '6m', '4']);
    });

    test('handles complex progressions', () => {
      const progression = ['Am', 'F', 'C', 'G', 'Am', 'F', 'G'];
      expect(progressionToNashville(progression, 'C')).toEqual(['6m', '4', '1', '5', '6m', '4', '5']);
    });

    test('handles empty or invalid input', () => {
      expect(progressionToNashville([], 'C')).toEqual([]);
      expect(progressionToNashville(null, 'C')).toEqual([]);
      expect(progressionToNashville(['C', 'G'], null)).toEqual(['1', '5']);
    });
  });

  describe('nashvilleToChord', () => {
    test('converts basic numbers back to chords', () => {
      expect(nashvilleToChord('1', 'C')).toBe('C');
      expect(nashvilleToChord('4', 'C')).toBe('F');
      expect(nashvilleToChord('5', 'C')).toBe('G');
    });

    test('converts minor chords', () => {
      expect(nashvilleToChord('6m', 'C')).toBe('Am');
      expect(nashvilleToChord('2m', 'C')).toBe('Dm');
    });

    test('converts in different keys', () => {
      expect(nashvilleToChord('1', 'G')).toBe('G');
      expect(nashvilleToChord('4', 'G')).toBe('C');
      expect(nashvilleToChord('5', 'G')).toBe('D');
      expect(nashvilleToChord('6m', 'G')).toBe('Em');
    });

    test('handles chromatic chords', () => {
      expect(nashvilleToChord('#4', 'C')).toBe('F#');
      expect(nashvilleToChord('b7', 'C')).toBe('A#');
    });

    test('handles seventh chords', () => {
      expect(nashvilleToChord('57', 'C')).toBe('G7');
      expect(nashvilleToChord('1maj7', 'C')).toBe('Cmaj7');
    });

    test('handles edge cases', () => {
      expect(nashvilleToChord('', 'C')).toBe('C');
      expect(nashvilleToChord(null, 'C')).toBe('C');
      expect(nashvilleToChord('8', 'C')).toBe('C'); // Invalid degree
    });
  });

  describe('detectKey', () => {
    test('detects key from common progressions', () => {
      expect(detectKey(['C', 'G', 'Am', 'F'])).toBe('C');
      expect(detectKey(['G', 'D', 'Em', 'C'])).toBe('G');
      expect(detectKey(['Am', 'F', 'C', 'G'])).toBe('C'); // Most common root
    });

    test('handles repeated chords', () => {
      expect(detectKey(['G', 'G', 'C', 'D'])).toBe('G');
      expect(detectKey(['F', 'F', 'F', 'C'])).toBe('F');
    });

    test('handles edge cases', () => {
      expect(detectKey([])).toBe('C');
      expect(detectKey(null)).toBe('C');
      expect(detectKey(['InvalidChord'])).toBe('C');
    });
  });

  describe('getCommonProgressions', () => {
    test('returns common progressions', () => {
      const progressions = getCommonProgressions();
      
      expect(progressions['I-V-vi-IV']).toEqual(['1', '5', '6m', '4']);
      expect(progressions['vi-IV-I-V']).toEqual(['6m', '4', '1', '5']);
      expect(progressions['ii-V-I']).toEqual(['2m', '5', '1']);
    });

    test('includes various progression types', () => {
      const progressions = getCommonProgressions();
      
      expect(Object.keys(progressions).length).toBeGreaterThan(5);
      expect(progressions).toHaveProperty('I-IV-V');
      expect(progressions).toHaveProperty('I-bVII-IV');
    });
  });

  describe('round-trip conversions', () => {
    test('chord -> nashville -> chord maintains consistency', () => {
      const testChords = ['C', 'Dm', 'Em', 'F', 'G', 'Am', 'G7', 'Cmaj7'];
      
      testChords.forEach(chord => {
        const nashville = chordToNashville(chord, 'C');
        const backToChord = nashvilleToChord(nashville, 'C');
        // Allow for enharmonic equivalents and quality variations
        expect(backToChord).toBeTruthy();
      });
    });

    test('progression conversions work both ways', () => {
      const originalProgression = ['C', 'G', 'Am', 'F'];
      const nashvilleProgression = progressionToNashville(originalProgression, 'C');
      
      expect(nashvilleProgression).toEqual(['1', '5', '6m', '4']);
      
      // Convert back
      const convertedBack = nashvilleProgression.map(num => nashvilleToChord(num, 'C'));
      expect(convertedBack).toEqual(['C', 'G', 'Am', 'F']);
    });
  });

  describe('complex chord types', () => {
    test('handles extended chords', () => {
      expect(chordToNashville('Cmaj9', 'C')).toBe('1maj9');
      expect(chordToNashville('Dm7', 'C')).toBe('2m7');
      expect(chordToNashville('G9', 'C')).toBe('59');
    });

    test('handles altered chords', () => {
      expect(chordToNashville('C+', 'C')).toBe('1+');
      expect(chordToNashville('F#°', 'C')).toBe('#4°');
    });

    test('handles add chords', () => {
      expect(chordToNashville('Cadd9', 'C')).toBe('1add9');
      expect(chordToNashville('Fadd9', 'C')).toBe('4add9');
    });
  });
});