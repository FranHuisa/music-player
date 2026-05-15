package com.musicplayer.service.mapper;

import com.musicplayer.domain.Artist;
import com.musicplayer.domain.Song;
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
    ArtistDTO toDto(Artist s);

    @Mapping(target = "songses", ignore = true)
    @Mapping(target = "removeSongs", ignore = true)
    Artist toEntity(ArtistDTO artistDTO);
}
