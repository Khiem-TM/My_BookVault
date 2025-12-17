package com.khiem.book.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * User Request DTO for renting digital licensed books
 */
@Data
public class RentBookRequest {
    
    @NotNull(message = "Book ID is required")
    private Long bookId;

    @NotNull(message = "User ID is required")
    private Long userId;

    /**
     * Number of rental periods (default: 1)
     * Total rental time = rentalPeriods * book.rentalDurationDays
     */
    @Min(value = 1, message = "Rental periods must be at least 1")
    @Max(value = 12, message = "Rental periods cannot exceed 12")
    private Integer rentalPeriods = 1;

    @Size(max = 500, message = "Notes must not exceed 500 characters")
    private String notes;
}
