package com.khiem.chat.mapper;

import java.util.List;

import org.mapstruct.Mapper;

import com.khiem.chat.dto.response.ConversationResponse;
import com.khiem.chat.entity.Conversation;

@Mapper(componentModel = "spring")
public interface ConversationMapper {
    ConversationResponse toConversationResponse(Conversation conversation);

    List<ConversationResponse> toConversationResponseList(List<Conversation> conversations);
}
