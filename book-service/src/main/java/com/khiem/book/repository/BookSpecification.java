package com.khiem.book.repository;

import com.khiem.book.entity.Book;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

public class BookSpecification {
    public static Specification<Book> hasCategory(String category) {
        return (root, query, cb) -> {
            if (!StringUtils.hasText(category)) return null;
            return cb.isMember(category, root.get("categories"));
        };
    }

    public static Specification<Book> search(String keyword) {
        return (root, query, cb) -> {
            if (!StringUtils.hasText(keyword)) return null;
            String likePattern = "%" + keyword.toLowerCase() + "%";
            return cb.or(
                cb.like(cb.lower(root.get("title")), likePattern),
                cb.like(cb.lower(root.get("author")), likePattern),
                cb.like(cb.lower(root.get("isbn")), likePattern)
            );
        };
    }
}
