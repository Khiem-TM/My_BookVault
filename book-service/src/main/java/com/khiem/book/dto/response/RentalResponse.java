package com.khiem.book.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Rental Transaction Response DTO
 */
@Data
@Builder
public class RentalResponse {
    
    private Long id;
    private Long bookId;
    private String bookTitle;
    private Long userId;
    private String userName;
    
    private Instant rentedAt;
    private Instant expiresAt;
    
    private Integer rentalPeriods;
    private Integer totalDays;
    private BigDecimal totalPrice;
    
    private String status; // ACTIVE, EXPIRED
    private String notes;
    
    /**
     * Check if rental is active
     */
    public boolean isActive() {
        return expiresAt != null && Instant.now().isBefore(expiresAt);
    }
    
    /**
     * Check if rental is expired
     */
    public boolean isExpired() {
        return expiresAt != null && Instant.now().isAfter(expiresAt);
    }
    
    /**
     * Get days remaining (0 if expired)
     */
    public long getDaysRemaining() {
        if (expiresAt == null) return 0;
        if (isExpired()) return 0;
        
        long secondsRemaining = expiresAt.getEpochSecond() - Instant.now().getEpochSecond();
        return secondsRemaining / (24 * 3600);
    }
    
    /**
     * Get hours remaining
     */
    public long getHoursRemaining() {
        if (expiresAt == null) return 0;
        if (isExpired()) return 0;
        
        long secondsRemaining = expiresAt.getEpochSecond() - Instant.now().getEpochSecond();
        return secondsRemaining / 3600;
    }
}
