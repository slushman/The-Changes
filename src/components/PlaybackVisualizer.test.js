/**
 * Tests for PlaybackVisualizer component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import PlaybackVisualizer from './PlaybackVisualizer';

// Mock child components
jest.mock('./ProgressionVisualizer', () => {
  return function MockProgressionVisualizer(props) {
    return (
      <div data-testid="progression-visualizer">
        Progression: {props.progression.join('-')}
        Current: {props.currentChordIndex}
        Playing: {props.isPlaying.toString()}
      </div>
    );
  };
});

jest.mock('./ChordVisualization', () => {
  return function MockChordVisualization(props) {
    return (
      <div data-testid="chord-visualization">
        Chord: {props.chord}
        Playing: {props.isPlaying.toString()}
      </div>
    );
  };
});

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Settings: () => <div data-testid="settings-icon">Settings</div>,
  Maximize2: () => <div data-testid="maximize-icon">Maximize</div>,
  Minimize2: () => <div data-testid="minimize-icon">Minimize</div>,
  Eye: () => <div data-testid="eye-icon">Eye</div>,
  EyeOff: () => <div data-testid="eye-off-icon">EyeOff</div>
}));

describe('PlaybackVisualizer', () => {
  const mockProgression = ['C', 'Am', 'F', 'G'];
  const defaultProps = {
    progression: mockProgression,
    currentChordIndex: 1,
    isPlaying: true,
    onChordClick: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering modes', () => {
    test('renders in expanded mode by default', () => {
      render(<PlaybackVisualizer {...defaultProps} />);
      
      expect(screen.getByText('Playback Visualization')).toBeInTheDocument();
      expect(screen.getByTestId('progression-visualizer')).toBeInTheDocument();
      expect(screen.getByTestId('chord-visualization')).toBeInTheDocument();
    });

    test('can switch to compact mode', () => {
      render(<PlaybackVisualizer {...defaultProps} />);
      
      const minimizeButton = screen.getByTestId('minimize-icon').closest('button');
      fireEvent.click(minimizeButton);
      
      // Should show compact view
      expect(screen.getByText('Am')).toBeInTheDocument(); // Current chord
      expect(screen.getByText('2 / 4')).toBeInTheDocument(); // Position
    });

    test('can switch back to expanded mode', () => {
      render(<PlaybackVisualizer {...defaultProps} />);
      
      // Switch to compact
      const minimizeButton = screen.getByTestId('minimize-icon').closest('button');
      fireEvent.click(minimizeButton);
      
      // Switch back to expanded
      const maximizeButton = screen.getByTestId('maximize-icon').closest('button');
      fireEvent.click(maximizeButton);
      
      expect(screen.getByText('Playback Visualization')).toBeInTheDocument();
    });
  });

  describe('compact view', () => {
    test('shows current chord and position', () => {
      render(<PlaybackVisualizer {...defaultProps} />);
      
      // Switch to compact
      const minimizeButton = screen.getByTestId('minimize-icon').closest('button');
      fireEvent.click(minimizeButton);
      
      expect(screen.getByText('Am')).toBeInTheDocument();
      expect(screen.getByText('2 / 4')).toBeInTheDocument();
    });

    test('shows playing animation when playing', () => {
      render(<PlaybackVisualizer {...defaultProps} isPlaying={true} />);
      
      // Switch to compact
      const minimizeButton = screen.getByTestId('minimize-icon').closest('button');
      fireEvent.click(minimizeButton);
      
      // Should have bouncing animation
      const { container } = render(<PlaybackVisualizer {...defaultProps} isPlaying={true} />);
      const minimizeBtn = container.querySelector('[data-testid="minimize-icon"]').closest('button');
      fireEvent.click(minimizeBtn);
      
      expect(container.querySelector('.animate-bounce')).toBeInTheDocument();
    });

    test('hides animation when not playing', () => {
      render(<PlaybackVisualizer {...defaultProps} isPlaying={false} />);
      
      // Switch to compact
      const minimizeButton = screen.getByTestId('minimize-icon').closest('button');
      fireEvent.click(minimizeButton);
      
      // Should not have animation elements
      const animationElements = document.querySelectorAll('.animate-bounce');
      expect(animationElements.length).toBe(0);
    });
  });

  describe('settings panel', () => {
    test('shows settings button', () => {
      render(<PlaybackVisualizer {...defaultProps} />);
      
      expect(screen.getByTestId('settings-icon')).toBeInTheDocument();
    });

    test('toggles settings panel', () => {
      render(<PlaybackVisualizer {...defaultProps} />);
      
      const settingsButton = screen.getByTestId('settings-icon').closest('button');
      
      // Open settings
      fireEvent.click(settingsButton);
      expect(screen.getByText('Visualization Settings')).toBeInTheDocument();
      
      // Close settings
      fireEvent.click(settingsButton);
      expect(screen.queryByText('Visualization Settings')).not.toBeInTheDocument();
    });

    test('contains layout options', () => {
      render(<PlaybackVisualizer {...defaultProps} />);
      
      const settingsButton = screen.getByTestId('settings-icon').closest('button');
      fireEvent.click(settingsButton);
      
      expect(screen.getByText('Layout')).toBeInTheDocument();
      expect(screen.getByDisplayValue('horizontal')).toBeInTheDocument();
    });

    test('contains theme options', () => {
      render(<PlaybackVisualizer {...defaultProps} />);
      
      const settingsButton = screen.getByTestId('settings-icon').closest('button');
      fireEvent.click(settingsButton);
      
      expect(screen.getByText('Theme')).toBeInTheDocument();
      expect(screen.getByDisplayValue('default')).toBeInTheDocument();
    });

    test('contains size options', () => {
      render(<PlaybackVisualizer {...defaultProps} />);
      
      const settingsButton = screen.getByTestId('settings-icon').closest('button');
      fireEvent.click(settingsButton);
      
      expect(screen.getByText('Size')).toBeInTheDocument();
      expect(screen.getByDisplayValue('medium')).toBeInTheDocument();
    });

    test('contains display options', () => {
      render(<PlaybackVisualizer {...defaultProps} />);
      
      const settingsButton = screen.getByTestId('settings-icon').closest('button');
      fireEvent.click(settingsButton);
      
      expect(screen.getByText('Display Options')).toBeInTheDocument();
      expect(screen.getByText('Waveform')).toBeInTheDocument();
      expect(screen.getByText('Progress')).toBeInTheDocument();
      expect(screen.getByText('Labels')).toBeInTheDocument();
    });
  });

  describe('settings functionality', () => {
    test('updates layout setting', () => {
      render(<PlaybackVisualizer {...defaultProps} />);
      
      const settingsButton = screen.getByTestId('settings-icon').closest('button');
      fireEvent.click(settingsButton);
      
      const layoutSelect = screen.getByDisplayValue('horizontal');
      fireEvent.change(layoutSelect, { target: { value: 'vertical' } });
      
      expect(layoutSelect.value).toBe('vertical');
    });

    test('updates theme setting', () => {
      render(<PlaybackVisualizer {...defaultProps} />);
      
      const settingsButton = screen.getByTestId('settings-icon').closest('button');
      fireEvent.click(settingsButton);
      
      const themeSelect = screen.getByDisplayValue('default');
      fireEvent.change(themeSelect, { target: { value: 'dark' } });
      
      expect(themeSelect.value).toBe('dark');
    });

    test('toggles display options', () => {
      render(<PlaybackVisualizer {...defaultProps} />);
      
      const settingsButton = screen.getByTestId('settings-icon').closest('button');
      fireEvent.click(settingsButton);
      
      const waveformCheckbox = screen.getByLabelText(/Waveform/);
      expect(waveformCheckbox).toBeChecked();
      
      fireEvent.click(waveformCheckbox);
      expect(waveformCheckbox).not.toBeChecked();
    });
  });

  describe('child component integration', () => {
    test('passes props to ProgressionVisualizer', () => {
      render(<PlaybackVisualizer {...defaultProps} />);
      
      const progressionViz = screen.getByTestId('progression-visualizer');
      expect(progressionViz).toHaveTextContent('Progression: C-Am-F-G');
      expect(progressionViz).toHaveTextContent('Current: 1');
      expect(progressionViz).toHaveTextContent('Playing: true');
    });

    test('passes props to ChordVisualization', () => {
      render(<PlaybackVisualizer {...defaultProps} />);
      
      const chordViz = screen.getByTestId('chord-visualization');
      expect(chordViz).toHaveTextContent('Chord: Am'); // Current chord
      expect(chordViz).toHaveTextContent('Playing: true');
    });

    test('updates current chord when index changes', () => {
      const { rerender } = render(<PlaybackVisualizer {...defaultProps} />);
      
      rerender(<PlaybackVisualizer {...defaultProps} currentChordIndex={2} />);
      
      const chordViz = screen.getByTestId('chord-visualization');
      expect(chordViz).toHaveTextContent('Chord: F');
    });
  });

  describe('information panel', () => {
    test('shows progression information', () => {
      render(<PlaybackVisualizer {...defaultProps} />);
      
      expect(screen.getByText('Progression:')).toBeInTheDocument();
      expect(screen.getByText('C - Am - F - G')).toBeInTheDocument();
    });

    test('shows current chord information', () => {
      render(<PlaybackVisualizer {...defaultProps} />);
      
      expect(screen.getByText('Current:')).toBeInTheDocument();
      expect(screen.getByText('Am (2/4)')).toBeInTheDocument();
    });

    test('shows playing status', () => {
      render(<PlaybackVisualizer {...defaultProps} isPlaying={true} />);
      
      expect(screen.getByText('Status:')).toBeInTheDocument();
      expect(screen.getByText('Playing')).toBeInTheDocument();
    });

    test('shows stopped status when not playing', () => {
      render(<PlaybackVisualizer {...defaultProps} isPlaying={false} />);
      
      expect(screen.getByText('Stopped')).toBeInTheDocument();
    });
  });

  describe('responsive layout', () => {
    test('uses grid layout for components', () => {
      const { container } = render(<PlaybackVisualizer {...defaultProps} />);
      
      expect(container.querySelector('.grid')).toBeInTheDocument();
      expect(container.querySelector('.lg\\:col-span-2')).toBeInTheDocument();
      expect(container.querySelector('.lg\\:col-span-1')).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    test('handles empty progression', () => {
      render(<PlaybackVisualizer progression={[]} currentChordIndex={0} />);
      
      expect(screen.getByText('Playback Visualization')).toBeInTheDocument();
    });

    test('handles invalid chord index', () => {
      render(<PlaybackVisualizer {...defaultProps} currentChordIndex={10} />);
      
      // Should default to 'C' or handle gracefully
      expect(screen.getByTestId('chord-visualization')).toBeInTheDocument();
    });

    test('handles missing onChordClick callback', () => {
      const propsWithoutCallback = { ...defaultProps };
      delete propsWithoutCallback.onChordClick;
      
      expect(() => {
        render(<PlaybackVisualizer {...propsWithoutCallback} />);
      }).not.toThrow();
    });
  });

  describe('settings persistence', () => {
    test('maintains settings when switching views', () => {
      render(<PlaybackVisualizer {...defaultProps} />);
      
      // Change a setting
      const settingsButton = screen.getByTestId('settings-icon').closest('button');
      fireEvent.click(settingsButton);
      
      const themeSelect = screen.getByDisplayValue('default');
      fireEvent.change(themeSelect, { target: { value: 'dark' } });
      
      // Switch to compact view
      const minimizeButton = screen.getByTestId('minimize-icon').closest('button');
      fireEvent.click(minimizeButton);
      
      // Switch back to expanded
      const maximizeButton = screen.getByTestId('maximize-icon').closest('button');
      fireEvent.click(maximizeButton);
      
      // Open settings again
      fireEvent.click(settingsButton);
      
      // Setting should be preserved
      expect(screen.getByDisplayValue('dark')).toBeInTheDocument();
    });
  });
});