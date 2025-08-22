/**
 * HomePage component - Main search and exploration interface
 * Contains the original App.js functionality for searching chord progressions
 */

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Music } from 'lucide-react';
import SearchSection from './SearchSection';
import SearchResults from './SearchResults';
import FilterPanel from './FilterPanel';
import ChordDisplay from './ChordDisplay';
import { searchByProgression as searchChordProgression } from '../utils/chordSearch';
import { createAudioContext, playChord, stopAudioNodes } from '../utils/audioSynthesis';
import { progressionToNashville } from '../utils/nashvilleNumbers';

const HomePage = () => {
  const navigate = useNavigate();
  const [searchProgression, setSearchProgression] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentChordIndex, setCurrentChordIndex] = useState(0);
  const [chordProgress, setChordProgress] = useState(0); // Progress within current chord (0-1)
  const [overallProgress, setOverallProgress] = useState(0); // Overall progression progress (0-1)
  const [speed, setSpeed] = useState(120); // BPM
  const [audioContext, setAudioContext] = useState(null);
  const [audioNodes, setAudioNodes] = useState([]);
  const [showNashville, setShowNashville] = useState(false);
  const [currentKey, setCurrentKey] = useState('C');
  const [voicing, setVoicing] = useState('root');
  const [filters, setFilters] = useState({
    genres: [],
    decades: [],
    sections: [],
    complexities: [],
    popularities: [],
    progressionLength: null,
    artists: []
  });
  const intervalRef = useRef(null);

  useEffect(() => {
    // Initialize AudioContext using our utility
    const initAudio = async () => {
      try {
        const ctx = await createAudioContext();
        setAudioContext(ctx);
        console.log('Audio context initialized successfully:', ctx.state);
      } catch (error) {
        console.warn('Audio context not available:', error);
      }
    };
    
    initAudio();
    
    return () => {
      // Cleanup will be handled by the audioContext dependency
    };
  }, []); // Only run once on mount

  // Separate effect for cleanup
  useEffect(() => {
    return () => {
      if (audioContext) {
        audioContext.close();
      }
    };
  }, [audioContext]);

  // Automatically search when progression changes
  useEffect(() => {
    console.log('🔄 Search progression changed:', searchProgression);
    if (searchProgression && searchProgression.length > 0) {
      // Perform search directly here instead of calling handleSearch to avoid dependency issues
      try {
        const results = searchChordProgression(searchProgression, {
          genreFilter: filters.genres.length > 0 ? filters.genres[0] : null,
          decadeFilter: filters.decades.length > 0 ? filters.decades[0] : null,
          sectionFilter: null,
          complexityFilter: filters.complexities.length > 0 ? filters.complexities[0] : null,
          popularityFilter: filters.popularities.length > 0 ? filters.popularities[0] : null
        });
        console.log('🔍 Auto-search results:', results.length);
        setSearchResults(results);
      } catch (error) {
        console.error('Auto-search error:', error);
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
    }
  }, [searchProgression, filters]);

  // Handle speed changes during playback
  useEffect(() => {
    if (isPlaying && searchProgression.length > 0) {
      console.log('🎵 Speed changed during playback, restarting with new tempo:', speed);
      // Store current progress
      const currentProgression = searchProgression;
      const currentIndex = currentChordIndex;
      
      // Stop current playback
      stopPlayback();
      
      // Restart with new speed after a short delay
      setTimeout(() => {
        if (currentIndex > 0) {
          // If we were partway through, start from current chord
          setCurrentChordIndex(currentIndex);
        }
        playProgression(currentProgression);
      }, 100);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speed]);

  const handleSearch = (searchOptions = {}) => {
    console.log('🔍 Search triggered with:', { searchProgression, searchOptions, filters });
    
    if (!searchProgression || searchProgression.length === 0) {
      console.log('❌ No search progression provided');
      setSearchResults([]);
      return;
    }

    try {
      // Use the search utilities we built
      // Enhanced filtering to handle multiple section filters
      let allResults = [];
      
      if (filters.sections.length > 0) {
        // Search each selected section separately for better section-specific results
        filters.sections.forEach(section => {
          const sectionResults = searchChordProgression(searchProgression, {
            ...searchOptions,
            genreFilter: filters.genres.length > 0 ? filters.genres[0] : null,
            decadeFilter: filters.decades.length > 0 ? filters.decades[0] : null,
            sectionFilter: section,
            complexityFilter: filters.complexities.length > 0 ? filters.complexities[0] : null,
            popularityFilter: filters.popularities.length > 0 ? filters.popularities[0] : null
          });
          allResults.push(...sectionResults);
        });
        
        // Remove duplicates and sort by confidence
        const uniqueResults = new Map();
        allResults.forEach(result => {
          const key = `${result.songId}-${result.matchedSection}`;
          if (!uniqueResults.has(key) || result.confidence > uniqueResults.get(key).confidence) {
            uniqueResults.set(key, result);
          }
        });
        allResults = Array.from(uniqueResults.values()).sort((a, b) => b.confidence - a.confidence);
      } else {
        // No section filter, search all sections
        allResults = searchChordProgression(searchProgression, {
          ...searchOptions,
          genreFilter: filters.genres.length > 0 ? filters.genres[0] : null,
          decadeFilter: filters.decades.length > 0 ? filters.decades[0] : null,
          sectionFilter: null,
          complexityFilter: filters.complexities.length > 0 ? filters.complexities[0] : null,
          popularityFilter: filters.popularities.length > 0 ? filters.popularities[0] : null
        });
      }
      
      console.log('✅ Search completed. Results found:', allResults.length);
      setSearchResults(allResults);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    }
  };

  const playProgression = async (chords) => {
    console.log('🎵 Play progression called with chords:', chords);
    console.log('🎵 Current audioContext:', audioContext);
    console.log('🎵 isPlaying state:', isPlaying);
    
    if (!chords || chords.length === 0) {
      console.warn('❌ No chords provided to play');
      return;
    }
    
    if (isPlaying) {
      console.log('🛑 Already playing, stopping playback');
      stopPlayback();
      return;
    }

    // Try to initialize audio context if not available (user interaction required)
    let workingAudioContext = audioContext;
    if (!workingAudioContext) {
      console.log('🔧 Attempting to initialize audio context on user interaction...');
      try {
        workingAudioContext = await createAudioContext();
        setAudioContext(workingAudioContext);
        console.log('✅ Audio context initialized on user interaction:', workingAudioContext.state);
      } catch (error) {
        console.error('❌ Failed to initialize audio context:', error);
        alert('Audio playback is not available. Please check your browser settings and ensure audio is not blocked.');
        return;
      }
    }
    
    console.log('🔊 Audio context state:', workingAudioContext.state);

    // Resume audio context if suspended (required for user interaction)
    if (workingAudioContext.state === 'suspended') {
      try {
        await workingAudioContext.resume();
        console.log('🔄 Audio context resumed');
      } catch (error) {
        console.warn('Could not resume audio context:', error);
        return;
      }
    }

    setIsPlaying(true);
    setCurrentChordIndex(0);
    
    const chordDuration = 60 / speed; // Convert BPM to seconds
    let index = 0;
    let startTime = Date.now();

    const playNext = async () => {
      if (index >= chords.length) {
        setIsPlaying(false);
        setCurrentChordIndex(0);
        setOverallProgress(1); // Mark progression as complete
        setTimeout(() => setOverallProgress(0), 1000); // Reset after a moment
        return;
      }

      // Calculate precise timing for synchronized highlighting
      const currentTime = Date.now();
      const elapsedTime = (currentTime - startTime) / 1000;
      const expectedTime = index * chordDuration;
      const timeDrift = elapsedTime - expectedTime;
      
      // Update chord index with smooth transition
      setCurrentChordIndex(index);
      setChordProgress(0); // Reset progress for new chord
      
      // Update overall progression progress
      const overallProgressValue = (index + chordProgress) / chords.length;
      setOverallProgress(overallProgressValue);
      
      // Start progress animation for current chord
      const progressInterval = setInterval(() => {
        const progressElapsed = (Date.now() - currentTime) / 1000;
        const progress = Math.min(progressElapsed / chordDuration, 1);
        setChordProgress(progress);
        
        // Update overall progress with current chord progress
        const overallProgressValue = (index + progress) / chords.length;
        setOverallProgress(overallProgressValue);
        
        if (progress >= 1) {
          clearInterval(progressInterval);
        }
      }, 50); // Update every 50ms for smooth animation
      
      // Stop previous audio nodes
      if (audioNodes.length > 0) {
        stopAudioNodes(audioNodes);
        setAudioNodes([]);
      }
      
      try {
        // Play the current chord using our audio synthesis
        const nodes = playChord(workingAudioContext, chords[index], chordDuration, null, {
          volume: 0.2,
          waveType: 'sine',
          octave: 4,
          voicing: voicing
        });
        
        setAudioNodes(nodes);
        console.log(`Playing chord: ${chords[index]}`);
      } catch (error) {
        console.error('Error playing chord:', error);
      }
      
      index++;
      
      // Schedule next chord with drift compensation for better synchronization
      const nextDelay = Math.max(0, (chordDuration * 1000) - (timeDrift * 1000));
      intervalRef.current = setTimeout(playNext, nextDelay);
    };

    playNext();
  };

  const stopPlayback = () => {
    if (intervalRef.current) {
      clearTimeout(intervalRef.current);
      intervalRef.current = null;
    }
    
    // Stop all audio nodes
    if (audioNodes.length > 0) {
      stopAudioNodes(audioNodes);
      setAudioNodes([]);
    }
    
    setIsPlaying(false);
    setCurrentChordIndex(0);
    setChordProgress(0);
    setOverallProgress(0);
  };

  // Handle song detail navigation
  const handleSongClick = (songId) => {
    navigate(`/song/${songId}`);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
          <Music className="text-blue-600" />
          Chord Progression Explorer
        </h1>
        <p className="text-gray-600">Discover harmonic connections between your favorite songs</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Search Section */}
        <div className="lg:col-span-3">
          <SearchSection
            searchProgression={searchProgression}
            setSearchProgression={setSearchProgression}
            onSearch={handleSearch}
            speed={speed}
            setSpeed={setSpeed}
            isPlaying={isPlaying}
            onPlayProgression={playProgression}
            overallProgress={overallProgress}
            voicing={voicing}
            setVoicing={setVoicing}
          />

          {/* Chord Display with Nashville Numbers */}
          {searchProgression.length > 0 && (
            <div className="mt-6">
              <ChordDisplay
                chords={searchProgression}
                currentIndex={currentChordIndex}
                chordProgress={chordProgress}
                overallProgress={overallProgress}
                isPlaying={isPlaying}
                onChordClick={(index) => {
                  setCurrentChordIndex(index);
                  // Could add skip-to functionality here
                }}
                showNashville={showNashville}
                onToggleNashville={() => setShowNashville(!showNashville)}
                keySignature={currentKey}
                onKeyChange={setCurrentKey}
                autoDetectKey={true}
              />
            </div>
          )}

          {/* Search Results */}
          {searchResults.length > 0 && (
            <SearchResults
              results={searchResults}
              searchProgression={searchProgression}
              onSongClick={handleSongClick}
              onPlayProgression={playProgression}
              isPlaying={isPlaying}
              currentChordIndex={currentChordIndex}
              showNashville={showNashville}
              currentKey={currentKey}
              filters={filters}
              className="mt-6"
            />
          )}

          {/* No Results Message */}
          {searchProgression.length > 0 && searchResults.length === 0 && (
            <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
              <p className="text-gray-500">
                No songs found matching the progression "{showNashville 
                  ? progressionToNashville(searchProgression, currentKey).join(' - ')
                  : searchProgression.join(' - ')}"
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Try adjusting your search or filters, or use partial matching
              </p>
            </div>
          )}
        </div>

        {/* Filter Panel */}
        <div className="lg:col-span-1">
          <FilterPanel
            filters={filters}
            onFiltersChange={setFilters}
            collapsible={false}
          />
        </div>
      </div>
    </div>
  );
};

export default HomePage;