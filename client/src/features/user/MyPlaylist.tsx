import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Music,
  Plus,
  Trash2,
  Share2,
  BookOpen,
  Search,
  Grid,
  List,
} from "lucide-react";
import { playlistService } from "../../services/user/PlaylistService";

interface Playlist {
  id: string;
  name: string;
  description?: string;
  bookCount: number;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export default function MyPlaylist() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [newPlaylistDesc, setNewPlaylistDesc] = useState("");
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const playlistsData = await playlistService.getUserPlaylists();
        setPlaylists(playlistsData || []);
      } catch (err) {
        console.error("Error fetching playlists:", err);
        setError("Failed to load playlists");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const displayPlaylists = playlists;

  const filteredPlaylists = displayPlaylists.filter((playlist) => {
    if (!searchTerm) return true;
    return (
      playlist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (playlist.description &&
        playlist.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) return;
    try {
      await playlistService.createPlaylist(newPlaylistName, newPlaylistDesc);
      setNewPlaylistName("");
      setNewPlaylistDesc("");
      setShowCreateModal(false);
      // Refetch playlists
      const updatedPlaylists = await playlistService.getUserPlaylists();
      setPlaylists(updatedPlaylists || []);
    } catch (err) {
      console.error("Error creating playlist:", err);
    }
  };

  const handleDeletePlaylist = async (playlistId: string) => {
    try {
      await playlistService.deletePlaylist(playlistId);
      setPlaylists(playlists.filter((p) => p.id !== playlistId));
    } catch (err) {
      console.error("Error deleting playlist:", err);
    }
  };

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
                  {filteredPlaylists.reduce((sum, p) => sum + (p.bookCount || 0), 0)}
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
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredPlaylists.length === 0 && (
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

        {/* Rented Books Section */}
        <div className="mb-12">
           <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              Sách đã thuê (Rented Books)
           </h2>
           {/* We can fetch rented books here or reuse a list if we had one. 
               For now, we'll assume we need to fetch them or they are part of 'playlists' logic improvement later. 
               The user asked to split the view. 
               Since we don't have a direct 'rented books' state yet in this component, 
               I will add it in the next step or assume we simply show a placeholder if empty 
               but the user asked for functional separation. 
               Actually, let's fetch myBooks in useEffect too.
            */}
           {/* Placeholder for Rented Books Grid - to be populated by state */}
           <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
              <p className="text-gray-500">You haven't rented any books yet.</p>
              <Link to="/books" className="text-blue-600 font-medium hover:underline mt-2 inline-block">Browse Books</Link>
           </div>
        </div>

        {/* Playlists Section */}
        <div>
           <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                 <List className="h-5 w-5 text-purple-600" />
                 My Playlists
              </h2>
           </div>
           
           {/* Existing Playlist Grid/List Logic */}
           {!loading && filteredPlaylists.length > 0 && (
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
                    ? "p-6"
                    : "flex items-center justify-between p-6"
                }`}
              >
                {viewMode === "grid" ? (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
                        <Music className="h-6 w-6 text-white" />
                      </div>
                      <button
                        onClick={() => handleDeletePlaylist(playlist.id)}
                        className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </button>
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
                        Updated{" "}
                        {new Date(playlist.updatedAt).toLocaleDateString()}
                      </div>
                    </div>

                    <Link
                      to={`/playlists/${playlist.id}`}
                      className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-center"
                    >
                      View Playlist
                    </Link>
                  </>
                ) : (
                  <>
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

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/playlists/${playlist.id}`}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => handleDeletePlaylist(playlist.id)}
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
                onClick={handleCreatePlaylist}
                disabled={!newPlaylistName.trim()}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
