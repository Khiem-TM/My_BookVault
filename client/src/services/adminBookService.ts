import api, { ApiResponse } from "./apiClient";

export interface BookDto {
  id?: number;
  title: string;
  author: string;
  description?: string;
  publisher?: string;
  publishedAt?: string;
  isbn?: string;
  pageCount?: number;
  language?: string;
  category?: string;
  coverUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  currentPage: number;
  pageSize: number;
}

const adminBookService = {
  /**
   * Get all books with pagination (Admin)
   */
  getAllBooks: async (
    page: number = 0,
    size: number = 10,
    keyword?: string,
    category?: string
  ): Promise<PageResponse<BookDto>> => {
    console.log("📚 Admin fetching all books...", {
      page,
      size,
      keyword,
      category,
    });
    try {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("size", size.toString());
      if (keyword) params.append("keyword", keyword);
      if (category) params.append("category", category);

      const response = (await api.get(
        `/books?${params.toString()}`
      )) as ApiResponse<PageResponse<BookDto>>;
      console.log("✅ Books fetched:", response.result);
      return response.result!;
    } catch (error) {
      console.error("❌ Failed to fetch books:", error);
      throw error;
    }
  },

  /**
   * Get book by ID (Admin)
   */
  getBookById: async (id: number): Promise<BookDto> => {
    console.log(`📖 Admin fetching book: ${id}`);
    try {
      const response = (await api.get(`/books/${id}`)) as ApiResponse<BookDto>;
      console.log("✅ Book details:", response.result);
      return response.result!;
    } catch (error) {
      console.error("❌ Failed to fetch book:", error);
      throw error;
    }
  },

  /**
   * Create new book (Admin only)
   */
  createBook: async (book: BookDto): Promise<BookDto> => {
    console.log("📝 Admin creating new book...", book);
    try {
      const response = (await api.post("/books", book)) as ApiResponse<BookDto>;
      console.log("✅ Book created:", response.result);
      return response.result!;
    } catch (error) {
      console.error("❌ Failed to create book:", error);
      throw error;
    }
  },

  /**
   * Update existing book (Admin only)
   */
  updateBook: async (id: number, book: Partial<BookDto>): Promise<BookDto> => {
    console.log(`✏️ Admin updating book: ${id}`, book);
    try {
      const response = (await api.put(
        `/books/${id}`,
        book
      )) as ApiResponse<BookDto>;
      console.log("✅ Book updated:", response.result);
      return response.result!;
    } catch (error) {
      console.error("❌ Failed to update book:", error);
      throw error;
    }
  },

  /**
   * Delete book (Admin only)
   */
  deleteBook: async (id: number): Promise<void> => {
    console.log(`🗑️ Admin deleting book: ${id}`);
    try {
      await api.delete(`/books/${id}`);
      console.log("✅ Book deleted");
    } catch (error) {
      console.error("❌ Failed to delete book:", error);
      throw error;
    }
  },

  /**
   * Get book statistics (Admin only)
   */
  getStatistics: async (): Promise<any> => {
    console.log("📊 Admin fetching book statistics...");
    try {
      const response = (await api.get(
        "/book/books/statistics"
      )) as ApiResponse<any>;
      console.log("✅ Statistics retrieved:", response.result);
      return response.result!;
    } catch (error) {
      console.error("❌ Failed to fetch statistics:", error);
      throw error;
    }
  },

  /**
   * Get categories (Admin)
   */
  getCategories: async (): Promise<string[]> => {
    console.log("📂 Admin fetching categories...");
    try {
      const response = (await api.get("/books/categories")) as ApiResponse<
        string[]
      >;
      console.log("✅ Categories retrieved:", response.result);
      return response.result!;
    } catch (error) {
      console.error("❌ Failed to fetch categories:", error);
      throw error;
    }
  },

  /**
   * Provision books (Admin only)
   */
  provisionBooks: async (count: number = 20): Promise<number> => {
    console.log("🚀 Admin provisioning books...", { count });
    try {
      const response = (await api.post(
        `/books/provision?count=${count}`
      )) as ApiResponse<number>;
      console.log("✅ Books provisioned:", response.result);
      return response.result!;
    } catch (error) {
      console.error("❌ Failed to provision books:", error);
      throw error;
    }
  },

  /**
   * Import books from external source (Admin only)
   */
  importBooks: async (query: string, limit: number = 10): Promise<number> => {
    console.log("📥 Admin importing books...", { query, limit });
    try {
      const response = (await api.post(
        `/books/import?query=${query}&limit=${limit}`
      )) as ApiResponse<number>;
      console.log("✅ Books imported:", response.result);
      return response.result!;
    } catch (error) {
      console.error("❌ Failed to import books:", error);
      throw error;
    }
  },
};

export default adminBookService;
