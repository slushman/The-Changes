/**
 * ChordProgressionBuilder - Interactive component for building chord progressions
 * Features chord input, visual feedback, and key-aware suggestions
 */

import React, { useState, useEffect } from 'react';
import { Plus, X, Play, Trash2, Music } from 'lucide-react';
import { playChord, createAudioContext, stopAudioNodes } from '../utils/audioSynthesis';
import { transposeChord } from '../utils/chordUtils';

const ChordProgressionBuilder = ({ 
  verseChords, 
  chorusChords, 
  bridgeChords, 
  onChordsChange, 
  errors = {}, 
  songKey = 'C' 
}) => {
  const [activeSection, setActiveSection] = useState('verse');
  const [audioContext, setAudioContext] = useState(null);
  const [playingChord, setPlayingChord] = useState(null);
  const [audioNodes, setAudioNodes] = useState([]);

  // Common chords in major keys for suggestions
  const majorKeyChords = {
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

  // Initialize audio context
  useEffect(() => {
    const initAudio = async () => {
      try {
        const ctx = await createAudioContext();
        setAudioContext(ctx);
      } catch (error) {
        console.warn('Audio context not available:', error);
      }
    };
    initAudio();
  }, []);

  const getSuggestedChords = () => {
    return majorKeyChords[songKey] || majorKeyChords['C'];
  };

  const getCurrentChords = () => {
    switch (activeSection) {
      case 'verse': return verseChords || [];
      case 'chorus': return chorusChords || [];
      case 'bridge': return bridgeChords || [];
      default: return [];
    }
  };

  const handleChordChange = (index, newChord) => {
    const currentChords = getCurrentChords();
    const newChords = [...currentChords];
    newChords[index] = newChord;
    onChordsChange(activeSection, newChords);
  };

  const handleAddChord = (chord = '') => {
    const currentChords = getCurrentChords();
    const newChords = [...currentChords, chord];
    onChordsChange(activeSection, newChords);
  };

  const handleRemoveChord = (index) => {
    const currentChords = getCurrentChords();
    const newChords = currentChords.filter((_, i) => i !== index);
    onChordsChange(activeSection, newChords);
  };

  const handleClearSection = () => {
    onChordsChange(activeSection, []);
  };

  const handlePresetProgression = (preset) => {
    onChordsChange(activeSection, preset);
  };

  const playChordPreview = async (chord, index = null) => {
    if (!audioContext || !chord) return;

    // Stop previous audio
    if (audioNodes.length > 0) {
      stopAudioNodes(audioNodes);
      setAudioNodes([]);
    }

    // Resume audio context if needed
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    try {
      setPlayingChord(index !== null ? index : chord);
      const nodes = playChord(audioContext, chord, 1.5, null, {
        volume: 0.3,
        waveType: 'sine',
        octave: 4,
        voicing: 'root'
      });
      setAudioNodes(nodes);

      // Auto-stop after duration
      setTimeout(() => {
        setPlayingChord(null);
        if (nodes) {
          stopAudioNodes(nodes);
        }
      }, 1500);
    } catch (error) {
      console.error('Error playing chord:', error);
      setPlayingChord(null);
    }
  };

  const playProgression = async () => {
    const currentChords = getCurrentChords();
    if (!audioContext || currentChords.length === 0) return;

    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    let index = 0;
    const playNext = () => {
      if (index >= currentChords.length) {
        setPlayingChord(null);
        return;
      }

      playChordPreview(currentChords[index], index);
      index++;
      setTimeout(playNext, 800);
    };

    playNext();
  };

  // Common progressions for quick selection
  const commonProgressions = {
    verse: [
      { name: 'I-V-vi-IV', chords: ['C', 'G', 'Am', 'F'] },
      { name: 'vi-IV-I-V', chords: ['Am', 'F', 'C', 'G'] },
      { name: 'I-vi-IV-V', chords: ['C', 'Am', 'F', 'G'] },
      { name: 'ii-V-I', chords: ['Dm', 'G', 'C'] }
    ],
    chorus: [
      { name: 'IV-I-V-vi', chords: ['F', 'C', 'G', 'Am'] },
      { name: 'I-V-vi-IV', chords: ['C', 'G', 'Am', 'F'] },
      { name: 'vi-IV-I-V', chords: ['Am', 'F', 'C', 'G'] },
      { name: 'I-IV-V', chords: ['C', 'F', 'G'] }
    ],
    bridge: [
      { name: 'IV-v-I', chords: ['F', 'Gm', 'C'] },
      { name: 'ii-V-vi', chords: ['Dm', 'G', 'Am'] },
      { name: 'IV-I-V', chords: ['F', 'C', 'G'] }
    ]
  };

  const getTransposedPresets = (section) => {
    const presets = commonProgressions[section] || [];
    if (songKey === 'C') {
      return presets; // No transposition needed
    }
    
    // Simple key-to-semitone mapping for transposition
    const keyToSemitones = {
      'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E': 4, 'F': 5, 
      'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
    };
    
    const semitones = keyToSemitones[songKey] || 0;
    
    return presets.map(preset => ({
      ...preset,
      chords: preset.chords.map(chord => {
        try {
          return transposeChord(chord, semitones);
        } catch {
          return chord; // Fallback to original chord
        }
      })
    }));
  };

  const sections = [
    { id: 'verse', label: 'Verse', chords: verseChords },
    { id: 'chorus', label: 'Chorus', chords: chorusChords },
    { id: 'bridge', label: 'Bridge', chords: bridgeChords }
  ];

  return (
    <div className="space-y-6">
      {/* Section Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {sections.map(section => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeSection === section.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {section.label}
            {section.chords && section.chords.length > 0 && (
              <span className="ml-2 px-1.5 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                {section.chords.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Current Progression */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            {sections.find(s => s.id === activeSection)?.label} Progression
          </h3>
          <div className="flex gap-2">
            <button
              onClick={playProgression}
              disabled={getCurrentChords().length === 0}
              className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Play className="w-3 h-3" />
              Play
            </button>
            <button
              onClick={handleClearSection}
              disabled={getCurrentChords().length === 0}
              className="flex items-center gap-1 px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              Clear
            </button>
          </div>
        </div>

        {/* Chord Input Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
          {getCurrentChords().map((chord, index) => (
            <div key={index} className="relative group">
              <input
                type="text"
                value={chord}
                onChange={(e) => handleChordChange(index, e.target.value)}
                className={`w-full px-3 py-2 text-center font-mono border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  playingChord === index ? 'bg-blue-100 border-blue-500' : 'border-gray-300'
                }`}
                placeholder="C"
              />
              <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => playChordPreview(chord, index)}
                  className="p-1 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                >
                  <Play className="w-3 h-3" />
                </button>
              </div>
              <button
                onClick={() => handleRemoveChord(index)}
                className="absolute -top-2 -right-8 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}

          {/* Add Chord Button */}
          <button
            onClick={() => handleAddChord()}
            className="flex items-center justify-center px-3 py-2 border-2 border-dashed border-gray-300 rounded-md hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <Plus className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Error Message */}
        {errors[`${activeSection}Chords`] && (
          <p className="text-sm text-red-600">{errors[`${activeSection}Chords`]}</p>
        )}
      </div>

      {/* Preset Progressions */}
      <div className="space-y-3">
        <h4 className="text-md font-medium text-gray-900">Common Progressions (Key of {songKey})</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {getTransposedPresets(activeSection).map((preset, index) => (
            <button
              key={index}
              onClick={() => handlePresetProgression(preset.chords)}
              className="flex items-center justify-between p-3 text-left bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
            >
              <div>
                <div className="font-medium text-gray-900">{preset.name}</div>
                <div className="text-sm text-gray-600 font-mono">
                  {preset.chords.join(' - ')}
                </div>
              </div>
              <Plus className="w-4 h-4 text-gray-400" />
            </button>
          ))}
        </div>
      </div>

      {/* Chord Suggestions */}
      <div className="space-y-3">
        <h4 className="text-md font-medium text-gray-900">Suggested Chords for {songKey} Major</h4>
        <div className="flex flex-wrap gap-2">
          {getSuggestedChords().map((chord, index) => (
            <button
              key={chord}
              onClick={() => handleAddChord(chord)}
              onDoubleClick={() => playChordPreview(chord)}
              className={`px-3 py-1 text-sm font-mono rounded-md border transition-colors ${
                playingChord === chord 
                  ? 'bg-blue-100 border-blue-500 text-blue-700'
                  : 'bg-white border-gray-300 hover:bg-gray-50'
              }`}
              title="Click to add, double-click to preview"
            >
              {chord}
              <span className="ml-1 text-xs text-gray-500">
                {['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'][index]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex items-start gap-2">
          <Music className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Tips:</p>
            <ul className="space-y-1 text-blue-700">
              <li>• Use Roman numeral presets as starting points</li>
              <li>• Click suggested chords to add them quickly</li>
              <li>• Double-click any chord to hear a preview</li>
              <li>• Try different chord voicings like "Cmaj7" or "Am/C"</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChordProgressionBuilder;