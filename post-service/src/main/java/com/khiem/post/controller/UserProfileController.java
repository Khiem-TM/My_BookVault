package com.khiem.post.controller;

import com.khiem.post.dto.ApiResponse;
import com.khiem.post.dto.response.MessageRedirectResponse;
import com.khiem.post.dto.response.UserProfileResponse;
import com.khiem.post.repository.httpclient.ProfileClient;
import com.khiem.post.service.MessageService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserProfileController {
    ProfileClient profileClient;
    MessageService messageService;
    
    // Get user profile by ID
    @GetMapping("/{userId}/profile")
    ApiResponse<UserProfileResponse> getUserProfile(@PathVariable String userId){
        return profileClient.getProfile(userId);
    }
    
    // Initiate conversation with user
    @PostMapping("/{userId}/message")
    ApiResponse<MessageRedirectResponse> initiateMessage(@PathVariable String userId){
        return ApiResponse.<MessageRedirectResponse>builder()
                .result(messageService.initiateConversation(userId))
                .build();
    }
}
