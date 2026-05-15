package com.musicplayer.web.rest;

import com.musicplayer.domain.User;
import com.musicplayer.repository.PlayRepository;
import com.musicplayer.repository.UserRepository;
import com.musicplayer.security.SecurityUtils;
import com.musicplayer.service.PlayService;
import com.musicplayer.service.dto.PlayDTO;
import com.musicplayer.service.dto.UserDTO;
import com.musicplayer.service.mapper.PlayMapper;
import com.musicplayer.web.rest.errors.BadRequestAlertException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link com.musicplayer.domain.Play}.
 */
@RestController
@RequestMapping("/api/plays")
public class PlayResource {

    private static final Logger LOG = LoggerFactory.getLogger(PlayResource.class);

    private static final String ENTITY_NAME = "play";

    @Value("${jhipster.clientApp.name:musicPlayer}")
    private String applicationName;

    private final PlayService playService;

    private final PlayMapper playMapper;

    private final UserRepository userRepository;

    private final PlayRepository playRepository;

    public PlayResource(PlayService playService, UserRepository userRepository, PlayRepository playRepository, PlayMapper playMapper) {
        this.playService = playService;
        this.userRepository = userRepository;
        this.playRepository = playRepository;
        this.playMapper = playMapper;
    }

    /**
     * {@code POST  /plays} : Create a new play.
     *
     * @param playDTO the playDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with
     *         body the new playDTO, or with status {@code 400 (Bad Request)} if the
     *         play has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<PlayDTO> createPlay(@RequestBody PlayDTO playDTO) throws URISyntaxException {
        if (playDTO.getId() != null) {
            throw new BadRequestAlertException("A new play cannot already have an ID", ENTITY_NAME, "idexists");
        }

        // Obtener usuario autenticado
        String login = SecurityUtils.getCurrentUserLogin().orElseThrow(() ->
            new BadRequestAlertException("No authenticated user", ENTITY_NAME, "nologin")
        );

        User user = userRepository
            .findOneByLogin(login)
            .orElseThrow(() -> new BadRequestAlertException("User not found", ENTITY_NAME, "usernotfound"));

        UserDTO userDTO = new UserDTO();
        userDTO.setId(user.getId());
        playDTO.setUser(userDTO);

        playDTO = playService.save(playDTO);

        return ResponseEntity.created(new URI("/api/plays/" + playDTO.getId())).body(playDTO);
    }

    /**
     * {@code PUT  /plays/:id} : Updates an existing play.
     *
     * @param id      the id of the playDTO to save.
     * @param playDTO the playDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body
     *         the updated playDTO,
     *         or with status {@code 400 (Bad Request)} if the playDTO is not valid,
     *         or with status {@code 500 (Internal Server Error)} if the playDTO
     *         couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<PlayDTO> updatePlay(@PathVariable(value = "id", required = false) final Long id, @RequestBody PlayDTO playDTO)
        throws URISyntaxException {
        LOG.debug("REST request to update Play : {}, {}", id, playDTO);
        if (playDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, playDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!playRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        playDTO = playService.update(playDTO);
        return ResponseEntity.ok().body(playDTO);
    }

    /**
     * {@code PATCH  /plays/:id} : Partial updates given fields of an existing play,
     * field will ignore if it is null
     *
     * @param id      the id of the playDTO to save.
     * @param playDTO the playDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body
     *         the updated playDTO,
     *         or with status {@code 400 (Bad Request)} if the playDTO is not valid,
     *         or with status {@code 404 (Not Found)} if the playDTO is not found,
     *         or with status {@code 500 (Internal Server Error)} if the playDTO
     *         couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<PlayDTO> partialUpdatePlay(
        @PathVariable(value = "id", required = false) final Long id,
        @RequestBody PlayDTO playDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update Play partially : {}, {}", id, playDTO);
        if (playDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, playDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!playRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<PlayDTO> result = playService.partialUpdate(playDTO);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, playDTO.getId().toString())
        );
    }

    /**
     * {@code GET  /plays} : get all the Plays.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list
     *         of Plays in body.
     */
    @GetMapping("")
    public List<PlayDTO> getAllPlays() {
        LOG.debug("REST request to get all Plays");
        return playService.findAll();
    }

    /**
     * {@code GET  /plays/:id} : get the "id" play.
     *
     * @param id the id of the playDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body
     *         the playDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<PlayDTO> getPlay(@PathVariable("id") Long id) {
        LOG.debug("REST request to get Play : {}", id);
        Optional<PlayDTO> playDTO = playService.findOne(id);
        return ResponseUtil.wrapOrNotFound(playDTO);
    }

    /**
     * {@code DELETE  /plays/:id} : delete the "id" play.
     *
     * @param id the id of the playDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePlay(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete Play : {}", id);
        playService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/recent")
    @Transactional(readOnly = true)
    public List<PlayDTO> getRecentPlays() {
        String login = SecurityUtils.getCurrentUserLogin().orElseThrow(() ->
            new BadRequestAlertException("No authenticated user", ENTITY_NAME, "nologin")
        );
        return playRepository.findTop5WithSongByUserLogin(login).stream().map(playMapper::toDto).toList();
    }

    @GetMapping("/last")
    @Transactional(readOnly = true)
    public ResponseEntity<PlayDTO> getLastPlay() {
        String login = SecurityUtils.getCurrentUserLogin().orElseThrow(() ->
            new BadRequestAlertException("No authenticated user", ENTITY_NAME, "nologin")
        );

        return playRepository
            .findLastWithSongByUserLogin(login)
            .map(playMapper::toDto)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.noContent().build());
    }
}
