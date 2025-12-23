import { api, ApiResponse } from "../apiClient";

export enum OrderStatus {
    DRAFT = "DRAFT",
    PENDING_PAYMENT = "PENDING_PAYMENT",
    PENDING_APPROVAL = "PENDING_APPROVAL",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED"
}

export interface OrderItem {
    id: number;
    orderId: number;
    bookId: number;
    bookType: "FREE" | "PAID";
    price: number;
    book?: any; // Include book details if populated
}

export interface Order {
    id: number;
    userId: string;
    totalPrice: number;
    status: OrderStatus;
    paymentMethod: string;
    items: OrderItem[];
    createdAt: string;
    updatedAt: string;
}

export const orderService = {
    // Checkout
    checkout: async (bookIds: number[]): Promise<{ order: Order, isCompleted: boolean }> => {
        const response = await api.post<ApiResponse<{ order: Order, isCompleted: boolean }>>("/orders/checkout", { bookIds });
        return response.data.result!;
    },

    // My Orders
    getMyOrders: async (): Promise<Order[]> => {
        const response = await api.get<ApiResponse<Order[]>>("/orders/my-orders");
        return response.data.result!;
    },

    // Manual Confirm
    manualConfirm: async (orderId: number): Promise<Order> => {
        const response = await api.post<ApiResponse<Order>>(`/orders/${orderId}/manual-confirm`);
        return response.data.result!;
    },

    // Admin: Get Pending Orders
    getPendingOrders: async (): Promise<Order[]> => {
        const response = await api.get<ApiResponse<Order[]>>("/orders/admin/orders");
        return response.data.result!;
    },

    // Admin: Approve Order
    approveOrder: async (orderId: number): Promise<Order> => {
        const response = await api.post<ApiResponse<Order>>(`/orders/admin/orders/${orderId}/approve`);
        return response.data.result!;
    },

    // Admin: Reject Order
    rejectOrder: async (orderId: number): Promise<Order> => {
        const response = await api.post<ApiResponse<Order>>(`/orders/admin/orders/${orderId}/reject`);
        return response.data.result!;
    }
};
