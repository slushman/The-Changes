/**
 * Integration tests for HomePage component
 * Tests coordination between audio synthesis and visual feedback features
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock the router navigation
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

// Mock Web Audio API
const createMockOscillator = () => ({
  frequency: { setValueAtTime: jest.fn() },
  type: 'sawtooth',
  connect: jest.fn(),
  start: jest.fn(),
  stop: jest.fn()
});

const createMockGain = () => ({
  gain: {
    setValueAtTime: jest.fn(),
    linearRampToValueAtTime: jest.fn()
  },
  connect: jest.fn()
});

const mockAudioContext = {
  currentTime: 0,
  destination: { connect: jest.fn() },
  createOscillator: jest.fn(() => createMockOscillator()),
  createGain: jest.fn(() => createMockGain()),
  resume: jest.fn().mockResolvedValue(undefined),
  state: 'running',
  close: jest.fn()
};

global.AudioContext = jest.fn(() => mockAudioContext);
global.webkitAudioContext = jest.fn(() => mockAudioContext);

// Mock chord utilities
jest.mock('../utils/chordUtils.js', () => ({
  parseProgressionInput: jest.fn((input) => {
    if (!input) return [];
    return input.split(/[\s,|-]+/).filter(chord => chord && chord.trim());
  })
}));

// Mock chord search
jest.mock('../utils/chordSearch.js', () => ({
  searchByProgression: jest.fn(() => [
    {
      songId: 'test-song-1',
      title: 'Test Song',
      artist: 'Test Artist',
      confidence: 0.95,
      matchedSection: 'chorus',
      section: {
        name: 'chorus',
        chords: ['C', 'Am', 'F', 'G']
      }
    }
  ])
}));

// Mock Nashville numbers
jest.mock('../utils/nashvilleNumbers', () => ({
  progressionToNashville: jest.fn((chords) => chords.map(() => '1')),
  detectKey: jest.fn(() => 'C')
}));

// Mock audio synthesis
jest.mock('../utils/audioSynthesis.js', () => ({
  createAudioContext: jest.fn(() => Promise.resolve(mockAudioContext)),
  playChord: jest.fn(() => [createMockOscillator(), createMockGain()]),
  stopAudioNodes: jest.fn(),
  getAvailableVoicings: jest.fn(() => [
    { name: 'root', description: 'Standard root position' },
    { name: 'first-inversion', description: 'First inversion' }
  ])
}));

describe('HomePage Integration Tests', () => {
  let originalSetTimeout;
  let timeoutCalls = [];

  beforeEach(() => {
    jest.clearAllMocks();
    timeoutCalls = [];
    
    // Mock setTimeout to capture calls
    originalSetTimeout = global.setTimeout;
    global.setTimeout = jest.fn((callback, delay) => {
      timeoutCalls.push({ callback, delay });
      return originalSetTimeout(callback, delay);
    });
  });

  afterEach(() => {
    global.setTimeout = originalSetTimeout;
  });

  const renderHomePage = () => {
    return render(<HomePage />);
  };

  describe('Audio-Visual Coordination', () => {
    test('initializes audio context on mount', async () => {
      const { createAudioContext } = require('../utils/audioSynthesis.js');
      
      renderHomePage();
      
      await waitFor(() => {
        expect(createAudioContext).toHaveBeenCalled();
      });
    });

    test('coordinates search input with chord display', async () => {
      renderHomePage();
      
      const searchInput = screen.getByPlaceholderText(/Enter chord progression/);
      
      // Type chord progression
      fireEvent.change(searchInput, { target: { value: 'C Am F G' } });
      
      // Should see chord display
      await waitFor(() => {
        expect(screen.getByText('Chord Names')).toBeInTheDocument();
      });
    });

    test('synchronizes playback with visual feedback', async () => {
      const { playChord } = require('../utils/audioSynthesis.js');
      
      renderHomePage();
      
      // Enter chord progression
      const searchInput = screen.getByPlaceholderText(/Enter chord progression/);
      fireEvent.change(searchInput, { target: { value: 'C Am F G' } });
      
      // Wait for chord display to appear
      await waitFor(() => {
        expect(screen.getByText('Chord Names')).toBeInTheDocument();
      });
      
      // Start playback
      const playButton = screen.getByText('Play');
      fireEvent.click(playButton);
      
      // Should call playChord and show visual feedback
      await waitFor(() => {
        expect(playChord).toHaveBeenCalled();
        expect(screen.getByText('Stop')).toBeInTheDocument();
      });
    });

    test('updates progress indicators during playback', async () => {
      renderHomePage();
      
      // Set up chord progression
      const searchInput = screen.getByPlaceholderText(/Enter chord progression/);
      fireEvent.change(searchInput, { target: { value: 'C Am F G' } });
      
      await waitFor(() => {
        expect(screen.getByText('Chord Names')).toBeInTheDocument();
      });
      
      // Start playback
      const playButton = screen.getByText('Play');
      fireEvent.click(playButton);
      
      // Should show progression progress
      await waitFor(() => {
        expect(screen.getByText('Progression Progress')).toBeInTheDocument();
      });
    });

    test('coordinates voicing changes with audio synthesis', async () => {
      const { playChord } = require('../utils/audioSynthesis.js');
      
      renderHomePage();
      
      // Set up chord progression
      const searchInput = screen.getByPlaceholderText(/Enter chord progression/);
      fireEvent.change(searchInput, { target: { value: 'C Am' } });
      
      await waitFor(() => {
        expect(screen.getByText('Voicing:')).toBeInTheDocument();
      });
      
      // Change voicing
      const voicingSelector = screen.getByDisplayValue('Standard');
      fireEvent.change(voicingSelector, { target: { value: 'first-inversion' } });
      
      // Start playback
      const playButton = screen.getByText('Play');
      fireEvent.click(playButton);
      
      // Should pass voicing to playChord
      await waitFor(() => {
        expect(playChord).toHaveBeenCalledWith(
          expect.anything(),
          expect.any(String),
          expect.any(Number),
          null,
          expect.objectContaining({ voicing: 'first-inversion' })
        );
      });
    });

    test('handles speed changes during playback', async () => {
      const { stopAudioNodes, playChord } = require('../utils/audioSynthesis.js');
      
      renderHomePage();
      
      // Set up and start playback
      const searchInput = screen.getByPlaceholderText(/Enter chord progression/);
      fireEvent.change(searchInput, { target: { value: 'C Am F G' } });
      
      await waitFor(() => {
        expect(screen.getByText('Play')).toBeInTheDocument();
      });
      
      const playButton = screen.getByText('Play');
      fireEvent.click(playButton);
      
      await waitFor(() => {
        expect(screen.getByText('Stop')).toBeInTheDocument();
      });
      
      // Change speed during playback
      const increaseSpeedButton = screen.getByTitle('Increase tempo');
      
      act(() => {
        fireEvent.click(increaseSpeedButton);
      });
      
      // Should restart playback with new speed
      await waitFor(() => {
        expect(stopAudioNodes).toHaveBeenCalled();
      });
      
      // Execute setTimeout callbacks to simulate restart
      act(() => {
        timeoutCalls.forEach(({ callback }) => callback());
      });
      
      await waitFor(() => {
        expect(playChord).toHaveBeenCalledTimes(2); // Initial + restart
      });
    });
  });

  describe('State Management Integration', () => {
    test('maintains consistent state across audio and visual components', async () => {
      renderHomePage();
      
      // Set up chord progression
      const searchInput = screen.getByPlaceholderText(/Enter chord progression/);
      fireEvent.change(searchInput, { target: { value: 'C Am F G' } });
      
      // Change settings
      await waitFor(() => {
        expect(screen.getByDisplayValue('Standard')).toBeInTheDocument();
      });
      
      const voicingSelector = screen.getByDisplayValue('Standard');
      fireEvent.change(voicingSelector, { target: { value: 'first-inversion' } });
      
      const increaseSpeedButton = screen.getByTitle('Increase tempo');
      fireEvent.click(increaseSpeedButton);
      
      // Verify state consistency
      expect(screen.getByDisplayValue('First Inversion')).toBeInTheDocument();
      expect(screen.getByText('130 BPM')).toBeInTheDocument();
      expect(screen.getByText('C')).toBeInTheDocument(); // Chord still displayed
    });

    test('resets playback state when progression changes', async () => {
      renderHomePage();
      
      // Start with one progression
      const searchInput = screen.getByPlaceholderText(/Enter chord progression/);
      fireEvent.change(searchInput, { target: { value: 'C Am F G' } });
      
      await waitFor(() => {
        const playButton = screen.getByText('Play');
        fireEvent.click(playButton);
      });
      
      await waitFor(() => {
        expect(screen.getByText('Stop')).toBeInTheDocument();
      });
      
      // Change progression during playback
      fireEvent.change(searchInput, { target: { value: 'G D Em C' } });
      
      // Should reset to play state
      await waitFor(() => {
        expect(screen.getByText('Play')).toBeInTheDocument();
      });
    });
  });

  describe('Search Results Integration', () => {
    test('coordinates search results with playback', async () => {
      renderHomePage();
      
      // Enter progression that will return results
      const searchInput = screen.getByPlaceholderText(/Enter chord progression/);
      fireEvent.change(searchInput, { target: { value: 'C Am F G' } });
      
      // Should show search results
      await waitFor(() => {
        expect(screen.getByText('Test Song')).toBeInTheDocument();
        expect(screen.getByText('Test Artist')).toBeInTheDocument();
      });
      
      // Playback should still work with search results visible
      const playButton = screen.getByText('Play');
      fireEvent.click(playButton);
      
      await waitFor(() => {
        expect(screen.getByText('Stop')).toBeInTheDocument();
        expect(screen.getByText('Test Song')).toBeInTheDocument(); // Results still visible
      });
    });

    test('handles song detail navigation', async () => {
      renderHomePage();
      
      // Set up search results
      const searchInput = screen.getByPlaceholderText(/Enter chord progression/);
      fireEvent.change(searchInput, { target: { value: 'C Am F G' } });
      
      await waitFor(() => {
        expect(screen.getByText('Test Song')).toBeInTheDocument();
      });
      
      // Click on song should navigate
      const songLink = screen.getByText('Test Song');
      fireEvent.click(songLink);
      
      expect(mockNavigate).toHaveBeenCalledWith('/song/test-song-1');
    });
  });

  describe('Error Handling', () => {
    test('handles audio context creation failure gracefully', async () => {
      const { createAudioContext } = require('../utils/audioSynthesis.js');
      createAudioContext.mockRejectedValueOnce(new Error('Audio not available'));
      
      // Should not crash when audio fails
      expect(() => renderHomePage()).not.toThrow();
      
      // Should still allow interaction without audio
      const searchInput = screen.getByPlaceholderText(/Enter chord progression/);
      fireEvent.change(searchInput, { target: { value: 'C Am F G' } });
      
      await waitFor(() => {
        expect(screen.getByText('Chord Names')).toBeInTheDocument();
      });
    });

    test('handles empty chord progression gracefully', async () => {
      renderHomePage();
      
      // Try to play empty progression
      const playButton = screen.getByText('Play');
      fireEvent.click(playButton);
      
      // Should not crash and remain in play state
      expect(screen.getByText('Play')).toBeInTheDocument();
    });

    test('handles rapid state changes without conflicts', async () => {
      renderHomePage();
      
      const searchInput = screen.getByPlaceholderText(/Enter chord progression/);
      
      // Rapid succession of changes
      fireEvent.change(searchInput, { target: { value: 'C' } });
      fireEvent.change(searchInput, { target: { value: 'C Am' } });
      fireEvent.change(searchInput, { target: { value: 'C Am F' } });
      fireEvent.change(searchInput, { target: { value: 'C Am F G' } });
      
      // Should handle final state correctly
      await waitFor(() => {
        expect(screen.getByText('G')).toBeInTheDocument();
        expect(screen.getByText('4 chords')).toBeInTheDocument();
      });
    });
  });

  describe('Performance and Cleanup', () => {
    test('cleans up audio nodes when component unmounts', async () => {
      const { createAudioContext } = require('../utils/audioSynthesis.js');
      
      const { unmount } = renderHomePage();
      
      await waitFor(() => {
        expect(createAudioContext).toHaveBeenCalled();
      });
      
      // Unmount should close audio context
      unmount();
      
      expect(mockAudioContext.close).toHaveBeenCalled();
    });

    test('stops playback when component unmounts', async () => {
      const { stopAudioNodes } = require('../utils/audioSynthesis.js');
      
      const { unmount } = renderHomePage();
      
      // Set up and start playback
      const searchInput = screen.getByPlaceholderText(/Enter chord progression/);
      fireEvent.change(searchInput, { target: { value: 'C Am F G' } });
      
      await waitFor(() => {
        const playButton = screen.getByText('Play');
        fireEvent.click(playButton);
      });
      
      await waitFor(() => {
        expect(screen.getByText('Stop')).toBeInTheDocument();
      });
      
      // Unmount during playback
      unmount();
      
      // Should have stopped audio nodes
      expect(stopAudioNodes).toHaveBeenCalled();
    });
  });
});