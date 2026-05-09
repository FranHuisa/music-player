package com.musicplayer.service.mapper;

import com.musicplayer.domain.Like;
import com.musicplayer.domain.Song;
import com.musicplayer.domain.User;
import com.musicplayer.service.dto.LikeDTO;
import com.musicplayer.service.dto.SongDTO;
import com.musicplayer.service.dto.UserDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link Like} and its DTO {@link LikeDTO}.
 */
@Mapper(componentModel = "spring")
public interface LikeMapper extends EntityMapper<LikeDTO, Like> {
    @Named("songId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "title", source = "title")
    @Mapping(target = "fileUrl", source = "fileUrl")
    @Mapping(target = "coverImage", source = "coverImage")
    @Mapping(target = "duration", source = "duration")
    SongDTO toDtoSongId(Song song);
}
