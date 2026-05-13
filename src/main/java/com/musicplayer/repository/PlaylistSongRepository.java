package com.musicplayer.repository;

import com.musicplayer.domain.PlaylistSong;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the PlaylistSong entity.
 */
@SuppressWarnings("unused")
@Repository
public interface PlaylistSongRepository extends JpaRepository<PlaylistSong, Long> {
    Optional<PlaylistSong> findByPlaylistIdAndSongId(Long playlistId, Long songId);

    List<PlaylistSong> findByPlaylistIdOrderByPositionAsc(Long playlistId);
}
