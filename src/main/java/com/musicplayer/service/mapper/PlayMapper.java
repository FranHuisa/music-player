package com.musicplayer.service.mapper;

import com.musicplayer.domain.Play;
import com.musicplayer.domain.Song;
import com.musicplayer.domain.User;
import com.musicplayer.service.dto.PlayDTO;
import com.musicplayer.service.dto.SongDTO;
import com.musicplayer.service.dto.UserDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link Play} and its DTO {@link PlayDTO}.
 */
@Mapper(componentModel = "spring")
public interface PlayMapper extends EntityMapper<PlayDTO, Play> {
    @Mapping(target = "user", source = "user", qualifiedByName = "userId")
    @Mapping(target = "song", source = "song", qualifiedByName = "songId")
    PlayDTO toDto(Play s);

    @Named("userId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    UserDTO toDtoUserId(User user);

    @Named("songId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "title", source = "title")
    @Mapping(target = "coverImage", source = "coverImage")
    SongDTO toDtoSongId(Song song);
}
