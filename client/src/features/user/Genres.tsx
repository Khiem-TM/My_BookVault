import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Heart,
  Share2,
  Image as ImageIcon,
  MoreHorizontal,
  X,
  Send,
  Loader2,
  Globe,
  User,
} from "lucide-react";
import { postService, PostResponse } from "../../services/user/PostService";
import { Pagination } from "@mui/material";

export default function Community() {
  const [activeTab, setActiveTab] = useState<"all" | "my">("all");
  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<PostResponse | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Form State
  const [newPostContent, setNewPostContent] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response =
        activeTab === "all"
          ? await postService.getAllPosts(page, 10)
          : await postService.getMyPosts(page, 10);

      if (response && response.result) {
        setPosts(response.result.data);
        setTotalPages(response.result.totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch posts", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [activeTab, page]);

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return;

    try {
      setIsSubmitting(true);
      
      // Upload image if selected (Though backend doesn't store url yet, we simulate the flow)
      if (selectedImage) {
        await postService.uploadMedia(selectedImage);
      }

      await postService.createPost(newPostContent);
      
      // Reset and refresh
      setShowCreateModal(false);
      setNewPostContent("");
      setSelectedImage(null);
      setPage(1);
      fetchPosts();
    } catch (error) {
      console.error("Failed to create post", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRandomImage = (id: string) => {
    // Generate a consistent random image based on ID char code sum
    const sum = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const imgId = sum % 50; // Use picsum id 0-50
    return `https://picsum.photos/id/${imgId}/600/400`;
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-6 px-4 pb-20">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Community</h1>
            <p className="text-gray-600 mt-1">Connect and share with book lovers</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-full font-medium shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            Create Post
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white p-1 rounded-xl shadow-sm mb-6 flex">
          <button
            onClick={() => { setActiveTab("all"); setPage(1); }}
            className={`flex-1 py-3 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeTab === "all"
                ? "bg-purple-50 text-purple-700 shadow-sm"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Globe className="w-4 h-4" />
            Global Feed
          </button>
          <button
            onClick={() => { setActiveTab("my"); setPage(1); }}
            className={`flex-1 py-3 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeTab === "my"
                ? "bg-purple-50 text-purple-700 shadow-sm"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <User className="w-4 h-4" />
            My Posts
          </button>
        </div>

        {/* Create Post Input (Quick Access) */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex gap-4 items-center cursor-pointer transition-shadow hover:shadow-md" onClick={() => setShowCreateModal(true)}>
          <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0" />
          <div className="flex-1 bg-gray-100 rounded-full px-5 py-2.5 text-gray-500 text-sm">
            What's on your mind? Share a book review...
          </div>
          <div className="p-2 text-purple-600 hover:bg-purple-50 rounded-full">
            <ImageIcon className="w-5 h-5" />
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
          </div>
        )}

        {/* Empty State */}
        {!loading && posts.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">No posts yet</h3>
            <p className="text-gray-500 mt-1">Be the first to share something!</p>
          </div>
        )}

        {/* Posts List */}
        <div className="space-y-6">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-transparent hover:border-purple-100"
              onClick={() => setSelectedPost(post)}
            >
              {/* Post Header */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 border border-gray-100">
                     {post.avatar ? (
                       <img 
                          src={post.avatar} 
                          alt={post.username} 
                          className="w-full h-full object-cover"
                        />
                     ) : (
                       <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-sm">
                         {post.username ? post.username.substring(0, 2).toUpperCase() : "U"}
                       </div>
                     )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {post.username || "Unknown User"}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {post.created || "Just now"}
                    </p>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600 p-1">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>

              {/* Post Content */}
              <div className="px-4 pb-3">
                <p className="text-gray-800 whitespace-pre-line leading-relaxed">
                  {post.content}
                </p>
              </div>

              {/* Placeholder Image (Backend workaround) */}
              <div className="mt-2 relative bg-gray-100 aspect-video overflow-hidden">
                <img
                  src={getRandomImage(post.id)}
                  alt="Post attachment"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Post Stats/Actions */}
              <div className="px-4 py-3 border-t flex items-center justify-between text-gray-500 text-sm">
                <div className="flex items-center gap-6">
                  <button className="flex items-center gap-2 hover:text-red-500 transition-colors">
                    <Heart className="w-5 h-5" />
                    <span>{Math.floor(Math.random() * 50) + 1}</span>
                  </button>
                  <button className="flex items-center gap-2 hover:text-blue-500 transition-colors">
                    <MessageSquare className="w-5 h-5" />
                    <span>{Math.floor(Math.random() * 20)}</span>
                  </button>
                  <button className="flex items-center gap-2 hover:text-green-500 transition-colors">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {posts.length > 0 && (
          <div className="flex justify-center mt-8">
            <Pagination 
              count={totalPages} 
              page={page} 
              onChange={(e: React.ChangeEvent<unknown>, value: number) => {
                setPage(value);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }} 
              color="primary"
              size="large"
              shape="rounded"
            />
          </div>
        )}
      </div>

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-bold text-gray-900">Create Post</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                disabled={isSubmitting}
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-4">
              <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="What do you want to share?"
                className="w-full h-32 resize-none border-none focus:ring-0 text-lg placeholder:text-gray-400"
                autoFocus
              />
              
              {selectedImage && (
                <div className="relative mt-2 rounded-xl overflow-hidden border">
                  <img
                    src={URL.createObjectURL(selectedImage)}
                    alt="Preview"
                    className="w-full h-48 object-cover"
                  />
                  <button
                    onClick={() => setSelectedImage(null)}
                    className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="mt-4 flex items-center justify-between border-t pt-4">
                <div className="flex gap-2">
                   <label className="p-2 text-purple-600 hover:bg-purple-50 rounded-full cursor-pointer transition-colors">
                     <input
                       type="file"
                       accept="image/*"
                       className="hidden"
                       onChange={(e) => {
                         if (e.target.files && e.target.files[0]) {
                           setSelectedImage(e.target.files[0]);
                         }
                       }}
                     />
                    <ImageIcon className="w-5 h-5" />
                   </label>
                </div>
                <button
                  onClick={handleCreatePost}
                  disabled={!newPostContent.trim() || isSubmitting}
                  className="bg-purple-600 text-white px-6 py-2 rounded-full font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    "Post"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Post Detail Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-2xl overflow-y-auto animate-in fade-in zoom-in duration-200">
             <div className="sticky top-0 bg-white z-10 p-4 border-b flex justify-between items-center">
               <h3 className="font-bold text-lg">Post Details</h3>
               <button onClick={() => setSelectedPost(null)} className="p-2 hover:bg-gray-100 rounded-full">
                 <X className="w-5 h-5" />
               </button>
             </div>
             
             <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 border border-gray-100 flex-shrink-0">
                     {selectedPost.avatar ? (
                       <img 
                          src={selectedPost.avatar} 
                          alt={selectedPost.username} 
                          className="w-full h-full object-cover"
                        />
                     ) : (
                       <div className="w-full h-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                         {selectedPost.username ? selectedPost.username.substring(0, 2).toUpperCase() : "U"}
                       </div>
                     )}
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-gray-900">
                      {selectedPost.username || "Unknown User"}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {selectedPost.created}
                    </p>
                  </div>
                </div>

                <p className="text-gray-800 text-lg whitespace-pre-line leading-relaxed mb-6">
                  {selectedPost.content}
                </p>

                <div className="relative bg-gray-100 rounded-xl overflow-hidden mb-6">
                  <img
                    src={getRandomImage(selectedPost.id)}
                    alt="Post"
                    className="w-full object-contain max-h-[500px]"
                  />
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-700 mb-4">Comments (Simulated)</h4>
                  <div className="space-y-4">
                     {[1, 2, 3].map((i) => (
                       <div key={i} className="flex gap-3">
                         <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0" />
                         <div className="bg-gray-50 p-3 rounded-2xl text-sm flex-1">
                           <span className="font-bold text-gray-900 mr-2">User {i}</span>
                           This is a great post! I really enjoyed reading about this book.
                         </div>
                       </div>
                     ))}
                  </div>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
