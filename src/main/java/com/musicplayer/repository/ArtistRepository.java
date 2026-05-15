package com.musicplayer.repository;

import com.musicplayer.domain.Artist;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the Artist entity.
 */
@SuppressWarnings("unused")
@Repository
public interface ArtistRepository extends JpaRepository<Artist, Long> {
    @Query("SELECT a FROM Artist a WHERE a.user.login = :login")
    Optional<Artist> findByUserLogin(@Param("login") String login);

    Page<Artist> findByNameContainingIgnoreCase(String name, Pageable pageable);

    @Query("select a.user.id from Artist a where a.user is not null")
    List<Long> findAllAssignedUserIds();
}
