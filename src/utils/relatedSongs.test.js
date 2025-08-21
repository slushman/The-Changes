/**
 * Unit tests for relatedSongs utility functions
 */

import {
  calculateProgressionSimilarity,
  findRelatedSongs,
  getSimilarityExplanation,
  groupBySimilarity
} from './relatedSongs';

// Mock nashvilleNumbers utility
jest.mock('./nashvilleNumbers', () => ({
  progressionToNashville: jest.fn((progression, key) => {
    // Simple mock that returns the progression with some transformation
    const mockConversions = {
      'C': '1', 'Dm': '2m', 'Em': '3m', 'F': '4', 'G': '5', 'Am': '6m', 'Bdim': '7dim',
      'D': '2', 'A': '6', 'E': '3', 'B': '7'
    };
    return progression.map(chord => mockConversions[chord] || chord);
  })
}));

describe('calculateProgressionSimilarity', () => {
  test('returns 1.0 for identical progressions in same key', () => {
    const prog1 = ['C', 'Am', 'F', 'G'];
    const prog2 = ['C', 'Am', 'F', 'G'];
    
    const similarity = calculateProgressionSimilarity(prog1, prog2, 'C', 'C');
    expect(similarity).toBe(1.0);
  });

  test('returns 1.0 for identical progressions in different keys (same Nashville)', () => {
    const prog1 = ['C', 'Am', 'F', 'G']; // 1-6m-4-5 in C
    const prog2 = ['D', 'Bm', 'G', 'A']; // Would be 1-6m-4-5 in D
    
    // Mock the Nashville conversion to return the same pattern
    require('./nashvilleNumbers').progressionToNashville
      .mockReturnValueOnce(['1', '6m', '4', '5'])
      .mockReturnValueOnce(['1', '6m', '4', '5']);
    
    const similarity = calculateProgressionSimilarity(prog1, prog2, 'C', 'D');
    expect(similarity).toBe(1.0);
  });

  test('returns 0 for empty progressions', () => {
    expect(calculateProgressionSimilarity([], ['C', 'F', 'G'], 'C', 'C')).toBe(0);
    expect(calculateProgressionSimilarity(['C', 'F', 'G'], [], 'C', 'C')).toBe(0);
    expect(calculateProgressionSimilarity([], [], 'C', 'C')).toBe(0);
  });

  test('calculates similarity for partially matching progressions', () => {
    const prog1 = ['C', 'Am', 'F', 'G']; 
    const prog2 = ['C', 'Am', 'Dm', 'G'];
    
    // Mock Nashville conversions
    require('./nashvilleNumbers').progressionToNashville
      .mockReturnValueOnce(['1', '6m', '4', '5'])
      .mockReturnValueOnce(['1', '6m', '2m', '5']);
    
    const similarity = calculateProgressionSimilarity(prog1, prog2, 'C', 'C');
    
    // Should be > 0 but < 1.0 due to partial match
    expect(similarity).toBeGreaterThan(0);
    expect(similarity).toBeLessThan(1.0);
  });

  test('handles different progression lengths', () => {
    const prog1 = ['C', 'Am', 'F', 'G'];
    const prog2 = ['C', 'Am'];
    
    require('./nashvilleNumbers').progressionToNashville
      .mockReturnValueOnce(['1', '6m', '4', '5'])
      .mockReturnValueOnce(['1', '6m']);
    
    const similarity = calculateProgressionSimilarity(prog1, prog2, 'C', 'C');
    
    expect(similarity).toBeGreaterThan(0);
    expect(similarity).toBeLessThan(1.0);
  });
});

describe('findRelatedSongs', () => {
  const targetSong = {
    songId: 'target-song',
    title: 'Target Song',
    artist: 'Target Artist',
    genre: 'rock',
    key: 'C',
    sections: {
      verse: {
        progression: ['C', 'Am', 'F', 'G']
      },
      chorus: {
        progression: ['F', 'C', 'G', 'Am']
      }
    }
  };

  const songDatabase = [
    {
      songId: 'similar-song-1',
      title: 'Similar Song 1',
      artist: 'Different Artist',
      genre: 'rock',
      key: 'C',
      sections: {
        verse: {
          progression: ['C', 'Am', 'F', 'G'] // Identical to target
        }
      }
    },
    {
      songId: 'similar-song-2',
      title: 'Similar Song 2',
      artist: 'Target Artist', // Same artist
      genre: 'pop',
      key: 'D',
      sections: {
        chorus: {
          progression: ['D', 'Bm', 'G', 'A'] // Same pattern, different key
        }
      }
    },
    {
      songId: 'different-song',
      title: 'Different Song',
      artist: 'Other Artist',
      genre: 'jazz',
      key: 'Em',
      sections: {
        verse: {
          progression: ['Em', 'B7', 'Am', 'D'] // Different pattern
        }
      }
    }
  ];

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Set up default mock behavior for Nashville conversions
    require('./nashvilleNumbers').progressionToNashville.mockImplementation((progression) => {
      const mockConversions = {
        'C': '1', 'Am': '6m', 'F': '4', 'G': '5',
        'D': '1', 'Bm': '6m', 'A': '5',
        'Em': '1', 'B7': '5', 'D': '7'
      };
      return progression.map(chord => mockConversions[chord] || chord);
    });
  });

  test('finds related songs based on progression similarity', () => {
    const related = findRelatedSongs(targetSong, songDatabase, { minSimilarity: 0.1 });
    
    expect(related).toHaveLength(3);
    expect(related[0].song.songId).toBe('similar-song-1'); // Should be highest similarity
  });

  test('excludes the target song itself', () => {
    const databaseWithTarget = [...songDatabase, targetSong];
    const related = findRelatedSongs(targetSong, databaseWithTarget);
    
    const targetFound = related.find(r => r.song.songId === 'target-song');
    expect(targetFound).toBeUndefined();
  });

  test('applies similarity threshold correctly', () => {
    const related = findRelatedSongs(targetSong, songDatabase, { minSimilarity: 0.8 });
    
    // Should filter out songs below threshold
    expect(related.length).toBeLessThanOrEqual(songDatabase.length);
    related.forEach(r => {
      expect(r.similarity).toBeGreaterThanOrEqual(0.8);
    });
  });

  test('limits results to maxResults', () => {
    const related = findRelatedSongs(targetSong, songDatabase, { 
      minSimilarity: 0.0, 
      maxResults: 2 
    });
    
    expect(related).toHaveLength(2);
  });

  test('applies same artist bonus', () => {
    const relatedWithBonus = findRelatedSongs(targetSong, songDatabase, { 
      sameArtistBonus: 0.1,
      minSimilarity: 0.0
    });
    
    const sameArtistSong = relatedWithBonus.find(r => r.song.artist === 'Target Artist');
    expect(sameArtistSong).toBeDefined();
    
    // Should have higher similarity due to bonus (assuming base similarity > 0)
    if (sameArtistSong) {
      expect(sameArtistSong.similarity).toBeGreaterThan(0.05); // Base + bonus
    }
  });

  test('applies same genre bonus', () => {
    const relatedWithBonus = findRelatedSongs(targetSong, songDatabase, { 
      sameGenreBonus: 0.05,
      minSimilarity: 0.0
    });
    
    const sameGenreSong = relatedWithBonus.find(r => r.song.genre === 'rock');
    expect(sameGenreSong).toBeDefined();
  });

  test('sorts results by similarity descending', () => {
    const related = findRelatedSongs(targetSong, songDatabase, { minSimilarity: 0.0 });
    
    for (let i = 1; i < related.length; i++) {
      expect(related[i-1].similarity).toBeGreaterThanOrEqual(related[i].similarity);
    }
  });

  test('handles empty song database', () => {
    const related = findRelatedSongs(targetSong, []);
    expect(related).toEqual([]);
  });

  test('handles null target song', () => {
    const related = findRelatedSongs(null, songDatabase);
    expect(related).toEqual([]);
  });

  test('records best match information', () => {
    const related = findRelatedSongs(targetSong, songDatabase, { minSimilarity: 0.0 });
    
    related.forEach(match => {
      expect(match.bestMatch).toBeDefined();
      expect(match.bestMatch.targetSection).toBeDefined();
      expect(match.bestMatch.matchSection).toBeDefined();
      expect(match.bestMatch.similarity).toBeDefined();
    });
  });
});

describe('getSimilarityExplanation', () => {
  test('provides explanation for very high similarity', () => {
    const match = {
      similarity: 0.9,
      bestMatch: { targetSection: 'verse', matchSection: 'chorus' }
    };
    
    const explanation = getSimilarityExplanation(match);
    expect(explanation).toContain('90% similar');
    expect(explanation).toContain('Very similar');
    expect(explanation).toContain('verse');
    expect(explanation).toContain('chorus');
  });

  test('provides explanation for medium similarity', () => {
    const match = {
      similarity: 0.65,
      bestMatch: { targetSection: 'verse', matchSection: 'verse' }
    };
    
    const explanation = getSimilarityExplanation(match);
    expect(explanation).toContain('65% similar');
    expect(explanation).toContain('Similar chord progressions');
  });

  test('provides explanation for low similarity', () => {
    const match = {
      similarity: 0.35,
      bestMatch: { targetSection: 'bridge', matchSection: 'outro' }
    };
    
    const explanation = getSimilarityExplanation(match);
    expect(explanation).toContain('35% similar');
    expect(explanation).toContain('musical elements');
  });

  test('rounds similarity percentage correctly', () => {
    const match = {
      similarity: 0.847,
      bestMatch: { targetSection: 'verse', matchSection: 'chorus' }
    };
    
    const explanation = getSimilarityExplanation(match);
    expect(explanation).toContain('85% similar'); // Should round to nearest integer
  });
});

describe('groupBySimilarity', () => {
  const relatedSongs = [
    { similarity: 0.85 },
    { similarity: 0.75 },
    { similarity: 0.65 },
    { similarity: 0.55 },
    { similarity: 0.45 },
    { similarity: 0.35 }
  ];

  test('groups songs by similarity levels', () => {
    const grouped = groupBySimilarity(relatedSongs);
    
    expect(grouped.verySimilar).toHaveLength(2); // 0.85, 0.75
    expect(grouped.similar).toHaveLength(2); // 0.65, 0.55
    expect(grouped.somewhatSimilar).toHaveLength(2); // 0.45, 0.35
  });

  test('handles empty array', () => {
    const grouped = groupBySimilarity([]);
    
    expect(grouped.verySimilar).toEqual([]);
    expect(grouped.similar).toEqual([]);
    expect(grouped.somewhatSimilar).toEqual([]);
  });

  test('correctly categorizes edge cases', () => {
    const edgeCases = [
      { similarity: 0.7 }, // Exactly on verySimilar threshold
      { similarity: 0.5 }, // Exactly on similar threshold
      { similarity: 0.3 }  // Exactly on somewhatSimilar threshold
    ];
    
    const grouped = groupBySimilarity(edgeCases);
    
    expect(grouped.verySimilar).toHaveLength(1); // 0.7
    expect(grouped.similar).toHaveLength(1); // 0.5
    expect(grouped.somewhatSimilar).toHaveLength(1); // 0.3
  });

  test('maintains original objects in grouped results', () => {
    const songsWithData = [
      { similarity: 0.85, song: { title: 'Song 1' } },
      { similarity: 0.65, song: { title: 'Song 2' } }
    ];
    
    const grouped = groupBySimilarity(songsWithData);
    
    expect(grouped.verySimilar[0].song.title).toBe('Song 1');
    expect(grouped.similar[0].song.title).toBe('Song 2');
  });
});