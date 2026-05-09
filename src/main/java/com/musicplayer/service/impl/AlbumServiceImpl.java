package com.musicplayer.service.impl;

import com.musicplayer.domain.Album;
import com.musicplayer.domain.Artist;
import com.musicplayer.domain.User;
import com.musicplayer.repository.AlbumRepository;
import com.musicplayer.repository.ArtistRepository;
import com.musicplayer.repository.UserRepository;
import com.musicplayer.security.AuthoritiesConstants;
import com.musicplayer.security.SecurityUtils;
import com.musicplayer.service.AlbumService;
import com.musicplayer.service.dto.AlbumDTO;
import com.musicplayer.service.mapper.AlbumMapper;
import com.musicplayer.web.rest.AlbumResource;
import com.musicplayer.web.rest.errors.BadRequestAlertException;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.musicplayer.domain.Album}.
 */
@Service
@Transactional
public class AlbumServiceImpl implements AlbumService {

    private static final Logger LOG = LoggerFactory.getLogger(AlbumServiceImpl.class);

    private static final String ENTITY_NAME = "album";

    private final AlbumRepository albumRepository;
    private final ArtistRepository artistRepository;
    private final UserRepository userRepository;

    private final AlbumMapper albumMapper;

    public AlbumServiceImpl(
        AlbumRepository albumRepository,
        AlbumMapper albumMapper,
        ArtistRepository artistRepository,
        UserRepository userRepository
    ) {
        this.albumRepository = albumRepository;
        this.artistRepository = artistRepository;
        this.userRepository = userRepository;
        this.albumMapper = albumMapper;
    }

    @Override
    public AlbumDTO save(AlbumDTO albumDTO) {
        LOG.debug("Request to save Album : {}", albumDTO);

        Album album = albumMapper.toEntity(albumDTO);

        Artist artist = getOrCreateCurrentArtist();

        album.setArtist(artist);

        album.setActive(false);

        album = albumRepository.save(album);

        return albumMapper.toDto(album);
    }

    @Override
    public AlbumDTO update(AlbumDTO albumDTO) {
        LOG.debug("Request to update Album : {}", albumDTO);
        Album album = albumMapper.toEntity(albumDTO);
        album = albumRepository.save(album);
        return albumMapper.toDto(album);
    }

    @Override
    public Optional<AlbumDTO> partialUpdate(AlbumDTO albumDTO) {
        LOG.debug("Request to partially update Album : {}", albumDTO);

        return albumRepository
            .findById(albumDTO.getId())
            .map(existingAlbum -> {
                albumMapper.partialUpdate(existingAlbum, albumDTO);

                return existingAlbum;
            })
            .map(albumRepository::save)
            .map(albumMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AlbumDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get all Albums");
        return albumRepository.findAll(pageable).map(albumMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<AlbumDTO> findOne(Long id) {
        LOG.debug("Request to get Album : {}", id);
        return albumRepository.findById(id).map(albumMapper::toDto);
    }

    @Override
    public void delete(Long id) {
        LOG.debug("Request to delete Album : {}", id);
        albumRepository.deleteById(id);
    }

    private Artist getOrCreateCurrentArtist() {
        String login = SecurityUtils.getCurrentUserLogin().orElseThrow(() ->
            new BadRequestAlertException("Usuario no autenticado", ENTITY_NAME, "usernotfound")
        );

        return artistRepository.findByUserLogin(login).orElseGet(() -> createArtistForCurrentEditor(login));
    }

    private Artist createArtistForCurrentEditor(String login) {
        if (
            SecurityUtils.hasCurrentUserNoneOfAuthorities(
                AuthoritiesConstants.ADMIN,
                AuthoritiesConstants.EDITOR,
                AuthoritiesConstants.ARTIST
            )
        ) {
            throw new BadRequestAlertException("Artista no encontrado", ENTITY_NAME, "artistnotfound");
        }

        User user = userRepository
            .findOneByLogin(login)
            .orElseThrow(() -> new BadRequestAlertException("Usuario no encontrado", ENTITY_NAME, "usernotfound"));

        Artist artist = new Artist();
        artist.setName(buildArtistName(user));
        artist.setVerified(false);
        artist.setCreatedAt(Instant.now());
        artist.setUser(user);

        return artistRepository.save(artist);
    }

    private String buildArtistName(User user) {
        String fullName = (
            (user.getFirstName() == null ? "" : user.getFirstName()) +
            " " +
            (user.getLastName() == null ? "" : user.getLastName())
        ).trim();
        return fullName.isBlank() ? user.getLogin() : fullName;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AlbumDTO> findAllByCurrentUser(String login, Pageable pageable) {
        LOG.debug("Request to get Albums for user : {}", login);
        return albumRepository.findAllByArtistUserLogin(login, pageable).map(albumMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AlbumDTO> findPublicAlbums(Pageable pageable) {
        LOG.debug("Request to get public Albums");

        LocalDate today = LocalDate.now();

        return albumRepository.findPublicAlbums(today, pageable).map(albumMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AlbumDTO> findUpcomingAlbums() {
        LOG.debug("Request to get upcoming Albums");

        String login = SecurityUtils.getCurrentUserLogin().orElseThrow(() ->
            new BadRequestAlertException("Usuario no autenticado", "album", "usernotfound")
        );

        return albumRepository.findUpcomingAlbums(login).stream().map(albumMapper::toDto).toList();
    }
}
