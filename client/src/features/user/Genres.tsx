import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Search,
  Filter,
  Grid,
  List,
  Star,
  Users,
  TrendingUp,
  Clock,
  Heart,
  Award,
} from "lucide-react";
import { categories, seedBooks } from "../../data/seedBooks";

interface GenreStats {
  name: string;
  description: string;
  icon: string;
  bookCount: number;
  averageRating: number;
  totalReaders: number;
  trending: boolean;
  popularBooks: typeof seedBooks;
}

export default function Genres() {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"name" | "popularity" | "books">(
    "popularity"
  );

  // Generate genre statistics
  const genreStats: GenreStats[] = categories.map((category) => {
    const categoryBooks = seedBooks.filter(
      (book) => book.category === category
    );
    const averageRating =
      categoryBooks.length > 0
        ? categoryBooks.reduce((sum, book) => sum + book.rating, 0) /
          categoryBooks.length
        : 0;

    return {
      name: category,
      description: getGenreDescription(category),
      icon: getGenreIcon(category),
      bookCount: categoryBooks.length,
      averageRating: Math.round(averageRating * 10) / 10,
      totalReaders: Math.floor(Math.random() * 10000) + 1000, // Mock data
      trending: Math.random() > 0.6, // Random trending status
      popularBooks: categoryBooks
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 3),
    };
  });

  const filteredGenres = genreStats
    .filter(
      (genre) =>
        genre.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        genre.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "books":
          return b.bookCount - a.bookCount;
        case "popularity":
        default:
          return b.totalReaders - a.totalReaders;
      }
    });

  function getGenreDescription(genre: string): string {
    const descriptions: { [key: string]: string } = {
      "Classic Literature":
        "Timeless works that have shaped literature and continue to inspire readers across generations.",
      "Science Fiction":
        "Imaginative stories exploring future worlds, advanced technology, and the possibilities of science.",
      Romance:
        "Stories of love, passion, and relationships that touch the heart and soul.",
      Fantasy:
        "Magical realms, mythical creatures, and epic adventures in worlds beyond imagination.",
      Mystery:
        "Intriguing puzzles, suspenseful plots, and the thrill of solving complex crimes.",
      Philosophy:
        "Deep thoughts and wisdom about life, existence, morality, and the human condition.",
      Biography:
        "Real-life stories of remarkable people and their extraordinary journeys.",
      "Self-Help":
        "Practical guidance and inspiration for personal growth and life improvement.",
      History:
        "Fascinating accounts of past events, civilizations, and the lessons they teach us.",
      Adventure:
        "Thrilling journeys, daring exploits, and exciting quests in exotic locations.",
    };
    return (
      descriptions[genre] || "Discover amazing books in this captivating genre."
    );
  }

  function getGenreIcon(genre: string): string {
    const icons: { [key: string]: string } = {
      "Classic Literature": "📚",
      "Science Fiction": "🚀",
      Romance: "💕",
      Fantasy: "🧙‍♂️",
      Mystery: "🔍",
      Philosophy: "🤔",
      Biography: "👤",
      "Self-Help": "💪",
      History: "🏛️",
      Adventure: "🗺️",
    };
    return icons[genre] || "📖";
  }

  const totalBooks = seedBooks.length;
  const totalReaders = genreStats.reduce(
    (sum, genre) => sum + genre.totalReaders,
    0
  );
  const averageRating =
    Math.round(
      (seedBooks.reduce((sum, book) => sum + book.rating, 0) /
        seedBooks.length) *
        10
    ) / 10;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Book Genres
                </h1>
                <p className="text-gray-600">
                  Explore diverse categories and find your next great read
                </p>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="hidden md:flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {categories.length}
                </div>
                <div className="text-sm text-gray-600">Genres</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {totalBooks}
                </div>
                <div className="text-sm text-gray-600">Books</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {averageRating}★
                </div>
                <div className="text-sm text-gray-600">Avg Rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search and Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search genres..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="popularity">Most Popular</option>
              <option value="name">Name (A-Z)</option>
              <option value="books">Most Books</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 ${
                viewMode === "grid"
                  ? "bg-purple-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 ${
                viewMode === "list"
                  ? "bg-purple-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Empty State */}
        {filteredGenres.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No genres found
            </h3>
            <p className="text-gray-600">Try adjusting your search terms</p>
          </div>
        )}

        {/* Genres Grid/List */}
        {filteredGenres.length > 0 && (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                : "space-y-6"
            }
          >
            {filteredGenres.map((genre) => (
              <div
                key={genre.name}
                className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden ${
                  viewMode === "list" ? "flex" : ""
                }`}
              >
                {/* Genre Icon/Header */}
                <div
                  className={`bg-gradient-to-r from-purple-500 to-pink-500 ${
                    viewMode === "list" ? "w-32 flex-shrink-0" : "h-32"
                  } flex items-center justify-center relative`}
                >
                  <div className="text-4xl">{genre.icon}</div>
                  {genre.trending && (
                    <div className="absolute top-3 right-3">
                      <span className="bg-yellow-400 text-yellow-900 text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        Trending
                      </span>
                    </div>
                  )}
                </div>

                {/* Genre Content */}
                <div className={`p-6 ${viewMode === "list" ? "flex-1" : ""}`}>
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-gray-900">
                      {genre.name}
                    </h3>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium">
                        {genre.averageRating}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                    {genre.description}
                  </p>

                  {/* Genre Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <BookOpen className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="text-lg font-bold text-blue-600">
                        {genre.bookCount}
                      </div>
                      <div className="text-xs text-blue-700">Books</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Users className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="text-lg font-bold text-green-600">
                        {genre.totalReaders.toLocaleString()}
                      </div>
                      <div className="text-xs text-green-700">Readers</div>
                    </div>
                  </div>

                  {/* Popular Books Preview */}
                  {genre.popularBooks.length > 0 && viewMode === "grid" && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">
                        Popular Books:
                      </h4>
                      <div className="space-y-1">
                        {genre.popularBooks.slice(0, 2).map((book) => (
                          <Link
                            key={book.id}
                            to={`/books/${book.id}`}
                            className="block text-xs text-blue-600 hover:text-blue-800 truncate"
                          >
                            • {book.title}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <Link
                    to={`/books?category=${encodeURIComponent(genre.name)}`}
                    className="block w-full bg-purple-600 text-white text-center py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium"
                  >
                    Explore {genre.name}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Featured Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Why Choose Different Genres?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white rounded-xl shadow-lg">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Find Your Passion</h3>
              <p className="text-gray-600 text-sm">
                Discover genres that resonate with your interests and expand
                your reading horizons.
              </p>
            </div>

            <div className="text-center p-6 bg-white rounded-xl shadow-lg">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Quality Content</h3>
              <p className="text-gray-600 text-sm">
                Each genre features carefully curated books with high ratings
                and positive reviews.
              </p>
            </div>

            <div className="text-center p-6 bg-white rounded-xl shadow-lg">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Always Fresh</h3>
              <p className="text-gray-600 text-sm">
                Our library is constantly updated with new releases and trending
                titles in every genre.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
