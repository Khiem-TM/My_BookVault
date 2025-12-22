import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "../../store/authStore";
import {
  chatService,
  ConversationResponse,
  ChatMessageResponse,
} from "../../services/user/ChatService";
import { userProfileService, UserProfile } from "../../services/user/UserProfileService";
import {
  Send,
  Search,
  PlusCircle,
  MessageSquare,
  MoreVertical,
  User,
  Loader2,
  X,
} from "lucide-react";

export default function Chat() {
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState<ConversationResponse[]>([]);
  const [activeConversation, setActiveConversation] = useState<ConversationResponse | null>(null);
  const [messages, setMessages] = useState<ChatMessageResponse[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // New Chat Modal State
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Polling Refs
  const messagesIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const conversationsIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
    // Poll conversations list every 10 seconds
    conversationsIntervalRef.current = setInterval(fetchConversations, 10000);

    return () => {
      if (conversationsIntervalRef.current) clearInterval(conversationsIntervalRef.current);
      if (messagesIntervalRef.current) clearInterval(messagesIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation.id);
      // Poll messages every 3 seconds
      if (messagesIntervalRef.current) clearInterval(messagesIntervalRef.current);
      messagesIntervalRef.current = setInterval(() => fetchMessages(activeConversation.id), 3000);
    } else {
      if (messagesIntervalRef.current) clearInterval(messagesIntervalRef.current);
    }
  }, [activeConversation]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const data = await chatService.getMyConversations();
      setConversations(data);
    } catch (error) {
      console.error("Failed to fetch conversations", error);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const data = await chatService.getMessages(conversationId);
      // Reverse to get Oldest to Newest
      setMessages(data.reverse());
    } catch (error) {
      console.error("Failed to fetch messages", error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || !activeConversation) return;

    const tempId = Date.now().toString();
    const tempMessage: ChatMessageResponse = {
      id: tempId,
      conversationId: activeConversation.id,
      me: true,
      message: inputText,
      sender: {
        userId: user?.id || "",
        username: user?.username || "",
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        avatar: "", // Me
      },
      createdDate: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMessage]);
    setInputText("");
    setIsSending(true);

    try {
      await chatService.sendMessage(activeConversation.id, tempMessage.message);
      fetchMessages(activeConversation.id); // Refresh to get real ID and status
    } catch (error) {
      console.error("Failed to send message", error);
      // Ideally remove temp message or show error
    } finally {
      setIsSending(false);
    }
  };

  const handleSearchUsers = async () => {
    if (!userSearchQuery.trim()) return;
    setIsSearching(true);
    try {
      const results = await userProfileService.search({ keyword: userSearchQuery });
      setSearchResults(results);
    } catch (error) {
      console.error("Failed to search users", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCreateConversation = async (participantId: string) => {
    try {
      const newConv = await chatService.createConversation([participantId]);
      setConversations((prev) => [newConv, ...prev]);
      setActiveConversation(newConv);
      setShowNewChatModal(false);
      setUserSearchQuery("");
      setSearchResults([]);
    } catch (error) {
        console.error("Failed to create conversation", error);
        alert("Could not start conversation. It might already exist or request failed.");
    }
  };

  const getConversationName = (conv: ConversationResponse) => {
    if (conv.conversationName) return conv.conversationName;
    // For direct chat, find the other participant
    // Assuming 2 participants for DIRECT
    const other = conv.participants.find(
      (p) => p.username !== user?.username
    );
    return other ? `${other.firstName} ${other.lastName}` : "Unknown User";
  };
    
  const getConversationAvatar = (conv: ConversationResponse) => {
      if (conv.conversationAvatar) return conv.conversationAvatar;
      const other = conv.participants.find(
        (p) => p.username !== user?.username
      );
      return other?.avatar || null;
  };

  return (
    <div className="flex h-[calc(100vh-80px)] bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
      {/* Sidebar - Conversations */}
      <div className="w-1/3 min-w-[300px] border-r border-gray-100 bg-gray-50 flex flex-col">
        {/* Sidebar Header */}
        <div className="p-4 bg-white border-b border-gray-100 flex justify-between items-center sticky top-0">
          <h2 className="text-xl font-bold text-gray-800">Messages</h2>
          <button
            onClick={() => setShowNewChatModal(true)}
            className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors"
          >
            <PlusCircle size={20} />
          </button>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <MessageSquare size={48} className="mx-auto mb-3 text-gray-300" />
              <p>No conversations yet.</p>
              <button 
                onClick={() => setShowNewChatModal(true)}
                className="mt-4 text-blue-600 hover:underline text-sm font-medium"
              >
                Start a chat
              </button>
            </div>
          ) : (
            conversations.map((conv) => {
              const isActive = activeConversation?.id === conv.id;
              const name = getConversationName(conv);
              const avatar = getConversationAvatar(conv);

              return (
                <div
                  key={conv.id}
                  onClick={() => setActiveConversation(conv)}
                  className={`p-4 flex items-center gap-3 cursor-pointer transition-all hover:bg-gray-100 ${
                    isActive ? "bg-blue-50 border-r-4 border-blue-500" : ""
                  }`}
                >
                  <div className="w-12 h-12 rounded-full flex-shrink-0 bg-gray-200 overflow-hidden">
                    {avatar ? (
                      <img src={avatar} alt={name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-300 to-purple-300 text-white font-bold">
                        {name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-semibold truncate ${isActive ? "text-blue-900" : "text-gray-900"}`}>
                      {name}
                    </h3>
                    <p className="text-xs text-gray-500 truncate">
                      Click to view messages
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                   {getConversationAvatar(activeConversation) ? (
                      <img 
                        src={getConversationAvatar(activeConversation)!} 
                        alt={getConversationName(activeConversation)} 
                        className="w-full h-full object-cover" 
                      />
                   ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-400 text-white font-bold">
                        {getConversationName(activeConversation).charAt(0)}
                      </div>
                   )}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">
                    {getConversationName(activeConversation)}
                  </h3>
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span>
                    Online
                  </p>
                </div>
              </div>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <MoreVertical size={20} />
              </button>
            </div>

            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <MessageSquare size={48} className="mb-2 opacity-50" />
                  <p>Send a message to start the conversation</p>
                </div>
              ) : (
                messages.map((msg, index) => (
                  <div
                    key={msg.id || index}
                    className={`flex ${msg.me ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-3 shadow-sm ${
                        msg.me
                          ? "bg-blue-600 text-white rounded-tr-none"
                          : "bg-white text-gray-800 rounded-tl-none border border-gray-100"
                      }`}
                    >
                      {!msg.me && (
                         <div className="mb-1 text-xs text-gray-400 font-medium">
                            {msg.sender.firstName} {msg.sender.lastName}
                         </div>
                      )}
                      <p className="whitespace-pre-wrap break-words text-[15px]">{msg.message}</p>
                      <p
                        className={`text-[10px] mt-1 text-right ${
                          msg.me ? "text-blue-200" : "text-gray-400"
                        }`}
                      >
                        {new Date(msg.createdDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={inputText}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-6 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all disabled:opacity-50"
                  disabled={isSending}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputText.trim() || isSending}
                  className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform active:scale-95"
                >
                  <Send size={20} className={isSending ? "opacity-50" : ""} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 text-gray-400 bg-gray-50/30">
            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                <MessageSquare size={48} className="text-blue-300" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">MyBook Chat</h2>
            <p className="max-w-md text-gray-500">
              Select a conversation from the sidebar or start a new collection to connect with other readers.
            </p>
          </div>
        )}
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-gray-900 text-lg">New Message</h3>
              <button
                onClick={() => setShowNewChatModal(false)}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            
            <div className="p-4">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search user by name..."
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearchUsers()}
                  autoFocus
                />
                <button
                    onClick={handleSearchUsers}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-md hover:bg-blue-200"
                >
                    Search
                </button>
              </div>

              <div className="max-h-[300px] overflow-y-auto space-y-2">
                {isSearching ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="animate-spin text-blue-500" />
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((userResult) => (
                    <div
                      key={userResult.userId}
                      onClick={() => handleCreateConversation(userResult.userId)}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors border border-transparent hover:border-gray-100 group"
                    >
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold group-hover:bg-indigo-200 flex-shrink-0">
                         {userResult.avatar ? <img src={userResult.avatar} className="w-10 h-10 rounded-full object-cover" /> : <User size={20} />}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{userResult.firstName} {userResult.lastName}</p>
                        <p className="text-xs text-gray-500">@{userResult.username}</p>
                      </div>
                    </div>
                  ))
                ) : userSearchQuery && !isSearching ? (
                   <p className="text-center text-gray-500 py-4">No users found.</p>
                ) : (
                    <div className="text-center py-8 text-gray-400">
                        <User size={32} className="mx-auto mb-2 opacity-30" />
                        <p className="text-sm">Search for a user to start chatting</p>
                    </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
