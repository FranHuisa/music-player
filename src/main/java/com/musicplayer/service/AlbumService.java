package com.musicplayer.service;

import com.musicplayer.service.dto.AlbumDTO;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

/**
 * Service Interface for managing {@link com.musicplayer.domain.Album}.
 */
public interface AlbumService {
    /**
     * Save a album.
     *
     * @param albumDTO the entity to save.
     * @return the persisted entity.
     */
    AlbumDTO save(AlbumDTO albumDTO);

    /**
     * Updates a album.
     *
     * @param albumDTO the entity to update.
     * @return the persisted entity.
     */
    AlbumDTO update(AlbumDTO albumDTO);

    /**
     * Partially updates a album.
     *
     * @param albumDTO the entity to update partially.
     * @return the persisted entity.
     */
    Optional<AlbumDTO> partialUpdate(AlbumDTO albumDTO);

    /**
     * Get all the albums.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    Page<AlbumDTO> findAll(Pageable pageable);

    /**
     * Get the "id" album.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    Optional<AlbumDTO> findOne(Long id);

    /**
     * Delete the "id" album.
     *
     * @param id the id of the entity.
     */
    void delete(Long id);

    Page<AlbumDTO> findAllByCurrentUser(String login, Pageable pageable);

    Page<AlbumDTO> findPublicAlbums(Pageable pageable);

    List<AlbumDTO> findUpcomingAlbums();

    AlbumDTO toggleActive(Long id);

    AlbumDTO uploadImage(Long id, MultipartFile file) throws Exception;
}
