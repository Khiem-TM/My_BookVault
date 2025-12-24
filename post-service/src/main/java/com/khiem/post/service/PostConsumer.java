package com.khiem.post.service;

import com.khiem.post.entity.Post;
import com.khiem.post.event.PostCommentEvent;
import com.khiem.post.event.PostLikeEvent;
import com.khiem.post.repository.PostRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PostConsumer {
    PostRepository postRepository;

    @KafkaListener(topics = "post-like-event", groupId = "post-group")
    public void consumeLikeEvent(PostLikeEvent event) {
        try {
            var post = postRepository.findById(event.getPostId())
                    .orElseThrow(() -> new RuntimeException("Post not found"));
            
            if (!post.getLikedByUserIds().contains(event.getUserId())) {
                post.getLikedByUserIds().add(event.getUserId());
                post.setModifiedDate(Instant.now());
                postRepository.save(post);
            }
        } catch (Exception e) {
            log.error("Error processing like event", e);
        }
    }

    @KafkaListener(topics = "post-unlike-event", groupId = "post-group")
    public void consumeUnlikeEvent(PostLikeEvent event) {
        try {
            var post = postRepository.findById(event.getPostId())
                    .orElseThrow(() -> new RuntimeException("Post not found"));

            if (post.getLikedByUserIds().contains(event.getUserId())) {
                post.getLikedByUserIds().remove(event.getUserId());
                post.setModifiedDate(Instant.now());
                postRepository.save(post);
            }
        } catch (Exception e) {
            log.error("Error processing unlike event", e);
        }
    }

    @KafkaListener(topics = "post-comment-event", groupId = "post-group")
    public void consumeCommentEvent(PostCommentEvent event) {
        try {
            var post = postRepository.findById(event.getPostId())
                    .orElseThrow(() -> new RuntimeException("Post not found"));

            var comment = Post.Comment.builder()
                    .id(event.getCommentId())
                    .userId(event.getUserId())
                    .username(event.getUsername())
                    .avatar(event.getAvatar())
                    .content(event.getContent())
                    .createdDate(Instant.now())
                    .build();

            post.getComments().add(comment);
            post.setModifiedDate(Instant.now());
            postRepository.save(post);
        } catch (Exception e) {
            log.error("Error processing comment event", e);
        }
    }
}
