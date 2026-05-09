package com.musicplayer.repository;

import com.musicplayer.domain.Song;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the Song entity.
 *
 * When extending this class, extend SongRepositoryWithBagRelationships too.
 * For more information refer to
 * https://github.com/jhipster/generator-jhipster/issues/17990.
 */
@Repository
public interface SongRepository extends SongRepositoryWithBagRelationships, JpaRepository<Song, Long> {
    default Optional<Song> findOneWithEagerRelationships(Long id) {
        return this.fetchBagRelationships(this.findById(id));
    }

    default List<Song> findAllWithEagerRelationships() {
        return this.fetchBagRelationships(this.findAll());
    }

    default Page<Song> findAllWithEagerRelationships(Pageable pageable) {
        return this.fetchBagRelationships(this.findAll(pageable));
    }

    List<Song> findByAlbumId(Long albumId);

    // Canciones públicas: activas Y (sin fecha O fecha pasada o de hoy)
    @Query("SELECT s FROM Song s WHERE s.active = true AND (s.releaseDate IS NULL OR s.releaseDate <= :today)")
    List<Song> findPublicSongs(@Param("today") LocalDate today);

    // Canciones públicas de un álbum concreto
    @Query("SELECT s FROM Song s WHERE s.album.id = :albumId AND s.active = true AND (s.releaseDate IS NULL OR s.releaseDate <= :today)")
    List<Song> findPublicSongsByAlbumId(@Param("albumId") Long albumId, @Param("today") LocalDate today);

    @Query("SELECT s FROM Song s WHERE s.artist.user.login = :login")
    Page<Song> findByArtistLogin(@Param("login") String login, Pageable pageable);

    Page<Song> findByTitleContainingIgnoreCase(String title, Pageable pageable);

    Page<Song> findByTitleContainingIgnoreCaseAndActiveTrue(String title, Pageable pageable);

    Page<Song> findByActiveTrue(Pageable pageable);
}
