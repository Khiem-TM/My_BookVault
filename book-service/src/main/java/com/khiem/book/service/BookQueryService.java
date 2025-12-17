package com.khiem.book.service;

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

import java.util.List;

/**
 * USER/ADMIN SERVICE - Book Query Operations
 * 
 * Responsibilities:
 * - Search and filter books
 * - Get book details
 * - Browse by category
 * - Public read-only operations
 * 
 * Business Rules:
 * - Users can only see AVAILABLE books
 * - Admins can see all books
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class BookQueryService {
    
    private final BookRepository bookRepository;

    /**
     * Get book by ID (user view - only available books)
     * 
     * @param bookId Book ID
     * @return Book response
     * @throws AppException if book not found or not available
     */
    @Transactional(readOnly = true)
    public BookResponse getBookById(Long bookId) {
        log.info("📖 Fetching book ID: {}", bookId);
        
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND));
        
        // User can only see available books
        if (book.getStatus() != BookStatus.AVAILABLE) {
            throw new AppException(ErrorCode.BOOK_NOT_AVAILABLE);
        }
        
        return mapToResponse(book);
    }

    /**
     * Get book by ID (admin view - can see any status)
     * 
     * @param bookId Book ID
     * @return Book response
     * @throws AppException if book not found
     */
    @Transactional(readOnly = true)
    public BookResponse getBookByIdAdmin(Long bookId) {
        log.info("📖 Admin fetching book ID: {}", bookId);
        
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND));
        
        return mapToResponse(book);
    }

    /**
     * Get all available books with pagination (user view)
     * 
     * @param pageable Pagination info
     * @return Page of available books
     */
    @Transactional(readOnly = true)
    public Page<BookResponse> getAvailableBooks(Pageable pageable) {
        log.info("📚 Fetching available books (page: {}, size: {})", 
                pageable.getPageNumber(), pageable.getPageSize());
        
        return bookRepository.findByStatus(BookStatus.AVAILABLE, pageable)
                .map(this::mapToResponse);
    }

    /**
     * Search books by title or author (user view)
     * 
     * @param keyword Search keyword
     * @param pageable Pagination info
     * @return Page of matching books
     */
    @Transactional(readOnly = true)
    public Page<BookResponse> searchBooks(String keyword, Pageable pageable) {
        log.info("🔍 Searching books with keyword: '{}'", keyword);
        
        return bookRepository.findByStatusAndTitleContainingIgnoreCaseOrAuthorContainingIgnoreCase(
                        BookStatus.AVAILABLE, keyword, keyword, pageable)
                .map(this::mapToResponse);
    }

    /**
     * Get books by category (user view)
     * 
     * @param category Category name
     * @param pageable Pagination info
     * @return Page of books in category
     */
    @Transactional(readOnly = true)
    public Page<BookResponse> getBooksByCategory(String category, Pageable pageable) {
        log.info("📁 Fetching books in category: '{}'", category);
        
        return bookRepository.findByStatusAndCategoriesContaining(
                        BookStatus.AVAILABLE, category, pageable)
                .map(this::mapToResponse);
    }

    /**
     * Get books by type (user view)
     * 
     * @param bookType Book type filter
     * @param pageable Pagination info
     * @return Page of books
     */
    @Transactional(readOnly = true)
    public Page<BookResponse> getBooksByType(BookType bookType, Pageable pageable) {
        log.info("📗 Fetching books of type: {}", bookType);
        
        return bookRepository.findByStatusAndBookType(
                        BookStatus.AVAILABLE, bookType, pageable)
                .map(this::mapToResponse);
    }

    /**
     * Get borrowable books (physical books with quantity > 0)
     * 
     * @param pageable Pagination info
     * @return Page of borrowable books
     */
    @Transactional(readOnly = true)
    public Page<BookResponse> getBorrowableBooks(Pageable pageable) {
        log.info("📚 Fetching borrowable books");
        
        return bookRepository.findByStatusAndBookTypeAndAvailableQuantityGreaterThan(
                        BookStatus.AVAILABLE, BookType.PHYSICAL_BOOK, 0, pageable)
                .map(this::mapToResponse);
    }

    /**
     * Get rentable books (digital licensed books)
     * 
     * @param pageable Pagination info
     * @return Page of rentable books
     */
    @Transactional(readOnly = true)
    public Page<BookResponse> getRentableBooks(Pageable pageable) {
        log.info("💳 Fetching rentable books");
        
        return bookRepository.findByStatusAndBookType(
                        BookStatus.AVAILABLE, BookType.DIGITAL_LICENSED_BOOK, pageable)
                .map(this::mapToResponse);
    }

    /**
     * Get free books (digital free books)
     * 
     * @param pageable Pagination info
     * @return Page of free books
     */
    @Transactional(readOnly = true)
    public Page<BookResponse> getFreeBooks(Pageable pageable) {
        log.info("🎁 Fetching free books");
        
        return bookRepository.findByStatusAndBookType(
                        BookStatus.AVAILABLE, BookType.DIGITAL_FREE_BOOK, pageable)
                .map(this::mapToResponse);
    }

    /**
     * Get all distinct categories
     * 
     * @return List of categories
     */
    @Transactional(readOnly = true)
    public List<String> getAllCategories() {
        log.info("📂 Fetching all categories");
        
        return bookRepository.findDistinctCategories();
    }

    /**
     * Get book statistics (admin only)
     * 
     * @return Statistics object
     */
    @Transactional(readOnly = true)
    public BookStatistics getStatistics() {
        log.info("📊 Fetching book statistics");
        
        long totalBooks = bookRepository.count();
        long availableBooks = bookRepository.countByStatus(BookStatus.AVAILABLE);
        long physicalBooks = bookRepository.countByBookType(BookType.PHYSICAL_BOOK);
        long digitalFreeBooks = bookRepository.countByBookType(BookType.DIGITAL_FREE_BOOK);
        long digitalLicensedBooks = bookRepository.countByBookType(BookType.DIGITAL_LICENSED_BOOK);
        long outOfStockBooks = bookRepository.countByStatus(BookStatus.OUT_OF_STOCK);
        
        return BookStatistics.builder()
                .totalBooks(totalBooks)
                .availableBooks(availableBooks)
                .physicalBooks(physicalBooks)
                .digitalFreeBooks(digitalFreeBooks)
                .digitalLicensedBooks(digitalLicensedBooks)
                .outOfStockBooks(outOfStockBooks)
                .build();
    }

    // === Helper Methods ===

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

    // === Statistics DTO ===
    
    @lombok.Data
    @lombok.Builder
    public static class BookStatistics {
        private long totalBooks;
        private long availableBooks;
        private long physicalBooks;
        private long digitalFreeBooks;
        private long digitalLicensedBooks;
        private long outOfStockBooks;
    }
}
