import { api, ApiResponse } from "../apiClient";

export const orderingService = {
  /**
   * Get my orders
   */
  getMyOrders: async (): Promise<any[]> => {
    const response = await api.get<ApiResponse<any[]>>("/order/my-orders");
    return response.data.result || [];
  },

  /**
   * Create order
   */
  createOrder: async (data: any): Promise<any> => {
    const response = await api.post<ApiResponse<any>>("/order/orders", data);
    return response.data.result!;
  },

  /**
   * Get order by ID
   */
  getOrderById: async (id: string): Promise<any> => {
    const response = await api.get<ApiResponse<any>>(`/order/orders/${id}`);
    return response.data.result!;
  },
};
