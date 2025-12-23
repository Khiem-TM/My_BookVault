package com.khiem.post.service;

import com.khiem.post.dto.response.MessageRedirectResponse;
import com.khiem.post.dto.response.UserProfileResponse;
import com.khiem.post.repository.httpclient.ProfileClient;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class MessageService {
    ProfileClient profileClient;
    
    public MessageRedirectResponse initiateConversation(String targetUserId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = authentication.getName();
        
        if (currentUserId.equals(targetUserId)) {
            throw new RuntimeException("Cannot start conversation with yourself");
        }
        
        UserProfileResponse userProfile = null;
        try {
            userProfile = profileClient.getProfile(targetUserId).getResult();
        } catch (Exception e) {
            log.error("Error while getting user profile", e);
            throw new RuntimeException("Failed to fetch user profile");
        }
        
        // Generate conversation ID (could be improved with actual chat-service integration)
        String conversationId = UUID.randomUUID().toString();
        
        // Build redirect URL for message page
        String messagePageUrl = "/messages/" + conversationId;
        
        return MessageRedirectResponse.builder()
                .conversationId(conversationId)
                .userId(targetUserId)
                .username(userProfile.getUsername())
                .avatar(userProfile.getAvatar())
                .messagePageUrl(messagePageUrl)
                .build();
    }
}
