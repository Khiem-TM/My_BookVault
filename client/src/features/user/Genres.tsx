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
  MessageCircle,
  ThumbsUp,
} from "lucide-react";
import { postService, PostResponse } from "../../services/user/PostService";
import { Pagination } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

const FILE_DOWNLOAD_URL = "http://localhost:8888/api/v1/file/media/download";

export default function Community() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
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

  // Comment Form State
  const [commentContent, setCommentContent] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  // Open comments for specific post in the feed
  const [openCommentsPostId, setOpenCommentsPostId] = useState<string | null>(null);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response =
        activeTab === "all"
          ? await postService.getAllPosts(page, 10)
          : await postService.getMyPosts(page, 10);

      // Verify response structure
      if (response && response.result) {
        // Backend might wrap data in 'data' field or direct properties depending on PageResponse
        // Based on service: result.data is the list
        setPosts(response.result.data || []);
        setTotalPages(response.result.totalPages || 1);
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
      let imageId = "";

      // Upload image if selected
      if (selectedImage) {
        const uploadRes = await postService.uploadMedia(selectedImage);
        // Assuming result contains id or we use fileName if that acts as ID
        // The backend README says result has fileName, fileUrl etc.
        // Usually file-service uses IDs. Let's assume the fileName is the ID or there is an ID field.
        // If not, we might need to adjust.
        if (uploadRes.result) {
            // Check for id or fileCode or fileName
            // Based on common patterns:
            imageId = uploadRes.result.fileCode || uploadRes.result.fileName || ""; 
        }
      }

      await postService.createPost(newPostContent, imageId ? [imageId] : []);
      
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

  const handleLikeToggle = async (post: PostResponse) => {
    try {
        // Optimistic update
        const isLiked = post.isLikedByCurrentUser;
        const newLikeCount = isLiked ? post.likeCount - 1 : post.likeCount + 1;
        
        const updatedPosts = posts.map(p => 
            p.id === post.id 
                ? { ...p, isLikedByCurrentUser: !isLiked, likeCount: newLikeCount }
                : p
        );
        setPosts(updatedPosts);
        if (selectedPost && selectedPost.id === post.id) {
            setSelectedPost({ ...selectedPost, isLikedByCurrentUser: !isLiked, likeCount: newLikeCount });
        }

        // API Call
        if (isLiked) {
            await postService.unlikePost(post.id);
        } else {
            await postService.likePost(post.id);
        }
    } catch (error) {
        console.error("Failed to toggle like", error);
        fetchPosts(); // Revert on error
    }
  };

  const handleAddComment = async (postId: string) => {
    if (!commentContent.trim()) return;
    setSubmittingComment(true);
    try {
        await postService.addComment(postId, commentContent);
        setCommentContent("");
        
        // Refresh post data
        // For better UX, we could just fetch the single post, but our list needs update too
        // or we assume success and append locally. Let's fetch the specific post to be safe or refresh all.
        // Refreshing all might lose scroll position/expanded states.
        // Let's implement fetchSinglePost update.
        const updatedPostRes = await postService.getPostById(postId);
        if (updatedPostRes.result) {
            const updated = updatedPostRes.result;
            setPosts(prev => prev.map(p => p.id === postId ? updated : p));
            if (selectedPost && selectedPost.id === postId) {
                setSelectedPost(updated);
            }
        }
    } catch (error) {
        console.error("Failed to add comment", error);
    } finally {
        setSubmittingComment(false);
    }
  };

  const handleUserClick = (targetUserId: string) => {
      // Navigate to Chat
      // Ideally pass state to auto-open conversation
      navigate("/chat");
  };

  const CommentSection = ({ post }: { post: PostResponse }) => (
    <div className="mt-4 border-t pt-4 bg-gray-50 rounded-b-xl px-4 pb-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Comments ({post.comments?.length || 0})</h4>
        
        <div className="space-y-4 max-h-60 overflow-y-auto mb-4 custom-scrollbar">
            {post.comments && post.comments.length > 0 ? (
                post.comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden cursor-pointer" onClick={() => handleUserClick(comment.userId)}>
                             {comment.avatar ? (
                                <img src={comment.avatar} alt={comment.username} className="w-full h-full object-cover" />
                             ) : (
                                <div className="w-full h-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                                    {comment.username ? comment.username.substring(0,2).toUpperCase() : "U"}
                                </div>
                             )}
                        </div>
                        <div className="flex-1">
                            <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm text-sm border border-gray-100">
                                <span 
                                    className="font-bold text-gray-900 mr-2 cursor-pointer hover:underline"
                                    onClick={() => handleUserClick(comment.userId)}
                                >
                                    {comment.username}
                                </span>
                                <span className="text-gray-700 break-words">{comment.content}</span>
                            </div>
                            <span className="text-xs text-gray-400 ml-2 mt-1 block">
                                {new Date(comment.createdDate || comment.created).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                ))
            ) : (
                <p className="text-sm text-gray-400 text-center py-2">No comments yet. Say something!</p>
            )}
        </div>

        <div className="flex gap-2 items-center">
            <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                 {/* Current User Avatar */}
                 {user?.avatar ? (
                     <img src={user.avatar} className="w-full h-full object-cover" /> 
                 ) : (
                     <div className="w-full h-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-xs">
                        {user?.username ? user.username.substring(0,2).toUpperCase() : "ME"}
                     </div>
                 )}
            </div>
            <div className="flex-1 relative">
                <input
                    type="text"
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                    placeholder="Write a comment..."
                    className="w-full bg-white border border-gray-200 rounded-full pl-4 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    disabled={submittingComment}
                />
                <button 
                    onClick={() => handleAddComment(post.id)}
                    disabled={!commentContent.trim() || submittingComment}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 p-1.5 text-purple-600 hover:bg-purple-50 rounded-full transition-colors disabled:opacity-50"
                >
                    <Send className="w-4 h-4" />
                </button>
            </div>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 pt-6 px-4 pb-20">
      <div className="max-w-xl mx-auto">
        
        {/* Create Post Card */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
            <div className="flex gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                   {user?.avatar ? (
                     <img src={user.avatar} className="w-full h-full object-cover" />
                   ) : (
                     <div className="w-full h-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold">
                        {user?.username ? user.username.charAt(0).toUpperCase() : "U"}
                     </div>
                   )}
                </div>
                <div 
                    className="flex-1 bg-gray-100 hover:bg-gray-200 transition-colors rounded-full px-4 py-2 text-gray-500 font-medium cursor-pointer flex items-center"
                    onClick={() => setShowCreateModal(true)}
                >
                    What's on your mind, {user?.firstName}?
                </div>
            </div>
            <div className="border-t pt-3 flex items-center justify-between px-2">
                <button 
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 text-gray-500 hover:bg-gray-50 px-4 py-2 rounded-lg transition-colors flex-1 justify-center"
                >
                    <ImageIcon className="w-5 h-5 text-green-500" />
                    <span className="font-medium text-sm">Photo</span>
                </button>
                <div className="w-px h-6 bg-gray-200"></div>
                <button className="flex items-center gap-2 text-gray-500 hover:bg-gray-50 px-4 py-2 rounded-lg transition-colors flex-1 justify-center cursor-not-allowed opacity-60">
                     <Globe className="w-5 h-5 text-blue-500" />
                    <span className="font-medium text-sm">Feeling/Activity</span>
                </button>
            </div>
        </div>

        {/* Tabs */}
        <div className="bg-white p-1 rounded-xl shadow-sm mb-6 flex">
          <button
            onClick={() => { setActiveTab("all"); setPage(1); }}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeTab === "all"
                ? "bg-purple-50 text-purple-600"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            <Globe className="w-4 h-4" />
            Global Feed
          </button>
          <button
            onClick={() => { setActiveTab("my"); setPage(1); }}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeTab === "my"
                ? "bg-purple-50 text-purple-600"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            <User className="w-4 h-4" />
            My Posts
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
          </div>
        )}

        {/* Empty State */}
        {!loading && posts.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-dashed border-gray-300">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-gray-300" />
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
              className="bg-white rounded-xl shadow-sm overflow-hidden"
            >
              {/* Post Header */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 cursor-pointer"
                    onClick={() => handleUserClick(post.userId)}  
                  >
                     {post.avatar ? (
                       <img 
                          src={post.avatar} 
                          alt={post.username} 
                          className="w-full h-full object-cover"
                        />
                     ) : (
                       <div className="w-full h-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white font-bold text-sm">
                         {post.username ? post.username.substring(0, 2).toUpperCase() : "U"}
                       </div>
                     )}
                  </div>
                  <div>
                    <h3 
                        className="font-semibold text-gray-900 cursor-pointer hover:underline"
                        onClick={() => handleUserClick(post.userId)}
                    >
                      {post.username || "Unknown User"}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {new Date(post.createdDate || post.created).toLocaleString()}
                    </p>
                  </div>
                </div>
                <button className="text-gray-400 hover:bg-gray-100 p-2 rounded-full">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>

              {/* Post Content */}
              <div className="px-4 pb-2">
                <p className="text-gray-800 whitespace-pre-wrap leading-relaxed text-[15px]">
                  {post.content}
                </p>
              </div>

              {/* Images */}
              {post.images && post.images.length > 0 && (
                <div className={`mt-3 ${post.images.length > 1 ? 'grid grid-cols-2 gap-1' : ''}`}>
                    {post.images.map((imgId, idx) => (
                        <div key={idx} className="relative bg-gray-100 aspect-auto max-h-[500px] overflow-hidden">
                            <img
                                src={`${FILE_DOWNLOAD_URL}/${imgId}`}
                                alt={`Attachment ${idx + 1}`}
                                className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
                                onClick={() => setSelectedPost(post)}
                            />
                        </div>
                    ))}
                </div>
              )}

              {/* Post Stats */}
              <div className="px-4 py-3 flex items-center justify-between text-xs text-gray-500 border-b border-gray-50">
                   <div className="flex items-center gap-1">
                       {post.likeCount > 0 && <div className="p-1 bg-blue-500 rounded-full"><ThumbsUp className="w-2 h-2 text-white" /></div>}
                       <span>{post.likeCount} Likes</span>
                   </div>
                   <div className="hover:underline cursor-pointer" onClick={() => setOpenCommentsPostId(prev => prev === post.id ? null : post.id)}>
                       {post.comments ? post.comments.length : 0} Comments
                   </div>
              </div>

              {/* Actions */}
              <div className="px-2 py-1 border-b border-gray-100 flex items-center justify-between">
                   <button 
                        onClick={() => handleLikeToggle(post)}
                        className={`flex-1 py-2 flex items-center justify-center gap-2 rounded-lg transition-colors ${post.isLikedByCurrentUser ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-50'}`}
                   >
                        <ThumbsUp className={`w-5 h-5 ${post.isLikedByCurrentUser ? 'fill-current' : ''}`} />
                        <span className="font-medium text-sm">Like</span>
                   </button>
                   <button 
                        onClick={() => setOpenCommentsPostId(prev => prev === post.id ? null : post.id)}
                        className="flex-1 py-2 flex items-center justify-center gap-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                   >
                        <MessageCircle className="w-5 h-5" />
                        <span className="font-medium text-sm">Comment</span>
                   </button>
                   <button className="flex-1 py-2 flex items-center justify-center gap-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
                        <Share2 className="w-5 h-5" />
                        <span className="font-medium text-sm">Share</span>
                   </button>
              </div>

              {/* Comments Section (Inline) */}
              {(openCommentsPostId === post.id || (selectedPost && selectedPost.id === post.id)) && (
                   <CommentSection post={post} />
              )}
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
          <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-4 border-b relative">
              <h2 className="text-xl font-bold text-gray-900 text-center w-full">Create Post</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="absolute right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                disabled={isSubmitting}
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            
            <div className="p-4">
              <div className="flex gap-3 mb-4">
                 <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                   {user?.avatar ? (
                     <img src={user.avatar} className="w-full h-full object-cover" />
                   ) : (
                     <div className="w-full h-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold">
                        {user?.username ? user.username.charAt(0).toUpperCase() : "U"}
                     </div>
                   )}
                 </div>
                 <div className="flex-1">
                    <span className="font-semibold block text-gray-900">{user?.firstName} {user?.lastName}</span>
                    <div className="flex items-center gap-1 bg-gray-100 rounded-md px-2 py-0.5 w-fit mt-1">
                        <Globe className="w-3 h-3 text-gray-500" />
                        <span className="text-xs text-gray-600 font-medium">Public</span>
                    </div>
                 </div>
              </div>

              <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder={`What's on your mind, ${user?.firstName}?`}
                className="w-full h-32 resize-none border-none focus:ring-0 text-xl placeholder:text-gray-400"
                autoFocus
              />
              
              {selectedImage && (
                <div className="relative mt-2 rounded-xl overflow-hidden border bg-gray-50">
                  <img
                    src={URL.createObjectURL(selectedImage)}
                    alt="Preview"
                    className="w-full max-h-60 object-contain"
                  />
                  <button
                    onClick={() => setSelectedImage(null)}
                    className="absolute top-2 right-2 p-1.5 bg-white shadow-sm hover:bg-gray-100 rounded-full text-gray-600 border border-gray-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="mt-4 border-t pt-4">
                <div className="flex items-center justify-between border border-gray-200 rounded-lg p-3 mb-4 shadow-sm">
                   <span className="text-sm font-semibold text-gray-700">Add to your post</span>
                   <div className="flex gap-2">
                       <label className="p-2 hover:bg-gray-100 rounded-full cursor-pointer transition-colors text-green-500">
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
                        <ImageIcon className="w-6 h-6" />
                       </label>
                   </div>
                </div>

                <button
                  onClick={handleCreatePost}
                  disabled={!newPostContent.trim() || isSubmitting}
                  className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
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
    </div>
  );
}
