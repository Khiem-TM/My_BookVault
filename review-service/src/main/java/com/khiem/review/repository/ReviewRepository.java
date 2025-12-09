package com.khiem.review.repository;

import com.khiem.review.entity.Review;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ReviewRepository extends MongoRepository<Review, String> {
    List<Review> findByBookId(Long bookId);
}

