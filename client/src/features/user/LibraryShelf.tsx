import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../services/apiClient";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Heart,
  Book,
  CheckCircle,
  Eye,
  Grid,
  List,
  Search,
  Filter,
} from "lucide-react";
import { seedBooks } from "../../data/seedBooks";

interface LibraryItem {
  id: string;
  bookId: string;
  shelf: "WISHLIST" | "READING" | "READ";
  addedDate: string;
  progress?: number;
}

export default function LibraryShelf() {
  const [shelf, setShelf] = useState<"WISHLIST" | "READING" | "READ">(
    "WISHLIST"
  );
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const userId = 1;

  const { data, isLoading, error } = useQuery({
    queryKey: ["library", userId, shelf],
    queryFn: async () =>
      (await api.get(`/library/items/by-shelf`, { params: { userId, shelf } }))
        .data,
  });

  // Mock data for demo purposes when API returns empty
  const mockLibraryItems: LibraryItem[] = [
    { id: "1", bookId: "1", shelf: "WISHLIST", addedDate: "2024-12-01" },
    {
      id: "2",
      bookId: "2",
      shelf: "READING",
      addedDate: "2024-11-15",
      progress: 45,
    },
    { id: "3", bookId: "3", shelf: "READ", addedDate: "2024-10-20" },
    { id: "4", bookId: "4", shelf: "WISHLIST", addedDate: "2024-12-05" },
    {
      id: "5",
      bookId: "5",
      shelf: "READING",
      addedDate: "2024-11-28",
      progress: 78,
    },
    { id: "6", bookId: "6", shelf: "READ", addedDate: "2024-09-10" },
  ];

  const libraryItems = data && data.length > 0 ? data : mockLibraryItems;
  const filteredItems = libraryItems
    .filter((item: LibraryItem) => item.shelf === shelf)
    .filter((item: LibraryItem) => {
      if (!searchTerm) return true;
      const book = seedBooks.find((book) => book.id === item.bookId);
      if (!book) return false;
      return (
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });

  const getShelfIcon = (shelfType: string) => {
    switch (shelfType) {
      case "WISHLIST":
        return Heart;
      case "READING":
        return BookOpen;
      case "READ":
        return CheckCircle;
      default:
        return Book;
    }
  };

  const getShelfColor = (shelfType: string) => {
    switch (shelfType) {
      case "WISHLIST":
        return "text-red-500 bg-red-50";
      case "READING":
        return "text-blue-500 bg-blue-50";
      case "READ":
        return "text-green-500 bg-green-50";
      default:
        return "text-gray-500 bg-gray-50";
    }
  };

  const getShelfStats = () => {
    const stats = {
      WISHLIST: libraryItems.filter(
        (item: LibraryItem) => item.shelf === "WISHLIST"
      ).length,
      READING: libraryItems.filter(
        (item: LibraryItem) => item.shelf === "READING"
      ).length,
      READ: libraryItems.filter((item: LibraryItem) => item.shelf === "READ")
        .length,
    };
    return stats;
  };

  const stats = getShelfStats();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Book className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Library</h1>
                <p className="text-gray-600">
                  Organize and track your reading journey
                </p>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="hidden md:flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {stats.WISHLIST}
                </div>
                <div className="text-sm text-gray-600">Wishlist</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {stats.READING}
                </div>
                <div className="text-sm text-gray-600">Reading</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {stats.READ}
                </div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Shelf Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex flex-wrap gap-2">
            {(["WISHLIST", "READING", "READ"] as const).map((shelfType) => {
              const Icon = getShelfIcon(shelfType);
              const count =
                shelfType === "read" ? stats.read : stats[shelfType];
              return (
                <button
                  key={shelfType}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    shelf === shelfType
                      ? "bg-blue-600 text-white shadow-lg"
                      : "bg-white text-gray-600 hover:bg-gray-50 border"
                  }`}
                  onClick={() => setShelf(shelfType)}
                >
                  <Icon className="h-4 w-4" />
                  {shelfType.charAt(0) + shelfType.slice(1).toLowerCase()}
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      shelf === shelfType ? "bg-white/20" : "bg-gray-100"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search and View Controls */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search books..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex border rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 ${
                  viewMode === "grid"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 ${
                  viewMode === "list"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
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
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            Error loading library: {(error as any).message}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredItems.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Book className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm
                ? "No books found"
                : `Your ${shelf.toLowerCase()} is empty`}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm
                ? `No books match "${searchTerm}"`
                : `Start adding books to your ${shelf.toLowerCase()}`}
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

        {/* Books Grid/List */}
        {!isLoading && filteredItems.length > 0 && (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "space-y-4"
            }
          >
            {filteredItems.map((item: LibraryItem) => {
              const book = seedBooks.find((book) => book.id === item.bookId);
              if (!book) return null;

              return viewMode === "grid" ? (
                <div
                  key={item.id}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  <Link to={`/books/${book.id}`} className="block">
                    <div className="bg-gradient-to-br from-blue-100 to-purple-100 h-48 flex items-center justify-center">
                      <BookOpen className="h-16 w-16 text-blue-400" />
                    </div>
                  </Link>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getShelfColor(
                          item.shelf
                        )}`}
                      >
                        {getShelfIcon(item.shelf) &&
                          React.createElement(getShelfIcon(item.shelf), {
                            className: "h-3 w-3 mr-1",
                          })}
                        {item.shelf}
                      </span>
                      {item.progress && (
                        <span className="text-xs text-gray-500">
                          {item.progress}%
                        </span>
                      )}
                    </div>
                    <Link to={`/books/${book.id}`}>
                      <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2 mb-1">
                        {book.title}
                      </h3>
                    </Link>
                    <p className="text-gray-600 text-sm mb-2">{book.author}</p>
                    {item.progress && (
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${item.progress}%` }}
                        ></div>
                      </div>
                    )}
                    <p className="text-xs text-gray-500">
                      Added {new Date(item.addedDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ) : (
                <div
                  key={item.id}
                  className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <Link to={`/books/${book.id}`}>
                      <div className="bg-gradient-to-br from-blue-100 to-purple-100 w-16 h-20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <BookOpen className="h-8 w-8 text-blue-400" />
                      </div>
                    </Link>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <Link to={`/books/${book.id}`}>
                          <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors truncate">
                            {book.title}
                          </h3>
                        </Link>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getShelfColor(
                            item.shelf
                          )}`}
                        >
                          {getShelfIcon(item.shelf) &&
                            React.createElement(getShelfIcon(item.shelf), {
                              className: "h-3 w-3 mr-1",
                            })}
                          {item.shelf}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-1">
                        {book.author}
                      </p>
                      {item.progress && (
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${item.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500">
                            {item.progress}%
                          </span>
                        </div>
                      )}
                      <p className="text-xs text-gray-500">
                        Added {new Date(item.addedDate).toLocaleDateString()}
                      </p>
                    </div>
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
