package com.khiem.book.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import lombok.*;

/**
 * Book Entity - Represents both physical and digital books
 * 
 * Business Rules:
 * - PHYSICAL_BOOK: Has quantity, can be borrowed
 * - DIGITAL_FREE_BOOK: Unlimited access, no rental
 * - DIGITAL_LICENSED_BOOK: Requires rental payment with time limit
 */
@Entity
@Table(name = "books", indexes = {
    @Index(name = "idx_book_title", columnList = "title"),
    @Index(name = "idx_book_author", columnList = "author"),
    @Index(name = "idx_book_isbn", columnList = "isbn", unique = true),
    @Index(name = "idx_book_type", columnList = "bookType"),
    @Index(name = "idx_book_status", columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Book {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String author;

    @Column(unique = true)
    private String isbn;

    @Column(length = 2000)
    private String description;

    @ElementCollection
    @CollectionTable(name = "book_categories", joinColumns = @JoinColumn(name = "book_id"))
    @Column(name = "category")
    private List<String> categories;

    private LocalDate publishedAt;

    // === NEW: Book Type & Status ===
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private BookType bookType = BookType.PHYSICAL_BOOK;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private BookStatus status = BookStatus.AVAILABLE;

    // === NEW: Physical Book Inventory ===
    /**
     * Total quantity (for PHYSICAL_BOOK only)
     * NULL for digital books
     */
    private Integer totalQuantity;

    /**
     * Currently available quantity (for PHYSICAL_BOOK only)
     * availableQuantity = totalQuantity - borrowed
     */
    private Integer availableQuantity;

    // === NEW: Digital Book Rental Info ===
    /**
     * Rental price per rental period (for DIGITAL_LICENSED_BOOK only)
     */
    private BigDecimal rentalPrice;

    /**
     * Rental duration in days (for DIGITAL_LICENSED_BOOK only)
     */
    private Integer rentalDurationDays;

    // === Existing Fields ===
    private String publisher;
    private String thumbnailUrl;
    private Integer pageCount;
    
    @Builder.Default
    private Double averageRating = 0.0;
    
    @Builder.Default
    private Integer ratingsCount = 0;
    
    private String language;

    // === Audit Fields ===
    @Column(updatable = false)
    private Instant createdAt;

    private Instant updatedAt;

    private Long createdBy; // Admin user ID

    private Long updatedBy; // Admin user ID

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }

    // === Business Logic Methods ===

    /**
     * Check if book is available for borrowing (physical books)
     */
    public boolean isAvailableForBorrowing() {
        return bookType == BookType.PHYSICAL_BOOK 
            && status == BookStatus.AVAILABLE 
            && availableQuantity != null 
            && availableQuantity > 0;
    }

    /**
     * Check if book is available for rental (digital licensed books)
     */
    public boolean isAvailableForRental() {
        return bookType == BookType.DIGITAL_LICENSED_BOOK 
            && status == BookStatus.AVAILABLE
            && rentalPrice != null
            && rentalDurationDays != null;
    }

    /**
     * Check if book is free to read (digital free books)
     */
    public boolean isFreeToRead() {
        return bookType == BookType.DIGITAL_FREE_BOOK 
            && status == BookStatus.AVAILABLE;
    }

    /**
     * Decrease available quantity when borrowed
     */
    public void decreaseQuantity() {
        if (availableQuantity != null && availableQuantity > 0) {
            availableQuantity--;
            if (availableQuantity == 0) {
                status = BookStatus.OUT_OF_STOCK;
            }
        }
    }

    /**
     * Increase available quantity when returned
     */
    public void increaseQuantity() {
        if (availableQuantity != null && totalQuantity != null) {
            availableQuantity++;
            if (status == BookStatus.OUT_OF_STOCK && availableQuantity > 0) {
                status = BookStatus.AVAILABLE;
            }
        }
    }

    /**
     * Update rating statistics
     */
    public void updateRating(Double newAverageRating, Integer newRatingsCount) {
        this.averageRating = newAverageRating;
        this.ratingsCount = newRatingsCount;
    }
}

