/**
 * SectionChordVisualization component - Enhanced chord visualization for song sections
 * Provides detailed visual representation of chord progressions with Nashville number support
 */

import React, { useState } from 'react';
import { Play, Pause, RotateCcw, Info, Zap } from 'lucide-react';
import { progressionToNashville } from '../utils/nashvilleNumbers';

const SectionChordVisualization = ({
  sectionName,
  progression,
  bars,
  repetitions,
  complexity,
  audioTimestamp,
  keySignature = 'C',
  showNashville = false,
  isPlaying = false,
  currentChordIndex = -1,
  onPlaySection = () => {},
  onChordClick = () => {},
  onExploreProgression = () => {},
  className = ''
}) => {
  const [hoveredChordIndex, setHoveredChordIndex] = useState(-1);
  const [showChordInfo, setShowChordInfo] = useState(false);

  // Convert progression to Nashville numbers
  const nashvilleProgression = progressionToNashville(progression, keySignature);

  // Calculate chord distribution within bars
  const chordsPerBar = Math.ceil(progression.length / bars);
  const chordBars = [];
  
  for (let bar = 0; bar < bars; bar++) {
    const startIndex = bar * chordsPerBar;
    const endIndex = Math.min(startIndex + chordsPerBar, progression.length);
    chordBars.push(progression.slice(startIndex, endIndex));
  }

  // Get chord complexity color
  const getComplexityColor = (complexity) => {
    const colors = {
      simple: 'border-green-200 bg-green-50',
      intermediate: 'border-yellow-200 bg-yellow-50',
      complex: 'border-red-200 bg-red-50'
    };
    return colors[complexity] || 'border-gray-200 bg-gray-50';
  };

  // Get chord display value
  const getChordDisplay = (index) => {
    if (showNashville && nashvilleProgression[index]) {
      return nashvilleProgression[index];
    }
    return progression[index] || '';
  };

  // Get chord styling based on state
  const getChordStyling = (index) => {
    const baseClasses = 'relative flex items-center justify-center p-3 rounded-lg border-2 font-semibold transition-all duration-200 cursor-pointer transform hover:scale-105';
    
    if (index === currentChordIndex && isPlaying) {
      return `${baseClasses} bg-blue-100 border-blue-400 text-blue-900 shadow-lg animate-pulse ring-2 ring-blue-300`;
    } else if (index < currentChordIndex && isPlaying) {
      return `${baseClasses} bg-gray-100 border-gray-300 text-gray-600`;
    } else if (index === hoveredChordIndex) {
      return `${baseClasses} bg-purple-50 border-purple-300 text-purple-900 shadow-md`;
    } else {
      return `${baseClasses} bg-white border-gray-200 text-gray-900 hover:bg-gray-50 hover:border-gray-300`;
    }
  };

  // Format section name for display
  const formatSectionName = (name) => {
    return name.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Get chord theory information
  const getChordInfo = (chordIndex) => {
    const chord = progression[chordIndex];
    const nashville = nashvilleProgression[chordIndex];
    
    return {
      chord,
      nashville,
      position: `${chordIndex + 1} of ${progression.length}`,
      bar: Math.floor(chordIndex / chordsPerBar) + 1,
      inBar: (chordIndex % chordsPerBar) + 1
    };
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 overflow-hidden ${className}`}>
      {/* Section Header */}
      <div className={`px-6 py-4 border-b border-gray-200 ${getComplexityColor(complexity)}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-semibold text-gray-900">
              {formatSectionName(sectionName)}
            </h3>
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              complexity === 'simple' ? 'bg-green-100 text-green-800' :
              complexity === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {complexity}
            </span>
            <span className="text-sm text-gray-600">
              {bars} bars × {repetitions} {repetitions === 1 ? 'time' : 'times'}
            </span>
            <button
              onClick={() => setShowChordInfo(!showChordInfo)}
              className="p-1 text-gray-500 hover:text-gray-700 rounded transition-colors"
              title="Toggle chord information"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center space-x-2">
            {audioTimestamp && (
              <span className="text-sm text-gray-500">
                {audioTimestamp.start} - {audioTimestamp.end}
              </span>
            )}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onExploreProgression(progression)}
                className="flex items-center space-x-1 px-3 py-1 bg-purple-100 text-purple-700 hover:bg-purple-200 rounded transition-colors"
                title="Explore this progression in the interactive grid"
              >
                <Zap className="w-4 h-4" />
                <span className="text-sm font-medium">Explore</span>
              </button>
              
              <button
                onClick={() => onPlaySection(sectionName, progression)}
                className={`flex items-center space-x-1 px-3 py-1 rounded transition-colors ${
                  isPlaying
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span className="text-sm font-medium">
                  {isPlaying ? 'Stop' : 'Play'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Chord Information Panel */}
      {showChordInfo && hoveredChordIndex >= 0 && (
        <div className="px-6 py-3 bg-blue-50 border-b border-blue-200">
          <div className="text-sm">
            <div className="font-medium text-blue-900 mb-2">Chord Information</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-blue-800">
              {(() => {
                const info = getChordInfo(hoveredChordIndex);
                return (
                  <>
                    <div>
                      <span className="font-medium">Chord:</span> {info.chord}
                    </div>
                    <div>
                      <span className="font-medium">Nashville:</span> {info.nashville}
                    </div>
                    <div>
                      <span className="font-medium">Position:</span> {info.position}
                    </div>
                    <div>
                      <span className="font-medium">Bar:</span> {info.bar} ({info.inBar})
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Bar-based Chord Layout */}
      <div className="p-6">
        <div className="space-y-4">
          {chordBars.map((barChords, barIndex) => (
            <div key={barIndex} className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-medium text-gray-500 w-12">
                  Bar {barIndex + 1}:
                </span>
                <div className="flex-1 grid gap-2" style={{
                  gridTemplateColumns: `repeat(${Math.max(barChords.length, 1)}, minmax(0, 1fr))`
                }}>
                  {barChords.map((chord, chordInBarIndex) => {
                    const globalIndex = barIndex * chordsPerBar + chordInBarIndex;
                    return (
                      <div
                        key={globalIndex}
                        className={getChordStyling(globalIndex)}
                        onClick={() => onChordClick(globalIndex)}
                        onMouseEnter={() => setHoveredChordIndex(globalIndex)}
                        onMouseLeave={() => setHoveredChordIndex(-1)}
                        title={showNashville 
                          ? `${nashvilleProgression[globalIndex]} (${chord})` 
                          : `${chord} (${nashvilleProgression[globalIndex]})`}
                      >
                        <span className="text-base font-bold">
                          {getChordDisplay(globalIndex)}
                        </span>
                        
                        {/* Playing indicator */}
                        {globalIndex === currentChordIndex && isPlaying && (
                          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
                          </div>
                        )}

                        {/* Hover overlay */}
                        {globalIndex === hoveredChordIndex && (
                          <div className="absolute inset-0 bg-purple-100 bg-opacity-30 rounded-lg pointer-events-none"></div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bar separator line */}
              {barIndex < chordBars.length - 1 && (
                <div className="border-t border-gray-100 my-2"></div>
              )}
            </div>
          ))}
        </div>

        {/* Repetition Indicator */}
        {repetitions > 1 && (
          <div className="mt-4 flex items-center justify-center">
            <div className="flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">
              <RotateCcw className="w-4 h-4" />
              <span>Repeat {repetitions} times</span>
            </div>
          </div>
        )}

        {/* Progression Summary */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium">Total Chords:</span>
              <span className="ml-2">{progression.length}</span>
            </div>
            <div>
              <span className="font-medium">Unique Chords:</span>
              <span className="ml-2">{new Set(progression).size}</span>
            </div>
            <div>
              <span className="font-medium">Key:</span>
              <span className="ml-2">{keySignature} major</span>
            </div>
          </div>

          {/* Full Progression Display */}
          <div className="mt-3 space-y-1">
            <div className="flex items-start space-x-2">
              <span className="font-medium text-gray-700 text-sm">
                {showNashville ? 'Nashville:' : 'Chords:'}
              </span>
              <span className="text-sm text-gray-900 flex-1">
                {showNashville 
                  ? nashvilleProgression.join(' - ')
                  : progression.join(' - ')
                }
              </span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="font-medium text-gray-700 text-sm">
                {showNashville ? 'Chords:' : 'Nashville:'}
              </span>
              <span className="text-sm text-gray-600 flex-1">
                {showNashville 
                  ? progression.join(' - ')
                  : nashvilleProgression.join(' - ')
                }
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionChordVisualization;