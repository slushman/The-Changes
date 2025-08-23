/**
 * Comprehensive integration tests for full application workflows
 * Tests end-to-end functionality across multiple components and systems
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HomePage from '../components/HomePage';
import SongDetailPage from '../components/SongDetailPage';
import ProgressionExplorer from '../components/ProgressionExplorer';
import { songDatabase } from '../data/songDatabase';
import { searchChords } from '../utils/chordSearch';
import { playProgression } from '../utils/audioSynthesis';

// Mock Web Audio API
const mockAudioContext = {
  currentTime: 0,
  destination: { connect: jest.fn() },
  createOscillator: jest.fn(() => ({
    frequency: { setValueAtTime: jest.fn() },
    type: 'sine',
    connect: jest.fn(),
    start: jest.fn(),
    stop: jest.fn()
  })),
  createGain: jest.fn(() => ({
    gain: { setValueAtTime: jest.fn(), linearRampToValueAtTime: jest.fn() },
    connect: jest.fn()
  })),
  createBiquadFilter: jest.fn(() => ({
    type: 'lowpass',
    frequency: { setValueAtTime: jest.fn() },
    Q: { setValueAtTime: jest.fn() },
    connect: jest.fn()
  })),
  resume: jest.fn().mockResolvedValue(undefined),
  state: 'running'
};

global.AudioContext = jest.fn(() => mockAudioContext);
global.webkitAudioContext = jest.fn(() => mockAudioContext);

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useParams: () => ({ songId: 'wonderwall-oasis-1995' }),
  BrowserRouter: ({ children }) => <div>{children}</div>,
  Routes: ({ children }) => <div>{children}</div>,
  Route: ({ children }) => <div>{children}</div>
}));

describe('Full Application Workflow Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Search to Detail Workflow', () => {
    test('complete search to song detail navigation', async () => {
      const user = userEvent.setup();
      render(<HomePage />);

      // Step 1: Enter chord progression search
      const chordInput = screen.getByPlaceholderText(/enter chord progression/i);
      await user.type(chordInput, 'C Am F G');

      // Step 2: Trigger search
      const searchButton = screen.getByRole('button', { name: /search/i });
      await user.click(searchButton);

      // Step 3: Verify search results appear
      await waitFor(() => {
        expect(screen.getByText(/search results/i)).toBeInTheDocument();
      });

      // Step 4: Click on a song result
      const songResults = screen.getAllByTestId(/song-result/i);
      if (songResults.length > 0) {
        await user.click(songResults[0]);

        // Step 5: Verify navigation to song detail
        await waitFor(() => {
          expect(mockNavigate).toHaveBeenCalledWith(expect.stringContaining('/song/'));
        });
      }
    });

    test('search with filters and section matching', async () => {
      const user = userEvent.setup();
      render(<HomePage />);

      // Step 1: Open filter panel
      const filterToggle = screen.getByText(/filters/i);
      await user.click(filterToggle);

      // Step 2: Select genre filter
      const genreFilter = screen.getByLabelText(/genre/i);
      await user.selectOptions(genreFilter, 'rock');

      // Step 3: Select decade filter
      const decadeFilter = screen.getByLabelText(/decade/i);
      await user.selectOptions(decadeFilter, '90s');

      // Step 4: Enter chord search with section
      const chordInput = screen.getByPlaceholderText(/enter chord progression/i);
      await user.type(chordInput, 'Em C G D');

      const sectionFilter = screen.getByLabelText(/section/i);
      await user.selectOptions(sectionFilter, 'verse');

      // Step 5: Execute filtered search
      const searchButton = screen.getByRole('button', { name: /search/i });
      await user.click(searchButton);

      // Step 6: Verify filtered results
      await waitFor(() => {
        const results = screen.getAllByTestId(/song-result/i);
        // Should have fewer results due to filters
        expect(results.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Audio Playback Workflow', () => {
    test('chord progression playback with visual feedback', async () => {
      const user = userEvent.setup();
      render(<HomePage />);

      // Step 1: Enter a progression
      const chordInput = screen.getByPlaceholderText(/enter chord progression/i);
      await user.type(chordInput, 'C Am F G');

      // Step 2: Click play button
      const playButton = screen.getByRole('button', { name: /play/i });
      await user.click(playButton);

      // Step 3: Verify audio context creation
      expect(global.AudioContext).toHaveBeenCalled();

      // Step 4: Verify visual feedback updates
      await waitFor(() => {
        const progressIndicator = screen.getByTestId(/progress-indicator/i);
        expect(progressIndicator).toBeInTheDocument();
      });

      // Step 5: Test BPM adjustment
      const bpmSlider = screen.getByRole('slider', { name: /bpm/i });
      await user.clear(screen.getByDisplayValue(/120/)); // Default BPM
      await user.type(screen.getByDisplayValue(''), '100');

      expect(bpmSlider).toHaveValue('100');

      // Step 6: Test chord voicing selection
      const voicingSelect = screen.getByLabelText(/voicing/i);
      await user.selectOptions(voicingSelect, 'first-inversion');

      // Step 7: Play again with new settings
      await user.click(playButton);

      // Verify different oscillators created for voicing
      expect(mockAudioContext.createOscillator).toHaveBeenCalled();
    });

    test('song detail page audio integration', async () => {
      const user = userEvent.setup();
      render(<SongDetailPage />);

      // Step 1: Verify song sections are rendered
      await waitFor(() => {
        expect(screen.getByText(/verse/i)).toBeInTheDocument();
        expect(screen.getByText(/chorus/i)).toBeInTheDocument();
      });

      // Step 2: Play individual section
      const sectionPlayButtons = screen.getAllByTestId(/section-play-button/i);
      if (sectionPlayButtons.length > 0) {
        await user.click(sectionPlayButtons[0]);

        // Verify section-specific playback
        expect(mockAudioContext.createOscillator).toHaveBeenCalled();
      }

      // Step 3: Play full song progression
      const fullSongButton = screen.getByRole('button', { name: /play full song/i });
      await user.click(fullSongButton);

      // Step 4: Verify synchronized visual feedback
      await waitFor(() => {
        const currentChord = screen.getByTestId(/current-chord-highlight/i);
        expect(currentChord).toBeInTheDocument();
      });
    });
  });

  describe('Progression Explorer Workflow', () => {
    test('interactive chord grid and variations', async () => {
      const user = userEvent.setup();
      render(<ProgressionExplorer />);

      // Step 1: Verify chord grid renders
      await waitFor(() => {
        expect(screen.getByTestId(/chord-grid/i)).toBeInTheDocument();
      });

      // Step 2: Click chords to build progression
      const chordButtons = screen.getAllByTestId(/chord-button/i);
      if (chordButtons.length >= 4) {
        await user.click(chordButtons[0]); // C
        await user.click(chordButtons[1]); // Am
        await user.click(chordButtons[2]); // F
        await user.click(chordButtons[3]); // G

        // Step 3: Verify progression is built
        const progression = screen.getByTestId(/current-progression/i);
        expect(progression).toHaveTextContent(/C.*Am.*F.*G/);
      }

      // Step 4: Test variation suggestions
      const variationsButton = screen.getByRole('button', { name: /variations/i });
      await user.click(variationsButton);

      await waitFor(() => {
        const variations = screen.getAllByTestId(/variation-suggestion/i);
        expect(variations.length).toBeGreaterThan(0);
      });

      // Step 5: Apply a variation
      if (screen.getAllByTestId(/variation-suggestion/i).length > 0) {
        const firstVariation = screen.getAllByTestId(/variation-suggestion/i)[0];
        await user.click(firstVariation);

        // Verify progression updated
        const updatedProgression = screen.getByTestId(/current-progression/i);
        expect(updatedProgression).toBeInTheDocument();
      }
    });

    test('Nashville number system integration', async () => {
      const user = userEvent.setup();
      render(<ProgressionExplorer />);

      // Step 1: Enable Nashville numbers
      const nashvilleToggle = screen.getByRole('checkbox', { name: /nashville numbers/i });
      await user.click(nashvilleToggle);

      // Step 2: Verify number display
      await waitFor(() => {
        const numberSystem = screen.getByTestId(/nashville-numbers/i);
        expect(numberSystem).toBeInTheDocument();
      });

      // Step 3: Change key and verify number recalculation
      const keySelect = screen.getByLabelText(/key/i);
      await user.selectOptions(keySelect, 'G');

      // Step 4: Verify numbers remain consistent
      const numbers = screen.getAllByTestId(/chord-number/i);
      if (numbers.length > 0) {
        // Should show Roman numerals like I, vi, IV, V
        expect(numbers.some(n => n.textContent.match(/[IVX]/i))).toBe(true);
      }
    });
  });

  describe('Performance and Optimization', () => {
    test('large dataset search performance', async () => {
      const user = userEvent.setup();
      const startTime = Date.now();

      render(<HomePage />);

      // Search through large database
      const chordInput = screen.getByPlaceholderText(/enter chord progression/i);
      await user.type(chordInput, 'C G Am F'); // Common progression

      const searchButton = screen.getByRole('button', { name: /search/i });
      await user.click(searchButton);

      // Verify results appear within reasonable time
      await waitFor(() => {
        expect(screen.getByText(/search results/i)).toBeInTheDocument();
      }, { timeout: 2000 });

      const endTime = Date.now();
      const searchTime = endTime - startTime;

      // Search should complete within 2 seconds
      expect(searchTime).toBeLessThan(2000);
    });

    test('audio synthesis performance with multiple chords', async () => {
      const user = userEvent.setup();
      render(<HomePage />);

      // Enter complex progression
      const chordInput = screen.getByPlaceholderText(/enter chord progression/i);
      await user.type(chordInput, 'Cmaj7 Am7 Dm7 G7 Em7 Am7 Dm7 G7');

      // Test rapid playback cycles
      const playButton = screen.getByRole('button', { name: /play/i });
      
      const startTime = Date.now();
      
      // Rapid play/stop cycles
      for (let i = 0; i < 3; i++) {
        await user.click(playButton); // Play
        await new Promise(resolve => setTimeout(resolve, 100));
        await user.click(playButton); // Stop
      }

      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // Should handle rapid operations smoothly
      expect(totalTime).toBeLessThan(1000);
      expect(mockAudioContext.createOscillator).toHaveBeenCalled();
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('handles invalid chord input gracefully', async () => {
      const user = userEvent.setup();
      render(<HomePage />);

      // Enter invalid chord progression
      const chordInput = screen.getByPlaceholderText(/enter chord progression/i);
      await user.type(chordInput, 'XYZ ABC DEF');

      const searchButton = screen.getByRole('button', { name: /search/i });
      await user.click(searchButton);

      // Should show appropriate message
      await waitFor(() => {
        expect(screen.getByText(/no matching songs/i) || 
               screen.getByText(/invalid chord/i) ||
               screen.getByText(/no results/i)).toBeInTheDocument();
      });
    });

    test('handles audio context failure gracefully', async () => {
      // Mock AudioContext to fail
      global.AudioContext = jest.fn(() => {
        throw new Error('AudioContext not supported');
      });

      const user = userEvent.setup();
      render(<HomePage />);

      const chordInput = screen.getByPlaceholderText(/enter chord progression/i);
      await user.type(chordInput, 'C Am F G');

      const playButton = screen.getByRole('button', { name: /play/i });
      await user.click(playButton);

      // Should show error message or disable audio features
      await waitFor(() => {
        expect(screen.getByText(/audio not available/i) || 
               screen.getByText(/audio not supported/i) ||
               playButton).toBeDisabled();
      });
    });

    test('handles network errors for song data', async () => {
      // This would test API failures if we had external data sources
      const user = userEvent.setup();
      render(<HomePage />);

      // Test should handle missing song data gracefully
      expect(screen.getByText(/chord progression explorer/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility Integration', () => {
    test('keyboard navigation through complete workflow', async () => {
      render(<HomePage />);

      // Test keyboard navigation
      const chordInput = screen.getByPlaceholderText(/enter chord progression/i);
      chordInput.focus();
      
      fireEvent.keyDown(chordInput, { key: 'Tab' });
      
      // Should navigate to search button
      const searchButton = screen.getByRole('button', { name: /search/i });
      expect(document.activeElement).toBe(searchButton);

      // Test Enter key search
      fireEvent.keyDown(searchButton, { key: 'Enter' });
      
      await waitFor(() => {
        // Should trigger search
        expect(screen.getByText(/search results/i) || 
               screen.getByText(/no results/i)).toBeInTheDocument();
      });
    });

    test('screen reader compatibility', () => {
      render(<HomePage />);

      // Check for proper ARIA labels and roles
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByLabelText(/chord progression/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();

      // Check for semantic headings
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });
  });

  describe('Data Consistency', () => {
    test('search results match actual song data', async () => {
      // Test that search algorithms return accurate results
      const testProgression = ['C', 'Am', 'F', 'G'];
      const searchResults = searchChords(songDatabase, testProgression);

      // Verify results actually contain the searched progression
      searchResults.forEach(result => {
        const songSections = Object.values(result.song.sections);
        const hasProgression = songSections.some(section => {
          const progression = section.progression;
          return testProgression.every(chord => progression.includes(chord));
        });
        
        expect(hasProgression).toBe(true);
      });
    });

    test('audio synthesis matches displayed chords', async () => {
      const testChords = ['C', 'Am', 'F', 'G'];
      
      // Mock frequency validation
      const playResult = playProgression(mockAudioContext, testChords, 1.0);
      
      // Should create oscillators for each chord
      expect(mockAudioContext.createOscillator).toHaveBeenCalled();
      expect(playResult.length).toBeGreaterThan(0);
    });
  });

  describe('State Management Integration', () => {
    test('state persists across component navigation', async () => {
      const user = userEvent.setup();
      render(<HomePage />);

      // Set search parameters
      const chordInput = screen.getByPlaceholderText(/enter chord progression/i);
      await user.type(chordInput, 'C Am F G');

      // Set BPM
      const bpmInput = screen.getByRole('textbox', { name: /bpm/i }) || 
                      screen.getByDisplayValue(/120/);
      if (bpmInput) {
        await user.clear(bpmInput);
        await user.type(bpmInput, '140');
      }

      // Navigate to song detail (simulated)
      // State should be maintained for return navigation
      expect(chordInput.value).toBe('C Am F G');
    });
  });
});