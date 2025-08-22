/**
 * SearchResults component
 * Enhanced search results display with section matching indicators and highlighting
 */

import React from 'react';
import { Play, Square, Music, Eye, ArrowRight } from 'lucide-react';
import { progressionToNashville } from '../utils/nashvilleNumbers';

// Individual result card component for reuse
const ResultCard = ({
  result,
  searchProgression,
  onSongClick,
  onPlayProgression,
  isPlaying,
  currentChordIndex,
  showNashville,
  currentKey,
  getSectionStyle,
  getSectionIcon,
  highlightMatches,
  isGrouped = false
}) => {
  const highlightedProgression = highlightMatches(
    result.sectionData?.progression || [], 
    searchProgression
  );

  return (
    <div
      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer group"
      onClick={() => onSongClick(result.songId)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Song Title and Artist */}
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
              {result.title}
            </h3>
            <ArrowRight className="text-gray-400 group-hover:text-blue-500 transition-colors" size={16} />
          </div>
          <p className="text-gray-600 mb-3">{result.artist}</p>

          {/* Section Indicator with Visual Badge - Only show if not grouped */}
          {!isGrouped && (
            <div className="flex items-center gap-3 mb-3">
              <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getSectionStyle(result.matchedSection)}`}>
                <span>{getSectionIcon(result.matchedSection)}</span>
                <span className="capitalize">{result.matchedSection.replace('_', ' ')}</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  {Math.round(result.confidence * 100)}% match
                </span>
                <span>{result.genre}</span>
                <span>{result.decade}</span>
              </div>
            </div>
          )}

          {/* Grouped view metadata - different layout */}
          {isGrouped && (
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                {Math.round(result.confidence * 100)}% match
              </span>
              <span>{result.genre}</span>
              <span>{result.decade}</span>
            </div>
          )}

          {/* Enhanced Progression Display with Highlighting */}
          <div className="space-y-2">
            <div className="flex items-center flex-wrap gap-1">
              <span className="text-sm font-medium text-gray-700 mr-2">Progression:</span>
              {highlightedProgression.map((segment, segIndex) => (
                <div key={segIndex} className="flex items-center">
                  {segment.chords.map((chord, chordIndex) => (
                    <React.Fragment key={`${segIndex}-${chordIndex}`}>
                      <span
                        className={`px-2 py-1 rounded text-sm font-mono transition-colors ${
                          segment.isMatch
                            ? 'bg-yellow-200 text-yellow-900 border border-yellow-300 font-semibold'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                        title={segment.isMatch ? 'Matches your search' : ''}
                      >
                        {showNashville 
                          ? (progressionToNashville([chord], currentKey)?.[0] || chord)
                          : chord
                        }
                      </span>
                      {chordIndex < segment.chords.length - 1 && (
                        <span className="mx-1 text-gray-400">→</span>
                      )}
                    </React.Fragment>
                  ))}
                  {segIndex < highlightedProgression.length - 1 && (
                    <span className="mx-1 text-gray-400">→</span>
                  )}
                </div>
              ))}
            </div>

            {/* Alternative view toggle */}
            {showNashville ? (
              <div className="text-sm">
                <span className="font-medium text-gray-700">Chord names: </span>
                <span className="text-gray-500 font-mono">
                  {result.sectionData?.progression?.join(' - ') || 'N/A'}
                </span>
              </div>
            ) : (
              <div className="text-sm">
                <span className="font-medium text-gray-700">Nashville: </span>
                <span className="text-blue-600 font-mono">
                  {progressionToNashville(result.sectionData?.progression || [], currentKey)?.join(' - ') || 'N/A'}
                </span>
              </div>
            )}

            {/* Section Details */}
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>Bars: {result.sectionData?.bars || 'N/A'}</span>
              <span>Repetitions: {result.sectionData?.repetitions || 'N/A'}</span>
              {result.sectionData?.audioTimestamp && (
                <span>
                  Audio: {result.sectionData.audioTimestamp.start} - {result.sectionData.audioTimestamp.end}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 ml-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPlayProgression(result.sectionData?.progression || []);
            }}
            className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isPlaying
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            }`}
            title={isPlaying ? `Playing chord ${currentChordIndex + 1}` : 'Play progression'}
          >
            {isPlaying ? <Square size={14} /> : <Play size={14} />}
            {isPlaying ? 'Stop' : 'Play'}
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSongClick(result.songId);
            }}
            className="flex items-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
            title="View song details"
          >
            <Eye size={14} />
            View
          </button>
        </div>
      </div>
    </div>
  );
};

const SearchResults = ({
  results,
  searchProgression,
  onSongClick,
  onPlayProgression,
  isPlaying,
  currentChordIndex,
  showNashville,
  currentKey,
  className = "",
  filters = {}
}) => {
  // Helper function to highlight matching chord sequences in the progression
  const highlightMatches = (progression, searchChords) => {
    if (!progression || !Array.isArray(progression)) {
      return [];
    }
    
    if (!searchChords || searchChords.length === 0) {
      // Return progression as individual non-matching segments
      return progression.map(chord => ({
        chords: [chord],
        isMatch: false,
        startIndex: 0,
        endIndex: 0
      }));
    }
    
    const highlighted = [];
    let i = 0;
    
    while (i < progression.length) {
      let matchFound = false;
      
      // Check for exact sequence match starting at position i
      if (i + searchChords.length <= progression.length) {
        const slice = progression.slice(i, i + searchChords.length);
        const matches = slice.every((chord, idx) => 
          chord.toLowerCase() === searchChords[idx].toLowerCase()
        );
        
        if (matches) {
          // Add highlighted sequence
          highlighted.push({
            chords: slice,
            isMatch: true,
            startIndex: i,
            endIndex: i + searchChords.length - 1
          });
          i += searchChords.length;
          matchFound = true;
        }
      }
      
      if (!matchFound) {
        // Add single non-matching chord
        highlighted.push({
          chords: [progression[i]],
          isMatch: false,
          startIndex: i,
          endIndex: i
        });
        i++;
      }
    }
    
    return highlighted;
  };

  // Get section type styling
  const getSectionStyle = (sectionName) => {
    const styles = {
      verse: 'bg-green-100 text-green-800 border-green-200',
      chorus: 'bg-blue-100 text-blue-800 border-blue-200',
      bridge: 'bg-purple-100 text-purple-800 border-purple-200',
      intro: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      outro: 'bg-gray-100 text-gray-800 border-gray-200',
      pre_chorus: 'bg-orange-100 text-orange-800 border-orange-200',
      default: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    
    return styles[sectionName.toLowerCase()] || styles.default;
  };

  // Get section icon
  const getSectionIcon = (sectionName) => {
    switch (sectionName.toLowerCase()) {
      case 'verse': return '📝';
      case 'chorus': return '🎵';
      case 'bridge': return '🌉';
      case 'intro': return '🎬';
      case 'outro': return '🏁';
      case 'pre_chorus': return '🎼';
      default: return '🎶';
    }
  };

  // Group results by section type when section filters are applied
  const groupResultsBySection = () => {
    if (!filters.sections || filters.sections.length === 0) {
      return { all: results };
    }
    
    const grouped = {};
    results.forEach(result => {
      const section = result.matchedSection;
      if (!grouped[section]) {
        grouped[section] = [];
      }
      grouped[section].push(result);
    });
    
    return grouped;
  };

  const groupedResults = groupResultsBySection();
  const shouldGroupBySections = filters.sections && filters.sections.length > 1;

  if (!results || results.length === 0) {
    return null;
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <Music className="text-blue-600" size={20} />
          Search Results ({results.length} found)
        </h2>
        {searchProgression && searchProgression.length > 0 && (
          <div className="flex items-center text-sm text-gray-600">
            <span>Searching for:</span>
            <span className="ml-2 px-2 py-1 bg-blue-50 text-blue-700 rounded font-mono">
              {searchProgression.join(' - ')}
            </span>
          </div>
        )}
      </div>

      {/* Render Results - Grouped or Ungrouped */}
      {shouldGroupBySections ? (
        // Grouped by section display
        <div className="space-y-6">
          {Object.entries(groupedResults).map(([sectionName, sectionResults]) => (
            <div key={sectionName} className="space-y-3">
              {/* Section Group Header */}
              <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getSectionStyle(sectionName)}`}>
                  <span>{getSectionIcon(sectionName)}</span>
                  <span className="capitalize">{sectionName.replace('_', ' ')} Section</span>
                </div>
                <span className="text-sm text-gray-500">
                  {sectionResults.length} result{sectionResults.length !== 1 ? 's' : ''}
                </span>
              </div>
              
              {/* Section Results */}
              <div className="space-y-3 ml-4">
                {sectionResults.map((result, index) => (
                  <ResultCard
                    key={`${result.songId}-${result.matchedSection}-${index}`}
                    result={result}
                    searchProgression={searchProgression}
                    onSongClick={onSongClick}
                    onPlayProgression={onPlayProgression}
                    isPlaying={isPlaying}
                    currentChordIndex={currentChordIndex}
                    showNashville={showNashville}
                    currentKey={currentKey}
                    getSectionStyle={getSectionStyle}
                    getSectionIcon={getSectionIcon}
                    highlightMatches={highlightMatches}
                    isGrouped={true}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Standard ungrouped display
        <div className="space-y-4">
          {results.map((result, index) => (
            <ResultCard
              key={`${result.songId}-${result.matchedSection}-${index}`}
              result={result}
              searchProgression={searchProgression}
              onSongClick={onSongClick}
              onPlayProgression={onPlayProgression}
              isPlaying={isPlaying}
              currentChordIndex={currentChordIndex}
              showNashville={showNashville}
              currentKey={currentKey}
              getSectionStyle={getSectionStyle}
              getSectionIcon={getSectionIcon}
              highlightMatches={highlightMatches}
              isGrouped={false}
            />
          ))}
        </div>
      )}

      {/* Results Summary */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div>
            Found {results.length} song{results.length !== 1 ? 's' : ''} with matching progressions
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 bg-yellow-200 border border-yellow-300 rounded"></span>
              <span>Matching sequence</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 bg-gray-100 rounded"></span>
              <span>Other chords</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;