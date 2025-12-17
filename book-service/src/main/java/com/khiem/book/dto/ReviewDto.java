package com.khiem.book.dto;

import java.time.Instant;
import jakarta.validation.constraints.*;

/**
 * @deprecated This DTO is replaced by BookReviewRequest and ReviewResponse.
 * Use the new Request/Response pattern for all new development.
 * This class will be removed in version 3.0.
 * 
 * @see com.khiem.book.dto.request.BookReviewRequest
 * @see com.khiem.book.dto.response.ReviewResponse
 */
@Deprecated(since = "2.0", forRemoval = true)
public class ReviewDto {
    private String id;
    @NotNull
    private Long bookId;
    @NotNull
    private Long userId;
    @Min(1)
    @Max(5)
    private Integer rating;
    @NotBlank
    private String content;
    private Instant createdAt;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public Long getBookId() { return bookId; }
    public void setBookId(Long bookId) { this.bookId = bookId; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
