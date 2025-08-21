/**
 * Enhanced SearchSection component
 * Provides intelligent chord progression search with autocomplete and suggestions
 */

import React, { useState, useEffect, useRef } from 'react';
import { Search, Music, Play, Pause, Settings, Lightbulb, X } from 'lucide-react';
import { parseProgressionInput, getChordSuggestions } from '../utils/chordUtils.js';
import { getProgressionSuggestions } from '../utils/chordSearch.js';

const SearchSection = ({
  searchProgression,
  setSearchProgression,
  onSearch,
  speed,
  setSpeed,
  isPlaying,
  onPlayProgression,
  className = ""
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [chordSuggestions, setChordSuggestions] = useState([]);
  const [progressionSuggestions, setProgressionSuggestions] = useState([]);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [searchMode, setSearchMode] = useState('exact'); // 'exact', 'partial', 'transposed'
  
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Only update input value when searchProgression changes from external sources (like clicking suggestions)
  // We don't want to interfere with user typing
  useEffect(() => {
    if (Array.isArray(searchProgression) && inputValue === '') {
      setInputValue(searchProgression.join(' '));
    }
  }, [searchProgression, inputValue]);

  // Handle input changes and provide autocomplete
  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    setCursorPosition(e.target.selectionStart);

    // Parse the input to get chord progression
    const chords = parseProgressionInput(value);
    setSearchProgression(chords);

    // Get chord suggestions for autocomplete
    if (value.trim()) {
      updateSuggestions(value, e.target.selectionStart);
    } else {
      setShowSuggestions(false);
      setChordSuggestions([]);
      setProgressionSuggestions([]);
    }
  };

  // Update suggestions based on current input and cursor position
  const updateSuggestions = (value, position) => {
    const beforeCursor = value.substring(0, position);
    
    // Find the current chord being typed
    const words = beforeCursor.split(/[\s,|-]+/);
    const currentChord = words[words.length - 1] || '';
    
    // Get chord suggestions for the current partial chord
    if (currentChord.length > 0) {
      const suggestions = getChordSuggestions(currentChord, 8);
      setChordSuggestions(suggestions);
    } else {
      setChordSuggestions([]);
    }

    // Get progression suggestions based on current chords
    const currentChords = parseProgressionInput(beforeCursor.replace(currentChord, '').trim());
    if (currentChords.length > 0) {
      const progSuggestions = getProgressionSuggestions(currentChords, 5);
      setProgressionSuggestions(progSuggestions);
    } else {
      setProgressionSuggestions([]);
    }

    setShowSuggestions(chordSuggestions.length > 0 || progressionSuggestions.length > 0);
  };

  // Handle chord suggestion selection
  const selectChordSuggestion = (chord) => {
    const beforeCursor = inputValue.substring(0, cursorPosition);
    const afterCursor = inputValue.substring(cursorPosition);
    
    // Replace the current partial chord
    const words = beforeCursor.split(/[\s,|-]+/);
    words[words.length - 1] = chord;
    const newBefore = words.join(' ');
    const newValue = newBefore + ' ' + afterCursor.trim();
    
    setInputValue(newValue);
    setSearchProgression(parseProgressionInput(newValue));
    setShowSuggestions(false);
    
    // Focus back to input
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.setSelectionRange(newBefore.length + 1, newBefore.length + 1);
      }
    }, 0);
  };

  // Handle progression suggestion selection
  const selectProgressionSuggestion = (progression) => {
    const newValue = progression.join(' ');
    setInputValue(newValue);
    setSearchProgression(progression);
    setShowSuggestions(false);
    
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Handle search
  const handleSearch = () => {
    if (searchProgression && searchProgression.length > 0) {
      onSearch({
        exactMatch: searchMode === 'exact',
        allowTransposition: searchMode === 'transposed'
      });
    }
  };

  // Handle key presses
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  // Common chord progressions for quick access
  const commonProgressions = [
    { name: "1-5-6m-4", chords: ["C", "G", "Am", "F"], description: "Pop progression" },
    { name: "2m-5-1", chords: ["Dm", "G", "C"], description: "Jazz turnaround" },
    { name: "6m-4-1-5", chords: ["Am", "F", "C", "G"], description: "Pop variation" },
    { name: "1-6m-2m-5", chords: ["C", "Am", "Dm", "G"], description: "Circle progression" },
    { name: "1-b7-4", chords: ["C", "Bb", "F"], description: "Rock progression" }
  ];

  // Clear search
  const clearSearch = () => {
    setInputValue('');
    setSearchProgression([]);
    setShowSuggestions(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Music className="text-blue-600" size={20} />
          <h2 className="text-lg font-semibold text-gray-900">Search Chord Progressions</h2>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`p-2 rounded-lg transition-colors ${
            showSettings ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <Settings size={18} />
        </button>
      </div>

      {/* Search Settings */}
      {showSettings && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Search Mode:</label>
              <select
                value={searchMode}
                onChange={(e) => setSearchMode(e.target.value)}
                className="ml-2 px-2 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="exact">Exact Match</option>
                <option value="partial">Partial Match</option>
                <option value="transposed">Include Transpositions</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                Playback Speed: {speed} BPM
              </label>
              <input
                type="range"
                min="60"
                max="180"
                value={speed}
                onChange={(e) => setSpeed(parseInt(e.target.value))}
                className="ml-2 w-24"
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Search Input */}
      <div className="relative mb-4">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            onFocus={() => {
              if (inputValue.trim()) {
                updateSuggestions(inputValue, cursorPosition);
              }
            }}
            onBlur={() => {
              // Delay hiding suggestions to allow for clicks
              setTimeout(() => setShowSuggestions(false), 200);
            }}
            placeholder="Enter chord progression (e.g., C Am F G, or C - Am - F - G)"
            className="w-full px-4 py-3 pr-24 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
          />
          
          {/* Clear button */}
          {inputValue && (
            <button
              onClick={clearSearch}
              className="absolute right-16 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>
          )}
          
          {/* Search button */}
          <button
            onClick={handleSearch}
            disabled={!searchProgression || searchProgression.length === 0}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-4 py-1.5 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            <Search size={16} />
          </button>
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && (chordSuggestions.length > 0 || progressionSuggestions.length > 0) && (
          <div
            ref={suggestionsRef}
            className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto"
          >
            {/* Chord Suggestions */}
            {chordSuggestions.length > 0 && (
              <div className="p-2 border-b border-gray-100">
                <div className="text-xs font-medium text-gray-500 mb-2">Chord Suggestions</div>
                <div className="flex flex-wrap gap-1">
                  {chordSuggestions.map(chord => (
                    <button
                      key={chord}
                      onClick={() => selectChordSuggestion(chord)}
                      className="px-2 py-1 text-sm bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors"
                    >
                      {chord}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Progression Suggestions */}
            {progressionSuggestions.length > 0 && (
              <div className="p-2">
                <div className="text-xs font-medium text-gray-500 mb-2">Progression Completions</div>
                {progressionSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => selectProgressionSuggestion(suggestion.progression)}
                    className="w-full text-left p-2 hover:bg-gray-50 rounded text-sm"
                  >
                    <div className="font-medium text-gray-900">
                      {suggestion.progression.join(' - ')}
                    </div>
                    <div className="text-xs text-gray-500">
                      Found in {suggestion.count} song{suggestion.count !== 1 ? 's' : ''} • 
                      {suggestion.examples.slice(0, 2).map(ex => `${ex.song} (${ex.section})`).join(', ')}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Current Progression Display */}
      {searchProgression && searchProgression.length > 0 && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-blue-900 mb-1">Current Progression:</div>
              <div className="flex items-center space-x-2">
                {searchProgression.map((chord, index) => (
                  <React.Fragment key={index}>
                    <span className="text-lg font-semibold text-blue-700">{chord}</span>
                    {index < searchProgression.length - 1 && (
                      <span className="text-blue-400">→</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
            <button
              onClick={() => onPlayProgression(searchProgression)}
              className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                isPlaying 
                  ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              <span className="text-sm font-medium">
                {isPlaying ? 'Stop' : 'Play'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Quick Access Common Progressions */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Lightbulb size={16} className="text-yellow-500" />
          <span className="text-sm font-medium text-gray-700">Common Progressions:</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {commonProgressions.map((prog, index) => (
            <button
              key={index}
              onClick={() => {
                setInputValue(prog.chords.join(' '));
                setSearchProgression(prog.chords);
              }}
              className="text-left p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <div className="font-medium text-gray-900 text-sm">{prog.name}</div>
              <div className="text-xs text-gray-600 mt-1">{prog.chords.join(' - ')}</div>
              <div className="text-xs text-gray-500 mt-1">{prog.description}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchSection;