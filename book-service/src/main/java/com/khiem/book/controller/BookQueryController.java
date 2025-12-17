package com.khiem.book.controller;

import com.khiem.book.dto.ApiResponse;
import com.khiem.book.dto.PageResponse;
import com.khiem.book.dto.response.BookResponse;
import com.khiem.book.service.BookQueryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Public Book Query Controller
 * 
 * Responsibilities:
 * - Browse available books (paginated)
 * - Search books by keyword
 * - Get book details (user view)
 * - Filter by type, category, author
 * - Get borrowable/rentable books
 * 
 * Security: Most endpoints are public, but statistics requires admin/special permission
 * 
 * @author Clean Architecture Refactoring
 * @version 2.0
 */
@RestController
@RequestMapping("/api/books")
@RequiredArgsConstructor
@Slf4j
public class BookQueryController {

    private final BookQueryService bookQueryService;

    /**
     * Browse available books (paginated)
     * 
     * GET /api/books
     * 
     * @param page Page number (0-based)
     * @param size Page size
     * @param sort Sort field (default: title)
     * @param direction Sort direction (asc/desc)
     * @param type Filter by book type (optional)
     * @param category Filter by category (optional)
     * @param author Filter by author (optional)
     * @return Paginated list of books
     */
    @GetMapping
    public ApiResponse<PageResponse<BookResponse>> getAvailableBooks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "title") String sort,
            @RequestParam(defaultValue = "asc") String direction,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String author) {
        
        log.debug("📚 Browsing books: page={}, size={}, type={}, category={}, author={}", 
                page, size, type, category, author);
        
        // Create pageable
        Sort.Direction sortDirection = "desc".equalsIgnoreCase(direction) 
                ? Sort.Direction.DESC 
                : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sort));
        
        // Get books based on filters
        Page<BookResponse> booksPage;
        
        if (category != null && !category.isEmpty()) {
            booksPage = bookQueryService.getBooksByCategory(category, pageable);
        } else if (type != null && !type.isEmpty()) {
            try {
                booksPage = bookQueryService.getBooksByType(
                        com.khiem.book.entity.BookType.valueOf(type.toUpperCase()), pageable);
            } catch (IllegalArgumentException e) {
                // Invalid book type, return all available books
                booksPage = bookQueryService.getAvailableBooks(pageable);
            }
        } else {
            booksPage = bookQueryService.getAvailableBooks(pageable);
        }
        
        // Build response
        PageResponse<BookResponse> pageResponse = PageResponse.<BookResponse>builder()
                .currentPage(booksPage.getNumber())
                .totalPages(booksPage.getTotalPages())
                .pageSize(booksPage.getSize())
                .totalElements(booksPage.getTotalElements())
                .data(booksPage.getContent())
                .build();
        
        return ApiResponse.<PageResponse<BookResponse>>builder()
                .code(200)
                .result(pageResponse)
                .build();
    }

    /**
     * Get book details by ID (User view - must be AVAILABLE)
     * 
     * GET /api/books/{id}
     * 
     * @param id Book ID
     * @return Book details
     */
    @GetMapping("/{id:\\d+}")
    public ApiResponse<BookResponse> getBookById(@PathVariable Long id) {
        
        log.debug("📖 Getting book details: id={}", id);
        
        BookResponse response = bookQueryService.getBookById(id);
        
        return ApiResponse.<BookResponse>builder()
                .code(200)
                .result(response)
                .build();
    }

    /**
     * Get all categories
     * 
     * GET /api/books/categories
     * 
     * @return List of categories
     */
    @GetMapping("/categories")
    public ApiResponse<List<String>> getCategories() {
        log.debug("📂 Getting all categories");
        return ApiResponse.<List<String>>builder()
                .code(200)
                .result(bookQueryService.getAllCategories())
                .build();
    }

    /**
     * Search books by keyword (title or author)
     * 
     * GET /api/books/search
     * 
     * @param keyword Search keyword
     * @param page Page number
     * @param size Page size
     * @return Matching books
     */
    @GetMapping("/search")
    public ApiResponse<PageResponse<BookResponse>> searchBooks(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        log.debug("🔍 Searching books: keyword='{}', page={}, size={}", keyword, page, size);
        
        Pageable pageable = PageRequest.of(page, size);
        Page<BookResponse> booksPage = bookQueryService.searchBooks(keyword, pageable);
        
        PageResponse<BookResponse> pageResponse = PageResponse.<BookResponse>builder()
                .currentPage(booksPage.getNumber())
                .totalPages(booksPage.getTotalPages())
                .pageSize(booksPage.getSize())
                .totalElements(booksPage.getTotalElements())
                .data(booksPage.getContent())
                .build();
        
        return ApiResponse.<PageResponse<BookResponse>>builder()
                .code(200)
                .result(pageResponse)
                .build();
    }

    /**
     * Get borrowable physical books
     * 
     * GET /api/books/borrowable
     * 
     * @param page Page number
     * @param size Page size
     * @return Available physical books with quantity > 0
     */
    @GetMapping("/borrowable")
    public ApiResponse<PageResponse<BookResponse>> getBorrowableBooks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        log.debug("📚 Getting borrowable books: page={}, size={}", page, size);
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("title"));
        Page<BookResponse> booksPage = bookQueryService.getBorrowableBooks(pageable);
        
        PageResponse<BookResponse> pageResponse = PageResponse.<BookResponse>builder()
                .currentPage(booksPage.getNumber())
                .totalPages(booksPage.getTotalPages())
                .pageSize(booksPage.getSize())
                .totalElements(booksPage.getTotalElements())
                .data(booksPage.getContent())
                .build();
        
        return ApiResponse.<PageResponse<BookResponse>>builder()
                .code(200)
                .result(pageResponse)
                .build();
    }

    /**
     * Get rentable digital licensed books
     * 
     * GET /api/books/rentable
     * 
     * @param page Page number
     * @param size Page size
     * @return Digital licensed books with rental configuration
     */
    @GetMapping("/rentable")
    public ApiResponse<PageResponse<BookResponse>> getRentableBooks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        log.debug("💰 Getting rentable books: page={}, size={}", page, size);
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("title"));
        Page<BookResponse> booksPage = bookQueryService.getRentableBooks(pageable);
        
        PageResponse<BookResponse> pageResponse = PageResponse.<BookResponse>builder()
                .currentPage(booksPage.getNumber())
                .totalPages(booksPage.getTotalPages())
                .pageSize(booksPage.getSize())
                .totalElements(booksPage.getTotalElements())
                .data(booksPage.getContent())
                .build();
        
        return ApiResponse.<PageResponse<BookResponse>>builder()
                .code(200)
                .result(pageResponse)
                .build();
    }

    /**
     * Get book statistics (Admin dashboard)
     * 
     * GET /api/books/statistics
     * 
     * SECURITY FIX: This endpoint now requires ADMIN role or VIEW_STATISTICS permission
     * 
     * @return Statistics about books
     */
    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('VIEW_STATISTICS')")
    public ApiResponse<BookQueryService.BookStatistics> getStatistics() {
        
        log.debug("📊 Getting book statistics");
        
        BookQueryService.BookStatistics stats = bookQueryService.getStatistics();
        
        return ApiResponse.<BookQueryService.BookStatistics>builder()
                .code(200)
                .result(stats)
                .build();
    }

    /**
     * Get books by category
     * 
     * GET /api/books/category/{category}
     * 
     * @param category Category name
     * @param page Page number
     * @param size Page size
     * @return Books in category
     */
    @GetMapping("/category/{category}")
    public ApiResponse<PageResponse<BookResponse>> getBooksByCategory(
            @PathVariable String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        log.debug("📁 Getting books by category: {}", category);
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("title"));
        Page<BookResponse> booksPage = bookQueryService.getBooksByCategory(category, pageable);
        
        PageResponse<BookResponse> pageResponse = PageResponse.<BookResponse>builder()
                .currentPage(booksPage.getNumber())
                .totalPages(booksPage.getTotalPages())
                .pageSize(booksPage.getSize())
                .totalElements(booksPage.getTotalElements())
                .data(booksPage.getContent())
                .build();
        
        return ApiResponse.<PageResponse<BookResponse>>builder()
                .code(200)
                .result(pageResponse)
                .build();
    }

    /**
     * Get books by author
     * 
     * GET /api/books/author/{author}
     * 
     * @param author Author name
     * @param page Page number
     * @param size Page size
     * @return Books by author
     */
    @GetMapping("/author/{author}")
    public ApiResponse<PageResponse<BookResponse>> getBooksByAuthor(
            @PathVariable String author,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        log.debug("✍️ Getting books by author: {}", author);
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("title"));
        // Use search to find books by author
        Page<BookResponse> booksPage = bookQueryService.searchBooks(author, pageable);
        
        PageResponse<BookResponse> pageResponse = PageResponse.<BookResponse>builder()
                .currentPage(booksPage.getNumber())
                .totalPages(booksPage.getTotalPages())
                .pageSize(booksPage.getSize())
                .totalElements(booksPage.getTotalElements())
                .data(booksPage.getContent())
                .build();
        
        return ApiResponse.<PageResponse<BookResponse>>builder()
                .code(200)
                .result(pageResponse)
                .build();
    }
}
