import { Component, OnInit, inject, input, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { HttpClient } from '@angular/common/http';

import { Alert } from 'app/shared/alert/alert';
import { AlertError } from 'app/shared/alert/alert-error';
import { FormatMediumDatePipe } from 'app/shared/date';
import { TranslateDirective } from 'app/shared/language';
import { TranslateModule } from '@ngx-translate/core';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { IAlbum } from '../album.model';
import { ISong } from 'app/entities/song/song.model';
import { SongService } from 'app/entities/song/service/song.service';
import { AccountService } from 'app/core/auth/account.service';
import { PlayerService } from 'app/layouts/player-bar/player.service';
import HasAnyAuthorityDirective from 'app/shared/auth/has-any-authority.directive';

@Component({
  selector: 'jhi-album-detail',
  templateUrl: './album-detail.html',
  styleUrls: ['./album-detail.scss'],
  imports: [
    FontAwesomeModule,
    Alert,
    AlertError,
    TranslateDirective,
    TranslateModule,
    RouterLink,
    FormatMediumDatePipe,
    HasAnyAuthorityDirective,
  ],
})
export class AlbumDetail implements OnInit {
  readonly album = input<IAlbum | null>(null);

  readonly albumSongs = signal<ISong[]>([]);
  readonly allMySongs = signal<ISong[]>([]);
  readonly showAddPanel = signal(false);
  readonly searchTerm = signal('');

  readonly availableSongs = computed(() => {
    const albumSongIds = new Set(this.albumSongs().map(s => s.id));
    const term = this.searchTerm().toLowerCase();

    return this.allMySongs().filter(
      s => !albumSongIds.has(s.id) && (!s.album || !s.album.id) && (!term || s.title?.toLowerCase().includes(term)),
    );
  });
  protected readonly accountService = inject(AccountService);
  private readonly http = inject(HttpClient);
  private readonly songService = inject(SongService);
  private readonly appConfig = inject(ApplicationConfigService);
  protected readonly player = inject(PlayerService);

  ngOnInit(): void {
    const album = this.album();
    if (album?.id) {
      this.loadAlbumSongs(album.id);
      this.loadMySongs();
    }
  }

  previousState(): void {
    globalThis.history.back();
  }

  toggleAddPanel(): void {
    this.showAddPanel.update(v => !v);
  }

  onSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }
  isOnlyUser(): boolean {
    return this.accountService.hasAnyAuthority(['ROLE_USER']) && !this.accountService.hasAnyAuthority(['ROLE_ADMIN', 'ROLE_EDITOR']);
  }

  isEditorOrAdmin(): boolean {
    return this.accountService.hasAnyAuthority(['ROLE_ADMIN', 'ROLE_EDITOR']);
  }
  formatDuration(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }
  playSong(song: any): void {
    this.player.playSong(song, this.albumSongs());
  }
  addSongToAlbum(song: ISong): void {
    const album = this.album();
    if (!album) return;

    const updated: ISong = { ...song, album: { id: album.id } };
    this.songService.update(updated).subscribe({
      next: savedSong => {
        this.albumSongs.update(songs => [...songs, savedSong]);
        this.allMySongs.update(songs => songs.filter(s => s.id !== song.id));
      },
      error: err => console.error('Error añadiendo canción', err),
    });
  }

  removeSongFromAlbum(song: ISong): void {
    const updated: ISong = { ...song, album: null };
    this.songService.update(updated).subscribe({
      next: savedSong => {
        this.albumSongs.update(songs => songs.filter(s => s.id !== song.id));
        this.allMySongs.update(songs => [...songs, savedSong]);
      },
      error: err => console.error('Error quitando canción', err),
    });
  }

  toggleSongActive(song: ISong): void {
    this.songService.toggleActive(song.id).subscribe({
      next: updatedSong => {
        this.albumSongs.update(songs => songs.map(s => (s.id === updatedSong.id ? updatedSong : s)));
      },
      error: err => console.error('Error cambiando estado de canción', err),
    });
  }

  private loadAlbumSongs(albumId: number): void {
    const url = this.appConfig.getEndpointFor(`api/songs/by-album/${albumId}`);
    this.http.get<ISong[]>(url).subscribe({
      next: songs => this.albumSongs.set(songs),
      error: err => console.error('Error cargando canciones del álbum', err),
    });
  }

  private loadMySongs(): void {
    this.songService.query({ size: 200 }).subscribe({
      next: res => this.allMySongs.set(res.body ?? []),
      error: err => console.error('Error cargando canciones', err),
    });
  }
}
