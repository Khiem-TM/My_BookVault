package com.khiem.post.dto.response;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PostResponse {
    String id;
    String content;
    String userId;
    String username;
    String avatar;
    
    // Images in post
    @Builder.Default
    List<String> images = new ArrayList<>();
    
    // Like count and check if current user liked
    long likeCount;
    @JsonProperty("isLikedByCurrentUser")
    boolean isLikedByCurrentUser;
    
    // Comments
    @Builder.Default
    List<CommentResponse> comments = new ArrayList<>();
    
    String created;
    Instant createdDate;
    Instant modifiedDate;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class CommentResponse {
        String id;
        String userId;
        String username;
        String avatar;
        String content;
        String created;
        Instant createdDate;
    }
}
