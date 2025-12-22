import { api, ApiResponse } from "../apiClient";

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  bookCount: number;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export const playlistService = {
  /**
   * Get user playlists
   */
  getUserPlaylists: async (): Promise<Playlist[]> => {
    const response = await api.get<ApiResponse<Playlist[]>>("/library/playlists");
    return response.data.result || [];
  },

  /**
   * Get playlist detail
   */
  getPlaylistDetail: async (playlistId: string): Promise<any> => {
    const response = await api.get<ApiResponse<any>>(
      `/library/playlists/${playlistId}`
    );
    return response.data.result!;
  },

  /**
   * Create playlist
   */
  createPlaylist: async (name: string, description?: string): Promise<Playlist> => {
    const response = await api.post<ApiResponse<Playlist>>(`/library/playlists`, {
      name,
      description,
    });
    return response.data.result!;
  },

  /**
   * Update playlist
   */
  updatePlaylist: async (
    playlistId: string,
    name: string,
    description?: string
  ): Promise<Playlist> => {
    const response = await api.put<ApiResponse<Playlist>>(
      `/library/playlists/${playlistId}`,
      { name, description }
    );
    return response.data.result!;
  },

  /**
   * Delete playlist
   */
  deletePlaylist: async (playlistId: string): Promise<void> => {
    await api.delete(`/library/playlists/${playlistId}`);
  },

  /**
   * Add book to playlist
   */
  addBookToPlaylist: async (playlistId: string, bookId: string): Promise<void> => {
    await api.post(`/library/playlists/${playlistId}/books/${bookId}`);
  },

  /**
   * Remove book from playlist
   */
  removeBookFromPlaylist: async (playlistId: string, bookId: string): Promise<void> => {
    await api.delete(`/library/playlists/${playlistId}/books/${bookId}`);
  },
  
  /**
    * Reorder books uses bookIds array
    */
   reorderPlaylistBooks: async(playlistId: string, bookIds: string[]) => {
       await api.post(`/library/playlists/${playlistId}/reorder`, bookIds);
   }
};
