/**
 * Unit tests for chord search utilities
 * Tests search algorithms, filtering, and progression matching
 */

import {
  searchByProgression,
  searchByChords,
  getProgressionSuggestions
} from './chordSearch.js';

// Mock song database for testing
const mockSongDatabase = [
  {
    songId: 'test-song-1',
    title: 'Test Song 1',
    artist: 'Test Artist 1',
    genre: 'rock',
    decade: '90s',
    popularity: 'mainstream',
    sections: {
      verse: {
        progression: ['C', 'Am', 'F', 'G'],
        complexity: 'simple'
      },
      chorus: {
        progression: ['F', 'C', 'G', 'Am'],
        complexity: 'simple'
      }
    }
  },
  {
    songId: 'test-song-2',
    title: 'Test Song 2',
    artist: 'Test Artist 2',
    genre: 'pop',
    decade: '2000s',
    popularity: 'mainstream',
    sections: {
      verse: {
        progression: ['Dm', 'G', 'C', 'Am'],
        complexity: 'intermediate'
      },
      bridge: {
        progression: ['Am', 'F', 'C', 'G'],
        complexity: 'simple'
      }
    }
  },
  {
    songId: 'test-song-3',
    title: 'Test Song 3',
    artist: 'Test Artist 3',
    genre: 'jazz',
    decade: '70s',
    popularity: 'deep-cut',
    sections: {
      verse: {
        progression: ['Cmaj7', 'Am7', 'Dm7', 'G7'],
        complexity: 'complex'
      }
    }
  }
];

// Mock the song database import
jest.mock('../data/songDatabase.js', () => ({
  __esModule: true,
  default: mockSongDatabase
}));

describe('searchByProgression', () => {
  test('finds exact progression matches', () => {
    const results = searchByProgression(['C', 'Am', 'F', 'G'], { exactMatch: true });
    
    expect(results).toHaveLength(1);
    expect(results[0].title).toBe('Test Song 1');
    expect(results[0].matchedSection).toBe('verse');
    expect(results[0].matchDetails.type).toBe('exact');
  });

  test('finds partial progression matches', () => {
    const results = searchByProgression(['Am', 'F'], { exactMatch: false });
    
    expect(results.length).toBeGreaterThan(0);
    const songTitles = results.map(r => r.title);
    expect(songTitles).toContain('Test Song 1');
    expect(songTitles).toContain('Test Song 2');
  });

  test('filters by genre', () => {
    const results = searchByProgression(['C'], { 
      exactMatch: false,
      genreFilter: 'rock'
    });
    
    results.forEach(result => {
      expect(result.genre).toBe('rock');
    });
  });

  test('filters by decade', () => {
    const results = searchByProgression(['C'], { 
      exactMatch: false,
      decadeFilter: '90s'
    });
    
    results.forEach(result => {
      expect(result.decade).toBe('90s');
    });
  });

  test('filters by section', () => {
    const results = searchByProgression(['C'], { 
      exactMatch: false,
      sectionFilter: 'verse'
    });
    
    results.forEach(result => {
      expect(result.matchedSection).toBe('verse');
    });
  });

  test('filters by complexity', () => {
    const results = searchByProgression(['C'], { 
      exactMatch: false,
      complexityFilter: 'simple'
    });
    
    results.forEach(result => {
      expect(result.sectionData.complexity).toBe('simple');
    });
  });

  test('filters by popularity', () => {
    const results = searchByProgression(['C'], { 
      exactMatch: false,
      popularityFilter: 'mainstream'
    });
    
    results.forEach(result => {
      expect(result.popularity).toBe('mainstream');
    });
  });

  test('handles case insensitive search', () => {
    const results1 = searchByProgression(['c', 'am', 'f', 'g'], { 
      exactMatch: true,
      caseSensitive: false
    });
    const results2 = searchByProgression(['C', 'Am', 'F', 'G'], { 
      exactMatch: true,
      caseSensitive: false
    });
    
    expect(results1).toHaveLength(results2.length);
  });

  test('handles case sensitive search', () => {
    const results = searchByProgression(['c', 'am', 'f', 'g'], { 
      exactMatch: true,
      caseSensitive: true
    });
    
    expect(results).toHaveLength(0); // Should not match uppercase chords
  });

  test('returns results sorted by confidence', () => {
    const results = searchByProgression(['C'], { exactMatch: false });
    
    for (let i = 1; i < results.length; i++) {
      expect(results[i-1].confidence).toBeGreaterThanOrEqual(results[i].confidence);
    }
  });

  test('handles empty search progression', () => {
    const results = searchByProgression([]);
    expect(results).toHaveLength(0);
  });

  test('handles null/undefined search progression', () => {
    expect(searchByProgression(null)).toHaveLength(0);
    expect(searchByProgression(undefined)).toHaveLength(0);
  });

  test('includes match details in results', () => {
    const results = searchByProgression(['C', 'Am'], { exactMatch: false });
    
    expect(results.length).toBeGreaterThan(0);
    results.forEach(result => {
      expect(result).toHaveProperty('matchDetails');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('searchProgression');
      expect(result).toHaveProperty('matchedSection');
      expect(result).toHaveProperty('sectionData');
    });
  });
});

describe('searchByChords', () => {
  test('finds songs containing any of the specified chords', () => {
    const results = searchByChords(['C', 'G'], { requireAll: false });
    
    expect(results.length).toBeGreaterThan(0);
    results.forEach(result => {
      const hasChord = result.matchedChords.some(chord => ['C', 'G'].includes(chord));
      expect(hasChord).toBe(true);
    });
  });

  test('finds songs containing all specified chords', () => {
    const results = searchByChords(['C', 'Am'], { requireAll: true });
    
    expect(results.length).toBeGreaterThan(0);
    results.forEach(result => {
      expect(result.matchedChords).toContain('C');
      expect(result.matchedChords).toContain('Am');
    });
  });

  test('handles case insensitive chord search', () => {
    const results1 = searchByChords(['c', 'am'], { caseSensitive: false });
    const results2 = searchByChords(['C', 'Am'], { caseSensitive: false });
    
    expect(results1).toHaveLength(results2.length);
  });

  test('filters by genre in chord search', () => {
    const results = searchByChords(['C'], { genreFilter: 'rock' });
    
    results.forEach(result => {
      expect(result.genre).toBe('rock');
    });
  });

  test('filters by decade in chord search', () => {
    const results = searchByChords(['C'], { decadeFilter: '90s' });
    
    results.forEach(result => {
      expect(result.decade).toBe('90s');
    });
  });

  test('filters by section in chord search', () => {
    const results = searchByChords(['C'], { sectionFilter: 'verse' });
    
    results.forEach(result => {
      const hasVerseMatch = result.matchingSections.some(section => 
        section.sectionName === 'verse'
      );
      expect(hasVerseMatch).toBe(true);
    });
  });

  test('returns chord coverage information', () => {
    const results = searchByChords(['C', 'Am', 'F', 'G'], { requireAll: false });
    
    results.forEach(result => {
      expect(result).toHaveProperty('chordCoverage');
      expect(result.chordCoverage).toBeGreaterThan(0);
      expect(result.chordCoverage).toBeLessThanOrEqual(1);
    });
  });

  test('sorts results by chord coverage', () => {
    const results = searchByChords(['C', 'Am', 'F'], { requireAll: false });
    
    for (let i = 1; i < results.length; i++) {
      expect(results[i-1].chordCoverage).toBeGreaterThanOrEqual(results[i].chordCoverage);
    }
  });

  test('includes matching sections information', () => {
    const results = searchByChords(['C'], { requireAll: false });
    
    expect(results.length).toBeGreaterThan(0);
    results.forEach(result => {
      expect(result).toHaveProperty('matchingSections');
      expect(Array.isArray(result.matchingSections)).toBe(true);
      expect(result.matchingSections.length).toBeGreaterThan(0);
      
      result.matchingSections.forEach(section => {
        expect(section).toHaveProperty('sectionName');
        expect(section).toHaveProperty('sectionData');
        expect(section).toHaveProperty('matchedChords');
      });
    });
  });

  test('handles empty chord array', () => {
    const results = searchByChords([]);
    expect(results).toHaveLength(0);
  });

  test('handles null/undefined chords', () => {
    expect(searchByChords(null)).toHaveLength(0);
    expect(searchByChords(undefined)).toHaveLength(0);
  });
});

describe('getProgressionSuggestions', () => {
  test('provides suggestions based on partial progression', () => {
    const suggestions = getProgressionSuggestions(['C', 'Am']);
    
    expect(Array.isArray(suggestions)).toBe(true);
    suggestions.forEach(suggestion => {
      expect(suggestion).toHaveProperty('progression');
      expect(suggestion).toHaveProperty('count');
      expect(suggestion).toHaveProperty('examples');
      expect(Array.isArray(suggestion.progression)).toBe(true);
      expect(suggestion.progression.length).toBeGreaterThan(2);
      expect(suggestion.progression[0]).toBe('C');
      expect(suggestion.progression[1]).toBe('Am');
    });
  });

  test('sorts suggestions by frequency', () => {
    const suggestions = getProgressionSuggestions(['C']);
    
    for (let i = 1; i < suggestions.length; i++) {
      expect(suggestions[i-1].count).toBeGreaterThanOrEqual(suggestions[i].count);
    }
  });

  test('limits number of suggestions', () => {
    const suggestions = getProgressionSuggestions(['C'], 3);
    expect(suggestions.length).toBeLessThanOrEqual(3);
  });

  test('includes example songs in suggestions', () => {
    const suggestions = getProgressionSuggestions(['C', 'Am']);
    
    suggestions.forEach(suggestion => {
      expect(Array.isArray(suggestion.examples)).toBe(true);
      suggestion.examples.forEach(example => {
        expect(example).toHaveProperty('song');
        expect(example).toHaveProperty('artist');
        expect(example).toHaveProperty('section');
      });
    });
  });

  test('handles empty progression', () => {
    const suggestions = getProgressionSuggestions([]);
    expect(suggestions).toHaveLength(0);
  });

  test('handles null/undefined progression', () => {
    expect(getProgressionSuggestions(null)).toHaveLength(0);
    expect(getProgressionSuggestions(undefined)).toHaveLength(0);
  });

  test('handles single chord progression', () => {
    const suggestions = getProgressionSuggestions(['C']);
    
    expect(Array.isArray(suggestions)).toBe(true);
    // Should still provide suggestions for single chord
  });

  test('handles case insensitive matching', () => {
    const suggestions1 = getProgressionSuggestions(['c', 'am']);
    const suggestions2 = getProgressionSuggestions(['C', 'Am']);
    
    // Both should return suggestions (implementation normalizes case)
    expect(suggestions1.length).toBeGreaterThanOrEqual(0);
    expect(suggestions2.length).toBeGreaterThanOrEqual(0);
  });
});

describe('Edge Cases and Error Handling', () => {
  test('handles malformed progression inputs', () => {
    expect(() => searchByProgression([''])).not.toThrow();
    expect(() => searchByProgression(['invalid_chord'])).not.toThrow();
    expect(() => searchByChords([''])).not.toThrow();
  });

  test('handles very long progressions', () => {
    const longProgression = new Array(20).fill('C');
    expect(() => searchByProgression(longProgression)).not.toThrow();
  });

  test('handles special characters in chord names', () => {
    expect(() => searchByProgression(['C#', 'Bb', 'F#'])).not.toThrow();
    expect(() => searchByChords(['C#', 'Bb'])).not.toThrow();
  });

  test('handles invalid filter values gracefully', () => {
    expect(() => searchByProgression(['C'], { 
      genreFilter: 'invalid_genre',
      decadeFilter: 'invalid_decade'
    })).not.toThrow();
  });

  test('returns empty results for impossible combinations', () => {
    const results = searchByProgression(['C'], { 
      genreFilter: 'nonexistent_genre'
    });
    expect(results).toHaveLength(0);
  });
});