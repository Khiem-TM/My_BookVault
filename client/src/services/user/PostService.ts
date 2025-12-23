import { api } from "../apiClient";

export interface CommentResponse {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  content: string;
  created: string;
  createdDate: string;
}

export interface PostResponse {
  id: string;
  userId: string;
  username: string;
  avatar?: string;
  content: string;
  images: string[];
  likeCount: number;
  isLikedByCurrentUser: boolean;
  comments: CommentResponse[];
  created: string;
  createdDate: string;
  modifiedDate: string;
}

export interface PageResponse<T> {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalElements: number;
  data: T[];
}

export const postService = {
  createPost: async (content: string, images: string[] = []) => {
    const response = await api.post<any>("/post/create", { content, images });
    return response.data;
  },

  getAllPosts: async (page: number = 1, size: number = 10) => {
    const response = await api.get<any>(`/post/`, {
      params: { page, size },
    });
    return response.data;
  },

  getMyPosts: async (page: number = 1, size: number = 10) => {
    const response = await api.get<any>(`/post/my-posts`, {
      params: { page, size },
    });
    return response.data;
  },

  getPostById: async (postId: string) => {
    const response = await api.get<any>(`/post/${postId}`);
    return response.data;
  },

  likePost: async (postId: string) => {
    const response = await api.post<any>(`/post/${postId}/like`);
    return response.data;
  },

  unlikePost: async (postId: string) => {
    const response = await api.post<any>(`/post/${postId}/unlike`);
    return response.data;
  },

  addComment: async (postId: string, content: string) => {
    const response = await api.post<any>(`/post/comment`, { postId, content });
    return response.data;
  },

  deleteComment: async (postId: string, commentId: string) => {
    const response = await api.delete<any>(`/post/${postId}/comment/${commentId}`);
    return response.data;
  },

  uploadMedia: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    // Use the post-service upload endpoint which proxies/handles file upload
    const response = await api.post<any>("/post/upload-image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data; // { code: 1000, result: { fileName, fileUrl, ... } }
  },
};
