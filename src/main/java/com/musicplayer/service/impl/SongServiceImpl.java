package com.musicplayer.service.impl;

import com.musicplayer.domain.Artist;
import com.musicplayer.domain.Song;
import com.musicplayer.repository.ArtistRepository;
import com.musicplayer.repository.SongRepository;
import com.musicplayer.security.OwnershipSecurityService;
import com.musicplayer.security.SecurityUtils;
import com.musicplayer.service.SongService;
import com.musicplayer.service.dto.SongDTO;
import com.musicplayer.service.mapper.SongMapper;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.musicplayer.domain.Song}.
 */
@Service
@Transactional
public class SongServiceImpl implements SongService {

    private static final Logger LOG = LoggerFactory.getLogger(SongServiceImpl.class);

    private final SongRepository songRepository;

    private final SongMapper songMapper;

    private final ArtistRepository artistRepository;

    private final OwnershipSecurityService ownershipSecurityService;

    public SongServiceImpl(
        SongRepository songRepository,
        SongMapper songMapper,
        ArtistRepository artistRepository,
        OwnershipSecurityService ownershipSecurityService
    ) {
        this.songRepository = songRepository;
        this.songMapper = songMapper;
        this.artistRepository = artistRepository;
        this.ownershipSecurityService = ownershipSecurityService;
    }

    @Override
    public SongDTO save(SongDTO songDTO) {
        Song song = songMapper.toEntity(songDTO);

        String login = SecurityUtils.getCurrentUserLogin().orElseThrow(() -> new RuntimeException("No user logged"));

        Artist artist = artistRepository.findByUserLogin(login).orElseThrow(() -> new RuntimeException("Artist not found"));

        song.setArtist(artist);

        song = songRepository.save(song);

        return songMapper.toDto(song);
    }

    @Override
    public SongDTO update(SongDTO songDTO) {
        Song song = songRepository.findById(songDTO.getId()).orElseThrow(() -> new RuntimeException("Song not found"));

        if (!ownershipSecurityService.canAccessSong(song)) {
            throw new org.springframework.security.access.AccessDeniedException("No permitido");
        }

        song.setTitle(songDTO.getTitle());
        song.setDuration(songDTO.getDuration());
        song.setFileUrl(songDTO.getFileUrl());
        song.setCoverImage(songDTO.getCoverImage());
        song.setLyrics(songDTO.getLyrics());
        song.setReleaseDate(songDTO.getReleaseDate());
        song.setActive(songDTO.getActive());
        song.setAlbum(songMapper.toEntity(songDTO).getAlbum());
        song.setGenre(songMapper.toEntity(songDTO).getGenre());
        song.setArtistses(songMapper.toEntity(songDTO).getArtistses());

        song = songRepository.save(song);

        return songMapper.toDto(song);
    }

    @Override
    public Optional<SongDTO> partialUpdate(SongDTO songDTO) {
        LOG.debug("Request to partially update Song : {}", songDTO);

        return songRepository
            .findById(songDTO.getId())
            .map(existingSong -> {
                songMapper.partialUpdate(existingSong, songDTO);

                return existingSong;
            })
            .map(songRepository::save)
            .map(songMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<SongDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get all Songs");
        return songRepository.findAll(pageable).map(songMapper::toDto);
    }

    public Page<SongDTO> findAllWithEagerRelationships(Pageable pageable) {
        return songRepository.findAllWithEagerRelationships(pageable).map(songMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<SongDTO> findOne(Long id) {
        Song song = songRepository.findOneWithEagerRelationships(id).orElseThrow(() -> new RuntimeException("Song not found"));

        if (!ownershipSecurityService.canAccessSong(song)) {
            throw new org.springframework.security.access.AccessDeniedException("No access");
        }

        return Optional.of(songMapper.toDto(song));
    }

    @Override
    public void delete(Long id) {
        Song song = songRepository.findById(id).orElseThrow(() -> new RuntimeException("Song not found"));

        if (!ownershipSecurityService.canAccessSong(song)) {
            throw new org.springframework.security.access.AccessDeniedException("No permitido");
        }

        songRepository.delete(song);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SongDTO> findByAlbumId(Long albumId) {
        LOG.debug("Request to get Songs by Album : {}", albumId);
        return songRepository.findByAlbumId(albumId).stream().map(songMapper::toDto).collect(java.util.stream.Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SongDTO> findPublicSongs() {
        LOG.debug("Request to get public Songs");
        return songRepository.findPublicSongs(LocalDate.now()).stream().map(songMapper::toDto).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SongDTO> findPublicSongsByAlbumId(Long albumId) {
        LOG.debug("Request to get public Songs for Album : {}", albumId);
        return songRepository
            .findPublicSongsByAlbumId(albumId, LocalDate.now())
            .stream()
            .map(songMapper::toDto)
            .collect(Collectors.toList());
    }

    @Override
    public SongDTO toggleActive(Long id) {
        LOG.debug("Request to toggle active Song : {}", id);
        return songRepository
            .findById(id)
            .map(song -> {
                song.setActive(!Boolean.TRUE.equals(song.getActive()));
                return songRepository.save(song);
            })
            .map(songMapper::toDto)
            .orElseThrow(() -> new RuntimeException("Song not found: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<SongDTO> findMySongs(Pageable pageable) {
        String login = SecurityUtils.getCurrentUserLogin().orElseThrow(() -> new RuntimeException("No user logged"));

        return songRepository.findByArtistLogin(login, pageable).map(songMapper::toDto);
    }

    @Override
    public Page<SongDTO> findByTitleContaining(String title, Pageable pageable) {
        return songRepository.findByTitleContainingIgnoreCaseAndActiveTrue(title, pageable).map(songMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<SongDTO> findPublicSongs(Pageable pageable) {
        return songRepository.findByActiveTrue(pageable).map(songMapper::toDto);
    }

    @Override
    public List<SongDTO> findByArtistId(Long artistId) {
        return songRepository.findByArtistId(artistId).stream().map(songMapper::toDto).toList();
    }
}
