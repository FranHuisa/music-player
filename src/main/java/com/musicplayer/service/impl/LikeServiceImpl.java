package com.musicplayer.service.impl;

import com.musicplayer.domain.Like;
import com.musicplayer.domain.Song;
import com.musicplayer.domain.User;
import com.musicplayer.repository.LikeRepository;
import com.musicplayer.repository.SongRepository;
import com.musicplayer.repository.UserRepository;
import com.musicplayer.security.SecurityUtils;
import com.musicplayer.service.LikeService;
import com.musicplayer.service.dto.LikeDTO;
import com.musicplayer.service.mapper.LikeMapper;
import java.time.Instant;
import java.util.LinkedList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class LikeServiceImpl implements LikeService {

    private static final Logger LOG = LoggerFactory.getLogger(LikeServiceImpl.class);

    private final LikeRepository likeRepository;
    private final LikeMapper likeMapper;
    private final UserRepository userRepository;
    private final SongRepository songRepository;

    public LikeServiceImpl(
        LikeRepository likeRepository,
        LikeMapper likeMapper,
        UserRepository userRepository,
        SongRepository songRepository
    ) {
        this.likeRepository = likeRepository;
        this.likeMapper = likeMapper;
        this.userRepository = userRepository;
        this.songRepository = songRepository;
    }

    @Override
    public LikeDTO save(LikeDTO likeDTO) {
        String login = SecurityUtils.getCurrentUserLogin().orElseThrow(() -> new RuntimeException("No user logged"));

        User user = userRepository.findOneByLogin(login).orElseThrow(() -> new RuntimeException("User not found"));

        // 🔥 EVITAR DUPLICADO
        Optional<Like> existing = likeRepository.findByUserIdAndSongId(user.getId(), likeDTO.getSong().getId());

        if (existing.isPresent()) {
            return likeMapper.toDto(existing.get());
        }

        Like like = likeMapper.toEntity(likeDTO);
        like.setUser(user);
        like.setCreatedAt(java.time.Instant.now());

        like = likeRepository.save(like);

        return likeMapper.toDto(like);
    }

    @Override
    public LikeDTO update(LikeDTO likeDTO) {
        LOG.debug("Request to update Like : {}", likeDTO);
        Like like = likeMapper.toEntity(likeDTO);
        like = likeRepository.save(like);
        return likeMapper.toDto(like);
    }

    @Override
    public Optional<LikeDTO> partialUpdate(LikeDTO likeDTO) {
        LOG.debug("Request to partially update Like : {}", likeDTO);

        return likeRepository
            .findById(likeDTO.getId())
            .map(existingLike -> {
                likeMapper.partialUpdate(existingLike, likeDTO);
                return existingLike;
            })
            .map(likeRepository::save)
            .map(likeMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LikeDTO> findAll() {
        LOG.debug("Request to get all Likes");
        return likeRepository.findAll().stream().map(likeMapper::toDto).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<LikeDTO> findOne(Long id) {
        LOG.debug("Request to get Like : {}", id);
        return likeRepository.findById(id).map(likeMapper::toDto);
    }

    @Override
    public void delete(Long id) {
        LOG.debug("Request to delete Like : {}", id);
        likeRepository.deleteById(id);
    }

    @Override
    public void toggleLike(Long songId) {
        String login = SecurityUtils.getCurrentUserLogin().orElseThrow(() -> new RuntimeException("No user logged"));

        User user = userRepository.findOneByLogin(login).orElseThrow(() -> new RuntimeException("User not found"));

        Optional<Like> existing = likeRepository.findByUserIdAndSongId(user.getId(), songId);

        if (existing.isPresent()) {
            likeRepository.delete(existing.get());
            return;
        }

        Song song = songRepository.findById(songId).orElseThrow(() -> new RuntimeException("Song not found"));

        Like like = new Like();
        like.setUser(user);
        like.setSong(song);
        like.setCreatedAt(java.time.Instant.now());

        likeRepository.save(like);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LikeDTO> findMyLikes() {
        return likeRepository.findByUserIsCurrentUserWithSong().stream().map(likeMapper::toDto).toList();
    }
}
