package com.khiem.post.controller;

import com.khiem.post.dto.ApiResponse;
import com.khiem.post.dto.PageResponse;
import com.khiem.post.dto.request.CommentRequest;
import com.khiem.post.dto.request.PostRequest;
import com.khiem.post.dto.response.FileResponse;
import com.khiem.post.dto.response.PostResponse;
import com.khiem.post.service.FileUploadService;
import com.khiem.post.service.PostService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.RequestMapping;

@RestController
@RequestMapping("")
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PostController {
    PostService postService;
    FileUploadService fileUploadService;

    // Tạo post with images
    @PostMapping("/create")
    ApiResponse<PostResponse> createPost(@RequestBody PostRequest request){
        return ApiResponse.<PostResponse>builder()
                .result(postService.createPost(request))
                .build();
    }

    // Lấy post của user
    @GetMapping("/my-posts")
    ApiResponse<PageResponse<PostResponse>> myPosts(
            @RequestParam(value = "page", required = false, defaultValue = "1") int page,
            @RequestParam(value = "size", required = false, defaultValue = "10") int size
            ){
        return ApiResponse.<PageResponse<PostResponse>>builder()
                .result(postService.getMyPosts(page, size))
                .build();
    }

    // Lấy tất cả post
    @GetMapping({"", "/"})
    ApiResponse<PageResponse<PostResponse>> getAllPosts(
            @RequestParam(value = "page", required = false, defaultValue = "1") int page,
            @RequestParam(value = "size", required = false, defaultValue = "10") int size
    ){
        return ApiResponse.<PageResponse<PostResponse>>builder()
                .result(postService.getAllPosts(page, size))
                .build();
    }
    
    // Lấy post by ID
    @GetMapping("/{postId}")
    ApiResponse<PostResponse> getPostById(@PathVariable String postId){
        return ApiResponse.<PostResponse>builder()
                .result(postService.getPostById(postId))
                .build();
    }
    
    // Like post
    @PostMapping("/{postId}/like")
    ApiResponse<PostResponse> likePost(@PathVariable String postId){
        return ApiResponse.<PostResponse>builder()
                .result(postService.likePost(postId))
                .build();
    }
    
    // Unlike post
    @PostMapping("/{postId}/unlike")
    ApiResponse<PostResponse> unlikePost(@PathVariable String postId){
        return ApiResponse.<PostResponse>builder()
                .result(postService.unlikePost(postId))
                .build();
    }
    
    // Add comment
    @PostMapping("/comment")
    ApiResponse<PostResponse> addComment(@RequestBody CommentRequest request){
        return ApiResponse.<PostResponse>builder()
                .result(postService.addComment(request))
                .build();
    }
    
    // Delete comment
    @DeleteMapping("/{postId}/comment/{commentId}")
    ApiResponse<PostResponse> deleteComment(
            @PathVariable String postId,
            @PathVariable String commentId){
        return ApiResponse.<PostResponse>builder()
                .result(postService.deleteComment(postId, commentId))
                .build();
    }

    // Upload image for post
    @PostMapping(value = "/upload-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    ApiResponse<FileResponse> uploadPostImage(@RequestParam("file") MultipartFile file){
        return ApiResponse.<FileResponse>builder()
                .result(fileUploadService.uploadPostImage(file))
                .build();
    }
}
