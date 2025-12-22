import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit2,
  Trash2,
  BookOpen,
  Star,
  MessageSquare,
  Send,
} from "lucide-react";
import { bookSharedService, Book } from "../../services/shared/BookSharedService";
import { reviewService, Review } from "../../services/user/ReviewingService";
import { bookManagementService } from "../../services/admin/BookManagementService";

export default function AdminBookDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [book, setBook] = useState<Book | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminResponse, setAdminResponse] = useState("");
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchData(id);
    }
  }, [id]);

  const fetchData = async (bookId: string) => {
    try {
      setLoading(true);
      const [bookData, reviewsData] = await Promise.all([
        bookSharedService.getBookById(bookId),
        reviewService.getReviews(bookId),
      ]);
      setBook(bookData);
      setReviews(reviewsData || []);
    } catch (error) {
      console.error("Error fetching admin book details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !window.confirm("Are you sure you want to delete this book?")) return;
    try {
      await bookManagementService.deleteBook(id);
      navigate("/admin/books");
    } catch (error) {
      console.error("Error deleting book:", error);
    }
  };

  const handleResponseSubmit = async (reviewId: string) => {
    // Placeholder for admin response logic (if backend supported it)
    console.log("Submitting admin response for review:", reviewId, adminResponse);
    setAdminResponse("");
    setSelectedReviewId(null);
    alert("Response submitted (Placeholder)");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="p-8 text-center text-gray-500">
        Book not found.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate("/admin/books")}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Book Management
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Book Header Section */}
        <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-64 flex-shrink-0">
            {book.thumbnailUrl ? (
              <img
                src={book.thumbnailUrl}
                alt={book.title}
                className="w-full h-96 object-cover rounded-xl shadow-lg"
              />
            ) : (
              <div className="w-full h-96 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                 <BookOpen className="h-16 w-16" />
              </div>
            )}
          </div>

          <div className="flex-1">
            <div className="flex justify-between items-start">
               <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{book.title}</h1>
                  <p className="text-xl text-gray-600 mb-4">by {book.author}</p>
               </div>
               <div className="flex gap-2">
                 <button 
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors bg-white border border-gray-200"
                    title="Edit Book"
                 >
                    <Edit2 className="h-5 w-5" />
                 </button>
                 <button 
                    onClick={handleDelete}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors bg-white border border-gray-200"
                    title="Delete Book"
                 >
                    <Trash2 className="h-5 w-5" />
                 </button>
               </div>
            </div>

            <div className="flex flex-wrap gap-3 mb-6">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                {book.categories?.[0] || 'Uncategorized'}
              </span>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                Rating: {book.averageRating || "N/A"}
              </span>
            </div>

            <div className="prose max-w-none text-gray-600 mb-8">
              <p>{book.description || "No description available."}</p>
            </div>

            <div className="grid grid-cols-2 gap-6 bg-gray-50 p-6 rounded-xl">
               <div>
                 <p className="text-sm text-gray-500 uppercase tracking-wide font-semibold">ISBN</p>
                 <p className="font-mono text-gray-900">{String(book.id).substring(0, 13) || "N/A"}</p>
               </div>
               <div>
                 <p className="text-sm text-gray-500 uppercase tracking-wide font-semibold">Status</p>
                 <p className="text-gray-900 font-medium">Available</p>
               </div>
            </div>
          </div>
        </div>

        {/* Reviews & Moderation Section */}
        <div className="p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-purple-600" />
            User Reviews & Moderation
          </h2>

          <div className="space-y-6">
            {reviews.length === 0 ? (
                <p className="text-gray-500">No reviews yet.</p>
            ) : (
                reviews.map((review) => (
                    <div key={review.id} className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                                    {review.userId.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900">User ID: {review.userId}</p>
                                    <div className="flex items-center gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star 
                                              key={i} 
                                              className={`h-3 w-3 ${i < review.rating ? "text-yellow-400 fill-current" : "text-gray-300"}`} 
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <span className="text-sm text-gray-400">
                                {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                        
                        <p className="text-gray-700 mb-4 pl-13">{review.comment}</p>

                        {/* Admin Action Area */}
                        <div className="mt-4 border-t border-gray-200 pt-4 flex items-center justify-end">
                            {selectedReviewId === review.id ? (
                                <div className="w-full flex gap-2">
                                    <input 
                                        type="text" 
                                        value={adminResponse}
                                        onChange={(e) => setAdminResponse(e.target.value)}
                                        placeholder="Write an official response..."
                                        className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                    <button 
                                        onClick={() => handleResponseSubmit(review.id)}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                                    >
                                        <Send className="h-4 w-4" /> Reply
                                    </button>
                                    <button 
                                        onClick={() => setSelectedReviewId(null)}
                                        className="text-gray-500 px-3 hover:bg-gray-200 rounded-lg"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <button 
                                    onClick={() => setSelectedReviewId(review.id)}
                                    className="text-blue-600 hover:underline text-sm font-medium"
                                >
                                    Reply as Admin
                                </button>
                            )}
                        </div>
                    </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
