import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  BookOpen,
  Users,
  Star,
  TrendingUp,
  Clock,
  Heart,
} from "lucide-react";
import { bookSharedService } from "../../services/shared/BookSharedService";

export default function Home() {
  const [featuredBooks, setFeaturedBooks] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch books and categories on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [booksData, categoriesData] = await Promise.all([
          bookSharedService.getAllBooks({ page: 0, size: 6 }),
          bookSharedService.getBookCategories(),
        ]);
        setFeaturedBooks(booksData.content || []);
        setCategories(categoriesData || []);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load books and categories");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats = [
    {
      icon: BookOpen,
      label: "Total Books",
      value: "10,000+",
      color: "bg-blue-500",
    },
    {
      icon: Users,
      label: "Active Readers",
      value: "5,000+",
      color: "bg-green-500",
    },
    { icon: Star, label: "Reviews", value: "25,000+", color: "bg-yellow-500" },
    {
      icon: TrendingUp,
      label: "Books Borrowed",
      value: "1,500+",
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header removed; using global layout header */}

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Discover Your Next
              <span className="text-yellow-300"> Great Read</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Explore thousands of books, join reading communities, and track
              your literary journey
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/books"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Browse Books
              </Link>
              <Link
                to="/library"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                My Library
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 -mt-10 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg p-6 text-center"
              >
                <div
                  className={`${stat.color} rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4`}
                >
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Books Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Featured Books</h2>
            <Link
              to="/books"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              View All →
            </Link>
          </div>
          {loading && (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading featured books...</p>
            </div>
          )}
          {error && (
            <div className="text-center py-8">
              <p className="text-red-600">{error}</p>
            </div>
          )}
          {!loading && featuredBooks.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-600">No books available</p>
            </div>
          )}
          {!loading && featuredBooks.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredBooks.map((book: any) => (
                <div
                  key={book.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <div className="aspect-w-3 aspect-h-4 bg-gradient-to-br from-blue-100 to-purple-100 h-48 flex items-center justify-center">
                    <BookOpen className="h-20 w-20 text-blue-400" />
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-lg mb-2 line-clamp-2">
                      {book.title}
                    </h3>
                    <p className="text-gray-600 mb-2">by {book.author}</p>
                    <div className="flex items-center mb-3">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(book.rating || 0)
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600 ml-2">
                        ({book.reviews || 0} reviews)
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {book.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-blue-600">
                        ${book.price || "0.00"}
                      </span>
                      <Link
                        to={`/books/${book.id}`}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Explore by Category
          </h2>
          {categories.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading categories...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {categories.slice(0, 8).map((category: any, index: number) => (
                <Link
                  key={category.id || index}
                  to={`/books?category=${encodeURIComponent(
                    category.name || category
                  )}`}
                  className="group bg-white rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
                >
                  <div
                    className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-gradient-to-r ${
                      [
                        "from-red-400 to-red-600",
                        "from-blue-400 to-blue-600",
                        "from-green-400 to-green-600",
                        "from-purple-400 to-purple-600",
                        "from-yellow-400 to-yellow-600",
                        "from-pink-400 to-pink-600",
                        "from-indigo-400 to-indigo-600",
                        "from-teal-400 to-teal-600",
                      ][index]
                    }`}
                  >
                    <BookOpen className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {category.name || category}
                  </h3>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <BookOpen className="h-8 w-8 text-blue-400" />
                <span className="text-2xl font-bold">MyBook</span>
              </div>
              <p className="text-gray-400">
                Your gateway to endless stories and knowledge.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link
                    to="/books"
                    className="hover:text-white transition-colors"
                  >
                    Browse Books
                  </Link>
                </li>
                <li>
                  <Link
                    to="/library"
                    className="hover:text-white transition-colors"
                  >
                    My Library
                  </Link>
                </li>
                <li>
                  <Link
                    to="/profile"
                    className="hover:text-white transition-colors"
                  >
                    Profile
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Follow Us</h3>
              <p className="text-gray-400">
                Stay updated with the latest books and reviews.
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 MyBook. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
