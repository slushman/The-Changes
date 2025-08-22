/**
 * Advanced FilterPanel component
 * Provides comprehensive filtering options for chord progression search
 */

import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, X, Filter } from 'lucide-react';
import { getDatabaseStats } from '../data/songDatabase.js';
import { 
  VALID_GENRES, 
  VALID_DECADES, 
  VALID_COMPLEXITY_LEVELS, 
  VALID_SECTION_NAMES, 
  VALID_POPULARITY_LEVELS 
} from '../utils/songValidation.js';

const FilterPanel = ({ 
  filters, 
  onFiltersChange, 
  className = "",
  collapsible = true 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [databaseStats, setDatabaseStats] = useState(null);

  // Load database statistics on mount
  useEffect(() => {
    const stats = getDatabaseStats();
    setDatabaseStats(stats);
  }, []);

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...filters };
    
    if (Array.isArray(newFilters[filterType])) {
      // Multi-select filters
      if (newFilters[filterType].includes(value)) {
        newFilters[filterType] = newFilters[filterType].filter(item => item !== value);
      } else {
        newFilters[filterType] = [...newFilters[filterType], value];
      }
    } else {
      // Single-select filters
      newFilters[filterType] = newFilters[filterType] === value ? null : value;
    }
    
    onFiltersChange(newFilters);
  };

  // Clear all filters
  const clearAllFilters = () => {
    onFiltersChange({
      genres: [],
      decades: [],
      sections: [],
      complexities: [],
      popularities: [],
      progressionLength: null,
      artists: []
    });
  };

  // Check if any filters are active
  const hasActiveFilters = () => {
    return Object.values(filters).some(value => {
      if (Array.isArray(value)) return value.length > 0;
      return value !== null && value !== undefined;
    });
  };

  // Get count of active filters
  const getActiveFilterCount = () => {
    return Object.values(filters).reduce((count, value) => {
      if (Array.isArray(value)) return count + value.length;
      return count + (value !== null && value !== undefined ? 1 : 0);
    }, 0);
  };

  const FilterSection = ({ title, children }) => (
    <div className="mb-6">
      <h4 className="text-sm font-semibold text-gray-700 mb-3">{title}</h4>
      {children}
    </div>
  );

  const MultiSelectFilter = ({ filterType, options, label, showCounts = false }) => (
    <div className="space-y-2">
      {options.map(option => {
        const isSelected = filters[filterType]?.includes(option);
        const count = showCounts && databaseStats ? 
          (filterType === 'genres' ? 
            databaseStats.genres.filter(g => g === option).length : 
            databaseStats.decades.filter(d => d === option).length) : 0;
        
        return (
          <label key={option} className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => handleFilterChange(filterType, option)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className={`text-sm ${isSelected ? 'text-blue-700 font-medium' : 'text-gray-600'}`}>
              {option}
              {showCounts && count > 0 && (
                <span className="text-gray-400 ml-1">({count})</span>
              )}
            </span>
          </label>
        );
      })}
    </div>
  );

  const SingleSelectFilter = ({ filterType, options, label, placeholder = "Any" }) => (
    <select
      value={filters[filterType] || ""}
      onChange={(e) => handleFilterChange(filterType, e.target.value || null)}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    >
      <option value="">{placeholder}</option>
      {options.map(option => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );

  const ProgressionLengthFilter = () => {
    const lengthOptions = [2, 3, 4, 5, 6, 7, 8, 12, 16];
    
    return (
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          {lengthOptions.map(length => {
            const isSelected = filters.progressionLength === length;
            return (
              <button
                key={length}
                onClick={() => handleFilterChange('progressionLength', length)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  isSelected 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {length} chords
              </button>
            );
          })}
        </div>
        {filters.progressionLength && (
          <button
            onClick={() => handleFilterChange('progressionLength', null)}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Clear length filter
          </button>
        )}
      </div>
    );
  };

  const ArtistFilter = () => {
    return (
      <div className="space-y-2">
        <input
          type="text"
          placeholder="Search by artist name..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          onChange={(e) => {
            // For now, this is a placeholder - in a real app you'd implement autocomplete
            const value = e.target.value.trim();
            if (value) {
              handleFilterChange('artists', [value]);
            } else {
              handleFilterChange('artists', []);
            }
          }}
        />
        {filters.artists?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {filters.artists.map(artist => (
              <span
                key={artist}
                className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
              >
                {artist}
                <button
                  onClick={() => {
                    const newArtists = filters.artists.filter(a => a !== artist);
                    handleFilterChange('artists', newArtists);
                  }}
                  className="ml-1 hover:text-blue-600"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (collapsible && !isExpanded) {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
        <button
          onClick={() => setIsExpanded(true)}
          className="flex items-center justify-between w-full text-left"
        >
          <div className="flex items-center space-x-2">
            <Filter size={18} className="text-gray-500" />
            <span className="font-medium text-gray-700">
              Filters
              {hasActiveFilters() && (
                <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                  {getActiveFilterCount()}
                </span>
              )}
            </span>
          </div>
          <ChevronDown size={18} className="text-gray-400" />
        </button>
        
        {hasActiveFilters() && (
          <div className="mt-3 flex flex-wrap gap-1">
            {Object.entries(filters).map(([key, value]) => {
              if (Array.isArray(value) && value.length > 0) {
                return value.map(item => (
                  <span
                    key={`${key}-${item}`}
                    className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded"
                  >
                    {item}
                  </span>
                ));
              } else if (value) {
                return (
                  <span
                    key={key}
                    className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded"
                  >
                    {value}
                  </span>
                );
              }
              return null;
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Filter size={18} className="text-gray-500" />
            <h3 className="font-medium text-gray-900">Advanced Filters</h3>
            {hasActiveFilters() && (
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                {getActiveFilterCount()} active
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {hasActiveFilters() && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Clear all
              </button>
            )}
            {collapsible && (
              <button
                onClick={() => setIsExpanded(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <ChevronUp size={18} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filter Content */}
      <div className="p-4 space-y-6">
        {/* Genre Filter */}
        <FilterSection title="Genre">
          <MultiSelectFilter
            filterType="genres"
            options={VALID_GENRES}
            label="Genres"
            showCounts={true}
          />
        </FilterSection>

        {/* Decade Filter */}
        <FilterSection title="Decade/Era">
          <MultiSelectFilter
            filterType="decades"
            options={VALID_DECADES}
            label="Decades"
            showCounts={true}
          />
        </FilterSection>

        {/* Song Section Filter */}
        <FilterSection title="Song Section">
          <MultiSelectFilter
            filterType="sections"
            options={VALID_SECTION_NAMES}
            label="Sections"
          />
        </FilterSection>

        {/* Progression Length Filter */}
        <FilterSection title="Progression Length">
          <ProgressionLengthFilter />
        </FilterSection>

        {/* Complexity Filter */}
        <FilterSection title="Complexity">
          <SingleSelectFilter
            filterType="complexity"
            options={VALID_COMPLEXITY_LEVELS}
            label="Complexity"
            placeholder="Any complexity"
          />
        </FilterSection>

        {/* Popularity Filter */}
        <FilterSection title="Popularity">
          <SingleSelectFilter
            filterType="popularity"
            options={VALID_POPULARITY_LEVELS}
            label="Popularity"
            placeholder="Any popularity"
          />
        </FilterSection>

        {/* Artist Filter */}
        <FilterSection title="Artist/Band">
          <ArtistFilter />
        </FilterSection>
      </div>

      {/* Footer with stats */}
      {databaseStats && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-xs text-gray-500 space-y-1">
            <div>Database: {databaseStats.totalSongs} songs, {databaseStats.totalSections} sections</div>
            <div>
              {databaseStats.genres.length} genres • {databaseStats.decades.length} decades
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;