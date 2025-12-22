import { api, ApiResponse } from "../apiClient";
import { Book } from "../shared/BookSharedService";

export interface LibraryItem {
  id: string;
  bookId: string;
  shelf: "WISHLIST" | "READING" | "READ";
  addedDate: string;
  progress?: number;
}

export const libraryService = {
  /**
   * Get user's library books
   */
  getMyBooks: async (): Promise<LibraryItem[]> => {
    const response = await api.get<ApiResponse<LibraryItem[]>>("/library/my-books");
    return response.data.result || [];
  },

  /**
   * Add book to library
   */
  addToLibrary: async (bookId: number | string): Promise<void> => {
    await api.post(`/library/books/${bookId}`);
  },

  /**
   * Remove book from library
   */
  removeFromLibrary: async (bookId: number | string): Promise<void> => {
    await api.delete(`/library/books/${bookId}`);
  },

  /**
   * Get library stats (User context)
   */
  getLibraryStats: async (): Promise<any> => {
    const response = await api.get<ApiResponse<any>>("/library/stats");
    return response.data.result;
  },
};
