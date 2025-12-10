import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../services/apiClient";
import { Link } from "react-router-dom";
import {
  Music,
  Plus,
  Trash2,
  Edit2,
  Share2,
  Lock,
  Globe,
  Users,
  Play,
  BookOpen,
  Search,
  Grid,
  List,
} from "lucide-react";
import { seedBooks } from "../../data/seedBooks";

interface Playlist {
  id: string;
  name: string;
  description?: string;
  bookCount: number;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

interface PlaylistDetail extends Playlist {
  books: Array<{
    id: string;
    bookId: string;
    title: string;
    author: string;
    thumbnailUrl?: string;
  }>;
}

export default function MyPlaylist() {
  const userId = "1";
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [newPlaylistDesc, setNewPlaylistDesc] = useState("");

  // Fetch playlists
  const { data: playlists, isLoading: playlistsLoading } = useQuery({
    queryKey: ["playlists", userId],
    queryFn: async () => {
      try {
        const response = await api.get(`/library/playlists`);
        return response.data?.result || mockPlaylists;
      } catch (err) {
        return mockPlaylists;
      }
    },
  });

  // Create playlist mutation
  const createPlaylistMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post(`/library/playlists`, {
        name: newPlaylistName,
        description: newPlaylistDesc,
        userId,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playlists", userId] });
      setNewPlaylistName("");
      setNewPlaylistDesc("");
      setShowCreateModal(false);
    },
  });

  // Delete playlist mutation
  const deletePlaylistMutation = useMutation({
    mutationFn: async (playlistId: string) => {
      await api.delete(`/library/playlists/${playlistId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playlists", userId] });
    },
  });

  const mockPlaylists: Playlist[] = [
    {
      id: "1",
      name: "Favorite Science Fiction",
      description: "My favorite sci-fi books",
      bookCount: 8,
      createdAt: "2024-10-01",
      updatedAt: "2024-12-05",
      userId: "1",
    },
    {
      id: "2",
      name: "Learning Python",
      description: "Books for mastering Python programming",
      bookCount: 5,
      createdAt: "2024-09-15",
      updatedAt: "2024-12-03",
      userId: "1",
    },
    {
      id: "3",
      name: "Fantasy Classics",
      description: "Classic fantasy novels",
      bookCount: 6,
      createdAt: "2024-08-20",
      updatedAt: "2024-11-28",
      userId: "1",
    },
  ];

  const filteredPlaylists = (playlists || mockPlaylists).filter((playlist) => {
    if (!searchTerm) return true;
    return (
      playlist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (playlist.description &&
        playlist.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                <Music className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  My Playlists
                </h1>
                <p className="text-gray-600">
                  Organize and curate your favorite books
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="hidden md:flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {filteredPlaylists.length}
                </div>
                <div className="text-sm text-gray-600">Playlists</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {filteredPlaylists.reduce((sum, p) => sum + p.bookCount, 0)}
                </div>
                <div className="text-sm text-gray-600">Total Books</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search playlists..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* View Controls */}
          <div className="flex items-center gap-2">
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

            {/* Create Button */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              <Plus className="h-4 w-4" />
              New Playlist
            </button>
          </div>
        </div>

        {/* Loading */}
        {playlistsLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        )}

        {/* Empty State */}
        {!playlistsLoading && filteredPlaylists.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Music className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm ? "No playlists found" : "No playlists yet"}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm
                ? `No playlists match "${searchTerm}"`
                : "Create your first playlist to start organizing books"}
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Playlist
            </button>
          </div>
        )}

        {/* Playlists Grid/List */}
        {!playlistsLoading && filteredPlaylists.length > 0 && (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            }
          >
            {filteredPlaylists.map((playlist) => (
              <div
                key={playlist.id}
                className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all ${
                  viewMode === "grid"
                    ? ""
                    : "flex items-center justify-between p-6"
                }`}
              >
                {viewMode === "grid" ? (
                  <>
                    {/* Grid View */}
                    <div className="p-6 pb-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
                          <Music className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex items-center gap-1">
                          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <Share2 className="h-4 w-4 text-gray-600" />
                          </button>
                          <button
                            onClick={() =>
                              deletePlaylistMutation.mutate(playlist.id)
                            }
                            className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </button>
                        </div>
                      </div>

                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                        {playlist.name}
                      </h3>
                      {playlist.description && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {playlist.description}
                        </p>
                      )}

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <BookOpen className="h-4 w-4 mr-2" />
                          {playlist.bookCount}{" "}
                          {playlist.bookCount === 1 ? "book" : "books"}
                        </div>
                        <div className="text-xs text-gray-500">
                          Created{" "}
                          {new Date(playlist.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {/* View Button */}
                    <Link
                      to={`/playlists/${playlist.id}`}
                      className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-center flex items-center justify-center gap-2"
                    >
                      <Play className="h-4 w-4" />
                      View Playlist
                    </Link>
                  </>
                ) : (
                  <>
                    {/* List View */}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {playlist.name}
                      </h3>
                      {playlist.description && (
                        <p className="text-sm text-gray-600 mb-2">
                          {playlist.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{playlist.bookCount} books</span>
                        <span>
                          Updated{" "}
                          {new Date(playlist.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/playlists/${playlist.id}`}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                      >
                        View
                      </Link>
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <Share2 className="h-4 w-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() =>
                          deletePlaylistMutation.mutate(playlist.id)
                        }
                        className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Playlist Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Create New Playlist
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Playlist Name *
                </label>
                <input
                  type="text"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="e.g., My Favorite Sci-Fi Books"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newPlaylistDesc}
                  onChange={(e) => setNewPlaylistDesc(e.target.value)}
                  placeholder="Describe your playlist (optional)"
                  rows={3}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => createPlaylistMutation.mutate()}
                disabled={
                  !newPlaylistName.trim() || createPlaylistMutation.isPending
                }
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createPlaylistMutation.isPending ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
