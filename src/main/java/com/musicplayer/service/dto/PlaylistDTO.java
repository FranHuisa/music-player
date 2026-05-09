package com.musicplayer.service.dto;

import com.musicplayer.service.dto.PlaylistSongDTO;
import jakarta.persistence.Lob;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;
import java.util.List;
import java.util.Objects;

/**
 * A DTO for the {@link com.musicplayer.domain.Playlist} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class PlaylistDTO implements Serializable {

    private List<PlaylistSongDTO> playlistSongs;

    private Long id;

    @NotNull
    @Size(max = 100)
    private String name;

    @Lob
    private String description;

    private Boolean isPublic;

    @Size(max = 255)
    private String coverImage;

    private Instant createdAt;

    private Instant updatedAt;

    private Long userId;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Boolean getIsPublic() {
        return isPublic;
    }

    public void setIsPublic(Boolean isPublic) {
        this.isPublic = isPublic;
    }

    public String getCoverImage() {
        return coverImage;
    }

    public List<PlaylistSongDTO> getPlaylistSongs() {
        return playlistSongs;
    }

    public void setPlaylistSongs(List<PlaylistSongDTO> playlistSongs) {
        this.playlistSongs = playlistSongs;
    }

    public void setCoverImage(String coverImage) {
        this.coverImage = coverImage;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof PlaylistDTO)) {
            return false;
        }

        PlaylistDTO playlistDTO = (PlaylistDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, playlistDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "PlaylistDTO{" +
                "id=" + getId() +
                ", name='" + getName() + "'" +
                ", description='" + getDescription() + "'" +
                ", isPublic='" + getIsPublic() + "'" +
                ", coverImage='" + getCoverImage() + "'" +
                ", createdAt='" + getCreatedAt() + "'" +
                ", updatedAt='" + getUpdatedAt() + "'" +
                ", userId=" + getUserId() +
                ", playlistSongs=" + getPlaylistSongs() +
                "}";
    }
}
