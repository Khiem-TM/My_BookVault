import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../services/apiClient";
import { Link } from "react-router-dom";
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  CreditCard,
  Search,
  Calendar,
  DollarSign,
  BookOpen,
  RotateCcw,
  AlertCircle,
} from "lucide-react";

interface Order {
  id: string;
  userId: string;
  bookId: string;
  status: "PENDING" | "PAID" | "CANCELLED" | "RETURNED" | "OVERDUE";
  orderType: "BUY" | "RENT";
  createdAt: string;
  updatedAt?: string;
  totalPrice?: number;
  paymentMethod?: string;
  notes?: string;
  rentalStartDate?: string;
  rentalEndDate?: string;
  rentalDays?: number;
  rentalPrice?: number;
  bookTitle?: string;
  bookAuthor?: string;
}

const mockOrders: Order[] = [
  {
    id: "1",
    userId: "1",
    bookId: "1",
    status: "PAID",
    orderType: "BUY",
    createdAt: "2025-12-08T10:30:00Z",
    totalPrice: 19.99,
    bookTitle: "The Great Gatsby",
    bookAuthor: "F. Scott Fitzgerald",
  },
  {
    id: "2",
    userId: "1",
    bookId: "2",
    status: "PENDING",
    orderType: "RENT",
    createdAt: "2025-12-09T14:15:00Z",
    rentalDays: 14,
    rentalPrice: 9.99,
    rentalStartDate: "2025-12-09T14:15:00Z",
    rentalEndDate: "2025-12-23T14:15:00Z",
    bookTitle: "To Kill a Mockingbird",
    bookAuthor: "Harper Lee",
  },
  {
    id: "3",
    userId: "1",
    bookId: "3",
    status: "RETURNED",
    orderType: "RENT",
    createdAt: "2025-11-28T09:00:00Z",
    rentalDays: 7,
    rentalPrice: 4.99,
    rentalStartDate: "2025-11-28T09:00:00Z",
    rentalEndDate: "2025-12-05T09:00:00Z",
    bookTitle: "1984",
    bookAuthor: "George Orwell",
  },
];

export default function Orders() {
  const qc = useQueryClient();
  const userId = "1";
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [orderTypeFilter, setOrderTypeFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: orders = mockOrders, isLoading } = useQuery({
    queryKey: ["orders", userId],
    queryFn: async () => {
      try {
        const response = await api.get(`/order/orders/by-user/${userId}`);
        return response.data || mockOrders;
      } catch (err) {
        console.log("Using mock orders data");
        return mockOrders;
      }
    },
    enabled: !!userId,
  });

  // Filter logic
  const filteredOrders = (orders || []).filter((order) => {
    const matchesStatus =
      statusFilter === "ALL" || order.status === statusFilter;
    const matchesType =
      orderTypeFilter === "ALL" || order.orderType === orderTypeFilter;
    const matchesSearch =
      !searchTerm ||
      order.bookTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.includes(searchTerm);
    return matchesStatus && matchesType && matchesSearch;
  });

  // Calculate stats
  const stats = {
    total: orders?.length || 0,
    pending: orders?.filter((o) => o.status === "PENDING").length || 0,
    rentals: orders?.filter((o) => o.orderType === "RENT").length || 0,
    purchases: orders?.filter((o) => o.orderType === "BUY").length || 0,
  };

  // Check if rental is overdue
  const isOverdue = (order: Order) => {
    if (order.orderType !== "RENT" || !order.rentalEndDate) return false;
    return new Date(order.rentalEndDate) < new Date();
  };

  // Status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
      case "RETURNED":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      case "OVERDUE":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PAID":
      case "RETURNED":
        return <CheckCircle className="h-5 w-5" />;
      case "PENDING":
        return <Clock className="h-5 w-5" />;
      case "CANCELLED":
        return <XCircle className="h-5 w-5" />;
      case "OVERDUE":
        return <AlertCircle className="h-5 w-5" />;
      default:
        return <Package className="h-5 w-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center">
              <Package className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
              <p className="text-gray-600">
                Track your book purchases and rentals
              </p>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="hidden md:grid grid-cols-4 gap-4">
            <div className="text-center p-4 bg-white rounded-lg shadow">
              <div className="text-2xl font-bold text-gray-900">
                {stats.total}
              </div>
              <div className="text-sm text-gray-600">Total Orders</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow">
              <div className="text-2xl font-bold text-yellow-600">
                {stats.pending}
              </div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow">
              <div className="text-2xl font-bold text-blue-600">
                {stats.rentals}
              </div>
              <div className="text-sm text-gray-600">Rentals</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow">
              <div className="text-2xl font-bold text-green-600">
                {stats.purchases}
              </div>
              <div className="text-sm text-gray-600">Purchases</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by book title or order ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="PAID">Paid</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="RETURNED">Returned</option>
              <option value="OVERDUE">Overdue</option>
            </select>

            {/* Order Type Filter */}
            <select
              value={orderTypeFilter}
              onChange={(e) => setOrderTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Types</option>
              <option value="BUY">Purchase</option>
              <option value="RENT">Rental</option>
            </select>
          </div>
        </div>

        {/* Orders List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700">
              No orders found
            </h3>
            <p className="text-gray-500 mt-2">
              {searchTerm || statusFilter !== "ALL" || orderTypeFilter !== "ALL"
                ? "Try adjusting your filters"
                : "Start ordering books now!"}
            </p>
            <Link
              to="/books"
              className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Browse Books
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow ${
                  isOverdue(order) ? "border-2 border-orange-400" : ""
                }`}
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(order.status)}
                      <div>
                        <p className="font-semibold">Order #{order.id}</p>
                        <p className="text-sm opacity-90">
                          {order.orderType === "BUY" ? "Purchase" : "Rental"}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        isOverdue(order) ? "OVERDUE" : order.status
                      )}`}
                    >
                      {isOverdue(order) ? "OVERDUE" : order.status}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-3">
                  {/* Book Info */}
                  <div className="flex items-start gap-3">
                    <BookOpen className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-800">
                        {order.bookTitle || "Unknown Book"}
                      </p>
                      <p className="text-sm text-gray-600">
                        by {order.bookAuthor || "Unknown Author"}
                      </p>
                    </div>
                  </div>

                  {/* Date Info */}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Price Info */}
                  {order.totalPrice && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="font-semibold text-gray-800">
                        ${order.totalPrice.toFixed(2)}
                      </span>
                    </div>
                  )}

                  {/* Rental Info */}
                  {order.orderType === "RENT" && order.rentalStartDate && (
                    <div className="flex items-start gap-2 pt-2 border-t border-gray-200">
                      <RotateCcw className="h-4 w-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <div className="text-gray-600">Rental Period</div>
                        <div className="font-medium text-gray-800">
                          {order.rentalDays} days
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(order.rentalStartDate).toLocaleDateString()}{" "}
                          →{" "}
                          {new Date(
                            order.rentalEndDate || ""
                          ).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Footer - Actions */}
                <div className="bg-gray-50 px-4 py-3 flex gap-2">
                  {order.status === "PENDING" && (
                    <>
                      <button className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors font-medium">
                        Pay Now
                      </button>
                      <button className="flex-1 px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors font-medium">
                        Cancel
                      </button>
                    </>
                  )}
                  {order.orderType === "RENT" &&
                    order.status !== "CANCELLED" &&
                    order.status !== "RETURNED" && (
                      <button className="flex-1 px-3 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors font-medium">
                        Extend Rental
                      </button>
                    )}
                  <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
