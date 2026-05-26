package com.musicplayer.service;

import com.musicplayer.service.dto.SongDTO;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Service Interface for managing {@link com.musicplayer.domain.Song}.
 */
public interface SongService {
    /**
     * Save a song.
     *
     * @param songDTO the entity to save.
     * @return the persisted entity.
     */
    SongDTO save(SongDTO songDTO);

    /**
     * Updates a song.
     *
     * @param songDTO the entity to update.
     * @return the persisted entity.
     */
    SongDTO update(SongDTO songDTO);

    /**
     * Partially updates a song.
     *
     * @param songDTO the entity to update partially.
     * @return the persisted entity.
     */
    Optional<SongDTO> partialUpdate(SongDTO songDTO);

    /**
     * Get all the songs.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    Page<SongDTO> findAll(Pageable pageable);

    /**
     * Get all the songs with eager load of many-to-many relationships.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    Page<SongDTO> findAllWithEagerRelationships(Pageable pageable);

    /**
     * Get the "id" song.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    Optional<SongDTO> findOne(Long id);

    /**
     * Delete the "id" song.
     *
     * @param id the id of the entity.
     */
    void delete(Long id);

    List<SongDTO> findByAlbumId(Long albumId);

    // Para la vista pública
    List<SongDTO> findPublicSongs();

    // Para el detalle de un álbum en vista pública
    List<SongDTO> findPublicSongsByAlbumId(Long albumId);

    // Toggle activo/inactivo
    SongDTO toggleActive(Long id);

    Page<SongDTO> findMySongs(Pageable pageable);

    Page<SongDTO> findByTitleContaining(String title, Pageable pageable);

    Page<SongDTO> findPublicSongs(Pageable pageable);

    List<SongDTO> findByArtistId(Long artistId);

    List<SongDTO> findActiveByAlbumId(Long albumId);
}
