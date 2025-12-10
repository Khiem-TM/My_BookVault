import { api } from "../utils/axiosConfig";

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  bookCount: number;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface PlaylistBook {
  id: string;
  bookId: string;
  title: string;
  author: string;
  thumbnailUrl?: string;
}

export const playlistService = {
  // Get all user playlists
  getUserPlaylists: async (userId: string) => {
    const response = await api.get(`/library/playlists`, {
      headers: { "X-User-Id": userId },
    });
    return response.data?.result || [];
  },

  // Get playlist detail
  getPlaylistDetail: async (playlistId: string, userId: string) => {
    const response = await api.get(`/library/playlists/${playlistId}`, {
      headers: { "X-User-Id": userId },
    });
    return response.data?.result;
  },

  // Create playlist
  createPlaylist: async (
    userId: string,
    name: string,
    description?: string
  ) => {
    const response = await api.post(
      `/library/playlists`,
      {
        name,
        description,
        userId,
      },
      {
        headers: { "X-User-Id": userId },
      }
    );
    return response.data?.result;
  },

  // Update playlist
  updatePlaylist: async (
    playlistId: string,
    userId: string,
    name: string,
    description?: string
  ) => {
    const response = await api.put(
      `/library/playlists/${playlistId}`,
      {
        name,
        description,
      },
      {
        headers: { "X-User-Id": userId },
      }
    );
    return response.data?.result;
  },

  // Delete playlist
  deletePlaylist: async (playlistId: string, userId: string) => {
    await api.delete(`/library/playlists/${playlistId}`, {
      headers: { "X-User-Id": userId },
    });
  },

  // Add book to playlist
  addBookToPlaylist: async (
    playlistId: string,
    bookId: string,
    userId: string
  ) => {
    const response = await api.post(
      `/library/playlists/${playlistId}/books/${bookId}`,
      {},
      {
        headers: { "X-User-Id": userId },
      }
    );
    return response.data?.result;
  },

  // Remove book from playlist
  removeBookFromPlaylist: async (
    playlistId: string,
    bookId: string,
    userId: string
  ) => {
    const response = await api.delete(
      `/library/playlists/${playlistId}/books/${bookId}`,
      {
        headers: { "X-User-Id": userId },
      }
    );
    return response.data?.result;
  },

  // Reorder books in playlist
  reorderPlaylistBooks: async (
    playlistId: string,
    bookIds: string[],
    userId: string
  ) => {
    const response = await api.post(
      `/library/playlists/${playlistId}/reorder`,
      bookIds,
      {
        headers: { "X-User-Id": userId },
      }
    );
    return response.data?.result;
  },
};
