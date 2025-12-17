package com.khiem.book.repository;

import com.khiem.book.entity.Review;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ReviewRepository extends MongoRepository<Review, String> {
    List<Review> findByBookId(Long bookId);
    List<Review> findByUserId(Long userId);
    boolean existsByUserIdAndBookId(Long userId, Long bookId);
    List<Review> findByBookIdOrderByCreatedAtDesc(Long bookId);
    long countByBookId(Long bookId);
}

