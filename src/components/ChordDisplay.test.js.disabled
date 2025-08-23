/**
 * Unit tests for ChordDisplay component
 * Tests visual feedback, progress indicators, and Nashville number system
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChordDisplay from './ChordDisplay';

// Mock the Nashville numbers utility
jest.mock('../utils/nashvilleNumbers', () => ({
  progressionToNashville: jest.fn((chords, key) => {
    const mockConversions = {
      'C': '1', 'F': '4', 'G': '7', 'Am': '6m',
      'Dm': '2m', 'Em': '3m', 'Bb': 'b7'
    };
    return chords.map(chord => mockConversions[chord] || '?');
  }),
  detectKey: jest.fn((chords) => {
    // Simple mock key detection
    if (chords.includes('C') && chords.includes('F') && chords.includes('G')) return 'C';
    if (chords.includes('G') && chords.includes('C') && chords.includes('D')) return 'G';
    return 'C';
  })
}));

describe('ChordDisplay', () => {
  const defaultProps = {
    chords: ['C', 'Am', 'F', 'G'],
    currentIndex: 0,
    chordProgress: 0,
    overallProgress: 0,
    isPlaying: false,
    onChordClick: jest.fn(),
    showNashville: false,
    onToggleNashville: jest.fn(),
    keySignature: 'C',
    onKeyChange: jest.fn(),
    autoDetectKey: true
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    test('renders chord progression correctly', () => {
      render(<ChordDisplay {...defaultProps} />);
      
      expect(screen.getByText('C')).toBeInTheDocument();
      expect(screen.getByText('Am')).toBeInTheDocument();
      expect(screen.getByText('F')).toBeInTheDocument();
      expect(screen.getByText('G')).toBeInTheDocument();
    });

    test('renders empty state when no chords provided', () => {
      render(<ChordDisplay {...defaultProps} chords={[]} />);
      
      expect(screen.getByText('No chord progression to display')).toBeInTheDocument();
    });

    test('shows correct key information', () => {
      render(<ChordDisplay {...defaultProps} />);
      
      expect(screen.getByText(/Key:/)).toBeInTheDocument();
      expect(screen.getByText(/C major/)).toBeInTheDocument();
      expect(screen.getByText(/Length:/)).toBeInTheDocument();
      expect(screen.getByText(/4 chords/)).toBeInTheDocument();
    });
  });

  describe('Nashville number system', () => {
    test('toggles between chord names and Nashville numbers', () => {
      const { rerender } = render(<ChordDisplay {...defaultProps} />);
      
      // Initially shows chord names
      expect(screen.getByText('Chord Names')).toBeInTheDocument();
      expect(screen.getByText('C')).toBeInTheDocument();
      
      // Toggle to Nashville numbers
      rerender(<ChordDisplay {...defaultProps} showNashville={true} />);
      
      expect(screen.getByText('Nashville Numbers')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument(); // C = 1 in C major
    });

    test('calls onToggleNashville when toggle button clicked', () => {
      render(<ChordDisplay {...defaultProps} />);
      
      const toggleButton = screen.getByTitle(/Show Nashville numbers/);
      fireEvent.click(toggleButton);
      
      expect(defaultProps.onToggleNashville).toHaveBeenCalled();
    });

    test('displays both representations in info section', () => {
      render(<ChordDisplay {...defaultProps} showNashville={true} />);
      
      expect(screen.getByText(/Chord names:/)).toBeInTheDocument();
      expect(screen.getByText('C - Am - F - G')).toBeInTheDocument();
    });
  });

  describe('playback visual feedback', () => {
    test('highlights currently playing chord', () => {
      render(<ChordDisplay {...defaultProps} isPlaying={true} currentIndex={1} />);
      
      const chordElements = screen.getAllByText(/[CDEFGAB]/);
      const playingChord = chordElements.find(el => 
        el.closest('div')?.classList.contains('scale-110')
      );
      
      expect(playingChord).toBeTruthy();
    });

    test('shows playing indicators when isPlaying is true', () => {
      render(<ChordDisplay {...defaultProps} isPlaying={true} currentIndex={0} />);
      
      // Should show playing indicators (volume icon, pulsing dot, etc.)
      expect(document.querySelector('.animate-bounce')).toBeInTheDocument();
      expect(document.querySelector('.animate-ping')).toBeInTheDocument();
    });

    test('shows progress bar for current chord', () => {
      render(<ChordDisplay {...defaultProps} 
        isPlaying={true} 
        currentIndex={0} 
        chordProgress={0.5} 
      />);
      
      const progressBar = document.querySelector('[style*="width: 50%"]');
      expect(progressBar).toBeInTheDocument();
    });

    test('shows completion indicators for played chords', () => {
      render(<ChordDisplay {...defaultProps} 
        isPlaying={true} 
        currentIndex={2} 
      />);
      
      // Previous chords should have completion styling
      const completedChords = document.querySelectorAll('.bg-green-50');
      expect(completedChords.length).toBeGreaterThan(0);
    });
  });

  describe('overall progress indicator', () => {
    test('shows progress indicator when playing', () => {
      render(<ChordDisplay {...defaultProps} 
        isPlaying={true} 
        overallProgress={0.25} 
      />);
      
      expect(screen.getByText('Progression Progress')).toBeInTheDocument();
      expect(screen.getByText('25% complete')).toBeInTheDocument();
    });

    test('hides progress indicator when not playing', () => {
      render(<ChordDisplay {...defaultProps} 
        isPlaying={false} 
        overallProgress={0.25} 
      />);
      
      expect(screen.queryByText('Progression Progress')).not.toBeInTheDocument();
    });

    test('shows current position in progression', () => {
      render(<ChordDisplay {...defaultProps} 
        isPlaying={true} 
        currentIndex={1} 
        overallProgress={0.5} 
      />);
      
      expect(screen.getByText('2 / 4')).toBeInTheDocument();
    });

    test('renders chord segment indicators', () => {
      render(<ChordDisplay {...defaultProps} 
        isPlaying={true} 
        overallProgress={0.25} 
      />);
      
      // Should have segment indicators for each chord
      const segments = document.querySelectorAll('.border-r.border-gray-300');
      expect(segments.length).toBe(3); // 4 chords = 3 borders (last one has no border)
    });
  });

  describe('key management', () => {
    test('calls onKeyChange when key selector changes', () => {
      render(<ChordDisplay {...defaultProps} />);
      
      const keySelector = screen.getByDisplayValue('C');
      fireEvent.change(keySelector, { target: { value: 'G' } });
      
      expect(defaultProps.onKeyChange).toHaveBeenCalledWith('G');
    });

    test('calls detectKey when auto-detect button clicked', () => {
      const { detectKey } = require('../utils/nashvilleNumbers');
      render(<ChordDisplay {...defaultProps} />);
      
      const autoDetectButton = screen.getByTitle(/Auto-detect key/);
      fireEvent.click(autoDetectButton);
      
      expect(detectKey).toHaveBeenCalledWith(['C', 'Am', 'F', 'G']);
    });

    test('shows all common keys in selector', () => {
      render(<ChordDisplay {...defaultProps} />);
      
      const keySelector = screen.getByDisplayValue('C');
      const options = keySelector.querySelectorAll('option');
      
      expect(options.length).toBe(12); // All 12 keys
      expect(Array.from(options).some(opt => opt.value === 'C')).toBe(true);
      expect(Array.from(options).some(opt => opt.value === 'F#')).toBe(true);
      expect(Array.from(options).some(opt => opt.value === 'Bb')).toBe(true);
    });
  });

  describe('chord interaction', () => {
    test('calls onChordClick when chord is clicked', () => {
      render(<ChordDisplay {...defaultProps} />);
      
      const chordButton = screen.getByText('Am');
      fireEvent.click(chordButton);
      
      expect(defaultProps.onChordClick).toHaveBeenCalledWith(1); // Am is at index 1
    });

    test('shows tooltip with both representations', () => {
      render(<ChordDisplay {...defaultProps} showNashville={true} />);
      
      const chordButton = screen.getByText('1'); // C chord in Nashville
      expect(chordButton).toHaveAttribute('title', expect.stringContaining('C'));
    });
  });

  describe('different sizes', () => {
    test('applies small size classes correctly', () => {
      render(<ChordDisplay {...defaultProps} size="small" />);
      
      const chordButton = screen.getByText('C');
      expect(chordButton.closest('div')).toHaveClass('w-10', 'h-10', 'text-sm');
    });

    test('applies large size classes correctly', () => {
      render(<ChordDisplay {...defaultProps} size="large" />);
      
      const chordButton = screen.getByText('C');
      expect(chordButton.closest('div')).toHaveClass('w-20', 'h-20', 'text-xl');
    });
  });

  describe('auto-detect key functionality', () => {
    test('auto-detects key when chords change and autoDetectKey is true', () => {
      const { detectKey } = require('../utils/nashvilleNumbers');
      const { rerender } = render(<ChordDisplay {...defaultProps} autoDetectKey={true} />);
      
      // Change chords
      rerender(<ChordDisplay {...defaultProps} 
        chords={['G', 'C', 'D', 'Em']} 
        autoDetectKey={true} 
      />);
      
      expect(detectKey).toHaveBeenCalledWith(['G', 'C', 'D', 'Em']);
    });

    test('does not auto-detect when autoDetectKey is false', () => {
      const { detectKey } = require('../utils/nashvilleNumbers');
      render(<ChordDisplay {...defaultProps} autoDetectKey={false} />);
      
      // detectKey should not be called during render
      expect(detectKey).not.toHaveBeenCalled();
    });
  });

  describe('current chord display', () => {
    test('shows current chord information', () => {
      render(<ChordDisplay {...defaultProps} 
        currentIndex={1} 
        isPlaying={true} 
      />);
      
      expect(screen.getByText(/Current:/)).toBeInTheDocument();
      expect(screen.getByText(/Am/)).toBeInTheDocument();
      expect(screen.getByText(/Playing/)).toBeInTheDocument();
    });

    test('shows current chord without playing indicator when not playing', () => {
      render(<ChordDisplay {...defaultProps} 
        currentIndex={1} 
        isPlaying={false} 
      />);
      
      expect(screen.getByText(/Current:/)).toBeInTheDocument();
      expect(screen.getByText(/Am/)).toBeInTheDocument();
      expect(screen.queryByText(/Playing/)).not.toBeInTheDocument();
    });
  });
});