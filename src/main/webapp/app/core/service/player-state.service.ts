import { Injectable, signal, computed } from '@angular/core';
import { ISong } from 'app/entities/song/song.model';
import { IArtist } from 'app/entities/artist/artist.model';

export interface PlayerSong {
  song: ISong;
  artistNames: string[];
}

@Injectable({ providedIn: 'root' })
export class PlayerStateService {
  readonly currentSong = signal<PlayerSong | null>(null);
  readonly isPlaying = signal(false);
  readonly progress = signal(0);
  readonly volume = signal(70);
  readonly isMuted = signal(false);
  readonly isShuffle = signal(false);
  readonly isRepeat = signal(false);

  readonly songTitle = computed(() => this.currentSong()?.song.title ?? 'No hay canción');
  readonly artistDisplay = computed(() => {
    const names = this.currentSong()?.artistNames;
    if (!names || names.length === 0) return 'Selecciona una canción';
    return names.join(', ');
  });
  readonly hasLyrics = computed(() => {
    const lyrics = this.currentSong()?.song.lyrics;
    return !!lyrics && lyrics.trim().length > 0;
  });

  setSong(song: ISong, artistNames?: string[]): void {
    const names = artistNames ?? this.extractArtistNames(song);
    this.currentSong.set({ song, artistNames: names });
    this.progress.set(0);
    this.isPlaying.set(true);
  }

  togglePlay(): void {
    this.isPlaying.update(v => !v);
  }

  toggleShuffle(): void {
    this.isShuffle.update(v => !v);
  }

  toggleRepeat(): void {
    this.isRepeat.update(v => !v);
  }

  toggleMute(): void {
    this.isMuted.update(v => !v);
  }

  setVolume(value: number): void {
    this.volume.set(value);
    if (value > 0) this.isMuted.set(false);
  }

  setProgress(value: number): void {
    this.progress.set(value);
  }

  private extractArtistNames(song: ISong): string[] {
    const artists = song.artistses as Pick<IArtist, 'id' | 'name'>[] | null | undefined;
    if (!artists || artists.length === 0) return [];
    return artists.map(a => a.name ?? `Artista #${a.id}`).filter(Boolean);
  }
}
