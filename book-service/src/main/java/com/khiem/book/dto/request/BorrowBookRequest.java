package com.khiem.book.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * User Request DTO for borrowing physical books
 */
@Data
public class BorrowBookRequest {
    
    @NotNull(message = "Book ID is required")
    private Long bookId;

    @NotNull(message = "User ID is required")
    private Long userId;

    /**
     * Borrow duration in days (default: 14 days)
     */
    @Min(value = 1, message = "Borrow duration must be at least 1 day")
    @Max(value = 90, message = "Borrow duration cannot exceed 90 days")
    private Integer borrowDurationDays = 14;

    @Size(max = 500, message = "Notes must not exceed 500 characters")
    private String notes;
}
