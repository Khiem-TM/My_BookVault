package com.khiem.book.dto;

import java.time.LocalDate;
import java.util.List;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BookDto {
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
}

