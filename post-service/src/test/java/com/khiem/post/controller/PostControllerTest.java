package com.khiem.post.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.khiem.post.dto.request.PostRequest;
import com.khiem.post.dto.response.PostResponse;
import com.khiem.post.service.FileUploadService;
import com.khiem.post.service.PostService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import com.khiem.post.dto.request.CommentRequest;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(PostController.class)
@AutoConfigureMockMvc(addFilters = false) // Disable security filters if any
public class PostControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PostService postService;

    @MockBean
    private FileUploadService fileUploadService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void createPost_validRequest_success() throws Exception {
        PostRequest request = PostRequest.builder()
                .content("Test content")
                .images(List.of("img1", "img2"))
                .build();

        PostResponse response = PostResponse.builder()
                .id("post-1")
                .content("Test content")
                .userId("user-1")
                .images(List.of("img1", "img2"))
                .build();

        Mockito.when(postService.createPost(any(PostRequest.class))).thenReturn(response);

        mockMvc.perform(MockMvcRequestBuilders.post("/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result.id").value("post-1"))
                .andExpect(jsonPath("$.result.content").value("Test content"));
    }

    @Test
    void getPostById_validId_success() throws Exception {
        PostResponse response = PostResponse.builder()
                .id("post-1")
                .content("Test content")
                .userId("user-1")
                .build();

        Mockito.when(postService.getPostById(anyString())).thenReturn(response);

        mockMvc.perform(MockMvcRequestBuilders.get("/post-1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result.id").value("post-1"))
                .andExpect(jsonPath("$.result.content").value("Test content"));
    }

    @Test
    void likePost_validId_success() throws Exception {
        PostResponse response = PostResponse.builder()
                .id("post-1")
                .likeCount(1)
                .isLikedByCurrentUser(true)
                .build();

        Mockito.when(postService.likePost(anyString())).thenReturn(response);

        mockMvc.perform(MockMvcRequestBuilders.post("/post-1/like"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result.id").value("post-1"))
                .andExpect(jsonPath("$.result.isLikedByCurrentUser").value(true));
    }

    @Test
    void addComment_validRequest_success() throws Exception {
        CommentRequest request = CommentRequest.builder()
                .postId("post-1")
                .content("Nice post")
                .build();

        PostResponse.CommentResponse commentResponse = PostResponse.CommentResponse.builder()
                .id("comment-1")
                .content("Nice post")
                .username("user1")
                .build();

        PostResponse response = PostResponse.builder()
                .id("post-1")
                .comments(List.of(commentResponse))
                .build();

        Mockito.when(postService.addComment(any(CommentRequest.class))).thenReturn(response);

        mockMvc.perform(MockMvcRequestBuilders.post("/comment")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result.id").value("post-1"))
                .andExpect(jsonPath("$.result.comments[0].content").value("Nice post"));
    }
}
