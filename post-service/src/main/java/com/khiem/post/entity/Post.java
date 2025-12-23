package com.khiem.post.entity;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.MongoId;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Getter
@Setter
@Builder
@Document(value = "post")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Post {
    @MongoId
    String id;
    String userId;
    String content;
    
    // Images in post
    @Builder.Default
    List<String> images = new ArrayList<>();
    
    // Like functionality
    @Builder.Default
    Set<String> likedByUserIds = new HashSet<>();
    
    // Comments
    @Builder.Default
    List<Comment> comments = new ArrayList<>();
    
    Instant createdDate;
    Instant modifiedDate;
    
    @Getter
    @Setter
    @Builder
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class Comment {
        String id;
        String userId;
        String username;
        String avatar;
        String content;
        Instant createdDate;
    }
}
