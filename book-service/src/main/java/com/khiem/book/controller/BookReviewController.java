package com.khiem.book.controller;

import com.khiem.book.dto.ApiResponse;
import com.khiem.book.dto.request.BookReviewRequest;
import com.khiem.book.dto.response.ReviewResponse;
import com.khiem.book.service.BookReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Book Review Controller
 * 
 * Responsibilities:
 * - Create/Update reviews (User - must have borrowed/rented the book)
 * - Get book reviews (Public)
 * - Get user reviews (User/Public)
 * - Delete reviews (User own reviews, Admin any review)
 * - Get review statistics (Public)
 * 
 * Business Rules:
 * - Only verified users (borrowed/rented) can review
 * - Rating: 1-5 stars
 * - One review per user per book (can be updated)
 * - Average rating cached in Book entity
 * 
 * @author Clean Architecture Refactoring
 * @version 2.0
 */
@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
@Slf4j
public class BookReviewController {

    private final BookReviewService bookReviewService;

    /**
     * Create or update a review
     * 
     * POST /api/reviews
     * 
     * @param request Review request
     * @param authentication User authentication
     * @return Review details
     * 
     * Security: Requires authentication and REVIEW_BOOK permission
     */
    @PostMapping
    @PreAuthorize("isAuthenticated() and (hasAuthority('REVIEW_BOOK') or hasRole('USER'))")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<ReviewResponse> createOrUpdateReview(
            @Valid @RequestBody BookReviewRequest request,
            Authentication authentication) {
        
        Long userId = getUserIdFromAuth(authentication);
        
        log.info("⭐ User {} creating/updating review for book {}: rating={}", 
                userId, request.getBookId(), request.getRating());
        
        ReviewResponse response = bookReviewService.createOrUpdateReview(userId, request);
        
        return ApiResponse.<ReviewResponse>builder()
                .code(201)
                .message(response.isVerified() 
                        ? "Review submitted successfully (verified)" 
                        : "Review submitted successfully")
                .result(response)
                .build();
    }

    /**
     * Get all reviews for a book
     * 
     * GET /api/reviews/book/{bookId}
     * 
     * @param bookId Book ID
     * @return List of reviews
     */
    @GetMapping("/book/{bookId}")
    public ApiResponse<List<ReviewResponse>> getBookReviews(@PathVariable Long bookId) {
        
        log.debug("📖 Fetching reviews for book {}", bookId);
        
        List<ReviewResponse> reviews = bookReviewService.getBookReviews(bookId);
        
        return ApiResponse.<List<ReviewResponse>>builder()
                .code(200)
                .result(reviews)
                .build();
    }

    /**
     * Get all reviews by a user
     * 
     * GET /api/reviews/user/{userId}
     * 
     * @param userId User ID
     * @return List of user's reviews
     */
    @GetMapping("/user/{userId}")
    public ApiResponse<List<ReviewResponse>> getUserReviews(@PathVariable Long userId) {
        
        log.debug("✍️ Fetching reviews by user {}", userId);
        
        List<ReviewResponse> reviews = bookReviewService.getUserReviews(userId);
        
        return ApiResponse.<List<ReviewResponse>>builder()
                .code(200)
                .result(reviews)
                .build();
    }

    /**
     * Get current user's reviews
     * 
     * GET /api/reviews/my-reviews
     * 
     * @param authentication User authentication
     * @return List of user's reviews
     */
    @GetMapping("/my-reviews")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<List<ReviewResponse>> getMyReviews(Authentication authentication) {
        
        Long userId = getUserIdFromAuth(authentication);
        
        log.debug("📝 User {} fetching own reviews", userId);
        
        List<ReviewResponse> reviews = bookReviewService.getUserReviews(userId);
        
        return ApiResponse.<List<ReviewResponse>>builder()
                .code(200)
                .result(reviews)
                .build();
    }

    /**
     * Delete own review
     * 
     * DELETE /api/reviews/{reviewId}
     * 
     * @param reviewId Review ID
     * @param authentication User authentication
     * @return Success message
     */
    @DeleteMapping("/{reviewId}")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<Void> deleteReview(
            @PathVariable String reviewId,
            Authentication authentication) {
        
        Long userId = getUserIdFromAuth(authentication);
        
        log.info("🗑️ User {} deleting review {}", userId, reviewId);
        
        bookReviewService.deleteReview(userId, reviewId);
        
        return ApiResponse.<Void>builder()
                .code(200)
                .message("Review deleted successfully")
                .build();
    }

    /**
     * Check if user can review a book
     * 
     * GET /api/reviews/can-review/{bookId}
     * 
     * @param bookId Book ID
     * @param authentication User authentication
     * @return Eligibility status
     */
    @GetMapping("/can-review/{bookId}")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<Boolean> canReviewBook(
            @PathVariable Long bookId,
            Authentication authentication) {
        
        Long userId = getUserIdFromAuth(authentication);
        
        log.debug("🔍 Checking if user {} can review book {}", userId, bookId);
        
        boolean canReview = bookReviewService.canUserReviewBook(userId, bookId);
        
        return ApiResponse.<Boolean>builder()
                .code(200)
                .message(canReview 
                        ? "User is eligible to review this book" 
                        : "User must borrow or rent the book first")
                .result(canReview)
                .build();
    }

    /**
     * Get review statistics for a book
     * 
     * GET /api/reviews/book/{bookId}/statistics
     * 
     * @param bookId Book ID
     * @return Review statistics
     */
    @GetMapping("/book/{bookId}/statistics")
    public ApiResponse<BookReviewService.ReviewStatistics> getBookReviewStatistics(
            @PathVariable Long bookId) {
        
        log.debug("📊 Fetching review statistics for book {}", bookId);
        
        BookReviewService.ReviewStatistics stats = 
                bookReviewService.getBookReviewStatistics(bookId);
        
        return ApiResponse.<BookReviewService.ReviewStatistics>builder()
                .code(200)
                .result(stats)
                .build();
    }

    /**
     * Admin: Delete any review
     * 
     * DELETE /api/reviews/admin/{reviewId}
     * 
     * @param reviewId Review ID
     * @return Success message
     */
    @DeleteMapping("/admin/{reviewId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> deleteReviewAdmin(@PathVariable String reviewId) {
        
        log.info("🔒 Admin deleting review {}", reviewId);
        
        bookReviewService.deleteReviewAdmin(reviewId);
        
        return ApiResponse.<Void>builder()
                .code(200)
                .message("Review deleted successfully")
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
