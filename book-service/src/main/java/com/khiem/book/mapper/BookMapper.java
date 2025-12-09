package com.khiem.book.mapper;

import com.khiem.book.dto.BookDto;
import com.khiem.book.entity.Book;
import org.springframework.stereotype.Component;

@Component
public class BookMapper {
    public BookDto toDto(Book book) {
        if (book == null) return null;
        BookDto dto = new BookDto();
        dto.setId(book.getId());
        dto.setTitle(book.getTitle());
        dto.setAuthor(book.getAuthor());
        dto.setIsbn(book.getIsbn());
        dto.setDescription(book.getDescription());
        dto.setCategories(book.getCategories());
        dto.setPublishedAt(book.getPublishedAt());
        dto.setStatus(book.getStatus());
        return dto;
    }

    public Book toEntity(BookDto dto) {
        if (dto == null) return null;
        Book book = new Book();
        book.setId(dto.getId());
        book.setTitle(dto.getTitle());
        book.setAuthor(dto.getAuthor());
        book.setIsbn(dto.getIsbn());
        book.setDescription(dto.getDescription());
        book.setCategories(dto.getCategories());
        book.setPublishedAt(dto.getPublishedAt());
        book.setStatus(dto.getStatus());
        return book;
    }
}
