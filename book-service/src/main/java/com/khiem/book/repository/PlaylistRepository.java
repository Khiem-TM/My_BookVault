package com.khiem.book.repository;

import com.khiem.book.entity.Playlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PlaylistRepository extends JpaRepository<Playlist, Long> {
    List<Playlist> findByUserId(String userId);
    Optional<Playlist> findByIdAndUserId(Long id, String userId);
    boolean existsByIdAndUserId(Long id, String userId);
}
