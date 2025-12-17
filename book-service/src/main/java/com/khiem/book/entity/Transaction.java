package com.khiem.book.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

/**
 * Transaction Entity - Tracks book borrowing transactions
 * Used for physical book borrows only
 */
@Entity
@Table(name = "transactions", indexes = {
    @Index(name = "idx_transaction_user", columnList = "userId"),
    @Index(name = "idx_transaction_book", columnList = "bookId"),
    @Index(name = "idx_transaction_status", columnList = "status"),
    @Index(name = "idx_transaction_due_date", columnList = "dueDate")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private Long userId;
    
    @Column(nullable = false)
    private Long bookId;
    
    @Column(nullable = false)
    private Instant borrowDate;
    
    private Instant dueDate;
    
    private Instant returnDate;
    
    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    private TransactionStatus status; // ACTIVE, OVERDUE, RETURNED, RETURNED_OVERDUE
    
    @Column(updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();
    
    public enum TransactionStatus {
        ACTIVE,      // Currently borrowed, not overdue
        OVERDUE,     // Currently borrowed, past due date
        RETURNED,    // Returned on time
        RETURNED_OVERDUE  // Returned late
    }
    
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }
    
    /**
     * Check if transaction is overdue
     */
    public boolean isOverdue() {
        return returnDate == null 
            && dueDate != null 
            && Instant.now().isAfter(dueDate);
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Long getBookId() { return bookId; }
    public void setBookId(Long bookId) { this.bookId = bookId; }
    public TransactionStatus getStatus() { return status; }
    public void setStatus(TransactionStatus status) { this.status = status; }
    public Instant getBorrowDate() { return borrowDate; }
    public void setBorrowDate(Instant borrowDate) { this.borrowDate = borrowDate; }
    public Instant getReturnDate() { return returnDate; }
    public void setReturnDate(Instant returnDate) { this.returnDate = returnDate; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getDueDate() { return dueDate; }
    public void setDueDate(Instant dueDate) { this.dueDate = dueDate; }
}

