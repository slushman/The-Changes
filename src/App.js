import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SongDetailPage from './components/SongDetailPage';

import HomePage from './components/HomePage';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/song/:songId" element={<SongDetailPage />} />
      </Routes>
    </Router>
  );
}