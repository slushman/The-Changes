/**
 * ChordPlayer component for playing chord progressions with audio synthesis
 * Provides play/pause controls, speed adjustment, and visual feedback
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Square, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { 
  createAudioContext, 
  playProgression, 
  stopAudioNodes,
  getChordFrequencies 
} from '../utils/audioSynthesis';

const ChordPlayer = ({ 
  progression = [], 
  onProgressionChange = () => {},
  className = '',
  showEditControls = true,
  autoPlay = false 
}) => {
  // Audio state
  const [audioContext, setAudioContext] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentChordIndex, setCurrentChordIndex] = useState(0);
  const [audioNodes, setAudioNodes] = useState([]);
  const [volume, setVolume] = useState(0.3);
  const [isMuted, setIsMuted] = useState(false);
  
  // Playback settings
  const [bpm, setBpm] = useState(120);
  const [repeat, setRepeat] = useState(false);
  const [waveType, setWaveType] = useState('sawtooth');
  
  // Refs for cleanup and timing
  const playbackIntervalRef = useRef(null);
  const progressionRef = useRef(progression);
  
  // Update progression ref when prop changes
  useEffect(() => {
    progressionRef.current = progression;
  }, [progression]);

  // Initialize audio context
  useEffect(() => {
    const initAudio = async () => {
      try {
        const context = await createAudioContext();
        setAudioContext(context);
      } catch (error) {
        console.warn('Could not initialize audio context:', error);
      }
    };
    
    initAudio();
    
    // Cleanup on unmount
    return () => {
      if (audioContext) {
        audioContext.close();
      }
      stopPlayback();
    };
  }, []);

  // Auto play when progression changes (if enabled)
  useEffect(() => {
    if (autoPlay && progression.length > 0 && audioContext) {
      playProgression();
    }
  }, [progression, autoPlay, audioContext]);

  // Calculate chord duration in seconds from BPM
  const getChordDuration = useCallback(() => {
    return (60 / bpm);
  }, [bpm]);

  // Stop all audio and clear intervals
  const stopPlayback = useCallback(() => {
    if (playbackIntervalRef.current) {
      clearInterval(playbackIntervalRef.current);
      playbackIntervalRef.current = null;
    }
    
    if (audioNodes.length > 0) {
      stopAudioNodes(audioNodes);
      setAudioNodes([]);
    }
    
    setIsPlaying(false);
    setCurrentChordIndex(0);
  }, [audioNodes]);

  // Play the chord progression
  const playProgression = useCallback(async () => {
    if (!audioContext || !progressionRef.current || progressionRef.current.length === 0) {
      return;
    }

    // Stop any current playback
    if (playbackIntervalRef.current) {
      clearInterval(playbackIntervalRef.current);
      playbackIntervalRef.current = null;
    }
    
    if (audioNodes.length > 0) {
      stopAudioNodes(audioNodes);
      setAudioNodes([]);
    }
    
    // Resume audio context if suspended
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }
    
    setIsPlaying(true);
    setCurrentChordIndex(0);
    
    const chordDuration = getChordDuration();
    let chordIndex = 0;
    
    // Play first chord immediately
    const playChord = () => {
      if (chordIndex >= progressionRef.current.length) {
        if (repeat) {
          chordIndex = 0;
          setCurrentChordIndex(0);
        } else {
          stopPlayback();
          return;
        }
      }
      
      const chord = progressionRef.current[chordIndex];
      setCurrentChordIndex(chordIndex);
      
      try {
        // Stop previous chord nodes
        if (audioNodes.length > 0) {
          stopAudioNodes(audioNodes);
        }
        
        // Play new chord with current settings
        const nodes = playProgression(audioContext, [chord], chordDuration, {
          volume: isMuted ? 0 : volume,
          waveType: waveType,
          octave: 4
        });
        
        setAudioNodes(nodes);
      } catch (error) {
        console.error('Error playing chord:', error);
      }
      
      chordIndex++;
    };
    
    // Play first chord
    playChord();
    
    // Set up interval for subsequent chords
    playbackIntervalRef.current = setInterval(playChord, chordDuration * 1000);
  }, [audioContext, getChordDuration, repeat, volume, isMuted, waveType, audioNodes]);

  // Pause playback
  const pausePlayback = useCallback(() => {
    if (playbackIntervalRef.current) {
      clearInterval(playbackIntervalRef.current);
      playbackIntervalRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  // Toggle play/pause
  const togglePlayback = useCallback(() => {
    if (isPlaying) {
      pausePlayback();
    } else {
      playProgression();
    }
  }, [isPlaying, pausePlayback, playProgression]);

  // Skip to next chord
  const skipForward = useCallback(() => {
    if (progression.length === 0) return;
    
    const nextIndex = (currentChordIndex + 1) % progression.length;
    setCurrentChordIndex(nextIndex);
    
    if (isPlaying) {
      // Restart playback from new position
      playProgression();
    }
  }, [currentChordIndex, progression.length, isPlaying, playProgression]);

  // Skip to previous chord
  const skipBack = useCallback(() => {
    if (progression.length === 0) return;
    
    const prevIndex = currentChordIndex === 0 ? progression.length - 1 : currentChordIndex - 1;
    setCurrentChordIndex(prevIndex);
    
    if (isPlaying) {
      // Restart playback from new position
      playProgression();
    }
  }, [currentChordIndex, progression.length, isPlaying, playProgression]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    setIsMuted(!isMuted);
  }, [isMuted]);

  // Handle chord editing
  const handleChordEdit = useCallback((index, newChord) => {
    const newProgression = [...progression];
    newProgression[index] = newChord;
    onProgressionChange(newProgression);
  }, [progression, onProgressionChange]);

  // Add new chord
  const addChord = useCallback(() => {
    const newProgression = [...progression, 'C'];
    onProgressionChange(newProgression);
  }, [progression, onProgressionChange]);

  // Remove chord
  const removeChord = useCallback((index) => {
    const newProgression = progression.filter((_, i) => i !== index);
    onProgressionChange(newProgression);
    
    // Adjust current index if needed
    if (currentChordIndex >= newProgression.length && newProgression.length > 0) {
      setCurrentChordIndex(newProgression.length - 1);
    }
  }, [progression, onProgressionChange, currentChordIndex]);

  // Common chord suggestions
  const commonChords = ['C', 'Am', 'F', 'G', 'Dm', 'Em', 'Cmaj7', 'Am7', 'Fmaj7', 'G7'];

  if (!audioContext) {
    return (
      <div className={`bg-gray-100 rounded-lg p-4 text-center ${className}`}>
        <p className="text-gray-600">Audio not available</p>
        <p className="text-sm text-gray-500">Web Audio API not supported or permission denied</p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      {/* Progression Display */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Chord Progression</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {progression.length === 0 ? (
            <div className="text-gray-500 italic">No chords in progression</div>
          ) : (
            progression.map((chord, index) => (
              <div
                key={index}
                className={`relative group ${
                  index === currentChordIndex && isPlaying
                    ? 'bg-blue-100 border-blue-300'
                    : 'bg-gray-50 border-gray-200'
                } border rounded-lg p-3 min-w-[60px] text-center transition-colors`}
              >
                {showEditControls ? (
                  <input
                    type="text"
                    value={chord}
                    onChange={(e) => handleChordEdit(index, e.target.value)}
                    className="w-full text-center bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-blue-500 rounded"
                    placeholder="Chord"
                  />
                ) : (
                  <span className="font-medium">{chord}</span>
                )}
                
                {showEditControls && (
                  <button
                    onClick={() => removeChord(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove chord"
                  >
                    ×
                  </button>
                )}
                
                {index === currentChordIndex && isPlaying && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                )}
              </div>
            ))
          )}
          
          {showEditControls && (
            <button
              onClick={addChord}
              className="bg-gray-200 hover:bg-gray-300 border-2 border-dashed border-gray-400 rounded-lg p-3 min-w-[60px] text-center text-gray-600 transition-colors"
              title="Add chord"
            >
              +
            </button>
          )}
        </div>
        
        {/* Common Chords Quick Add */}
        {showEditControls && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">Quick add:</p>
            <div className="flex flex-wrap gap-1">
              {commonChords.map((chord) => (
                <button
                  key={chord}
                  onClick={() => onProgressionChange([...progression, chord])}
                  className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors"
                >
                  {chord}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Transport Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <button
            onClick={skipBack}
            disabled={progression.length === 0}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Previous chord"
          >
            <SkipBack className="w-4 h-4" />
          </button>
          
          <button
            onClick={togglePlayback}
            disabled={progression.length === 0}
            className="p-3 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>
          
          <button
            onClick={skipForward}
            disabled={progression.length === 0}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Next chord"
          >
            <SkipForward className="w-4 h-4" />
          </button>
          
          <button
            onClick={stopPlayback}
            disabled={!isPlaying}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Stop"
          >
            <Square className="w-4 h-4" />
          </button>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleMute}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={isMuted ? 0 : volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            disabled={isMuted}
            className="w-20"
            title="Volume"
          />
        </div>
      </div>

      {/* Playback Settings */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
        {/* BPM Control */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tempo: {bpm} BPM
          </label>
          <input
            type="range"
            min="60"
            max="200"
            value={bpm}
            onChange={(e) => setBpm(parseInt(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Wave Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Wave Type
          </label>
          <select
            value={waveType}
            onChange={(e) => setWaveType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="sawtooth">Sawtooth</option>
            <option value="square">Square</option>
            <option value="triangle">Triangle</option>
            <option value="sine">Sine</option>
          </select>
        </div>

        {/* Repeat */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="repeat"
            checked={repeat}
            onChange={(e) => setRepeat(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="repeat" className="text-sm font-medium text-gray-700">
            Repeat
          </label>
        </div>
      </div>
    </div>
  );
};

export default ChordPlayer;