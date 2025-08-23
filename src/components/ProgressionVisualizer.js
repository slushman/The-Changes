/**
 * ProgressionVisualizer component for displaying chord progressions with visual feedback
 * Shows chord progression with highlighting, animations, and progress indicators
 */

import React, { useEffect, useState } from 'react';
import { Play, Volume2 } from 'lucide-react';

const ProgressionVisualizer = ({
  progression = [],
  currentChordIndex = 0,
  isPlaying = false,
  onChordClick = () => {},
  showWaveform = false,
  showProgress = true,
  showLabels = true,
  layout = 'horizontal', // 'horizontal', 'vertical', 'circular'
  size = 'medium', // 'small', 'medium', 'large'
  theme = 'default', // 'default', 'dark', 'minimal'
  animationDuration = 300,
  className = ''
}) => {
  const [animatingIndex, setAnimatingIndex] = useState(-1);
  const [progressPercent, setProgressPercent] = useState(0);

  // Handle chord change animations
  useEffect(() => {
    if (isPlaying && currentChordIndex >= 0) {
      setAnimatingIndex(currentChordIndex);
      
      // Reset animation after duration
      const timer = setTimeout(() => {
        setAnimatingIndex(-1);
      }, animationDuration);
      
      return () => clearTimeout(timer);
    }
  }, [currentChordIndex, isPlaying, animationDuration]);

  // Update progress percentage
  useEffect(() => {
    if (progression.length > 0) {
      const percent = ((currentChordIndex + 1) / progression.length) * 100;
      setProgressPercent(Math.min(percent, 100));
    } else {
      setProgressPercent(0);
    }
  }, [currentChordIndex, progression.length]);

  // Get size classes
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return {
          chord: 'w-12 h-12 text-sm',
          container: 'gap-2',
          progress: 'h-1'
        };
      case 'large':
        return {
          chord: 'w-20 h-20 text-lg',
          container: 'gap-4',
          progress: 'h-3'
        };
      default: // medium
        return {
          chord: 'w-16 h-16 text-base',
          container: 'gap-3',
          progress: 'h-2'
        };
    }
  };

  // Get theme classes
  const getThemeClasses = () => {
    switch (theme) {
      case 'dark':
        return {
          background: 'bg-gray-900',
          chord: 'bg-gray-800 border-gray-600 text-gray-200',
          chordActive: 'bg-blue-600 border-blue-400 text-white',
          chordPlayed: 'bg-gray-700 border-gray-500 text-gray-300',
          progress: 'bg-blue-500',
          progressBg: 'bg-gray-700'
        };
      case 'minimal':
        return {
          background: 'bg-transparent',
          chord: 'bg-white border-gray-300 text-gray-800',
          chordActive: 'bg-blue-50 border-blue-300 text-blue-800',
          chordPlayed: 'bg-gray-50 border-gray-200 text-gray-600',
          progress: 'bg-blue-400',
          progressBg: 'bg-gray-200'
        };
      default:
        return {
          background: 'bg-gray-50',
          chord: 'bg-white border-gray-200 text-gray-900',
          chordActive: 'bg-blue-100 border-blue-300 text-blue-900',
          chordPlayed: 'bg-gray-100 border-gray-300 text-gray-700',
          progress: 'bg-blue-500',
          progressBg: 'bg-gray-300'
        };
    }
  };

  const sizeClasses = getSizeClasses();
  const themeClasses = getThemeClasses();

  // Get chord state classes
  const getChordClasses = (index) => {
    const baseClasses = `${sizeClasses.chord} border-2 rounded-lg flex items-center justify-center font-semibold cursor-pointer transition-all duration-${animationDuration} transform hover:scale-105`;
    
    let stateClasses = themeClasses.chord;
    
    if (index === currentChordIndex && isPlaying) {
      stateClasses = themeClasses.chordActive;
      if (index === animatingIndex) {
        return `${baseClasses} ${stateClasses} animate-pulse shadow-lg scale-110`;
      }
      return `${baseClasses} ${stateClasses} shadow-md`;
    } else if (index < currentChordIndex && isPlaying) {
      stateClasses = themeClasses.chordPlayed;
    }
    
    return `${baseClasses} ${stateClasses}`;
  };

  // Render horizontal layout
  const renderHorizontalLayout = () => (
    <div className={`flex items-center ${sizeClasses.container} ${themeClasses.background} p-4 rounded-lg ${className}`}>
      {progression.map((chord, index) => (
        <div key={`${chord}-${index}`} className="relative">
          <div
            className={getChordClasses(index)}
            onClick={() => onChordClick(index)}
            title={`${chord} - Click to jump to this chord`}
          >
            {chord}
            
            {/* Playing indicator */}
            {index === currentChordIndex && isPlaying && (
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                <div className="flex space-x-1">
                  <div className="w-1 h-3 bg-blue-500 rounded animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1 h-3 bg-blue-500 rounded animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1 h-3 bg-blue-500 rounded animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}
          </div>
          
          {/* Connection line to next chord */}
          {index < progression.length - 1 && (
            <div className={`absolute top-1/2 -right-${sizeClasses.container === 'gap-2' ? '2' : sizeClasses.container === 'gap-4' ? '4' : '3'} w-${sizeClasses.container === 'gap-2' ? '4' : sizeClasses.container === 'gap-4' ? '8' : '6'} h-0.5 ${index < currentChordIndex ? themeClasses.progress : themeClasses.progressBg} transform -translate-y-1/2`}></div>
          )}
        </div>
      ))}
      
      {/* Labels */}
      {showLabels && progression.length > 0 && (
        <div className="ml-4 text-sm text-gray-600">
          <div>{currentChordIndex + 1} / {progression.length}</div>
          {isPlaying && <Play className="w-4 h-4 mt-1" />}
        </div>
      )}
    </div>
  );

  // Render vertical layout
  const renderVerticalLayout = () => (
    <div className={`flex flex-col items-center ${sizeClasses.container} ${themeClasses.background} p-4 rounded-lg ${className}`}>
      {progression.map((chord, index) => (
        <div key={`${chord}-${index}`} className="relative">
          <div
            className={getChordClasses(index)}
            onClick={() => onChordClick(index)}
            title={`${chord} - Click to jump to this chord`}
          >
            {chord}
            
            {/* Playing indicator */}
            {index === currentChordIndex && isPlaying && (
              <div className="absolute -right-2 top-1/2 transform -translate-y-1/2">
                <Volume2 className="w-4 h-4 text-blue-500 animate-pulse" />
              </div>
            )}
          </div>
          
          {/* Connection line to next chord */}
          {index < progression.length - 1 && (
            <div className={`w-0.5 h-${sizeClasses.container === 'gap-2' ? '2' : sizeClasses.container === 'gap-4' ? '4' : '3'} ${index < currentChordIndex ? themeClasses.progress : themeClasses.progressBg} mx-auto`}></div>
          )}
        </div>
      ))}
      
      {/* Labels */}
      {showLabels && progression.length > 0 && (
        <div className="mt-4 text-sm text-gray-600 text-center">
          <div>{currentChordIndex + 1} / {progression.length}</div>
          {isPlaying && <Play className="w-4 h-4 mt-1 mx-auto" />}
        </div>
      )}
    </div>
  );

  // Render circular layout
  const renderCircularLayout = () => {
    const radius = size === 'small' ? 60 : size === 'large' ? 100 : 80;
    const center = radius + 40;
    const angleStep = (2 * Math.PI) / Math.max(progression.length, 1);
    
    return (
      <div className={`relative ${themeClasses.background} p-4 rounded-lg ${className}`} style={{ width: center * 2, height: center * 2 }}>
        <svg width={center * 2} height={center * 2} className="absolute inset-0">
          {/* Progress arc */}
          {showProgress && progression.length > 0 && (
            <circle
              cx={center}
              cy={center}
              r={radius + 10}
              fill="none"
              stroke={themeClasses.progressBg}
              strokeWidth="4"
              className="opacity-30"
            />
          )}
          
          {showProgress && isPlaying && (
            <circle
              cx={center}
              cy={center}
              r={radius + 10}
              fill="none"
              stroke={themeClasses.progress.replace('bg-', '')}
              strokeWidth="4"
              strokeDasharray={`${2 * Math.PI * (radius + 10)}`}
              strokeDashoffset={`${2 * Math.PI * (radius + 10) * (1 - progressPercent / 100)}`}
              className="transition-all duration-300"
              transform={`rotate(-90 ${center} ${center})`}
            />
          )}
        </svg>
        
        {progression.map((chord, index) => {
          const angle = index * angleStep - Math.PI / 2; // Start from top
          const x = center + radius * Math.cos(angle);
          const y = center + radius * Math.sin(angle);
          
          return (
            <div
              key={`${chord}-${index}`}
              className={getChordClasses(index)}
              style={{
                position: 'absolute',
                left: x - (size === 'small' ? 24 : size === 'large' ? 40 : 32),
                top: y - (size === 'small' ? 24 : size === 'large' ? 40 : 32),
              }}
              onClick={() => onChordClick(index)}
              title={`${chord} - Click to jump to this chord`}
            >
              {chord}
              
              {/* Playing indicator */}
              {index === currentChordIndex && isPlaying && (
                <div className="absolute inset-0 border-2 border-blue-400 rounded-lg animate-ping"></div>
              )}
            </div>
          );
        })}
        
        {/* Center labels */}
        {showLabels && progression.length > 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-sm text-gray-600">
              <div className="font-semibold">{currentChordIndex + 1} / {progression.length}</div>
              {isPlaying && <Play className="w-6 h-6 mt-2 mx-auto" />}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render waveform visualization (simplified)
  const renderWaveform = () => {
    const bars = 20;
    const heights = Array.from({ length: bars }, (_, i) => {
      const base = 20 + Math.sin(i * 0.5) * 15;
      const playingMultiplier = isPlaying ? 1 + Math.sin(Date.now() * 0.01 + i) * 0.3 : 0.3;
      return Math.max(5, base * playingMultiplier);
    });
    
    return (
      <div className="flex items-end space-x-1 h-16 px-4">
        {heights.map((height, index) => (
          <div
            key={index}
            className={`w-2 bg-gradient-to-t from-blue-500 to-blue-300 rounded-t transition-all duration-100 ${
              isPlaying ? 'opacity-100' : 'opacity-30'
            }`}
            style={{ height: `${height}px` }}
          ></div>
        ))}
      </div>
    );
  };

  // Progress bar
  const renderProgressBar = () => (
    <div className={`w-full ${sizeClasses.progress} ${themeClasses.progressBg} rounded-full overflow-hidden mt-4`}>
      <div
        className={`h-full ${themeClasses.progress} transition-all duration-300 ease-out`}
        style={{ width: `${progressPercent}%` }}
      ></div>
    </div>
  );

  if (progression.length === 0) {
    return (
      <div className={`${themeClasses.background} p-8 rounded-lg text-center ${className}`}>
        <div className="text-gray-500">No chord progression to display</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main visualization */}
      {layout === 'vertical' && renderVerticalLayout()}
      {layout === 'circular' && renderCircularLayout()}
      {layout === 'horizontal' && renderHorizontalLayout()}
      
      {/* Waveform */}
      {showWaveform && (
        <div className={`${themeClasses.background} rounded-lg`}>
          {renderWaveform()}
        </div>
      )}
      
      {/* Progress bar (for non-circular layouts) */}
      {showProgress && layout !== 'circular' && renderProgressBar()}
    </div>
  );
};

export default ProgressionVisualizer;