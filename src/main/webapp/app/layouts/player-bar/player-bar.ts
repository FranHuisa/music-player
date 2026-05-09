import { Component, DestroyRef, computed, effect, inject, signal } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { Subscription } from 'rxjs';

import { LyricsService } from 'app/core/service/lyrics.service';
import { ISong } from 'app/entities/song/song.model';
import { CoverImageUrlPipe } from 'app/shared/media';
import { FormatDurationPipe } from './FormatDuration';
import { PlayerService } from './player.service';

@Component({
  selector: 'jhi-player-bar',
  templateUrl: './player-bar.html',
  styleUrl: './player-bar.scss',
  imports: [FaIconComponent, FormatDurationPipe, CoverImageUrlPipe],
})
export default class PlayerBar {
  readonly player = inject(PlayerService);
  private readonly lyricsService = inject(LyricsService);
  private readonly destroyRef = inject(DestroyRef);

  private lyricsSubscription: Subscription | null = null;
  private lastSongId: number | null = null;

  readonly showLyrics = signal(false);
  readonly letras = signal('');
  readonly cargandoLetras = signal(false);
  readonly lyricsError = signal(false);

  readonly artistLabel = computed(() => {
    const song = this.player.currentSong();
    const artists = song?.artistses as Array<{ id?: number; name?: string }> | null | undefined;
    if (!artists || artists.length === 0) return 'Selecciona una canción';
    return artists
      .map(a => a?.name ?? (a?.id != null ? `Artista #${a.id}` : ''))
      .filter(Boolean)
      .join(', ');
  });

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.lyricsSubscription?.unsubscribe();
    });

    effect(() => {
      const currentSong = this.player.currentSong();
      const songId = currentSong?.id ?? null;
      if (this.showLyrics() && songId !== this.lastSongId) {
        this.lastSongId = songId;
        this.letras.set('');
        this.lyricsError.set(false);
        this.loadLyrics();
      }
    });
  }

  togglePlay(): void {
    this.player.toggle();
  }
  toggleShuffle(): void {
    this.player.toggleShuffle();
  }
  toggleRepeat(): void {
    this.player.toggleRepeat();
  }
  toggleMute(): void {
    this.player.toggleMute();
  }

  setVolume(event: Event): void {
    this.player.setVolume(Number((event.target as HTMLInputElement).value));
  }

  setProgress(event: Event): void {
    this.player.seek(Number((event.target as HTMLInputElement).value));
  }

  toggleLyrics(): void {
    if (this.showLyrics()) {
      this.showLyrics.set(false);
      return;
    }
    this.showLyrics.set(true);
    this.loadLyrics();
  }

  private loadLyrics(): void {
    this.lyricsSubscription?.unsubscribe();
    this.cargandoLetras.set(true);
    this.lyricsError.set(false);

    const currentSong = this.player.currentSong();
    this.lastSongId = currentSong?.id ?? null;

    if (!currentSong) {
      this.letras.set('No hay canción seleccionada.');
      this.cargandoLetras.set(false);
      this.lyricsError.set(true);
      return;
    }

    if (currentSong.lyrics && currentSong.lyrics.trim().length > 0) {
      this.letras.set(currentSong.lyrics.trim());
      this.cargandoLetras.set(false);
      this.lyricsError.set(false);
      return;
    }

    const artist = this.getArtistName(currentSong);
    const title = currentSong.title ?? '';
    if (!artist || !title) {
      this.letras.set('No hay artista disponible.');
      this.cargandoLetras.set(false);
      this.lyricsError.set(true);
      return;
    }

    this.lyricsSubscription = this.lyricsService.getLyrics(artist, title).subscribe(result => {
      this.cargandoLetras.set(false);
      if (result.found) {
        this.letras.set(result.lyrics);
        this.lyricsError.set(false);
      } else {
        this.letras.set(result.error ?? 'No se encontraron letras para esta canción.');
        this.lyricsError.set(true);
      }
    });
  }

  private getArtistName(song: ISong): string {
    const artists = song.artistses as Array<{ id?: number; name?: string }> | null | undefined;
    if (!artists || artists.length === 0) return '';
    const names = artists
      .map(a => a?.name ?? (a?.id != null ? `Artista #${a.id}` : ''))
      .filter(Boolean);
    return names.join(', ');
  }
}
