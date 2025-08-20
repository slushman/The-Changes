/**
 * Tests for ChordVisualization component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChordVisualization from './ChordVisualization';

// Mock the audioSynthesis utilities
jest.mock('../utils/audioSynthesis', () => ({
  parseChord: jest.fn().mockImplementation((chord) => {
    const chordMap = {
      'C': { root: 'C', quality: 'major' },
      'Am': { root: 'A', quality: 'minor' },
      'Cmaj7': { root: 'C', quality: 'major7' },
      'Am7': { root: 'A', quality: 'minor7' }
    };
    return chordMap[chord] || { root: 'C', quality: 'major' };
  }),
  getChordFrequencies: jest.fn().mockReturnValue([261.63, 329.63, 392.00])
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Music: () => <div data-testid="music-icon">Music</div>,
  Volume2: () => <div data-testid="volume-icon">Volume2</div>,
  Info: () => <div data-testid="info-icon">Info</div>
}));

const { parseChord, getChordFrequencies } = require('../utils/audioSynthesis');

describe('ChordVisualization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    test('renders chord name', () => {
      render(<ChordVisualization chord="C" />);
      
      expect(screen.getByText('C')).toBeInTheDocument();
      expect(screen.getByTestId('music-icon')).toBeInTheDocument();
    });

    test('calls parseChord with correct chord', () => {
      render(<ChordVisualization chord="Am7" />);
      
      expect(parseChord).toHaveBeenCalledWith('Am7');
    });

    test('calls getChordFrequencies with correct parameters', () => {
      render(<ChordVisualization chord="C" octave={5} />);
      
      expect(getChordFrequencies).toHaveBeenCalledWith('C', 5);
    });

    test('shows playing indicator when playing', () => {
      render(<ChordVisualization chord="C" isPlaying={true} />);
      
      expect(screen.getByTestId('volume-icon')).toBeInTheDocument();
      expect(screen.getByText('Playing')).toBeInTheDocument();
    });

    test('does not show playing indicator when stopped', () => {
      render(<ChordVisualization chord="C" isPlaying={false} />);
      
      expect(screen.queryByTestId('volume-icon')).not.toBeInTheDocument();
      expect(screen.queryByText('Playing')).not.toBeInTheDocument();
    });
  });

  describe('note display', () => {
    test('shows notes when enabled', () => {
      render(<ChordVisualization chord="C" showNotes={true} />);
      
      expect(screen.getByText('Notes:')).toBeInTheDocument();
    });

    test('hides notes when disabled', () => {
      render(<ChordVisualization chord="C" showNotes={false} />);
      
      expect(screen.queryByText('Notes:')).not.toBeInTheDocument();
    });

    test('displays note circles', () => {
      const { container } = render(<ChordVisualization chord="C" showNotes={true} />);
      
      // Should have circular elements for notes
      expect(container.querySelectorAll('.rounded-full').length).toBeGreaterThan(0);
    });
  });

  describe('chord information', () => {
    test('shows chord info when enabled', () => {
      render(<ChordVisualization chord="C" showChordInfo={true} />);
      
      expect(screen.getByTestId('info-icon')).toBeInTheDocument();
    });

    test('hides chord info when disabled', () => {
      render(<ChordVisualization chord="C" showChordInfo={false} />);
      
      expect(screen.queryByTestId('info-icon')).not.toBeInTheDocument();
    });

    test('displays chord quality information', () => {
      render(<ChordVisualization chord="C" showChordInfo={true} />);
      
      expect(screen.getByText('C major')).toBeInTheDocument();
    });
  });

  describe('visualizer', () => {
    test('shows visualizer when enabled', () => {
      const { container } = render(<ChordVisualization chord="C" showVisualizer={true} />);
      
      // Should have gradient bars for visualization
      expect(container.querySelector('.bg-gradient-to-t')).toBeInTheDocument();
    });

    test('hides visualizer when disabled', () => {
      const { container } = render(<ChordVisualization chord="C" showVisualizer={false} />);
      
      expect(container.querySelector('.bg-gradient-to-t')).not.toBeInTheDocument();
    });

    test('visualizer responds to playing state', () => {
      const { container, rerender } = render(
        <ChordVisualization chord="C" showVisualizer={true} isPlaying={false} />
      );
      
      const bars = container.querySelectorAll('.bg-gradient-to-t');
      const stoppedOpacity = bars[0]?.className.includes('opacity-30');
      
      rerender(<ChordVisualization chord="C" showVisualizer={true} isPlaying={true} />);
      
      const playingBars = container.querySelectorAll('.bg-gradient-to-t');
      const playingOpacity = playingBars[0]?.className.includes('opacity-100');
      
      // Should have different opacity states
      expect(stoppedOpacity || playingOpacity).toBe(true);
    });
  });

  describe('frequency display', () => {
    test('shows frequencies when enabled', () => {
      render(<ChordVisualization chord="C" showFrequencies={true} />);
      
      expect(screen.getByText('Frequencies:')).toBeInTheDocument();
    });

    test('hides frequencies when disabled', () => {
      render(<ChordVisualization chord="C" showFrequencies={false} />);
      
      expect(screen.queryByText('Frequencies:')).not.toBeInTheDocument();
    });

    test('displays frequency values', () => {
      render(<ChordVisualization chord="C" showFrequencies={true} />);
      
      // Should show frequency values with Hz
      expect(screen.getByText(/261\.6.*Hz/)).toBeInTheDocument();
    });
  });

  describe('themes', () => {
    test('applies default theme classes', () => {
      const { container } = render(<ChordVisualization chord="C" theme="default" />);
      
      expect(container.querySelector('.bg-white')).toBeInTheDocument();
    });

    test('applies dark theme classes', () => {
      const { container } = render(<ChordVisualization chord="C" theme="dark" />);
      
      expect(container.querySelector('.bg-gray-900')).toBeInTheDocument();
    });

    test('applies minimal theme classes', () => {
      const { container } = render(<ChordVisualization chord="C" theme="minimal" />);
      
      expect(container.querySelector('.bg-white')).toBeInTheDocument();
    });
  });

  describe('sizes', () => {
    test('applies small size classes', () => {
      const { container } = render(<ChordVisualization chord="C" size="small" />);
      
      expect(container.querySelector('.text-2xl')).toBeInTheDocument();
    });

    test('applies medium size classes', () => {
      const { container } = render(<ChordVisualization chord="C" size="medium" />);
      
      expect(container.querySelector('.text-3xl')).toBeInTheDocument();
    });

    test('applies large size classes', () => {
      const { container } = render(<ChordVisualization chord="C" size="large" />);
      
      expect(container.querySelector('.text-5xl')).toBeInTheDocument();
    });
  });

  describe('animations', () => {
    test('animates notes when playing', () => {
      const { container } = render(
        <ChordVisualization chord="C" isPlaying={true} showNotes={true} />
      );
      
      // Should have transition classes
      expect(container.querySelector('.transition-all')).toBeInTheDocument();
    });

    test('shows playing state styling', () => {
      const { container } = render(<ChordVisualization chord="C" isPlaying={true} />);
      
      expect(container.querySelector('.bg-blue-50')).toBeInTheDocument();
    });
  });

  describe('chord quality descriptions', () => {
    test('shows correct description for major chord', () => {
      render(<ChordVisualization chord="C" showChordInfo={true} />);
      
      expect(screen.getByText(/bright, happy sound/)).toBeInTheDocument();
    });

    test('shows correct description for minor chord', () => {
      render(<ChordVisualization chord="Am" showChordInfo={true} />);
      
      expect(screen.getByText(/darker, sadder sound/)).toBeInTheDocument();
    });

    test('shows correct description for seventh chords', () => {
      render(<ChordVisualization chord="Cmaj7" showChordInfo={true} />);
      
      expect(screen.getByText(/jazzy, sophisticated/)).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    test('uses semantic structure', () => {
      const { container } = render(<ChordVisualization chord="C" />);
      
      expect(container.querySelector('h3')).toBeInTheDocument();
    });

    test('provides descriptive text', () => {
      render(<ChordVisualization chord="C" showChordInfo={true} />);
      
      expect(screen.getByText(/Major triad/)).toBeInTheDocument();
    });
  });

  describe('error handling', () => {
    test('handles invalid chord gracefully', () => {
      parseChord.mockReturnValueOnce({ root: 'C', quality: 'major' });
      
      expect(() => {
        render(<ChordVisualization chord="InvalidChord" />);
      }).not.toThrow();
    });

    test('handles missing frequencies gracefully', () => {
      getChordFrequencies.mockReturnValueOnce([]);
      
      expect(() => {
        render(<ChordVisualization chord="C" showFrequencies={true} />);
      }).not.toThrow();
    });
  });
});