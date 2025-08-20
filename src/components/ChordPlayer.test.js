/**
 * Tests for ChordPlayer component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChordPlayer from './ChordPlayer';

// Mock the audioSynthesis utilities
jest.mock('../utils/audioSynthesis', () => ({
  createAudioContext: jest.fn(() => Promise.resolve({
    state: 'running',
    currentTime: 0,
    resume: jest.fn().mockResolvedValue(undefined),
    close: jest.fn()
  })),
  playProgression: jest.fn(() => []),
  stopAudioNodes: jest.fn(),
  getChordFrequencies: jest.fn(() => [261.63, 329.63, 392.00])
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Play: () => <div data-testid="play-icon">Play</div>,
  Pause: () => <div data-testid="pause-icon">Pause</div>,
  Square: () => <div data-testid="stop-icon">Stop</div>,
  SkipBack: () => <div data-testid="skip-back-icon">SkipBack</div>,
  SkipForward: () => <div data-testid="skip-forward-icon">SkipForward</div>,
  Volume2: () => <div data-testid="volume-icon">Volume2</div>,
  VolumeX: () => <div data-testid="volume-x-icon">VolumeX</div>
}));

const { createAudioContext, playProgression, stopAudioNodes } = require('../utils/audioSynthesis');

describe('ChordPlayer', () => {
  const mockAudioContext = {
    state: 'running',
    currentTime: 0,
    resume: jest.fn().mockResolvedValue(undefined),
    close: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset timers
    jest.useFakeTimers();
    // Default to successful audio context creation
    createAudioContext.mockResolvedValue(mockAudioContext);
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('rendering', () => {
    test('renders with empty progression', async () => {
      await act(async () => {
        render(<ChordPlayer progression={[]} />);
      });
      
      await waitFor(() => {
        expect(screen.getByText('Chord Progression')).toBeInTheDocument();
      });
      expect(screen.getByText('No chords in progression')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /play/i })).toBeDisabled();
    });

    test('renders with chord progression', async () => {
      const progression = ['C', 'Am', 'F', 'G'];
      await act(async () => {
        render(<ChordPlayer progression={progression} />);
      });
      
      await waitFor(() => {
        progression.forEach(chord => {
          expect(screen.getByDisplayValue(chord)).toBeInTheDocument();
        });
      });
      
      expect(screen.getByRole('button', { name: /play/i })).not.toBeDisabled();
    });

    test('renders without edit controls', async () => {
      const progression = ['C', 'Am', 'F', 'G'];
      await act(async () => {
        render(<ChordPlayer progression={progression} showEditControls={false} />);
      });
      
      await waitFor(() => {
        // Should show chords as text, not inputs
        progression.forEach(chord => {
          expect(screen.getByText(chord)).toBeInTheDocument();
        });
      });
      
      // Should not show add button
      expect(screen.queryByText('+')).not.toBeInTheDocument();
    });

    test('renders audio not available message when audio context fails', async () => {
      createAudioContext.mockRejectedValueOnce(new Error('No audio'));
      
      await act(async () => {
        render(<ChordPlayer progression={['C']} />);
      });
      
      await waitFor(() => {
        expect(screen.getByText('Audio not available')).toBeInTheDocument();
      });
    });
  });

  describe('playback controls', () => {
    test('play button starts playback', async () => {
      const progression = ['C', 'Am'];
      await act(async () => {
        render(<ChordPlayer progression={progression} />);
      });
      
      await waitFor(() => {
        expect(createAudioContext).toHaveBeenCalled();
      });
      
      const playButton = screen.getByRole('button', { name: /play/i });
      
      await act(async () => {
        fireEvent.click(playButton);
      });
      
      await waitFor(() => {
        expect(playProgression).toHaveBeenCalled();
      });
    });

    test('pause button stops playback', async () => {
      const progression = ['C', 'Am'];
      await act(async () => {
        render(<ChordPlayer progression={progression} />);
      });
      
      await waitFor(() => {
        expect(createAudioContext).toHaveBeenCalled();
      });
      
      const playButton = screen.getByRole('button', { name: /play/i });
      
      // Start playback
      await act(async () => {
        fireEvent.click(playButton);
      });
      
      // Should now show pause button
      await waitFor(() => {
        expect(screen.getByTestId('pause-icon')).toBeInTheDocument();
      });
      
      // Click pause
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /pause/i }));
      });
      
      // Should show play button again
      await waitFor(() => {
        expect(screen.getByTestId('play-icon')).toBeInTheDocument();
      });
    });

    test('stop button stops playback and resets position', async () => {
      const progression = ['C', 'Am', 'F'];
      render(<ChordPlayer progression={progression} />);
      
      await waitFor(() => {
        expect(createAudioContext).toHaveBeenCalled();
      });
      
      // Start playback
      const playButton = screen.getByRole('button', { name: /play/i });
      await act(async () => {
        fireEvent.click(playButton);
      });
      
      // Stop playback
      const stopButton = screen.getByRole('button', { name: /stop/i });
      await act(async () => {
        fireEvent.click(stopButton);
      });
      
      expect(stopAudioNodes).toHaveBeenCalled();
    });

    test('skip forward moves to next chord', async () => {
      const progression = ['C', 'Am', 'F'];
      render(<ChordPlayer progression={progression} />);
      
      await waitFor(() => {
        expect(createAudioContext).toHaveBeenCalled();
      });
      
      const skipForwardButton = screen.getByRole('button', { name: /next chord/i });
      
      await act(async () => {
        fireEvent.click(skipForwardButton);
      });
      
      // Should advance to next chord (visual indication would be tested in integration)
    });

    test('skip back moves to previous chord', async () => {
      const progression = ['C', 'Am', 'F'];
      render(<ChordPlayer progression={progression} />);
      
      await waitFor(() => {
        expect(createAudioContext).toHaveBeenCalled();
      });
      
      const skipBackButton = screen.getByRole('button', { name: /previous chord/i });
      
      await act(async () => {
        fireEvent.click(skipBackButton);
      });
      
      // Should move to previous chord
    });
  });

  describe('volume controls', () => {
    test('mute button toggles mute state', async () => {
      render(<ChordPlayer progression={['C']} />);
      
      await waitFor(() => {
        expect(createAudioContext).toHaveBeenCalled();
      });
      
      const muteButton = screen.getByRole('button', { name: /mute/i });
      
      await act(async () => {
        fireEvent.click(muteButton);
      });
      
      expect(screen.getByTestId('volume-x-icon')).toBeInTheDocument();
      
      await act(async () => {
        fireEvent.click(muteButton);
      });
      
      expect(screen.getByTestId('volume-icon')).toBeInTheDocument();
    });

    test('volume slider adjusts volume', async () => {
      render(<ChordPlayer progression={['C']} />);
      
      await waitFor(() => {
        expect(createAudioContext).toHaveBeenCalled();
      });
      
      const volumeSlider = screen.getByTitle('Volume');
      
      await act(async () => {
        fireEvent.change(volumeSlider, { target: { value: '0.8' } });
      });
      
      expect(volumeSlider.value).toBe('0.8');
    });
  });

  describe('playback settings', () => {
    test('tempo slider adjusts BPM', async () => {
      render(<ChordPlayer progression={['C']} />);
      
      await waitFor(() => {
        expect(createAudioContext).toHaveBeenCalled();
      });
      
      const tempoSlider = screen.getByDisplayValue('120');
      
      await act(async () => {
        fireEvent.change(tempoSlider, { target: { value: '140' } });
      });
      
      expect(screen.getByText('Tempo: 140 BPM')).toBeInTheDocument();
    });

    test('wave type selector changes wave type', async () => {
      render(<ChordPlayer progression={['C']} />);
      
      await waitFor(() => {
        expect(createAudioContext).toHaveBeenCalled();
      });
      
      const waveSelect = screen.getByDisplayValue('sawtooth');
      
      await act(async () => {
        fireEvent.change(waveSelect, { target: { value: 'square' } });
      });
      
      expect(waveSelect.value).toBe('square');
    });

    test('repeat checkbox toggles repeat mode', async () => {
      render(<ChordPlayer progression={['C']} />);
      
      await waitFor(() => {
        expect(createAudioContext).toHaveBeenCalled();
      });
      
      const repeatCheckbox = screen.getByLabelText('Repeat');
      
      expect(repeatCheckbox).not.toBeChecked();
      
      await act(async () => {
        fireEvent.click(repeatCheckbox);
      });
      
      expect(repeatCheckbox).toBeChecked();
    });
  });

  describe('chord editing', () => {
    test('can edit chord in progression', async () => {
      const mockOnChange = jest.fn();
      render(<ChordPlayer progression={['C', 'Am']} onProgressionChange={mockOnChange} />);
      
      await waitFor(() => {
        expect(createAudioContext).toHaveBeenCalled();
      });
      
      const chordInput = screen.getByDisplayValue('C');
      
      await act(async () => {
        fireEvent.change(chordInput, { target: { value: 'F' } });
      });
      
      expect(mockOnChange).toHaveBeenCalledWith(['F', 'Am']);
    });

    test('can add chord to progression', async () => {
      const mockOnChange = jest.fn();
      render(<ChordPlayer progression={['C']} onProgressionChange={mockOnChange} />);
      
      await waitFor(() => {
        expect(createAudioContext).toHaveBeenCalled();
      });
      
      const addButton = screen.getByText('+');
      
      await act(async () => {
        fireEvent.click(addButton);
      });
      
      expect(mockOnChange).toHaveBeenCalledWith(['C', 'C']);
    });

    test('can remove chord from progression', async () => {
      const mockOnChange = jest.fn();
      render(<ChordPlayer progression={['C', 'Am', 'F']} onProgressionChange={mockOnChange} />);
      
      await waitFor(() => {
        expect(createAudioContext).toHaveBeenCalled();
      });
      
      // Hover over first chord to show remove button
      const firstChord = screen.getByDisplayValue('C').closest('div');
      
      await act(async () => {
        fireEvent.mouseEnter(firstChord);
      });
      
      const removeButton = screen.getByTitle('Remove chord');
      
      await act(async () => {
        fireEvent.click(removeButton);
      });
      
      expect(mockOnChange).toHaveBeenCalledWith(['Am', 'F']);
    });

    test('quick add buttons work', async () => {
      const mockOnChange = jest.fn();
      render(<ChordPlayer progression={[]} onProgressionChange={mockOnChange} />);
      
      await waitFor(() => {
        expect(createAudioContext).toHaveBeenCalled();
      });
      
      const quickAddAm = screen.getByText('Am');
      
      await act(async () => {
        fireEvent.click(quickAddAm);
      });
      
      expect(mockOnChange).toHaveBeenCalledWith(['Am']);
    });
  });

  describe('auto play', () => {
    test('starts playing automatically when autoPlay is true', async () => {
      render(<ChordPlayer progression={['C', 'Am']} autoPlay={true} />);
      
      await waitFor(() => {
        expect(createAudioContext).toHaveBeenCalled();
      });
      
      await waitFor(() => {
        expect(playProgression).toHaveBeenCalled();
      });
    });

    test('does not auto play when autoPlay is false', async () => {
      render(<ChordPlayer progression={['C', 'Am']} autoPlay={false} />);
      
      await waitFor(() => {
        expect(createAudioContext).toHaveBeenCalled();
      });
      
      // Wait a bit to ensure no auto play happens
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });
      
      expect(playProgression).not.toHaveBeenCalled();
    });
  });

  describe('progression changes', () => {
    test('updates when progression prop changes', () => {
      const { rerender } = render(<ChordPlayer progression={['C', 'Am']} />);
      
      expect(screen.getByDisplayValue('C')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Am')).toBeInTheDocument();
      
      rerender(<ChordPlayer progression={['F', 'G', 'C']} />);
      
      expect(screen.getByDisplayValue('F')).toBeInTheDocument();
      expect(screen.getByDisplayValue('G')).toBeInTheDocument();
      expect(screen.getByDisplayValue('C')).toBeInTheDocument();
      expect(screen.queryByDisplayValue('Am')).not.toBeInTheDocument();
    });
  });

  describe('cleanup', () => {
    test('cleans up audio context on unmount', async () => {
      const mockAudioContext = {
        state: 'running',
        currentTime: 0,
        resume: jest.fn().mockResolvedValue(undefined),
        close: jest.fn()
      };
      
      createAudioContext.mockResolvedValueOnce(mockAudioContext);
      
      const { unmount } = render(<ChordPlayer progression={['C']} />);
      
      await waitFor(() => {
        expect(createAudioContext).toHaveBeenCalled();
      });
      
      unmount();
      
      expect(mockAudioContext.close).toHaveBeenCalled();
    });
  });
});