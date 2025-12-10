package com.khiem.book.service;

import com.khiem.book.entity.Book;
import com.khiem.book.repository.BookRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookCrudServiceTest {

    @Mock
    private BookRepository bookRepository;

    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private BookCrudService bookCrudService;

    @Test
    void importExternal_shouldImportBooks() {
        // Arrange
        String query = "java";
        int limit = 1;

        BookCrudService.GoogleBooksResponse mockResponse = new BookCrudService.GoogleBooksResponse();
        BookCrudService.Item item = new BookCrudService.Item();
        BookCrudService.VolumeInfo volumeInfo = new BookCrudService.VolumeInfo();
        volumeInfo.title = "Test Book";
        volumeInfo.authors = List.of("Author");
        BookCrudService.IndustryIdentifier ii = new BookCrudService.IndustryIdentifier();
        ii.type = "ISBN_13";
        ii.identifier = "1234567890123";
        volumeInfo.industryIdentifiers = List.of(ii);
        item.volumeInfo = volumeInfo;
        mockResponse.items = List.of(item);

        when(restTemplate.getForObject(anyString(), eq(BookCrudService.GoogleBooksResponse.class)))
                .thenReturn(mockResponse);
        when(bookRepository.findByIsbn(anyString())).thenReturn(Optional.empty());

        // Act
        int result = bookCrudService.importExternal(query, limit);

        // Assert
        assertEquals(1, result);
        verify(bookRepository, times(1)).saveAll(anyList());
    }

    @Test
    void importExternal_shouldSkipDuplicates() {
        // Arrange
        String query = "java";
        int limit = 1;

        BookCrudService.GoogleBooksResponse mockResponse = new BookCrudService.GoogleBooksResponse();
        BookCrudService.Item item = new BookCrudService.Item();
        BookCrudService.VolumeInfo volumeInfo = new BookCrudService.VolumeInfo();
        volumeInfo.title = "Duplicate Book";
        BookCrudService.IndustryIdentifier ii = new BookCrudService.IndustryIdentifier();
        ii.type = "ISBN_13";
        ii.identifier = "1234567890123";
        volumeInfo.industryIdentifiers = List.of(ii);
        item.volumeInfo = volumeInfo;
        mockResponse.items = List.of(item);

        when(restTemplate.getForObject(anyString(), eq(BookCrudService.GoogleBooksResponse.class)))
                .thenReturn(mockResponse);
        when(bookRepository.findByIsbn("1234567890123")).thenReturn(Optional.of(new Book()));

        // Act
        int result = bookCrudService.importExternal(query, limit);

        // Assert
        assertEquals(0, result);
        verify(bookRepository, times(1)).saveAll(argThat(iterable -> !iterable.iterator().hasNext()));
    }

    @Test
void importExternal_shouldRetryOnFailure() {
    // Arrange
    String query = "retry";
    int limit = 1;

    // Fake GoogleBooksResponse sau lần retry
    BookCrudService.VolumeInfo vi = new BookCrudService.VolumeInfo();
    vi.title = "Retry Book";
    BookCrudService.IndustryIdentifier ii = new BookCrudService.IndustryIdentifier();
    ii.type = "ISBN_13";
    ii.identifier = "1234567890123";
    vi.industryIdentifiers = List.of(ii);

    BookCrudService.Item item = new BookCrudService.Item();
    item.volumeInfo = vi;

    BookCrudService.GoogleBooksResponse okResponse = new BookCrudService.GoogleBooksResponse();
    okResponse.items = List.of(item);

    // Lần 1: Throw lỗi, Lần 2: Trả về response hợp lệ
    when(restTemplate.getForObject(anyString(), eq(BookCrudService.GoogleBooksResponse.class)))
            .thenThrow(new RuntimeException("API Error"))
            .thenReturn(okResponse);

    when(bookRepository.findByIsbn("1234567890123")).thenReturn(Optional.empty());
    when(bookRepository.saveAll(anyList())).thenAnswer(inv -> inv.getArgument(0));

    // Act
    int result = bookCrudService.importExternal(query, limit);

    // Assert
    assertEquals(1, result);

    // Kiểm tra gọi 2 lần (1 fail + 1 retry)
    verify(restTemplate, times(2))
            .getForObject(anyString(), eq(BookCrudService.GoogleBooksResponse.class));
}

}
