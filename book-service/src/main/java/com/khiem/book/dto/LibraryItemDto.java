package com.khiem.book.dto;

import java.time.Instant;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;

/**
 * @deprecated This DTO is not used in the new clean architecture.
 * LibraryItem functionality will be integrated into the new services.
 * This class will be removed in version 3.0.
 */
@Deprecated(since = "2.0", forRemoval = true)
public class LibraryItemDto {
    private Long id;
    @NotNull
    private String userId;
    @NotNull
    private Long bookId;
    @NotBlank
    private String shelf;
    private Instant createdAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public Long getBookId() { return bookId; }
    public void setBookId(Long bookId) { this.bookId = bookId; }
    public String getShelf() { return shelf; }
    public void setShelf(String shelf) { this.shelf = shelf; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
