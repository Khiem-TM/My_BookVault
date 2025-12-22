
import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { playlistService } from "../../services/user/PlaylistService";
import { ArrowLeft, BookOpen, Trash2, Calendar, Edit3 } from "lucide-react";

export default function PlaylistDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadPlaylist(id);
    }
  }, [id]);

  const loadPlaylist = async (playlistId: string) => {
    setLoading(true);
    try {
      const data = await playlistService.getPlaylistDetail(playlistId);
      setPlaylist(data);
    } catch (err) {
      console.error("Failed to load playlist", err);
      setError("Failed to load playlist details. It may have been deleted.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBook = async (bookId: string) => {
    if (!playlist || !id) return;
    if (!window.confirm("Are you sure you want to remove this book from the playlist?")) return;

    try {
      await playlistService.removeBookFromPlaylist(id, bookId);
      // Reload playlist
      loadPlaylist(id);
    } catch (err) {
      console.error("Failed to remove book", err);
      alert("Failed to remove book");
    }
  };
  
  const handleDeletePlaylist = async () => {
      if (!id) return;
      if (!window.confirm("Are you sure you want to delete this playlist?")) return;
      
      try {
          await playlistService.deletePlaylist(id);
          navigate("/playlists");
      } catch (err) {
          console.error("Failed to delete playlist", err);
          alert("Failed to delete playlist");
      }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error || !playlist) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <div className="bg-red-50 text-red-700 p-8 rounded-lg">
          <p className="text-xl font-bold mb-4">{error || "Playlist not found"}</p>
          <Link to="/playlists" className="text-blue-600 hover:underline">
            Back to Playlists
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-white border-b mb-8">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <Link
            to="/playlists"
            className="inline-flex items-center text-gray-500 hover:text-purple-600 mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Playlists
          </Link>

          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {playlist.name}
              </h1>
              <p className="text-gray-600 text-lg mb-4">
                {playlist.description || "No description provided"}
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center">
                  <BookOpen className="h-4 w-4 mr-1" />
                  {playlist.books?.length || 0} books
                </span>
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Updated {new Date(playlist.updatedAt || Date.now()).toLocaleDateString()}
                </span>
              </div>
            </div>
            
             <button
                onClick={handleDeletePlaylist}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete Playlist"
              >
                <Trash2 className="h-5 w-5" />
              </button>
          </div>
        </div>
      </div>

      {/* Books List */}
      <div className="max-w-5xl mx-auto px-4">
        {(!playlist.books || playlist.books.length === 0) ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              This playlist is empty
            </h3>
            <p className="text-gray-600 mb-6">
              Browse books and add them to this playlist
            </p>
            <Link
              to="/books"
              className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Browse Books
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {playlist.books.map((book: any) => (
              <div
                key={book.id}
                className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow flex gap-4 items-center"
              >
                <div className="h-20 w-14 flex-shrink-0 bg-gray-200 rounded overflow-hidden">
                    <img src={book.thumbnailUrl || "/api/placeholder/100/150"} alt={book.title} className="w-full h-full object-cover" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <Link to={`/books/${book.id}`} className="block group">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-purple-600 truncate">
                      {book.title}
                    </h3>
                    <p className="text-gray-600 truncate">{book.author}</p>
                  </Link>
                </div>

                <div className="flex items-center gap-2">
                   <Link 
                      to={`/books/${book.id}`}
                      className="px-4 py-2 text-sm font-medium text-purple-600 hover:bg-purple-50 rounded-lg"
                   >
                     View
                   </Link>
                   <button
                    onClick={() => handleRemoveBook(book.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove from playlist"
                   >
                     <Trash2 className="h-5 w-5" />
                   </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
