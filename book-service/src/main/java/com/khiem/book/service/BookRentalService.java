package com.khiem.book.service;

import com.khiem.book.dto.request.RentBookRequest;
import com.khiem.book.dto.response.RentalResponse;
import com.khiem.book.entity.Book;
import com.khiem.book.entity.BookStatus;
import com.khiem.book.entity.BookType;
import com.khiem.book.entity.Order;
import com.khiem.book.exception.AppException;
import com.khiem.book.exception.ErrorCode;
import com.khiem.book.repository.BookRepository;
import com.khiem.book.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for managing digital book rentals.
 * Business Rules:
 * - Only DIGITAL_LICENSED_BOOK can be rented
 * - Books must be AVAILABLE and have rental configuration
 * - User can have unlimited active rentals (no limit like physical books)
 * - Rental duration is configurable per book (default from book config)
 * - Expired rentals are automatically marked as OVERDUE
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class BookRentalService {

    private final BookRepository bookRepository;
    private final OrderRepository orderRepository;

    /**
     * Rent a digital book.
     * Creates a rental order with start/end dates.
     */
    @Transactional
    public RentalResponse rentBook(Long userId, RentBookRequest request) {
        log.info("User {} attempting to rent book {}", userId, request.getBookId());

        // Validate book exists and is rentable
        Book book = bookRepository.findById(request.getBookId())
                .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND));

        validateBookForRental(book);

        // Determine rental duration
        int rentalPeriods = request.getRentalPeriods() != null 
                ? request.getRentalPeriods() 
                : 1;
        int rentalDays = rentalPeriods * book.getRentalDurationDays();

        // Create rental order
        Order order = new Order(userId, book.getId(), Order.OrderType.RENT);
        order.setRentalDays(rentalDays);
        order.setRentalPrice(book.getRentalPrice().doubleValue());
        order.setTotalPrice(book.getRentalPrice().doubleValue() * rentalPeriods);
        order.setRentalStartDate(LocalDate.now());
        order.setRentalEndDate(LocalDate.now().plusDays(rentalDays));
        order.setStatus(Order.Status.PAID); // In real scenario, this would be PENDING until payment
        order.setNotes(request.getNotes());
        
        order = orderRepository.save(order);
        
        log.info("Created rental order {} for user {} - book {} for {} days", 
                order.getId(), userId, book.getId(), rentalDays);

        return mapToRentalResponse(order, book);
    }

    /**
     * Get all active rentals for a user.
     */
    @Transactional(readOnly = true)
    public List<RentalResponse> getActiveRentals(Long userId) {
        log.debug("Fetching active rentals for user {}", userId);
        
        List<Order> rentals = orderRepository.findActiveRentalsByUserId(userId);
        
        return rentals.stream()
                .map(order -> {
                    Book book = bookRepository.findById(order.getBookId())
                            .orElse(null);
                    return mapToRentalResponse(order, book);
                })
                .collect(Collectors.toList());
    }

    /**
     * Get rental history for a user.
     */
    @Transactional(readOnly = true)
    public List<RentalResponse> getRentalHistory(Long userId) {
        log.debug("Fetching rental history for user {}", userId);
        
        List<Order> rentals = orderRepository.findByUserIdAndOrderType(userId, Order.OrderType.RENT);
        
        return rentals.stream()
                .map(order -> {
                    Book book = bookRepository.findById(order.getBookId())
                            .orElse(null);
                    return mapToRentalResponse(order, book);
                })
                .collect(Collectors.toList());
    }

    /**
     * Cancel a pending rental (before payment).
     */
    @Transactional
    public void cancelRental(Long userId, Long orderId) {
        log.info("User {} cancelling rental order {}", userId, orderId);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        // Validate ownership
        if (!order.getUserId().equals(userId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED_ACCESS);
        }

        // Only pending orders can be cancelled
        if (order.getStatus() != Order.Status.PENDING) {
            throw new AppException(ErrorCode.RENTAL_CANNOT_BE_CANCELLED);
        }

        order.setStatus(Order.Status.CANCELLED);
        orderRepository.save(order);
        
        log.info("Cancelled rental order {}", orderId);
    }

    /**
     * Check if a rental is still active (not expired).
     */
    @Transactional(readOnly = true)
    public boolean isRentalActive(Long userId, Long bookId) {
        List<Order> activeRentals = orderRepository.findActiveRentalsByUserId(userId);
        
        return activeRentals.stream()
                .anyMatch(order -> order.getBookId().equals(bookId) && !order.isExpired());
    }

    /**
     * Scheduled job to mark expired rentals as OVERDUE.
     * Runs daily at 2 AM.
     */
    @Scheduled(cron = "0 0 2 * * ?")
    @Transactional
    public void markExpiredRentals() {
        log.info("Starting scheduled job to mark expired rentals");

        List<Order> expiredRentals = orderRepository.findExpiredRentals(LocalDate.now());
        
        for (Order rental : expiredRentals) {
            rental.setStatus(Order.Status.OVERDUE);
            orderRepository.save(rental);
            log.info("Marked rental {} as OVERDUE (user: {}, book: {})", 
                    rental.getId(), rental.getUserId(), rental.getBookId());
        }

        log.info("Completed marking {} rentals as overdue", expiredRentals.size());
    }

    /**
     * Admin: Get all overdue rentals.
     */
    @Transactional(readOnly = true)
    public List<RentalResponse> getOverdueRentals() {
        log.debug("Fetching all overdue rentals");
        
        List<Order> overdueRentals = orderRepository.findByOrderTypeAndStatus(
                Order.OrderType.RENT, Order.Status.OVERDUE);
        
        return overdueRentals.stream()
                .map(order -> {
                    Book book = bookRepository.findById(order.getBookId())
                            .orElse(null);
                    return mapToRentalResponse(order, book);
                })
                .collect(Collectors.toList());
    }

    /**
     * Admin: Force return an overdue rental.
     */
    @Transactional
    public void forceReturnRental(Long orderId) {
        log.info("Admin forcing return of rental {}", orderId);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        if (order.getOrderType() != Order.OrderType.RENT) {
            throw new AppException(ErrorCode.INVALID_ORDER_TYPE);
        }

        order.setStatus(Order.Status.RETURNED);
        orderRepository.save(order);
        
        log.info("Forced return of rental order {}", orderId);
    }

    // Helper methods

    private void validateBookForRental(Book book) {
        // Must be a digital licensed book
        if (book.getBookType() != BookType.DIGITAL_LICENSED_BOOK) {
            throw new AppException(ErrorCode.BOOK_NOT_RENTABLE);
        }

        // Must be available
        if (book.getStatus() != BookStatus.AVAILABLE) {
            throw new AppException(ErrorCode.BOOK_NOT_AVAILABLE);
        }

        // Must have rental configuration
        if (book.getRentalPrice() == null || book.getRentalPrice().compareTo(java.math.BigDecimal.ZERO) <= 0) {
            throw new AppException(ErrorCode.RENTAL_CONFIG_MISSING);
        }

        if (book.getRentalDurationDays() == null || book.getRentalDurationDays() <= 0) {
            throw new AppException(ErrorCode.RENTAL_CONFIG_MISSING);
        }
    }

    private RentalResponse mapToRentalResponse(Order order, Book book) {
        // Convert LocalDate to Instant for response
        Instant rentedAt = order.getCreatedAt();
        Instant expiresAt = order.getRentalEndDate() != null 
                ? order.getRentalEndDate().atStartOfDay(java.time.ZoneId.systemDefault()).toInstant()
                : null;
        
        return RentalResponse.builder()
                .id(order.getId())
                .bookId(order.getBookId())
                .bookTitle(book != null ? book.getTitle() : "Unknown")
                .userId(order.getUserId())
                .rentedAt(rentedAt)
                .expiresAt(expiresAt)
                .rentalPeriods(order.getRentalDays() != null && book != null && book.getRentalDurationDays() != null 
                        ? order.getRentalDays() / book.getRentalDurationDays() 
                        : 1)
                .totalDays(order.getRentalDays())
                .totalPrice(order.getTotalPrice() != null 
                        ? java.math.BigDecimal.valueOf(order.getTotalPrice())
                        : java.math.BigDecimal.ZERO)
                .status(order.isExpired() ? "EXPIRED" : "ACTIVE")
                .notes(order.getNotes())
                .build();
    }
}
