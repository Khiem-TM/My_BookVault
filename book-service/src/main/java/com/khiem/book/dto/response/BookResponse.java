package com.khiem.book.dto.response;

import com.khiem.book.entity.BookStatus;
import com.khiem.book.entity.BookType;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

/**
 * Book Response DTO - Used for both admin and user views
 * Contains all book information
 */
@Data
@Builder
public class BookResponse {
    
    private Long id;
    private String title;
    private String author;
    private String isbn;
    private String description;
    private List<String> categories;
    private LocalDate publishedAt;
    private String publisher;
    private String thumbnailUrl;
    private Integer pageCount;
    private String language;

    // === Type & Status ===
    private BookType bookType;
    private BookStatus status;

    // === Availability Info ===
    private Integer totalQuantity;
    private Integer availableQuantity;
    private Boolean isAvailable; // Computed field

    // === Rental Info (for licensed books) ===
    private BigDecimal rentalPrice;
    private Integer rentalDurationDays;

    // === Rating Info ===
    private Double averageRating;
    private Integer ratingsCount;

    // === Audit Info ===
    private Instant createdAt;
    private Instant updatedAt;

    /**
     * Check if user can borrow this book
     */
    public boolean canBorrow() {
        return bookType == BookType.PHYSICAL_BOOK 
            && status == BookStatus.AVAILABLE 
            && availableQuantity != null 
            && availableQuantity > 0;
    }

    /**
     * Check if user can rent this book
     */
    public boolean canRent() {
        return bookType == BookType.DIGITAL_LICENSED_BOOK 
            && status == BookStatus.AVAILABLE;
    }

    /**
     * Check if user can read this book for free
     */
    public boolean canReadFree() {
        return bookType == BookType.DIGITAL_FREE_BOOK 
            && status == BookStatus.AVAILABLE;
    }
}
