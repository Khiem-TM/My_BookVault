package com.khiem.book.repository;

import com.khiem.book.entity.Book;
import com.khiem.book.entity.BookStatus;
import com.khiem.book.entity.BookType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

/**
 * Book Repository with domain-specific queries
 */
public interface BookRepository extends JpaRepository<Book, Long>, JpaSpecificationExecutor<Book> {
    
    // === Basic Queries ===
    
    Optional<Book> findByIsbn(String isbn);
    
    boolean existsByIsbn(String isbn);
    
    @Query("SELECT DISTINCT c FROM Book b JOIN b.categories c")
    List<String> findDistinctCategories();
    
    // === Status-based Queries ===
    
    Page<Book> findByStatus(BookStatus status, Pageable pageable);
    
    long countByStatus(BookStatus status);
    
    // === Type-based Queries ===
    
    Page<Book> findByStatusAndBookType(BookStatus status, BookType bookType, Pageable pageable);
    
    long countByBookType(BookType bookType);
    
    // === Search Queries ===
    
    Page<Book> findByStatusAndTitleContainingIgnoreCaseOrAuthorContainingIgnoreCase(
            BookStatus status, String title, String author, Pageable pageable);
    
    // === Category Queries ===
    
    Page<Book> findByStatusAndCategoriesContaining(
            BookStatus status, String category, Pageable pageable);
    
    // === Availability Queries ===
    
    /**
     * Find physical books with available quantity > 0
     */
    Page<Book> findByStatusAndBookTypeAndAvailableQuantityGreaterThan(
            BookStatus status, BookType bookType, Integer quantity, Pageable pageable);
    
    /**
     * Find books that are borrowable (physical + available)
     */
    @Query("SELECT b FROM Book b WHERE b.status = :status " +
           "AND b.bookType = :bookType " +
           "AND b.availableQuantity > 0")
    List<Book> findBorrowableBooks(BookStatus status, BookType bookType);
}

