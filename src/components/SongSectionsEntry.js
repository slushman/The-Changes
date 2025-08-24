/**
 * SongSectionsEntry - Freeform textarea interface for entering song sections
 * Allows flexible section naming and chord progression entry
 */

import React, { useState } from 'react';
import { Music, HelpCircle, Eye, EyeOff } from 'lucide-react';

const SongSectionsEntry = ({ 
  sectionsText, 
  onSectionsChange, 
  errors = {},
  generatedSections = null
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const exampleText = `verse: C Am F G
chorus: F C G Am
bridge: Am F C G
verse2: C Am F G (same as verse)
outro: F G C`;

  const handleTextChange = (e) => {
    onSectionsChange(e.target.value);
  };

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <Music className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-2">How to enter song sections:</p>
            <ul className="space-y-1 text-blue-700">
              <li>• Enter each section on a new line</li>
              <li>• Format: <code className="px-1 bg-blue-100 rounded">section_name: chord1 chord2 chord3</code></li>
              <li>• Use any section names you want (verse, chorus, intro, solo, etc.)</li>
              <li>• Separate chords with spaces</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Help Toggle */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Song Sections</h3>
        <button
          onClick={() => setShowHelp(!showHelp)}
          className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
        >
          <HelpCircle className="w-4 h-4" />
          {showHelp ? 'Hide Example' : 'Show Example'}
        </button>
      </div>

      {/* Help Example */}
      {showHelp && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-700 mb-2 font-medium">Example format:</p>
          <pre className="bg-white p-3 rounded border text-sm font-mono text-gray-800">
            {exampleText}
          </pre>
        </div>
      )}

      {/* Main Textarea */}
      <div>
        <textarea
          value={sectionsText}
          onChange={handleTextChange}
          className={`w-full h-64 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm ${
            errors.sections ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder={`Enter your song sections here, for example:

${exampleText}`}
        />
        {errors.sections && (
          <p className="mt-2 text-sm text-red-600">{errors.sections}</p>
        )}
      </div>

      {/* Character Count */}
      <div className="flex justify-between items-center text-xs text-gray-500">
        <span>{sectionsText.length} characters</span>
        <span>{sectionsText.split('\n').filter(line => line.trim()).length} lines</span>
      </div>

      {/* Preview Toggle */}
      {generatedSections && Object.keys(generatedSections).length > 0 && (
        <div className="border-t pt-4">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showPreview ? 'Hide' : 'Show'} Parsed Sections
          </button>

          {showPreview && (
            <div className="mt-3 space-y-3">
              {Object.entries(generatedSections).map(([sectionName, section]) => (
                <div key={sectionName} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-gray-900 capitalize">{sectionName}</h5>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{section.bars} bars</span>
                      <span>{section.complexity}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {section.progression.map((chord, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 rounded font-mono text-xs"
                      >
                        {chord}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tips */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <HelpCircle className="w-4 h-4 text-gray-400 mt-0.5" />
          <div className="text-sm text-gray-600">
            <p className="font-medium mb-1">Tips:</p>
            <ul className="space-y-1">
              <li>• You can use any section names: verse1, verse2, pre-chorus, solo, breakdown, etc.</li>
              <li>• Empty lines are ignored</li>
              <li>• Lines starting with # are treated as comments</li>
              <li>• Use chord names like: C, Am, F, G, Cmaj7, Am/C, etc.</li>
              <li>• The system will automatically detect complexity and timing</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SongSectionsEntry;