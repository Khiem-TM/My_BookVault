package com.khiem.chat.mapper;

import java.util.List;

import org.mapstruct.Mapper;

import com.khiem.chat.dto.request.ChatMessageRequest;
import com.khiem.chat.dto.response.ChatMessageResponse;
import com.khiem.chat.entity.ChatMessage;

@Mapper(componentModel = "spring")
public interface ChatMessageMapper {
    ChatMessageResponse toChatMessageResponse(ChatMessage chatMessage);

    ChatMessage toChatMessage(ChatMessageRequest request);

    List<ChatMessageResponse> toChatMessageResponses(List<ChatMessage> chatMessages);
}
