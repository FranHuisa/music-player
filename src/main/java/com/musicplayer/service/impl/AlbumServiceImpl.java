package com.musicplayer.service.impl;

import com.musicplayer.domain.Album;
import com.musicplayer.domain.Artist;
import com.musicplayer.repository.AlbumRepository;
import com.musicplayer.repository.ArtistRepository;
import com.musicplayer.security.SecurityUtils;
import com.musicplayer.service.AlbumService;
import com.musicplayer.service.dto.AlbumDTO;
import com.musicplayer.service.mapper.AlbumMapper;
import com.musicplayer.web.rest.AlbumResource;
import com.musicplayer.web.rest.errors.BadRequestAlertException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

/**
 * Service Implementation for managing {@link com.musicplayer.domain.Album}.
 */
@Service
@Transactional
public class AlbumServiceImpl implements AlbumService {

    private static final Logger LOG = LoggerFactory.getLogger(AlbumServiceImpl.class);

    private final AlbumRepository albumRepository;
    private final ArtistRepository artistRepository;

    private final AlbumMapper albumMapper;

    public AlbumServiceImpl(AlbumRepository albumRepository, AlbumMapper albumMapper, ArtistRepository artistRepository) {
        this.albumRepository = albumRepository;
        this.artistRepository = artistRepository;
        this.albumMapper = albumMapper;
    }

    @Override
    public AlbumDTO save(AlbumDTO albumDTO) {
        LOG.debug("Request to save Album : {}", albumDTO);

        Album album = albumMapper.toEntity(albumDTO);

        String login = SecurityUtils.getCurrentUserLogin().orElseThrow(() ->
            new BadRequestAlertException("Usuario no autenticado", "album", "usernotfound")
        );

        Artist artist = artistRepository
            .findByUserLogin(login)
            .orElseThrow(() -> new BadRequestAlertException("Artista no encontrado", "album", "artistnotfound"));

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

        LocalDateTime today = LocalDateTime.now();

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

    @Override
    public AlbumDTO toggleActive(Long id) {
        Album album = albumRepository.findById(id).orElseThrow(() -> new RuntimeException("Album not found"));
        album.setActive(!Boolean.TRUE.equals(album.getActive()));
        return albumMapper.toDto(albumRepository.save(album));
    }

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @Override
    public AlbumDTO uploadImage(Long id, MultipartFile file) throws Exception {
        Album album = albumRepository.findById(id).orElseThrow(() -> new RuntimeException("Album not found"));

        Path uploadPath = Path.of(uploadDir, "album");
        if (!Files.exists(uploadPath)) Files.createDirectories(uploadPath);

        String extension =
            file.getOriginalFilename() != null ? file.getOriginalFilename().substring(file.getOriginalFilename().lastIndexOf(".")) : ".jpg";
        String filename = UUID.randomUUID().toString() + extension;
        Files.copy(file.getInputStream(), uploadPath.resolve(filename), StandardCopyOption.REPLACE_EXISTING);

        album.setCoverImage("/uploads/album/" + filename);
        return albumMapper.toDto(albumRepository.save(album));
    }
}
