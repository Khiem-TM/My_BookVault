export interface Book {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  description?: string;
  categories?: string[];
  publishedAt?: string;
  status?: string;
  publisher?: string;
  thumbnailUrl?: string;
  pageCount?: number;
  averageRating?: number;
  ratingsCount?: number;
  language?: string;
  price?: number; // Optional, as not always available
}

export interface PageResponse<T> {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalElements: number;
  data: T[];
}
