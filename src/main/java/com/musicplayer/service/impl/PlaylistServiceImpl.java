package com.musicplayer.service.impl;

import com.musicplayer.domain.Playlist;
import com.musicplayer.domain.PlaylistSong;
import com.musicplayer.domain.Song;
import com.musicplayer.repository.PlaylistRepository;
import com.musicplayer.repository.PlaylistSongRepository;
import com.musicplayer.repository.SongRepository;
import com.musicplayer.service.PlaylistService;
import com.musicplayer.service.dto.PlaylistDTO;
import com.musicplayer.service.mapper.PlaylistMapper;
import java.time.Instant;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.musicplayer.domain.Playlist}.
 */
@Service
@Transactional
public class PlaylistServiceImpl implements PlaylistService {

    private static final Logger LOG = LoggerFactory.getLogger(PlaylistServiceImpl.class);

    private final PlaylistRepository playlistRepository;

    private final PlaylistMapper playlistMapper;
    private final PlaylistSongRepository playlistSongRepository;
    private final SongRepository songRepository;

    public PlaylistServiceImpl(
        PlaylistRepository playlistRepository,
        PlaylistMapper playlistMapper,
        PlaylistSongRepository playlistSongRepository,
        SongRepository songRepository
    ) {
        this.playlistRepository = playlistRepository;
        this.playlistMapper = playlistMapper;
        this.playlistSongRepository = playlistSongRepository;
        this.songRepository = songRepository;
    }

    @Override
    public PlaylistDTO save(PlaylistDTO playlistDTO) {
        LOG.debug("Request to save Playlist : {}", playlistDTO);
        Playlist playlist = playlistMapper.toEntity(playlistDTO);
        playlist = playlistRepository.save(playlist);
        return playlistMapper.toDto(playlist);
    }

    @Override
    public PlaylistDTO update(PlaylistDTO playlistDTO) {
        LOG.debug("Request to update Playlist : {}", playlistDTO);
        Playlist playlist = playlistMapper.toEntity(playlistDTO);
        playlist = playlistRepository.save(playlist);
        return playlistMapper.toDto(playlist);
    }

    @Override
    public Optional<PlaylistDTO> partialUpdate(PlaylistDTO playlistDTO) {
        LOG.debug("Request to partially update Playlist : {}", playlistDTO);

        return playlistRepository
            .findById(playlistDTO.getId())
            .map(existingPlaylist -> {
                playlistMapper.partialUpdate(existingPlaylist, playlistDTO);

                return existingPlaylist;
            })
            .map(playlistRepository::save)
            .map(playlistMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PlaylistDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get all Playlists");
        return playlistRepository.findAll(pageable).map(playlistMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<PlaylistDTO> findOne(Long id) {
        LOG.debug("Request to get Playlist : {}", id);
        return playlistRepository.findById(id).map(playlistMapper::toDto);
    }

    @Override
    public void delete(Long id) {
        LOG.debug("Request to delete Playlist : {}", id);
        playlistRepository.deleteById(id);
    }

    @Override
    public void addSongToPlaylist(Long playlistId, Long songId) {
        Playlist playlist = playlistRepository.findById(playlistId).orElseThrow(() -> new RuntimeException("Playlist no encontrada"));

        Song song = songRepository.findById(songId).orElseThrow(() -> new RuntimeException("Canción no encontrada"));

        boolean exists = playlistSongRepository.findByPlaylistIdAndSongId(playlistId, songId).isPresent();

        if (exists) return;

        PlaylistSong ps = new PlaylistSong();
        ps.setPlaylist(playlist);
        ps.setSong(song);
        ps.setAddedAt(Instant.now());

        playlistSongRepository.save(ps);
    }
}
