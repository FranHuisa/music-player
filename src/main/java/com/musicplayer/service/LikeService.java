package com.musicplayer.service;

import com.musicplayer.service.dto.LikeDTO;
import java.util.List;
import java.util.Optional;

/**
 * Service Interface for managing {@link com.musicplayer.domain.Like}.
 */
public interface LikeService {
    /**
     * Save a like.
     *
     * @param likeDTO the entity to save.
     * @return the persisted entity.
     */
    LikeDTO save(LikeDTO likeDTO);

    /**
     * Updates a like.
     *
     * @param likeDTO the entity to update.
     * @return the persisted entity.
     */
    LikeDTO update(LikeDTO likeDTO);

    /**
     * Partially updates a like.
     *
     * @param likeDTO the entity to update partially.
     * @return the persisted entity.
     */
    Optional<LikeDTO> partialUpdate(LikeDTO likeDTO);

    /**
     * Get all the likes.
     *
     * @return the list of entities.
     */
    List<LikeDTO> findAll();

    /**
     * Get the "id" like.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    Optional<LikeDTO> findOne(Long id);

    /**
     * Delete the "id" like.
     *
     * @param id the id of the entity.
     */
    void delete(Long id);

    void toggleLike(Long songId);

    List<LikeDTO> findMyLikes();
}
