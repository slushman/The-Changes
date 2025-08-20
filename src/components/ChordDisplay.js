/**
 * ChordDisplay component that can show chords as names or Nashville numbers
 * Provides toggle functionality and key context for number system
 */

import React, { useState, useEffect } from 'react';
import { Music, Hash, Key, RotateCcw } from 'lucide-react';
import { chordToNashville, progressionToNashville, detectKey } from '../utils/nashvilleNumbers';

const ChordDisplay = ({
  chords = [],
  currentIndex = 0,
  isPlaying = false,
  onChordClick = () => {},
  showNashville = false,
  onToggleNashville = () => {},
  keySignature = null,
  onKeyChange = () => {},
  autoDetectKey = true,
  className = '',
  size = 'medium' // 'small', 'medium', 'large'
}) => {
  const [displayKey, setDisplayKey] = useState('C');
  const [nashvilleNumbers, setNashvilleNumbers] = useState([]);

  // Auto-detect key when chords change
  useEffect(() => {
    if (autoDetectKey && chords.length > 0) {
      const detectedKey = detectKey(chords);
      setDisplayKey(detectedKey);
      if (onKeyChange) {
        onKeyChange(detectedKey);
      }
    } else if (keySignature) {
      setDisplayKey(keySignature);
    }
  }, [chords, autoDetectKey, keySignature, onKeyChange]);

  // Convert chords to Nashville numbers when key or chords change
  useEffect(() => {
    if (chords.length > 0) {
      const numbers = progressionToNashville(chords, displayKey);
      setNashvilleNumbers(numbers);
    }
  }, [chords, displayKey]);

  // Get size classes
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return {
          chord: 'w-10 h-10 text-sm',
          container: 'gap-1',
          text: 'text-xs'
        };
      case 'large':
        return {
          chord: 'w-20 h-20 text-xl',
          container: 'gap-4',
          text: 'text-base'
        };
      default: // medium
        return {
          chord: 'w-16 h-16 text-base',
          container: 'gap-2',
          text: 'text-sm'
        };
    }
  };

  const sizeClasses = getSizeClasses();

  // Get chord display value (name or Nashville number)
  const getChordDisplay = (index) => {
    if (showNashville && nashvilleNumbers[index]) {
      return nashvilleNumbers[index];
    }
    return chords[index] || '';
  };

  // Get chord classes for styling
  const getChordClasses = (index) => {
    const baseClasses = `${sizeClasses.chord} border-2 rounded-lg flex items-center justify-center font-semibold cursor-pointer transition-all duration-200 transform hover:scale-105`;
    
    if (index === currentIndex && isPlaying) {
      return `${baseClasses} bg-blue-100 border-blue-300 text-blue-900 shadow-lg animate-pulse`;
    } else if (index < currentIndex && isPlaying) {
      return `${baseClasses} bg-gray-100 border-gray-300 text-gray-700`;
    } else {
      return `${baseClasses} bg-white border-gray-200 text-gray-900 hover:bg-gray-50`;
    }
  };

  // Handle key selection
  const handleKeyChange = (newKey) => {
    setDisplayKey(newKey);
    if (onKeyChange) {
      onKeyChange(newKey);
    }
  };

  // Common keys for quick selection
  const commonKeys = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'F', 'Bb', 'Eb', 'Ab', 'Db'];

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      {/* Header with controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Music className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">
            {showNashville ? 'Nashville Numbers' : 'Chord Names'}
          </h3>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Key selector */}
          <div className="flex items-center space-x-1">
            <Key className="w-4 h-4 text-gray-600" />
            <select
              value={displayKey}
              onChange={(e) => handleKeyChange(e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Select key for Nashville numbers"
            >
              {commonKeys.map(key => (
                <option key={key} value={key}>{key}</option>
              ))}
            </select>
          </div>

          {/* Auto-detect key button */}
          {chords.length > 0 && (
            <button
              onClick={() => {
                const detectedKey = detectKey(chords);
                handleKeyChange(detectedKey);
              }}
              className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
              title="Auto-detect key from chords"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}

          {/* Toggle Nashville/Chord names */}
          <button
            onClick={onToggleNashville}
            className={`flex items-center space-x-1 px-3 py-1 rounded transition-colors ${
              showNashville 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            title={showNashville ? 'Show chord names' : 'Show Nashville numbers'}
          >
            <Hash className="w-4 h-4" />
            <span className="text-sm">
              {showNashville ? 'Numbers' : 'Chords'}
            </span>
          </button>
        </div>
      </div>

      {/* Chord progression display */}
      {chords.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          <Music className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No chord progression to display</p>
        </div>
      ) : (
        <>
          <div className={`flex flex-wrap items-center ${sizeClasses.container} mb-4`}>
            {chords.map((chord, index) => (
              <div key={`${chord}-${index}`} className="relative">
                <div
                  className={getChordClasses(index)}
                  onClick={() => onChordClick(index)}
                  title={showNashville 
                    ? `${nashvilleNumbers[index]} (${chord})` 
                    : `${chord} (${nashvilleNumbers[index] || ''})`
                  }
                >
                  {getChordDisplay(index)}
                  
                  {/* Playing indicator */}
                  {index === currentIndex && isPlaying && (
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
                    </div>
                  )}
                </div>
                
                {/* Connection line to next chord */}
                {index < chords.length - 1 && (
                  <div className="absolute top-1/2 -right-1 w-2 h-0.5 bg-gray-300 transform -translate-y-1/2"></div>
                )}
              </div>
            ))}
          </div>

          {/* Key and progression info */}
          <div className={`${sizeClasses.text} text-gray-600 space-y-1`}>
            <div className="flex items-center justify-between">
              <span>
                <strong>Key:</strong> {displayKey} major
              </span>
              <span>
                <strong>Length:</strong> {chords.length} chords
              </span>
            </div>
            
            {showNashville ? (
              <div>
                <strong>Chord names:</strong> {chords.join(' - ')}
              </div>
            ) : (
              <div>
                <strong>Nashville numbers:</strong> {nashvilleNumbers.join(' - ')}
              </div>
            )}
            
            {currentIndex >= 0 && currentIndex < chords.length && (
              <div>
                <strong>Current:</strong> {chords[currentIndex]} 
                {nashvilleNumbers[currentIndex] && ` (${nashvilleNumbers[currentIndex]})`}
                {isPlaying && ' - Playing'}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ChordDisplay;