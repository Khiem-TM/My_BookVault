package com.khiem.book.repository;

import com.khiem.book.entity.PlaylistBook;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PlaylistBookRepository extends JpaRepository<PlaylistBook, Long> {
    List<PlaylistBook> findByPlaylistIdOrderByPosition(Long playlistId);
    Optional<PlaylistBook> findByPlaylistIdAndBookId(Long playlistId, Long bookId);
    void deleteByPlaylistIdAndBookId(Long playlistId, Long bookId);
}
