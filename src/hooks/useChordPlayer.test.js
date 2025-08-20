/**
 * Tests for useChordPlayer hook
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import useChordPlayer from './useChordPlayer';

// Mock the audioSynthesis utilities
jest.mock('../utils/audioSynthesis', () => ({
  createAudioContext: jest.fn(() => Promise.resolve({
    state: 'running',
    currentTime: 0,
    resume: jest.fn().mockResolvedValue(undefined),
    close: jest.fn()
  })),
  playProgression: jest.fn(() => []),
  stopAudioNodes: jest.fn()
}));

const { createAudioContext, playProgression, stopAudioNodes } = require('../utils/audioSynthesis');

describe('useChordPlayer', () => {
  const mockAudioContext = {
    state: 'running',
    currentTime: 0,
    resume: jest.fn().mockResolvedValue(undefined),
    close: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    createAudioContext.mockResolvedValue(mockAudioContext);
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('initialization', () => {
    test('initializes with default values', async () => {
      const { result } = renderHook(() => useChordPlayer());
      
      await waitFor(() => {
        expect(result.current.isAudioAvailable).toBe(true);
      });

      expect(result.current.isPlaying).toBe(false);
      expect(result.current.isPaused).toBe(false);
      expect(result.current.currentChordIndex).toBe(0);
      expect(result.current.progression).toEqual([]);
      expect(result.current.bpm).toBe(120);
      expect(result.current.volume).toBe(0.3);
      expect(result.current.isMuted).toBe(false);
      expect(result.current.waveType).toBe('sawtooth');
      expect(result.current.isRepeating).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
    });

    test('initializes with custom options', async () => {
      const options = {
        initialProgression: ['C', 'Am', 'F', 'G'],
        initialBpm: 140,
        initialVolume: 0.5,
        initialWaveType: 'square',
        repeat: true
      };

      const { result } = renderHook(() => useChordPlayer(options));
      
      await waitFor(() => {
        expect(result.current.isAudioAvailable).toBe(true);
      });

      expect(result.current.progression).toEqual(['C', 'Am', 'F', 'G']);
      expect(result.current.bpm).toBe(140);
      expect(result.current.volume).toBe(0.5);
      expect(result.current.waveType).toBe('square');
      expect(result.current.isRepeating).toBe(true);
    });

    test('handles audio context initialization failure', async () => {
      const mockError = new Error('Audio not supported');
      createAudioContext.mockRejectedValueOnce(mockError);
      
      const mockOnError = jest.fn();
      const { result } = renderHook(() => useChordPlayer({ onError: mockOnError }));
      
      await waitFor(() => {
        expect(result.current.isAudioAvailable).toBe(false);
      });

      expect(result.current.error).toContain('Could not initialize audio');
      expect(mockOnError).toHaveBeenCalledWith(mockError);
    });
  });

  describe('playback controls', () => {
    test('play starts playback', async () => {
      const { result } = renderHook(() => useChordPlayer({
        initialProgression: ['C', 'Am']
      }));
      
      await waitFor(() => {
        expect(result.current.isAudioAvailable).toBe(true);
      });

      await act(async () => {
        await result.current.play();
      });

      expect(result.current.isPlaying).toBe(true);
      expect(result.current.isPaused).toBe(false);
      expect(playProgression).toHaveBeenCalled();
    });

    test('pause stops playback but maintains position', async () => {
      const { result } = renderHook(() => useChordPlayer({
        initialProgression: ['C', 'Am', 'F']
      }));
      
      await waitFor(() => {
        expect(result.current.isAudioAvailable).toBe(true);
      });

      // Start playback
      await act(async () => {
        await result.current.play();
      });

      expect(result.current.isPlaying).toBe(true);

      // Pause
      act(() => {
        result.current.pause();
      });

      expect(result.current.isPlaying).toBe(false);
      expect(result.current.isPaused).toBe(true);
    });

    test('stop resets playback position', async () => {
      const { result } = renderHook(() => useChordPlayer({
        initialProgression: ['C', 'Am', 'F']
      }));
      
      await waitFor(() => {
        expect(result.current.isAudioAvailable).toBe(true);
      });

      // Start playback and advance
      await act(async () => {
        await result.current.play();
        result.current.skipForward();
      });

      expect(result.current.currentChordIndex).toBe(1);

      // Stop
      act(() => {
        result.current.stop();
      });

      expect(result.current.isPlaying).toBe(false);
      expect(result.current.isPaused).toBe(false);
      expect(result.current.currentChordIndex).toBe(0);
      expect(stopAudioNodes).toHaveBeenCalled();
    });

    test('togglePlayback switches between play and pause', async () => {
      const { result } = renderHook(() => useChordPlayer({
        initialProgression: ['C', 'Am']
      }));
      
      await waitFor(() => {
        expect(result.current.isAudioAvailable).toBe(true);
      });

      // Toggle to play
      await act(async () => {
        await result.current.togglePlayback();
      });

      expect(result.current.isPlaying).toBe(true);

      // Toggle to pause
      act(() => {
        result.current.togglePlayback();
      });

      expect(result.current.isPlaying).toBe(false);
      expect(result.current.isPaused).toBe(true);
    });
  });

  describe('navigation controls', () => {
    test('skipTo changes position', async () => {
      const { result } = renderHook(() => useChordPlayer({
        initialProgression: ['C', 'Am', 'F', 'G']
      }));
      
      await waitFor(() => {
        expect(result.current.isAudioAvailable).toBe(true);
      });

      act(() => {
        result.current.skipTo(2);
      });

      expect(result.current.currentChordIndex).toBe(2);
    });

    test('skipTo ignores invalid indices', async () => {
      const { result } = renderHook(() => useChordPlayer({
        initialProgression: ['C', 'Am']
      }));
      
      await waitFor(() => {
        expect(result.current.isAudioAvailable).toBe(true);
      });

      const initialIndex = result.current.currentChordIndex;

      act(() => {
        result.current.skipTo(-1);
      });

      expect(result.current.currentChordIndex).toBe(initialIndex);

      act(() => {
        result.current.skipTo(10);
      });

      expect(result.current.currentChordIndex).toBe(initialIndex);
    });

    test('skipForward advances to next chord', async () => {
      const { result } = renderHook(() => useChordPlayer({
        initialProgression: ['C', 'Am', 'F']
      }));
      
      await waitFor(() => {
        expect(result.current.isAudioAvailable).toBe(true);
      });

      act(() => {
        result.current.skipForward();
      });

      expect(result.current.currentChordIndex).toBe(1);

      // Should wrap around
      act(() => {
        result.current.skipTo(2);
        result.current.skipForward();
      });

      expect(result.current.currentChordIndex).toBe(0);
    });

    test('skipBack goes to previous chord', async () => {
      const { result } = renderHook(() => useChordPlayer({
        initialProgression: ['C', 'Am', 'F']
      }));
      
      await waitFor(() => {
        expect(result.current.isAudioAvailable).toBe(true);
      });

      // Skip to middle, then back
      act(() => {
        result.current.skipTo(1);
        result.current.skipBack();
      });

      expect(result.current.currentChordIndex).toBe(0);

      // Should wrap around to end
      act(() => {
        result.current.skipBack();
      });

      expect(result.current.currentChordIndex).toBe(2);
    });
  });

  describe('settings management', () => {
    test('setBpm updates tempo', async () => {
      const { result } = renderHook(() => useChordPlayer());
      
      await waitFor(() => {
        expect(result.current.isAudioAvailable).toBe(true);
      });

      act(() => {
        result.current.setBpm(140);
      });

      expect(result.current.bpm).toBe(140);
    });

    test('setVolume updates volume', async () => {
      const { result } = renderHook(() => useChordPlayer());
      
      await waitFor(() => {
        expect(result.current.isAudioAvailable).toBe(true);
      });

      act(() => {
        result.current.setVolume(0.8);
      });

      expect(result.current.volume).toBe(0.8);
    });

    test('toggleMute toggles mute state', async () => {
      const { result } = renderHook(() => useChordPlayer());
      
      await waitFor(() => {
        expect(result.current.isAudioAvailable).toBe(true);
      });

      expect(result.current.isMuted).toBe(false);

      act(() => {
        result.current.toggleMute();
      });

      expect(result.current.isMuted).toBe(true);

      act(() => {
        result.current.toggleMute();
      });

      expect(result.current.isMuted).toBe(false);
    });

    test('setWaveType updates wave type', async () => {
      const { result } = renderHook(() => useChordPlayer());
      
      await waitFor(() => {
        expect(result.current.isAudioAvailable).toBe(true);
      });

      act(() => {
        result.current.setWaveType('triangle');
      });

      expect(result.current.waveType).toBe('triangle');
    });

    test('setIsRepeating updates repeat mode', async () => {
      const { result } = renderHook(() => useChordPlayer());
      
      await waitFor(() => {
        expect(result.current.isAudioAvailable).toBe(true);
      });

      act(() => {
        result.current.setIsRepeating(true);
      });

      expect(result.current.isRepeating).toBe(true);
    });
  });

  describe('progression management', () => {
    test('updateProgression changes progression', async () => {
      const { result } = renderHook(() => useChordPlayer());
      
      await waitFor(() => {
        expect(result.current.isAudioAvailable).toBe(true);
      });

      const newProgression = ['F', 'G', 'Am', 'C'];

      act(() => {
        result.current.updateProgression(newProgression);
      });

      expect(result.current.progression).toEqual(newProgression);
    });

    test('updateProgression adjusts position when needed', async () => {
      const { result } = renderHook(() => useChordPlayer({
        initialProgression: ['C', 'Am', 'F', 'G']
      }));
      
      await waitFor(() => {
        expect(result.current.isAudioAvailable).toBe(true);
      });

      // Move to last chord
      act(() => {
        result.current.skipTo(3);
      });

      expect(result.current.currentChordIndex).toBe(3);

      // Update to shorter progression
      act(() => {
        result.current.updateProgression(['C', 'Am']);
      });

      expect(result.current.currentChordIndex).toBe(1); // Adjusted to last valid index
    });

    test('updateProgression stops playback when empty', async () => {
      const { result } = renderHook(() => useChordPlayer({
        initialProgression: ['C', 'Am']
      }));
      
      await waitFor(() => {
        expect(result.current.isAudioAvailable).toBe(true);
      });

      // Start playback
      await act(async () => {
        await result.current.play();
      });

      expect(result.current.isPlaying).toBe(true);

      // Set empty progression
      act(() => {
        result.current.updateProgression([]);
      });

      expect(result.current.isPlaying).toBe(false);
      expect(result.current.progression).toEqual([]);
    });
  });

  describe('utility functions', () => {
    test('getChordDuration calculates correctly', async () => {
      const { result } = renderHook(() => useChordPlayer({
        initialBpm: 120
      }));
      
      await waitFor(() => {
        expect(result.current.isAudioAvailable).toBe(true);
      });

      expect(result.current.getChordDuration()).toBe(0.5); // 60/120 = 0.5 seconds

      act(() => {
        result.current.setBpm(60);
      });

      expect(result.current.getChordDuration()).toBe(1); // 60/60 = 1 second
    });

    test('getPlaybackState returns current state', async () => {
      const { result } = renderHook(() => useChordPlayer({
        initialProgression: ['C', 'Am', 'F', 'G']
      }));
      
      await waitFor(() => {
        expect(result.current.isAudioAvailable).toBe(true);
      });

      act(() => {
        result.current.skipTo(1);
      });

      const state = result.current.getPlaybackState();

      expect(state.currentChordIndex).toBe(1);
      expect(state.currentChord).toBe('Am');
      expect(state.progressPercent).toBe(25); // 1/4 * 100
      expect(state.isPlaying).toBe(false);
      expect(state.isPaused).toBe(false);
    });
  });

  describe('auto play', () => {
    test('starts playing automatically when autoPlay is true', async () => {
      const { result } = renderHook(() => useChordPlayer({
        initialProgression: ['C', 'Am'],
        autoPlay: true
      }));
      
      await waitFor(() => {
        expect(result.current.isAudioAvailable).toBe(true);
      });

      await waitFor(() => {
        expect(result.current.isPlaying).toBe(true);
      });

      expect(playProgression).toHaveBeenCalled();
    });

    test('does not auto play when autoPlay is false', async () => {
      const { result } = renderHook(() => useChordPlayer({
        initialProgression: ['C', 'Am'],
        autoPlay: false
      }));
      
      await waitFor(() => {
        expect(result.current.isAudioAvailable).toBe(true);
      });

      // Wait to ensure no auto play
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      expect(result.current.isPlaying).toBe(false);
    });
  });

  describe('callbacks', () => {
    test('calls onChordChange when chord changes', async () => {
      const mockOnChordChange = jest.fn();
      const { result } = renderHook(() => useChordPlayer({
        initialProgression: ['C', 'Am'],
        onChordChange: mockOnChordChange
      }));
      
      await waitFor(() => {
        expect(result.current.isAudioAvailable).toBe(true);
      });

      await act(async () => {
        await result.current.play();
      });

      expect(mockOnChordChange).toHaveBeenCalledWith(0, 'C');
    });

    test('calls onProgressionEnd when progression ends', async () => {
      const mockOnProgressionEnd = jest.fn();
      const { result } = renderHook(() => useChordPlayer({
        initialProgression: ['C'],
        onProgressionEnd: mockOnProgressionEnd
      }));
      
      await waitFor(() => {
        expect(result.current.isAudioAvailable).toBe(true);
      });

      await act(async () => {
        await result.current.play();
        // Simulate progression ending
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(mockOnProgressionEnd).toHaveBeenCalled();
      });
    });
  });

  describe('cleanup', () => {
    test('cleans up audio context on unmount', async () => {
      const { result, unmount } = renderHook(() => useChordPlayer({
        initialProgression: ['C', 'Am']
      }));
      
      await waitFor(() => {
        expect(result.current.isAudioAvailable).toBe(true);
      });

      unmount();

      expect(mockAudioContext.close).toHaveBeenCalled();
    });
  });
});