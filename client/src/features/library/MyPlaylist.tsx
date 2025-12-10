import { useState, useEffect } from "react";
import { Plus, X, Edit2, Trash2 } from "lucide-react";
import { axiosInstance } from "../../utils/axiosConfig";

interface Playlist {
  id: number;
  name: string;
  description: string;
  bookCount: number;
  createdAt: string;
}

interface PlaylistBook {
  id: number;
  bookId: number;
  title: string;
  author: string;
  thumbnailUrl: string;
  position: number;
}

export default function MyPlaylist() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(
    null
  );
  const [playlistBooks, setPlaylistBooks] = useState<PlaylistBook[]>([]);
  const [showCreatePlaylistModal, setShowCreatePlaylistModal] = useState(false);
  const [showEditPlaylistModal, setShowEditPlaylistModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [newPlaylistDesc, setNewPlaylistDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user playlists
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      fetchPlaylists(userId);
    }
  }, []);

  const fetchPlaylists = async (userId: string) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/library/playlists`);
      setPlaylists(response.data.result || []);
    } catch (err) {
      console.error("Error fetching playlists:", err);
      setError("Failed to load playlists");
    } finally {
      setLoading(false);
    }
  };

  const fetchPlaylistBooks = async (playlistId: number) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        `/library/playlists/${playlistId}`
      );
      const playlist = response.data.result;
      setPlaylistBooks(playlist.books || []);
    } catch (err) {
      console.error("Error fetching playlist books:", err);
      setError("Failed to load playlist books");
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) {
      setError("Playlist name is required");
      return;
    }

    try {
      setLoading(true);
      const response = await axiosInstance.post(`/library/playlists`, {
        name: newPlaylistName,
        description: newPlaylistDesc,
      });

      const newPlaylist = response.data.result;
      setPlaylists([...playlists, newPlaylist]);
      setNewPlaylistName("");
      setNewPlaylistDesc("");
      setShowCreatePlaylistModal(false);
      setError(null);
    } catch (err) {
      console.error("Error creating playlist:", err);
      setError("Failed to create playlist");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePlaylist = async () => {
    if (!selectedPlaylist || !newPlaylistName.trim()) {
      setError("Playlist name is required");
      return;
    }

    try {
      setLoading(true);
      const response = await axiosInstance.put(
        `/library/playlists/${selectedPlaylist.id}`,
        {
          name: newPlaylistName,
          description: newPlaylistDesc,
        }
      );

      const updatedPlaylist = response.data.result;
      setPlaylists(
        playlists.map((p) =>
          p.id === updatedPlaylist.id ? updatedPlaylist : p
        )
      );
      setSelectedPlaylist(updatedPlaylist);
      setNewPlaylistName("");
      setNewPlaylistDesc("");
      setShowEditPlaylistModal(false);
      setError(null);
    } catch (err) {
      console.error("Error updating playlist:", err);
      setError("Failed to update playlist");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlaylist = async (id: number) => {
    if (!confirm("Are you sure you want to delete this playlist?")) return;

    try {
      setLoading(true);
      await axiosInstance.delete(`/library/playlists/${id}`);
      setPlaylists(playlists.filter((p) => p.id !== id));
      if (selectedPlaylist?.id === id) {
        setSelectedPlaylist(null);
        setPlaylistBooks([]);
      }
      setError(null);
    } catch (err) {
      console.error("Error deleting playlist:", err);
      setError("Failed to delete playlist");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBook = async (bookId: number) => {
    if (!selectedPlaylist) return;

    try {
      setLoading(true);
      const response = await axiosInstance.delete(
        `/library/playlists/${selectedPlaylist.id}/books/${bookId}`
      );

      const updated = response.data.result;
      setPlaylistBooks(updated.books || []);
      setSelectedPlaylist(updated);
    } catch (err) {
      console.error("Error removing book:", err);
      setError("Failed to remove book from playlist");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlaylist = (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
    fetchPlaylistBooks(playlist.id);
  };

  const handleOpenEditPlaylist = (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
    setNewPlaylistName(playlist.name);
    setNewPlaylistDesc(playlist.description || "");
    setShowEditPlaylistModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Playlists</h1>
            <p className="text-gray-600 mt-2">
              Organize and manage your book collections
            </p>
          </div>
          <button
            onClick={() => setShowCreatePlaylistModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="h-5 w-5" />
            New Playlist
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
            <button
              onClick={() => setError(null)}
              className="float-right font-bold"
            >
              ×
            </button>
          </div>
        )}

        <div className="grid grid-cols-3 gap-8">
          {/* Playlists List */}
          <div className="col-span-1">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Playlists ({playlists.length})
                </h2>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="p-4 text-center text-gray-500">
                    Loading...
                  </div>
                ) : playlists.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    No playlists yet
                  </div>
                ) : (
                  playlists.map((playlist) => (
                    <div
                      key={playlist.id}
                      onClick={() => handleSelectPlaylist(playlist)}
                      className={`p-4 cursor-pointer border-b transition ${
                        selectedPlaylist?.id === playlist.id
                          ? "bg-blue-50 border-l-4 border-blue-600"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <h3 className="font-medium text-gray-900 truncate">
                        {playlist.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {playlist.bookCount} books
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Playlist Details */}
          <div className="col-span-2">
            {selectedPlaylist ? (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                {/* Playlist Header */}
                <div className="p-6 border-b border-gray-200 flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {selectedPlaylist.name}
                    </h2>
                    {selectedPlaylist.description && (
                      <p className="text-gray-600 mt-2">
                        {selectedPlaylist.description}
                      </p>
                    )}
                    <p className="text-sm text-gray-500 mt-2">
                      {playlistBooks.length} books
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenEditPlaylist(selectedPlaylist)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                    >
                      <Edit2 className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeletePlaylist(selectedPlaylist.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Books in Playlist */}
                <div className="p-6">
                  {playlistBooks.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      No books in this playlist yet
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      {playlistBooks.map((book) => (
                        <div
                          key={book.id}
                          className="flex gap-4 p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition"
                        >
                          <img
                            src={book.thumbnailUrl}
                            alt={book.title}
                            className="w-16 h-24 object-cover rounded"
                          />
                          <div className="flex-1 flex flex-col justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900 truncate">
                                {book.title}
                              </h4>
                              <p className="text-sm text-gray-600 truncate">
                                {book.author}
                              </p>
                            </div>
                            <button
                              onClick={() => handleRemoveBook(book.bookId)}
                              className="text-red-600 hover:text-red-800 text-sm font-medium"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <p className="text-gray-500 text-lg">
                  Select a playlist to view books
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Playlist Modal */}
      {showCreatePlaylistModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Create New Playlist
            </h2>
            <input
              type="text"
              placeholder="Playlist name"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              placeholder="Description (optional)"
              value={newPlaylistDesc}
              onChange={(e) => setNewPlaylistDesc(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
            />
            <div className="flex gap-4">
              <button
                onClick={() => setShowCreatePlaylistModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePlaylist}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Playlist Modal */}
      {showEditPlaylistModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Edit Playlist
            </h2>
            <input
              type="text"
              placeholder="Playlist name"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              placeholder="Description (optional)"
              value={newPlaylistDesc}
              onChange={(e) => setNewPlaylistDesc(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
            />
            <div className="flex gap-4">
              <button
                onClick={() => setShowEditPlaylistModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdatePlaylist}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
