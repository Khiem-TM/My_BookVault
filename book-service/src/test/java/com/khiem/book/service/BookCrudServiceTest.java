package com.khiem.book.service;

import com.khiem.book.repository.BookRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookCrudServiceTest {

    @Mock
    private BookRepository bookRepository;

    @Mock
    private GoogleBookImportService googleBookImportService;

    @InjectMocks
    private BookCrudService bookCrudService;

    @Test
    void importExternal_shouldDelegateToGoogleBookImportService() {
        // Arrange
        String query = "java";
        int limit = 10;
        when(googleBookImportService.importBooks(query, limit)).thenReturn(5);

        // Act
        int result = bookCrudService.importExternal(query, limit);

        // Assert
        assertEquals(5, result);
        verify(googleBookImportService, times(1)).importBooks(query, limit);
    }
}
