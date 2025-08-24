/**
 * Multi-Select Dropdown Component
 * Provides a dropdown interface that allows multiple selections with comma-separated display
 */

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';

const MultiSelectDropdown = ({ 
  options = [], 
  selectedValues = [], 
  onChange, 
  placeholder = "Select options...",
  label,
  className = "",
  showCounts = false,
  getCounts
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter options based on search term
  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle option selection/deselection
  const handleOptionToggle = (option) => {
    let newSelectedValues;
    if (selectedValues.includes(option)) {
      newSelectedValues = selectedValues.filter(value => value !== option);
    } else {
      newSelectedValues = [...selectedValues, option];
    }
    onChange(newSelectedValues);
  };

  // Handle clearing a specific selected value
  const handleClearValue = (valueToRemove, e) => {
    e.stopPropagation();
    const newSelectedValues = selectedValues.filter(value => value !== valueToRemove);
    onChange(newSelectedValues);
  };

  // Handle clearing all selected values
  const handleClearAll = (e) => {
    e.stopPropagation();
    onChange([]);
  };

  // Get display text for the dropdown button
  const getDisplayText = () => {
    if (selectedValues.length === 0) {
      return placeholder;
    }
    if (selectedValues.length === 1) {
      return selectedValues[0];
    }
    return selectedValues.join(', ');
  };

  // Get count for an option if showCounts is enabled
  const getOptionCount = (option) => {
    if (!showCounts || !getCounts) return 0;
    return getCounts(option);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      
      {/* Dropdown Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3 py-2 text-left bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between ${
          selectedValues.length > 0 ? 'text-gray-900' : 'text-gray-500'
        }`}
      >
        <span className="truncate mr-2">
          {getDisplayText()}
        </span>
        <div className="flex items-center space-x-1">
          {selectedValues.length > 0 && (
            <button
              onClick={handleClearAll}
              className="text-gray-400 hover:text-gray-600 p-0.5"
              title="Clear all"
            >
              <X size={14} />
            </button>
          )}
          {isOpen ? (
            <ChevronUp size={16} className="text-gray-400" />
          ) : (
            <ChevronDown size={16} className="text-gray-400" />
          )}
        </div>
      </button>

      {/* Selected Values Display (when multiple) */}
      {selectedValues.length > 1 && !isOpen && (
        <div className="mt-1 flex flex-wrap gap-1">
          {selectedValues.map(value => (
            <span
              key={value}
              className="inline-flex items-center px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full"
            >
              {value}
              <button
                onClick={(e) => handleClearValue(value, e)}
                className="ml-1 hover:text-blue-600"
                title={`Remove ${value}`}
              >
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {/* Search Input */}
          {options.length > 8 && (
            <div className="p-2 border-b border-gray-200">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}

          {/* Options List */}
          <div className="py-1">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500">
                {searchTerm ? 'No options found' : 'No options available'}
              </div>
            ) : (
              filteredOptions.map(option => {
                const isSelected = selectedValues.includes(option);
                const count = getOptionCount(option);
                
                return (
                  <button
                    key={option}
                    onClick={() => handleOptionToggle(option)}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center justify-between ${
                      isSelected ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-900'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        readOnly
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>{option}</span>
                    </div>
                    {showCounts && count > 0 && (
                      <span className="text-gray-400 text-xs">
                        ({count})
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Footer with selection count */}
          {selectedValues.length > 0 && (
            <div className="px-3 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
              {selectedValues.length} selected
              {selectedValues.length > 1 && (
                <button
                  onClick={handleClearAll}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  Clear all
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MultiSelectDropdown;