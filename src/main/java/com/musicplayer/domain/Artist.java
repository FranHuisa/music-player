package com.musicplayer.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.musicplayer.domain.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serial;
import java.io.Serializable;
import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

/**
 * A Artist.
 */
@Entity
@Table(name = "artist")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
@SuppressWarnings("common-java:DuplicatedBlocks")
public class Artist implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @NotNull
    @Size(max = 100)
    @Column(name = "name", length = 100, nullable = false)
    private String name;

    @Lob
    @Column(name = "bio")
    private String bio;

    @Size(max = 255)
    @Column(name = "image", length = 255)
    private String image;

    @Size(max = 2)
    @Column(name = "country", length = 2)
    private String country;

    @Column(name = "verified")
    private Boolean verified;

    @Column(name = "created_at")
    private Instant createdAt;

    @ManyToMany(fetch = FetchType.LAZY, mappedBy = "artistses")
    @Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
    @JsonIgnoreProperties(value = { "album", "genre", "artistses" }, allowSetters = true)
    private Set<Song> songses = new HashSet<>();

    // jhipster-needle-entity-add-field - JHipster will add fields here

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    public User getUser() {
        return this.user;
    }

    public Artist user(User user) {
        this.setUser(user);
        return this;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Long getId() {
        return this.id;
    }

    public Artist id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return this.name;
    }

    public Artist name(String name) {
        this.setName(name);
        return this;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getBio() {
        return this.bio;
    }

    public Artist bio(String bio) {
        this.setBio(bio);
        return this;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getImage() {
        return this.image;
    }

    public Artist image(String image) {
        this.setImage(image);
        return this;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public String getCountry() {
        return this.country;
    }

    public Artist country(String country) {
        this.setCountry(country);
        return this;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public Boolean getVerified() {
        return this.verified;
    }

    public Artist verified(Boolean verified) {
        this.setVerified(verified);
        return this;
    }

    public void setVerified(Boolean verified) {
        this.verified = verified;
    }

    public Instant getCreatedAt() {
        return this.createdAt;
    }

    public Artist createdAt(Instant createdAt) {
        this.setCreatedAt(createdAt);
        return this;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Set<Song> getSongses() {
        return this.songses;
    }

    public void setSongses(Set<Song> songs) {
        if (this.songses != null) {
            this.songses.forEach(i -> i.removeArtists(this));
        }
        if (songs != null) {
            songs.forEach(i -> i.addArtists(this));
        }
        this.songses = songs;
    }

    public Artist songses(Set<Song> songs) {
        this.setSongses(songs);
        return this;
    }

    public Artist addSongs(Song song) {
        this.songses.add(song);
        song.getArtistses().add(this);
        return this;
    }

    public Artist removeSongs(Song song) {
        this.songses.remove(song);
        song.getArtistses().remove(this);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and
    // setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Artist)) {
            return false;
        }
        return getId() != null && getId().equals(((Artist) o).getId());
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
        return "Artist{" +
                "id=" + getId() +
                ", name='" + getName() + "'" +
                ", bio='" + getBio() + "'" +
                ", image='" + getImage() + "'" +
                ", country='" + getCountry() + "'" +
                ", verified='" + getVerified() + "'" +
                ", createdAt='" + getCreatedAt() + "'" +
                "}";
    }
}
