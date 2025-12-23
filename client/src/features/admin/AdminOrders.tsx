import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orderService, Order } from "../../services/user/OrderService";
import { Check, X, Clock, DollarSign, User, Calendar, BookOpen } from "lucide-react";

export default function AdminOrders() {
  const qc = useQueryClient();
  const [processingId, setProcessingId] = useState<number | null>(null);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const data = await orderService.getPendingOrders();
      return data || [];
    },
  });

  const handleApprove = async (id: number) => {
    if (!window.confirm("Approve this order?")) return;
    setProcessingId(id);
    try {
      await orderService.approveOrder(id);
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
      alert("Order Approved!");
    } catch (error) {
      console.error(error);
      alert("Failed to approve order");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: number) => {
    if (!window.confirm("Reject this order? This cannot be undone.")) return;
    setProcessingId(id);
    try {
        await orderService.rejectOrder(id);
        qc.invalidateQueries({ queryKey: ["admin-orders"] });
        alert("Order Rejected!");
    } catch (error) {
        console.error(error);
        alert("Failed to reject order");
    } finally {
        setProcessingId(null);
    }
  };

  if (isLoading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Order Approval</h1>
      
      {orders.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
          No pending orders to review.
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {orders.map((order) => (
              <li key={order.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-4 mb-2">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Pending Approval
                      </span>
                      <span className="text-sm text-gray-500">
                        Order #{order.id}
                      </span>
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                         {new Date(order.createdAt).toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                             <h4 className="text-sm font-medium text-gray-900 mb-2">Customer</h4>
                             <div className="flex items-center gap-2 text-gray-600">
                                <User className="w-4 h-4" />
                                {order.userId}
                             </div>
                        </div>
                        <div>
                             <h4 className="text-sm font-medium text-gray-900 mb-2">Items</h4>
                             <ul className="space-y-1">
                                {order.items?.map((item, idx) => (
                                    <li key={idx} className="text-sm text-gray-600 flex items-center gap-2">
                                        <BookOpen className="w-4 h-4" />
                                        {item.book?.title} - ${item.price}
                                    </li>
                                ))}
                             </ul>
                             <div className="mt-2 font-bold text-gray-900 flex items-center gap-1">
                                <DollarSign className="w-4 h-4" />
                                Total: ${order.totalPrice}
                             </div>
                        </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 ml-6">
                    <button
                      onClick={() => handleApprove(order.id)}
                      disabled={processingId === order.id}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(order.id)}
                      disabled={processingId === order.id}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Reject
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
