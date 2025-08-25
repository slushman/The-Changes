/**
 * SongPreview - Shows a preview of the generated song data
 * Displays formatted song information and validation status
 */

import React, { useState } from 'react';
import { Music, Calendar, Clock, Key, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { validateSong } from '../utils/songValidation';

const SongPreview = ({ song }) => {
  const [showRawData, setShowRawData] = useState(false);

  if (!song) {
    return (
      <div className="text-center py-8 text-gray-500">
        No song data to preview
      </div>
    );
  }

  const validation = validateSong(song);

  return (
    <div className="space-y-6">
      {/* Validation Status */}
      <div className={`flex items-center gap-2 p-4 rounded-md border ${
        validation.isValid 
          ? 'bg-green-50 border-green-200' 
          : 'bg-red-50 border-red-200'
      }`}>
        {validation.isValid ? (
          <>
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-800 font-medium">
              Song data is valid and ready to save
            </span>
          </>
        ) : (
          <>
            <AlertCircle className="w-5 h-5 text-red-600" />
            <div className="text-red-800">
              <p className="font-medium mb-1">Song data has validation errors:</p>
              <ul className="text-sm list-disc list-inside space-y-1">
                {validation.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>

      {/* Song Information Card */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Music className="w-6 h-6 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{song.title}</h3>
              <p className="text-sm text-gray-600">by {song.artist}</p>
            </div>
          </div>
        </div>

        {/* Basic Info */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500 uppercase">Year</p>
                <p className="font-medium">{song.year}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Music className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500 uppercase">Genre</p>
                <p className="font-medium capitalize">{song.genre}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500 uppercase">Key</p>
                <p className="font-medium">{song.key}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500 uppercase">Tempo</p>
                <p className="font-medium">{song.tempo} BPM</p>
              </div>
            </div>
          </div>

          {song.album && (
            <div className="pt-2 border-t border-gray-100">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Album:</span> {song.album}
              </p>
            </div>
          )}

          <div className="pt-2 border-t border-gray-100">
            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-600">
                <span className="font-medium">Decade:</span> {song.decade}
              </span>
              <span className="text-gray-600">
                <span className="font-medium">Popularity:</span> {song.popularity}
              </span>
              <span className="text-gray-600">
                <span className="font-medium">ID:</span> 
                <code className="ml-1 px-1 bg-gray-100 rounded text-xs">{song.songId}</code>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Song Sections */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h4 className="text-md font-semibold text-gray-900">Chord Progressions</h4>
        </div>
        
        <div className="p-6 space-y-4">
          {Object.entries(song.sections).map(([sectionName, section]) => (
            <div key={sectionName} className="border border-gray-100 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h5 className="font-medium text-gray-900 capitalize">{sectionName}</h5>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>{section.bars} bars</span>
                  <span>{section.repetitions}x</span>
                  <span className="capitalize">{section.complexity}</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-3">
                {section.progression.map((chord, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 text-blue-800 rounded font-mono text-sm"
                  >
                    {chord}
                  </span>
                ))}
              </div>

              {section.audioTimestamp && (
                <div className="text-xs text-gray-500">
                  <span className="font-medium">Timestamp:</span> {section.audioTimestamp.start} - {section.audioTimestamp.end}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Streaming Service IDs */}
      {(song.spotifyId || song.youtubeId || song.appleMusicId) && (
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h4 className="text-md font-semibold text-gray-900">Streaming Service IDs</h4>
          </div>
          
          <div className="p-6 space-y-3">
            {song.spotifyId && (
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">Spotify:</span>
                <code className="px-2 py-1 bg-gray-100 rounded text-sm">{song.spotifyId}</code>
              </div>
            )}
            {song.youtubeId && (
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">YouTube:</span>
                <code className="px-2 py-1 bg-gray-100 rounded text-sm">{song.youtubeId}</code>
              </div>
            )}
            {song.appleMusicId && (
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">Apple Music:</span>
                <code className="px-2 py-1 bg-gray-100 rounded text-sm">{song.appleMusicId}</code>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Raw Data Toggle */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg">
        <button
          onClick={() => setShowRawData(!showRawData)}
          className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-100 transition-colors"
        >
          <span className="font-medium text-gray-900">Raw JSON Data</span>
          {showRawData ? (
            <EyeOff className="w-4 h-4 text-gray-500" />
          ) : (
            <Eye className="w-4 h-4 text-gray-500" />
          )}
        </button>
        
        {showRawData && (
          <div className="border-t border-gray-200 p-6">
            <pre className="bg-gray-900 text-green-400 p-4 rounded-md overflow-auto text-xs">
              {JSON.stringify(song, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* File Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <Music className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">File Information:</p>
            <p>This song will be saved as: <code className="px-1 bg-blue-100 rounded">{song.songId}.js</code></p>
            <p className="mt-1">It will be added to the song database and available immediately for searching.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SongPreview;