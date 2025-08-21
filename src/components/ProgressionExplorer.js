/**
 * ProgressionExplorer component - Interactive chord grid for exploring progressions
 * Allows users to build, modify, and play chord progressions with visual feedback
 */

import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Save, 
  Volume2, 
  Grid, 
  Plus,
  Copy,
  Shuffle
} from 'lucide-react';
import { progressionToNashville, chordToNashville } from '../utils/nashvilleNumbers';
import { 
  getChordSubstitutions, 
  getProgressionVariations, 
  analyzeProgression 
} from '../utils/chordSubstitutions';

const ProgressionExplorer = ({ 
  initialProgression = ['C', 'Am', 'F', 'G'],
  keySignature = 'C',
  onProgressionChange = () => {},
  onPlay = () => {},
  onSave = () => {},
  className = ''
}) => {
  const [progression, setProgression] = useState(initialProgression);
  const [selectedChord, setSelectedChord] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentChordIndex, setCurrentChordIndex] = useState(-1);
  const [showNashville, setShowNashville] = useState(false);
  const [tempo, setTempo] = useState(120);
  const [playbackMode, setPlaybackMode] = useState('loop'); // 'once', 'loop'
  const [showSubstitutions, setShowSubstitutions] = useState(false);
  const [selectedChordForSub, setSelectedChordForSub] = useState(null);
  const [progressionVariations, setProgressionVariations] = useState([]);
  const [progressionAnalysis, setProgressionAnalysis] = useState(null);

  // Common chord progressions and chord palette
  const commonChords = {
    'C': ['C', 'Dm', 'Em', 'F', 'G', 'Am', 'Bdim'],
    'G': ['G', 'Am', 'Bm', 'C', 'D', 'Em', 'F#dim'],
    'D': ['D', 'Em', 'F#m', 'G', 'A', 'Bm', 'C#dim'],
    'A': ['A', 'Bm', 'C#m', 'D', 'E', 'F#m', 'G#dim'],
    'E': ['E', 'F#m', 'G#m', 'A', 'B', 'C#m', 'D#dim'],
    'B': ['B', 'C#m', 'D#m', 'E', 'F#', 'G#m', 'A#dim'],
    'F#': ['F#', 'G#m', 'A#m', 'B', 'C#', 'D#m', 'E#dim'],
    'F': ['F', 'Gm', 'Am', 'Bb', 'C', 'Dm', 'Edim'],
    'Bb': ['Bb', 'Cm', 'Dm', 'Eb', 'F', 'Gm', 'Adim'],
    'Eb': ['Eb', 'Fm', 'Gm', 'Ab', 'Bb', 'Cm', 'Ddim'],
    'Ab': ['Ab', 'Bbm', 'Cm', 'Db', 'Eb', 'Fm', 'Gdim'],
    'Db': ['Db', 'Ebm', 'Fm', 'Gb', 'Ab', 'Bbm', 'Cdim']
  };

  const chordPalette = commonChords[keySignature] || commonChords['C'];

  // Common progression patterns
  const progressionTemplates = [
    { name: 'I-vi-IV-V', progression: ['C', 'Am', 'F', 'G'], description: 'Classic pop progression' },
    { name: 'vi-IV-I-V', progression: ['Am', 'F', 'C', 'G'], description: 'Popular alternative' },
    { name: 'I-V-vi-IV', progression: ['C', 'G', 'Am', 'F'], description: 'Axis progression' },
    { name: 'ii-V-I', progression: ['Dm', 'G', 'C'], description: 'Jazz standard' },
    { name: 'I-vi-ii-V', progression: ['C', 'Am', 'Dm', 'G'], description: 'Circle of fifths' },
    { name: 'I-bVII-IV', progression: ['C', 'Bb', 'F'], description: 'Rock progression' },
    { name: 'vi-bVII-I', progression: ['Am', 'Bb', 'C'], description: 'Modal progression' },
    { name: 'I-III-vi-IV', progression: ['C', 'E', 'Am', 'F'], description: 'Deceptive resolution' }
  ];

  // Update parent when progression changes
  useEffect(() => {
    onProgressionChange(progression);
    
    // Generate variations and analysis when progression changes
    if (progression.length > 0) {
      const variations = getProgressionVariations(progression, keySignature, {
        maxVariations: 4,
        includeModalInterchange: true,
        includeJazzHarmony: false
      });
      setProgressionVariations(variations);
      
      const analysis = analyzeProgression(progression, keySignature);
      setProgressionAnalysis(analysis);
    } else {
      setProgressionVariations([]);
      setProgressionAnalysis(null);
    }
  }, [progression, keySignature, onProgressionChange]);

  // Convert progression to Nashville numbers
  const nashvilleProgression = progressionToNashville(progression, keySignature) || [];

  // Handle chord selection from palette
  const handleChordSelect = (chord) => {
    setSelectedChord(chord);
  };

  // Handle grid cell click
  const handleGridCellClick = (index) => {
    if (selectedChord) {
      const newProgression = [...progression];
      if (index < newProgression.length) {
        // Replace existing chord
        newProgression[index] = selectedChord;
      } else {
        // Add new chord at the end
        newProgression.push(selectedChord);
      }
      setProgression(newProgression);
      setSelectedChord(null);
    } else {
      // Show substitutions for existing chord or remove it
      if (index < progression.length) {
        if (showSubstitutions && selectedChordForSub === index) {
          // Second click removes the chord
          const newProgression = progression.filter((_, i) => i !== index);
          setProgression(newProgression);
          setSelectedChordForSub(null);
        } else {
          // First click shows substitutions
          setSelectedChordForSub(index);
          setShowSubstitutions(true);
        }
      }
    }
  };

  // Handle chord substitution selection
  const handleSubstitutionSelect = (substitution, chordIndex) => {
    const newProgression = [...progression];
    newProgression[chordIndex] = substitution.chord;
    setProgression(newProgression);
    setSelectedChordForSub(null);
    setShowSubstitutions(false);
  };

  // Handle progression variation selection
  const handleVariationSelect = (variation) => {
    setProgression(variation.progression);
    setSelectedChord(null);
    setSelectedChordForSub(null);
    setShowSubstitutions(false);
  };

  // Handle progression playback
  const handlePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      setCurrentChordIndex(-1);
      onPlay({ action: 'stop' });
    } else {
      setIsPlaying(true);
      setCurrentChordIndex(0);
      onPlay({ 
        action: 'play', 
        progression, 
        tempo, 
        mode: playbackMode,
        onChordChange: setCurrentChordIndex,
        onComplete: () => {
          setIsPlaying(false);
          setCurrentChordIndex(-1);
        }
      });
    }
  };

  // Load progression template
  const loadTemplate = (template) => {
    setProgression(template.progression);
    setSelectedChord(null);
  };

  // Clear progression
  const clearProgression = () => {
    setProgression([]);
    setSelectedChord(null);
    setCurrentChordIndex(-1);
    setIsPlaying(false);
  };

  // Shuffle progression
  const shuffleProgression = () => {
    if (progression.length > 1) {
      const shuffled = [...progression].sort(() => Math.random() - 0.5);
      setProgression(shuffled);
    }
  };

  // Copy progression to clipboard
  const copyProgression = async () => {
    const progressionText = showNashville 
      ? (nashvilleProgression || []).join(' - ')
      : progression.join(' - ');
    
    try {
      await navigator.clipboard.writeText(progressionText);
      // Could add toast notification here
    } catch (err) {
      console.warn('Failed to copy progression to clipboard');
    }
  };

  // Get chord display value
  const getChordDisplay = (chord, index) => {
    if (showNashville && nashvilleProgression && nashvilleProgression[index]) {
      return nashvilleProgression[index];
    }
    return chord;
  };

  // Get grid cell styling
  const getGridCellStyling = (index) => {
    const baseClasses = 'relative flex items-center justify-center p-4 rounded-lg border-2 font-semibold transition-all duration-200 cursor-pointer min-h-[80px] text-lg';
    
    const isEmpty = index >= progression.length;
    const isCurrentChord = index === currentChordIndex && isPlaying;
    const isSelectedForSub = showSubstitutions && selectedChordForSub === index;
    
    if (isEmpty) {
      return `${baseClasses} border-dashed border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100 text-gray-400`;
    } else if (isCurrentChord) {
      return `${baseClasses} bg-blue-100 border-blue-400 text-blue-900 shadow-lg animate-pulse ring-2 ring-blue-300`;
    } else if (isSelectedForSub) {
      return `${baseClasses} bg-orange-100 border-orange-400 text-orange-900 shadow-lg ring-2 ring-orange-300`;
    } else {
      return `${baseClasses} bg-white border-gray-200 text-gray-900 hover:bg-gray-50 hover:border-gray-300 hover:shadow-md`;
    }
  };

  // Get chord palette button styling
  const getPaletteButtonStyling = (chord) => {
    const baseClasses = 'flex items-center justify-center p-3 rounded-lg border-2 font-semibold transition-all duration-200 cursor-pointer text-sm min-h-[60px]';
    const isSelected = selectedChord === chord;
    const isInProgression = progression.includes(chord);
    
    if (isSelected) {
      return `${baseClasses} bg-purple-100 border-purple-400 text-purple-900 shadow-md ring-2 ring-purple-300`;
    } else if (isInProgression) {
      return `${baseClasses} bg-green-50 border-green-200 text-green-800 hover:bg-green-100`;
    } else {
      return `${baseClasses} bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300`;
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Grid className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Progression Explorer</h3>
            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
              {progression.length} chords
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowNashville(!showNashville)}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                showNashville 
                  ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {showNashville ? 'Numbers' : 'Chords'}
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePlay}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                isPlaying
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isPlaying ? 'Stop' : 'Play'}</span>
            </button>

            <div className="flex items-center space-x-2">
              <Volume2 className="w-4 h-4 text-gray-500" />
              <input
                type="range"
                min="60"
                max="180"
                value={tempo}
                onChange={(e) => setTempo(parseInt(e.target.value))}
                className="w-20"
              />
              <span className="text-sm text-gray-600 w-12">{tempo} BPM</span>
            </div>

            <select
              value={playbackMode}
              onChange={(e) => setPlaybackMode(e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded text-sm"
            >
              <option value="once">Play Once</option>
              <option value="loop">Loop</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={shuffleProgression}
              disabled={progression.length < 2}
              className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Shuffle progression"
            >
              <Shuffle className="w-4 h-4" />
            </button>
            
            <button
              onClick={copyProgression}
              disabled={progression.length === 0}
              className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Copy progression"
            >
              <Copy className="w-4 h-4" />
            </button>
            
            <button
              onClick={clearProgression}
              disabled={progression.length === 0}
              className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Clear progression"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => onSave(progression)}
              disabled={progression.length === 0}
              className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              <span className="text-sm">Save</span>
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chord Grid */}
          <div className="lg:col-span-2">
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Progression Grid</h4>
              <p className="text-xs text-gray-500 mb-3">
                {selectedChord 
                  ? `Click a cell to place ${selectedChord}, or click an existing chord to replace it`
                  : showSubstitutions && selectedChordForSub !== null
                    ? `Showing substitutions for ${progression[selectedChordForSub]}. Click a substitution below or click the chord again to remove it.`
                    : 'Select a chord from the palette to add, or click existing chords for substitutions'
                }
              </p>
            </div>
            
            <div className="grid grid-cols-4 gap-3 mb-6">
              {Array.from({ length: Math.max(12, progression.length + 4) }, (_, index) => (
                <div
                  key={index}
                  onClick={() => handleGridCellClick(index)}
                  className={getGridCellStyling(index)}
                >
                  {index < progression.length ? (
                    <>
                      <span>{getChordDisplay(progression[index], index)}</span>
                      {index === currentChordIndex && isPlaying && (
                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
                        </div>
                      )}
                    </>
                  ) : (
                    <Plus className="w-6 h-6" />
                  )}
                </div>
              ))}
            </div>

            {/* Progression Summary */}
            {progression.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="text-sm font-semibold text-gray-700 mb-2">Current Progression</h5>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">
                      {showNashville ? 'Nashville:' : 'Chords:'}
                    </span>
                    <span className="ml-2 text-gray-900">
                      {showNashville 
                        ? (nashvilleProgression || []).join(' - ')
                        : progression.join(' - ')
                      }
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">
                      {showNashville ? 'Chords:' : 'Nashville:'}
                    </span>
                    <span className="ml-2 text-gray-600">
                      {showNashville 
                        ? progression.join(' - ')
                        : (nashvilleProgression || []).join(' - ')
                      }
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Key:</span>
                    <span className="ml-2 text-gray-900">{keySignature} major</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Length:</span>
                    <span className="ml-2 text-gray-900">{progression.length} chords</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chord Palette & Templates */}
          <div className="space-y-6">
            {/* Chord Palette */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Chord Palette</h4>
              <p className="text-xs text-gray-500 mb-3">Key of {keySignature} major</p>
              <div className="grid grid-cols-2 gap-2">
                {chordPalette.map((chord) => (
                  <button
                    key={chord}
                    onClick={() => handleChordSelect(chord)}
                    className={getPaletteButtonStyling(chord)}
                  >
                    <span>{showNashville ? chordToNashville(chord, keySignature) : chord}</span>
                  </button>
                ))}
              </div>
              {selectedChord && (
                <div className="mt-3 p-2 bg-purple-50 border border-purple-200 rounded text-sm">
                  <strong>Selected:</strong> {selectedChord} 
                  {showNashville && ` (${chordToNashville(selectedChord, keySignature)})`}
                </div>
              )}
            </div>

            {/* Chord Substitutions */}
            {showSubstitutions && selectedChordForSub !== null && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  Substitutions for {progression[selectedChordForSub]}
                </h4>
                <p className="text-xs text-gray-500 mb-3">
                  Click a substitution to replace the chord
                </p>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {(() => {
                    const chord = progression[selectedChordForSub];
                    const context = {
                      previousChord: selectedChordForSub > 0 ? progression[selectedChordForSub - 1] : null,
                      nextChord: selectedChordForSub < progression.length - 1 ? progression[selectedChordForSub + 1] : null,
                      position: selectedChordForSub
                    };
                    const substitutions = getChordSubstitutions(chord, keySignature, context);
                    
                    return substitutions.map((substitution, index) => (
                      <button
                        key={index}
                        onClick={() => handleSubstitutionSelect(substitution, selectedChordForSub)}
                        className="w-full text-left p-2 border border-gray-200 rounded hover:border-orange-300 hover:bg-orange-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">
                            {substitution.chord}
                            {showNashville && ` (${substitution.nashville})`}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            substitution.type === 'diatonic' ? 'bg-green-100 text-green-800' :
                            substitution.type === 'extended' ? 'bg-blue-100 text-blue-800' :
                            substitution.type === 'jazz' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {substitution.type}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {substitution.description}
                        </div>
                      </button>
                    ));
                  })()}
                </div>
                <button
                  onClick={() => {
                    setShowSubstitutions(false);
                    setSelectedChordForSub(null);
                  }}
                  className="mt-3 w-full px-3 py-1 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded text-sm"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Progression Templates */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Common Progressions</h4>
              <div className="space-y-2">
                {progressionTemplates.slice(0, 6).map((template, index) => (
                  <button
                    key={index}
                    onClick={() => loadTemplate(template)}
                    className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-medium text-gray-900 text-sm">{template.name}</div>
                    <div className="text-xs text-gray-600 mt-1">{template.description}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {template.progression.join(' - ')}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Progression Variations */}
            {progressionVariations.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Progression Variations</h4>
                <p className="text-xs text-gray-500 mb-3">
                  Based on your current progression
                </p>
                <div className="space-y-2">
                  {progressionVariations.map((variation, index) => (
                    <button
                      key={index}
                      onClick={() => handleVariationSelect(variation)}
                      className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-medium text-gray-900 text-sm">
                          {variation.description}
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            variation.complexity === 'simple' ? 'bg-green-100 text-green-800' :
                            variation.complexity === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {variation.complexity}
                          </span>
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                            {variation.type}
                          </span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-600">
                        {variation.progression.join(' - ')}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Progression Analysis */}
            {progressionAnalysis && progression.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Analysis</h4>
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Quality Score:</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            progressionAnalysis.quality >= 80 ? 'bg-green-500' :
                            progressionAnalysis.quality >= 60 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${progressionAnalysis.quality}%` }}
                        ></div>
                      </div>
                      <span className="text-gray-900 font-medium">{progressionAnalysis.quality}/100</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Complexity:</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      progressionAnalysis.complexity === 'simple' ? 'bg-green-100 text-green-800' :
                      progressionAnalysis.complexity === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {progressionAnalysis.complexity}
                    </span>
                  </div>

                  {progressionAnalysis.commonPatterns.length > 0 && (
                    <div className="text-sm">
                      <span className="text-gray-600">Patterns:</span>
                      <div className="mt-1 space-y-1">
                        {progressionAnalysis.commonPatterns.map((pattern, index) => (
                          <div key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {pattern}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {progressionAnalysis.suggestions.length > 0 && (
                    <div className="text-sm">
                      <span className="text-gray-600">Suggestions:</span>
                      <div className="mt-1 space-y-1">
                        {progressionAnalysis.suggestions.map((suggestion, index) => (
                          <div key={index} className="text-xs text-gray-700">
                            • {suggestion}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressionExplorer;