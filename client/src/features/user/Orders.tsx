import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../services/apiClient";
import { Link } from "react-router-dom";
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  CreditCard,
  Filter,
  Search,
  Calendar,
  DollarSign,
  BookOpen,
  User,
} from "lucide-react";
import { seedBooks } from "../../data/seedBooks";

interface Order {
  id: string;
  userId: string;
  bookId: string;
  status: "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  orderDate: string;
  deliveryDate?: string;
  totalAmount: number;
  quantity: number;
  shippingAddress: string;
}

export default function Orders() {
  const qc = useQueryClient();
  const userId = 1;
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["orders", userId],
    queryFn: async () =>
      (await api.get(`/order/orders/by-user/${userId}`)).data,
  });

  const create = useMutation({
    mutationFn: async (bookId: string) =>
      (await api.post("/order/orders", { userId, bookId })).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders", userId] });
      alert("Order created successfully!");
    },
  });

  // Mock data for demo purposes when API returns empty
  const mockOrders: Order[] = [
    {
      id: "1",
      userId: "1",
      bookId: "1",
      status: "DELIVERED",
      orderDate: "2024-11-15",
      deliveryDate: "2024-11-20",
      totalAmount: 25.99,
      quantity: 1,
      shippingAddress: "123 Main St, City, State 12345",
    },
    {
      id: "2",
      userId: "1",
      bookId: "2",
      status: "SHIPPED",
      orderDate: "2024-11-25",
      totalAmount: 18.5,
      quantity: 1,
      shippingAddress: "123 Main St, City, State 12345",
    },
    {
      id: "3",
      userId: "1",
      bookId: "3",
      status: "CONFIRMED",
      orderDate: "2024-12-01",
      totalAmount: 32.75,
      quantity: 2,
      shippingAddress: "123 Main St, City, State 12345",
    },
    {
      id: "4",
      userId: "1",
      bookId: "4",
      status: "PENDING",
      orderDate: "2024-12-05",
      totalAmount: 22.99,
      quantity: 1,
      shippingAddress: "123 Main St, City, State 12345",
    },
  ];

  const orders = data && data.length > 0 ? data : mockOrders;

  const filteredOrders = orders
    .filter(
      (order: Order) => statusFilter === "ALL" || order.status === statusFilter
    )
    .filter((order: Order) => {
      if (!searchTerm) return true;
      const book = seedBooks.find((book) => book.id === order.bookId);
      if (!book) return false;
      return (
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return Clock;
      case "CONFIRMED":
        return CheckCircle;
      case "SHIPPED":
        return Truck;
      case "DELIVERED":
        return Package;
      case "CANCELLED":
        return XCircle;
      default:
        return Package;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "CONFIRMED":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "SHIPPED":
        return "text-purple-600 bg-purple-50 border-purple-200";
      case "DELIVERED":
        return "text-green-600 bg-green-50 border-green-200";
      case "CANCELLED":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getOrderStats = () => {
    const stats = {
      total: orders.length,
      pending: orders.filter((order: Order) => order.status === "PENDING")
        .length,
      shipped: orders.filter((order: Order) => order.status === "SHIPPED")
        .length,
      delivered: orders.filter((order: Order) => order.status === "DELIVERED")
        .length,
    };
    return stats;
  };

  const stats = getOrderStats();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
                <p className="text-gray-600">
                  Track and manage your book orders
                </p>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="hidden md:flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {stats.total}
                </div>
                <div className="text-sm text-gray-600">Total Orders</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {stats.pending}
                </div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {stats.shipped}
                </div>
                <div className="text-sm text-gray-600">Shipped</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {stats.delivered}
                </div>
                <div className="text-sm text-gray-600">Delivered</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Filters and Search */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex flex-wrap gap-2">
            {[
              "ALL",
              "PENDING",
              "CONFIRMED",
              "SHIPPED",
              "DELIVERED",
              "CANCELLED",
            ].map((status) => {
              const count =
                status === "ALL"
                  ? orders.length
                  : orders.filter((o: Order) => o.status === status).length;
              return (
                <button
                  key={status}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    statusFilter === status
                      ? "bg-blue-600 text-white shadow-lg"
                      : "bg-white text-gray-600 hover:bg-gray-50 border"
                  }`}
                  onClick={() => setStatusFilter(status)}
                >
                  {status !== "ALL" &&
                    React.createElement(getStatusIcon(status), {
                      className: "h-4 w-4",
                    })}
                  {status.charAt(0) + status.slice(1).toLowerCase()}
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      statusFilter === status ? "bg-white/20" : "bg-gray-100"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search and Create Order */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <button
              onClick={() => create.mutate("1")}
              disabled={create.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {create.isPending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              ) : (
                <Package className="h-4 w-4" />
              )}
              {create.isPending ? "Creating..." : "Create Order"}
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-6">
            Error loading orders: {(error as any).message}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm ? "No orders found" : "No orders yet"}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm
                ? `No orders match "${searchTerm}"`
                : "Start browsing books and place your first order"}
            </p>
            <Link
              to="/books"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <BookOpen className="h-5 w-5 mr-2" />
              Browse Books
            </Link>
          </div>
        )}

        {/* Orders List */}
        {!isLoading && filteredOrders.length > 0 && (
          <div className="space-y-6">
            {filteredOrders.map((order: Order) => {
              const book = seedBooks.find((book) => book.id === order.bookId);
              const StatusIcon = getStatusIcon(order.status);

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        {book ? (
                          <Link to={`/books/${book.id}`}>
                            <div className="bg-gradient-to-br from-blue-100 to-purple-100 w-16 h-20 rounded-lg flex items-center justify-center">
                              <BookOpen className="h-8 w-8 text-blue-400" />
                            </div>
                          </Link>
                        ) : (
                          <div className="bg-gray-100 w-16 h-20 rounded-lg flex items-center justify-center">
                            <Package className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Order #{order.id}
                          </h3>
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                              order.status
                            )}`}
                          >
                            <StatusIcon className="h-4 w-4 mr-1" />
                            {order.status}
                          </span>
                        </div>
                        {book && (
                          <Link
                            to={`/books/${book.id}`}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            {book.title}
                          </Link>
                        )}
                        <p className="text-gray-600 text-sm mt-1">
                          by {book?.author || "Unknown Author"}
                        </p>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className="text-2xl font-bold text-gray-900">
                        ${order.totalAmount}
                      </div>
                      <div className="text-sm text-gray-600">
                        Qty: {order.quantity}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-600">Order Date</div>
                        <div className="font-medium">
                          {new Date(order.orderDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {order.deliveryDate && (
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-600">
                            Delivery Date
                          </div>
                          <div className="font-medium">
                            {new Date(order.deliveryDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-600">Shipping To</div>
                        <div className="font-medium text-sm">
                          {order.shippingAddress.split(",")[0]}...
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-600">Payment</div>
                        <div className="font-medium">Credit Card</div>
                      </div>
                    </div>
                  </div>

                  {/* Order Actions */}
                  <div className="flex justify-end gap-3 mt-4">
                    {order.status === "PENDING" && (
                      <button className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors">
                        Cancel Order
                      </button>
                    )}
                    {(order.status === "SHIPPED" ||
                      order.status === "DELIVERED") && (
                      <button className="px-4 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors">
                        Track Package
                      </button>
                    )}
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
