package com.khiem.post.event;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PostCommentEvent {
    String postId;
    String userId;
    String content;
    String commentId; // Pre-generated ID
    String username;
    String avatar;
}
