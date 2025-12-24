package com.khiem.post.service;

import com.khiem.post.dto.PageResponse;
import com.khiem.post.dto.request.CommentRequest;
import com.khiem.post.dto.request.PostRequest;
import com.khiem.post.dto.response.PostResponse;
import com.khiem.post.dto.response.UserProfileResponse;
import com.khiem.post.entity.Post;
import com.khiem.post.mapper.PostMapper;
import com.khiem.post.repository.PostRepository;
import com.khiem.post.repository.httpclient.ProfileClient;
import com.khiem.post.service.RelativeDateTimeFormatter;
import com.khiem.post.event.PostLikeEvent;
import com.khiem.post.event.PostCommentEvent;
import org.springframework.kafka.core.KafkaTemplate;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PostService {
    RelativeDateTimeFormatter dateTimeFormatter;
    PostRepository postRepository;
    PostMapper postMapper;
    ProfileClient profileClient;
    KafkaTemplate<String, Object> kafkaTemplate;

    // Tạo post with images
    public PostResponse createPost(PostRequest request){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = authentication.getName();

        Post post = Post.builder()
                .content(request.getContent())
                .userId(userId)
                .images(request.getImages())
                .createdDate(Instant.now())
                .modifiedDate(Instant.now())
                .build();

        post = postRepository.save(post);
        return buildPostResponse(post, userId);
    }

    // Lấy post của user
    public PageResponse<PostResponse> getMyPosts(int page, int size){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = authentication.getName();

        UserProfileResponse userProfile = null;

        try {
            userProfile = profileClient.getProfile(userId).getResult();
        } catch (Exception e) {
            log.error("Error while getting user profile", e);
        }
        Sort sort = Sort.by("createdDate").descending();

        Pageable pageable = PageRequest.of(page - 1, size, sort);
        var pageData = postRepository.findAllByUserId(userId, pageable);

        String username = userProfile != null ? userProfile.getUsername() : null;
        String avatar = userProfile != null ? userProfile.getAvatar() : null;        var postList = pageData.getContent().stream().map(post -> {
            var postResponse = postMapper.toPostResponse(post);
            postResponse.setCreated(dateTimeFormatter.format(post.getCreatedDate()));
            postResponse.setUsername(username);
            postResponse.setAvatar(avatar);
            
            var likedBy = post.getLikedByUserIds() != null ? post.getLikedByUserIds() : new java.util.HashSet<String>();
            postResponse.setLikeCount(likedBy.size());
            postResponse.setLikedByCurrentUser(likedBy.contains(userId));
            return postResponse;
        }).toList();

        return PageResponse.<PostResponse>builder()
                .currentPage(page)
                .pageSize(pageData.getSize())
                .totalPages(pageData.getTotalPages())
                .totalElements(pageData.getTotalElements())
                .data(postList)
                .build();
    }

    // Lấy tất cả post
    public PageResponse<PostResponse> getAllPosts(int page, int size){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = authentication.getName();
        
        Sort sort = Sort.by("createdDate").descending();
        Pageable pageable = PageRequest.of(page - 1, size, sort);

        var pageData = postRepository.findAll(pageable);

        var postList = pageData.getContent().stream().map(post -> {
            var postResponse = postMapper.toPostResponse(post);
            postResponse.setCreated(dateTimeFormatter.format(post.getCreatedDate()));
            
            try {
                var userProfile = profileClient.getProfile(post.getUserId()).getResult();
                if (userProfile != null) {
                    postResponse.setUsername(userProfile.getUsername());
                    postResponse.setAvatar(userProfile.getAvatar());
                }
            } catch (Exception e) {
                log.error("Error while getting user profile for user: {}", post.getUserId(), e);
            }
              // Set like info
            var likedBy = post.getLikedByUserIds() != null ? post.getLikedByUserIds() : new java.util.HashSet<String>();
            postResponse.setLikeCount(likedBy.size());
            postResponse.setLikedByCurrentUser(likedBy.contains(currentUserId));
            
            // Set comment responses
            var comments = post.getComments() != null ? post.getComments() : new java.util.ArrayList<com.khiem.post.entity.Post.Comment>();
            var commentResponses = comments.stream().map(comment -> 
                PostResponse.CommentResponse.builder()
                    .id(comment.getId())
                    .userId(comment.getUserId())
                    .username(comment.getUsername())
                    .avatar(comment.getAvatar())
                    .content(comment.getContent())
                    .created(dateTimeFormatter.format(comment.getCreatedDate()))
                    .createdDate(comment.getCreatedDate())
                    .build()
            ).toList();
            postResponse.setComments(commentResponses);
            
            return postResponse;
        }).toList();

        return PageResponse.<PostResponse>builder()
                .currentPage(page)
                .pageSize(pageData.getSize())
                .totalPages(pageData.getTotalPages())
                .totalElements(pageData.getTotalElements())
                .data(postList)
                .build();
    }
    
    // Like post
    public PostResponse likePost(String postId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = authentication.getName();
        
        var post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        
        if (!post.getLikedByUserIds().contains(userId)) {
            kafkaTemplate.send("post-like-event", new PostLikeEvent(postId, userId));
            // Optimistic update
            post.getLikedByUserIds().add(userId);
        }
        
        return buildPostResponse(post, userId);
    }
    
    // Unlike post
    public PostResponse unlikePost(String postId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = authentication.getName();
        
        var post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        
        if (post.getLikedByUserIds().contains(userId)) {
            kafkaTemplate.send("post-unlike-event", new PostLikeEvent(postId, userId));
            // Optimistic update
            post.getLikedByUserIds().remove(userId);
        }
        
        return buildPostResponse(post, userId);
    }
    
    // Add comment
    public PostResponse addComment(CommentRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = authentication.getName();
        
        var post = postRepository.findById(request.getPostId())
                .orElseThrow(() -> new RuntimeException("Post not found"));
        
        UserProfileResponse userProfile = null;
        String username = null;
        String avatar = null;
        
        try {
            userProfile = profileClient.getProfile(userId).getResult();
            if (userProfile != null) {
                username = userProfile.getUsername();
                avatar = userProfile.getAvatar();
            }
        } catch (Exception e) {
            log.error("Error while getting user profile", e);
        }
        
        String commentId = UUID.randomUUID().toString();
        
        kafkaTemplate.send("post-comment-event", PostCommentEvent.builder()
                .postId(request.getPostId())
                .userId(userId)
                .content(request.getContent())
                .commentId(commentId)
                .username(username)
                .avatar(avatar)
                .build());

        // Optimistic update
        var comment = Post.Comment.builder()
                .id(commentId)
                .userId(userId)
                .username(username)
                .avatar(avatar)
                .content(request.getContent())
                .createdDate(Instant.now())
                .build();
        
        post.getComments().add(comment);
        
        return buildPostResponse(post, userId);
    }
    
    // Delete comment
    public PostResponse deleteComment(String postId, String commentId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = authentication.getName();
        
        var post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        
        var comment = post.getComments().stream()
                .filter(c -> c.getId().equals(commentId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        
        // Only allow delete if user is comment owner or post owner
        if (!comment.getUserId().equals(userId) && !post.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized to delete this comment");
        }
        
        post.getComments().remove(comment);
        post.setModifiedDate(Instant.now());
        post = postRepository.save(post);
        
        return buildPostResponse(post, userId);
    }
    
    // Get post by ID (for detailed view)
    public PostResponse getPostById(String postId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = authentication.getName();
        
        var post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        
        return buildPostResponseWithUserProfile(post, userId);
    }
    
    // Helper method to build PostResponse with all details
    private PostResponse buildPostResponse(Post post, String currentUserId) {
        UserProfileResponse userProfile = null;
        String username = null;
        String avatar = null;
        
        try {
            userProfile = profileClient.getProfile(post.getUserId()).getResult();
            if (userProfile != null) {
                username = userProfile.getUsername();
                avatar = userProfile.getAvatar();
            }
        } catch (Exception e) {
            log.error("Error while getting user profile", e);
        }
        
        var commentResponses = post.getComments().stream().map(comment -> 
            PostResponse.CommentResponse.builder()
                .id(comment.getId())
                .userId(comment.getUserId())
                .username(comment.getUsername())
                .avatar(comment.getAvatar())
                .content(comment.getContent())
                .created(dateTimeFormatter.format(comment.getCreatedDate()))
                .createdDate(comment.getCreatedDate())
                .build()
        ).toList();
        
        return PostResponse.builder()
                .id(post.getId())
                .content(post.getContent())
                .userId(post.getUserId())
                .username(username)
                .avatar(avatar)
                .images(post.getImages())
                .likeCount(post.getLikedByUserIds().size())
                .isLikedByCurrentUser(post.getLikedByUserIds().contains(currentUserId))
                .comments(commentResponses)
                .created(dateTimeFormatter.format(post.getCreatedDate()))
                .createdDate(post.getCreatedDate())
                .modifiedDate(post.getModifiedDate())
                .build();
    }
    
    private PostResponse buildPostResponseWithUserProfile(Post post, String currentUserId) {
        return buildPostResponse(post, currentUserId);
    }
}
