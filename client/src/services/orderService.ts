import api from "./apiClient";

export interface Order {
  id: string;
  userId: string;
  bookId: string;
  status: "PENDING" | "PAID" | "CANCELLED" | "RETURNED" | "OVERDUE";
  orderType: "BUY" | "RENT";
  createdAt: string;
  totalPrice: number;
  paymentMethod?: string;
  rentalStartDate?: string;
  rentalEndDate?: string;
  rentalDays?: number;
  rentalPrice?: number;
}

export const orderService = {
  // Get user orders
  getUserOrders: async (userId: string) => {
    const response = await api.get(`/order/orders/by-user/${userId}`);
    return response.data?.result || [];
  },

  // Create order (buy)
  createBuyOrder: async (bookId: string, userId: string) => {
    const response = await api.post(`/order/orders`, {
      userId,
      bookId,
      orderType: "BUY",
    });
    return response.data?.result;
  },

  // Create rental order
  createRentalOrder: async (
    bookId: string,
    userId: string,
    rentalDays: number = 14
  ) => {
    const response = await api.post(`/order/orders`, {
      userId,
      bookId,
      orderType: "RENT",
      rentalDays,
    });
    return response.data?.result;
  },

  // Mark order as paid
  markOrderPaid: async (orderId: string) => {
    const response = await api.post(`/order/orders/${orderId}/paid`);
    return response.data?.result;
  },

  // Cancel order
  cancelOrder: async (orderId: string) => {
    const response = await api.post(`/order/orders/${orderId}/cancel`);
    return response.data?.result;
  },

  // Get order detail
  getOrderDetail: async (orderId: string) => {
    const response = await api.get(`/order/orders/${orderId}`);
    return response.data?.result;
  },
};
