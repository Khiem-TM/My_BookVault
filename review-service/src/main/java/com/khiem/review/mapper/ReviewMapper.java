package com.khiem.review.mapper;

import com.khiem.review.dto.ReviewDto;
import com.khiem.review.entity.Review;
import org.springframework.stereotype.Component;

@Component
public class ReviewMapper {
    public ReviewDto toDto(Review review) {
        if (review == null) return null;
        ReviewDto dto = new ReviewDto();
        dto.setId(review.getId());
        dto.setBookId(review.getBookId());
        dto.setUserId(review.getUserId());
        dto.setRating(review.getRating());
        dto.setContent(review.getContent());
        dto.setCreatedAt(review.getCreatedAt());
        return dto;
    }

    public Review toEntity(ReviewDto dto) {
        if (dto == null) return null;
        Review review = new Review();
        review.setId(dto.getId());
        review.setBookId(dto.getBookId());
        review.setUserId(dto.getUserId());
        review.setRating(dto.getRating());
        review.setContent(dto.getContent());
        review.setCreatedAt(dto.getCreatedAt());
        return review;
    }
}
