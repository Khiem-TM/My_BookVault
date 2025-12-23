import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { orderService, Order } from "../../services/user/OrderService";
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

export default function Orders() {
  const qc = useQueryClient();
  const userId = "1"; // TODO: get from auth store
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [orderTypeFilter, setOrderTypeFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      try {
        const data = await orderService.getMyOrders();
        return data || [];
      } catch (err) {
        console.error("Failed to fetch orders", err);
        return [];
      }
    },
  });

  const handlePayNow = async (orderId: number) => {
      if (window.confirm("Confirm manual payment for this order?")) {
          try {
              await orderService.manualConfirm(orderId);
              qc.invalidateQueries({ queryKey: ["orders"] });
              alert("Payment confirmed pending approval");
          } catch (e) {
              alert("Error confirming payment");
          }
      }
  };

  // Filter logic
  const filteredOrders = (orders || []).filter((order) => {
    const matchesStatus =
      statusFilter === "ALL" || order.status === statusFilter;
    // const matchesType = orderTypeFilter === "ALL" || order.orderType === orderTypeFilter; // We don't have orderType yet in new Order entity
    const matchesType = true; 
    const matchesSearch =
      !searchTerm ||
      order.id.toString().includes(searchTerm) ||
      (order.items && order.items.some((item: any) => item.book?.title?.toLowerCase().includes(searchTerm.toLowerCase())));
    return matchesStatus && matchesType && matchesSearch;
  });

  // Calculate stats
  const stats = {
    total: orders?.length || 0,
    pending: orders?.filter((o) => o.status === "PENDING_PAYMENT" || o.status === "PENDING_APPROVAL").length || 0,
    rentals: 0, // orders?.filter((o) => o.orderType === "RENT").length || 0,
    purchases: orders?.length || 0, // Assuming all are purchases for now
  };

  // Check if rental is overdue
  const isOverdue = (order: Order) => {
    return false; // Not implementing rentals yet
  };

  // Status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "PENDING_PAYMENT":
        return "bg-yellow-100 text-yellow-800";
      case "PENDING_APPROVAL":
        return "bg-blue-100 text-blue-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle className="h-5 w-5" />;
      case "PENDING_PAYMENT":
      case "PENDING_APPROVAL":
        return <Clock className="h-5 w-5" />;
      case "CANCELLED":
        return <XCircle className="h-5 w-5" />;
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
                Track your book purchases
              </p>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="hidden md:grid grid-cols-3 gap-4">
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
              <div className="text-2xl font-bold text-green-600">
                {stats.purchases}
              </div>
              <div className="text-sm text-gray-600">Purchases</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <option value="PENDING_PAYMENT">Pending Payment</option>
              <option value="PENDING_APPROVAL">Pending Approval</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
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
              {searchTerm || statusFilter !== "ALL"
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
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(order.status)}
                      <div>
                        <p className="font-semibold">Order #{order.id}</p>
                        <p className="text-sm opacity-90">
                           Purchase
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-3">
                  {/* Book Info - Multiple Items Support */}
                  {order.items && order.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-start gap-3 mb-2">
                        <BookOpen className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                        <p className="font-semibold text-gray-800">
                            {item.book?.title || "Unknown Book"}
                        </p>
                        <p className="text-sm text-gray-600">
                            by {item.book?.author || "Unknown Author"}
                        </p>
                         <p className="text-xs text-gray-500">
                            Type: {item.bookType} - ${item.price}
                         </p>
                        </div>
                    </div>
                  ))}
                  

                  {/* Date Info */}
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Price Info */}
                  {order.totalPrice !== undefined && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="font-semibold text-gray-800">
                        ${Number(order.totalPrice).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Footer - Actions */}
                <div className="bg-gray-50 px-4 py-3 flex gap-2">
                  {order.status === "PENDING_PAYMENT" && (
                    <>
                      <button 
                        onClick={() => handlePayNow(order.id)}
                        className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors font-medium"
                      >
                        Pay Now
                      </button>
                      <button className="flex-1 px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors font-medium">
                        Cancel
                      </button>
                    </>
                  )}
                  {order.status === "PENDING_APPROVAL" && (
                       <div className="w-full text-center text-sm text-blue-600 font-medium py-2">
                           Waiting for Admin Approval
                       </div>
                  )}
                  {order.status === "COMPLETED" && (
                    <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm">
                        View Details
                    </button>
                   )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
