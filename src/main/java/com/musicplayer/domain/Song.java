package com.musicplayer.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serial;
import java.io.Serializable;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

/**
 * A Song.
 */
@Entity
@Table(name = "song")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
@SuppressWarnings("common-java:DuplicatedBlocks")
public class Song implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @NotNull
    @Size(max = 150)
    @Column(name = "title", length = 150, nullable = false)
    private String title;

    @Column(name = "duration")
    private Integer duration;

    @NotNull
    @Size(max = 255)
    @Column(name = "file_url", length = 255, nullable = false)
    private String fileUrl;

    @Size(max = 255)
    @Column(name = "cover_image", length = 255)
    private String coverImage;

    @Lob
    @Column(name = "lyrics")
    private String lyrics;

    @Column(name = "release_date")
    private LocalDateTime releaseDate;

    @Column(name = "created_at")
    private Instant createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "artist", "genre" }, allowSetters = true)
    private Album album;

    @ManyToOne(fetch = FetchType.LAZY)
    private Genre genre;

    @ManyToOne
    private Artist artist;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "rel_song__artists",
        joinColumns = @JoinColumn(name = "song_id"),
        inverseJoinColumns = @JoinColumn(name = "artists_id")
    )
    @Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
    @JsonIgnoreProperties(value = { "songses" }, allowSetters = true)
    private Set<Artist> artistses = new HashSet<>();

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public Song id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return this.title;
    }

    public Song title(String title) {
        this.setTitle(title);
        return this;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public Integer getDuration() {
        return this.duration;
    }

    public Song duration(Integer duration) {
        this.setDuration(duration);
        return this;
    }

    public Artist getArtist() {
        return this.artist;
    }

    public void setDuration(Integer duration) {
        this.duration = duration;
    }

    public String getFileUrl() {
        return this.fileUrl;
    }

    public Song fileUrl(String fileUrl) {
        this.setFileUrl(fileUrl);
        return this;
    }

    public void setFileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
    }

    public String getCoverImage() {
        return this.coverImage;
    }

    public Song coverImage(String coverImage) {
        this.setCoverImage(coverImage);
        return this;
    }

    public void setCoverImage(String coverImage) {
        this.coverImage = coverImage;
    }

    public String getLyrics() {
        return this.lyrics;
    }

    public Song lyrics(String lyrics) {
        this.setLyrics(lyrics);
        return this;
    }

    public void setLyrics(String lyrics) {
        this.lyrics = lyrics;
    }

    public LocalDateTime getReleaseDate() {
        return this.releaseDate;
    }

    public Song releaseDate(LocalDateTime releaseDate) {
        this.setReleaseDate(releaseDate);
        return this;
    }

    public void setReleaseDate(LocalDateTime releaseDate) {
        this.releaseDate = releaseDate;
    }

    public Instant getCreatedAt() {
        return this.createdAt;
    }

    public Song createdAt(Instant createdAt) {
        this.setCreatedAt(createdAt);
        return this;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    @Column(name = "active", nullable = false)
    private Boolean active = true;

    public Boolean getActive() {
        return this.active;
    }

    public Song active(Boolean active) {
        this.setActive(active);
        return this;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public Album getAlbum() {
        return this.album;
    }

    public void setAlbum(Album album) {
        this.album = album;
    }

    public Song album(Album album) {
        this.setAlbum(album);
        return this;
    }

    public Genre getGenre() {
        return this.genre;
    }

    public void setGenre(Genre genre) {
        this.genre = genre;
    }

    public Song genre(Genre genre) {
        this.setGenre(genre);
        return this;
    }

    public Set<Artist> getArtistses() {
        return this.artistses;
    }

    public void setArtistses(Set<Artist> artists) {
        this.artistses = artists;
    }

    public Song artistses(Set<Artist> artists) {
        this.setArtistses(artists);
        return this;
    }

    public void setArtist(Artist artist) {
        this.artist = artist;
    }

    public Song addArtists(Artist artist) {
        this.artistses.add(artist);
        return this;
    }

    public Song removeArtists(Artist artist) {
        this.artistses.remove(artist);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and
    // setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Song)) {
            return false;
        }
        return getId() != null && getId().equals(((Song) o).getId());
    }

    @Override
    public int hashCode() {
        // see
        // https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "Song{" +
                "id=" + getId() +
                ", title='" + getTitle() + "'" +
                ", duration=" + getDuration() +
                ", fileUrl='" + getFileUrl() + "'" +
                ", coverImage='" + getCoverImage() + "'" +
                ", lyrics='" + getLyrics() + "'" +
                ", releaseDate='" + getReleaseDate() + "'" +
                ", createdAt='" + getCreatedAt() + "'" +
                "}";
    }
}
