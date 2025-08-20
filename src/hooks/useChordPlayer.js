/**
 * useChordPlayer hook for managing chord progression playback state
 * Provides reusable audio functionality across the application
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  createAudioContext, 
  playProgression, 
  stopAudioNodes 
} from '../utils/audioSynthesis';

const useChordPlayer = (options = {}) => {
  const {
    initialProgression = [],
    initialBpm = 120,
    initialVolume = 0.3,
    initialWaveType = 'sawtooth',
    autoPlay = false,
    repeat = false,
    onProgressionEnd = () => {},
    onChordChange = () => {},
    onError = () => {}
  } = options;

  // Audio context and nodes
  const [audioContext, setAudioContext] = useState(null);
  const [audioNodes, setAudioNodes] = useState([]);
  
  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentChordIndex, setCurrentChordIndex] = useState(0);
  const [progression, setProgression] = useState(initialProgression);
  
  // Audio settings
  const [bpm, setBpm] = useState(initialBpm);
  const [volume, setVolume] = useState(initialVolume);
  const [isMuted, setIsMuted] = useState(false);
  const [waveType, setWaveType] = useState(initialWaveType);
  const [isRepeating, setIsRepeating] = useState(repeat);
  
  // Error and loading state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAudioAvailable, setIsAudioAvailable] = useState(false);
  
  // Refs for cleanup and timing
  const playbackIntervalRef = useRef(null);
  const progressionRef = useRef(progression);
  const playbackPositionRef = useRef(0);
  
  // Update progression ref when state changes
  useEffect(() => {
    progressionRef.current = progression;
  }, [progression]);

  // Initialize audio context
  useEffect(() => {
    const initializeAudio = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const context = await createAudioContext();
        setAudioContext(context);
        setIsAudioAvailable(true);
      } catch (err) {
        const errorMessage = `Could not initialize audio: ${err.message}`;
        setError(errorMessage);
        setIsAudioAvailable(false);
        onError(err);
        console.warn(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeAudio();
    
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
    if (autoPlay && progression.length > 0 && audioContext && isAudioAvailable) {
      play();
    }
  }, [progression, autoPlay, audioContext, isAudioAvailable]);

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
    setIsPaused(false);
    playbackPositionRef.current = 0;
  }, [audioNodes]);

  // Play a single chord at the current position
  const playCurrentChord = useCallback(async () => {
    if (!audioContext || !progressionRef.current || progressionRef.current.length === 0) {
      return;
    }

    const chordIndex = playbackPositionRef.current;
    if (chordIndex >= progressionRef.current.length) {
      return;
    }

    try {
      // Resume audio context if suspended
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      const chord = progressionRef.current[chordIndex];
      const chordDuration = getChordDuration();
      
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
      setCurrentChordIndex(chordIndex);
      onChordChange(chordIndex, chord);
      
    } catch (err) {
      const errorMessage = `Error playing chord: ${err.message}`;
      setError(errorMessage);
      onError(err);
      console.error(errorMessage);
    }
  }, [audioContext, getChordDuration, volume, isMuted, waveType, audioNodes, onChordChange, onError]);

  // Advance to next chord
  const advanceToNextChord = useCallback(() => {
    const nextIndex = playbackPositionRef.current + 1;
    
    if (nextIndex >= progressionRef.current.length) {
      if (isRepeating) {
        playbackPositionRef.current = 0;
        return true; // Continue playing
      } else {
        // End of progression
        stopPlayback();
        setCurrentChordIndex(0);
        onProgressionEnd();
        return false; // Stop playing
      }
    } else {
      playbackPositionRef.current = nextIndex;
      return true; // Continue playing
    }
  }, [isRepeating, stopPlayback, onProgressionEnd]);

  // Main play function
  const play = useCallback(async () => {
    if (!audioContext || !progressionRef.current || progressionRef.current.length === 0) {
      return;
    }

    if (isPaused) {
      // Resume from current position
      setIsPaused(false);
    } else {
      // Start from beginning or current position
      if (!isPlaying) {
        playbackPositionRef.current = currentChordIndex;
      }
    }
    
    setIsPlaying(true);
    setError(null);
    
    // Play first chord immediately
    await playCurrentChord();
    
    const chordDuration = getChordDuration() * 1000; // Convert to milliseconds
    
    // Set up interval for subsequent chords
    playbackIntervalRef.current = setInterval(async () => {
      const shouldContinue = advanceToNextChord();
      
      if (shouldContinue) {
        await playCurrentChord();
      }
    }, chordDuration);
    
  }, [audioContext, isPaused, isPlaying, currentChordIndex, playCurrentChord, getChordDuration, advanceToNextChord]);

  // Pause playback
  const pause = useCallback(() => {
    if (playbackIntervalRef.current) {
      clearInterval(playbackIntervalRef.current);
      playbackIntervalRef.current = null;
    }
    setIsPlaying(false);
    setIsPaused(true);
  }, []);

  // Stop playback and reset position
  const stop = useCallback(() => {
    stopPlayback();
    setCurrentChordIndex(0);
    playbackPositionRef.current = 0;
  }, [stopPlayback]);

  // Toggle play/pause
  const togglePlayback = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, pause, play]);

  // Skip to specific position
  const skipTo = useCallback((index) => {
    if (index < 0 || index >= progression.length) {
      return;
    }
    
    playbackPositionRef.current = index;
    setCurrentChordIndex(index);
    
    if (isPlaying) {
      // Restart playback from new position
      stopPlayback();
      setIsPlaying(false);
      setTimeout(() => play(), 10); // Small delay to ensure state is updated
    }
  }, [progression.length, isPlaying, stopPlayback, play]);

  // Skip to next chord
  const skipForward = useCallback(() => {
    const nextIndex = (currentChordIndex + 1) % Math.max(progression.length, 1);
    skipTo(nextIndex);
  }, [currentChordIndex, progression.length, skipTo]);

  // Skip to previous chord
  const skipBack = useCallback(() => {
    const prevIndex = currentChordIndex === 0 ? progression.length - 1 : currentChordIndex - 1;
    skipTo(prevIndex);
  }, [currentChordIndex, progression.length, skipTo]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    setIsMuted(!isMuted);
  }, [isMuted]);

  // Update progression
  const updateProgression = useCallback((newProgression) => {
    setProgression(newProgression);
    
    // Adjust current position if needed
    if (currentChordIndex >= newProgression.length && newProgression.length > 0) {
      skipTo(newProgression.length - 1);
    } else if (newProgression.length === 0) {
      stop();
    }
  }, [currentChordIndex, skipTo, stop]);

  // Update BPM and restart playback if playing
  const updateBpm = useCallback((newBpm) => {
    setBpm(newBpm);
    
    if (isPlaying) {
      // Restart with new timing
      const wasPlaying = isPlaying;
      stopPlayback();
      if (wasPlaying) {
        setTimeout(() => play(), 10);
      }
    }
  }, [isPlaying, stopPlayback, play]);

  // Get current playback state
  const getPlaybackState = useCallback(() => {
    return {
      isPlaying,
      isPaused,
      currentChordIndex,
      currentChord: progression[currentChordIndex] || null,
      progressPercent: progression.length > 0 ? (currentChordIndex / progression.length) * 100 : 0,
      timeRemaining: progression.length > 0 ? (progression.length - currentChordIndex) * getChordDuration() : 0
    };
  }, [isPlaying, isPaused, currentChordIndex, progression, getChordDuration]);

  // Return the hook interface
  return {
    // Audio state
    isAudioAvailable,
    isLoading,
    error,
    
    // Playback state
    isPlaying,
    isPaused,
    currentChordIndex,
    progression,
    
    // Audio settings
    bpm,
    volume,
    isMuted,
    waveType,
    isRepeating,
    
    // Playback controls
    play,
    pause,
    stop,
    togglePlayback,
    skipTo,
    skipForward,
    skipBack,
    
    // Settings controls
    setBpm: updateBpm,
    setVolume,
    toggleMute,
    setWaveType,
    setIsRepeating,
    
    // Progression management
    updateProgression,
    setProgression: updateProgression,
    
    // Utility functions
    getPlaybackState,
    getChordDuration,
    
    // Raw audio context (for advanced usage)
    audioContext
  };
};

export default useChordPlayer;