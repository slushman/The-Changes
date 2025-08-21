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
  const [speed, setSpeed] = useState(120); // BPM
  const [audioContext, setAudioContext] = useState(null);
  const [audioNodes, setAudioNodes] = useState([]);
  const [showNashville, setShowNashville] = useState(false);
  const [currentKey, setCurrentKey] = useState('C');
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
    
    if (isPlaying) {
      console.log('🛑 Already playing, stopping playback');
      stopPlayback();
      return;
    }

    if (!audioContext) {
      console.warn('❌ Audio context not available');
      return;
    }
    
    console.log('🔊 Audio context state:', audioContext.state);

    // Resume audio context if suspended (required for user interaction)
    if (audioContext.state === 'suspended') {
      try {
        await audioContext.resume();
      } catch (error) {
        console.warn('Could not resume audio context:', error);
        return;
      }
    }

    setIsPlaying(true);
    setCurrentChordIndex(0);
    
    const chordDuration = 60 / speed; // Convert BPM to seconds
    let index = 0;

    const playNext = async () => {
      if (index >= chords.length) {
        setIsPlaying(false);
        setCurrentChordIndex(0);
        return;
      }

      setCurrentChordIndex(index);
      
      // Stop previous audio nodes
      if (audioNodes.length > 0) {
        stopAudioNodes(audioNodes);
        setAudioNodes([]);
      }
      
      try {
        // Play the current chord using our audio synthesis
        const nodes = playChord(audioContext, chords[index], chordDuration, null, {
          volume: 0.3,
          waveType: 'sawtooth',
          octave: 4
        });
        
        setAudioNodes(nodes);
        console.log(`Playing chord: ${chords[index]}`);
      } catch (error) {
        console.error('Error playing chord:', error);
      }
      
      index++;
      intervalRef.current = setTimeout(playNext, chordDuration * 1000);
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
          />

          {/* Chord Display with Nashville Numbers */}
          {searchProgression.length > 0 && (
            <div className="mt-6">
              <ChordDisplay
                chords={searchProgression}
                currentIndex={currentChordIndex}
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