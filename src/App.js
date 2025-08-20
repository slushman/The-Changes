import React, { useState, useRef, useEffect } from 'react';
import { Music } from 'lucide-react';
import SearchSection from './components/SearchSection';
import FilterPanel from './components/FilterPanel';
import { searchByProgression as searchChordProgression } from './utils/chordSearch';

export default function App() {
  const [searchProgression, setSearchProgression] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentChordIndex, setCurrentChordIndex] = useState(0);
  const [speed, setSpeed] = useState(120); // BPM
  const [audioContext, setAudioContext] = useState(null);
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
    // Initialize AudioContext (we'll create a basic audio context)
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      setAudioContext(ctx);
      return () => {
        if (ctx) ctx.close();
      };
    } catch (error) {
      console.warn('Audio context not available:', error);
    }
  }, []);

  const handleSearch = (searchOptions = {}) => {
    if (!searchProgression || searchProgression.length === 0) {
      setSearchResults([]);
      return;
    }

    try {
      // Use the search utilities we built
      const results = searchChordProgression(searchProgression, {
        ...searchOptions,
        genreFilter: filters.genres.length > 0 ? filters.genres[0] : null,
        decadeFilter: filters.decades.length > 0 ? filters.decades[0] : null,
        sectionFilter: filters.sections.length > 0 ? filters.sections[0] : null,
        complexityFilter: filters.complexities.length > 0 ? filters.complexities[0] : null,
        popularityFilter: filters.popularities.length > 0 ? filters.popularities[0] : null
      });
      
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    }
  };

  const playProgression = (chords) => {
    if (isPlaying) {
      stopPlayback();
      return;
    }

    if (!audioContext) {
      console.warn('Audio context not available');
      return;
    }

    setIsPlaying(true);
    setCurrentChordIndex(0);
    
    const chordDuration = (60 / speed) * 1000; // Convert BPM to milliseconds
    let index = 0;

    const playNext = () => {
      if (index >= chords.length) {
        setIsPlaying(false);
        setCurrentChordIndex(0);
        return;
      }

      setCurrentChordIndex(index);
      
      // For now, we'll just log the chord since we don't have audio synthesis yet
      console.log(`Playing chord: ${chords[index]}`);
      
      index++;
      intervalRef.current = setTimeout(playNext, chordDuration);
    };

    playNext();
  };

  const stopPlayback = () => {
    if (intervalRef.current) {
      clearTimeout(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPlaying(false);
    setCurrentChordIndex(0);
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

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Search Results ({searchResults.length} found)
              </h2>
              <div className="space-y-4">
                {searchResults.map((result, index) => (
                  <div key={`${result.songId}-${result.matchedSection}-${index}`} 
                       className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{result.title}</h3>
                        <p className="text-gray-600">{result.artist}</p>
                        <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                          <span>Section: {result.matchedSection}</span>
                          <span>Genre: {result.genre}</span>
                          <span>Decade: {result.decade}</span>
                          <span>Confidence: {Math.round(result.confidence * 100)}%</span>
                        </div>
                        <div className="mt-2">
                          <span className="text-sm font-medium text-gray-700">Progression: </span>
                          <span className="text-sm text-gray-600">
                            {result.sectionData.progression.join(' - ')}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => playProgression(result.sectionData.progression)}
                        className="ml-4 px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm"
                        title={isPlaying ? `Playing chord ${currentChordIndex + 1}` : 'Play progression'}
                      >
                        {isPlaying ? 'Stop' : 'Play'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Results Message */}
          {searchProgression.length > 0 && searchResults.length === 0 && (
            <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
              <p className="text-gray-500">
                No songs found matching the progression "{searchProgression.join(' - ')}"
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
}