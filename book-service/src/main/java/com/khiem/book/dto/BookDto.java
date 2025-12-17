package com.khiem.book.dto;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.List;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

/**
 * @deprecated This DTO is replaced by BookManagementRequest and BookResponse.
 * Use the new Request/Response pattern for all new development.
 * This class will be removed in version 3.0.
 * 
 * Migration:
 * - For creating/updating books → Use BookManagementRequest
 * - For reading book data → Use BookResponse
 * 
 * @see com.khiem.book.dto.request.BookManagementRequest
 * @see com.khiem.book.dto.response.BookResponse
 */
@Deprecated(since = "2.0", forRemoval = true)
@Getter
@Setter
public class BookDto implements Serializable {
    private static final long serialVersionUID = 1L;
    private Long id;

    @NotBlank
    private String title;

    @NotBlank
    private String author;

    private String isbn;
    private String description;
    private List<String> categories;
    private LocalDate publishedAt;
    private String status;
    private String publisher;
    private String thumbnailUrl;
    private Integer pageCount;
    private Double averageRating;
    private Integer ratingsCount;
    private String language;
}

