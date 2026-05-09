package com.musicplayer.service;

import com.musicplayer.service.dto.PlaylistDTO;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Service Interface for managing {@link com.musicplayer.domain.Playlist}.
 */
public interface PlaylistService {
    /**
     * Save a playlist.
     *
     * @param playlistDTO the entity to save.
     * @return the persisted entity.
     */
    PlaylistDTO save(PlaylistDTO playlistDTO);

    /**
     * Updates a playlist.
     *
     * @param playlistDTO the entity to update.
     * @return the persisted entity.
     */
    PlaylistDTO update(PlaylistDTO playlistDTO);

    /**
     * Partially updates a playlist.
     *
     * @param playlistDTO the entity to update partially.
     * @return the persisted entity.
     */
    Optional<PlaylistDTO> partialUpdate(PlaylistDTO playlistDTO);

    /**
     * Get all the playlists.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    Page<PlaylistDTO> findAll(Pageable pageable);

    /**
     * Get the "id" playlist.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    Optional<PlaylistDTO> findOne(Long id);

    /**
     * Delete the "id" playlist.
     *
     * @param id the id of the entity.
     */
    void delete(Long id);

    void addSongToPlaylist(Long playlistId, Long songId);
}
