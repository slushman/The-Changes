/**
 * Unit tests for SearchSection component
 * Tests search interface, autocomplete, and user interactions
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SearchSection from './SearchSection';

// Mock the chord utilities
jest.mock('../utils/chordUtils.js', () => ({
  parseProgressionInput: jest.fn((input) => {
    if (!input) return [];
    const chords = input.split(/[\s,|-]+/).filter(chord => chord && chord !== 'invalid');
    return chords;
  }),
  getChordSuggestions: jest.fn((partial) => {
    if (partial === 'C') return ['C', 'Cm', 'C7', 'Cmaj7'];
    if (partial === 'A') return ['A', 'Am', 'A7'];
    return [];
  })
}));

// Mock the chord search utilities
jest.mock('../utils/chordSearch.js', () => ({
  getProgressionSuggestions: jest.fn((progression) => {
    if (progression.includes('C')) {
      return [
        {
          progression: ['C', 'Am', 'F', 'G'],
          count: 5,
          examples: [
            { song: 'Test Song', artist: 'Test Artist', section: 'chorus' }
          ]
        }
      ];
    }
    return [];
  })
}));

describe('SearchSection', () => {
  const defaultProps = {
    searchProgression: [],
    setSearchProgression: jest.fn(),
    onSearch: jest.fn(),
    speed: 120,
    setSpeed: jest.fn(),
    isPlaying: false,
    onPlayProgression: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders search input and controls', () => {
    render(<SearchSection {...defaultProps} />);

    expect(screen.getByPlaceholderText(/Enter chord progression/)).toBeInTheDocument();
    expect(screen.getByText('Search Chord Progressions')).toBeInTheDocument();
  });

  test('updates input value when typing', () => {
    render(<SearchSection {...defaultProps} />);

    const input = screen.getByPlaceholderText(/Enter chord progression/);
    fireEvent.change(input, { target: { value: 'C Am F G' } });

    expect(input.value).toBe('C Am F G');
  });

  test('calls setSearchProgression when input changes', () => {
    const setSearchProgression = jest.fn();
    render(<SearchSection {...defaultProps} setSearchProgression={setSearchProgression} />);

    const input = screen.getByPlaceholderText(/Enter chord progression/);
    fireEvent.change(input, { target: { value: 'C Am F G' } });

    expect(setSearchProgression).toHaveBeenCalledWith(['C', 'Am', 'F', 'G']);
  });

  test('shows search button', () => {
    render(<SearchSection {...defaultProps} />);
    
    const searchButton = screen.getByRole('button', { name: '' }); // Search icon button
    expect(searchButton).toBeInTheDocument();
  });

  test('disables search button when no progression', () => {
    render(<SearchSection {...defaultProps} searchProgression={[]} />);
    
    const searchButton = screen.getByRole('button', { name: '' });
    expect(searchButton).toBeDisabled();
  });

  test('enables search button when progression exists', () => {
    render(<SearchSection {...defaultProps} searchProgression={['C', 'Am']} />);
    
    const searchButton = screen.getByRole('button', { name: '' });
    expect(searchButton).not.toBeDisabled();
  });

  test('calls onSearch when search button clicked', () => {
    const onSearch = jest.fn();
    render(<SearchSection {...defaultProps} searchProgression={['C', 'Am']} onSearch={onSearch} />);
    
    const searchButton = screen.getByRole('button', { name: '' });
    fireEvent.click(searchButton);

    expect(onSearch).toHaveBeenCalled();
  });

  test('calls onSearch when Enter key pressed', () => {
    const onSearch = jest.fn();
    render(<SearchSection {...defaultProps} searchProgression={['C', 'Am']} onSearch={onSearch} />);
    
    const input = screen.getByPlaceholderText(/Enter chord progression/);
    fireEvent.keyPress(input, { key: 'Enter', code: 'Enter' });

    expect(onSearch).toHaveBeenCalled();
  });

  test('shows clear button when input has value', () => {
    render(<SearchSection {...defaultProps} />);
    
    const input = screen.getByPlaceholderText(/Enter chord progression/);
    fireEvent.change(input, { target: { value: 'C Am' } });

    const clearButton = screen.getByRole('button', { name: '' }); // X icon
    expect(clearButton).toBeInTheDocument();
  });

  test('clears input when clear button clicked', () => {
    const setSearchProgression = jest.fn();
    render(<SearchSection {...defaultProps} setSearchProgression={setSearchProgression} />);
    
    const input = screen.getByPlaceholderText(/Enter chord progression/);
    fireEvent.change(input, { target: { value: 'C Am' } });
    
    const clearButton = screen.getByRole('button', { name: '' });
    fireEvent.click(clearButton);

    expect(input.value).toBe('');
    expect(setSearchProgression).toHaveBeenCalledWith([]);
  });

  describe('Current Progression Display', () => {
    test('shows current progression when chords are selected', () => {
      render(<SearchSection {...defaultProps} searchProgression={['C', 'Am', 'F', 'G']} />);
      
      expect(screen.getByText('Current Progression:')).toBeInTheDocument();
      expect(screen.getByText('C')).toBeInTheDocument();
      expect(screen.getByText('Am')).toBeInTheDocument();
      expect(screen.getByText('F')).toBeInTheDocument();
      expect(screen.getByText('G')).toBeInTheDocument();
    });

    test('does not show progression display when no chords', () => {
      render(<SearchSection {...defaultProps} searchProgression={[]} />);
      
      expect(screen.queryByText('Current Progression:')).not.toBeInTheDocument();
    });

    test('shows play button in progression display', () => {
      render(<SearchSection {...defaultProps} searchProgression={['C', 'Am']} />);
      
      expect(screen.getByText('Play')).toBeInTheDocument();
    });

    test('shows stop button when playing', () => {
      render(<SearchSection {...defaultProps} searchProgression={['C', 'Am']} isPlaying={true} />);
      
      expect(screen.getByText('Stop')).toBeInTheDocument();
    });

    test('calls onPlayProgression when play button clicked', () => {
      const onPlayProgression = jest.fn();
      render(<SearchSection 
        {...defaultProps} 
        searchProgression={['C', 'Am']} 
        onPlayProgression={onPlayProgression} 
      />);
      
      fireEvent.click(screen.getByText('Play'));
      expect(onPlayProgression).toHaveBeenCalledWith(['C', 'Am']);
    });
  });

  describe('Settings Panel', () => {
    test('shows settings button', () => {
      render(<SearchSection {...defaultProps} />);
      
      const settingsButton = screen.getByRole('button', { name: '' }); // Settings icon
      expect(settingsButton).toBeInTheDocument();
    });

    test('toggles settings panel when button clicked', () => {
      render(<SearchSection {...defaultProps} />);
      
      const settingsButton = screen.getByRole('button', { name: '' });
      
      // Settings should be hidden initially
      expect(screen.queryByText('Search Mode:')).not.toBeInTheDocument();
      
      // Click to show settings
      fireEvent.click(settingsButton);
      expect(screen.getByText('Search Mode:')).toBeInTheDocument();
      
      // Click to hide settings
      fireEvent.click(settingsButton);
      expect(screen.queryByText('Search Mode:')).not.toBeInTheDocument();
    });

    test('shows search mode dropdown in settings', () => {
      render(<SearchSection {...defaultProps} />);
      
      const settingsButton = screen.getByRole('button', { name: '' });
      fireEvent.click(settingsButton);
      
      expect(screen.getByDisplayValue('Exact Match')).toBeInTheDocument();
    });

    test('shows speed slider in settings', () => {
      render(<SearchSection {...defaultProps} speed={120} />);
      
      const settingsButton = screen.getByRole('button', { name: '' });
      fireEvent.click(settingsButton);
      
      expect(screen.getByText('Playback Speed: 120 BPM')).toBeInTheDocument();
      const slider = screen.getByDisplayValue('120');
      expect(slider).toBeInTheDocument();
    });

    test('calls setSpeed when slider changes', () => {
      const setSpeed = jest.fn();
      render(<SearchSection {...defaultProps} setSpeed={setSpeed} speed={120} />);
      
      const settingsButton = screen.getByRole('button', { name: '' });
      fireEvent.click(settingsButton);
      
      const slider = screen.getByDisplayValue('120');
      fireEvent.change(slider, { target: { value: '140' } });
      
      expect(setSpeed).toHaveBeenCalledWith(140);
    });
  });

  describe('Common Progressions', () => {
    test('shows common progressions section', () => {
      render(<SearchSection {...defaultProps} />);
      
      expect(screen.getByText('Common Progressions:')).toBeInTheDocument();
    });

    test('shows progression buttons', () => {
      render(<SearchSection {...defaultProps} />);
      
      expect(screen.getByText('I-V-vi-IV')).toBeInTheDocument();
      expect(screen.getByText('ii-V-I')).toBeInTheDocument();
    });

    test('selects progression when button clicked', () => {
      const setSearchProgression = jest.fn();
      render(<SearchSection {...defaultProps} setSearchProgression={setSearchProgression} />);
      
      fireEvent.click(screen.getByText('I-V-vi-IV'));
      
      expect(setSearchProgression).toHaveBeenCalledWith(['C', 'G', 'Am', 'F']);
    });

    test('shows progression details', () => {
      render(<SearchSection {...defaultProps} />);
      
      expect(screen.getByText('Pop progression')).toBeInTheDocument();
      expect(screen.getByText('C - G - Am - F')).toBeInTheDocument();
    });
  });

  describe('Autocomplete and Suggestions', () => {
    test('shows chord suggestions when typing', async () => {
      render(<SearchSection {...defaultProps} />);
      
      const input = screen.getByPlaceholderText(/Enter chord progression/);
      fireEvent.change(input, { target: { value: 'C' } });
      fireEvent.focus(input);
      
      await waitFor(() => {
        expect(screen.getByText('Chord Suggestions')).toBeInTheDocument();
      });
    });

    test('shows progression suggestions', async () => {
      render(<SearchSection {...defaultProps} />);
      
      const input = screen.getByPlaceholderText(/Enter chord progression/);
      fireEvent.change(input, { target: { value: 'C Am' } });
      fireEvent.focus(input);
      
      await waitFor(() => {
        expect(screen.getByText('Progression Completions')).toBeInTheDocument();
      });
    });

    test('hides suggestions on blur', async () => {
      render(<SearchSection {...defaultProps} />);
      
      const input = screen.getByPlaceholderText(/Enter chord progression/);
      fireEvent.change(input, { target: { value: 'C' } });
      fireEvent.focus(input);
      
      await waitFor(() => {
        expect(screen.getByText('Chord Suggestions')).toBeInTheDocument();
      });
      
      fireEvent.blur(input);
      
      await waitFor(() => {
        expect(screen.queryByText('Chord Suggestions')).not.toBeInTheDocument();
      }, { timeout: 300 });
    });

    test('hides suggestions on Escape key', () => {
      render(<SearchSection {...defaultProps} />);
      
      const input = screen.getByPlaceholderText(/Enter chord progression/);
      fireEvent.change(input, { target: { value: 'C' } });
      fireEvent.keyPress(input, { key: 'Escape' });
      
      expect(screen.queryByText('Chord Suggestions')).not.toBeInTheDocument();
    });
  });

  describe('Input Synchronization', () => {
    test('updates input when searchProgression prop changes', () => {
      const { rerender } = render(<SearchSection {...defaultProps} searchProgression={[]} />);
      
      const input = screen.getByPlaceholderText(/Enter chord progression/);
      expect(input.value).toBe('');
      
      rerender(<SearchSection {...defaultProps} searchProgression={['C', 'Am', 'F', 'G']} />);
      expect(input.value).toBe('C Am F G');
    });

    test('filters invalid chords from input', () => {
      const setSearchProgression = jest.fn();
      render(<SearchSection {...defaultProps} setSearchProgression={setSearchProgression} />);
      
      const input = screen.getByPlaceholderText(/Enter chord progression/);
      fireEvent.change(input, { target: { value: 'C invalid Am' } });
      
      expect(setSearchProgression).toHaveBeenCalledWith(['C', 'Am']);
    });
  });

  describe('Accessibility', () => {
    test('input has proper placeholder text', () => {
      render(<SearchSection {...defaultProps} />);
      
      const input = screen.getByPlaceholderText(/Enter chord progression/);
      expect(input).toHaveAttribute('placeholder');
    });

    test('buttons have proper labels', () => {
      render(<SearchSection {...defaultProps} searchProgression={['C', 'Am']} />);
      
      expect(screen.getByText('Play')).toBeInTheDocument();
      expect(screen.getByText('Search Chord Progressions')).toBeInTheDocument();
    });

    test('progression display has semantic structure', () => {
      render(<SearchSection {...defaultProps} searchProgression={['C', 'Am']} />);
      
      expect(screen.getByText('Current Progression:')).toBeInTheDocument();
    });
  });
});