package com.khiem.book.dto.request;

import com.khiem.book.entity.BookType;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Admin Request DTO for creating/updating books
 */
@Data
public class BookManagementRequest {
    
    @NotBlank(message = "Title is required")
    @Size(min = 1, max = 255, message = "Title must be between 1 and 255 characters")
    private String title;

    @NotBlank(message = "Author is required")
    @Size(min = 1, max = 255, message = "Author must be between 1 and 255 characters")
    private String author;

    @Size(max = 20, message = "ISBN must not exceed 20 characters")
    private String isbn;

    @Size(max = 2000, message = "Description must not exceed 2000 characters")
    private String description;

    private List<String> categories;

    private LocalDate publishedAt;

    private String publisher;

    private String thumbnailUrl;

    private Integer pageCount;

    private String language;

    // === Book Type Configuration ===
    
    @NotNull(message = "Book type is required")
    private BookType bookType;

    // === Physical Book Fields ===
    
    /**
     * Required for PHYSICAL_BOOK, must be > 0
     */
    @Min(value = 0, message = "Total quantity must be >= 0")
    private Integer totalQuantity;

    // === Digital Licensed Book Fields ===
    
    /**
     * Required for DIGITAL_LICENSED_BOOK, must be > 0
     */
    @DecimalMin(value = "0.01", message = "Rental price must be > 0")
    private BigDecimal rentalPrice;

    /**
     * Required for DIGITAL_LICENSED_BOOK, must be > 0
     */
    @Min(value = 1, message = "Rental duration must be at least 1 day")
    private Integer rentalDurationDays;

    // === Business Validation ===
    
    public void validate() {
        if (bookType == BookType.PHYSICAL_BOOK) {
            if (totalQuantity == null || totalQuantity <= 0) {
                throw new IllegalArgumentException("Physical books must have totalQuantity > 0");
            }
        }
        
        if (bookType == BookType.DIGITAL_LICENSED_BOOK) {
            if (rentalPrice == null || rentalPrice.compareTo(BigDecimal.ZERO) <= 0) {
                throw new IllegalArgumentException("Licensed books must have rentalPrice > 0");
            }
            if (rentalDurationDays == null || rentalDurationDays <= 0) {
                throw new IllegalArgumentException("Licensed books must have rentalDurationDays > 0");
            }
        }
    }
}
