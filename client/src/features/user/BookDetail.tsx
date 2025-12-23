import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Star,
  BookOpen,
  Heart,
  ShoppingCart,
  User,
  Calendar,
  Package,
  Share2,
  MessageCircle,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { bookSharedService } from "../../services/shared/BookSharedService";
import { reviewService } from "../../services/user/ReviewingService";
import { libraryService } from "../../services/user/LibraryService";
import { orderService } from "../../services/user/OrderService";

export default function BookDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [book, setBook] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<any[]>([]);
  const [selectedTab, setSelectedTab] = useState<
    "description" | "reviews" | "details"
  >("description");
  const [userReview, setUserReview] = useState({ rating: 5, comment: "" });
  const [isAddedToLibrary, setIsAddedToLibrary] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  // Fetch book details and reviews
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const [bookData, reviewsData] = await Promise.all([
          bookSharedService.getBookById(id),
          reviewService.getReviews(id).catch(() => [])
        ]);
        setBook(bookData);
        
        // Map reviews to UI format
        const mappedReviews = (reviewsData || []).map((r: any) => ({
            id: r.id,
            user: "User #" + r.userId, // We only have userId in ReviewDto
            rating: r.rating,
            comment: r.content,
            date: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'Recently',
            verified: true
        }));
        setReviews(mappedReviews);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  /* Check if book is already in library or ordered */
  useEffect(() => {
    const checkUserStatus = async () => {
      if (!user || !id) return;
      try {
        // We catch errors here silently as strictly failing to fetch "my books" shouldn't block the page
        const [myBooks, myOrders] = await Promise.all([
             libraryService.getMyBooks().catch(() => []),
             orderService.getMyOrders().catch(() => [])
        ]);

        const inLib = myBooks.some((item) => item.bookId.toString() === id.toString());
        setIsAddedToLibrary(inLib);

        // Check if there's a focused order for this book
        const existingOrder = myOrders.find((order: any) => 
            (order.items && order.items.some((item: any) => item.book?.id?.toString() === id.toString()))
        );
        
        // If pending order exists
        if (existingOrder && (existingOrder.status === 'PENDING_PAYMENT' || existingOrder.status === 'PENDING_APPROVAL')) {
             setIsPending(true);
        }
      } catch (err) {
        console.warn("Could not check library status:", err);
      }
    };
    
    checkUserStatus();
  }, [id, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Book not found
          </h2>
          <p className="text-gray-600 mb-4">
            The book you're looking for doesn't exist.
          </p>
          <Link to="/books" className="text-blue-600 hover:text-blue-800">
            ← Back to Books
          </Link>
        </div>
      </div>
    );
  }

  const handleAddReview = () => {
    if (userReview.comment.trim()) {
      const newReview = {
        id: Date.now(),
        user: user?.firstName + " " + user?.lastName || "You",
        rating: userReview.rating,
        comment: userReview.comment,
        date: new Date().toISOString().split("T")[0],
        verified: true,
      };
      setReviews([newReview, ...reviews]);
      setUserReview({ rating: 5, comment: "" });
    }
  };

  const handleBorrowBook = async () => {
     // For now, Borrow behaves same as Buy (adds to library if free, creates order if paid)
     await handleBuyBook();
  };

  const handleBuyBook = async () => {
    if (!user) {
        alert("Please login to buy books");
        return;
    }

    setLoading(true);
    try {
        const { isCompleted } = await orderService.checkout([Number(id)]);
        
        if (isCompleted) {
             alert("Book purchased successfully! It has been added to your library.");
             setIsAddedToLibrary(true);
        } else {
             alert("Order created successfully. Please confirm your payment in 'My Orders'.");
             navigate("/profile/orders");
        }
    } catch (error: any) {
        console.error("Error buying book:", error);
        alert("Failed to process purchase: " + (error.response?.data?.message || "Unknown error"));
    } finally {
        setLoading(false);
    }
  };

  // Helper values
  const imageUrl = book.thumbnailUrl || "/api/placeholder/400/600";
  const author = book.author || "Unknown Author";
  const rating = book.averageRating || 0;
  const reviewCount = book.ratingsCount || 0;
  const price = book.price || "Free";
  const categories = book.categories || [];
  const publishedDate = book.publishedAt || book.publishDate;

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link to="/" className="hover:text-blue-600">
            Home
          </Link>
          <span>/</span>
          <Link to="/books" className="hover:text-blue-600">
            Books
          </Link>
          <span>/</span>
          <span className="text-gray-900">{book.title}</span>
        </nav>

        {/* Back Button */}
        <Link
          to="/books"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Books
        </Link>

        {/* Book Details */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="md:flex">
            {/* Book Cover */}
            <div className="md:w-1/3 lg:w-1/4">
              <div className="aspect-w-3 aspect-h-4 bg-gray-100 h-96 md:h-full flex items-center justify-center relative overflow-hidden">
                <img 
                    src={imageUrl} 
                    alt={book.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = "/api/placeholder/400/600";
                    }}
                 />
              </div>
            </div>

            {/* Book Info */}
            <div className="md:w-2/3 lg:w-3/4 p-8">
              <div className="flex justify-between items-start mb-4">
                <div>
                  {categories.length > 0 && (
                    <span className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full mb-3">
                        {categories[0]}
                    </span>
                  )}
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                    {book.title}
                  </h1>
                  <p className="text-xl text-gray-600 mb-4">by {author}</p>
                </div>
                <button className="p-3 text-gray-400 hover:text-red-500 transition-colors">
                  <Heart className="h-6 w-6" />
                </button>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(rating)
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-lg font-semibold">{rating}</span>
                <span className="text-gray-600">({reviewCount} reviews)</span>
              </div>

              {/* Price & Actions */}
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
                <div className="text-3xl font-bold text-blue-600">
                  {typeof price === 'number' ? `$${price}` : price}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowConfirmModal(true)}
                    disabled={isAddedToLibrary || isPending}
                    className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors ${
                      isAddedToLibrary || isPending
                        ? "bg-green-100 text-green-800 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    <BookOpen className="h-5 w-5" />
                    {isAddedToLibrary ? "In Library" : isPending ? "Pending Approval" : "Borrow Book"}
                  </button>
                  <button className="p-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                    <Share2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

               {/* Confirm Modal */}
               {showConfirmModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-fade-in">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Confirm Order</h3>
                        
                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between items-center py-2 border-b">
                                <span className="text-gray-600">Book</span>
                                <span className="font-medium text-right text-gray-900 truncate max-w-[200px]">{book.title}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b">
                                <span className="text-gray-600">Price</span>
                                <span className="font-bold text-blue-600">${price}</span>
                            </div>
                            <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
                                This order will be submitted for approval. You can manage your orders in your profile.
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button 
                                onClick={() => setShowConfirmModal(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={() => {
                                    setShowConfirmModal(false);
                                    handleBuyBook();
                                }}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                            >
                                Confirm Order
                            </button>
                        </div>
                    </div>
                </div>
               )}

              {/* Quick Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span>{book.publisher || "Unknown Publisher"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>{publishedDate ? new Date(publishedDate).getFullYear() : "N/A"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Package className="h-4 w-4" />
                  <span>{book.pageCount ? `${book.pageCount} pages` : "Unknown pages"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <BookOpen className="h-4 w-4" />
                  <span>ISBN: {book.isbn}</span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {categories.map((tag: string) => (
                  <span
                    key={tag}
                    className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-8">
          {/* Tab Headers */}
          <div className="border-b border-gray-200">
            <div className="flex space-x-8 px-8">
              {[
                { id: "description", label: "Description" },
                { id: "reviews", label: `Reviews (${reviews.length})` },
                { id: "details", label: "Details" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id as any)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    selectedTab === tab.id
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {selectedTab === "description" && (
              <div className="prose max-w-none">
                <div className="text-lg text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: book.description || "No description available." }} />
              </div>
            )}

            {selectedTab === "reviews" && (
              <div>
                {/* Add Review Form */}
                <div className="bg-gray-50 rounded-xl p-6 mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Write a Review
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rating
                      </label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setUserReview({ ...userReview, rating: star })}
                            className="focus:outline-none"
                          >
                            <Star
                              className={`h-6 w-6 ${
                                star <= userReview.rating
                                  ? "text-yellow-400 fill-current"
                                  : "text-gray-300"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Your Review
                      </label>
                      <textarea
                        value={userReview.comment}
                        onChange={(e) =>
                          setUserReview({ ...userReview, comment: e.target.value })
                        }
                        rows={4}
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Tell us what you thought about this book..."
                      />
                    </div>
                    <button
                      onClick={handleAddReview}
                      disabled={!userReview.comment.trim()}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                    >
                      Post Review
                    </button>
                  </div>
                </div>

                {/* Reviews List */}
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="border-b border-gray-200 pb-6"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {review.user}
                            </h4>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < review.rating
                                        ? "text-yellow-400 fill-current"
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                              {review.verified && (
                                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                                  Verified
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">
                          {review.date}
                        </span>
                      </div>
                      <p className="text-gray-700 ml-13">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedTab === "details" && (
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Book Information
                  </h3>
                  <dl className="space-y-3">
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Author:</dt>
                      <dd className="font-medium">{author}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Publisher:</dt>
                      <dd className="font-medium">{book.publisher || "N/A"}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Publication Date:</dt>
                      <dd className="font-medium">
                        {publishedDate ? new Date(publishedDate).toLocaleDateString() : "N/A"}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">ISBN:</dt>
                      <dd className="font-medium">{book.isbn}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Language:</dt>
                      <dd className="font-medium">{book.language || "English"}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Page Count:</dt>
                      <dd className="font-medium">{book.pageCount || "N/A"}</dd>
                    </div>
                  </dl>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Tags & Keywords
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((tag: string) => (
                      <span
                        key={tag}
                        className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
