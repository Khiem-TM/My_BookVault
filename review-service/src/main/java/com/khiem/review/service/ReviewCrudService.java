package com.khiem.review.service;

import com.khiem.review.dto.ReviewDto;
import com.khiem.review.entity.Review;
import com.khiem.review.mapper.ReviewMapper;
import com.khiem.review.repository.ReviewRepository;
import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class ReviewCrudService {
    private final ReviewRepository repository;
    private final ReviewMapper mapper;

    public ReviewCrudService(ReviewRepository repository, ReviewMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    public List<ReviewDto> findAll() {
        return List.of();
    }

    public ReviewDto findById(String id) {
        return repository.findById(id).map(mapper::toDto).orElse(null);
    }

    public List<ReviewDto> findByBookId(Long bookId) {
        return List.of();
    }

    public ReviewDto create(ReviewDto dto) {
        Review entity = mapper.toEntity(dto);
        entity.setCreatedAt(Instant.now());
        return mapper.toDto(repository.save(entity));
    }

    public ReviewDto update(String id, ReviewDto dto) {
        Review existing = repository.findById(id).orElseThrow();
        Review updated = mapper.toEntity(dto);
        updated.setId(existing.getId());
        updated.setCreatedAt(existing.getCreatedAt());
        return mapper.toDto(repository.save(updated));
    }

    public void delete(String id) {
        repository.deleteById(id);
    }
}
