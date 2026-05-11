package com.musicplayer.service.dto;

import jakarta.persistence.Lob;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

/**
 * A DTO for the {@link com.musicplayer.domain.Song} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class SongDTO implements Serializable {

    private Long id;

    @NotNull
    @Size(max = 150)
    private String title;

    @Max(3600)
    private Integer duration;

    @NotNull
    @Size(max = 255)
    private String fileUrl;

    @Size(max = 255)
    private String coverImage;

    @Lob
    private String lyrics;

    private LocalDateTime releaseDate;

    private Instant createdAt;

    private AlbumDTO album;

    private GenreDTO genre;

    private ArtistDTO artist;

    private Boolean active = true;

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    private Set<ArtistDTO> artistses = new HashSet<>();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public Integer getDuration() {
        return duration;
    }

    public void setDuration(Integer duration) {
        this.duration = duration;
    }

    public String getFileUrl() {
        return fileUrl;
    }

    public void setFileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
    }

    public String getCoverImage() {
        return coverImage;
    }

    public void setCoverImage(String coverImage) {
        this.coverImage = coverImage;
    }

    public String getLyrics() {
        return lyrics;
    }

    public void setLyrics(String lyrics) {
        this.lyrics = lyrics;
    }

    public LocalDateTime getReleaseDate() {
        return releaseDate;
    }

    public void setReleaseDate(LocalDateTime releaseDate) {
        this.releaseDate = releaseDate;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public AlbumDTO getAlbum() {
        return album;
    }

    public ArtistDTO getArtist() {
        return artist;
    }

    public void setArtist(ArtistDTO artist) {
        this.artist = artist;
    }

    public void setAlbum(AlbumDTO album) {
        this.album = album;
    }

    public GenreDTO getGenre() {
        return genre;
    }

    public void setGenre(GenreDTO genre) {
        this.genre = genre;
    }

    public Set<ArtistDTO> getArtistses() {
        return artistses;
    }

    public void setArtistses(Set<ArtistDTO> artistses) {
        this.artistses = artistses;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof SongDTO)) {
            return false;
        }

        SongDTO songDTO = (SongDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, songDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "SongDTO{" +
                "id=" + getId() +
                ", title='" + getTitle() + "'" +
                ", duration=" + getDuration() +
                ", fileUrl='" + getFileUrl() + "'" +
                ", coverImage='" + getCoverImage() + "'" +
                ", lyrics='" + getLyrics() + "'" +
                ", releaseDate='" + getReleaseDate() + "'" +
                ", createdAt='" + getCreatedAt() + "'" +
                ", album=" + getAlbum() +
                ", genre=" + getGenre() +
                ", artistses=" + getArtistses() +
                ", active='" + getActive() + "'" +

                "}";
    }
}
