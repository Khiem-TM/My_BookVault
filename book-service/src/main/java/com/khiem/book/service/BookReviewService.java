package com.khiem.book.service;

import com.khiem.book.dto.request.BookReviewRequest;
import com.khiem.book.dto.response.ReviewResponse;
import com.khiem.book.entity.Book;
import com.khiem.book.entity.Review;
import com.khiem.book.exception.AppException;
import com.khiem.book.exception.ErrorCode;
import com.khiem.book.repository.BookRepository;
import com.khiem.book.repository.OrderRepository;
import com.khiem.book.repository.ReviewRepository;
import com.khiem.book.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for managing book reviews and ratings.
 * Business Rules:
 * - Users can only review books they have borrowed or rented (verified reviews)
 * - Rating must be between 1-5
 * - One review per user per book (can be updated)
 * - Reviews are stored in MongoDB for flexibility
 * - Average rating is calculated and cached in the Book entity
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class BookReviewService {

    private final ReviewRepository reviewRepository;
    private final BookRepository bookRepository;
    private final TransactionRepository transactionRepository;
    private final OrderRepository orderRepository;

    /**
     * Create or update a review for a book.
     * User must have borrowed or rented the book to leave a verified review.
     */
    @Transactional
    public ReviewResponse createOrUpdateReview(Long userId, BookReviewRequest request) {
        log.info("User {} creating/updating review for book {}", userId, request.getBookId());

        // Validate book exists
        Book book = bookRepository.findById(request.getBookId())
                .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND));

        // Validate rating
        if (request.getRating() < 1 || request.getRating() > 5) {
            throw new AppException(ErrorCode.INVALID_RATING);
        }

        // Check if user has borrowed or rented this book
        boolean hasAccessed = hasUserAccessedBook(userId, request.getBookId());
        
        // Check if review already exists
        List<Review> existingReviews = reviewRepository.findByUserId(userId);
        Review existingReview = existingReviews.stream()
                .filter(r -> r.getBookId().equals(request.getBookId()))
                .findFirst()
                .orElse(null);

        Review review;
        if (existingReview != null) {
            // Update existing review
            review = existingReview;
            review.setRating(request.getRating());
            review.setContent(request.getComment());
            review.setUpdatedAt(Instant.now());
            log.info("Updating existing review {}", review.getId());
        } else {
            // Create new review
            review = new Review();
            review.setBookId(request.getBookId());
            review.setUserId(userId);
            review.setRating(request.getRating());
            review.setContent(request.getComment());
            review.setCreatedAt(Instant.now());
            review.setUpdatedAt(Instant.now());
            review.setVerified(hasAccessed);
            log.info("Creating new review for book {}", request.getBookId());
        }

        review = reviewRepository.save(review);

        // Update book's average rating
        updateBookAverageRating(book);

        return mapToReviewResponse(review);
    }

    /**
     * Get all reviews for a book.
     */
    @Transactional(readOnly = true)
    public List<ReviewResponse> getBookReviews(Long bookId) {
        log.debug("Fetching reviews for book {}", bookId);

        // Validate book exists
        if (!bookRepository.existsById(bookId)) {
            throw new AppException(ErrorCode.BOOK_NOT_FOUND);
        }

        List<Review> reviews = reviewRepository.findByBookIdOrderByCreatedAtDesc(bookId);
        
        return reviews.stream()
                .map(this::mapToReviewResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get all reviews by a user.
     */
    @Transactional(readOnly = true)
    public List<ReviewResponse> getUserReviews(Long userId) {
        log.debug("Fetching reviews for user {}", userId);

        List<Review> reviews = reviewRepository.findByUserId(userId);
        
        return reviews.stream()
                .map(this::mapToReviewResponse)
                .collect(Collectors.toList());
    }

    /**
     * Delete a review.
     * Only the review author can delete it.
     */
    @Transactional
    public void deleteReview(Long userId, String reviewId) {
        log.info("User {} deleting review {}", userId, reviewId);

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new AppException(ErrorCode.REVIEW_NOT_FOUND));

        // Validate ownership
        if (!review.getUserId().equals(userId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED_ACCESS);
        }

        reviewRepository.delete(review);

        // Update book's average rating
        Book book = bookRepository.findById(review.getBookId()).orElse(null);
        if (book != null) {
            updateBookAverageRating(book);
        }

        log.info("Deleted review {}", reviewId);
    }

    /**
     * Admin: Delete any review.
     */
    @Transactional
    public void deleteReviewAdmin(String reviewId) {
        log.info("Admin deleting review {}", reviewId);

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new AppException(ErrorCode.REVIEW_NOT_FOUND));

        reviewRepository.delete(review);

        // Update book's average rating
        Book book = bookRepository.findById(review.getBookId()).orElse(null);
        if (book != null) {
            updateBookAverageRating(book);
        }

        log.info("Admin deleted review {}", reviewId);
    }

    /**
     * Check if user can review a book (has borrowed or rented it).
     */
    @Transactional(readOnly = true)
    public boolean canUserReviewBook(Long userId, Long bookId) {
        return hasUserAccessedBook(userId, bookId);
    }

    /**
     * Get review statistics for a book.
     */
    @Transactional(readOnly = true)
    public ReviewStatistics getBookReviewStatistics(Long bookId) {
        log.debug("Fetching review statistics for book {}", bookId);

        List<Review> reviews = reviewRepository.findByBookId(bookId);
        
        if (reviews.isEmpty()) {
            return new ReviewStatistics(0, 0.0, 0, 0, 0, 0, 0);
        }

        int totalReviews = reviews.size();
        double averageRating = reviews.stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(0.0);

        // Count by rating
        long rating5 = reviews.stream().filter(r -> r.getRating() == 5).count();
        long rating4 = reviews.stream().filter(r -> r.getRating() == 4).count();
        long rating3 = reviews.stream().filter(r -> r.getRating() == 3).count();
        long rating2 = reviews.stream().filter(r -> r.getRating() == 2).count();
        long rating1 = reviews.stream().filter(r -> r.getRating() == 1).count();

        return new ReviewStatistics(
                totalReviews,
                averageRating,
                (int) rating5,
                (int) rating4,
                (int) rating3,
                (int) rating2,
                (int) rating1
        );
    }

    // Helper methods

    /**
     * Check if user has borrowed (physical) or rented (digital) the book.
     */
    private boolean hasUserAccessedBook(Long userId, Long bookId) {
        // Check if user has borrowed the book (Transaction)
        boolean hasBorrowed = transactionRepository.existsByUserIdAndBookId(userId, bookId);
        
        // Check if user has rented the book (Order)
        boolean hasRented = orderRepository.hasUserBorrowedOrRentedBook(userId, bookId);
        
        return hasBorrowed || hasRented;
    }

    /**
     * Recalculate and update book's average rating.
     */
    private void updateBookAverageRating(Book book) {
        List<Review> reviews = reviewRepository.findByBookId(book.getId());
        
        if (reviews.isEmpty()) {
            book.updateRating(0.0, 0);
        } else {
            double averageRating = reviews.stream()
                    .mapToInt(Review::getRating)
                    .average()
                    .orElse(0.0);
            
            double roundedRating = Math.round(averageRating * 10.0) / 10.0; // Round to 1 decimal
            book.updateRating(roundedRating, reviews.size());
        }
        
        bookRepository.save(book);
        log.debug("Updated book {} average rating to {} from {} reviews", 
                book.getId(), book.getAverageRating(), book.getRatingsCount());
    }

    private ReviewResponse mapToReviewResponse(Review review) {
        ReviewResponse response = new ReviewResponse();
        response.setId(review.getId());
        response.setBookId(review.getBookId());
        response.setUserId(review.getUserId());
        response.setRating(review.getRating());
        response.setContent(review.getContent());
        response.setVerified(review.isVerified());
        response.setCreatedAt(review.getCreatedAt());
        response.setUpdatedAt(review.getUpdatedAt());
        return response;
    }

    // Inner class for statistics
    public static class ReviewStatistics {
        private final int totalReviews;
        private final double averageRating;
        private final int rating5Count;
        private final int rating4Count;
        private final int rating3Count;
        private final int rating2Count;
        private final int rating1Count;

        public ReviewStatistics(int totalReviews, double averageRating,
                               int rating5Count, int rating4Count, int rating3Count,
                               int rating2Count, int rating1Count) {
            this.totalReviews = totalReviews;
            this.averageRating = averageRating;
            this.rating5Count = rating5Count;
            this.rating4Count = rating4Count;
            this.rating3Count = rating3Count;
            this.rating2Count = rating2Count;
            this.rating1Count = rating1Count;
        }

        // Getters
        public int getTotalReviews() { return totalReviews; }
        public double getAverageRating() { return averageRating; }
        public int getRating5Count() { return rating5Count; }
        public int getRating4Count() { return rating4Count; }
        public int getRating3Count() { return rating3Count; }
        public int getRating2Count() { return rating2Count; }
        public int getRating1Count() { return rating1Count; }
    }
}
