import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslateModule } from '@ngx-translate/core';

import { Alert } from 'app/shared/alert/alert';
import { AlertError } from 'app/shared/alert/alert-error';
import { FormatMediumDatetimePipe } from 'app/shared/date';
import { CoverImageUrlPipe } from 'app/shared/media';
import { TranslateDirective } from 'app/shared/language';
import { IPlaylist } from '../playlist.model';
import { PlayerService } from 'app/layouts/player-bar/player.service';
import { PlaylistSongService } from 'app/entities/playlist-song/service/playlist-song.service';
import { ISong } from 'app/entities/song/song.model';
import { IPlaylistSong } from 'app/entities/playlist-song/playlist-song.model';

@Component({
  selector: 'jhi-playlist-detail',
  templateUrl: './playlist-detail.html',
  styleUrls: ['./playlist-detail.scss'],
  imports: [FontAwesomeModule, Alert, AlertError, TranslateDirective, TranslateModule, RouterLink, FormatMediumDatetimePipe, CoverImageUrlPipe],
})
export class PlaylistDetail {
  private route = inject(ActivatedRoute);
  protected readonly player = inject(PlayerService);
  private readonly playlistSongService = inject(PlaylistSongService);

  playlist: IPlaylist | null = null;

  constructor() {
    this.route.data.subscribe(({ playlist }) => {
      this.playlist = playlist;
    });
  }

  previousState(): void {
    globalThis.history.back();
  }

  playPlaylist(): void {
    const songs = this.playlist?.playlistSongs?.map(ps => ps.song).filter(Boolean) as ISong[];
    if (songs?.length) {
      this.player.playSong(songs[0], songs);
    }
  }

  playSong(playlistSong: IPlaylistSong): void {
    if (!playlistSong.song) return;
    const queue = this.playlist?.playlistSongs?.map(ps => ps.song).filter(Boolean) as ISong[];
    this.player.playSong(playlistSong.song as ISong, queue);
  }

  removeSong(playlistSong: IPlaylistSong): void {
    if (!playlistSong.id) return;
    this.playlistSongService.delete(playlistSong.id).subscribe({
      next: () => {
        if (this.playlist?.playlistSongs) {
          this.playlist.playlistSongs = this.playlist.playlistSongs.filter(ps => ps.id !== playlistSong.id);
        }
      },
    });
  }
}
