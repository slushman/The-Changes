# Chord Progression Explorer - Product Requirements Document

## Overview
A web application that stores chord progression data for popular songs by section and enables users to discover musical connections between songs through shared harmonic patterns.

## Core Features

### 1. Song Database with Sectional Chord Data
- Store chord progressions for different sections of popular songs (verse, chorus, bridge, etc.)
- Each song entry contains multiple sections with their respective chord sequences
- Support for chord variations and extensions (maj7, sus4, etc.)

### 2. Chord Progression Search
- Search for songs that contain specific chord progressions
- Match partial or complete chord sequences
- Display results showing which section of each song contains the matching progression

### 3. Interactive Chord Playback
- Play chord progressions as audio sequences
- Adjustable playback speed (BPM control)
- Visual indication of currently playing chord
- Support for different chord voicings

### 4. Song Section Audio Playback
- Integration with music streaming services or audio clips
- Play the actual song section that contains the searched chord progression
- Synchronized highlighting of chord changes during playback

### 5. Progression Exploration
- Discover variations of chord progressions
- Show related progressions used in other songs
- Visual representation of chord relationships

## Data Structure

### Song Data Format
```json
{
  "songId": "unique-identifier",
  "title": "Song Title",
  "artist": "Artist Name",
  "key": "C",
  "tempo": 120,
  "sections": {
    "verse": {
      "progression": ["C", "Am", "F", "G"],
      "bars": 4,
      "repetitions": 2,
      "audioTimestamp": {
        "start": "0:15",
        "end": "0:45"
      }
    },
    "chorus": {
      "progression": ["F", "C", "G", "Am"],
      "bars": 4,
      "repetitions": 1,
      "audioTimestamp": {
        "start": "0:45",
        "end": "1:15"
      }
    }
  },
  "spotifyId": "optional-spotify-track-id",
  "youtubeId": "optional-youtube-video-id"
}
```

## User Interface Requirements

### 1. Search Interface
- Text input for chord progression search
- Chord suggestion/autocomplete
- Filter options:
  - **Genre** (rock, pop, jazz, folk, country, etc.)
  - **Decade/Era** (60s, 70s, 80s, 90s, 2000s, 2010s+)
  - **Song Section** (verse, chorus, bridge, intro, outro)
  - **Progression Length** (2-chord, 4-chord, 8-chord patterns)
  - **Complexity** (simple triads, extended chords, jazz harmonies)
  - **Artist/Band** (filter by specific performers)
  - **Popularity** (mainstream hits vs. deep cuts)
- Advanced search options

### 2. Results Display
- List of matching songs with section indicators
- Chord progression visualization
- Play button for each result
- Match highlighting within progressions

### 3. Song Detail Pages
- Complete chord chart for all sections
- Audio playback controls
- Related songs with similar progressions
- Section-specific audio timestamps

### 4. Progression Explorer
- Interactive chord grid
- Progression variations and substitutions
- Network view of related progressions

## Technical Requirements

### Frontend
- React-based single page application
- Web Audio API for chord synthesis
- Responsive design for desktop and mobile
- Real-time search with debouncing

### Backend/Data
- JSON-based song database (initially static)
- Search indexing for chord progressions
- Future: API integration with music services

### Audio Integration
- Spotify Web Playback SDK for premium users
- YouTube API for public domain tracks
- Fallback to synthesized chord playback

## Success Metrics
- Number of songs in database
- User engagement with playback features
- Search query success rate
- Time spent exploring related progressions

## Future Enhancements
- User-generated content (submit chord progressions)
- Music theory analysis and explanations
- Playlist generation based on harmonic similarity
- Mobile app version
- Social features (sharing, favorites)

## MVP Scope
1. Static database of 50-100 popular songs
2. Basic chord progression search
3. Synthesized chord playback with speed control
4. Results display with section matching
5. Responsive web interface

This MVP provides core functionality while establishing the foundation for advanced features like real audio integration and user-generated content.