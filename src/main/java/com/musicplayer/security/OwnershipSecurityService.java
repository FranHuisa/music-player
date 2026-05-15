package com.musicplayer.security;

import com.musicplayer.domain.Album;
import com.musicplayer.domain.Artist;
import com.musicplayer.domain.Playlist;
import com.musicplayer.domain.Song;
import org.springframework.stereotype.Service;

@Service
public class OwnershipSecurityService {

    public boolean isAdmin() {
        return SecurityUtils.hasCurrentUserAnyOfAuthorities("ROLE_ADMIN");
    }

    public boolean isEditor() {
        return SecurityUtils.hasCurrentUserAnyOfAuthorities("ROLE_EDITOR");
    }

    public boolean isUser() {
        return SecurityUtils.hasCurrentUserAnyOfAuthorities("ROLE_USER");
    }

    public boolean canAccessSong(Song song) {
        if (isAdmin()) return true;

        if (!isEditor()) return false;

        return song.getArtist() != null && song.getArtist().getUser() != null && song.getArtist().getUser().getLogin().equals(getLogin());
    }

    public boolean canManageMusicContent() {
        return isAdmin() || isEditor();
    }

    public String getLogin() {
        return SecurityUtils.getCurrentUserLogin().orElse("");
    }

    public boolean canAccessArtist(Artist artist) {
        if (isAdmin()) return true;

        if (!isEditor()) return false;

        return artist.getUser() != null && artist.getUser().getLogin().equals(getLogin());
    }

    public boolean canAccessAlbum(Album album) {
        if (isAdmin()) return true;

        if (!isEditor()) return false;

        return (
            album.getArtist() != null && album.getArtist().getUser() != null && album.getArtist().getUser().getLogin().equals(getLogin())
        );
    }

    public boolean canAccessPlaylist(Playlist playlist) {
        if (isAdmin()) return true;

        if (!isUser() && !isEditor()) return false;

        return playlist.getUser() != null && playlist.getUser().getLogin().equals(getLogin());
    }
}
