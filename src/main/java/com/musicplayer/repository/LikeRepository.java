package com.musicplayer.repository;

import com.musicplayer.domain.Like;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the Like entity.
 */
@SuppressWarnings("unused")
@Repository
public interface LikeRepository extends JpaRepository<Like, Long> {
    @Query("select like from Like like where like.user.login = ?#{authentication.name}")
    List<Like> findByUserIsCurrentUser();

    Optional<Like> findByUserIdAndSongId(Long userId, Long songId);
    List<Like> findByUserLogin(String login);
}
