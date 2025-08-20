/**
 * Unit tests for FilterPanel component
 * Tests filtering interface and user interactions
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import FilterPanel from './FilterPanel';

// Mock the database stats
jest.mock('../data/songDatabase.js', () => ({
  getDatabaseStats: jest.fn(() => ({
    totalSongs: 15,
    totalSections: 45,
    genres: ['rock', 'pop', 'jazz'],
    decades: ['70s', '80s', '90s']
  }))
}));

// Mock the validation constants
jest.mock('../utils/songValidation.js', () => ({
  VALID_GENRES: ['rock', 'pop', 'jazz', 'blues'],
  VALID_DECADES: ['70s', '80s', '90s', '2000s'],
  VALID_COMPLEXITY_LEVELS: ['simple', 'intermediate', 'complex'],
  VALID_SECTION_NAMES: ['verse', 'chorus', 'bridge'],
  VALID_POPULARITY_LEVELS: ['mainstream', 'deep-cut']
}));

describe('FilterPanel', () => {
  const defaultFilters = {
    genres: [],
    decades: [],
    sections: [],
    complexities: [],
    popularities: [],
    progressionLength: null,
    artists: []
  };

  const mockOnFiltersChange = jest.fn();

  beforeEach(() => {
    mockOnFiltersChange.mockClear();
  });

  test('renders collapsed by default when collapsible', () => {
    render(
      <FilterPanel 
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        collapsible={true}
      />
    );

    expect(screen.getByText('Filters')).toBeInTheDocument();
    expect(screen.queryByText('Advanced Filters')).not.toBeInTheDocument();
  });

  test('renders expanded when not collapsible', () => {
    render(
      <FilterPanel 
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        collapsible={false}
      />
    );

    expect(screen.getByText('Advanced Filters')).toBeInTheDocument();
  });

  test('expands when clicked in collapsible mode', () => {
    render(
      <FilterPanel 
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        collapsible={true}
      />
    );

    fireEvent.click(screen.getByText('Filters'));
    expect(screen.getByText('Advanced Filters')).toBeInTheDocument();
  });

  test('displays active filter count', () => {
    const activeFilters = {
      ...defaultFilters,
      genres: ['rock', 'pop'],
      decades: ['90s']
    };

    render(
      <FilterPanel 
        filters={activeFilters}
        onFiltersChange={mockOnFiltersChange}
        collapsible={true}
      />
    );

    expect(screen.getByText('3')).toBeInTheDocument(); // 2 genres + 1 decade
  });

  test('shows clear all button when filters are active', async () => {
    const activeFilters = {
      ...defaultFilters,
      genres: ['rock']
    };

    render(
      <FilterPanel 
        filters={activeFilters}
        onFiltersChange={mockOnFiltersChange}
        collapsible={false}
      />
    );

    expect(screen.getByText('Clear all')).toBeInTheDocument();
  });

  test('clears all filters when clear all is clicked', () => {
    const activeFilters = {
      ...defaultFilters,
      genres: ['rock'],
      decades: ['90s']
    };

    render(
      <FilterPanel 
        filters={activeFilters}
        onFiltersChange={mockOnFiltersChange}
        collapsible={false}
      />
    );

    fireEvent.click(screen.getByText('Clear all'));
    expect(mockOnFiltersChange).toHaveBeenCalledWith(defaultFilters);
  });

  describe('Genre Filter', () => {
    test('renders genre checkboxes', () => {
      render(
        <FilterPanel 
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
          collapsible={false}
        />
      );

      expect(screen.getByText('rock')).toBeInTheDocument();
      expect(screen.getByText('pop')).toBeInTheDocument();
      expect(screen.getByText('jazz')).toBeInTheDocument();
    });

    test('handles genre selection', () => {
      render(
        <FilterPanel 
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
          collapsible={false}
        />
      );

      const rockCheckbox = screen.getByLabelText(/rock/);
      fireEvent.click(rockCheckbox);

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...defaultFilters,
        genres: ['rock']
      });
    });

    test('handles genre deselection', () => {
      const filtersWithRock = {
        ...defaultFilters,
        genres: ['rock']
      };

      render(
        <FilterPanel 
          filters={filtersWithRock}
          onFiltersChange={mockOnFiltersChange}
          collapsible={false}
        />
      );

      const rockCheckbox = screen.getByLabelText(/rock/);
      fireEvent.click(rockCheckbox);

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...defaultFilters,
        genres: []
      });
    });
  });

  describe('Decade Filter', () => {
    test('renders decade checkboxes', () => {
      render(
        <FilterPanel 
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
          collapsible={false}
        />
      );

      expect(screen.getByText('70s')).toBeInTheDocument();
      expect(screen.getByText('80s')).toBeInTheDocument();
      expect(screen.getByText('90s')).toBeInTheDocument();
    });

    test('handles decade selection', () => {
      render(
        <FilterPanel 
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
          collapsible={false}
        />
      );

      const nineties = screen.getByLabelText(/90s/);
      fireEvent.click(nineties);

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...defaultFilters,
        decades: ['90s']
      });
    });
  });

  describe('Section Filter', () => {
    test('renders section checkboxes', () => {
      render(
        <FilterPanel 
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
          collapsible={false}
        />
      );

      expect(screen.getByText('verse')).toBeInTheDocument();
      expect(screen.getByText('chorus')).toBeInTheDocument();
      expect(screen.getByText('bridge')).toBeInTheDocument();
    });

    test('handles section selection', () => {
      render(
        <FilterPanel 
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
          collapsible={false}
        />
      );

      const verse = screen.getByLabelText(/verse/);
      fireEvent.click(verse);

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...defaultFilters,
        sections: ['verse']
      });
    });
  });

  describe('Progression Length Filter', () => {
    test('renders progression length buttons', () => {
      render(
        <FilterPanel 
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
          collapsible={false}
        />
      );

      expect(screen.getByText('4 chords')).toBeInTheDocument();
      expect(screen.getByText('8 chords')).toBeInTheDocument();
    });

    test('handles progression length selection', () => {
      render(
        <FilterPanel 
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
          collapsible={false}
        />
      );

      fireEvent.click(screen.getByText('4 chords'));

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...defaultFilters,
        progressionLength: 4
      });
    });

    test('shows clear button when length is selected', () => {
      const filtersWithLength = {
        ...defaultFilters,
        progressionLength: 4
      };

      render(
        <FilterPanel 
          filters={filtersWithLength}
          onFiltersChange={mockOnFiltersChange}
          collapsible={false}
        />
      );

      expect(screen.getByText('Clear length filter')).toBeInTheDocument();
    });

    test('clears progression length when clear is clicked', () => {
      const filtersWithLength = {
        ...defaultFilters,
        progressionLength: 4
      };

      render(
        <FilterPanel 
          filters={filtersWithLength}
          onFiltersChange={mockOnFiltersChange}
          collapsible={false}
        />
      );

      fireEvent.click(screen.getByText('Clear length filter'));

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...defaultFilters,
        progressionLength: null
      });
    });
  });

  describe('Complexity Filter', () => {
    test('renders complexity dropdown', () => {
      render(
        <FilterPanel 
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
          collapsible={false}
        />
      );

      const complexitySelect = screen.getByDisplayValue('Any complexity');
      expect(complexitySelect).toBeInTheDocument();
    });

    test('handles complexity selection', () => {
      render(
        <FilterPanel 
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
          collapsible={false}
        />
      );

      const complexitySelect = screen.getByDisplayValue('Any complexity');
      fireEvent.change(complexitySelect, { target: { value: 'simple' } });

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...defaultFilters,
        complexity: 'simple'
      });
    });
  });

  describe('Popularity Filter', () => {
    test('renders popularity dropdown', () => {
      render(
        <FilterPanel 
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
          collapsible={false}
        />
      );

      const popularitySelect = screen.getByDisplayValue('Any popularity');
      expect(popularitySelect).toBeInTheDocument();
    });

    test('handles popularity selection', () => {
      render(
        <FilterPanel 
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
          collapsible={false}
        />
      );

      const popularitySelect = screen.getByDisplayValue('Any popularity');
      fireEvent.change(popularitySelect, { target: { value: 'mainstream' } });

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...defaultFilters,
        popularity: 'mainstream'
      });
    });
  });

  describe('Artist Filter', () => {
    test('renders artist search input', () => {
      render(
        <FilterPanel 
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
          collapsible={false}
        />
      );

      expect(screen.getByPlaceholderText('Search by artist name...')).toBeInTheDocument();
    });

    test('handles artist input', () => {
      render(
        <FilterPanel 
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
          collapsible={false}
        />
      );

      const artistInput = screen.getByPlaceholderText('Search by artist name...');
      fireEvent.change(artistInput, { target: { value: 'Beatles' } });

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...defaultFilters,
        artists: ['Beatles']
      });
    });

    test('shows selected artists as tags', () => {
      const filtersWithArtist = {
        ...defaultFilters,
        artists: ['Beatles']
      };

      render(
        <FilterPanel 
          filters={filtersWithArtist}
          onFiltersChange={mockOnFiltersChange}
          collapsible={false}
        />
      );

      expect(screen.getByText('Beatles')).toBeInTheDocument();
    });

    test('removes artist when tag is clicked', () => {
      const filtersWithArtist = {
        ...defaultFilters,
        artists: ['Beatles', 'Stones']
      };

      render(
        <FilterPanel 
          filters={filtersWithArtist}
          onFiltersChange={mockOnFiltersChange}
          collapsible={false}
        />
      );

      // Find the X button next to Beatles
      const beatlesTag = screen.getByText('Beatles').closest('span');
      const removeButton = beatlesTag.querySelector('button');
      fireEvent.click(removeButton);

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...defaultFilters,
        artists: ['Stones']
      });
    });
  });

  describe('Database Stats', () => {
    test('displays database statistics', async () => {
      render(
        <FilterPanel 
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
          collapsible={false}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/15 songs, 45 sections/)).toBeInTheDocument();
        expect(screen.getByText(/3 genres • 3 decades/)).toBeInTheDocument();
      });
    });
  });

  describe('Filter State Management', () => {
    test('shows active filters in collapsed mode', () => {
      const activeFilters = {
        ...defaultFilters,
        genres: ['rock'],
        complexity: 'simple'
      };

      render(
        <FilterPanel 
          filters={activeFilters}
          onFiltersChange={mockOnFiltersChange}
          collapsible={true}
        />
      );

      expect(screen.getByText('rock')).toBeInTheDocument();
      expect(screen.getByText('simple')).toBeInTheDocument();
    });

    test('correctly identifies when filters are active', () => {
      const activeFilters = {
        ...defaultFilters,
        genres: ['rock']
      };

      const { rerender } = render(
        <FilterPanel 
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
          collapsible={true}
        />
      );

      expect(screen.queryByText(/active$/)).not.toBeInTheDocument();

      rerender(
        <FilterPanel 
          filters={activeFilters}
          onFiltersChange={mockOnFiltersChange}
          collapsible={true}
        />
      );

      expect(screen.getByText('1')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('checkboxes are properly labeled', () => {
      render(
        <FilterPanel 
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
          collapsible={false}
        />
      );

      const rockCheckbox = screen.getByLabelText(/rock/);
      expect(rockCheckbox).toHaveAttribute('type', 'checkbox');
    });

    test('dropdowns are properly labeled', () => {
      render(
        <FilterPanel 
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
          collapsible={false}
        />
      );

      const complexitySelect = screen.getByDisplayValue('Any complexity');
      expect(complexitySelect.tagName).toBe('SELECT');
    });

    test('buttons have proper focus states', () => {
      render(
        <FilterPanel 
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
          collapsible={false}
        />
      );

      const fourChordsButton = screen.getByText('4 chords');
      fourChordsButton.focus();
      expect(fourChordsButton).toHaveFocus();
    });
  });
});