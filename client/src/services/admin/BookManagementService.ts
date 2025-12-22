import { api, ApiResponse } from "../apiClient";
import { Book } from "../shared/BookSharedService";

// Uses the shared Book interface but extends it if necessary for creation/updates
export interface BookDto extends Partial<Book> {}

export const bookManagementService = {
  /**
   * Create a new book
   */
  createBook: async (book: BookDto): Promise<Book> => {
    const response = await api.post<ApiResponse<Book>>("/books", book);
    return response.data.result!;
  },

  /**
   * Update an existing book
   */
  updateBook: async (id: number | string, book: BookDto): Promise<Book> => {
    const response = await api.put<ApiResponse<Book>>(`/books/${id}`, book);
    return response.data.result!;
  },

  /**
   * Delete a book
   */
  deleteBook: async (id: number | string): Promise<void> => {
    await api.delete(`/books/${id}`);
  },

  /**
   * Provision sample books
   */
  provisionBooks: async (count: number = 20): Promise<number> => {
    const response = await api.post<ApiResponse<number>>(
      `/books/provision?count=${count}`
    );
    return response.data.result!;
  },

  /**
   * Import books from external source
   */
  importBooks: async (query: string, limit: number = 10): Promise<number> => {
    const response = await api.post<ApiResponse<number>>(
      `/books/import?query=${encodeURIComponent(query)}&limit=${limit}`
    );
    return response.data.result!;
  },
};
