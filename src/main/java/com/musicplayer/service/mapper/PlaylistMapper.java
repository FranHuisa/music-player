package com.musicplayer.service.mapper;

import com.musicplayer.domain.Playlist;
import com.musicplayer.domain.User;
import com.musicplayer.service.dto.PlaylistDTO;
import com.musicplayer.service.dto.UserDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link Playlist} and its DTO {@link PlaylistDTO}.
 */
@Mapper(componentModel = "spring", uses = { PlaylistSongMapper.class })
public interface PlaylistMapper extends EntityMapper<PlaylistDTO, Playlist> {
    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "playlistSongs", source = "playlistSongs")
    PlaylistDTO toDto(Playlist s);

    @Named("userId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    UserDTO toDtoUserId(User user);
}
