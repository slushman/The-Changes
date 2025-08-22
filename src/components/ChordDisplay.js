/**
 * ChordDisplay component that can show chords as names or Nashville numbers
 * Provides toggle functionality and key context for number system
 */

import React, { useState, useEffect } from 'react';
import { Music, Hash, Key, RotateCcw, Volume2 } from 'lucide-react';
import { progressionToNashville, detectKey } from '../utils/nashvilleNumbers';

const ChordDisplay = ({
  chords = [],
  currentIndex = 0,
  chordProgress = 0, // Progress within current chord (0-1)
  overallProgress = 0, // Overall progression progress (0-1)
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

  // Get chord classes for styling with enhanced visual feedback
  const getChordClasses = (index) => {
    const baseClasses = `${sizeClasses.chord} border-2 rounded-lg flex items-center justify-center font-semibold cursor-pointer transition-all duration-300 transform hover:scale-105 relative`;
    
    if (index === currentIndex && isPlaying) {
      // Enhanced currently playing chord with gradient, glow, and dynamic scaling based on progress
      return `${baseClasses} bg-gradient-to-r from-blue-100 to-blue-200 border-blue-400 text-blue-900 shadow-xl scale-110 ring-4 ring-blue-200 ring-opacity-60`;
    } else if (index < currentIndex && isPlaying) {
      // Previously played chords with success styling and smooth fade-in
      return `${baseClasses} bg-green-50 border-green-200 text-green-800 opacity-80 shadow-sm transform transition-all duration-500 ease-in-out`;
    } else if (index > currentIndex && isPlaying) {
      // Future chords with muted styling and anticipation effect
      const isNext = index === currentIndex + 1;
      return `${baseClasses} ${isNext ? 'bg-blue-25 border-blue-100' : 'bg-gray-50 border-gray-200'} text-gray-500 opacity-60 transition-all duration-300`;
    } else {
      // Default state with smooth transitions
      return `${baseClasses} bg-white border-gray-200 text-gray-900 hover:bg-gray-50 hover:border-gray-300 shadow-sm transition-all duration-200`;
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
      {/* Overall progression progress indicator */}
      {isPlaying && chords.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progression Progress</span>
            <span className="text-sm text-gray-500">
              {Math.round(overallProgress * 100)}% complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 relative overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full transition-all duration-100 ease-linear relative"
              style={{ width: `${overallProgress * 100}%` }}
            >
              {/* Animated shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
            </div>
            {/* Chord segment indicators */}
            <div className="absolute inset-0 flex">
              {chords.map((_, index) => (
                <div 
                  key={index} 
                  className="flex-1 border-r border-gray-300 last:border-r-0"
                  style={{ minWidth: `${100 / chords.length}%` }}
                ></div>
              ))}
            </div>
          </div>
          <div className="flex justify-between mt-1 text-xs text-gray-400">
            <span>Start</span>
            <span>{currentIndex + 1} / {chords.length}</span>
            <span>End</span>
          </div>
        </div>
      )}
      
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
                  
                  {/* Enhanced playing indicator with multiple visual cues */}
                  {index === currentIndex && isPlaying && (
                    <>
                      {/* Animated sound wave indicator */}
                      <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full p-1 shadow-lg animate-bounce">
                        <Volume2 className="w-3 h-3" />
                      </div>
                      
                      {/* Pulsing dot indicator */}
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-ping"></div>
                        <div className="absolute top-0 left-0 w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
                      </div>
                      
                      {/* Synchronized progress bar overlay */}
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-200 rounded-b-lg overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-b-lg transition-all duration-75 ease-linear"
                          style={{
                            width: `${chordProgress * 100}%`,
                            background: `linear-gradient(90deg, #3b82f6 0%, #1d4ed8 ${chordProgress * 100}%, #93c5fd ${chordProgress * 100}%)`
                          }}
                        ></div>
                      </div>
                    </>
                  )}
                  
                  {/* Completion indicator for previously played chords */}
                  {index < currentIndex && isPlaying && (
                    <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full p-0.5 shadow-sm">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
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