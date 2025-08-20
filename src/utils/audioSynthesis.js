/**
 * Audio synthesis utilities for chord playback using Web Audio API
 * Generates synthesized chord sounds for the chord progression explorer
 */

// Note frequencies in Hz (equal temperament, A4 = 440Hz)
const NOTE_FREQUENCIES = {
  'C': 261.63,
  'C#': 277.18, 'Db': 277.18,
  'D': 293.66,
  'D#': 311.13, 'Eb': 311.13,
  'E': 329.63,
  'F': 349.23,
  'F#': 369.99, 'Gb': 369.99,
  'G': 392.00,
  'G#': 415.30, 'Ab': 415.30,
  'A': 440.00,
  'A#': 466.16, 'Bb': 466.16,
  'B': 493.88
};

// Common chord intervals (in semitones from root)
const CHORD_INTERVALS = {
  // Triads
  'major': [0, 4, 7],
  'minor': [0, 3, 7],
  'diminished': [0, 3, 6],
  'augmented': [0, 4, 8],
  
  // Seventh chords
  'major7': [0, 4, 7, 11],
  'minor7': [0, 3, 7, 10],
  'dominant7': [0, 4, 7, 10],
  'diminished7': [0, 3, 6, 9],
  'half-diminished7': [0, 3, 6, 10],
  
  // Extended chords
  'major9': [0, 4, 7, 11, 14],
  'minor9': [0, 3, 7, 10, 14],
  'dominant9': [0, 4, 7, 10, 14],
  
  // Suspended chords
  'sus2': [0, 2, 7],
  'sus4': [0, 5, 7],
  
  // Add chords
  'add9': [0, 4, 7, 14],
  'add11': [0, 4, 7, 17]
};

/**
 * Parse a chord symbol and extract root note and chord quality
 * @param {string} chordSymbol - Chord symbol like "Cm7", "F#maj7", "Bb"
 * @returns {Object} - {root: string, quality: string}
 */
export function parseChord(chordSymbol) {
  if (!chordSymbol || typeof chordSymbol !== 'string') {
    return { root: 'C', quality: 'major' };
  }

  const chord = chordSymbol.trim();
  if (!chord) {
    return { root: 'C', quality: 'major' };
  }
  
  let root, quality;

  // Extract root note (handles sharp/flat)
  if (chord.length >= 2 && (chord[1] === '#' || chord[1] === 'b')) {
    root = chord.substring(0, 2);
    quality = chord.substring(2);
  } else {
    root = chord[0];
    quality = chord.substring(1);
  }

  // Normalize quality
  if (!quality || quality === '') {
    quality = 'major';
  } else if (quality === 'm') {
    quality = 'minor';
  } else if (quality === 'maj7' || quality === 'M7') {
    quality = 'major7';
  } else if (quality === 'm7') {
    quality = 'minor7';
  } else if (quality === '7') {
    quality = 'dominant7';
  } else if (quality === 'dim' || quality === '°') {
    quality = 'diminished';
  } else if (quality === 'aug' || quality === '+') {
    quality = 'augmented';
  }

  return { root, quality };
}

/**
 * Get the frequencies for a chord
 * @param {string} chordSymbol - Chord symbol like "Cm7"
 * @param {number} octave - Base octave (default 4)
 * @returns {Array<number>} - Array of frequencies in Hz
 */
export function getChordFrequencies(chordSymbol, octave = 4) {
  const { root, quality } = parseChord(chordSymbol);
  const intervals = CHORD_INTERVALS[quality] || CHORD_INTERVALS.major;
  
  const rootFreq = NOTE_FREQUENCIES[root];
  if (!rootFreq) {
    console.warn(`Unknown root note: ${root}`);
    return [NOTE_FREQUENCIES.C];
  }

  // Calculate octave multiplier
  const octaveMultiplier = Math.pow(2, octave - 4);
  
  return intervals.map(interval => {
    const semitoneMultiplier = Math.pow(2, interval / 12);
    return rootFreq * octaveMultiplier * semitoneMultiplier;
  });
}

/**
 * Create an oscillator for a given frequency
 * @param {AudioContext} audioContext - Web Audio API context
 * @param {number} frequency - Frequency in Hz
 * @param {string} waveType - Oscillator wave type
 * @returns {OscillatorNode} - Configured oscillator
 */
export function createOscillator(audioContext, frequency, waveType = 'sawtooth') {
  const oscillator = audioContext.createOscillator();
  oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
  oscillator.type = waveType;
  return oscillator;
}

/**
 * Create an ADSR envelope
 * @param {AudioContext} audioContext - Web Audio API context
 * @param {number} attackTime - Attack time in seconds
 * @param {number} decayTime - Decay time in seconds
 * @param {number} sustainLevel - Sustain level (0-1)
 * @param {number} releaseTime - Release time in seconds
 * @returns {GainNode} - Configured gain node with envelope
 */
export function createEnvelope(audioContext, attackTime = 0.1, decayTime = 0.2, sustainLevel = 0.6, releaseTime = 0.5) {
  const gainNode = audioContext.createGain();
  gainNode.gain.setValueAtTime(0, audioContext.currentTime);
  return gainNode;
}

/**
 * Apply ADSR envelope to a gain node
 * @param {GainNode} gainNode - Gain node to apply envelope to
 * @param {AudioContext} audioContext - Web Audio API context
 * @param {number} startTime - When to start the envelope
 * @param {number} duration - Total duration of the note
 * @param {number} attackTime - Attack time in seconds
 * @param {number} decayTime - Decay time in seconds
 * @param {number} sustainLevel - Sustain level (0-1)
 * @param {number} releaseTime - Release time in seconds
 */
export function applyEnvelope(gainNode, audioContext, startTime, duration, 
                            attackTime = 0.1, decayTime = 0.2, sustainLevel = 0.6, releaseTime = 0.5) {
  const gain = gainNode.gain;
  const endTime = startTime + duration;
  const releaseStartTime = Math.max(startTime + attackTime + decayTime, endTime - releaseTime);
  
  // Attack
  gain.setValueAtTime(0, startTime);
  gain.linearRampToValueAtTime(1, startTime + attackTime);
  
  // Decay
  gain.linearRampToValueAtTime(sustainLevel, startTime + attackTime + decayTime);
  
  // Sustain (automatically held until release)
  
  // Release
  gain.setValueAtTime(sustainLevel, releaseStartTime);
  gain.linearRampToValueAtTime(0, endTime);
}

/**
 * Play a single chord with Web Audio API
 * @param {AudioContext} audioContext - Web Audio API context
 * @param {string} chordSymbol - Chord symbol to play
 * @param {number} duration - Duration in seconds
 * @param {number} startTime - When to start playing (audioContext.currentTime + offset)
 * @param {Object} options - Additional options
 * @returns {Array<AudioNode>} - Array of created audio nodes for cleanup
 */
export function playChord(audioContext, chordSymbol, duration = 1.0, startTime = null, options = {}) {
  const {
    octave = 4,
    waveType = 'sawtooth',
    volume = 0.3,
    attackTime = 0.1,
    decayTime = 0.2,
    sustainLevel = 0.6,
    releaseTime = 0.5
  } = options;

  if (!audioContext) {
    console.warn('No audio context provided');
    return [];
  }

  const actualStartTime = startTime !== null ? startTime : audioContext.currentTime;
  const frequencies = getChordFrequencies(chordSymbol, octave);
  const nodes = [];

  // Create master gain for volume control
  const masterGain = audioContext.createGain();
  masterGain.gain.setValueAtTime(volume, actualStartTime);
  masterGain.connect(audioContext.destination);

  frequencies.forEach(frequency => {
    // Create oscillator
    const oscillator = createOscillator(audioContext, frequency, waveType);
    
    // Create envelope
    const envelope = createEnvelope(audioContext);
    applyEnvelope(envelope, audioContext, actualStartTime, duration, attackTime, decayTime, sustainLevel, releaseTime);
    
    // Connect nodes
    oscillator.connect(envelope);
    envelope.connect(masterGain);
    
    // Schedule playback
    oscillator.start(actualStartTime);
    oscillator.stop(actualStartTime + duration);
    
    nodes.push(oscillator, envelope);
  });

  nodes.push(masterGain);
  return nodes;
}

/**
 * Play a chord progression
 * @param {AudioContext} audioContext - Web Audio API context
 * @param {Array<string>} progression - Array of chord symbols
 * @param {number} chordDuration - Duration of each chord in seconds
 * @param {Object} options - Additional options
 * @returns {Array<AudioNode>} - Array of all created audio nodes
 */
export function playProgression(audioContext, progression, chordDuration = 1.0, options = {}) {
  if (!audioContext || !progression || progression.length === 0) {
    return [];
  }

  const allNodes = [];
  let currentTime = audioContext.currentTime;

  progression.forEach((chord, index) => {
    const chordNodes = playChord(audioContext, chord, chordDuration, currentTime, options);
    allNodes.push(...chordNodes);
    currentTime += chordDuration;
  });

  return allNodes;
}

/**
 * Stop all audio nodes
 * @param {Array<AudioNode>} nodes - Array of audio nodes to stop
 */
export function stopAudioNodes(nodes) {
  if (!nodes || !Array.isArray(nodes)) return;
  
  nodes.forEach(node => {
    try {
      if (node && typeof node.stop === 'function') {
        node.stop();
      } else if (node && typeof node.disconnect === 'function') {
        node.disconnect();
      }
    } catch (error) {
      // Node might already be stopped/disconnected
      console.debug('Error stopping audio node:', error);
    }
  });
}

/**
 * Create and configure an audio context
 * @returns {Promise<AudioContext>} - Promise resolving to audio context
 */
export async function createAudioContext() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    const audioContext = new AudioContextClass();
    
    // Resume context if it's suspended (required for user interaction)
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }
    
    return audioContext;
  } catch (error) {
    console.error('Failed to create audio context:', error);
    throw error;
  }
}

/**
 * Get available chord qualities
 * @returns {Array<string>} - Array of available chord quality names
 */
export function getAvailableChordQualities() {
  return Object.keys(CHORD_INTERVALS);
}

/**
 * Get available note names
 * @returns {Array<string>} - Array of available note names
 */
export function getAvailableNotes() {
  return Object.keys(NOTE_FREQUENCIES);
}