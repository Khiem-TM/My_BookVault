package com.khiem.book.service;

import com.khiem.book.dto.request.BookManagementRequest;
import com.khiem.book.dto.response.BookResponse;
import com.khiem.book.entity.Book;
import com.khiem.book.entity.BookStatus;
import com.khiem.book.entity.BookType;
import com.khiem.book.exception.AppException;
import com.khiem.book.exception.ErrorCode;
import com.khiem.book.repository.BookRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * ADMIN SERVICE - Book Management
 * 
 * Responsibilities:
 * - Create/Update/Delete books
 * - Manage inventory (quantity)
 * - Set book type and pricing
 * - Control book availability
 * 
 * Business Rules:
 * - Only admins can access these operations
 * - Physical books must have quantity > 0
 * - Licensed books must have price and duration
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class BookManagementService {
    
    private final BookRepository bookRepository;

    /**
     * Admin: Create a new book
     * 
     * @param request Book creation request with validation
     * @param adminId Admin user ID (from security context)
     * @return Created book response
     * @throws AppException if validation fails
     */
    @Transactional
    public BookResponse createBook(BookManagementRequest request, Long adminId) {
        log.info("📝 Admin {} creating new book: {}", adminId, request.getTitle());
        
        // Validate business rules
        request.validate();
        
        // Check ISBN uniqueness
        if (request.getIsbn() != null && bookRepository.existsByIsbn(request.getIsbn())) {
            throw new AppException(ErrorCode.BOOK_ALREADY_EXISTS);
        }
        
        // Build book entity
        Book book = Book.builder()
                .title(request.getTitle())
                .author(request.getAuthor())
                .isbn(request.getIsbn())
                .description(request.getDescription())
                .categories(request.getCategories())
                .publishedAt(request.getPublishedAt())
                .publisher(request.getPublisher())
                .thumbnailUrl(request.getThumbnailUrl())
                .pageCount(request.getPageCount())
                .language(request.getLanguage())
                .bookType(request.getBookType())
                .status(BookStatus.AVAILABLE)
                .createdBy(adminId)
                .updatedBy(adminId)
                .build();
        
        // Set type-specific fields
        if (request.getBookType() == BookType.PHYSICAL_BOOK) {
            book.setTotalQuantity(request.getTotalQuantity());
            book.setAvailableQuantity(request.getTotalQuantity());
        } else if (request.getBookType() == BookType.DIGITAL_LICENSED_BOOK) {
            book.setRentalPrice(request.getRentalPrice());
            book.setRentalDurationDays(request.getRentalDurationDays());
        }
        
        book = bookRepository.save(book);
        log.info("✅ Book created successfully with ID: {}", book.getId());
        
        return mapToResponse(book);
    }

    /**
     * Admin: Update existing book
     * 
     * @param bookId Book ID to update
     * @param request Updated book data
     * @param adminId Admin user ID
     * @return Updated book response
     * @throws AppException if book not found or validation fails
     */
    @Transactional
    public BookResponse updateBook(Long bookId, BookManagementRequest request, Long adminId) {
        log.info("✏️ Admin {} updating book ID: {}", adminId, bookId);
        
        // Validate business rules
        request.validate();
        
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND));
        
        // Check ISBN uniqueness (if changed)
        if (request.getIsbn() != null && !request.getIsbn().equals(book.getIsbn())) {
            if (bookRepository.existsByIsbn(request.getIsbn())) {
                throw new AppException(ErrorCode.BOOK_ALREADY_EXISTS);
            }
        }
        
        // Update basic fields
        book.setTitle(request.getTitle());
        book.setAuthor(request.getAuthor());
        book.setIsbn(request.getIsbn());
        book.setDescription(request.getDescription());
        book.setCategories(request.getCategories());
        book.setPublishedAt(request.getPublishedAt());
        book.setPublisher(request.getPublisher());
        book.setThumbnailUrl(request.getThumbnailUrl());
        book.setPageCount(request.getPageCount());
        book.setLanguage(request.getLanguage());
        book.setUpdatedBy(adminId);
        
        // Update type-specific fields
        book.setBookType(request.getBookType());
        if (request.getBookType() == BookType.PHYSICAL_BOOK) {
            updatePhysicalBookInventory(book, request.getTotalQuantity());
        } else if (request.getBookType() == BookType.DIGITAL_LICENSED_BOOK) {
            book.setRentalPrice(request.getRentalPrice());
            book.setRentalDurationDays(request.getRentalDurationDays());
            // Clear physical book fields
            book.setTotalQuantity(null);
            book.setAvailableQuantity(null);
        } else {
            // DIGITAL_FREE_BOOK - clear both sets of fields
            book.setTotalQuantity(null);
            book.setAvailableQuantity(null);
            book.setRentalPrice(null);
            book.setRentalDurationDays(null);
        }
        
        book = bookRepository.save(book);
        log.info("✅ Book ID: {} updated successfully", bookId);
        
        return mapToResponse(book);
    }

    /**
     * Admin: Delete book (soft delete by setting status to DISABLED)
     * 
     * @param bookId Book ID to delete
     * @param adminId Admin user ID
     * @throws AppException if book not found
     */
    @Transactional
    public void deleteBook(Long bookId, Long adminId) {
        log.info("🗑️ Admin {} deleting book ID: {}", adminId, bookId);
        
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND));
        
        // Soft delete
        book.setStatus(BookStatus.DISABLED);
        book.setUpdatedBy(adminId);
        bookRepository.save(book);
        
        log.info("✅ Book ID: {} deleted (disabled)", bookId);
    }

    /**
     * Admin: Update book inventory (physical books only)
     * 
     * @param bookId Book ID
     * @param newTotalQuantity New total quantity
     * @param adminId Admin user ID
     * @return Updated book response
     * @throws AppException if book not found or not physical book
     */
    @Transactional
    public BookResponse updateInventory(Long bookId, Integer newTotalQuantity, Long adminId) {
        log.info("📦 Admin {} updating inventory for book ID: {} to {}", adminId, bookId, newTotalQuantity);
        
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND));
        
        if (book.getBookType() != BookType.PHYSICAL_BOOK) {
            throw new AppException(ErrorCode.INVALID_BOOK_TYPE);
        }
        
        updatePhysicalBookInventory(book, newTotalQuantity);
        book.setUpdatedBy(adminId);
        book = bookRepository.save(book);
        
        log.info("✅ Inventory updated: total={}, available={}", 
                book.getTotalQuantity(), book.getAvailableQuantity());
        
        return mapToResponse(book);
    }

    /**
     * Admin: Update rental price and duration
     * 
     * @param bookId Book ID
     * @param newPrice New rental price
     * @param newDurationDays New duration in days
     * @param adminId Admin user ID
     * @return Updated book response
     * @throws AppException if book not found or not licensed book
     */
    @Transactional
    public BookResponse updateRentalConfig(Long bookId, java.math.BigDecimal newPrice, 
                                          Integer newDurationDays, Long adminId) {
        log.info("💰 Admin {} updating rental config for book ID: {}", adminId, bookId);
        
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND));
        
        if (book.getBookType() != BookType.DIGITAL_LICENSED_BOOK) {
            throw new AppException(ErrorCode.INVALID_BOOK_TYPE);
        }
        
        book.setRentalPrice(newPrice);
        book.setRentalDurationDays(newDurationDays);
        book.setUpdatedBy(adminId);
        book = bookRepository.save(book);
        
        log.info("✅ Rental config updated: price={}, duration={} days", newPrice, newDurationDays);
        
        return mapToResponse(book);
    }

    /**
     * Admin: Enable/Disable book
     * 
     * @param bookId Book ID
     * @param enabled True to enable, false to disable
     * @param adminId Admin user ID
     * @return Updated book response
     */
    @Transactional
    public BookResponse setBookStatus(Long bookId, boolean enabled, Long adminId) {
        log.info("🔄 Admin {} setting book ID: {} to {}", adminId, bookId, enabled ? "ENABLED" : "DISABLED");
        
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND));
        
        book.setStatus(enabled ? BookStatus.AVAILABLE : BookStatus.DISABLED);
        book.setUpdatedBy(adminId);
        book = bookRepository.save(book);
        
        log.info("✅ Book status updated to: {}", book.getStatus());
        
        return mapToResponse(book);
    }

    /**
     * Admin: Get all books with pagination (including disabled)
     * 
     * @param pageable Pagination info
     * @return Page of books
     */
    @Transactional(readOnly = true)
    public Page<BookResponse> getAllBooks(Pageable pageable) {
        log.info("📚 Admin fetching all books (page: {}, size: {})", 
                pageable.getPageNumber(), pageable.getPageSize());
        
        return bookRepository.findAll(pageable)
                .map(this::mapToResponse);
    }

    // === Private Helper Methods ===

    /**
     * Update physical book inventory while maintaining consistency
     */
    private void updatePhysicalBookInventory(Book book, Integer newTotalQuantity) {
        Integer currentTotal = book.getTotalQuantity() != null ? book.getTotalQuantity() : 0;
        Integer currentAvailable = book.getAvailableQuantity() != null ? book.getAvailableQuantity() : 0;
        Integer borrowed = currentTotal - currentAvailable;
        
        book.setTotalQuantity(newTotalQuantity);
        book.setAvailableQuantity(Math.max(0, newTotalQuantity - borrowed));
        
        // Update status based on availability
        if (book.getAvailableQuantity() > 0) {
            book.setStatus(BookStatus.AVAILABLE);
        } else {
            book.setStatus(BookStatus.OUT_OF_STOCK);
        }
    }

    /**
     * Map Book entity to BookResponse DTO
     */
    private BookResponse mapToResponse(Book book) {
        return BookResponse.builder()
                .id(book.getId())
                .title(book.getTitle())
                .author(book.getAuthor())
                .isbn(book.getIsbn())
                .description(book.getDescription())
                .categories(book.getCategories())
                .publishedAt(book.getPublishedAt())
                .publisher(book.getPublisher())
                .thumbnailUrl(book.getThumbnailUrl())
                .pageCount(book.getPageCount())
                .language(book.getLanguage())
                .bookType(book.getBookType())
                .status(book.getStatus())
                .totalQuantity(book.getTotalQuantity())
                .availableQuantity(book.getAvailableQuantity())
                .isAvailable(book.getStatus() == BookStatus.AVAILABLE)
                .rentalPrice(book.getRentalPrice())
                .rentalDurationDays(book.getRentalDurationDays())
                .averageRating(book.getAverageRating())
                .ratingsCount(book.getRatingsCount())
                .createdAt(book.getCreatedAt())
                .updatedAt(book.getUpdatedAt())
                .build();
    }
}
