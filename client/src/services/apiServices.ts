import axiosInstance from "../utils/axiosConfig";

export const bookService = {
  // Get all books
  getBooks: async (page = 0, size = 20) => {
    const response = await axiosInstance.get("/books", {
      params: { page, size },
    });
    return response.data.result;
  },

  // Get book by ID
  getBookById: async (id: string) => {
    const response = await axiosInstance.get(`/books/${id}`);
    return response.data.result;
  },

  // Search books
  searchBooks: async (
    query: string,
    category?: string,
    page = 0,
    size = 20
  ) => {
    const params: any = { page, size };
    if (query) params.keyword = query;
    if (category && category !== "All Categories") params.category = category;

    const response = await axiosInstance.get("/books", {
      params,
    });
    return response.data.result;
  },

  // Get categories
  getCategories: async () => {
    const response = await axiosInstance.get("/books/categories");
    return response.data.result;
  },

  // Get books by category
  getBooksByCategory: async (categoryId: string) => {
    const response = await axiosInstance.get(`/books/categories/${categoryId}`);
    return response.data.result;
  },
};

export const reviewService = {
  // Get reviews for a book
  getReviews: async (bookId: string) => {
    const response = await axiosInstance.get(`/reviews/books/${bookId}`);
    return response.data.result;
  },

  // Create review
  createReview: async (bookId: string, data: any) => {
    const response = await axiosInstance.post(`/reviews/books/${bookId}`, data);
    return response.data.result;
  },

  // Update review
  updateReview: async (reviewId: string, data: any) => {
    const response = await axiosInstance.put(`/reviews/${reviewId}`, data);
    return response.data.result;
  },

  // Delete review
  deleteReview: async (reviewId: string) => {
    await axiosInstance.delete(`/reviews/${reviewId}`);
  },
};

export const libraryService = {
  // Get user library
  getUserLibrary: async () => {
    const response = await axiosInstance.get("/library/my-books");
    return response.data.result;
  },

  // Add book to library
  addToLibrary: async (bookId: string) => {
    const response = await axiosInstance.post(`/library/books/${bookId}`);
    return response.data.result;
  },

  // Remove from library
  removeFromLibrary: async (bookId: string) => {
    await axiosInstance.delete(`/library/books/${bookId}`);
  },

  // Get library stats
  getLibraryStats: async () => {
    const response = await axiosInstance.get("/library/stats");
    return response.data.result;
  },
};

export const orderService = {
  // Get user orders
  getUserOrders: async () => {
    const response = await axiosInstance.get("/order/my-orders");
    return response.data.result;
  },

  // Get order details
  getOrderById: async (id: string) => {
    const response = await axiosInstance.get(`/order/orders/${id}`);
    return response.data.result;
  },

  // Create order
  createOrder: async (data: any) => {
    const response = await axiosInstance.post("/order/orders", data);
    return response.data.result;
  },

  // Update order status
  updateOrderStatus: async (id: string, status: string) => {
    const response = await axiosInstance.put(`/order/orders/${id}/status`, {
      status,
    });
    return response.data.result;
  },
};

export const profileService = {
  // Get profile
  getProfile: async () => {
    const response = await axiosInstance.get("/profile/my-profile");
    return response.data.result;
  },

  // Update profile
  updateProfile: async (data: any) => {
    const response = await axiosInstance.put("/profile/my-profile", data);
    return response.data.result;
  },

  // Get user by ID
  getUserProfile: async (userId: string) => {
    const response = await axiosInstance.get(`/profile/users/${userId}`);
    return response.data.result;
  },

  // Update avatar
  updateAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await axiosInstance.post("/profile/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.result;
  },
};

export const postService = {
  // Get feed
  getFeed: async (page = 0, size = 20) => {
    const response = await axiosInstance.get("/post/feed", {
      params: { page, size },
    });
    return response.data.result;
  },

  // Create post
  createPost: async (data: any) => {
    const response = await axiosInstance.post("/post/posts", data);
    return response.data.result;
  },

  // Get post by ID
  getPostById: async (id: string) => {
    const response = await axiosInstance.get(`/post/posts/${id}`);
    return response.data.result;
  },

  // Update post
  updatePost: async (id: string, data: any) => {
    const response = await axiosInstance.put(`/post/posts/${id}`, data);
    return response.data.result;
  },

  // Delete post
  deletePost: async (id: string) => {
    await axiosInstance.delete(`/post/posts/${id}`);
  },

  // Like post
  likePost: async (id: string) => {
    const response = await axiosInstance.post(`/post/posts/${id}/like`);
    return response.data.result;
  },

  // Add comment
  addComment: async (postId: string, data: any) => {
    const response = await axiosInstance.post(
      `/post/posts/${postId}/comments`,
      data
    );
    return response.data.result;
  },
};

export const chatService = {
  // Get conversations
  getConversations: async () => {
    const response = await axiosInstance.get("/chat/conversations");
    return response.data.result;
  },

  // Get messages
  getMessages: async (conversationId: string) => {
    const response = await axiosInstance.get(
      `/chat/conversations/${conversationId}/messages`
    );
    return response.data.result;
  },

  // Send message
  sendMessage: async (conversationId: string, content: string) => {
    const response = await axiosInstance.post(
      `/chat/conversations/${conversationId}/messages`,
      {
        content,
      }
    );
    return response.data.result;
  },

  // Create conversation
  createConversation: async (userId: string) => {
    const response = await axiosInstance.post("/chat/conversations", {
      participantId: userId,
    });
    return response.data.result;
  },
};

export const fileService = {
  // Upload file
  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await axiosInstance.post("/file/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.result;
  },

  // Download file
  downloadFile: async (fileId: string) => {
    const response = await axiosInstance.get(`/file/media/download/${fileId}`, {
      responseType: "blob",
    });
    return response.data;
  },

  // Delete file
  deleteFile: async (fileId: string) => {
    await axiosInstance.delete(`/file/${fileId}`);
  },
};

export const paymentService = {
  // Create payment
  createPayment: async (orderId: string, data: any) => {
    const response = await axiosInstance.post(
      `/payment/orders/${orderId}/payment`,
      data
    );
    return response.data.result;
  },

  // Get payment status
  getPaymentStatus: async (paymentId: string) => {
    const response = await axiosInstance.get(`/payment/payments/${paymentId}`);
    return response.data.result;
  },
};

export const transactionService = {
  // Get transactions
  getTransactions: async () => {
    const response = await axiosInstance.get("/transaction/my-transactions");
    return response.data.result;
  },

  // Get transaction details
  getTransactionById: async (id: string) => {
    const response = await axiosInstance.get(`/transaction/transactions/${id}`);
    return response.data.result;
  },
};

export const notificationService = {
  // Get notifications
  getNotifications: async () => {
    const response = await axiosInstance.get("/notification/my-notifications");
    return response.data.result;
  },

  // Mark as read
  markAsRead: async (notificationId: string) => {
    const response = await axiosInstance.put(
      `/notification/notifications/${notificationId}/read`
    );
    return response.data.result;
  },

  // Send email
  sendEmail: async (to: string, subject: string, content: string) => {
    const response = await axiosInstance.post("/notification/email/send", {
      to,
      subject,
      htmlContent: content,
    });
    return response.data.result;
  },
};

export const playlistService = {
  // Get all user playlists
  getUserPlaylists: async () => {
    const response = await axiosInstance.get("/library/playlists");
    return response.data.result;
  },

  // Get playlist detail
  getPlaylistDetail: async (playlistId: string) => {
    const response = await axiosInstance.get(
      `/library/playlists/${playlistId}`
    );
    return response.data.result;
  },

  // Create playlist
  createPlaylist: async (name: string, description?: string) => {
    const response = await axiosInstance.post(`/library/playlists`, {
      name,
      description,
    });
    return response.data.result;
  },

  // Update playlist
  updatePlaylist: async (
    playlistId: string,
    name: string,
    description?: string
  ) => {
    const response = await axiosInstance.put(
      `/library/playlists/${playlistId}`,
      { name, description }
    );
    return response.data.result;
  },

  // Delete playlist
  deletePlaylist: async (playlistId: string) => {
    await axiosInstance.delete(`/library/playlists/${playlistId}`);
  },

  // Add book to playlist
  addBookToPlaylist: async (playlistId: string, bookId: string) => {
    const response = await axiosInstance.post(
      `/library/playlists/${playlistId}/books/${bookId}`
    );
    return response.data.result;
  },

  // Remove book from playlist
  removeBookFromPlaylist: async (playlistId: string, bookId: string) => {
    const response = await axiosInstance.delete(
      `/library/playlists/${playlistId}/books/${bookId}`
    );
    return response.data.result;
  },

  // Reorder books in playlist
  reorderPlaylistBooks: async (playlistId: string, bookIds: string[]) => {
    const response = await axiosInstance.post(
      `/library/playlists/${playlistId}/reorder`,
      bookIds
    );
    return response.data.result;
  },
};

export default {
  bookService,
  reviewService,
  libraryService,
  orderService,
  profileService,
  postService,
  chatService,
  fileService,
  paymentService,
  transactionService,
  notificationService,
  playlistService,
};
