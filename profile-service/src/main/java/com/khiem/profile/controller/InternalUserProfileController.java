package com.khiem.profile.controller;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.khiem.profile.dto.ApiResponse;
import com.khiem.profile.dto.request.ProfileCreationRequest;
import com.khiem.profile.dto.response.UserProfileResponse;
import com.khiem.profile.service.UserProfileService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class InternalUserProfileController {
    UserProfileService userProfileService;

    // Gọi khi tạo user --> identity service --> profile service --> tạo UserProfile
    @PostMapping("/internal/users")
    ApiResponse<UserProfileResponse> createProfile(@RequestBody ProfileCreationRequest request) {
        return ApiResponse.<UserProfileResponse>builder()
                .result(userProfileService.createProfile(request))
                .build();
    }

    // Lấy profile theo userID
    @GetMapping("/internal/users/{userId}")
    ApiResponse<UserProfileResponse> getProfile(@PathVariable String userId) {
        return ApiResponse.<UserProfileResponse>builder()
                .result(userProfileService.getByUserId(userId))
                .build();
    }

    @DeleteMapping("/internal/users/{userId}")
    ApiResponse<Void> deleteProfile(@PathVariable String userId) {
        userProfileService.deleteByUserId(userId);
        return ApiResponse.<Void>builder().build();
    }
}
