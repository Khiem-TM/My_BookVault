package com.khiem.book.service;

import com.khiem.book.dto.google.GoogleBooksResponse;
import com.khiem.book.dto.google.GoogleBookVolume;
import com.khiem.book.dto.google.IndustryIdentifier;
import com.khiem.book.dto.google.VolumeInfo;
import com.khiem.book.entity.Book;
import com.khiem.book.entity.BookStatus;
import com.khiem.book.entity.BookType;
import com.khiem.book.repository.BookRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service to crawl books from Google Books API and save to database.
 * This is a one-time manual import service.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class GoogleBookImportService {

    private final BookRepository bookRepository;
    private final WebClient.Builder webClientBuilder;

    private static final String GOOGLE_BOOKS_API_URL = "https://www.googleapis.com/books/v1/volumes";
    private static final int MAX_RESULTS = 40;
    private static final int TOTAL_BOOKS_TO_FETCH = 500;

    /**
     * Main method to trigger the import process.
     */
    public void importBooks() {
        log.info("🚀 Starting Google Books import...");
        
        String[] keywords = {"computer science", "programming", "ai", "novel", "software architecture", "java", "python", "algorithms"};
        int totalImported = 0;

        for (String keyword : keywords) {
            // Import up to 20 books per keyword
            totalImported += importBooks(keyword, 20);
        }

        log.info("✅ Import completed. Total imported: {}", totalImported);
    }

    /**
     * Import books based on a query.
     * @param query The search query
     * @param limit Maximum number of books to import
     * @return Number of books successfully imported
     */
    @Transactional
    public int importBooks(String query, int limit) {
        log.info("🔍 Searching for books with query: {}, limit: {}", query, limit);
        int totalImported = 0;
        int startIndex = 0;
        boolean hasMore = true;
        int maxSearchDepth = Math.max(100, limit * 5); // Safety break

        WebClient webClient = webClientBuilder.baseUrl(GOOGLE_BOOKS_API_URL).build();

        while (hasMore && totalImported < limit && startIndex < maxSearchDepth) {
            try {
                int currentStartIndex = startIndex;
                
                GoogleBooksResponse response = webClient.get()
                        .uri(uriBuilder -> uriBuilder
                                .queryParam("q", query)
                                .queryParam("maxResults", MAX_RESULTS) // Always fetch max page size to be efficient
                                .queryParam("startIndex", currentStartIndex)
                                .build())
                        .retrieve()
                        .bodyToMono(GoogleBooksResponse.class)
                        .block();

                if (response == null || response.getItems() == null || response.getItems().isEmpty()) {
                    hasMore = false;
                    continue;
                }

                for (GoogleBookVolume volume : response.getItems()) {
                    if (totalImported >= limit) break;
                    if (processBook(volume)) {
                        totalImported++;
                    }
                }

                startIndex += MAX_RESULTS;
                Thread.sleep(300);

            } catch (Exception e) {
                log.error("❌ Error fetching books for query {}: {}", query, e.getMessage());
                hasMore = false;
            }
        }
        return totalImported;
    }

    /**
     * Process a single book volume from Google Books API.
     * @param volume The book volume data
     * @return true if imported, false if skipped
     */
    @Transactional
    protected boolean processBook(GoogleBookVolume volume) {
        VolumeInfo info = volume.getVolumeInfo();

        // Skip if essential data is missing
        if (info == null || info.getTitle() == null || info.getAuthors() == null || info.getAuthors().isEmpty()) {
            return false;
        }

        // Extract ISBN
        String isbn = extractIsbn(info.getIndustryIdentifiers());
        if (isbn == null) {
            return false; // Skip if no ISBN found
        }

        // Deduplicate by ISBN
        if (bookRepository.existsByIsbn(isbn)) {
            return false; // Skip if already exists
        }

        try {
            Book book = mapToBookEntity(info, isbn);
            bookRepository.save(book);
            log.debug("💾 Saved book: {}", book.getTitle());
            return true;
        } catch (Exception e) {
            log.error("⚠️ Failed to save book {}: {}", info.getTitle(), e.getMessage());
            return false;
        }
    }

    /**
     * Map Google Books VolumeInfo to Book entity.
     */
    private Book mapToBookEntity(VolumeInfo info, String isbn) {
        return Book.builder()
                .title(info.getTitle())
                .author(String.join(", ", info.getAuthors()))
                .isbn(isbn)
                .description(info.getDescription() != null ? 
                        (info.getDescription().length() > 2000 ? info.getDescription().substring(0, 1997) + "..." : info.getDescription()) 
                        : "No description available")
                .categories(info.getCategories() != null ? info.getCategories() : new ArrayList<>())
                .publishedAt(parseDate(info.getPublishedDate()))
                .publisher(info.getPublisher())
                .thumbnailUrl(info.getImageLinks() != null ? info.getImageLinks().getThumbnail() : null)
                .pageCount(info.getPageCount())
                .language(info.getLanguage())
                
                // Default values
                .bookType(BookType.PHYSICAL_BOOK)
                .status(BookStatus.AVAILABLE)
                .totalQuantity(10)
                .availableQuantity(10)
                .rentalPrice(null)
                .rentalDurationDays(null)
                .averageRating(0.0)
                .ratingsCount(0)
                .build();
    }

    /**
     * Extract ISBN-13 or ISBN-10 from industry identifiers.
     */
    private String extractIsbn(List<IndustryIdentifier> identifiers) {
        if (identifiers == null) return null;
        
        // Prefer ISBN_13
        for (IndustryIdentifier id : identifiers) {
            if ("ISBN_13".equals(id.getType())) {
                return id.getIdentifier();
            }
        }
        
        // Fallback to ISBN_10
        for (IndustryIdentifier id : identifiers) {
            if ("ISBN_10".equals(id.getType())) {
                return id.getIdentifier();
            }
        }
        
        return null;
    }

    /**
     * Parse published date string to LocalDate.
     * Handles "YYYY-MM-DD" and "YYYY" formats.
     */
    private LocalDate parseDate(String dateStr) {
        if (dateStr == null || dateStr.isEmpty()) return null;
        
        try {
            if (dateStr.length() == 4) {
                // Year only
                return LocalDate.of(Integer.parseInt(dateStr), 1, 1);
            } else {
                // Full date
                return LocalDate.parse(dateStr, DateTimeFormatter.ISO_DATE);
            }
        } catch (DateTimeParseException | NumberFormatException e) {
            return null;
        }
    }
}
