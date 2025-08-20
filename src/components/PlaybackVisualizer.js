/**
 * PlaybackVisualizer component that combines progression and chord visualization
 * Provides a complete visual feedback experience for chord progression playback
 */

import React, { useState } from 'react';
import { Settings, Maximize2, Minimize2, Eye, EyeOff } from 'lucide-react';
import ProgressionVisualizer from './ProgressionVisualizer';
import ChordVisualization from './ChordVisualization';

const PlaybackVisualizer = ({
  progression = [],
  currentChordIndex = 0,
  isPlaying = false,
  onChordClick = () => {},
  className = ''
}) => {
  // Visualization settings
  const [settings, setSettings] = useState({
    layout: 'horizontal', // 'horizontal', 'vertical', 'circular'
    theme: 'default', // 'default', 'dark', 'minimal'
    size: 'medium', // 'small', 'medium', 'large'
    showWaveform: true,
    showProgress: true,
    showLabels: true,
    showChordInfo: true,
    showNotes: true,
    showFrequencies: false,
    showVisualizer: true
  });

  const [isExpanded, setIsExpanded] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  // Get current chord
  const currentChord = progression[currentChordIndex] || 'C';

  // Update setting
  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  // Toggle setting
  const toggleSetting = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Render settings panel
  const renderSettings = () => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-lg absolute top-full right-0 mt-2 w-80 z-10">
      <h3 className="font-semibold text-gray-900 mb-3">Visualization Settings</h3>
      
      <div className="space-y-4">
        {/* Layout */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Layout</label>
          <select
            value={settings.layout}
            onChange={(e) => updateSetting('layout', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="horizontal">Horizontal</option>
            <option value="vertical">Vertical</option>
            <option value="circular">Circular</option>
          </select>
        </div>

        {/* Theme */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
          <select
            value={settings.theme}
            onChange={(e) => updateSetting('theme', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="default">Default</option>
            <option value="dark">Dark</option>
            <option value="minimal">Minimal</option>
          </select>
        </div>

        {/* Size */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
          <select
            value={settings.size}
            onChange={(e) => updateSetting('size', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>

        {/* Toggle options */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Display Options</h4>
          
          <div className="grid grid-cols-2 gap-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.showWaveform}
                onChange={() => toggleSetting('showWaveform')}
                className="mr-2"
              />
              <span className="text-sm">Waveform</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.showProgress}
                onChange={() => toggleSetting('showProgress')}
                className="mr-2"
              />
              <span className="text-sm">Progress</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.showLabels}
                onChange={() => toggleSetting('showLabels')}
                className="mr-2"
              />
              <span className="text-sm">Labels</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.showChordInfo}
                onChange={() => toggleSetting('showChordInfo')}
                className="mr-2"
              />
              <span className="text-sm">Chord Info</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.showNotes}
                onChange={() => toggleSetting('showNotes')}
                className="mr-2"
              />
              <span className="text-sm">Notes</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.showFrequencies}
                onChange={() => toggleSetting('showFrequencies')}
                className="mr-2"
              />
              <span className="text-sm">Frequencies</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  // Compact view when collapsed
  const renderCompactView = () => (
    <div className="bg-white border border-gray-200 rounded-lg p-3 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="text-lg font-semibold text-gray-900">{currentChord}</div>
        <div className="text-sm text-gray-500">
          {currentChordIndex + 1} / {progression.length}
        </div>
        {isPlaying && (
          <div className="flex space-x-1">
            <div className="w-1 h-4 bg-blue-500 rounded animate-bounce"></div>
            <div className="w-1 h-4 bg-blue-500 rounded animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-1 h-4 bg-blue-500 rounded animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        )}
      </div>
      
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
        
        <button
          onClick={() => setIsExpanded(true)}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
          title="Expand visualization"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  // Full view when expanded
  const renderFullView = () => (
    <div className="space-y-4">
      {/* Header with controls */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Playback Visualization</h2>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded ${showSettings ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => setIsExpanded(false)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
              title="Minimize visualization"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Settings panel */}
        <div className="relative">
          {showSettings && renderSettings()}
        </div>
      </div>

      {/* Main visualization area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Progression visualization */}
        <div className="lg:col-span-2">
          <ProgressionVisualizer
            progression={progression}
            currentChordIndex={currentChordIndex}
            isPlaying={isPlaying}
            onChordClick={onChordClick}
            layout={settings.layout}
            theme={settings.theme}
            size={settings.size}
            showWaveform={settings.showWaveform}
            showProgress={settings.showProgress}
            showLabels={settings.showLabels}
          />
        </div>

        {/* Current chord visualization */}
        <div className="lg:col-span-1">
          <ChordVisualization
            chord={currentChord}
            isPlaying={isPlaying}
            theme={settings.theme}
            size={settings.size}
            showNotes={settings.showNotes}
            showFrequencies={settings.showFrequencies}
            showChordInfo={settings.showChordInfo}
            showVisualizer={settings.showVisualizer}
          />
        </div>
      </div>

      {/* Additional info panel */}
      {progression.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Progression:</span>
              <span className="ml-2 text-gray-600">{progression.join(' - ')}</span>
            </div>
            
            <div>
              <span className="font-medium text-gray-700">Current:</span>
              <span className="ml-2 text-gray-600">
                {currentChord} ({currentChordIndex + 1}/{progression.length})
              </span>
            </div>
            
            <div>
              <span className="font-medium text-gray-700">Status:</span>
              <span className={`ml-2 ${isPlaying ? 'text-blue-600' : 'text-gray-600'}`}>
                {isPlaying ? 'Playing' : 'Stopped'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className={`${className}`}>
      {isExpanded ? renderFullView() : renderCompactView()}
    </div>
  );
};

export default PlaybackVisualizer;