import { api, ApiResponse } from "../apiClient";

export interface Book {
  id: number;
  title: string;
  author: string;
  isbn?: string;
  description?: string;
  categories?: string[];
  publishedAt?: string;
  status?: "AVAILABLE" | "UNAVAILABLE" | "BORROWED" | "RENTED";
  publisher?: string;
  thumbnailUrl?: string;
  pageCount?: number;
  averageRating?: number;
  ratingsCount?: number;
  language?: string;
  price?: number;
}

export interface PageResponse<T> {
  data: T[];
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalElements: number;
}

export interface BookFilters {
  keyword?: string;
  category?: string;
  author?: string;
  status?: string;
  page?: number;
  size?: number;
}

export const bookSharedService = {
  /**
   * Get all books with pagination and filters
   * Public access
   */
  getAllBooks: async (
    filters: BookFilters = {}
  ): Promise<PageResponse<Book>> => {
    const { page = 0, size = 20, keyword, category, author, status } = filters;

    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("size", size.toString());
    if (keyword) params.append("keyword", keyword);
    if (category) params.append("category", category);
    if (author) params.append("author", author);
    if (status) params.append("status", status);

    const response = await api.get<ApiResponse<PageResponse<Book>>>(
      `/books?${params.toString()}`
    );

    // Provide default empty result if null
    return response.data.result || {
      data: [],
      currentPage: 0,
      totalPages: 0,
      pageSize: size,
      totalElements: 0,
    };
  },

  /**
   * Get book details by ID
   */
  getBookById: async (id: string | number): Promise<Book> => {
    const response = await api.get<ApiResponse<Book>>(`/books/${id}`);
    return response.data.result!;
  },

  /**
   * Search books convenience method
   */
  searchBooks: async (
    keyword: string,
    page: number = 0,
    size: number = 20
  ): Promise<PageResponse<Book>> => {
    return bookSharedService.getAllBooks({ keyword, page, size });
  },

  /**
   * Get all book categories
   */
  getBookCategories: async (): Promise<string[]> => {
    const response = await api.get<ApiResponse<string[]>>("/books/categories");
    return response.data.result || [];
  },
  
  /**
   * Get books by category convenience method
   */
  getBooksByCategory: async (categoryId: string): Promise<Book[]> => {
      // The API seems to support filtering by category in getAllBooks, or a specific endpoint. 
      // Based on previous analysis of apiServices.ts:
      // getBooksByCategory: async (categoryId: string) => axiosInstance.get(`/books/categories/${categoryId}`)
      const response = await api.get<ApiResponse<Book[]>>(`/books/categories/${categoryId}`);
      return response.data.result || [];
  }
};
