import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
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
import { seedBooks } from "../../data/seedBooks";
import { useAuthStore } from "../../store/authStore";

export default function BookDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const [book, setBook] = useState(seedBooks.find((b) => b.id === id));
  const [reviews, setReviews] = useState([
    {
      id: 1,
      user: "Alice Johnson",
      rating: 5,
      comment: "Absolutely brilliant! A masterpiece of literature.",
      date: "2024-01-15",
      verified: true,
    },
    {
      id: 2,
      user: "Bob Smith",
      rating: 4,
      comment:
        "Great read, highly recommend for anyone interested in classic literature.",
      date: "2024-01-10",
      verified: true,
    },
    {
      id: 3,
      user: "Carol Davis",
      rating: 5,
      comment:
        "One of the best books I've ever read. The character development is outstanding.",
      date: "2024-01-05",
      verified: false,
    },
  ]);
  const [selectedTab, setSelectedTab] = useState<
    "description" | "reviews" | "details"
  >("description");
  const [userReview, setUserReview] = useState({ rating: 5, comment: "" });
  const [isAddedToLibrary, setIsAddedToLibrary] = useState(false);
  const [relatedBooks] = useState(
    seedBooks
      .filter((b) => b.id !== id && b.category === book?.category)
      .slice(0, 4)
  );

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

  const handleBorrowBook = () => {
    // Simulate borrowing
    setIsAddedToLibrary(true);
    alert("Book added to your library!");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">MyBook</span>
            </Link>
            <nav className="hidden md:flex space-x-8">
              <Link
                to="/"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                Home
              </Link>
              <Link
                to="/books"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                Browse
              </Link>
              <Link
                to="/library"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                My Library
              </Link>
              <Link
                to="/profile"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                Profile
              </Link>
            </nav>
          </div>
        </div>
      </header>

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
              <div className="aspect-w-3 aspect-h-4 bg-gradient-to-br from-blue-100 to-purple-100 h-96 md:h-full flex items-center justify-center">
                <BookOpen className="h-24 w-24 text-blue-400" />
              </div>
            </div>

            {/* Book Info */}
            <div className="md:w-2/3 lg:w-3/4 p-8">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full mb-3">
                    {book.category}
                  </span>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                    {book.title}
                  </h1>
                  <p className="text-xl text-gray-600 mb-4">by {book.author}</p>
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
                        i < Math.floor(book.rating)
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-lg font-semibold">{book.rating}</span>
                <span className="text-gray-600">({book.reviews} reviews)</span>
              </div>

              {/* Price & Actions */}
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
                <div className="text-3xl font-bold text-blue-600">
                  ${book.price}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleBorrowBook}
                    disabled={isAddedToLibrary}
                    className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors ${
                      isAddedToLibrary
                        ? "bg-green-100 text-green-800 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    <BookOpen className="h-5 w-5" />
                    {isAddedToLibrary ? "In Library" : "Borrow Book"}
                  </button>
                  <button className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Buy Now
                  </button>
                  <button className="p-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                    <Share2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Quick Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span>{book.publisher}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(book.publishDate).getFullYear()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Package className="h-4 w-4" />
                  <span>{book.quantity} available</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <BookOpen className="h-4 w-4" />
                  <span>ISBN: {book.isbn}</span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {book.tags.map((tag) => (
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
                <p className="text-lg text-gray-700 leading-relaxed">
                  {book.description}
                </p>
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">
                    About this book
                  </h3>
                  <p className="text-blue-800">
                    This edition includes additional commentary and analysis,
                    making it perfect for both casual readers and students of
                    literature.
                  </p>
                </div>
              </div>
            )}

            {selectedTab === "reviews" && (
              <div>
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
                      <dd className="font-medium">{book.author}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Publisher:</dt>
                      <dd className="font-medium">{book.publisher}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Publication Date:</dt>
                      <dd className="font-medium">
                        {new Date(book.publishDate).toLocaleDateString()}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">ISBN:</dt>
                      <dd className="font-medium">{book.isbn}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Category:</dt>
                      <dd className="font-medium">{book.category}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Available Copies:</dt>
                      <dd className="font-medium">{book.quantity}</dd>
                    </div>
                  </dl>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Tags & Keywords
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {book.tags.map((tag) => (
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

        {/* Related Books */}
        {relatedBooks.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Related Books
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedBooks.map((relatedBook) => (
                <Link
                  key={relatedBook.id}
                  to={`/books/${relatedBook.id}`}
                  className="group"
                >
                  <div className="bg-gradient-to-br from-blue-100 to-purple-100 h-48 rounded-lg flex items-center justify-center mb-3 group-hover:shadow-md transition-shadow">
                    <BookOpen className="h-16 w-16 text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {relatedBook.title}
                  </h3>
                  <p className="text-gray-600 text-sm">{relatedBook.author}</p>
                  <p className="text-blue-600 font-semibold">
                    ${relatedBook.price}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
