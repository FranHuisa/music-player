package com.musicplayer.service;

import com.musicplayer.domain.Album;
import com.musicplayer.repository.AlbumRepository;
import com.musicplayer.repository.SongRepository;
import jakarta.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
public class AlbumScheduler {

    private final AlbumRepository albumRepository;
    private final SongRepository songRepository;

    public AlbumScheduler(AlbumRepository albumRepository, SongRepository songRepository) {
        this.albumRepository = albumRepository;
        this.songRepository = songRepository;
    }

    @Scheduled(cron = "0 * * * * *")
    @Transactional
    public void activateAlbums() {
        System.out.println(">>> SCHEDULER EJECUTADO: " + LocalDateTime.now());

        LocalDateTime today = LocalDateTime.now();
        List<Album> albums = albumRepository.findByActiveFalseAndReleaseDateLessThanEqual(today);
        System.out.println(">>> Álbumes encontrados: " + albums.size());

        if (albums.isEmpty()) return;

        for (Album album : albums) {
            album.setActive(true);
            songRepository.activateByAlbumId(album.getId());
        }

        albumRepository.saveAll(albums);
    }
}
