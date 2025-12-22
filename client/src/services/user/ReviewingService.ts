import { api, ApiResponse } from "../apiClient";

export interface Review {
  id: string;
  userId: string;
  bookId: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export const reviewService = {
  /**
   * Get reviews for a book
   */
  getReviews: async (bookId: number | string): Promise<Review[]> => {
    const response = await api.get<ApiResponse<Review[]>>(
      `/review/api/reviews/book/${bookId}`
    );
    return response.data.result || [];
  },

  /**
   * Add a review
   */
  addReview: async (bookId: number | string, data: any): Promise<any> => {
    const response = await api.post<ApiResponse<any>>(`/review/api/reviews`, {
      ...data,
      bookId,
    });
    return response.data.result!;
  },

  /**
   * Update review
   */
  updateReview: async (reviewId: string, data: any): Promise<any> => {
    const response = await api.put<ApiResponse<any>>(
      `/review/api/reviews/${reviewId}`,
      data
    );
    return response.data.result!;
  },

  /**
   * Delete review
   */
  deleteReview: async (reviewId: string): Promise<void> => {
    await api.delete(`/review/api/reviews/${reviewId}`);
  },
};
