package com.khiem.book.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponse {
    private String id;
    private Long bookId;
    private Long userId;
    private Integer rating; // 1-5
    private String content;
    private boolean verified; // User actually borrowed/rented the book
    private Instant createdAt;
    private Instant updatedAt;
}
