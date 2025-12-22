import { api, ApiResponse } from "../apiClient";

export interface BookStatistics {
  totalBooks: number;
  availableBooks: number;
  borrowedBooks: number;
  rentedBooks: number;
  totalAuthors: number;
  totalPublishers: number;
  totalCategories: number;
  [key: string]: any;
}

export const adminStatisticsService = {
  /**
   * Get general book statistics
   */
  getBookStatistics: async (): Promise<BookStatistics> => {
    const response = await api.get<ApiResponse<BookStatistics>>(
      "/books/statistics"
    );
    return response.data.result!;
  },
  
  /**
   * Get library statistics (Admin or User? Usually stats are admin)
   * The original code had /library/stats which seemed to be user specific but let's check
   * original libraryService.getLibraryStats calls /library/stats
   * original adminBookService.getStatistics calls /book/books/statistics
   */
  
  /**
   * Get total system stats (users, books, borrows)
   * This might need specific endpoints if they exist, or aggregation.
   * Assuming the existing book statistics covers some of this.
   */
};
