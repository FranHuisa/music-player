package com.musicplayer.service.mapper;

import com.musicplayer.domain.Playlist;
import com.musicplayer.domain.PlaylistSong;
import com.musicplayer.domain.Song;
import com.musicplayer.service.dto.PlaylistDTO;
import com.musicplayer.service.dto.PlaylistSongDTO;
import com.musicplayer.service.dto.SongDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link PlaylistSong} and its DTO
 * {@link PlaylistSongDTO}.
 */
@Mapper(componentModel = "spring")
public interface PlaylistSongMapper extends EntityMapper<PlaylistSongDTO, PlaylistSong> {
    @Mapping(target = "playlist", source = "playlist", qualifiedByName = "playlistId")
    @Mapping(target = "song", source = "song", qualifiedByName = "songId")
    PlaylistSongDTO toDto(PlaylistSong s);

    @Named("playlistId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    PlaylistDTO toDtoPlaylistId(Playlist playlist);

    @Named("songId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "title", source = "title")
    @Mapping(target = "duration", source = "duration")
    @Mapping(target = "fileUrl", source = "fileUrl")
    @Mapping(target = "coverImage", source = "coverImage")
    SongDTO toDtoSongId(Song song);
}
