package com.khiem.book.dto;

import com.khiem.book.entity.Transaction;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;

/**
 * Legacy DTO - Use BorrowResponse instead for new code
 */
@Deprecated
public class TransactionDto {
    private Long id;
    @NotNull
    private Long userId;
    @NotNull
    private Long bookId;
    private Transaction.TransactionStatus status;
    private Instant borrowDate;
    private Instant dueDate;
    private Instant returnDate;
    private Instant createdAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Long getBookId() { return bookId; }
    public void setBookId(Long bookId) { this.bookId = bookId; }
    public Transaction.TransactionStatus getStatus() { return status; }
    public void setStatus(Transaction.TransactionStatus status) { this.status = status; }
    public Instant getBorrowDate() { return borrowDate; }
    public void setBorrowDate(Instant borrowDate) { this.borrowDate = borrowDate; }
    public Instant getDueDate() { return dueDate; }
    public void setDueDate(Instant dueDate) { this.dueDate = dueDate; }
    public Instant getReturnDate() { return returnDate; }
    public void setReturnDate(Instant returnDate) { this.returnDate = returnDate; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}

