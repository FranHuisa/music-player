package com.musicplayer.service.mapper;

import com.musicplayer.domain.Album;
import com.musicplayer.domain.Artist;
import com.musicplayer.domain.Genre;
import com.musicplayer.domain.Song;
import com.musicplayer.service.dto.AlbumDTO;
import com.musicplayer.service.dto.ArtistDTO;
import com.musicplayer.service.dto.GenreDTO;
import com.musicplayer.service.dto.SongDTO;
import java.util.Set;
import java.util.stream.Collectors;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface SongMapper extends EntityMapper<SongDTO, Song> {
    @Mapping(target = "album", source = "album")
    @Mapping(target = "coverImage", source = "coverImage")
    @Mapping(target = "genre", source = "genre")
    @Mapping(target = "artistses", source = "artistses")
    SongDTO toDto(Song song);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "artist", ignore = true)
    Song toEntity(SongDTO songDTO);
}
