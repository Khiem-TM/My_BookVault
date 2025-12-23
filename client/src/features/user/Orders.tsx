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
  ShoppingBag,
  Wallet,
  AlertCircle,
  Trash2,
} from "lucide-react";

export default function Orders() {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<"CART" | "PENDING" | "COMPLETED" | "CANCELLED">("CART");
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
              // Switch to pending approval tab after payment
              setActiveTab("PENDING");
              alert("Payment confirmed pending approval");
          } catch (e) {
              alert("Error confirming payment");
          }
      }
  };

  const handleCancelOrder = async (orderId: number) => {
    // Ideally we'd have an API to cancel, for now we will just show an alert or if there is an endpoint use it.
    // Assuming rejectOrder is admin only, user cancellation might not be implemented or reuse same logic if allowed.
    // For safety, we won't call rejectOrder here without confirmation it's user-accessible.
    alert("Cancellation feature coming soon!");
  };

  // Filter logic based on tabs
  const filteredOrders = (orders || []).filter((order) => {
    let statusMatch = false;
    switch (activeTab) {
        case "CART":
            // "Cart" basically means unpaid orders
            statusMatch = order.status === "PENDING_PAYMENT" || order.status === "DRAFT";
            break;
        case "PENDING":
            // Paid but waiting approval
            statusMatch = order.status === "PENDING_APPROVAL";
            break;
        case "COMPLETED":
            statusMatch = order.status === "COMPLETED";
            break;
        case "CANCELLED":
            statusMatch = order.status === "CANCELLED";
            break;
    }

    const matchesSearch =
      !searchTerm ||
      order.id.toString().includes(searchTerm) ||
      (order.items && order.items.some((item: any) => item.book?.title?.toLowerCase().includes(searchTerm.toLowerCase())));
      
    return statusMatch && matchesSearch;
  });

  const stats = {
    cart: orders?.filter(o => o.status === "PENDING_PAYMENT" || o.status === "DRAFT").length || 0,
    pending: orders?.filter(o => o.status === "PENDING_APPROVAL").length || 0,
    completed: orders?.filter(o => o.status === "COMPLETED").length || 0,
    cancelled: orders?.filter(o => o.status === "CANCELLED").length || 0,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <ShoppingBag className="h-8 w-8 text-blue-600" />
              My Orders
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your purchases and track order status
            </p>
          </div>
          
          <div className="relative w-64">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
             <input 
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
             />
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-1 mb-8 flex overflow-x-auto">
            <button
                onClick={() => setActiveTab("CART")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
                    activeTab === "CART" 
                    ? "bg-blue-50 text-blue-700 shadow-sm" 
                    : "text-gray-600 hover:bg-gray-50"
                }`}
            >
                <Wallet className="h-4 w-4" />
                To Pay ({stats.cart})
            </button>
            <button
                onClick={() => setActiveTab("PENDING")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
                    activeTab === "PENDING" 
                    ? "bg-yellow-50 text-yellow-700 shadow-sm" 
                    : "text-gray-600 hover:bg-gray-50"
                }`}
            >
                <Clock className="h-4 w-4" />
                Pending Approval ({stats.pending})
            </button>
            <button
                onClick={() => setActiveTab("COMPLETED")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
                    activeTab === "COMPLETED" 
                    ? "bg-green-50 text-green-700 shadow-sm" 
                    : "text-gray-600 hover:bg-gray-50"
                }`}
            >
                <CheckCircle className="h-4 w-4" />
                Completed ({stats.completed})
            </button>
            <button
                onClick={() => setActiveTab("CANCELLED")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
                    activeTab === "CANCELLED" 
                    ? "bg-red-50 text-red-700 shadow-sm" 
                    : "text-gray-600 hover:bg-gray-50"
                }`}
            >
                <XCircle className="h-4 w-4" />
                Cancelled ({stats.cancelled})
            </button>
        </div>

        {/* Orders List */}
        {isLoading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-500">Loading your orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
            <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900">No orders found</h3>
            <p className="text-gray-500 mt-2 mb-6">
                {activeTab === "CART" ? "Your shopping cart is empty." : "No orders in this category."}
            </p>
            <Link
              to="/books"
              className="inline-flex items-center px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200"
              >
                {/* Order Header */}
                <div className="px-6 py-4 border-b border-gray-50 flex flex-wrap items-center justify-between gap-4 bg-gray-50/50">
                    <div className="flex items-center gap-4">
                        <span className="font-semibold text-gray-900">Order #{order.id}</span>
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        {statusLabels[order.status]}
                    </div>
                </div>

                {/* Order Items */}
                <div className="p-6">
                    <div className="space-y-4">
                        {order.items && order.items.map((item: any, idx: number) => (
                            <div key={idx} className="flex gap-4">
                                <div className="h-20 w-14 bg-gray-100 rounded-md flex items-center justify-center flex-shrink-0 overflow-hidden border border-gray-200">
                                   {item.book?.thumbnailUrl ? (
                                       <img src={item.book.thumbnailUrl} alt="" className="h-full w-full object-cover" />
                                   ) : (
                                       <BookOpen className="h-6 w-6 text-gray-400" />
                                   )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-gray-900 truncate">
                                        {item.book?.title || "Unknown Book"}
                                    </h4>
                                    <p className="text-sm text-gray-500 mt-0.5">
                                        {item.book?.author || "Unknown Author"}
                                    </p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                                            item.bookType === "FREE" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                                        }`}>
                                            {item.bookType}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-gray-900">
                                        ${Number(item.price).toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer / Actions */}
                <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-50 flex items-center justify-between">
                    <div className="text-gray-600">
                        Total: <span className="text-xl font-bold text-gray-900 ml-2">${Number(order.totalPrice).toFixed(2)}</span>
                    </div>

                    <div className="flex gap-3">
                        {order.status === "PENDING_PAYMENT" && (
                            <>
                                <button
                                    onClick={() => handleCancelOrder(order.id)}
                                    className="px-4 py-2 text-gray-600 hover:text-red-600 font-medium text-sm transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handlePayNow(order.id)}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm shadow-sm shadow-blue-200 transition-all active:scale-95"
                                >
                                    Pay Now
                                </button>
                            </>
                        )}
                        {order.status === "COMPLETED" && (
                            <Link 
                                to={`/books`} // Or link to the specific book if single item
                                className="px-6 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm transition-colors"
                            >
                                Buy Again / View
                            </Link>
                        )}
                        {order.status === "CANCELLED" && (
                             <span className="text-sm text-gray-500 italic">Order cancelled</span>
                        )}
                    </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const statusLabels: Record<string, React.ReactNode> = {
    "PENDING_PAYMENT": <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">Unpaid</span>,
    "PENDING_APPROVAL": <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 border border-yellow-200">Processing</span>,
    "COMPLETED": <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">Completed</span>,
    "CANCELLED": <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">Cancelled</span>,
    "DRAFT": <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">Draft</span>
};
