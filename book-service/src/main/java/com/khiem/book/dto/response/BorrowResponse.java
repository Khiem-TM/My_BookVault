package com.khiem.book.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

/**
 * Borrow Transaction Response DTO
 */
@Data
@Builder
public class BorrowResponse {
    
    private Long id;
    private Long bookId;
    private String bookTitle;
    private Long userId;
    private String userName;
    
    private Instant borrowedAt;
    private Instant dueDate;
    private Instant returnedAt;
    
    private String status; // ACTIVE, RETURNED, OVERDUE
    private String notes;
    
    /**
     * Check if borrow is overdue
     */
    public boolean isOverdue() {
        return returnedAt == null 
            && dueDate != null 
            && Instant.now().isAfter(dueDate);
    }
    
    /**
     * Get days remaining (negative if overdue)
     */
    public long getDaysRemaining() {
        if (returnedAt != null) return 0;
        if (dueDate == null) return 0;
        
        long secondsRemaining = dueDate.getEpochSecond() - Instant.now().getEpochSecond();
        return secondsRemaining / (24 * 3600);
    }
}
