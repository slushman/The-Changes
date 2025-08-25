/**
 * GitHub API integration for saving songs to repository
 * Handles authentication, file creation, and commit management
 */

// Configuration - these would typically come from environment variables
const GITHUB_CONFIG = {
  owner: 'slushman', // Repository owner
  repo: 'The-Changes', // Repository name  
  branch: 'main', // Target branch
  basePath: 'src/data/songs/' // Directory to store individual song files
};

/**
 * Get GitHub token from environment or prompt user
 * In production, this should use proper authentication flow
 */
const getGitHubToken = () => {
  // Check for environment variable first
  if (process.env.REACT_APP_GITHUB_TOKEN) {
    return process.env.REACT_APP_GITHUB_TOKEN;
  }
  
  // For development/demo purposes, could prompt user
  // In production, implement proper OAuth flow
  const token = localStorage.getItem('github_token');
  if (!token) {
    const userToken = prompt(
      'To save songs to GitHub, please enter your GitHub Personal Access Token:\n\n' +
      'You can create one at https://github.com/settings/tokens\n' +
      'Required permissions: repo (full control of private repositories)'
    );
    if (userToken) {
      localStorage.setItem('github_token', userToken);
      return userToken;
    }
  }
  return token;
};

/**
 * Generate file content for a song
 * @param {Object} song - Song data object
 * @returns {string} - JavaScript file content
 */
const generateSongFileContent = (song) => {
  return `/**
 * ${song.title} by ${song.artist} (${song.year})
 * Genre: ${song.genre} | Key: ${song.key} | Tempo: ${song.tempo} BPM
 */

export const song = ${JSON.stringify(song, null, 2)};

export default song;
`;
};

/**
 * Check if a song file already exists
 * @param {string} filename - File name to check
 * @param {string} token - GitHub token
 * @returns {Promise<Object|null>} - Existing file data or null
 */
const checkFileExists = async (filename, token) => {
  const url = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.basePath}${filename}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    if (response.status === 200) {
      return await response.json();
    } else if (response.status === 404) {
      return null; // File doesn't exist
    } else {
      throw new Error(`GitHub API error: ${response.status}`);
    }
  } catch (error) {
    console.error('Error checking file existence:', error);
    return null;
  }
};

/**
 * Create or update a file in the GitHub repository
 * @param {string} filename - Name of file to create/update
 * @param {string} content - File content
 * @param {string} message - Commit message
 * @param {string} token - GitHub token
 * @param {string} sha - SHA of existing file (for updates)
 * @returns {Promise<boolean>} - Success status
 */
const createOrUpdateFile = async (filename, content, message, token, sha = null) => {
  const url = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.basePath}${filename}`;
  
  const body = {
    message,
    content: btoa(unescape(encodeURIComponent(content))), // Properly encode for base64
    branch: GITHUB_CONFIG.branch
  };
  
  // If updating existing file, include SHA
  if (sha) {
    body.sha = sha;
  }
  
  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json'
      },
      body: JSON.stringify(body)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('File saved successfully:', result.content.html_url);
      return true;
    } else {
      const error = await response.json();
      console.error('GitHub API error:', error);
      throw new Error(error.message || 'Failed to save file');
    }
  } catch (error) {
    console.error('Error saving file to GitHub:', error);
    throw error;
  }
};

/**
 * Update the main song database file to include new song
 * @param {Object} newSong - New song to add
 * @param {string} token - GitHub token
 * @returns {Promise<boolean>} - Success status
 */
const updateMainDatabase = async (newSong, token) => {
  const mainDbPath = 'src/data/songDatabase.js';
  const url = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${mainDbPath}`;
  
  try {
    // Get current database file
    const response = await fetch(url, {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch main database file');
    }
    
    const fileData = await response.json();
    const currentContent = decodeURIComponent(escape(atob(fileData.content)));
    
    // Parse and add new song
    // This is a simplified approach - in production, you'd want more robust parsing
    const newSongString = `,

  ${JSON.stringify(newSong, null, 2).split('\n').map(line => '  ' + line).join('\n')}`;
    
    // Insert before the closing bracket of the array
    const insertPosition = currentContent.lastIndexOf('\n];');
    const updatedContent = 
      currentContent.slice(0, insertPosition) + 
      newSongString + 
      currentContent.slice(insertPosition);
    
    // Update file
    await createOrUpdateFile(
      'songDatabase.js',
      updatedContent,
      `Add song: ${newSong.title} by ${newSong.artist}

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>`,
      token,
      fileData.sha
    );
    
    return true;
  } catch (error) {
    console.error('Error updating main database:', error);
    // Don't fail the whole operation if main DB update fails
    return false;
  }
};

/**
 * Save a song to the GitHub repository
 * @param {Object} song - Song object to save
 * @returns {Promise<boolean>} - Success status
 */
export const saveSongToGitHub = async (song) => {
  try {
    const token = getGitHubToken();
    if (!token) {
      alert('GitHub token required to save songs to repository');
      return false;
    }
    
    // Generate filename from song ID
    const filename = `${song.songId}.js`;
    
    // Check if file already exists
    const existingFile = await checkFileExists(filename, token);
    
    if (existingFile) {
      const overwrite = window.confirm(
        `A song with ID "${song.songId}" already exists. Do you want to overwrite it?`
      );
      if (!overwrite) {
        return false;
      }
    }
    
    // Generate file content
    const content = generateSongFileContent(song);
    
    // Create commit message
    const action = existingFile ? 'Update' : 'Add';
    const message = `${action} song: ${song.title} by ${song.artist}

Added via song entry form with the following details:
- Genre: ${song.genre}
- Year: ${song.year}
- Key: ${song.key}
- Tempo: ${song.tempo} BPM
- Sections: ${Object.keys(song.sections).join(', ')}

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>`;
    
    // Save individual song file
    await createOrUpdateFile(
      filename,
      content,
      message,
      token,
      existingFile?.sha
    );
    
    // Optionally update main database (this might fail, but individual file should still be saved)
    try {
      await updateMainDatabase(song, token);
    } catch (error) {
      console.warn('Main database update failed, but individual file was saved:', error);
    }
    
    return true;
    
  } catch (error) {
    console.error('Error saving song to GitHub:', error);
    alert(`Error saving song: ${error.message}`);
    return false;
  }
};

/**
 * Get repository information
 * @returns {Object} - Repository config information
 */
export const getRepositoryInfo = () => {
  return {
    owner: GITHUB_CONFIG.owner,
    repo: GITHUB_CONFIG.repo,
    branch: GITHUB_CONFIG.branch,
    url: `https://github.com/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}`
  };
};

/**
 * Test GitHub API connection
 * @returns {Promise<boolean>} - Connection status
 */
export const testGitHubConnection = async () => {
  try {
    const token = getGitHubToken();
    if (!token) return false;
    
    const response = await fetch(`https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}`, {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    return response.ok;
  } catch (error) {
    console.error('GitHub connection test failed:', error);
    return false;
  }
};

/**
 * Clear stored GitHub token (for logout/reset)
 */
export const clearGitHubToken = () => {
  localStorage.removeItem('github_token');
};

const githubAPI = {
  saveSongToGitHub,
  getRepositoryInfo,
  testGitHubConnection,
  clearGitHubToken
};

export default githubAPI;