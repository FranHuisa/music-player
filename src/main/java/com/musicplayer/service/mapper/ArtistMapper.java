package com.musicplayer.service.mapper;

import com.musicplayer.domain.Artist;
import com.musicplayer.domain.Song;
import com.musicplayer.service.dto.AlbumDTO;
import com.musicplayer.service.dto.ArtistDTO;
import com.musicplayer.service.dto.SongDTO;
import java.util.Set;
import java.util.stream.Collectors;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link Artist} and its DTO {@link ArtistDTO}.
 */
@Mapper(componentModel = "spring")
public interface ArtistMapper extends EntityMapper<ArtistDTO, Artist> {
    @Mapping(target = "songses", source = "songses")
    ArtistDTO toDto(Artist s);

    default SongDTO songToDto(Song song) {
        if (song == null) return null;
        SongDTO dto = new SongDTO();
        dto.setId(song.getId());
        dto.setTitle(song.getTitle());
        dto.setDuration(song.getDuration());
        dto.setCoverImage(song.getCoverImage());
        if (song.getAlbum() != null) {
            AlbumDTO albumDto = new AlbumDTO();
            albumDto.setId(song.getAlbum().getId());
            albumDto.setTitle(song.getAlbum().getTitle());
            dto.setAlbum(albumDto);
        }
        return dto;
    }

    default Set<SongDTO> songsesToDto(Set<Song> songs) {
        if (songs == null) return null;
        return songs.stream().map(this::songToDto).collect(Collectors.toSet());
    }

    @Mapping(target = "songses", ignore = true)
    @Mapping(target = "removeSongs", ignore = true)
    Artist toEntity(ArtistDTO artistDTO);
}
