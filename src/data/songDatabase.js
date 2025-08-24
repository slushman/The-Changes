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
  },

  // 1960s classics
  {
    songId: "help-beatles-1965",
    title: "Help!",
    artist: "The Beatles",
    album: "Help!",
    year: 1965,
    genre: "rock",
    decade: "60s",
    popularity: "mainstream",
    key: "Bm",
    tempo: 184,
    sections: {
      verse: {
        progression: ["Bm", "G", "E", "A", "F#", "D", "G", "E"],
        bars: 8,
        repetitions: 1,
        complexity: "intermediate",
        audioTimestamp: {
          start: "0:05",
          end: "0:25"
        }
      },
      chorus: {
        progression: ["A", "C#m", "F#m", "D", "G", "E", "A"],
        bars: 7,
        repetitions: 1,
        complexity: "intermediate",
        audioTimestamp: {
          start: "0:25",
          end: "0:45"
        }
      }
    },
    spotifyId: "2nLtzopw4rPReszdYBJU6h",
    youtubeId: "2Q_ZzBGPdqE"
  },

  {
    songId: "satisfaction-rolling-stones-1965",
    title: "(I Can't Get No) Satisfaction",
    artist: "The Rolling Stones",
    album: "Out of Our Heads",
    year: 1965,
    genre: "rock",
    decade: "60s",
    popularity: "mainstream",
    key: "E",
    tempo: 134,
    sections: {
      intro: {
        progression: ["E", "A", "E", "A"],
        bars: 4,
        repetitions: 2,
        complexity: "simple",
        audioTimestamp: {
          start: "0:00",
          end: "0:15"
        }
      },
      verse: {
        progression: ["E", "A", "E", "A", "E", "A", "B", "E"],
        bars: 8,
        repetitions: 1,
        complexity: "simple",
        audioTimestamp: {
          start: "0:15",
          end: "0:45"
        }
      },
      chorus: {
        progression: ["A", "B", "E", "E", "A", "B", "E"],
        bars: 7,
        repetitions: 1,
        complexity: "simple",
        audioTimestamp: {
          start: "0:45",
          end: "1:05"
        }
      }
    },
    spotifyId: "6Fbm4iSH6PvqNQ8i0Z8SdK",
    youtubeId: "nrIPxlFzDi0"
  },

  {
    songId: "good-vibrations-beach-boys-1966",
    title: "Good Vibrations",
    artist: "The Beach Boys",
    album: "Pet Sounds Sessions",
    year: 1966,
    genre: "pop",
    decade: "60s",
    popularity: "mainstream",
    key: "Dm",
    tempo: 148,
    sections: {
      verse: {
        progression: ["Dm", "C", "Bb", "A", "Dm", "C", "Bb", "A"],
        bars: 8,
        repetitions: 1,
        complexity: "intermediate",
        audioTimestamp: {
          start: "0:10",
          end: "0:35"
        }
      },
      chorus: {
        progression: ["F", "G", "Em", "Am", "F", "G", "C"],
        bars: 7,
        repetitions: 1,
        complexity: "intermediate",
        audioTimestamp: {
          start: "0:35",
          end: "1:05"
        }
      }
    },
    spotifyId: "1hi7ajsjvEXPOYKpKTmGWL",
    youtubeId: "Eab_beh07HU"
  },

  // More 1970s songs
  {
    songId: "stairway-to-heaven-led-zeppelin-1971",
    title: "Stairway to Heaven",
    artist: "Led Zeppelin",
    album: "Led Zeppelin IV",
    year: 1971,
    genre: "rock",
    decade: "70s",
    popularity: "mainstream",
    key: "Am",
    tempo: 82,
    sections: {
      intro: {
        progression: ["Am", "C", "D", "F", "Am", "C", "D", "F"],
        bars: 8,
        repetitions: 1,
        complexity: "intermediate",
        audioTimestamp: {
          start: "0:00",
          end: "0:55"
        }
      },
      verse: {
        progression: ["Am", "C", "D", "F", "Am", "C", "D", "F"],
        bars: 8,
        repetitions: 1,
        complexity: "intermediate",
        audioTimestamp: {
          start: "0:55",
          end: "2:15"
        }
      },
      bridge: {
        progression: ["F", "Am", "C", "G", "D", "Am"],
        bars: 6,
        repetitions: 1,
        complexity: "intermediate",
        audioTimestamp: {
          start: "4:20",
          end: "5:35"
        }
      }
    },
    spotifyId: "5CQ30WqJwcep0pYcV4AMNc",
    youtubeId: "QkF3oxdtMys"
  },

  {
    songId: "bohemian-rhapsody-queen-1975",
    title: "Bohemian Rhapsody",
    artist: "Queen",
    album: "A Night at the Opera",
    year: 1975,
    genre: "rock",
    decade: "70s",
    popularity: "mainstream",
    key: "Bb",
    tempo: 72,
    sections: {
      intro: {
        progression: ["Bb", "F", "Gm", "Bb", "Eb", "Bb", "F"],
        bars: 7,
        repetitions: 1,
        complexity: "complex",
        audioTimestamp: {
          start: "0:00",
          end: "0:48"
        }
      },
      verse: {
        progression: ["Bb", "F", "Gm", "Bb", "Eb", "Bb", "F", "Bb"],
        bars: 8,
        repetitions: 1,
        complexity: "complex",
        audioTimestamp: {
          start: "0:48",
          end: "1:18"
        }
      },
      bridge: {
        progression: ["A", "Dm", "Gm", "C", "F", "Bb", "Eb", "Bb"],
        bars: 8,
        repetitions: 1,
        complexity: "complex",
        audioTimestamp: {
          start: "2:35",
          end: "4:05"
        }
      }
    },
    spotifyId: "4u7EnebtmKWzUH433cf5Qv",
    youtubeId: "fJ9rUzIMcZQ"
  },

  {
    songId: "imagine-john-lennon-1971",
    title: "Imagine",
    artist: "John Lennon",
    album: "Imagine",
    year: 1971,
    genre: "rock",
    decade: "70s",
    popularity: "mainstream",
    key: "C",
    tempo: 76,
    sections: {
      verse: {
        progression: ["C", "Cmaj7", "F", "C", "Cmaj7", "F"],
        bars: 6,
        repetitions: 1,
        complexity: "simple",
        audioTimestamp: {
          start: "0:15",
          end: "0:55"
        }
      },
      chorus: {
        progression: ["F", "Am", "Dm", "G", "C", "G", "C"],
        bars: 7,
        repetitions: 1,
        complexity: "simple",
        audioTimestamp: {
          start: "0:55",
          end: "1:30"
        }
      }
    },
    spotifyId: "7pKfPomDEeI4TPT6EOYjn9",
    youtubeId: "YkgkThdzX-8"
  },

  // More 1980s songs
  {
    songId: "billie-jean-michael-jackson-1982",
    title: "Billie Jean",
    artist: "Michael Jackson",
    album: "Thriller",
    year: 1982,
    genre: "pop",
    decade: "80s",
    popularity: "mainstream",
    key: "F#m",
    tempo: 117,
    sections: {
      verse: {
        progression: ["F#m", "G#m7b5", "C#7", "F#m"],
        bars: 4,
        repetitions: 2,
        complexity: "intermediate",
        audioTimestamp: {
          start: "0:30",
          end: "1:10"
        }
      },
      chorus: {
        progression: ["B", "C#", "F#m", "F#m", "B", "C#", "F#m"],
        bars: 7,
        repetitions: 1,
        complexity: "intermediate",
        audioTimestamp: {
          start: "1:10",
          end: "1:45"
        }
      }
    },
    spotifyId: "5ChkMS8OtdzJeqyybCc9R5",
    youtubeId: "Zi_XLOBDo_Y"
  },

  {
    songId: "like-a-virgin-madonna-1984",
    title: "Like a Virgin",
    artist: "Madonna",
    album: "Like a Virgin",
    year: 1984,
    genre: "pop",
    decade: "80s",
    popularity: "mainstream",
    key: "F",
    tempo: 118,
    sections: {
      verse: {
        progression: ["F", "Gm", "Bb", "F", "Dm", "Gm", "C", "F"],
        bars: 8,
        repetitions: 1,
        complexity: "simple",
        audioTimestamp: {
          start: "0:15",
          end: "0:45"
        }
      },
      chorus: {
        progression: ["F", "Bb", "Gm", "C", "F", "Bb", "Gm", "C"],
        bars: 8,
        repetitions: 1,
        complexity: "simple",
        audioTimestamp: {
          start: "0:45",
          end: "1:15"
        }
      }
    },
    spotifyId: "5n74aYpWgqU9FC7Qhd1WW3",
    youtubeId: "s__rX_WL100"
  },

  {
    songId: "every-breath-you-take-police-1983",
    title: "Every Breath You Take",
    artist: "The Police",
    album: "Synchronicity",
    year: 1983,
    genre: "rock",
    decade: "80s",
    popularity: "mainstream",
    key: "G",
    tempo: 117,
    sections: {
      verse: {
        progression: ["G", "Em", "C", "D", "G"],
        bars: 5,
        repetitions: 1,
        complexity: "simple",
        audioTimestamp: {
          start: "0:15",
          end: "0:45"
        }
      },
      chorus: {
        progression: ["C", "C", "G", "G", "C", "C", "G"],
        bars: 7,
        repetitions: 1,
        complexity: "simple",
        audioTimestamp: {
          start: "0:45",
          end: "1:15"
        }
      }
    },
    spotifyId: "1JSTJqkT5qHq8MDJnJbRE1",
    youtubeId: "OMOGaugKpzs"
  },

  {
    songId: "livin-on-a-prayer-bon-jovi-1986",
    title: "Livin' on a Prayer",
    artist: "Bon Jovi",
    album: "Slippery When Wet",
    year: 1986,
    genre: "rock",
    decade: "80s",
    popularity: "mainstream",
    key: "Em",
    tempo: 123,
    sections: {
      intro: {
        progression: ["Em", "C", "D", "Em", "Em", "C", "D", "Em"],
        bars: 8,
        repetitions: 1,
        complexity: "simple",
        audioTimestamp: {
          start: "0:00",
          end: "0:30"
        }
      },
      verse: {
        progression: ["Em", "C", "D", "G", "Em", "C", "D", "Em"],
        bars: 8,
        repetitions: 1,
        complexity: "simple",
        audioTimestamp: {
          start: "0:30",
          end: "1:00"
        }
      },
      chorus: {
        progression: ["C", "D", "G", "G", "C", "D", "Em", "Em"],
        bars: 8,
        repetitions: 1,
        complexity: "simple",
        audioTimestamp: {
          start: "1:00",
          end: "1:30"
        }
      }
    },
    spotifyId: "37ZJ0p5Jm13JPevGcx4SkF",
    youtubeId: "lDK9QqIzhwk"
  },

  // More 1990s songs
  {
    songId: "under-the-bridge-red-hot-chili-peppers-1991",
    title: "Under the Bridge",
    artist: "Red Hot Chili Peppers",
    album: "Blood Sugar Sex Magik",
    year: 1991,
    genre: "alternative",
    decade: "90s",
    popularity: "mainstream",
    key: "E",
    tempo: 69,
    sections: {
      verse: {
        progression: ["E", "B", "C#m", "G#m", "A", "E", "B", "B"],
        bars: 8,
        repetitions: 1,
        complexity: "intermediate",
        audioTimestamp: {
          start: "0:15",
          end: "1:15"
        }
      },
      chorus: {
        progression: ["A", "E", "B", "C#m", "A", "E", "B", "B"],
        bars: 8,
        repetitions: 1,
        complexity: "intermediate",
        audioTimestamp: {
          start: "1:15",
          end: "2:00"
        }
      }
    },
    spotifyId: "3d9DChrdc6BOeFsbrZ3Is0",
    youtubeId: "lwlogyj7nFE"
  },

  {
    songId: "zombie-cranberries-1994",
    title: "Zombie",
    artist: "The Cranberries",
    album: "No Need to Argue",
    year: 1994,
    genre: "alternative",
    decade: "90s",
    popularity: "mainstream",
    key: "Em",
    tempo: 84,
    sections: {
      verse: {
        progression: ["Em", "C", "G", "D", "Em", "C", "G", "D"],
        bars: 8,
        repetitions: 1,
        complexity: "simple",
        audioTimestamp: {
          start: "0:45",
          end: "1:30"
        }
      },
      chorus: {
        progression: ["Em", "C", "G", "D", "Em", "C", "G", "D"],
        bars: 8,
        repetitions: 1,
        complexity: "simple",
        audioTimestamp: {
          start: "1:30",
          end: "2:15"
        }
      }
    },
    spotifyId: "7EZC6E7UjZe63f1jRmkWxt",
    youtubeId: "6Ejga4kJUts"
  },

  {
    songId: "basket-case-green-day-1994",
    title: "Basket Case",
    artist: "Green Day",
    album: "Dookie",
    year: 1994,
    genre: "punk",
    decade: "90s",
    popularity: "mainstream",
    key: "Eb",
    tempo: 171,
    sections: {
      verse: {
        progression: ["Eb", "Bb", "Cm", "G", "Ab", "Eb", "Bb", "Bb"],
        bars: 8,
        repetitions: 1,
        complexity: "simple",
        audioTimestamp: {
          start: "0:05",
          end: "0:25"
        }
      },
      chorus: {
        progression: ["Ab", "Bb", "Eb", "Cm", "Ab", "Bb", "Eb", "Bb"],
        bars: 8,
        repetitions: 1,
        complexity: "simple",
        audioTimestamp: {
          start: "0:25",
          end: "0:45"
        }
      }
    },
    spotifyId: "6L89mwZXSOwYwGBRxDNNXU",
    youtubeId: "NUTGr5t3MoY"
  },

  // 2000s additions
  {
    songId: "crazy-gnarls-barkley-2006",
    title: "Crazy",
    artist: "Gnarls Barkley",
    album: "St. Elsewhere",
    year: 2006,
    genre: "soul",
    decade: "2000s",
    popularity: "mainstream",
    key: "Cm",
    tempo: 112,
    sections: {
      verse: {
        progression: ["Cm", "Eb", "Bb", "F", "Cm", "Eb", "Bb", "F"],
        bars: 8,
        repetitions: 1,
        complexity: "simple",
        audioTimestamp: {
          start: "0:10",
          end: "0:40"
        }
      },
      chorus: {
        progression: ["Cm", "Eb", "Bb", "F", "Cm", "Eb", "Bb", "F"],
        bars: 8,
        repetitions: 1,
        complexity: "simple",
        audioTimestamp: {
          start: "0:40",
          end: "1:10"
        }
      }
    },
    spotifyId: "4Iuc6uhJSNFqGBXlnZCfMZ",
    youtubeId: "bd2B6SjMh_w"
  },

  {
    songId: "seven-nation-army-white-stripes-2003",
    title: "Seven Nation Army",
    artist: "The White Stripes",
    album: "Elephant",
    year: 2003,
    genre: "rock",
    decade: "2000s",
    popularity: "mainstream",
    key: "E",
    tempo: 124,
    sections: {
      verse: {
        progression: ["E", "E", "G", "E", "D", "C", "B", "B"],
        bars: 8,
        repetitions: 1,
        complexity: "simple",
        audioTimestamp: {
          start: "0:20",
          end: "0:50"
        }
      },
      chorus: {
        progression: ["E", "G", "E", "D", "C", "B", "B", "E"],
        bars: 8,
        repetitions: 1,
        complexity: "simple",
        audioTimestamp: {
          start: "0:50",
          end: "1:20"
        }
      }
    },
    spotifyId: "3dPQuX8Gs42Y7b454ybpMR",
    youtubeId: "0J2QdDbelmY"
  },

  {
    songId: "use-somebody-kings-of-leon-2008",
    title: "Use Somebody",
    artist: "Kings of Leon",
    album: "Only by the Night",
    year: 2008,
    genre: "rock",
    decade: "2000s",
    popularity: "mainstream",
    key: "C",
    tempo: 136,
    sections: {
      verse: {
        progression: ["C", "C", "F", "Am", "C", "C", "F", "Am"],
        bars: 8,
        repetitions: 1,
        complexity: "simple",
        audioTimestamp: {
          start: "0:15",
          end: "0:45"
        }
      },
      chorus: {
        progression: ["F", "C", "Am", "G", "F", "C", "Am", "G"],
        bars: 8,
        repetitions: 1,
        complexity: "simple",
        audioTimestamp: {
          start: "0:45",
          end: "1:15"
        }
      }
    },
    spotifyId: "3DamFFqW32WihKkTVlwTYQ",
    youtubeId: "gnhXHvRoUd0"
  },

  // More 2010s songs
  {
    songId: "uptown-funk-mark-ronson-2014",
    title: "Uptown Funk",
    artist: "Mark Ronson feat. Bruno Mars",
    album: "Uptown Special",
    year: 2014,
    genre: "funk",
    decade: "2010s",
    popularity: "mainstream",
    key: "Dm",
    tempo: 115,
    sections: {
      verse: {
        progression: ["Dm", "G", "Dm", "G"],
        bars: 4,
        repetitions: 4,
        complexity: "simple",
        audioTimestamp: {
          start: "0:25",
          end: "1:00"
        }
      },
      chorus: {
        progression: ["Dm", "F", "G", "Dm", "Dm", "F", "G", "Dm"],
        bars: 8,
        repetitions: 1,
        complexity: "simple",
        audioTimestamp: {
          start: "1:00",
          end: "1:30"
        }
      }
    },
    spotifyId: "32OlwWuMpZ6b0aN2RZOeMS",
    youtubeId: "OPf0YbXqDm0"
  },

  {
    songId: "happy-pharrell-2013",
    title: "Happy",
    artist: "Pharrell Williams",
    album: "Girl",
    year: 2013,
    genre: "pop",
    decade: "2010s",
    popularity: "mainstream",
    key: "F",
    tempo: 160,
    sections: {
      verse: {
        progression: ["F", "C", "Dm", "Bb"],
        bars: 4,
        repetitions: 4,
        complexity: "simple",
        audioTimestamp: {
          start: "0:25",
          end: "1:00"
        }
      },
      chorus: {
        progression: ["F", "C", "Dm", "Bb", "F", "C", "Dm", "Bb"],
        bars: 8,
        repetitions: 1,
        complexity: "simple",
        audioTimestamp: {
          start: "1:00",
          end: "1:30"
        }
      }
    },
    spotifyId: "5b88tNINg4Q4nrRbrCXUmg",
    youtubeId: "ZbZSe6N_BXs"
  },

  // 2020s additions
  {
    songId: "blinding-lights-weeknd-2019",
    title: "Blinding Lights",
    artist: "The Weeknd",
    album: "After Hours",
    year: 2019,
    genre: "pop",
    decade: "2020s",
    popularity: "mainstream",
    key: "Fm",
    tempo: 171,
    sections: {
      verse: {
        progression: ["Fm", "C", "Db", "Bb"],
        bars: 4,
        repetitions: 2,
        complexity: "simple",
        audioTimestamp: {
          start: "0:30",
          end: "1:00"
        }
      },
      chorus: {
        progression: ["Db", "Ab", "Bb", "Fm", "Db", "Ab", "Bb", "Fm"],
        bars: 8,
        repetitions: 1,
        complexity: "simple",
        audioTimestamp: {
          start: "1:00",
          end: "1:30"
        }
      }
    },
    spotifyId: "0VjIjW4GlUKCO",
    youtubeId: "4NRXx6U8ABQ"
  },

  {
    songId: "watermelon-sugar-harry-styles-2020",
    title: "Watermelon Sugar",
    artist: "Harry Styles",
    album: "Fine Line",
    year: 2020,
    genre: "pop",
    decade: "2020s",
    popularity: "mainstream",
    key: "F",
    tempo: 95,
    sections: {
      verse: {
        progression: ["F", "Am", "Dm", "Bb"],
        bars: 4,
        repetitions: 2,
        complexity: "simple",
        audioTimestamp: {
          start: "0:15",
          end: "0:45"
        }
      },
      chorus: {
        progression: ["F", "Am", "Dm", "Bb", "F", "Am", "Dm", "Bb"],
        bars: 8,
        repetitions: 1,
        complexity: "simple",
        audioTimestamp: {
          start: "0:45",
          end: "1:15"
        }
      }
    },
    spotifyId: "6UelLqGlWMcVH1E5c4H7lY",
    youtubeId: "E07s5ZYygMg"
  },

  {
    songId: "levitating-dua-lipa-2020",
    title: "Levitating",
    artist: "Dua Lipa",
    album: "Future Nostalgia",
    year: 2020,
    genre: "pop",
    decade: "2020s",
    popularity: "mainstream",
    key: "B",
    tempo: 103,
    sections: {
      verse: {
        progression: ["B", "D#m", "G#m", "E"],
        bars: 4,
        repetitions: 2,
        complexity: "simple",
        audioTimestamp: {
          start: "0:20",
          end: "0:50"
        }
      },
      chorus: {
        progression: ["B", "D#m", "G#m", "E", "B", "D#m", "G#m", "E"],
        bars: 8,
        repetitions: 1,
        complexity: "simple",
        audioTimestamp: {
          start: "0:50",
          end: "1:20"
        }
      }
    },
    spotifyId: "463CkQjx2Zk1yXoBuierM9",
    youtubeId: "TUVcZfQe-Kw"
  },

  // Alternative and indie additions
  {
    songId: "pumped-up-kicks-foster-the-people-2010",
    title: "Pumped Up Kicks",
    artist: "Foster the People",
    album: "Torches",
    year: 2010,
    genre: "indie",
    decade: "2010s",
    popularity: "mainstream",
    key: "F",
    tempo: 128,
    sections: {
      verse: {
        progression: ["F", "Am", "G", "Dm"],
        bars: 4,
        repetitions: 4,
        complexity: "simple",
        audioTimestamp: {
          start: "0:10",
          end: "1:00"
        }
      },
      chorus: {
        progression: ["F", "Am", "G", "Dm", "F", "Am", "G", "Dm"],
        bars: 8,
        repetitions: 1,
        complexity: "simple",
        audioTimestamp: {
          start: "1:00",
          end: "1:30"
        }
      }
    },
    spotifyId: "7w87IxuO7BDcJ3YUqCyMTT",
    youtubeId: "SDTZ7iX4vTQ"
  },

  // Country additions
  {
    songId: "friends-in-low-places-garth-brooks-1990",
    title: "Friends in Low Places",
    artist: "Garth Brooks",
    album: "No Fences",
    year: 1990,
    genre: "country",
    decade: "90s",
    popularity: "mainstream",
    key: "A",
    tempo: 138,
    sections: {
      verse: {
        progression: ["A", "Bm", "E", "A", "A", "Bm", "E", "A"],
        bars: 8,
        repetitions: 1,
        complexity: "simple",
        audioTimestamp: {
          start: "0:15",
          end: "0:45"
        }
      },
      chorus: {
        progression: ["A", "D", "A", "E", "A", "D", "A", "E"],
        bars: 8,
        repetitions: 1,
        complexity: "simple",
        audioTimestamp: {
          start: "0:45",
          end: "1:15"
        }
      }
    },
    spotifyId: "0EgA5xDJhOJQFWxpMFMsOh",
    youtubeId: "p0_der_5hRM"
  },

  // Jazz/Blues additions
  {
    songId: "fly-me-to-the-moon-sinatra-1964",
    title: "Fly Me to the Moon",
    artist: "Frank Sinatra",
    album: "It Might as Well Be Swing",
    year: 1964,
    genre: "jazz",
    decade: "60s",
    popularity: "mainstream",
    key: "C",
    tempo: 118,
    sections: {
      verse: {
        progression: ["Am", "Dm", "G", "C", "F", "Bm7b5", "E7", "Am"],
        bars: 8,
        repetitions: 1,
        complexity: "complex",
        audioTimestamp: {
          start: "0:05",
          end: "0:35"
        }
      },
      bridge: {
        progression: ["F", "Em", "Am", "Dm", "G", "Em", "A7", "Dm"],
        bars: 8,
        repetitions: 1,
        complexity: "complex",
        audioTimestamp: {
          start: "0:35",
          end: "1:05"
        }
      }
    },
    spotifyId: "5b3XJ8pTSjuHqd6E7q8VWZ",
    youtubeId: "5hxibHJOE5E"
  },

  // More classics across decades
  {
    songId: "dancing-queen-abba-1976",
    title: "Dancing Queen",
    artist: "ABBA",
    album: "Arrival",
    year: 1976,
    genre: "pop",
    decade: "70s",
    popularity: "mainstream",
    key: "A",
    tempo: 102,
    sections: {
      verse: {
        progression: ["A", "D", "A", "D", "A", "D", "Bm", "E"],
        bars: 8,
        repetitions: 1,
        complexity: "simple",
        audioTimestamp: {
          start: "0:15",
          end: "0:45"
        }
      },
      chorus: {
        progression: ["A", "D", "A", "D", "A", "F#m", "Bm", "E"],
        bars: 8,
        repetitions: 1,
        complexity: "simple",
        audioTimestamp: {
          start: "0:45",
          end: "1:15"
        }
      }
    },
    spotifyId: "0GjEhVFGZW8afUYGChu5Jl",
    youtubeId: "xFrGuyw1V8s"
  },

  {
    songId: "sweet-caroline-neil-diamond-1969",
    title: "Sweet Caroline",
    artist: "Neil Diamond",
    album: "Brother Love's Travelling Salvation Show",
    year: 1969,
    genre: "pop",
    decade: "60s",
    popularity: "mainstream",
    key: "C",
    tempo: 125,
    sections: {
      verse: {
        progression: ["C", "F", "C", "F", "C", "F", "G", "C"],
        bars: 8,
        repetitions: 1,
        complexity: "simple",
        audioTimestamp: {
          start: "0:20",
          end: "1:00"
        }
      },
      chorus: {
        progression: ["F", "G", "Em", "Am", "F", "G", "C"],
        bars: 7,
        repetitions: 1,
        complexity: "simple",
        audioTimestamp: {
          start: "1:00",
          end: "1:30"
        }
      }
    },
    spotifyId: "1mea3bSkSGXuIRvnydlB5b",
    youtubeId: "1vhFnTjia_I"
  },

  {
    songId: "roxanne-police-1978",
    title: "Roxanne",
    artist: "The Police",
    album: "Outlandos d'Amour",
    year: 1978,
    genre: "rock",
    decade: "70s",
    popularity: "mainstream",
    key: "Gm",
    tempo: 132,
    sections: {
      verse: {
        progression: ["Gm", "Dm", "Eb", "F", "Gm"],
        bars: 5,
        repetitions: 1,
        complexity: "intermediate",
        audioTimestamp: {
          start: "0:10",
          end: "0:40"
        }
      },
      chorus: {
        progression: ["Eb", "F", "Gm", "Gm", "Eb", "F", "Gm"],
        bars: 7,
        repetitions: 1,
        complexity: "intermediate",
        audioTimestamp: {
          start: "0:40",
          end: "1:10"
        }
      }
    },
    spotifyId: "2XU0oxnq2qxCpomAAuJY8K",
    youtubeId: "3T1c7GkzRQQ"
  },

  {
    songId: "come-as-you-are-nirvana-1991",
    title: "Come As You Are",
    artist: "Nirvana",
    album: "Nevermind",
    year: 1991,
    genre: "grunge",
    decade: "90s",
    popularity: "mainstream",
    key: "Em",
    tempo: 120,
    sections: {
      verse: {
        progression: ["Em", "D", "Em", "D", "Em", "D", "C", "B"],
        bars: 8,
        repetitions: 1,
        complexity: "simple",
        audioTimestamp: {
          start: "0:15",
          end: "0:45"
        }
      },
      chorus: {
        progression: ["Em", "D", "Em", "D", "C", "B", "Em"],
        bars: 7,
        repetitions: 1,
        complexity: "simple",
        audioTimestamp: {
          start: "0:45",
          end: "1:15"
        }
      }
    },
    spotifyId: "1nslddOqMlWxgxFbr5dFbj",
    youtubeId: "vabnZ9-ex7o"
  },

  {
    songId: "californication-red-hot-chili-peppers-1999",
    title: "Californication",
    artist: "Red Hot Chili Peppers",
    album: "Californication",
    year: 1999,
    genre: "alternative",
    decade: "90s",
    popularity: "mainstream",
    key: "Am",
    tempo: 96,
    sections: {
      verse: {
        progression: ["Am", "F", "C", "G"],
        bars: 4,
        repetitions: 4,
        complexity: "simple",
        audioTimestamp: {
          start: "0:20",
          end: "1:00"
        }
      },
      chorus: {
        progression: ["Am", "F", "C", "G", "Am", "F", "C", "G"],
        bars: 8,
        repetitions: 1,
        complexity: "simple",
        audioTimestamp: {
          start: "1:00",
          end: "1:30"
        }
      }
    },
    spotifyId: "48UPSzbZjgc449aqz8bxox",
    youtubeId: "YlUKcNNmywk"
  },

  {
    songId: "boulevard-of-broken-dreams-green-day-2004",
    title: "Boulevard of Broken Dreams",
    artist: "Green Day",
    album: "American Idiot",
    year: 2004,
    genre: "punk",
    decade: "2000s",
    popularity: "mainstream",
    key: "Em",
    tempo: 86,
    sections: {
      verse: {
        progression: ["Em", "G", "D", "A", "Em", "G", "D", "A"],
        bars: 8,
        repetitions: 1,
        complexity: "simple",
        audioTimestamp: {
          start: "0:15",
          end: "0:45"
        }
      },
      chorus: {
        progression: ["C", "G", "D", "Em", "C", "G", "D", "D"],
        bars: 8,
        repetitions: 1,
        complexity: "simple",
        audioTimestamp: {
          start: "0:45",
          end: "1:15"
        }
      }
    },
    spotifyId: "7LVHVU3tWfcxj5aiPFEW4T",
    youtubeId: "Soa3gO7tL-c"
  },

  {
    songId: "good-4-u-olivia-rodrigo-2021",
    title: "good 4 u",
    artist: "Olivia Rodrigo",
    album: "SOUR",
    year: 2021,
    genre: "pop",
    decade: "2020s",
    popularity: "mainstream",
    key: "A",
    tempo: 178,
    sections: {
      verse: {
        progression: ["A", "D", "F#m", "E"],
        bars: 4,
        repetitions: 2,
        complexity: "simple",
        audioTimestamp: {
          start: "0:10",
          end: "0:40"
        }
      },
      chorus: {
        progression: ["A", "D", "F#m", "E", "A", "D", "F#m", "E"],
        bars: 8,
        repetitions: 1,
        complexity: "simple",
        audioTimestamp: {
          start: "0:40",
          end: "1:10"
        }
      }
    },
    spotifyId: "4ZtFanR9U6ndgddUvNcjcG",
    youtubeId: "gNi_6U5Pm_o"
  },

  {
    songId: "as-it-was-harry-styles-2022",
    title: "As It Was",
    artist: "Harry Styles",
    album: "Harry's House",
    year: 2022,
    genre: "pop",
    decade: "2020s",
    popularity: "mainstream",
    key: "C",
    tempo: 173,
    sections: {
      verse: {
        progression: ["C", "Am", "F", "G"],
        bars: 4,
        repetitions: 2,
        complexity: "simple",
        audioTimestamp: {
          start: "0:15",
          end: "0:45"
        }
      },
      chorus: {
        progression: ["C", "Am", "F", "G", "C", "Am", "F", "G"],
        bars: 8,
        repetitions: 1,
        complexity: "simple",
        audioTimestamp: {
          start: "0:45",
          end: "1:15"
        }
      }
    },
    spotifyId: "4Dvkj6JhhA12EX05fT7y2e",
    youtubeId: "H5v3kku4y6Q"
  },

  {
    songId: "anti-hero-taylor-swift-2022",
    title: "Anti-Hero",
    artist: "Taylor Swift",
    album: "Midnights",
    year: 2022,
    genre: "pop",
    decade: "2020s",
    popularity: "mainstream",
    key: "C",
    tempo: 97,
    sections: {
      verse: {
        progression: ["C", "G", "Am", "F"],
        bars: 4,
        repetitions: 2,
        complexity: "simple",
        audioTimestamp: {
          start: "0:20",
          end: "0:50"
        }
      },
      chorus: {
        progression: ["F", "C", "G", "Am", "F", "C", "G", "Am"],
        bars: 8,
        repetitions: 1,
        complexity: "simple",
        audioTimestamp: {
          start: "0:50",
          end: "1:20"
        }
      }
    },
    spotifyId: "0V3wPSX9ygBnCm8psDIegu",
    youtubeId: "b1kbLWvqjIg"
  },

  {
    songId: "thunder-imagine-dragons-2017",
    title: "Thunder",
    artist: "Imagine Dragons",
    album: "Evolve",
    year: 2017,
    genre: "pop",
    decade: "2010s",
    popularity: "mainstream",
    key: "C",
    tempo: 168,
    sections: {
      verse: {
        progression: ["C", "Am", "F", "G"],
        bars: 4,
        repetitions: 2,
        complexity: "simple",
        audioTimestamp: {
          start: "0:15",
          end: "0:45"
        }
      },
      chorus: {
        progression: ["F", "C", "Am", "G", "F", "C", "Am", "G"],
        bars: 8,
        repetitions: 1,
        complexity: "simple",
        audioTimestamp: {
          start: "0:45",
          end: "1:15"
        }
      }
    },
    spotifyId: "1zB4vmk8tFRmM9UULNzbLB",
    youtubeId: "fKopy74weus"
  }
];

// Utility functions for working with the song database
export const getDatabaseStats = () => {
  // Get genre counts
  const genreCounts = {};
  songDatabase.forEach(song => {
    genreCounts[song.genre] = (genreCounts[song.genre] || 0) + 1;
  });

  // Get decade counts
  const decadeCounts = {};
  songDatabase.forEach(song => {
    decadeCounts[song.decade] = (decadeCounts[song.decade] || 0) + 1;
  });

  // Get section counts
  const sectionCounts = {};
  songDatabase.forEach(song => {
    Object.keys(song.sections).forEach(section => {
      sectionCounts[section] = (sectionCounts[section] || 0) + 1;
    });
  });

  return {
    totalSongs: songDatabase.length,
    genres: [...new Set(songDatabase.map(song => song.genre))],
    decades: [...new Set(songDatabase.map(song => song.decade))],
    totalSections: songDatabase.reduce((acc, song) => acc + Object.keys(song.sections).length, 0),
    genreCounts,
    decadeCounts,
    sectionCounts
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