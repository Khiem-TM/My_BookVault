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

export interface DashboardStats {
  totalBooks: number;
  totalUsers: number;
  totalBorrows: number;
  activeBorrows: number;
  revenue: number;
}

export const adminStatisticsService = {
  /**
   * Get dashboard summary statistics
   */
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await api.get<ApiResponse<DashboardStats>>(
      "/statistics/summary"
    );
    return response.data.result!;
  },
};
