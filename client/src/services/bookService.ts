/**
 * Book Service
 * Handles all book-related API calls for both User and Admin roles
 *
 * Routes:
 * - GET /api/v1/books/** -> User & Admin (requires book:read permission)
 * - POST/PUT/DELETE /api/v1/books/** -> Admin only (requires book:create/update/delete)
 */

import { api, ApiResponse } from "./apiClient";

// ==================== INTERFACES ====================

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
}

export interface PageResponse<T> {
  data: T[];
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalElements: number;
}

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

export interface BookFilters {
  keyword?: string;
  category?: string;
  author?: string;
  status?: string;
  page?: number;
  size?: number;
}

// ==================== USER OPERATIONS ====================

/**
 * Get all books with pagination and filters
 * Permission: book:read (Admin only currently, will be public in future)
 */
export const getAllBooks = async (
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

  return response.data.result!;
};

/**
 * Get book details by ID
 * Permission: book:read
 */
export const getBookById = async (id: number): Promise<Book> => {
  const response = await api.get<ApiResponse<Book>>(`/books/${id}`);
  return response.data.result!;
};

/**
 * Search books by keyword
 * Permission: book:read
 */
export const searchBooks = async (
  keyword: string,
  page: number = 0,
  size: number = 20
): Promise<PageResponse<Book>> => {
  const response = await api.get<ApiResponse<PageResponse<Book>>>(
    `/books?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`
  );
  return response.data.result!;
};

/**
 * Get all book categories
 * Permission: book:read
 */
export const getBookCategories = async (): Promise<string[]> => {
  const response = await api.get<ApiResponse<string[]>>("/books/categories");
  return response.data.result!;
};

/**
 * Get book statistics
 * Permission: book:read (Admin only)
 */
export const getBookStatistics = async (): Promise<BookStatistics> => {
  const response = await api.get<ApiResponse<BookStatistics>>(
    "/books/statistics"
  );
  return response.data.result!;
};

// ==================== ADMIN OPERATIONS ====================

/**
 * Create a new book
 * Permission: book:create (Admin only)
 */
export const createBook = async (book: Partial<Book>): Promise<Book> => {
  const response = await api.post<ApiResponse<Book>>("/books", book);
  return response.data.result!;
};

/**
 * Update an existing book
 * Permission: book:update (Admin only)
 */
export const updateBook = async (
  id: number,
  book: Partial<Book>
): Promise<Book> => {
  const response = await api.put<ApiResponse<Book>>(`/books/${id}`, book);
  return response.data.result!;
};

/**
 * Delete a book
 * Permission: book:delete (Admin only)
 */
export const deleteBook = async (id: number): Promise<void> => {
  await api.delete<ApiResponse<void>>(`/books/${id}`);
};

/**
 * Provision sample books for testing
 * Permission: book:create (Admin only)
 */
export const provisionBooks = async (count: number = 20): Promise<number> => {
  const response = await api.post<ApiResponse<number>>(
    `/books/provision?count=${count}`
  );
  return response.data.result!;
};

/**
 * Import books from external source (e.g., Google Books API)
 * Permission: book:create (Admin only)
 */
export const importBooks = async (
  query: string,
  limit: number = 10
): Promise<number> => {
  const response = await api.post<ApiResponse<number>>(
    `/books/import?query=${encodeURIComponent(query)}&limit=${limit}`
  );
  return response.data.result!;
};

// ==================== EXPORT DEFAULT ====================

const bookService = {
  // User operations
  getAllBooks,
  getBookById,
  searchBooks,
  getBookCategories,
  getBookStatistics,

  // Admin operations
  createBook,
  updateBook,
  deleteBook,
  provisionBooks,
  importBooks,
};

export default bookService;
