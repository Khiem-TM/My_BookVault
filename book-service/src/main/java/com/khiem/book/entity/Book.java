package com.khiem.book.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "books", indexes = {
    @Index(name = "idx_book_title", columnList = "title"),
    @Index(name = "idx_book_author", columnList = "author"),
    @Index(name = "idx_book_isbn", columnList = "isbn", unique = true)
})
@Getter
@Setter
public class Book {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String author;

    @Column(unique = true)
    private String isbn;

    @Column(length = 2000)
    private String description;

    @ElementCollection
    @CollectionTable(name = "book_categories", joinColumns = @JoinColumn(name = "book_id"))
    @Column(name = "category")
    private List<String> categories;

    private LocalDate publishedAt;

    @Column(length = 50)
    private String status; // AVAILABLE, OUT_OF_STOCK, ARCHIVED

    private String publisher;
    private String thumbnailUrl;
    private Integer pageCount;
    private Double averageRating;
    private Integer ratingsCount;
    private String language;
}

