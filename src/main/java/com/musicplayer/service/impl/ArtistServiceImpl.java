package com.musicplayer.service.impl;

import com.musicplayer.domain.Artist;
import com.musicplayer.domain.User;
import com.musicplayer.repository.ArtistRepository;
import com.musicplayer.repository.UserRepository;
import com.musicplayer.security.AuthoritiesConstants;
import com.musicplayer.security.SecurityUtils;
import com.musicplayer.service.ArtistService;
import com.musicplayer.service.dto.ArtistDTO;
import com.musicplayer.service.mapper.ArtistMapper;
import com.musicplayer.web.rest.errors.BadRequestAlertException;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.musicplayer.domain.Artist}.
 */
@Service
@Transactional
public class ArtistServiceImpl implements ArtistService {

    private static final Logger LOG = LoggerFactory.getLogger(ArtistServiceImpl.class);

    private final ArtistRepository artistRepository;
    private final UserRepository userRepository;
    private final ArtistMapper artistMapper;

    public ArtistServiceImpl(ArtistRepository artistRepository, ArtistMapper artistMapper, UserRepository userRepository) {
        this.artistRepository = artistRepository;
        this.artistMapper = artistMapper;
        this.userRepository = userRepository;
    }

    @Override
    public ArtistDTO save(ArtistDTO artistDTO) {
        LOG.debug("Request to save Artist : {}", artistDTO);
        Artist artist = artistMapper.toEntity(artistDTO);
        assignUserIfMissing(artist);
        artist = artistRepository.save(artist);
        return artistMapper.toDto(artist);
    }

    @Override
    public ArtistDTO update(ArtistDTO artistDTO) {
        LOG.debug("Request to update Artist : {}", artistDTO);

        Artist existing = artistRepository
            .findById(artistDTO.getId())
            .orElseThrow(() -> new BadRequestAlertException("Entity not found", "artist", "idnotfound"));

        assertOwnerOrAdmin(existing);

        Artist artist = artistMapper.toEntity(artistDTO);
        artist.setUser(existing.getUser());
        assignUserIfMissing(artist);
        artist = artistRepository.save(artist);
        return artistMapper.toDto(artist);
    }

    @Override
    public Optional<ArtistDTO> partialUpdate(ArtistDTO artistDTO) {
        LOG.debug("Request to partially update Artist : {}", artistDTO);

        return artistRepository
            .findById(artistDTO.getId())
            .map(existingArtist -> {
                artistMapper.partialUpdate(existingArtist, artistDTO);

                return existingArtist;
            })
            .map(artistRepository::save)
            .map(artistMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ArtistDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get all Artists");
        return artistRepository.findAll(pageable).map(artistMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<ArtistDTO> findOne(Long id) {
        LOG.debug("Request to get Artist : {}", id);
        return artistRepository.findById(id).map(artistMapper::toDto);
    }

    @Override
    public void delete(Long id) {
        LOG.debug("Request to delete Artist : {}", id);
        artistRepository
            .findById(id)
            .ifPresent(a -> {
                assertOwnerOrAdmin(a);
                artistRepository.deleteById(id);
            });
    }

    private void assertOwnerOrAdmin(Artist artist) {
        if (SecurityUtils.hasCurrentUserThisAuthority(AuthoritiesConstants.ADMIN)) {
            return;
        }
        String login = SecurityUtils.getCurrentUserLogin().orElseThrow(() ->
            new BadRequestAlertException("Usuario no autenticado", "artist", "usernotfound")
        );
        if (artist.getUser() == null || !login.equals(artist.getUser().getLogin())) {
            throw new BadRequestAlertException("Forbidden", "artist", "forbidden");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<ArtistDTO> findByUserLogin(String login) {
        LOG.debug("Request to get Artist by user login : {}", login);
        return artistRepository.findByUserLogin(login).map(artistMapper::toDto);
    }

    @Override
    public void assignUserToArtist(Long artistId, Long userId) {
        Artist artist = artistRepository
            .findById(artistId)
            .orElseThrow(() -> new BadRequestAlertException("Artist not found", "artist", "idnotfound"));

        User user = userRepository.findById(userId).orElseThrow(() -> new BadRequestAlertException("User not found", "user", "idnotfound"));

        artist.setUser(user);

        artistRepository.save(artist);
    }

    private void assignUserIfMissing(Artist artist) {
        if (artist.getUser() != null) {
            return;
        }

        String login = SecurityUtils.getCurrentUserLogin().orElseThrow(() ->
            new BadRequestAlertException("Usuario no autenticado", "artist", "usernotfound")
        );

        User user = userRepository
            .findOneByLogin(login)
            .orElseThrow(() -> new BadRequestAlertException("Usuario no encontrado", "artist", "usernotfound"));

        artist.setUser(user);
    }
}
