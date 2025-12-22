package com.khiem.book.repository;

import com.khiem.book.entity.LibraryItem;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LibraryItemRepository extends JpaRepository<LibraryItem, Long> {
    List<LibraryItem> findByUserIdAndShelf(String userId, String shelf);
}

