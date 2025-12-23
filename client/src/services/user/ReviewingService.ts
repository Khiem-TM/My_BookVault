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
      `/book/books/${bookId}/reviews`
    );
    // Backend returns { reviews: [], total: ... } or just []?
    // Controller says: res.json(successResponse(result)); where result is from service.getReviewsByBook
    // Service returns { reviews, total }.
    // So response.data.result.reviews is the array.
    const result: any = response.data.result;
    if (result && Array.isArray(result.reviews)) {
        return result.reviews;
    }
    return []; 
  },

  /**
   * Add a review
   */
  addReview: async (bookId: number | string, data: any): Promise<any> => {
    const response = await api.post<ApiResponse<any>>(`/book/books/${bookId}/reviews`, {
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
      `/review/${reviewId}`,
      data
    );
    return response.data.result!;
  },

  /**
   * Delete review
   */
  deleteReview: async (reviewId: string): Promise<void> => {
    await api.delete(`/review/${reviewId}`);
  },
};
