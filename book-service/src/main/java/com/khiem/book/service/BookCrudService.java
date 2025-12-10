package com.khiem.book.service;

import com.khiem.book.dto.BookDto;
import com.khiem.book.dto.PageResponse;
import com.khiem.book.entity.Book;
import com.khiem.book.exception.AppException;
import com.khiem.book.exception.ErrorCode;
import com.khiem.book.mapper.BookMapper;
import com.khiem.book.repository.BookRepository;
import com.khiem.book.repository.BookSpecification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.IntStream;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookCrudService {
    private final BookRepository repository;
    private final BookMapper mapper;
    private final RestTemplate restTemplate;

    @Transactional(readOnly = true)
    public BookDto findById(Long id) {
        return repository.findById(id)
                .map(mapper::toDto)
                .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND));
    }

    @Transactional(readOnly = true)
    public PageResponse<BookDto> getBooks(String keyword, String category, Pageable pageable) {
        Specification<Book> spec = Specification.where(null);
        
        if (StringUtils.hasText(keyword)) {
            spec = spec.and(BookSpecification.search(keyword));
        }
        if (StringUtils.hasText(category)) {
            spec = spec.and(BookSpecification.hasCategory(category));
        }

        Page<Book> page = repository.findAll(spec, pageable);
        
        return PageResponse.<BookDto>builder()
                .currentPage(page.getNumber() + 1)
                .totalPages(page.getTotalPages())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .data(page.getContent().stream().map(mapper::toDto).toList())
                .build();
    }

    @Transactional
    @CacheEvict(value = "books", allEntries = true)
    public BookDto create(BookDto dto) {
        if (dto.getIsbn() != null && repository.findByIsbn(dto.getIsbn()).isPresent()) {
            throw new AppException(ErrorCode.ISBN_EXISTED);
        }
        Book saved = repository.save(mapper.toEntity(dto));
        return mapper.toDto(saved);
    }

    @Transactional
    @CacheEvict(value = "books", key = "#id")
    public BookDto update(Long id, BookDto dto) {
        Book existing = repository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND));
        
        Book updated = mapper.toEntity(dto);
        updated.setId(existing.getId());
        // Preserve created info if needed, but for now strict update
        Book saved = repository.save(updated);
        return mapper.toDto(saved);
    }

    @Transactional
    @CacheEvict(value = "books", key = "#id")
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new AppException(ErrorCode.BOOK_NOT_FOUND);
        }
        repository.deleteById(id);
    }

    @Transactional
    @CacheEvict(value = "books", allEntries = true)
    public int provision(int count) {
        List<Book> books = IntStream.range(0, count)
                .mapToObj(i -> {
                    Book b = new Book();
                    b.setTitle("Sample Book " + i);
                    b.setAuthor("Author " + i);
                    b.setIsbn(UUID.randomUUID().toString());
                    b.setDescription("Auto provisioned book " + i);
                    b.setCategories(List.of("General"));
                    b.setPublishedAt(LocalDate.now());
                    b.setStatus("AVAILABLE");
                    return b;
                })
                .toList();
        repository.saveAll(books);
        return books.size();
    }

    @org.springframework.beans.factory.annotation.Value("${app.google-books-api-key:}")
    private String apiKey;

    @Transactional
    @CacheEvict(value = "books", allEntries = true)
    public int importExternal(String query, int limit) {
        long startTime = System.currentTimeMillis();
        int totalImported = 0;
        int startIndex = 0;
        int batchSize = 40; // Google Books API default maxResults
        int retryCount = 0;
        int maxRetries = 3;

        log.info("Starting import of {} books with query '{}'", limit, query);

        while (totalImported < limit) {
            int currentBatch = Math.min(batchSize, limit - totalImported);
            String url = "https://www.googleapis.com/books/v1/volumes?q=" + 
                         URLEncoder.encode(query, StandardCharsets.UTF_8) + 
                         "&startIndex=" + startIndex +
                         "&maxResults=" + currentBatch;
            
            if (StringUtils.hasText(apiKey)) {
                url += "&key=" + apiKey;
            }

            try {
                GoogleBooksResponse resp = restTemplate.getForObject(url, GoogleBooksResponse.class);
                retryCount = 0; // Reset retry on success

                if (resp == null || resp.items == null || resp.items.isEmpty()) {
                    log.info("No more items found at index {}", startIndex);
                    break;
                }
                
                List<Book> books = new ArrayList<>();
                for (Item item : resp.items) {
                    if (item == null || item.volumeInfo == null) continue;
                    VolumeInfo vi = item.volumeInfo;
                    String isbn = extractIsbn(vi);
                    
                    if (isbn == null || repository.findByIsbn(isbn).isPresent()) continue;
                    
                    Book b = new Book();
                    b.setTitle(vi.title != null ? vi.title : "Unknown Title");
                    b.setAuthor(vi.authors != null && !vi.authors.isEmpty() ? String.join(", ", vi.authors) : "Unknown Author");
                    b.setIsbn(isbn);
                    b.setDescription(vi.description != null ? 
                        (vi.description.length() > 2000 ? vi.description.substring(0, 2000) : vi.description) 
                        : "");
                    b.setCategories(vi.categories != null ? vi.categories : List.of("Uncategorized"));
                    b.setPublishedAt(parsePublishedDate(vi.publishedDate));
                    b.setStatus("AVAILABLE");
                    
                    // New fields
                    b.setPublisher(vi.publisher);
                    b.setPageCount(vi.pageCount);
                    b.setLanguage(vi.language);
                    b.setAverageRating(vi.averageRating);
                    b.setRatingsCount(vi.ratingsCount);
                    if (vi.imageLinks != null) {
                        b.setThumbnailUrl(vi.imageLinks.thumbnail != null ? vi.imageLinks.thumbnail : vi.imageLinks.smallThumbnail);
                    }
                    
                    books.add(b);
                }
                repository.saveAll(books);
                totalImported += books.size();
                startIndex += currentBatch;
                log.debug("Imported {} books so far...", totalImported);
                
                // Be nice to the API
                Thread.sleep(100);
            } catch (Exception e) {
                log.error("Error importing books batch at index " + startIndex, e);
                if (retryCount < maxRetries) {
                    retryCount++;
                    log.warn("Retrying... ({}/{})", retryCount, maxRetries);
                    try { Thread.sleep(1000 * retryCount); } catch (InterruptedException ie) {}
                    continue; // Retry same batch
                } else {
                    log.error("Max retries reached. Stopping import.");
                    break; // Stop on max error
                }
            }
        }
        
        long duration = System.currentTimeMillis() - startTime;
        log.info("Import completed. Total: {}. Duration: {} ms", totalImported, duration);
        return totalImported;
    }

    public Map<String, Object> getStatistics() {
        return Map.of(
            "totalBooks", repository.count(),
            "availableBooks", repository.count((root, query, cb) -> cb.equal(root.get("status"), "AVAILABLE"))
        );
    }

    @Cacheable(value = "categories")
    public List<String> getCategories() {
        return repository.findDistinctCategories();
    }

    private String extractIsbn(VolumeInfo vi) {
        if (vi == null || vi.industryIdentifiers == null) return null;
        String isbn13 = vi.industryIdentifiers.stream()
                .filter(i -> "ISBN_13".equals(i.type))
                .map(i -> i.identifier).findFirst().orElse(null);
        if (isbn13 != null) return isbn13;
        return vi.industryIdentifiers.stream()
                .filter(i -> "ISBN_10".equals(i.type))
                .map(i -> i.identifier).findFirst().orElse(null);
    }

    private LocalDate parsePublishedDate(String s) {
        if (s == null || s.isBlank()) return LocalDate.now();
        try { return LocalDate.parse(s); } catch (Exception e) {}
        try {
            int y = Integer.parseInt(s.substring(0,4));
            int m = s.length() >= 7 ? Integer.parseInt(s.substring(5,7)) : 1;
            return LocalDate.of(y, m, 1);
        } catch (Exception e) {}
        return LocalDate.now();
    }

    static class GoogleBooksResponse { public List<Item> items; }
    static class Item { public VolumeInfo volumeInfo; }
    static class VolumeInfo {
        public String title;
        public List<String> authors;
        public String description;
        public List<String> categories;
        public String publishedDate;
        public List<IndustryIdentifier> industryIdentifiers;
        public String publisher;
        public Integer pageCount;
        public String language;
        public Double averageRating;
        public Integer ratingsCount;
        public ImageLinks imageLinks;
    }
    static class ImageLinks {
        public String thumbnail;
        public String smallThumbnail;
    }
    static class IndustryIdentifier { public String type; public String identifier; }
}
