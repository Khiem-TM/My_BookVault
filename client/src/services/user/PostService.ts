import { api } from "../apiClient";

export interface PostResponse {
  id: string;
  userId: string;
  username: string;
  avatar?: string;
  content: string;
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
  createPost: async (content: string) => {
    const response = await api.post<any>("/post/create", { content });
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

  uploadMedia: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post<any>("/file/media/upload", formData);
    return response.data; // { code: 1000, result: { originalFileName, url } }
  },
};
