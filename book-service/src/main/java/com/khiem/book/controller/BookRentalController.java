package com.khiem.book.controller;

import com.khiem.book.dto.ApiResponse;
import com.khiem.book.dto.PageResponse;
import com.khiem.book.dto.request.RentBookRequest;
import com.khiem.book.dto.response.RentalResponse;
import com.khiem.book.service.BookRentalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Book Rental Controller
 * 
 * Responsibilities:
 * - Rent digital licensed books (User)
 * - View active rentals (User)
 * - View rental history (User)
 * - Cancel pending rentals (User)
 * - Admin: View all rentals, overdue rentals, force return
 * 
 * Business Rules:
 * - Only DIGITAL_LICENSED_BOOK can be rented
 * - No limit on active rentals per user
 * - Support 1-12 rental periods
 * - Automatic expiry tracking
 * 
 * @author Clean Architecture Refactoring
 * @version 2.0
 */
@RestController
@RequestMapping("/api/rentals")
@RequiredArgsConstructor
@Slf4j
public class BookRentalController {

    private final BookRentalService bookRentalService;

    /**
     * Rent a digital book
     * 
     * POST /api/rentals
     * 
     * @param request Rental request
     * @param authentication User authentication
     * @return Rental transaction details
     * 
     * Security: Requires authentication and RENT_BOOK permission
     */
    @PostMapping
    @PreAuthorize("isAuthenticated() and (hasAuthority('RENT_BOOK') or hasRole('USER'))")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<RentalResponse> rentBook(
            @Valid @RequestBody RentBookRequest request,
            Authentication authentication) {
        
        Long userId = getUserIdFromAuth(authentication);
        
        log.info("💰 User {} renting book {} for {} period(s)", 
                userId, request.getBookId(), request.getRentalPeriods());
        
        RentalResponse response = bookRentalService.rentBook(userId, request);
        
        return ApiResponse.<RentalResponse>builder()
                .code(201)
                .message("Book rented successfully")
                .result(response)
                .build();
    }

    /**
     * Get user's active rentals
     * 
     * GET /api/rentals/active
     * 
     * @param authentication User authentication
     * @return List of active rentals
     */
    @GetMapping("/active")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<List<RentalResponse>> getActiveRentals(
            Authentication authentication) {
        
        Long userId = getUserIdFromAuth(authentication);
        
        log.debug("📱 User {} fetching active rentals", userId);
        
        List<RentalResponse> rentals = bookRentalService.getActiveRentals(userId);
        
        return ApiResponse.<List<RentalResponse>>builder()
                .code(200)
                .result(rentals)
                .build();
    }

    /**
     * Get user's rental history
     * 
     * GET /api/rentals/history
     * 
     * @param authentication User authentication
     * @return List of all rentals
     */
    @GetMapping("/history")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<List<RentalResponse>> getRentalHistory(
            Authentication authentication) {
        
        Long userId = getUserIdFromAuth(authentication);
        
        log.debug("📋 User {} fetching rental history", userId);
        
        List<RentalResponse> rentals = bookRentalService.getRentalHistory(userId);
        
        return ApiResponse.<List<RentalResponse>>builder()
                .code(200)
                .result(rentals)
                .build();
    }

    /**
     * Cancel a pending rental
     * 
     * DELETE /api/rentals/{orderId}
     * 
     * @param orderId Order ID
     * @param authentication User authentication
     * @return Success message
     */
    @DeleteMapping("/{orderId}")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<Void> cancelRental(
            @PathVariable Long orderId,
            Authentication authentication) {
        
        Long userId = getUserIdFromAuth(authentication);
        
        log.info("❌ User {} cancelling rental order {}", userId, orderId);
        
        bookRentalService.cancelRental(userId, orderId);
        
        return ApiResponse.<Void>builder()
                .code(200)
                .message("Rental cancelled successfully")
                .build();
    }

    /**
     * Check if rental is active
     * 
     * GET /api/rentals/check/{bookId}
     * 
     * @param bookId Book ID
     * @param authentication User authentication
     * @return Active status
     */
    @GetMapping("/check/{bookId}")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<Boolean> isRentalActive(
            @PathVariable Long bookId,
            Authentication authentication) {
        
        Long userId = getUserIdFromAuth(authentication);
        
        log.debug("🔍 Checking if user {} has active rental for book {}", userId, bookId);
        
        boolean isActive = bookRentalService.isRentalActive(userId, bookId);
        
        return ApiResponse.<Boolean>builder()
                .code(200)
                .result(isActive)
                .build();
    }

    /**
     * Admin: Get all overdue rentals
     * 
     * GET /api/rentals/admin/overdue
     * 
     * @return List of overdue rentals
     */
    @GetMapping("/admin/overdue")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<RentalResponse>> getOverdueRentals() {
        
        log.debug("⚠️ Admin fetching overdue rentals");
        
        List<RentalResponse> rentals = bookRentalService.getOverdueRentals();
        
        return ApiResponse.<List<RentalResponse>>builder()
                .code(200)
                .message(rentals.size() + " overdue rental(s) found")
                .result(rentals)
                .build();
    }

    /**
     * Admin: Force return an overdue rental
     * 
     * POST /api/rentals/admin/{orderId}/force-return
     * 
     * @param orderId Order ID
     * @return Success message
     */
    @PostMapping("/admin/{orderId}/force-return")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> forceReturnRental(@PathVariable Long orderId) {
        
        log.info("🔒 Admin forcing return of rental order {}", orderId);
        
        bookRentalService.forceReturnRental(orderId);
        
        return ApiResponse.<Void>builder()
                .code(200)
                .message("Rental returned successfully")
                .build();
    }

    /**
     * Admin: Trigger manual expiry check
     * 
     * POST /api/rentals/admin/check-expired
     * 
     * @return Success message
     */
    @PostMapping("/admin/check-expired")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> checkExpiredRentals() {
        
        log.info("🔄 Admin triggering manual expiry check");
        
        bookRentalService.markExpiredRentals();
        
        return ApiResponse.<Void>builder()
                .code(200)
                .message("Expired rentals checked successfully")
                .build();
    }

    // Helper method to extract userId from authentication
    private Long getUserIdFromAuth(Authentication authentication) {
        try {
            return Long.parseLong(authentication.getName());
        } catch (NumberFormatException e) {
            log.warn("Could not parse userId from authentication: {}", authentication.getName());
            throw new RuntimeException("Invalid user authentication");
        }
    }
}
