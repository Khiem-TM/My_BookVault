package com.khiem.order.dto;

import com.khiem.order.entity.Order.Status;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;

public class OrderDto {
    private Long id;
    @NotNull
    private Long userId;
    @NotNull
    private Long bookId;
    private Status status;
    private Instant createdAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Long getBookId() { return bookId; }
    public void setBookId(Long bookId) { this.bookId = bookId; }
    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}

