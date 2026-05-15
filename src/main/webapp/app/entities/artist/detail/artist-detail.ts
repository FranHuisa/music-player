import { Component, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslateModule } from '@ngx-translate/core';

import { DataUtils } from 'app/core/util/data-util.service';
import { Alert } from 'app/shared/alert/alert';
import { AlertError } from 'app/shared/alert/alert-error';
import { FormatMediumDatetimePipe } from 'app/shared/date';
import { TranslateDirective } from 'app/shared/language';
import { IArtist } from '../artist.model';
import { FormatDurationPipe } from 'app/layouts/player-bar/FormatDuration';
import { UpperCasePipe } from '@angular/common';
import { ISong } from 'app/entities/song/song.model';
import { IPlay } from 'app/entities/play/play.model';
import { SongService } from 'app/entities/song/service/song.service';
import { Song } from 'app/entities/song/list/song';
import { PlayerService } from 'app/layouts/player-bar/player.service';
import { IAlbum } from 'app/entities/album/album.model';
import { AlbumService } from 'app/entities/album/service/album.service';

@Component({
  selector: 'jhi-artist-detail',
  templateUrl: './artist-detail.html',
  styleUrl: './artist-detail.scss',
  imports: [
    FontAwesomeModule,
    Alert,
    AlertError,
    TranslateDirective,
    TranslateModule,
    RouterLink,
    FormatMediumDatetimePipe,
    FormatDurationPipe,
    UpperCasePipe,
  ],
})
export class ArtistDetail {
  readonly artist = input<IArtist | null>(null);
  protected albumService = inject(AlbumService);
  protected http = inject(HttpClient);
  protected dataUtils = inject(DataUtils);
  protected songService = inject(SongService);
  protected playerService = inject(PlayerService);
  readonly albums = signal<IAlbum[]>([]);
  readonly likedSongs = signal<number[]>([]);
  readonly player = inject(PlayerService);

  ngOnInit(): void {
    this.loadLikes();

    const artist = this.artist();
    if (!artist?.id) return;

    this.albumService.queryByArtist(artist.id).subscribe(res => {
      this.albums.set(res ?? []);
    });
  }
  byteSize(base64String: string): string {
    return this.dataUtils.byteSize(base64String);
  }
  private loadLikes(): void {
    this.http.get<any[]>('/api/likes/my').subscribe({
      next: res => this.likedSongs.set(res.map(l => l.song.id)),
    });
  }
  openFile(base64String: string, contentType: string | null | undefined): void {
    this.dataUtils.openFile(base64String, contentType);
  }

  previousState(): void {
    globalThis.history.back();
  }
  formatDuration(seconds: number): string {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }
  getSongAlbumTitle(song: any): string | null {
    return song?.album?.title ?? null;
  }
  playSong(song: ISong): void {
    if (!song?.id) return;

    this.songService.find(song.id).subscribe(fullSong => {
      this.player.playSong(fullSong, [fullSong]);
    });
  }
  toggleLike(song: ISong): void {
    if (!song?.id) return;

    this.http.post(`/api/likes/toggle/${song.id}`, {}).subscribe({
      next: () => {
        this.likedSongs.update(list => (list.includes(song.id) ? list.filter(id => id !== song.id) : [...list, song.id]));
      },
    });
  }
}
