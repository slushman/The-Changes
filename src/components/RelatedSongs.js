/**
 * RelatedSongs component - Displays songs with similar chord progressions
 * Shows related songs discovered based on chord progression similarity
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Music, TrendingUp, Calendar, Disc } from 'lucide-react';
import { getSimilarityExplanation } from '../utils/relatedSongs';

const RelatedSongs = ({ relatedSongs, className = '' }) => {
  const navigate = useNavigate();

  if (!relatedSongs || relatedSongs.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Related Songs</h3>
        </div>
        <div className="text-center py-8">
          <Music className="w-8 h-8 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No similar songs found</p>
          <p className="text-gray-400 text-xs mt-1">
            Try exploring songs in the same genre or decade
          </p>
        </div>
      </div>
    );
  }

  const getSimilarityColor = (similarity) => {
    if (similarity >= 0.7) return 'bg-green-100 text-green-800 border-green-200';
    if (similarity >= 0.5) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-blue-100 text-blue-800 border-blue-200';
  };

  const handleSongClick = (songId) => {
    navigate(`/song/${songId}`);
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Related Songs</h3>
          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
            {relatedSongs.length} found
          </span>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Songs with similar chord progressions and musical structure
        </p>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          {relatedSongs.map((match, index) => {
            const { song, similarity, bestMatch } = match;
            
            return (
              <div
                key={song.songId}
                onClick={() => handleSongClick(song.songId)}
                className="group p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="flex-1">
                        <h4 className="text-base font-semibold text-gray-900 group-hover:text-blue-700 transition-colors truncate">
                          {song.title}
                        </h4>
                        <p className="text-sm text-gray-600 truncate">{song.artist}</p>
                      </div>
                      
                      <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getSimilarityColor(similarity)}`}>
                        {Math.round(similarity * 100)}% match
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 text-xs text-gray-500 mb-2">
                      <div className="flex items-center space-x-1">
                        <Disc className="w-3 h-3" />
                        <span>{song.album || 'Single'}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{song.year}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Music className="w-3 h-3" />
                        <span>{song.key}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          {song.genre}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          {song.decade}
                        </span>
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        Similar: {bestMatch.targetSection} ↔ {bestMatch.matchSection}
                      </div>
                    </div>

                    <div className="mt-2 text-xs text-gray-600 italic">
                      {getSimilarityExplanation(match)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {relatedSongs.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 space-y-1">
              <p>
                <strong>Similarity calculation:</strong> Based on chord progression patterns, 
                sequence matching, and Nashville number analysis.
              </p>
              <p>
                Songs by the same artist or genre receive bonus similarity points.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RelatedSongs;