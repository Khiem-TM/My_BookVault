package com.khiem.book.repository;

import com.khiem.book.entity.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import java.util.Optional;

public interface BookRepository extends JpaRepository<Book, Long>, JpaSpecificationExecutor<Book> {
    Optional<Book> findByIsbn(String isbn);
    
    @org.springframework.data.jpa.repository.Query("SELECT DISTINCT c FROM Book b JOIN b.categories c")
    java.util.List<String> findDistinctCategories();
}

