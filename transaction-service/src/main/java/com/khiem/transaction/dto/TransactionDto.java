package com.khiem.transaction.dto;

import com.khiem.transaction.entity.Transaction;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;

public class TransactionDto {
    private Long id;
    @NotNull
    private Long userId;
    @NotNull
    private Long bookId;
    @NotNull
    private Transaction.Type type;
    private Transaction.Status status;
    private Instant createdAt;
    private Instant dueDate;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Long getBookId() { return bookId; }
    public void setBookId(Long bookId) { this.bookId = bookId; }
    public Transaction.Type getType() { return type; }
    public void setType(Transaction.Type type) { this.type = type; }
    public Transaction.Status getStatus() { return status; }
    public void setStatus(Transaction.Status status) { this.status = status; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getDueDate() { return dueDate; }
    public void setDueDate(Instant dueDate) { this.dueDate = dueDate; }
}

