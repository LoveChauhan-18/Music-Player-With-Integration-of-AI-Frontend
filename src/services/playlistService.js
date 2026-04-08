import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

// Helper to get JWT headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const playlistService = {
  // Get all playlists for user
  getPlaylists: async () => {
    const response = await axios.get(`${API_URL}/playlists/`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  // Toggle like for a song
  toggleLike: async (songId, songMetadata = null) => {
    const response = await axios.post(`${API_URL}/songs/like/`, {
      song_id: songId,
      song_metadata: songMetadata
    }, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  // Get IDs of all liked songs
  getLikedSongIds: async () => {
    try {
      const response = await axios.get(`${API_URL}/songs/liked/`, {
        headers: getAuthHeaders(),
      });
      return response.data; // Array of IDs
    } catch (error) {
      console.error("Failed to fetch liked songs", error);
      return [];
    }
  },

  // Add song to a specific playlist
  addSongToPlaylist: async (playlistId, songId) => {
    const response = await axios.post(`${API_URL}/playlists/add-song/`, {
      playlist: playlistId,
      song: songId
    }, {
      headers: getAuthHeaders(),
    });
    return response.data;
  }
};
