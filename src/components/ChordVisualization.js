/**
 * ChordVisualization component for displaying individual chord information with visual feedback
 * Shows chord structure, notes, and audio visualization during playback
 */

import React, { useEffect, useState, useMemo } from 'react';
import { Music, Volume2, Info } from 'lucide-react';
import { parseChord, getChordFrequencies } from '../utils/audioSynthesis';

const ChordVisualization = ({
  chord = 'C',
  isPlaying = false,
  showNotes = true,
  showFrequencies = false,
  showChordInfo = true,
  showVisualizer = true,
  octave = 4,
  size = 'medium', // 'small', 'medium', 'large'
  theme = 'default', // 'default', 'dark', 'minimal'
  className = ''
}) => {
  const [animationPhase, setAnimationPhase] = useState(0);
  const [displayNotes, setDisplayNotes] = useState([]);

  // Parse chord and get note information
  const chordInfo = useMemo(() => {
    const { root, quality } = parseChord(chord);
    const frequencies = getChordFrequencies(chord, octave);
    
    // Map frequencies to note names (simplified)
    const noteNames = {
      'C': ['C', 'E', 'G'],
      'Am': ['A', 'C', 'E'],
      'F': ['F', 'A', 'C'],
      'G': ['G', 'B', 'D'],
      'Dm': ['D', 'F', 'A'],
      'Em': ['E', 'G', 'B'],
      'Cmaj7': ['C', 'E', 'G', 'B'],
      'Am7': ['A', 'C', 'E', 'G'],
      'Fmaj7': ['F', 'A', 'C', 'E'],
      'G7': ['G', 'B', 'D', 'F']
    };
    
    // Get notes for this chord (fallback to basic triad)
    let notes = noteNames[chord] || [root];
    if (notes.length === 1 && quality !== 'major') {
      // Basic fallback for unknown chords
      const basicNotes = {
        'minor': [root, 'C', 'G'], // Simplified
        'major7': [root, 'E', 'G', 'B'],
        'minor7': [root, 'C', 'G', 'F']
      };
      notes = basicNotes[quality] || [root, 'E', 'G'];
    }
    
    return {
      root,
      quality,
      notes,
      frequencies,
      description: getChordDescription(quality)
    };
  }, [chord, octave]);

  // Animation for playing state
  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setAnimationPhase(prev => (prev + 1) % 4);
      }, 150);
      
      return () => clearInterval(interval);
    } else {
      setAnimationPhase(0);
    }
  }, [isPlaying]);

  // Update display notes with animation
  useEffect(() => {
    if (isPlaying) {
      const timer = setTimeout(() => {
        setDisplayNotes(chordInfo.notes);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setDisplayNotes(chordInfo.notes);
    }
  }, [chordInfo.notes, isPlaying]);

  // Get chord quality description
  function getChordDescription(quality) {
    const descriptions = {
      'major': 'Major triad - bright, happy sound',
      'minor': 'Minor triad - darker, sadder sound',
      'major7': 'Major seventh - jazzy, sophisticated',
      'minor7': 'Minor seventh - smooth, mellow',
      'dominant7': 'Dominant seventh - bluesy, tension',
      'diminished': 'Diminished - tense, unstable',
      'augmented': 'Augmented - mysterious, unsettled',
      'sus2': 'Suspended 2nd - open, floating',
      'sus4': 'Suspended 4th - building tension'
    };
    return descriptions[quality] || 'Chord variant';
  }

  // Get size classes
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return {
          container: 'p-3',
          chord: 'text-2xl',
          notes: 'text-sm',
          info: 'text-xs',
          visualizer: 'h-8'
        };
      case 'large':
        return {
          container: 'p-6',
          chord: 'text-5xl',
          notes: 'text-lg',
          info: 'text-base',
          visualizer: 'h-16'
        };
      default: // medium
        return {
          container: 'p-4',
          chord: 'text-3xl',
          notes: 'text-base',
          info: 'text-sm',
          visualizer: 'h-12'
        };
    }
  };

  // Get theme classes
  const getThemeClasses = () => {
    switch (theme) {
      case 'dark':
        return {
          background: 'bg-gray-900 border-gray-700',
          chord: 'text-white',
          notes: 'text-gray-300',
          info: 'text-gray-400',
          accent: 'text-blue-400',
          playing: 'bg-blue-900 border-blue-600'
        };
      case 'minimal':
        return {
          background: 'bg-white border-gray-200',
          chord: 'text-gray-900',
          notes: 'text-gray-700',
          info: 'text-gray-500',
          accent: 'text-blue-600',
          playing: 'bg-blue-50 border-blue-300'
        };
      default:
        return {
          background: 'bg-white border-gray-200',
          chord: 'text-gray-900',
          notes: 'text-gray-700',
          info: 'text-gray-600',
          accent: 'text-blue-600',
          playing: 'bg-blue-50 border-blue-300'
        };
    }
  };

  const sizeClasses = getSizeClasses();
  const themeClasses = getThemeClasses();

  // Render audio visualizer bars
  const renderVisualizer = () => {
    const barCount = chordInfo.frequencies.length * 2;
    const bars = Array.from({ length: barCount }, (_, i) => {
      const baseHeight = 20 + (i % 3) * 10;
      const playingMultiplier = isPlaying ? 1 + Math.sin(animationPhase + i * 0.5) * 0.4 : 0.2;
      const height = Math.max(4, baseHeight * playingMultiplier);
      
      return (
        <div
          key={i}
          className={`w-1 bg-gradient-to-t from-blue-500 to-blue-300 rounded-t transition-all duration-150 ${
            isPlaying ? 'opacity-100' : 'opacity-30'
          }`}
          style={{ height: `${height}%` }}
        />
      );
    });
    
    return (
      <div className={`flex items-end justify-center space-x-1 ${sizeClasses.visualizer} bg-gray-100 rounded p-2`}>
        {bars}
      </div>
    );
  };

  // Render frequency information
  const renderFrequencies = () => (
    <div className="space-y-1">
      <div className={`font-medium ${themeClasses.info}`}>Frequencies:</div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        {chordInfo.frequencies.map((freq, index) => (
          <div key={index} className={`${themeClasses.info} font-mono`}>
            {displayNotes[index] || 'Note'}: {freq.toFixed(1)}Hz
          </div>
        ))}
      </div>
    </div>
  );

  // Render note circles
  const renderNoteCircles = () => (
    <div className="flex justify-center space-x-2">
      {displayNotes.map((note, index) => (
        <div
          key={`${note}-${index}`}
          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-semibold transition-all duration-200 ${
            isPlaying && animationPhase === index % 4
              ? `${themeClasses.accent} border-current bg-current text-white scale-110`
              : `${themeClasses.notes} border-current bg-transparent`
          }`}
        >
          {note}
        </div>
      ))}
    </div>
  );

  return (
    <div 
      className={`border rounded-lg transition-all duration-300 ${sizeClasses.container} ${
        isPlaying ? themeClasses.playing : themeClasses.background
      } ${className}`}
    >
      {/* Header with chord name and playing indicator */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Music className={`w-5 h-5 ${themeClasses.accent}`} />
          <h3 className={`font-bold ${sizeClasses.chord} ${themeClasses.chord}`}>
            {chord}
          </h3>
        </div>
        
        {isPlaying && (
          <div className="flex items-center space-x-1">
            <Volume2 className={`w-4 h-4 ${themeClasses.accent} animate-pulse`} />
            <span className={`text-xs ${themeClasses.accent} font-medium`}>Playing</span>
          </div>
        )}
      </div>

      {/* Notes display */}
      {showNotes && (
        <div className="mb-4">
          <div className={`text-xs font-medium mb-2 ${themeClasses.info}`}>Notes:</div>
          {renderNoteCircles()}
        </div>
      )}

      {/* Audio visualizer */}
      {showVisualizer && (
        <div className="mb-4">
          {renderVisualizer()}
        </div>
      )}

      {/* Chord information */}
      {showChordInfo && (
        <div className="space-y-2">
          <div className="flex items-start space-x-2">
            <Info className={`w-4 h-4 mt-0.5 ${themeClasses.info}`} />
            <div>
              <div className={`font-medium ${themeClasses.notes}`}>
                {chordInfo.root} {chordInfo.quality}
              </div>
              <div className={`${sizeClasses.info} ${themeClasses.info}`}>
                {chordInfo.description}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Frequency information */}
      {showFrequencies && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          {renderFrequencies()}
        </div>
      )}
    </div>
  );
};

export default ChordVisualization;