package com.khiem.library.dto;

import java.time.Instant;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;

public class LibraryItemDto {
    private Long id;
    @NotNull
    private Long userId;
    @NotNull
    private Long bookId;
    @NotBlank
    private String shelf;
    private Instant createdAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Long getBookId() { return bookId; }
    public void setBookId(Long bookId) { this.bookId = bookId; }
    public String getShelf() { return shelf; }
    public void setShelf(String shelf) { this.shelf = shelf; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
