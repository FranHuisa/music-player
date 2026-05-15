package com.musicplayer.web.rest;

import com.musicplayer.repository.AlbumRepository;
import com.musicplayer.security.SecurityUtils;
import com.musicplayer.service.AlbumService;
import com.musicplayer.service.ArtistService;
import com.musicplayer.service.dto.AlbumDTO;
import com.musicplayer.service.dto.ArtistDTO;
import com.musicplayer.web.rest.errors.BadRequestAlertException;
import jakarta.annotation.security.PermitAll;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.PaginationUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link com.musicplayer.domain.Album}.
 */
@RestController
@RequestMapping("/api/albums")
public class AlbumResource {

    private static final Logger LOG = LoggerFactory.getLogger(AlbumResource.class);

    private static final String ENTITY_NAME = "album";

    @Value("${jhipster.clientApp.name:musicPlayer}")
    private String applicationName;

    private final AlbumService albumService;

    private final AlbumRepository albumRepository;
    private final ArtistService artistService;

    public AlbumResource(AlbumService albumService, AlbumRepository albumRepository, ArtistService artistService) {
        this.albumService = albumService;
        this.albumRepository = albumRepository;
        this.artistService = artistService;
    }

    /**
     * {@code POST  /albums} : Create a new album.
     *
     * @param albumDTO the albumDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with
     *         body the new albumDTO, or with status {@code 400 (Bad Request)} if
     *         the album has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<AlbumDTO> createAlbum(@Valid @RequestBody AlbumDTO albumDTO) throws URISyntaxException {
        LOG.debug("REST request to save Album : {}", albumDTO);

        if (albumDTO.getId() != null) {
            throw new BadRequestAlertException("A new album cannot already have an ID", ENTITY_NAME, "idexists");
        }

        albumDTO = albumService.save(albumDTO);

        return ResponseEntity.created(new URI("/api/albums/" + albumDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, albumDTO.getId().toString()))
            .body(albumDTO);
    }

    /**
     * {@code PUT  /albums/:id} : Updates an existing album.
     *
     * @param id       the id of the albumDTO to save.
     * @param albumDTO the albumDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body
     *         the updated albumDTO,
     *         or with status {@code 400 (Bad Request)} if the albumDTO is not
     *         valid,
     *         or with status {@code 500 (Internal Server Error)} if the albumDTO
     *         couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<AlbumDTO> updateAlbum(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody AlbumDTO albumDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to update Album : {}, {}", id, albumDTO);
        if (albumDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, albumDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!albumRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        albumDTO = albumService.update(albumDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, albumDTO.getId().toString()))
            .body(albumDTO);
    }

    /**
     * {@code PATCH  /albums/:id} : Partial updates given fields of an existing
     * album, field will ignore if it is null
     *
     * @param id       the id of the albumDTO to save.
     * @param albumDTO the albumDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body
     *         the updated albumDTO,
     *         or with status {@code 400 (Bad Request)} if the albumDTO is not
     *         valid,
     *         or with status {@code 404 (Not Found)} if the albumDTO is not found,
     *         or with status {@code 500 (Internal Server Error)} if the albumDTO
     *         couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<AlbumDTO> partialUpdateAlbum(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody AlbumDTO albumDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update Album partially : {}, {}", id, albumDTO);
        if (albumDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, albumDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!albumRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<AlbumDTO> result = albumService.partialUpdate(albumDTO);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, albumDTO.getId().toString())
        );
    }

    /**
     * {@code GET  /albums} : get all the Albums.
     *
     * @param pageable the pagination information.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list
     *         of Albums in body.
     */
    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AlbumDTO>> getAllAlbumsAdmin(Pageable pageable) {
        Page<AlbumDTO> page = albumService.findAll(pageable);

        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);

        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /albums/:id} : get the "id" album.
     *
     * @param id the id of the albumDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body
     *         the albumDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<AlbumDTO> getAlbum(@PathVariable("id") Long id) {
        LOG.debug("REST request to get Album : {}", id);
        Optional<AlbumDTO> albumDTO = albumService.findOne(id);
        return ResponseUtil.wrapOrNotFound(albumDTO);
    }

    /**
     * {@code DELETE  /albums/:id} : delete the "id" album.
     *
     * @param id the id of the albumDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAlbum(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete Album : {}", id);
        albumService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }

    /**
     * {@code GET  /albums/my} : get all albums of the current logged artist.
     *
     * @param pageable the pagination information.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list
     *         of Albums in body.
     */
    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('EDITOR','ADMIN')")
    public ResponseEntity<List<AlbumDTO>> getMyAlbums(Pageable pageable) {
        String login = SecurityUtils.getCurrentUserLogin().orElseThrow();

        Page<AlbumDTO> page = albumService.findAllByCurrentUser(login, pageable);

        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);

        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    @GetMapping("/public")
    @PermitAll
    public ResponseEntity<List<AlbumDTO>> getPublicAlbums(Pageable pageable) {
        LOG.debug("REST request to get public Albums");

        Page<AlbumDTO> page = albumService.findPublicAlbums(pageable);

        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);

        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    @GetMapping("/upcoming")
    public ResponseEntity<List<AlbumDTO>> getUpcomingAlbums() {
        LOG.debug("REST request to get upcoming Albums");

        return ResponseEntity.ok(albumService.findUpcomingAlbums());
    }

    @GetMapping("/search")
    public ResponseEntity<List<AlbumDTO>> searchAlbums(@RequestParam(required = false) String title, Pageable pageable) {
        Page<AlbumDTO> page = albumService.findAll(pageable);
        List<AlbumDTO> filtered = page
            .getContent()
            .stream()
            .filter(a -> a.getActive() != null && a.getActive())
            .filter(a -> title == null || a.getTitle().toLowerCase().contains(title.toLowerCase()))
            .toList();
        return ResponseEntity.ok(filtered);
    }

    @PatchMapping("/{id}/toggle-active")
    public ResponseEntity<AlbumDTO> toggleActive(@PathVariable Long id) {
        AlbumDTO result = albumService.toggleActive(id);
        return ResponseEntity.ok(result);
    }

    @PostMapping(value = "/{id}/upload-image", consumes = "multipart/form-data")
    public ResponseEntity<AlbumDTO> uploadAlbumImage(@PathVariable Long id, @RequestParam("file") MultipartFile file) throws Exception {
        AlbumDTO album = albumService.uploadImage(id, file);
        return ResponseEntity.ok(album);
    }

    @GetMapping("/artist/{artistId}")
    public ResponseEntity<List<AlbumDTO>> getByArtist(@PathVariable Long artistId) {
        return ResponseEntity.ok(albumService.findByArtistId(artistId));
    }
}
