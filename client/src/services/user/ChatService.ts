import { api, ApiResponse } from "../apiClient";

export interface ParticipantInfo {
  userId: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar: string;
}

export interface ConversationResponse {
  id: string;
  type: string;
  participantsHash: string;
  conversationAvatar: string;
  conversationName: string;
  participants: ParticipantInfo[];
  createdDate: string;
  modifiedDate: string;
}

export interface ChatMessageResponse {
  id: string;
  conversationId: string;
  me: boolean;
  message: string;
  sender: ParticipantInfo;
  createdDate: string;
}

export const chatService = {
  getMyConversations: async (): Promise<ConversationResponse[]> => {
    const response = await api.get<ApiResponse<ConversationResponse[]>>(
      "/chat/conversations/my-conversations"
    );
    return response.data.result || [];
  },

  createConversation: async (participantIds: string[]): Promise<ConversationResponse> => {
    const response = await api.post<ApiResponse<ConversationResponse>>(
      "/chat/conversations/create",
      { participantIds }
    );
    return response.data.result!;
  },

  getMessages: async (conversationId: string): Promise<ChatMessageResponse[]> => {
    const response = await api.get<ApiResponse<ChatMessageResponse[]>>(
      `/chat/messages`,
      { params: { conversationId } }
    );
    return response.data.result || [];
  },

  sendMessage: async (conversationId: string, message: string): Promise<ChatMessageResponse> => {
    const response = await api.post<ApiResponse<ChatMessageResponse>>(
      "/chat/messages/create",
      { conversationId, message }
    );
    return response.data.result!;
  },
};
