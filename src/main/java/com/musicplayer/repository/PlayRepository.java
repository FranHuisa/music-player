package com.musicplayer.repository;

import com.musicplayer.domain.Play;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the Play entity.
 */
@Repository
public interface PlayRepository extends JpaRepository<Play, Long> {
    @Query("select play from Play play where play.user.login = ?#{authentication.name}")
    List<Play> findByUserIsCurrentUser();

    Optional<Play> findTopByUserLoginOrderByPlayedAtDesc(String login);

    @Query(
        """
        select p from Play p
        join fetch p.song
        join fetch p.user
        where p.user.login = :login
        order by p.playedAt desc
        limit 1
        """
    )
    Optional<Play> findLastWithSongByUserLogin(@Param("login") String login);

    @Query(
        """
        select p from Play p
        join fetch p.song s
        join fetch p.user
        where p.user.login = :login
          and p.playedAt = (
              select max(p2.playedAt) from Play p2
              where p2.user.login = :login
                and p2.song = s
          )
        order by p.playedAt desc
        limit 5
        """
    )
    List<Play> findTop5WithSongByUserLogin(@Param("login") String login);
}
