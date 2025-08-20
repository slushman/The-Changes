import React from 'react';
import { Music } from 'lucide-react';

export default function App() {
  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
          <Music className="text-blue-600" />
          Chord Progression Explorer
        </h1>
        <p className="text-gray-600">Discover harmonic connections between your favorite songs</p>
      </header>
      
      <div className="text-center text-gray-500 mt-16">
        <p>Enhanced song database and search features coming soon...</p>
      </div>
    </div>
  );
}