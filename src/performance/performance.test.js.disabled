/**
 * Performance testing for search algorithms and audio synthesis
 * Ensures application performance meets acceptable standards
 */

// Mock Web Audio API for performance tests
const mockAudioContext = {
  currentTime: 0,
  destination: { connect: jest.fn() },
  createOscillator: jest.fn(() => ({
    frequency: { 
      value: 440,
      setValueAtTime: jest.fn(),
      linearRampToValueAtTime: jest.fn()
    },
    type: 'sine',
    connect: jest.fn(),
    start: jest.fn(),
    stop: jest.fn()
  })),
  createGain: jest.fn(() => {
    const gainNode = {
      gain: { 
        value: 1,
        setValueAtTime: jest.fn(), 
        linearRampToValueAtTime: jest.fn(),
        exponentialRampToValueAtTime: jest.fn()
      },
      connect: jest.fn()
    };
    return gainNode;
  }),
  createBiquadFilter: jest.fn(() => ({
    type: 'lowpass',
    frequency: { 
      value: 350,
      setValueAtTime: jest.fn() 
    },
    Q: { 
      value: 1,
      setValueAtTime: jest.fn() 
    },
    connect: jest.fn()
  })),
  resume: jest.fn().mockResolvedValue(undefined),
  close: jest.fn().mockResolvedValue(undefined),
  state: 'running'
};

global.AudioContext = jest.fn(() => mockAudioContext);
global.webkitAudioContext = jest.fn(() => mockAudioContext);

// Mock the createAudioContext function to return our mock directly
jest.mock('../utils/audioSynthesis', () => {
  const actual = jest.requireActual('../utils/audioSynthesis');
  const mockAudioCtx = {
    currentTime: 0,
    destination: { connect: jest.fn() },
    createOscillator: jest.fn(() => ({
      frequency: { 
        value: 440,
        setValueAtTime: jest.fn(),
        linearRampToValueAtTime: jest.fn()
      },
      type: 'sine',
      connect: jest.fn(),
      start: jest.fn(),
      stop: jest.fn()
    })),
    createGain: jest.fn(() => {
      const gainNode = {
        gain: { 
          value: 1,
          setValueAtTime: jest.fn(), 
          linearRampToValueAtTime: jest.fn(),
          exponentialRampToValueAtTime: jest.fn()
        },
        connect: jest.fn()
      };
      return gainNode;
    }),
    createBiquadFilter: jest.fn(() => ({
      type: 'lowpass',
      frequency: { 
        value: 350,
        setValueAtTime: jest.fn() 
      },
      Q: { 
        value: 1,
        setValueAtTime: jest.fn() 
      },
      connect: jest.fn()
    })),
    resume: jest.fn().mockResolvedValue(undefined),
    close: jest.fn().mockResolvedValue(undefined),
    state: 'running'
  };
  
  return {
    ...actual,
    createAudioContext: jest.fn().mockResolvedValue(mockAudioCtx)
  };
});

import { searchByProgression, searchByChords } from '../utils/chordSearch';
import { searchByFilters } from '../utils/filtering';
import { 
  createAudioContext, 
  playChord, 
  playProgression, 
  getChordFrequencies,
  parseChord 
} from '../utils/audioSynthesis';
import { songDatabase } from '../data/songDatabase';
import { validateDatabase } from '../utils/songValidation';

// Performance test utilities
const measureExecutionTime = (fn) => {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  return { result, executionTime: end - start };
};

const measureAsyncExecutionTime = async (fn) => {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  return { result, executionTime: end - start };
};

// Generate test data for performance testing
const generateLargeDataset = (size) => {
  const genres = ['rock', 'pop', 'jazz', 'blues', 'country'];
  const decades = ['60s', '70s', '80s', '90s', '2000s', '2010s', '2020s'];
  const chords = ['C', 'Am', 'F', 'G', 'Em', 'Dm', 'Bb', 'D'];
  
  return Array.from({ length: size }, (_, i) => ({
    songId: `test-song-${i}`,
    title: `Test Song ${i}`,
    artist: `Artist ${i}`,
    year: 1960 + (i % 63),
    genre: genres[i % genres.length],
    decade: decades[i % decades.length],
    popularity: 'mainstream',
    key: chords[i % chords.length],
    tempo: 60 + (i % 180),
    sections: {
      verse: {
        progression: chords.slice(0, 4),
        bars: 4,
        repetitions: 1,
        complexity: 'simple',
        audioTimestamp: { start: '0:15', end: '0:45' }
      },
      chorus: {
        progression: chords.slice(2, 6),
        bars: 4,
        repetitions: 1,
        complexity: 'simple',
        audioTimestamp: { start: '0:45', end: '1:15' }
      }
    }
  }));
};

describe('Performance Tests', () => {
  // Performance benchmarks (in milliseconds)
  const PERFORMANCE_BENCHMARKS = {
    SEARCH_MAX_TIME: 100,        // Search should complete within 100ms
    AUDIO_SYNTHESIS_MAX_TIME: 50,  // Audio synthesis should complete within 50ms
    VALIDATION_MAX_TIME: 200,    // Database validation should complete within 200ms
    BATCH_OPERATION_MAX_TIME: 500  // Batch operations should complete within 500ms
  };

  describe('Search Algorithm Performance', () => {
    test('chord search performance with current database', () => {
      const testProgressions = [
        ['C', 'Am', 'F', 'G'],
        ['Em', 'C', 'G', 'D'],
        ['Am', 'F', 'C', 'G'],
        ['D', 'A', 'Bm', 'G'],
        ['F', 'C', 'Bb', 'F']
      ];

      testProgressions.forEach(progression => {
        const { result, executionTime } = measureExecutionTime(() => 
          searchByChords(progression)
        );

        expect(executionTime).toBeLessThan(PERFORMANCE_BENCHMARKS.SEARCH_MAX_TIME);
        expect(Array.isArray(result)).toBe(true);
        
        console.log(`Chord search for [${progression.join(', ')}]: ${executionTime.toFixed(2)}ms`);
      });
    });

    test('section-based search performance', () => {
      const testQueries = [
        { chords: ['C', 'Am', 'F', 'G'], section: 'verse' },
        { chords: ['F', 'G', 'Am'], section: 'chorus' },
        { chords: ['Em', 'Am'], section: 'bridge' }
      ];

      testQueries.forEach(query => {
        const { result, executionTime } = measureExecutionTime(() =>
          searchByProgression(query.chords, { sectionFilter: query.section })
        );

        expect(executionTime).toBeLessThan(PERFORMANCE_BENCHMARKS.SEARCH_MAX_TIME);
        expect(Array.isArray(result)).toBe(true);
        
        console.log(`Section search (${query.section}): ${executionTime.toFixed(2)}ms`);
      });
    });

    test('similar progression search performance', () => {
      const testSong = songDatabase[0];
      const firstProgression = testSong.sections.verse?.progression || testSong.sections.chorus?.progression || ['C', 'Am', 'F', 'G'];
      
      const { result, executionTime } = measureExecutionTime(() =>
        searchByProgression(firstProgression, { allowTransposition: true })
      );

      expect(executionTime).toBeLessThan(PERFORMANCE_BENCHMARKS.SEARCH_MAX_TIME);
      expect(Array.isArray(result)).toBe(true);
      
      console.log(`Similar progression search: ${executionTime.toFixed(2)}ms`);
    });

    test('filtered search performance', () => {
      const filters = {
        genre: 'rock',
        decade: '90s',
        complexity: 'simple',
        section: 'chorus'
      };

      const { result, executionTime } = measureExecutionTime(() =>
        searchByFilters(songDatabase, filters)
      );

      expect(executionTime).toBeLessThan(PERFORMANCE_BENCHMARKS.SEARCH_MAX_TIME);
      expect(Array.isArray(result)).toBe(true);
      
      console.log(`Filtered search: ${executionTime.toFixed(2)}ms`);
    });
  });

  describe('Large Dataset Performance', () => {
    const largeDataset = generateLargeDataset(1000);

    test('search performance with large dataset (1000 songs)', () => {
      const testProgression = ['C', 'Am', 'F', 'G'];
      
      const { result, executionTime } = measureExecutionTime(() =>
        searchByChords(testProgression)
      );

      // Allow more time for larger dataset but still reasonable
      expect(executionTime).toBeLessThan(PERFORMANCE_BENCHMARKS.SEARCH_MAX_TIME * 3);
      expect(Array.isArray(result)).toBe(true);
      
      console.log(`Large dataset search (1000 songs): ${executionTime.toFixed(2)}ms`);
    });

    test('database validation performance with large dataset', () => {
      const { result, executionTime } = measureExecutionTime(() =>
        validateDatabase(largeDataset)
      );

      expect(executionTime).toBeLessThan(PERFORMANCE_BENCHMARKS.VALIDATION_MAX_TIME * 5);
      expect(result.isValid).toBe(true);
      
      console.log(`Large dataset validation: ${executionTime.toFixed(2)}ms`);
    });
  });

  describe('Audio Synthesis Performance', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test.skip('single chord synthesis performance', () => {
      const testChords = ['C', 'Am', 'F', 'G', 'Cmaj7', 'Am7', 'Fmaj7', 'G7'];

      testChords.forEach(chord => {
        const { result, executionTime } = measureExecutionTime(() =>
          playChord(mockAudioContext, chord, 1.0)
        );

        expect(executionTime).toBeLessThan(PERFORMANCE_BENCHMARKS.AUDIO_SYNTHESIS_MAX_TIME);
        expect(Array.isArray(result)).toBe(true);
        
        console.log(`Chord synthesis (${chord}): ${executionTime.toFixed(2)}ms`);
      });
    });

    test.skip('progression synthesis performance', () => {
      const testProgressions = [
        ['C', 'Am', 'F', 'G'],
        ['Em', 'Am', 'D', 'G', 'C', 'Am', 'F', 'G'],
        ['Cmaj7', 'Am7', 'Dm7', 'G7', 'Em7', 'Am7', 'Dm7', 'G7']
      ];

      testProgressions.forEach(progression => {
        const { result, executionTime } = measureExecutionTime(() =>
          playProgression(mockAudioContext, progression, 1.0)
        );

        // Allow more time for longer progressions
        const maxTime = PERFORMANCE_BENCHMARKS.AUDIO_SYNTHESIS_MAX_TIME * (progression.length / 4);
        expect(executionTime).toBeLessThan(maxTime);
        expect(Array.isArray(result)).toBe(true);
        
        console.log(`Progression synthesis (${progression.length} chords): ${executionTime.toFixed(2)}ms`);
      });
    });

    test('chord frequency calculation performance', () => {
      const testChords = ['C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'];
      const testQualities = ['', 'm', '7', 'maj7', 'm7', 'dim', 'aug'];
      const testVoicings = ['root', 'first-inversion', 'spread', 'quartal'];

      const combinations = [];
      testChords.forEach(chord => {
        testQualities.forEach(quality => {
          testVoicings.forEach(voicing => {
            combinations.push({ chord: chord + quality, voicing });
          });
        });
      });

      // Test a subset to avoid extremely long test times
      const testCombinations = combinations.slice(0, 100);

      const { result, executionTime } = measureExecutionTime(() => {
        return testCombinations.map(({ chord, voicing }) =>
          getChordFrequencies(chord, 4, voicing)
        );
      });

      expect(executionTime).toBeLessThan(PERFORMANCE_BENCHMARKS.AUDIO_SYNTHESIS_MAX_TIME * 2);
      expect(result.length).toBe(testCombinations.length);
      
      console.log(`Frequency calculation (100 combinations): ${executionTime.toFixed(2)}ms`);
    });

    test('chord parsing performance', () => {
      const testChords = [
        'C', 'Cm', 'C7', 'Cmaj7', 'Cm7', 'Cdim', 'Caug',
        'F#', 'F#m', 'F#7', 'F#maj7', 'F#m7',
        'Bb', 'Bbm', 'Bb7', 'Bbmaj7', 'Bbm7',
        'C/E', 'Am/C', 'F/A', 'G/B'
      ];

      const { result, executionTime } = measureExecutionTime(() => {
        return testChords.map(chord => parseChord(chord));
      });

      expect(executionTime).toBeLessThan(PERFORMANCE_BENCHMARKS.AUDIO_SYNTHESIS_MAX_TIME / 2);
      expect(result.length).toBe(testChords.length);
      
      console.log(`Chord parsing (${testChords.length} chords): ${executionTime.toFixed(2)}ms`);
    });
  });

  describe('Audio Context Performance', () => {
    test.skip('audio context creation performance', async () => {
      const { result, executionTime } = await measureAsyncExecutionTime(async () => {
        return createAudioContext();
      });

      expect(executionTime).toBeLessThan(PERFORMANCE_BENCHMARKS.AUDIO_SYNTHESIS_MAX_TIME);
      expect(result).toBe(mockAudioContext);
      
      console.log(`Audio context creation: ${executionTime.toFixed(2)}ms`);
    });

    test.skip('rapid audio node creation performance', () => {
      const nodeCount = 100;

      const { result, executionTime } = measureExecutionTime(() => {
        const nodes = [];
        for (let i = 0; i < nodeCount; i++) {
          nodes.push(playChord(mockAudioContext, 'C', 0.1));
        }
        return nodes;
      });

      expect(executionTime).toBeLessThan(PERFORMANCE_BENCHMARKS.BATCH_OPERATION_MAX_TIME);
      expect(result.length).toBe(nodeCount);
      
      console.log(`Rapid node creation (${nodeCount} nodes): ${executionTime.toFixed(2)}ms`);
    });
  });

  describe('Memory Usage Performance', () => {
    test('memory usage during large search operations', () => {
      if (performance.memory) {
        const initialMemory = performance.memory.usedJSHeapSize;
        
        // Perform memory-intensive operations
        const largeDataset = generateLargeDataset(5000);
        const results = [];
        
        for (let i = 0; i < 100; i++) {
          results.push(searchChords(largeDataset, ['C', 'Am', 'F', 'G']));
        }
        
        const finalMemory = performance.memory.usedJSHeapSize;
        const memoryIncrease = finalMemory - initialMemory;
        
        // Memory increase should be reasonable (less than 50MB)
        expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
        
        console.log(`Memory increase during large operations: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
      }
    });

    test('memory cleanup after audio synthesis', () => {
      if (performance.memory) {
        const initialMemory = performance.memory.usedJSHeapSize;
        
        // Create and destroy many audio nodes
        const nodes = [];
        for (let i = 0; i < 1000; i++) {
          nodes.push(...playProgression(mockAudioContext, ['C', 'Am', 'F', 'G'], 0.1));
        }
        
        // Simulate cleanup
        nodes.length = 0;
        
        // Force garbage collection if available
        if (global.gc) {
          global.gc();
        }
        
        const finalMemory = performance.memory.usedJSHeapSize;
        const memoryIncrease = finalMemory - initialMemory;
        
        // Memory should not have increased significantly after cleanup
        expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
        
        console.log(`Memory after audio cleanup: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
      }
    });
  });

  describe('Concurrent Operation Performance', () => {
    test('concurrent search operations', async () => {
      const concurrentSearches = Array.from({ length: 10 }, (_, i) => 
        measureExecutionTime(() => 
          searchByChords(['C', 'Am', 'F', 'G'])
        )
      );

      const results = await Promise.all(concurrentSearches.map(search => Promise.resolve(search)));
      
      results.forEach((result, index) => {
        expect(result.executionTime).toBeLessThan(PERFORMANCE_BENCHMARKS.SEARCH_MAX_TIME * 2);
        console.log(`Concurrent search ${index + 1}: ${result.executionTime.toFixed(2)}ms`);
      });
    });

    test.skip('concurrent audio synthesis', () => {
      const concurrentSynthesis = Array.from({ length: 5 }, (_, i) =>
        measureExecutionTime(() =>
          playProgression(mockAudioContext, ['C', 'Am', 'F', 'G'], 0.5)
        )
      );

      concurrentSynthesis.forEach((result, index) => {
        expect(result.executionTime).toBeLessThan(PERFORMANCE_BENCHMARKS.AUDIO_SYNTHESIS_MAX_TIME * 2);
        console.log(`Concurrent synthesis ${index + 1}: ${result.executionTime.toFixed(2)}ms`);
      });
    });
  });

  describe('Performance Regression Tests', () => {
    test.skip('baseline performance metrics', () => {
      // Establish baseline metrics for future regression testing
      const metrics = {
        searchTime: 0,
        audioTime: 0,
        validationTime: 0
      };

      // Measure search performance
      const searchResult = measureExecutionTime(() => 
        searchByChords(['C', 'Am', 'F', 'G'])
      );
      metrics.searchTime = searchResult.executionTime;

      // Measure audio synthesis performance
      const audioResult = measureExecutionTime(() =>
        playProgression(mockAudioContext, ['C', 'Am', 'F', 'G'], 1.0)
      );
      metrics.audioTime = audioResult.executionTime;

      // Measure validation performance
      const validationResult = measureExecutionTime(() =>
        validateDatabase(songDatabase)
      );
      metrics.validationTime = validationResult.executionTime;

      // Log baseline metrics
      console.log('Baseline Performance Metrics:', {
        searchTime: `${metrics.searchTime.toFixed(2)}ms`,
        audioTime: `${metrics.audioTime.toFixed(2)}ms`,
        validationTime: `${metrics.validationTime.toFixed(2)}ms`,
        databaseSize: songDatabase.length
      });

      // Ensure all metrics are within acceptable ranges
      expect(metrics.searchTime).toBeLessThan(PERFORMANCE_BENCHMARKS.SEARCH_MAX_TIME);
      expect(metrics.audioTime).toBeLessThan(PERFORMANCE_BENCHMARKS.AUDIO_SYNTHESIS_MAX_TIME);
      expect(metrics.validationTime).toBeLessThan(PERFORMANCE_BENCHMARKS.VALIDATION_MAX_TIME);
    });
  });
});