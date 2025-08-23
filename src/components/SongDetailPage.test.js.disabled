/**
 * Unit tests for SongDetailPage component
 */

// Mock react-router-dom hooks
const mockUseParams = jest.fn(() => ({ songId: 'test-song-1' }));
const mockUseNavigate = jest.fn(() => jest.fn());

jest.mock('react-router-dom', () => ({
  useParams: mockUseParams,
  useNavigate: mockUseNavigate
}));

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SongDetailPage from './SongDetailPage';

// Mock the song database
jest.mock('../data/songDatabase', () => ({
  songDatabase: {
    songs: [
      {
        songId: 'test-song-1',
        title: 'Test Song',
        artist: 'Test Artist',
        album: 'Test Album',
        year: 2020,
        genre: 'rock',
        decade: '2020s',
        popularity: 'mainstream',
        key: 'C',
        tempo: 120,
        sections: {
          verse: {
            progression: ['C', 'Am', 'F', 'G'],
            bars: 4,
            repetitions: 2,
            complexity: 'simple',
            audioTimestamp: {
              start: '0:15',
              end: '0:45'
            }
          },
          chorus: {
            progression: ['F', 'C', 'G', 'Am'],
            bars: 4,
            repetitions: 1,
            complexity: 'simple',
            audioTimestamp: {
              start: '0:45',
              end: '1:15'
            }
          }
        }
      }
    ]
  }
}));

// Mock the song database default export
jest.mock('../data/songDatabase', () => [
  {
    songId: 'test-song-1',
    title: 'Test Song',
    artist: 'Test Artist',
    album: 'Test Album',
    year: 2020,
    genre: 'rock',
    decade: '2020s',
    popularity: 'mainstream',
    key: 'C',
    tempo: 120,
    sections: {
      verse: {
        progression: ['C', 'Am', 'F', 'G'],
        bars: 4,
        repetitions: 2,
        complexity: 'simple',
        audioTimestamp: {
          start: '0:15',
          end: '0:45'
        }
      },
      chorus: {
        progression: ['F', 'C', 'G', 'Am'],
        bars: 4,
        repetitions: 1,
        complexity: 'simple',
        audioTimestamp: {
          start: '0:45',
          end: '1:15'
        }
      }
    }
  }
]);

// Mock SectionChordVisualization component
jest.mock('./SectionChordVisualization', () => {
  return function MockSectionChordVisualization({ section, chords, sectionName, showNashville, keySignature }) {
    return (
      <div data-testid={`section-chord-viz-${sectionName}`}>
        <span>Section: {sectionName}</span>
        <span>Chords: {chords.join(' ')}</span>
        <span>Nashville: {showNashville ? 'enabled' : 'disabled'}</span>
        <span>Key: {keySignature}</span>
        <button>Play</button>
      </div>
    );
  };
});

// Mock RelatedSongs component
jest.mock('./RelatedSongs', () => {
  return function MockRelatedSongs({ relatedSongs }) {
    return (
      <div data-testid="related-songs">
        <span>Related Songs: {relatedSongs.length}</span>
      </div>
    );
  };
});

// Mock ProgressionExplorer component
jest.mock('./ProgressionExplorer', () => {
  return function MockProgressionExplorer({ show, initialProgression, keySignature }) {
    if (!show) return null;
    return (
      <div data-testid="progression-explorer">
        <span>Progression Explorer</span>
        <span>Initial: {initialProgression.join(' ')}</span>
        <span>Key: {keySignature}</span>
      </div>
    );
  };
});

// Mock relatedSongs utility
jest.mock('../utils/relatedSongs', () => ({
  findRelatedSongs: jest.fn(() => [
    { songId: 'related-1', title: 'Related Song 1', artist: 'Artist 1' },
    { songId: 'related-2', title: 'Related Song 2', artist: 'Artist 2' }
  ])
}));

// Mock audio synthesis
jest.mock('../utils/audioSynthesis', () => ({
  playChord: () => []
}));

describe('SongDetailPage Component', () => {
  describe('Song Loading and Display', () => {
    test('renders song information correctly', () => {
      render(<SongDetailPage />);

      expect(screen.getByText('Test Song')).toBeInTheDocument();
      expect(screen.getByText('Test Artist')).toBeInTheDocument();
      expect(screen.getByText('Test Album')).toBeInTheDocument();
      expect(screen.getByText('2020')).toBeInTheDocument();
      expect(screen.getByText((content) => content.includes('C'))).toBeInTheDocument();
      expect(screen.getByText('120 BPM')).toBeInTheDocument();
    });

    test('displays song metadata badges correctly', () => {
      render(<SongDetailPage />);

      expect(screen.getByText('Mainstream Hit')).toBeInTheDocument();
      expect(screen.getByText('rock')).toBeInTheDocument();
      expect(screen.getByText('2020s')).toBeInTheDocument();
    });

    test('renders song sections', () => {
      render(<SongDetailPage />);

      expect(screen.getByText('Verse')).toBeInTheDocument();
      expect(screen.getByText('Chorus')).toBeInTheDocument();
    });

    test('displays section details correctly', () => {
      render(<SongDetailPage />);

      expect(screen.getByText('4 bars × 2')).toBeInTheDocument(); // Verse
      expect(screen.getByText('4 bars × 1')).toBeInTheDocument(); // Chorus
      expect(screen.getAllByText('simple')).toHaveLength(2); // Both sections
    });
  });

  describe('Song Not Found Handling', () => {
    test('displays not found message for invalid song ID', () => {
      // Mock useParams to return invalid ID
      mockUseParams.mockReturnValue({ songId: 'non-existent-song' });

      render(<SongDetailPage />);

      expect(screen.getByText('Song Not Found')).toBeInTheDocument();
      expect(screen.getByText('The requested song could not be found in the database.')).toBeInTheDocument();
      
      // Reset mock for other tests
      mockUseParams.mockReturnValue({ songId: 'test-song-1' });
    });
  });

  describe('Nashville Numbers Toggle', () => {
    test('renders Nashville number toggle button', () => {
      render(<SongDetailPage />);

      expect(screen.getByText('Chords')).toBeInTheDocument();
    });

    test('toggles between chord names and Nashville numbers', () => {
      render(<SongDetailPage />);

      const toggleButton = screen.getByText('Chords');

      // Initial state should be chord names
      expect(screen.getAllByText('Nashville: disabled')).toHaveLength(2);

      // Toggle to Nashville numbers
      fireEvent.click(toggleButton);
      expect(screen.getAllByText('Nashville: enabled')).toHaveLength(2);

      // Toggle back to chord names
      fireEvent.click(toggleButton);
      expect(screen.getAllByText('Nashville: disabled')).toHaveLength(2);
    });
  });

  describe('Section Playback', () => {
    test('renders play buttons for each section', () => {
      render(<SongDetailPage />);

      const playButtons = screen.getAllByText('Play');
      expect(playButtons).toHaveLength(2); // One for each section
    });

    test('shows audio timestamps when available', () => {
      render(<SongDetailPage />);

      expect(screen.getByText('0:15 - 0:45')).toBeInTheDocument();
      expect(screen.getByText('0:45 - 1:15')).toBeInTheDocument();
    });
  });

  describe('Song Summary', () => {
    test('displays song structure summary', () => {
      render(<SongDetailPage />);

      expect(screen.getByText('Song Structure')).toBeInTheDocument();
      expect(screen.getByText('Total Sections:')).toBeInTheDocument();
      expect(screen.getByText('Unique Chords:')).toBeInTheDocument();
      expect(screen.getByText('Complexity Range:')).toBeInTheDocument();
      expect(screen.getByText('Total Bars:')).toBeInTheDocument();
    });
  });

  describe('SectionChordVisualization Integration', () => {
    test('passes correct props to SectionChordVisualization components', () => {
      render(<SongDetailPage />);

      const sectionVisualizations = screen.getAllByTestId(/section-chord-viz/);
      
      // Should have one visualization per section
      expect(sectionVisualizations).toHaveLength(2);
      
      // Check that chord data is passed correctly
      expect(screen.getByText('Chords: C Am F G')).toBeInTheDocument();
      expect(screen.getByText('Chords: F C G Am')).toBeInTheDocument();
      
      // Check key is passed
      expect(screen.getAllByText((content) => content.includes('Key: C'))).toHaveLength(2);
    });
  });

  describe('Related Songs Integration', () => {
    test('renders related songs component', () => {
      render(<SongDetailPage />);

      expect(screen.getByTestId('related-songs')).toBeInTheDocument();
      expect(screen.getByText('Related Songs: 2')).toBeInTheDocument();
    });
  });

  describe('Progression Explorer Integration', () => {
    test('can toggle progression explorer', () => {
      render(<SongDetailPage />);

      // Find and click the "Explore" button
      const exploreButtons = screen.getAllByText('Explore');
      if (exploreButtons.length > 0) {
        fireEvent.click(exploreButtons[0]);

        // Should show progression explorer
        expect(screen.getByTestId('progression-explorer')).toBeInTheDocument();
        expect(screen.getByText('Progression Explorer')).toBeInTheDocument();
      }
    });

    test('passes correct progression to explorer', () => {
      render(<SongDetailPage />);

      // Find and click the "Explore" button for verse
      const exploreButtons = screen.getAllByText('Explore');
      if (exploreButtons.length > 0) {
        fireEvent.click(exploreButtons[0]);

        // Should pass verse progression
        expect(screen.getByText('Initial: C Am F G')).toBeInTheDocument();
        expect(screen.getByText((content) => content.includes('Key: C'))).toBeInTheDocument();
      }
    });
  });

  describe('Advanced Features', () => {
    test('displays correct complexity indicators', () => {
      render(<SongDetailPage />);

      // Both sections should show simple complexity
      expect(screen.getAllByText('simple')).toHaveLength(2);
    });

    test('shows proper section structure information', () => {
      render(<SongDetailPage />);

      // Check repetition information
      expect(screen.getByText('4 bars × 2')).toBeInTheDocument(); // Verse with 2 repetitions
      expect(screen.getByText('4 bars × 1')).toBeInTheDocument(); // Chorus with 1 repetition
    });

    test('handles key signature changes', async () => {
      render(<SongDetailPage />);

      // The song should be in C major
      expect(screen.getAllByText((content) => content.includes('C'))).toHaveLength(2);
    });
  });
});