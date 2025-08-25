/**
 * AddSongModal - Modal component for adding new songs to the database
 * Features form validation, chord progression builder, and GitHub API integration
 */

import React, { useState, useEffect } from 'react';
import { X, Music, Save, Eye, AlertCircle, CheckCircle, GitBranch } from 'lucide-react';
import SongSectionsEntry from './SongSectionsEntry';
import SongPreview from './SongPreview';
import { validateSong } from '../utils/songValidation';
import { saveSongToGitHub } from '../utils/githubAPI';
import { parseSectionsText, validateParsedSections } from '../utils/sectionParser';

const AddSongModal = ({ isOpen, onClose, onSongAdded }) => {
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    album: '',
    year: new Date().getFullYear(),
    genre: 'rock',
    key: 'C',
    tempo: 120,
    popularity: 'mainstream',
    spotifyId: '',
    youtubeId: ''
  });

  const [sectionsText, setSectionsText] = useState('');

  const [activeTab, setActiveTab] = useState('basic'); // 'basic', 'chords', 'preview'
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // 'success', 'error'
  const [generatedSong, setGeneratedSong] = useState(null);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setActiveTab('basic');
      setErrors({});
      setSaveStatus(null);
      setGeneratedSong(null);
      setSectionsText('');
    }
  }, [isOpen]);

  // Auto-generate song preview when form data or sections change
  useEffect(() => {
    if (formData.title && formData.artist && formData.year && sectionsText.trim()) {
      try {
        // Parse sections from text
        const parsedSections = parseSectionsText(sectionsText);
        
        // Generate songId from title and artist
        const songId = `${formData.title}-${formData.artist}-${formData.year}`
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');

        // Determine decade from year
        const decade = getDecadeFromYear(formData.year);

        // Create complete song object
        const songData = {
          songId,
          title: formData.title,
          artist: formData.artist,
          album: formData.album || undefined,
          year: formData.year,
          genre: formData.genre,
          decade,
          popularity: formData.popularity,
          key: formData.key,
          tempo: formData.tempo,
          sections: parsedSections,
          spotifyId: formData.spotifyId || undefined,
          youtubeId: formData.youtubeId || undefined
        };

        setGeneratedSong(songData);
      } catch (error) {
        console.error('Error generating song preview:', error);
        setGeneratedSong(null);
      }
    } else {
      setGeneratedSong(null);
    }
  }, [formData, sectionsText]);

  // Helper function to get decade from year
  const getDecadeFromYear = (year) => {
    if (year >= 2020) return '2020s';
    if (year >= 2010) return '2010s';
    if (year >= 2000) return '2000s';
    if (year >= 1990) return '90s';
    if (year >= 1980) return '80s';
    if (year >= 1970) return '70s';
    if (year >= 1960) return '60s';
    return '50s';
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear field-specific errors when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handleSectionsTextChange = (text) => {
    setSectionsText(text);
    
    // Clear section-specific errors when user starts typing
    if (errors.sections) {
      setErrors(prev => ({
        ...prev,
        sections: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.title.trim()) {
      newErrors.title = 'Song title is required';
    }
    if (!formData.artist.trim()) {
      newErrors.artist = 'Artist name is required';
    }
    if (!formData.year || formData.year < 1900 || formData.year > 2030) {
      newErrors.year = 'Please enter a valid year between 1900 and 2030';
    }
    if (formData.tempo < 60 || formData.tempo > 200) {
      newErrors.tempo = 'Tempo should be between 60 and 200 BPM';
    }

    // Validate sections text
    if (!sectionsText.trim()) {
      newErrors.sections = 'At least one section is required';
    } else {
      // Validate parsed sections
      const parsedSections = parseSectionsText(sectionsText);
      const sectionsValidation = validateParsedSections(parsedSections);
      if (!sectionsValidation.isValid) {
        newErrors.sections = sectionsValidation.errors.join(', ');
      }
    }

    // Validate generated song using existing validation
    if (generatedSong) {
      const songValidation = validateSong(generatedSong);
      if (!songValidation.isValid) {
        newErrors.song = songValidation.errors.join(', ');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (saveType = 'local') => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    setSaveStatus(null);

    try {
      if (saveType === 'github') {
        // Save to GitHub repository
        const success = await saveSongToGitHub(generatedSong);
        if (success) {
          setSaveStatus('success');
          setTimeout(() => {
            onSongAdded?.(generatedSong);
            onClose();
          }, 2000);
        } else {
          setSaveStatus('error');
        }
      } else {
        // Save locally (localStorage for now)
        const existingDrafts = JSON.parse(localStorage.getItem('songDrafts') || '[]');
        existingDrafts.push({
          ...generatedSong,
          isDraft: true,
          createdAt: new Date().toISOString()
        });
        localStorage.setItem('songDrafts', JSON.stringify(existingDrafts));
        
        setSaveStatus('success');
        setTimeout(() => {
          onSongAdded?.(generatedSong);
          onClose();
        }, 1500);
      }
    } catch (error) {
      console.error('Error saving song:', error);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const genres = ['rock', 'pop', 'alternative', 'grunge', 'punk', 'indie', 'hip-hop', 'country', 'jazz', 'blues', 'reggae', 'funk', 'soul'];
  const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const complexities = ['simple', 'intermediate', 'complex'];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Music className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Add New Song</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex">
            {[
              { id: 'basic', label: 'Basic Info', icon: Music },
              { id: 'sections', label: 'Song Sections', icon: null },
              { id: 'preview', label: 'Preview & Save', icon: Eye }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex-1 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  {Icon && <Icon className="w-4 h-4" />}
                  {label}
                </div>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Song Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.title ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter song title"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                  )}
                </div>

                {/* Artist */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Artist *
                  </label>
                  <input
                    type="text"
                    value={formData.artist}
                    onChange={(e) => handleInputChange('artist', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.artist ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter artist name"
                  />
                  {errors.artist && (
                    <p className="mt-1 text-sm text-red-600">{errors.artist}</p>
                  )}
                </div>

                {/* Album */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Album
                  </label>
                  <input
                    type="text"
                    value={formData.album}
                    onChange={(e) => handleInputChange('album', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter album name"
                  />
                </div>

                {/* Year */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Year *
                  </label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.year ? 'border-red-500' : 'border-gray-300'
                    }`}
                    min="1900"
                    max="2030"
                  />
                  {errors.year && (
                    <p className="mt-1 text-sm text-red-600">{errors.year}</p>
                  )}
                </div>

                {/* Genre */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Genre
                  </label>
                  <select
                    value={formData.genre}
                    onChange={(e) => handleInputChange('genre', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {genres.map(genre => (
                      <option key={genre} value={genre}>
                        {genre.charAt(0).toUpperCase() + genre.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Key */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Key
                  </label>
                  <select
                    value={formData.key}
                    onChange={(e) => handleInputChange('key', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {keys.map(key => (
                      <option key={key} value={key}>{key}</option>
                    ))}
                  </select>
                </div>

                {/* Tempo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tempo (BPM) *
                  </label>
                  <input
                    type="number"
                    value={formData.tempo}
                    onChange={(e) => handleInputChange('tempo', parseInt(e.target.value))}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.tempo ? 'border-red-500' : 'border-gray-300'
                    }`}
                    min="60"
                    max="200"
                  />
                  {errors.tempo && (
                    <p className="mt-1 text-sm text-red-600">{errors.tempo}</p>
                  )}
                </div>

                {/* Complexity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Complexity
                  </label>
                  <select
                    value={formData.complexity}
                    onChange={(e) => handleInputChange('complexity', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {complexities.map(complexity => (
                      <option key={complexity} value={complexity}>
                        {complexity.charAt(0).toUpperCase() + complexity.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Optional Streaming IDs */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Optional Streaming Service IDs</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Spotify ID
                    </label>
                    <input
                      type="text"
                      value={formData.spotifyId}
                      onChange={(e) => handleInputChange('spotifyId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 4u7EnebtmKWzUH433cf5Qv"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      YouTube ID
                    </label>
                    <input
                      type="text"
                      value={formData.youtubeId}
                      onChange={(e) => handleInputChange('youtubeId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., dQw4w9WgXcQ"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sections' && (
            <div className="space-y-6">
              <SongSectionsEntry
                sectionsText={sectionsText}
                onSectionsChange={handleSectionsTextChange}
                errors={errors}
                generatedSections={generatedSong?.sections}
              />
            </div>
          )}

          {activeTab === 'preview' && (
            <div className="space-y-6">
              {generatedSong ? (
                <SongPreview song={generatedSong} />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Please fill in the basic information to generate a preview
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2">
            {saveStatus === 'success' && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Song saved successfully!</span>
              </div>
            )}
            {saveStatus === 'error' && (
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">Error saving song. Please try again.</span>
              </div>
            )}
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              disabled={isSaving}
            >
              Cancel
            </button>
            
            <button
              onClick={() => handleSave('local')}
              disabled={isSaving || !generatedSong}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Draft'}
            </button>
            
            <button
              onClick={() => handleSave('github')}
              disabled={isSaving || !generatedSong}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <GitBranch className="w-4 h-4" />
              {isSaving ? 'Committing...' : 'Commit to Repo'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddSongModal;