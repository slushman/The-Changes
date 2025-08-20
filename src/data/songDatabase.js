/**
 * Song Database with Sectional Chord Progressions
 * Based on PRD specifications for storing chord progression data by song section
 */

// Song data format specification
export const songDataSchema = {
  songId: "string", // unique identifier
  title: "string",
  artist: "string", 
  album: "string", // optional
  year: "number", // release year
  genre: "string", // for filtering
  decade: "string", // derived from year for filtering
  popularity: "string", // "mainstream" | "deep-cut"
  key: "string", // original key
  tempo: "number", // BPM
  sections: {
    // section names: verse, chorus, bridge, intro, outro, pre-chorus, etc.
    sectionName: {
      progression: ["array", "of", "chord", "names"],
      bars: "number", // number of bars in progression
      repetitions: "number", // how many times this progression repeats in the section
      complexity: "string", // "simple" | "intermediate" | "complex"
      audioTimestamp: {
        start: "string", // "mm:ss" format
        end: "string"
      }
    }
  },
  // Optional streaming service integration
  spotifyId: "string", // optional
  youtubeId: "string", // optional
  appleMusicId: "string" // optional
};

// Sample songs implementing the new format
export const songDatabase = [
  {
    songId: "wonderwall-oasis-1995",
    title: "Wonderwall",
    artist: "Oasis",
    album: "(What's the Story) Morning Glory?",
    year: 1995,
    genre: "rock",
    decade: "90s",
    popularity: "mainstream",
    key: "F#m",
    tempo: 87,
    sections: {
      intro: {
        progression: ["F#m", "A", "E", "B"],
        bars: 4,
        repetitions: 2,
        complexity: "simple",
        audioTimestamp: {
          start: "0:00",
          end: "0:12"
        }
      },
      verse: {
        progression: ["F#m", "A", "E", "B", "F#m", "A", "E", "B"],
        bars: 8,
        repetitions: 1,
        complexity: "simple",
        audioTimestamp: {
          start: "0:12",
          end: "0:42"
        }
      },
      "pre-chorus": {
        progression: ["D", "A", "E", "F#m", "D", "A", "E"],
        bars: 7,
        repetitions: 1,
        complexity: "simple",
        audioTimestamp: {
          start: "0:42",
          end: "0:58"
        }
      },
      chorus: {
        progression: ["F#m", "A", "E", "B", "F#m", "A", "E", "B"],
        bars: 8,
        repetitions: 1,
        complexity: "simple",
        audioTimestamp: {
          start: "0:58",
          end: "1:28"
        }
      }
    },
    spotifyId: "6K4t31amVTZDgR3sKmwUJJ",
    youtubeId: "bx1Bh8ZvH84"
  },
  
  {
    songId: "let-it-be-beatles-1970",
    title: "Let It Be",
    artist: "The Beatles",
    album: "Let It Be",
    year: 1970,
    genre: "rock",
    decade: "70s", 
    popularity: "mainstream",
    key: "C",
    tempo: 73,
    sections: {
      verse: {
        progression: ["C", "G", "Am", "F", "C", "G", "F", "C"],
        bars: 8,
        repetitions: 1,
        complexity: "simple",
        audioTimestamp: {
          start: "0:13",
          end: "0:52"
        }
      },
      chorus: {
        progression: ["Am", "G", "F", "C", "G", "F", "C"],
        bars: 7,
        repetitions: 1,
        complexity: "simple",
        audioTimestamp: {
          start: "0:52",
          end: "1:23"
        }
      },
      bridge: {
        progression: ["F", "C", "G", "Am", "F", "C", "G", "C"],
        bars: 8,
        repetitions: 1,
        complexity: "simple",
        audioTimestamp: {
          start: "2:35",
          end: "3:05"
        }
      }
    },
    spotifyId: "7iN1s7xHE4ifF5povM6A48",
    youtubeId: "QDYfEBY9NM4"
  },

  {
    songId: "hotel-california-eagles-1976",
    title: "Hotel California",
    artist: "Eagles",
    album: "Hotel California",
    year: 1976,
    genre: "rock",
    decade: "70s",
    popularity: "mainstream", 
    key: "Bm",
    tempo: 75,
    sections: {
      intro: {
        progression: ["Bm", "F#", "A", "E", "G", "D", "Em", "F#"],
        bars: 8,
        repetitions: 2,
        complexity: "intermediate",
        audioTimestamp: {
          start: "0:00",
          end: "0:30"
        }
      },
      verse: {
        progression: ["Bm", "F#", "A", "E", "G", "D", "Em", "F#"],
        bars: 8,
        repetitions: 1,
        complexity: "intermediate",
        audioTimestamp: {
          start: "0:30",
          end: "1:25"
        }
      },
      chorus: {
        progression: ["G", "D", "F#", "Bm", "G", "D", "Em", "F#"],
        bars: 8,
        repetitions: 1,
        complexity: "intermediate",
        audioTimestamp: {
          start: "1:25",
          end: "1:55"
        }
      }
    },
    spotifyId: "40riOy7x9W7GXjyGp4mddv",
    youtubeId: "09839DpTctU"
  },

  {
    songId: "dont-stop-believin-journey-1981",
    title: "Don't Stop Believin'",
    artist: "Journey",
    album: "Escape",
    year: 1981,
    genre: "rock",
    decade: "80s",
    popularity: "mainstream",
    key: "E",
    tempo: 119,
    sections: {
      intro: {
        progression: ["E", "B", "C#m", "A"],
        bars: 4,
        repetitions: 2,
        complexity: "simple",
        audioTimestamp: {
          start: "0:00",
          end: "0:20"
        }
      },
      verse: {
        progression: ["E", "B", "C#m", "A", "E", "B", "G#m", "A"],
        bars: 8,
        repetitions: 1,
        complexity: "simple",
        audioTimestamp: {
          start: "0:20",
          end: "0:55"
        }
      },
      chorus: {
        progression: ["A", "E", "B", "C#m", "A", "E", "B"],
        bars: 7,
        repetitions: 1,
        complexity: "simple",
        audioTimestamp: {
          start: "0:55",
          end: "1:30"
        }
      }
    },
    spotifyId: "4bHsxqR3GMrXTxEPLuK5ue",
    youtubeId: "1k8craCGpgs"
  },

  {
    songId: "sweet-child-o-mine-guns-n-roses-1987",
    title: "Sweet Child O' Mine",
    artist: "Guns N' Roses",
    album: "Appetite for Destruction",
    year: 1987,
    genre: "rock",
    decade: "80s",
    popularity: "mainstream",
    key: "D",
    tempo: 125,
    sections: {
      intro: {
        progression: ["D", "C", "G", "D"],
        bars: 4,
        repetitions: 4,
        complexity: "simple",
        audioTimestamp: {
          start: "0:00",
          end: "0:35"
        }
      },
      verse: {
        progression: ["D", "C", "G", "D", "D", "C", "G", "D"],
        bars: 8,
        repetitions: 1,
        complexity: "simple",
        audioTimestamp: {
          start: "0:35",
          end: "1:10"
        }
      },
      chorus: {
        progression: ["C", "D", "G", "C", "D", "G"],
        bars: 6,
        repetitions: 1,
        complexity: "simple",
        audioTimestamp: {
          start: "1:10",
          end: "1:40"
        }
      }
    },
    spotifyId: "7o2CTH4ctstm8TNelqjb51",
    youtubeId: "1w7OgIMMRc4"
  },

  {
    songId: "no-woman-no-cry-bob-marley-1974",
    title: "No Woman No Cry",
    artist: "Bob Marley & The Wailers",
    album: "Natty Dread",
    year: 1974,
    genre: "reggae",
    decade: "70s",
    popularity: "mainstream",
    key: "C",
    tempo: 76,
    sections: {
      verse: {
        progression: ["C", "G/B", "Am", "F", "C", "F", "C", "G"],
        bars: 8,
        repetitions: 1,
        complexity: "intermediate",
        audioTimestamp: {
          start: "0:15",
          end: "0:55"
        }
      },
      chorus: {
        progression: ["C", "F", "C", "G", "C", "F", "C", "G"],
        bars: 8,
        repetitions: 1,
        complexity: "simple",
        audioTimestamp: {
          start: "0:55",
          end: "1:30"
        }
      }
    },
    spotifyId: "6JRK3hKXKJd3d6RQ1CCPFX",
    youtubeId: "IT8XvzIfi4U"
  },

  {
    songId: "losing-my-religion-rem-1991",
    title: "Losing My Religion",
    artist: "R.E.M.",
    album: "Out of Time",
    year: 1991,
    genre: "alternative",
    decade: "90s",
    popularity: "mainstream",
    key: "Am",
    tempo: 125,
    sections: {
      verse: {
        progression: ["F", "Dm", "G", "Am", "F", "Dm", "G", "Am"],
        bars: 8,
        repetitions: 1,
        complexity: "simple",
        audioTimestamp: {
          start: "0:25",
          end: "1:00"
        }
      },
      chorus: {
        progression: ["F", "G", "Am", "Am", "F", "G", "Am"],
        bars: 7,
        repetitions: 1,
        complexity: "simple",
        audioTimestamp: {
          start: "1:00",
          end: "1:30"
        }
      },
      bridge: {
        progression: ["C", "Dm", "G", "C", "Dm", "G"],
        bars: 6,
        repetitions: 1,
        complexity: "simple",
        audioTimestamp: {
          start: "2:45",
          end: "3:10"
        }
      }
    },
    spotifyId: "2iuZJX9X9P0GKaE93xcPjk",
    youtubeId: "xwtdhWltSIg"
  },

  {
    songId: "smells-like-teen-spirit-nirvana-1991",
    title: "Smells Like Teen Spirit",
    artist: "Nirvana",
    album: "Nevermind",
    year: 1991,
    genre: "grunge",
    decade: "90s",
    popularity: "mainstream",
    key: "F",
    tempo: 117,
    sections: {
      intro: {
        progression: ["F", "Bb", "Ab", "Db"],
        bars: 4,
        repetitions: 4,
        complexity: "simple",
        audioTimestamp: {
          start: "0:00",
          end: "0:25"
        }
      },
      verse: {
        progression: ["F", "Bb", "Ab", "Db"],
        bars: 4,
        repetitions: 4,
        complexity: "simple",
        audioTimestamp: {
          start: "0:25",
          end: "1:00"
        }
      },
      chorus: {
        progression: ["F", "Bb", "Ab", "Db", "F", "Bb", "Ab", "Db"],
        bars: 8,
        repetitions: 1,
        complexity: "simple",
        audioTimestamp: {
          start: "1:00",
          end: "1:30"
        }
      }
    },
    spotifyId: "4CeeEOM32jQcH3eN9Q2dGj",
    youtubeId: "hTWKbfoikeg"
  },

  {
    songId: "black-pearl-jam-1991",
    title: "Black",
    artist: "Pearl Jam",
    album: "Ten",
    year: 1991,
    genre: "grunge",
    decade: "90s",
    popularity: "mainstream",
    key: "E",
    tempo: 69,
    sections: {
      verse: {
        progression: ["E", "A", "C", "G", "E", "A", "C", "G"],
        bars: 8,
        repetitions: 1,
        complexity: "simple",
        audioTimestamp: {
          start: "0:20",
          end: "1:10"
        }
      },
      chorus: {
        progression: ["A", "C", "G", "D", "A", "C", "G", "D"],
        bars: 8,
        repetitions: 1,
        complexity: "simple",
        audioTimestamp: {
          start: "1:10",
          end: "1:50"
        }
      }
    },
    spotifyId: "4u7EnebtmKWzUH433cf5Qv",
    youtubeId: "4q9UafsiQ6k"
  },

  {
    songId: "creep-radiohead-1992",
    title: "Creep",
    artist: "Radiohead",
    album: "Pablo Honey",
    year: 1992,
    genre: "alternative",
    decade: "90s",
    popularity: "mainstream",
    key: "G",
    tempo: 92,
    sections: {
      verse: {
        progression: ["G", "B", "C", "Cm"],
        bars: 4,
        repetitions: 2,
        complexity: "intermediate",
        audioTimestamp: {
          start: "0:10",
          end: "0:45"
        }
      },
      chorus: {
        progression: ["G", "B", "C", "Cm"],
        bars: 4,
        repetitions: 2,
        complexity: "intermediate",
        audioTimestamp: {
          start: "0:45",
          end: "1:20"
        }
      }
    },
    spotifyId: "6mFkJmJqdDVQ1REhVfGgd1",
    youtubeId: "XFkzRNyygfk"
  },

  {
    songId: "i-want-it-that-way-backstreet-boys-1999",
    title: "I Want It That Way",
    artist: "Backstreet Boys",
    album: "Millennium",
    year: 1999,
    genre: "pop",
    decade: "90s",
    popularity: "mainstream",
    key: "F#",
    tempo: 100,
    sections: {
      verse: {
        progression: ["F#", "D", "Bm", "A"],
        bars: 4,
        repetitions: 2,
        complexity: "simple",
        audioTimestamp: {
          start: "0:10",
          end: "0:40"
        }
      },
      chorus: {
        progression: ["D", "A", "Bm", "F#", "D", "A", "Bm"],
        bars: 7,
        repetitions: 1,
        complexity: "simple",
        audioTimestamp: {
          start: "0:40",
          end: "1:10"
        }
      }
    },
    spotifyId: "47BBI51FKFwOMlIiX6m8ya",
    youtubeId: "4fndeDfaWCg"
  },

  {
    songId: "hey-ya-outkast-2003",
    title: "Hey Ya!",
    artist: "OutKast",
    album: "Speakerboxxx/The Love Below",
    year: 2003,
    genre: "hip-hop",
    decade: "2000s",
    popularity: "mainstream",
    key: "G",
    tempo: 159,
    sections: {
      verse: {
        progression: ["G", "C", "D", "E"],
        bars: 4,
        repetitions: 2,
        complexity: "simple",
        audioTimestamp: {
          start: "0:25",
          end: "1:00"
        }
      },
      chorus: {
        progression: ["G", "C", "D", "E", "G", "C", "D", "E"],
        bars: 8,
        repetitions: 1,
        complexity: "simple",
        audioTimestamp: {
          start: "1:00",
          end: "1:35"
        }
      }
    },
    spotifyId: "2PpruBYCo4H7WOBJ7Q2EwM",
    youtubeId: "PWgvGjAhvIw"
  },

  {
    songId: "mr-brightside-the-killers-2003",
    title: "Mr. Brightside",
    artist: "The Killers",
    album: "Hot Fuss",
    year: 2003,
    genre: "indie",
    decade: "2000s",
    popularity: "mainstream",
    key: "D",
    tempo: 148,
    sections: {
      intro: {
        progression: ["D", "Gmaj7", "Bm", "A"],
        bars: 4,
        repetitions: 2,
        complexity: "intermediate",
        audioTimestamp: {
          start: "0:00",
          end: "0:15"
        }
      },
      verse: {
        progression: ["D", "Gmaj7", "Bm", "A"],
        bars: 4,
        repetitions: 2,
        complexity: "intermediate",
        audioTimestamp: {
          start: "0:15",
          end: "0:45"
        }
      },
      chorus: {
        progression: ["D", "Gmaj7", "Bm", "A", "D", "Gmaj7", "Bm", "A"],
        bars: 8,
        repetitions: 1,
        complexity: "intermediate",
        audioTimestamp: {
          start: "0:45",
          end: "1:20"
        }
      }
    },
    spotifyId: "003vvx7Niy0yvhvHt4a68B",
    youtubeId: "gGdGFtwCNBE"
  },

  {
    songId: "somebody-that-i-used-to-know-gotye-2011",
    title: "Somebody That I Used to Know",
    artist: "Gotye feat. Kimbra",
    album: "Making Mirrors",
    year: 2011,
    genre: "indie",
    decade: "2010s",
    popularity: "mainstream",
    key: "Dm",
    tempo: 129,
    sections: {
      verse: {
        progression: ["Dm", "C", "Bb", "C"],
        bars: 4,
        repetitions: 2,
        complexity: "simple",
        audioTimestamp: {
          start: "0:25",
          end: "1:00"
        }
      },
      chorus: {
        progression: ["Bb", "C", "Dm", "Dm", "Bb", "C", "Dm"],
        bars: 7,
        repetitions: 1,
        complexity: "simple",
        audioTimestamp: {
          start: "1:00",
          end: "1:35"
        }
      }
    },
    spotifyId: "2WfaOiMkCvy7F5fcp2zZ8L",
    youtubeId: "8UVNT4wvIGY"
  },

  {
    songId: "rolling-in-the-deep-adele-2010",
    title: "Rolling in the Deep",
    artist: "Adele",
    album: "21",
    year: 2010,
    genre: "pop",
    decade: "2010s",
    popularity: "mainstream",
    key: "Cm",
    tempo: 105,
    sections: {
      verse: {
        progression: ["Cm", "Gm", "Bb", "Eb"],
        bars: 4,
        repetitions: 2,
        complexity: "simple",
        audioTimestamp: {
          start: "0:15",
          end: "0:50"
        }
      },
      chorus: {
        progression: ["Cm", "Bb", "Eb", "Bb", "Cm", "Bb", "Eb"],
        bars: 7,
        repetitions: 1,
        complexity: "simple",
        audioTimestamp: {
          start: "0:50",
          end: "1:25"
        }
      },
      bridge: {
        progression: ["Fm", "Cm", "Bb", "Eb"],
        bars: 4,
        repetitions: 2,
        complexity: "simple",
        audioTimestamp: {
          start: "2:20",
          end: "2:50"
        }
      }
    },
    spotifyId: "7n2FZQsaLb7ZRfnL8uaOJV",
    youtubeId: "rYEDA3JcQqw"
  },

  {
    songId: "shape-of-you-ed-sheeran-2017",
    title: "Shape of You",
    artist: "Ed Sheeran",
    album: "÷ (Divide)",
    year: 2017,
    genre: "pop",
    decade: "2010s",
    popularity: "mainstream",
    key: "C#m",
    tempo: 96,
    sections: {
      verse: {
        progression: ["C#m", "F#m", "A", "B"],
        bars: 4,
        repetitions: 2,
        complexity: "simple",
        audioTimestamp: {
          start: "0:25",
          end: "1:00"
        }
      },
      chorus: {
        progression: ["C#m", "F#m", "A", "B", "C#m", "F#m", "A", "B"],
        bars: 8,
        repetitions: 1,
        complexity: "simple",
        audioTimestamp: {
          start: "1:00",
          end: "1:35"
        }
      }
    },
    spotifyId: "7qiZfU4dY1lWllzX7mPBI3",
    youtubeId: "JGwWNGJdvx8"
  }
];

// Utility functions for working with the song database
export const getDatabaseStats = () => {
  return {
    totalSongs: songDatabase.length,
    genres: [...new Set(songDatabase.map(song => song.genre))],
    decades: [...new Set(songDatabase.map(song => song.decade))],
    totalSections: songDatabase.reduce((acc, song) => acc + Object.keys(song.sections).length, 0)
  };
};

export const getSongById = (songId) => {
  return songDatabase.find(song => song.songId === songId);
};

export const getSongsByGenre = (genre) => {
  return songDatabase.filter(song => song.genre.toLowerCase() === genre.toLowerCase());
};

export const getSongsByDecade = (decade) => {
  return songDatabase.filter(song => song.decade === decade);
};

export default songDatabase;