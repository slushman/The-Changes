/**
 * Unit tests for SectionChordVisualization component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SectionChordVisualization from './SectionChordVisualization';

// Mock Nashville numbers utility
jest.mock('../utils/nashvilleNumbers', () => ({
  progressionToNashville: (progression, key) => {
    // Simple mock conversion for testing
    const mockConversions = {
      'C': '1', 'Am': '6m', 'F': '4', 'G': '5',
      'Dm': '2m', 'Em': '3m'
    };
    return progression.map(chord => mockConversions[chord] || chord);
  },
  chordToNashville: (chord, key) => {
    const mockConversions = {
      'C': '1', 'Am': '6m', 'F': '4', 'G': '5',
      'Dm': '2m', 'Em': '3m'
    };
    return mockConversions[chord] || chord;
  }
}));

describe('SectionChordVisualization Component', () => {
  const defaultProps = {
    sectionName: 'verse',
    progression: ['C', 'Am', 'F', 'G'],
    bars: 4,
    repetitions: 2,
    complexity: 'simple',
    audioTimestamp: { start: '0:15', end: '0:45' },
    keySignature: 'C',
    showNashville: false,
    isPlaying: false,
    currentChordIndex: -1,
    onPlaySection: jest.fn(),
    onChordClick: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    test('renders section name correctly', () => {
      render(<SectionChordVisualization {...defaultProps} />);
      
      expect(screen.getByText('Verse')).toBeInTheDocument();
    });

    test('renders section metadata', () => {
      render(<SectionChordVisualization {...defaultProps} />);
      
      expect(screen.getByText('simple')).toBeInTheDocument();
      expect(screen.getByText('4 bars × 2 times')).toBeInTheDocument();
      expect(screen.getByText('0:15 - 0:45')).toBeInTheDocument();
    });

    test('renders all chords in progression', () => {
      render(<SectionChordVisualization {...defaultProps} />);
      
      expect(screen.getByText('C')).toBeInTheDocument();
      expect(screen.getByText('Am')).toBeInTheDocument();
      expect(screen.getByText('F')).toBeInTheDocument();
      expect(screen.getByText('G')).toBeInTheDocument();
    });

    test('renders play button', () => {
      render(<SectionChordVisualization {...defaultProps} />);
      
      expect(screen.getByText('Play')).toBeInTheDocument();
    });
  });

  describe('Section Name Formatting', () => {
    test('formats hyphenated section names correctly', () => {
      render(
        <SectionChordVisualization 
          {...defaultProps} 
          sectionName="pre-chorus" 
        />
      );
      
      expect(screen.getByText('Pre Chorus')).toBeInTheDocument();
    });

    test('formats single word section names correctly', () => {
      render(
        <SectionChordVisualization 
          {...defaultProps} 
          sectionName="bridge" 
        />
      );
      
      expect(screen.getByText('Bridge')).toBeInTheDocument();
    });
  });

  describe('Complexity Styling', () => {
    test('applies correct styling for simple complexity', () => {
      render(<SectionChordVisualization {...defaultProps} complexity="simple" />);
      
      const complexityBadge = screen.getByText('simple');
      expect(complexityBadge).toHaveClass('bg-green-100', 'text-green-800');
    });

    test('applies correct styling for intermediate complexity', () => {
      render(<SectionChordVisualization {...defaultProps} complexity="intermediate" />);
      
      const complexityBadge = screen.getByText('intermediate');
      expect(complexityBadge).toHaveClass('bg-yellow-100', 'text-yellow-800');
    });

    test('applies correct styling for complex complexity', () => {
      render(<SectionChordVisualization {...defaultProps} complexity="complex" />);
      
      const complexityBadge = screen.getByText('complex');
      expect(complexityBadge).toHaveClass('bg-red-100', 'text-red-800');
    });
  });

  describe('Nashville Numbers Toggle', () => {
    test('displays chord names by default', () => {
      render(<SectionChordVisualization {...defaultProps} showNashville={false} />);
      
      expect(screen.getByText('C')).toBeInTheDocument();
      expect(screen.getByText('Am')).toBeInTheDocument();
      expect(screen.getByText('F')).toBeInTheDocument();
      expect(screen.getByText('G')).toBeInTheDocument();
    });

    test('displays Nashville numbers when enabled', () => {
      render(<SectionChordVisualization {...defaultProps} showNashville={true} />);
      
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('6m')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    test('shows both chord names and Nashville numbers in summary', () => {
      render(<SectionChordVisualization {...defaultProps} showNashville={false} />);
      
      // Should show chord names in main display and Nashville in secondary
      expect(screen.getByText('C - Am - F - G')).toBeInTheDocument();
      expect(screen.getByText('1 - 6m - 4 - 5')).toBeInTheDocument();
    });
  });

  describe('Bar Layout', () => {
    test('displays bar numbers', () => {
      render(<SectionChordVisualization {...defaultProps} />);
      
      expect(screen.getByText('Bar 1:')).toBeInTheDocument();
      expect(screen.getByText('Bar 2:')).toBeInTheDocument();
      expect(screen.getByText('Bar 3:')).toBeInTheDocument();
      expect(screen.getByText('Bar 4:')).toBeInTheDocument();
    });

    test('handles different bar configurations', () => {
      // 2 bars with 4 chords = 2 chords per bar
      render(
        <SectionChordVisualization 
          {...defaultProps} 
          bars={2} 
          progression={['C', 'Am', 'F', 'G']}
        />
      );
      
      expect(screen.getByText('Bar 1:')).toBeInTheDocument();
      expect(screen.getByText('Bar 2:')).toBeInTheDocument();
      expect(screen.queryByText('Bar 3:')).not.toBeInTheDocument();
    });
  });

  describe('Playback State', () => {
    test('shows stop button when playing', () => {
      render(<SectionChordVisualization {...defaultProps} isPlaying={true} />);
      
      expect(screen.getByText('Stop')).toBeInTheDocument();
      expect(screen.queryByText('Play')).not.toBeInTheDocument();
    });

    test('highlights current chord when playing', () => {
      render(
        <SectionChordVisualization 
          {...defaultProps} 
          isPlaying={true} 
          currentChordIndex={1} 
        />
      );
      
      const chords = screen.getAllByRole('button').filter(button => 
        ['C', 'Am', 'F', 'G'].includes(button.textContent)
      );
      
      // Second chord (Am) should be highlighted
      expect(chords[1]).toHaveClass('bg-blue-100', 'border-blue-400');
    });

    test('styles played chords differently', () => {
      render(
        <SectionChordVisualization 
          {...defaultProps} 
          isPlaying={true} 
          currentChordIndex={2} 
        />
      );
      
      const chords = screen.getAllByRole('button').filter(button => 
        ['C', 'Am', 'F', 'G'].includes(button.textContent)
      );
      
      // First two chords should be grayed out (already played)
      expect(chords[0]).toHaveClass('bg-gray-100', 'border-gray-300');
      expect(chords[1]).toHaveClass('bg-gray-100', 'border-gray-300');
      
      // Current chord should be highlighted
      expect(chords[2]).toHaveClass('bg-blue-100', 'border-blue-400');
    });
  });

  describe('User Interactions', () => {
    test('calls onPlaySection when play button is clicked', () => {
      const mockOnPlaySection = jest.fn();
      render(
        <SectionChordVisualization 
          {...defaultProps} 
          onPlaySection={mockOnPlaySection} 
        />
      );
      
      const playButton = screen.getByText('Play');
      fireEvent.click(playButton);
      
      expect(mockOnPlaySection).toHaveBeenCalledWith('verse', ['C', 'Am', 'F', 'G']);
    });

    test('calls onChordClick when chord is clicked', () => {
      const mockOnChordClick = jest.fn();
      render(
        <SectionChordVisualization 
          {...defaultProps} 
          onChordClick={mockOnChordClick} 
        />
      );
      
      const chord = screen.getByText('Am');
      fireEvent.click(chord);
      
      expect(mockOnChordClick).toHaveBeenCalledWith(1); // Index of 'Am'
    });

    test('toggles chord information panel', () => {
      render(<SectionChordVisualization {...defaultProps} />);
      
      const infoButton = screen.getByTitle('Toggle chord information');
      fireEvent.click(infoButton);
      
      // Should show chord info panel when a chord is hovered
      const chord = screen.getByText('C');
      fireEvent.mouseEnter(chord);
      
      expect(screen.getByText('Chord Information')).toBeInTheDocument();
    });
  });

  describe('Chord Information Panel', () => {
    test('shows detailed chord information on hover when info is enabled', () => {
      render(<SectionChordVisualization {...defaultProps} />);
      
      // Enable chord info
      const infoButton = screen.getByTitle('Toggle chord information');
      fireEvent.click(infoButton);
      
      // Hover over a chord
      const chord = screen.getByText('Am');
      fireEvent.mouseEnter(chord);
      
      expect(screen.getByText('Chord Information')).toBeInTheDocument();
      expect(screen.getByText('Am')).toBeInTheDocument();
      expect(screen.getByText('6m')).toBeInTheDocument();
      expect(screen.getByText('2 of 4')).toBeInTheDocument(); // Position
    });

    test('hides chord information when mouse leaves', () => {
      render(<SectionChordVisualization {...defaultProps} />);
      
      // Enable chord info
      const infoButton = screen.getByTitle('Toggle chord information');
      fireEvent.click(infoButton);
      
      // Hover over and then leave a chord
      const chord = screen.getByText('Am');
      fireEvent.mouseEnter(chord);
      fireEvent.mouseLeave(chord);
      
      expect(screen.queryByText('Chord Information')).not.toBeInTheDocument();
    });
  });

  describe('Repetition Display', () => {
    test('shows repetition indicator for multiple repetitions', () => {
      render(<SectionChordVisualization {...defaultProps} repetitions={3} />);
      
      expect(screen.getByText('Repeat 3 times')).toBeInTheDocument();
    });

    test('does not show repetition indicator for single repetition', () => {
      render(<SectionChordVisualization {...defaultProps} repetitions={1} />);
      
      expect(screen.queryByText(/Repeat.*times/)).not.toBeInTheDocument();
    });
  });

  describe('Summary Statistics', () => {
    test('displays correct statistics', () => {
      render(<SectionChordVisualization {...defaultProps} />);
      
      expect(screen.getByText('4')).toBeInTheDocument(); // Total chords
      expect(screen.getByText('4')).toBeInTheDocument(); // Unique chords (all different)
      expect(screen.getByText('C major')).toBeInTheDocument(); // Key
    });

    test('calculates unique chords correctly', () => {
      render(
        <SectionChordVisualization 
          {...defaultProps} 
          progression={['C', 'Am', 'C', 'G']} // C repeated
        />
      );
      
      // Should show 3 unique chords out of 4 total
      const uniqueChordsElement = screen.getByText('Unique Chords:').nextSibling;
      expect(uniqueChordsElement).toHaveTextContent('3');
    });
  });

  describe('Audio Timestamp Handling', () => {
    test('displays audio timestamp when provided', () => {
      render(<SectionChordVisualization {...defaultProps} />);
      
      expect(screen.getByText('0:15 - 0:45')).toBeInTheDocument();
    });

    test('does not display audio timestamp when not provided', () => {
      render(
        <SectionChordVisualization 
          {...defaultProps} 
          audioTimestamp={null} 
        />
      );
      
      expect(screen.queryByText('0:15 - 0:45')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('provides tooltips for chord buttons', () => {
      render(<SectionChordVisualization {...defaultProps} />);
      
      const chord = screen.getByText('Am');
      expect(chord).toHaveAttribute('title', 'Am (6m)');
    });

    test('provides tooltips with Nashville numbers when enabled', () => {
      render(<SectionChordVisualization {...defaultProps} showNashville={true} />);
      
      const nashvilleNumber = screen.getByText('6m');
      expect(nashvilleNumber).toHaveAttribute('title', '6m (Am)');
    });
  });
});