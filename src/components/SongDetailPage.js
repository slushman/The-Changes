/**
 * SongDetailPage component - Complete song view with all sections and chord charts
 * Displays detailed information about a specific song including all sections and progressions
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Music, ArrowLeft, Clock, Calendar, Disc, Users } from 'lucide-react';
import songDatabase from '../data/songDatabase';
import SectionChordVisualization from './SectionChordVisualization';
import RelatedSongs from './RelatedSongs';
import ProgressionExplorer from './ProgressionExplorer';
import { findRelatedSongs } from '../utils/relatedSongs';

const SongDetailPage = () => {
  const { songId } = useParams();
  const navigate = useNavigate();
  const [song, setSong] = useState(null);
  const [showNashville, setShowNashville] = useState(false);
  const [currentKey, setCurrentKey] = useState('C');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSection, setCurrentSection] = useState('');
  const [currentChordIndex, setCurrentChordIndex] = useState(0);
  const [relatedSongs, setRelatedSongs] = useState([]);
  const [showProgressionExplorer, setShowProgressionExplorer] = useState(false);
  const [explorerProgression, setExplorerProgression] = useState([]);

  // Find song in database and related songs
  useEffect(() => {
    const foundSong = songDatabase.find(s => s.songId === songId);
    if (foundSong) {
      setSong(foundSong);
      setCurrentKey(foundSong.key);
      
      // Find related songs based on similar progressions
      const related = findRelatedSongs(foundSong, songDatabase, {
        minSimilarity: 0.3,
        maxResults: 6,
        sameArtistBonus: 0.1,
        sameGenreBonus: 0.05
      });
      setRelatedSongs(related);
    }
  }, [songId]);

  // Get section order for display
  const getSectionOrder = (sections) => {
    const commonOrder = ['intro', 'verse', 'pre-chorus', 'chorus', 'bridge', 'verse-2', 'chorus-2', 'outro'];
    const sectionNames = Object.keys(sections);
    
    // Sort by common order, then alphabetically for any remaining sections
    return sectionNames.sort((a, b) => {
      const aIndex = commonOrder.indexOf(a);
      const bIndex = commonOrder.indexOf(b);
      
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      return a.localeCompare(b);
    });
  };

  // Handle section playback
  const handleSectionPlay = (sectionName, progression) => {
    if (isPlaying && currentSection === sectionName) {
      setIsPlaying(false);
      setCurrentSection('');
      setCurrentChordIndex(0);
    } else {
      setIsPlaying(true);
      setCurrentSection(sectionName);
      setCurrentChordIndex(0);
      // Here you would integrate with the actual audio playback system
    }
  };

  // Handle opening progression explorer with a section's progression
  const handleExploreProgression = (sectionName, progression) => {
    setExplorerProgression(progression);
    setShowProgressionExplorer(true);
  };

  // Handle progression explorer events
  const handleProgressionExplorerPlay = (playbackData) => {
    // Here you would integrate with the actual audio playback system
    console.log('Progression Explorer Play:', playbackData);
  };

  const handleProgressionSave = (progression) => {
    // Here you could save the progression to a user's collection
    console.log('Save progression:', progression);
    // Could show a toast notification or modal for save options
  };


  if (!song) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <Music className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">Song Not Found</h2>
          <p className="text-gray-500 mb-4">The requested song could not be found in the database.</p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Search</span>
          </button>
        </div>
      </div>
    );
  }

  const orderedSections = getSectionOrder(song.sections);

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Search</span>
        </button>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{song.title}</h1>
              <p className="text-xl text-gray-600 mb-4">{song.artist}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Disc className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700">{song.album || 'Single'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700">{song.year}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Music className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700">Key: {song.key}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700">{song.tempo} BPM</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 mt-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  song.popularity === 'mainstream' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-purple-100 text-purple-800'
                }`}>
                  {song.popularity === 'mainstream' ? 'Mainstream Hit' : 'Deep Cut'}
                </span>
                <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                  {song.genre}
                </span>
                <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                  {song.decade}
                </span>
              </div>
            </div>

            {/* Nashville Number Toggle */}
            <div className="ml-6">
              <button
                onClick={() => setShowNashville(!showNashville)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  showNashville 
                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {showNashville ? 'Numbers' : 'Chords'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Song Sections */}
      <div className="space-y-6">
        {orderedSections.map((sectionName) => {
          const section = song.sections[sectionName];
          const isCurrentSection = currentSection === sectionName && isPlaying;

          return (
            <SectionChordVisualization
              key={sectionName}
              sectionName={sectionName}
              progression={section.progression}
              bars={section.bars}
              repetitions={section.repetitions}
              complexity={section.complexity}
              audioTimestamp={section.audioTimestamp}
              keySignature={currentKey}
              showNashville={showNashville}
              isPlaying={isCurrentSection}
              currentChordIndex={isCurrentSection ? currentChordIndex : -1}
              onPlaySection={handleSectionPlay}
              onChordClick={(chordIndex) => {
                setCurrentChordIndex(chordIndex);
                // Could add skip-to functionality here
              }}
              onExploreProgression={(progression) => handleExploreProgression(sectionName, progression)}
              className="shadow-sm"
            />
          );
        })}
      </div>

      {/* Song Summary */}
      <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Song Structure</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Total Sections:</span>
            <span className="ml-2 font-medium">{orderedSections.length}</span>
          </div>
          <div>
            <span className="text-gray-500">Unique Chords:</span>
            <span className="ml-2 font-medium">
              {new Set(Object.values(song.sections).flatMap(s => s.progression)).size}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Complexity Range:</span>
            <span className="ml-2 font-medium">
              {[...new Set(Object.values(song.sections).map(s => s.complexity))].join(', ')}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Total Bars:</span>
            <span className="ml-2 font-medium">
              {Object.values(song.sections).reduce((sum, s) => sum + (s.bars * s.repetitions), 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Related Songs */}
      <RelatedSongs relatedSongs={relatedSongs} className="mt-8" />

      {/* Progression Explorer Toggle */}
      <div className="mt-8">
        <button
          onClick={() => setShowProgressionExplorer(!showProgressionExplorer)}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-lg font-medium transition-colors"
        >
          <Music className="w-4 h-4" />
          <span>{showProgressionExplorer ? 'Hide' : 'Show'} Progression Explorer</span>
        </button>
      </div>

      {/* Progression Explorer */}
      {showProgressionExplorer && (
        <ProgressionExplorer
          initialProgression={explorerProgression.length > 0 ? explorerProgression : Object.values(song.sections)[0]?.progression || ['C', 'Am', 'F', 'G']}
          keySignature={currentKey}
          onProgressionChange={(progression) => {
            // Could update a state to show modified progression
            console.log('Progression changed:', progression);
          }}
          onPlay={handleProgressionExplorerPlay}
          onSave={handleProgressionSave}
          className="mt-4"
        />
      )}
    </div>
  );
};

export default SongDetailPage;