/**
 * Tests for ProgressionVisualizer component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProgressionVisualizer from './ProgressionVisualizer';

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Play: () => <div data-testid="play-icon">Play</div>,
  Volume2: () => <div data-testid="volume-icon">Volume2</div>
}));

describe('ProgressionVisualizer', () => {
  const mockProgression = ['C', 'Am', 'F', 'G'];

  describe('rendering', () => {
    test('renders empty state', () => {
      render(<ProgressionVisualizer progression={[]} />);
      
      expect(screen.getByText('No chord progression to display')).toBeInTheDocument();
    });

    test('renders chord progression', () => {
      render(<ProgressionVisualizer progression={mockProgression} />);
      
      mockProgression.forEach(chord => {
        expect(screen.getByText(chord)).toBeInTheDocument();
      });
    });

    test('highlights current chord when playing', () => {
      render(
        <ProgressionVisualizer 
          progression={mockProgression}
          currentChordIndex={1}
          isPlaying={true}
        />
      );
      
      const chordElements = screen.getAllByText(/^[A-G]m?$/);
      expect(chordElements[1]).toHaveClass('bg-blue-100');
    });

    test('shows playing indicator on current chord', () => {
      render(
        <ProgressionVisualizer 
          progression={mockProgression}
          currentChordIndex={0}
          isPlaying={true}
        />
      );
      
      expect(screen.getByTestId('play-icon')).toBeInTheDocument();
    });
  });

  describe('layouts', () => {
    test('renders horizontal layout by default', () => {
      const { container } = render(<ProgressionVisualizer progression={mockProgression} />);
      
      expect(container.querySelector('.flex')).toBeInTheDocument();
    });

    test('renders vertical layout', () => {
      const { container } = render(
        <ProgressionVisualizer 
          progression={mockProgression}
          layout="vertical"
        />
      );
      
      expect(container.querySelector('.flex-col')).toBeInTheDocument();
    });

    test('renders circular layout', () => {
      const { container } = render(
        <ProgressionVisualizer 
          progression={mockProgression}
          layout="circular"
        />
      );
      
      expect(container.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('themes', () => {
    test('applies default theme', () => {
      const { container } = render(
        <ProgressionVisualizer 
          progression={mockProgression}
          theme="default"
        />
      );
      
      expect(container.querySelector('.bg-gray-50')).toBeInTheDocument();
    });

    test('applies dark theme', () => {
      const { container } = render(
        <ProgressionVisualizer 
          progression={mockProgression}
          theme="dark"
        />
      );
      
      expect(container.querySelector('.bg-gray-900')).toBeInTheDocument();
    });

    test('applies minimal theme', () => {
      const { container } = render(
        <ProgressionVisualizer 
          progression={mockProgression}
          theme="minimal"
        />
      );
      
      expect(container.querySelector('.bg-transparent')).toBeInTheDocument();
    });
  });

  describe('sizes', () => {
    test('applies small size classes', () => {
      const { container } = render(
        <ProgressionVisualizer 
          progression={mockProgression}
          size="small"
        />
      );
      
      expect(container.querySelector('.w-12')).toBeInTheDocument();
    });

    test('applies medium size classes', () => {
      const { container } = render(
        <ProgressionVisualizer 
          progression={mockProgression}
          size="medium"
        />
      );
      
      expect(container.querySelector('.w-16')).toBeInTheDocument();
    });

    test('applies large size classes', () => {
      const { container } = render(
        <ProgressionVisualizer 
          progression={mockProgression}
          size="large"
        />
      );
      
      expect(container.querySelector('.w-20')).toBeInTheDocument();
    });
  });

  describe('features', () => {
    test('shows waveform when enabled', () => {
      const { container } = render(
        <ProgressionVisualizer 
          progression={mockProgression}
          showWaveform={true}
        />
      );
      
      // Look for waveform bars
      expect(container.querySelectorAll('.bg-gradient-to-t').length).toBeGreaterThan(0);
    });

    test('hides waveform when disabled', () => {
      const { container } = render(
        <ProgressionVisualizer 
          progression={mockProgression}
          showWaveform={false}
        />
      );
      
      // Should not find waveform container
      expect(container.querySelector('.flex.items-end.space-x-1')).not.toBeInTheDocument();
    });

    test('shows progress bar when enabled', () => {
      const { container } = render(
        <ProgressionVisualizer 
          progression={mockProgression}
          showProgress={true}
          currentChordIndex={1}
        />
      );
      
      expect(container.querySelector('.bg-blue-500')).toBeInTheDocument();
    });

    test('shows labels when enabled', () => {
      render(
        <ProgressionVisualizer 
          progression={mockProgression}
          showLabels={true}
          currentChordIndex={1}
        />
      );
      
      expect(screen.getByText('2 / 4')).toBeInTheDocument();
    });

    test('hides labels when disabled', () => {
      render(
        <ProgressionVisualizer 
          progression={mockProgression}
          showLabels={false}
          currentChordIndex={1}
        />
      );
      
      expect(screen.queryByText('2 / 4')).not.toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    test('calls onChordClick when chord is clicked', () => {
      const mockOnChordClick = jest.fn();
      render(
        <ProgressionVisualizer 
          progression={mockProgression}
          onChordClick={mockOnChordClick}
        />
      );
      
      fireEvent.click(screen.getByText('Am'));
      expect(mockOnChordClick).toHaveBeenCalledWith(1);
    });

    test('provides hover effects on chords', () => {
      const { container } = render(<ProgressionVisualizer progression={mockProgression} />);
      
      const chordElement = screen.getByText('C');
      expect(chordElement).toHaveClass('hover:scale-105');
    });
  });

  describe('progress tracking', () => {
    test('shows correct progress percentage', () => {
      const { container } = render(
        <ProgressionVisualizer 
          progression={mockProgression}
          currentChordIndex={1}
          showProgress={true}
        />
      );
      
      // Should show 50% progress (2/4 * 100)
      const progressBar = container.querySelector('[style*="width: 50%"]');
      expect(progressBar).toBeInTheDocument();
    });

    test('marks played chords differently', () => {
      render(
        <ProgressionVisualizer 
          progression={mockProgression}
          currentChordIndex={2}
          isPlaying={true}
        />
      );
      
      // First two chords should be marked as played
      const chordElements = screen.getAllByText(/^[A-G]m?$/);
      expect(chordElements[0]).toHaveClass('bg-gray-100');
      expect(chordElements[1]).toHaveClass('bg-gray-100');
      expect(chordElements[2]).toHaveClass('bg-blue-100'); // Current
    });
  });

  describe('animations', () => {
    test('applies animation classes when playing', () => {
      render(
        <ProgressionVisualizer 
          progression={mockProgression}
          currentChordIndex={0}
          isPlaying={true}
        />
      );
      
      const currentChord = screen.getByText('C');
      expect(currentChord).toHaveClass('shadow-md');
    });

    test('shows bouncing animation on current chord', () => {
      render(
        <ProgressionVisualizer 
          progression={mockProgression}
          currentChordIndex={0}
          isPlaying={true}
        />
      );
      
      // Look for bouncing dots
      const { container } = render(
        <ProgressionVisualizer 
          progression={mockProgression}
          currentChordIndex={0}
          isPlaying={true}
        />
      );
      
      expect(container.querySelector('.animate-bounce')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    test('provides tooltips for chords', () => {
      render(<ProgressionVisualizer progression={mockProgression} />);
      
      const chordElement = screen.getByText('C');
      expect(chordElement).toHaveAttribute('title', 'C - Click to jump to this chord');
    });

    test('uses semantic HTML structure', () => {
      const { container } = render(<ProgressionVisualizer progression={mockProgression} />);
      
      expect(container.querySelector('div')).toBeInTheDocument();
    });
  });
});