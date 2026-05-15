package com.musicplayer.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.musicplayer.domain.enumeration.AlbumType;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

/**
 * A Album.
 */
@Entity
@Table(name = "album")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
@SuppressWarnings("common-java:DuplicatedBlocks")
public class Album implements Serializable {

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

    @Size(max = 255)
    @Column(name = "cover_image", length = 255)
    private String coverImage;

    @Column(name = "release_date")
    private LocalDateTime releaseDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "album_type")
    private AlbumType albumType;

    @ManyToOne(optional = false)
    @NotNull
    @JsonIgnoreProperties(value = { "songses" }, allowSetters = true)
    private Artist artist;

    @ManyToOne(fetch = FetchType.LAZY)
    private Genre genre;

    @Column(name = "active", nullable = false)
    private Boolean active = true;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public Album id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return this.title;
    }

    public Album title(String title) {
        this.setTitle(title);
        return this;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getCoverImage() {
        return this.coverImage;
    }

    public Album coverImage(String coverImage) {
        this.setCoverImage(coverImage);
        return this;
    }

    public void setCoverImage(String coverImage) {
        this.coverImage = coverImage;
    }

    public LocalDateTime getReleaseDate() {
        return this.releaseDate;
    }

    public Album releaseDate(LocalDateTime releaseDate) {
        this.setReleaseDate(releaseDate);
        return this;
    }

    public void setReleaseDate(LocalDateTime releaseDate) {
        this.releaseDate = releaseDate;
    }

    public AlbumType getAlbumType() {
        return this.albumType;
    }

    public Album albumType(AlbumType albumType) {
        this.setAlbumType(albumType);
        return this;
    }

    public void setAlbumType(AlbumType albumType) {
        this.albumType = albumType;
    }

    public Artist getArtist() {
        return this.artist;
    }

    public void setArtist(Artist artist) {
        this.artist = artist;
    }

    public Album artist(Artist artist) {
        this.setArtist(artist);
        return this;
    }

    public Genre getGenre() {
        return this.genre;
    }

    public void setGenre(Genre genre) {
        this.genre = genre;
    }

    public Album genre(Genre genre) {
        this.setGenre(genre);
        return this;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public Album active(Boolean active) {
        this.active = active;
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and
    // setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Album)) {
            return false;
        }
        return getId() != null && getId().equals(((Album) o).getId());
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
        return "Album{" +
                "id=" + getId() +
                ", title='" + getTitle() + "'" +
                ", coverImage='" + getCoverImage() + "'" +
                ", releaseDate='" + getReleaseDate() + "'" +
                ", albumType='" + getAlbumType() + "'" +
                "}";
    }
}
