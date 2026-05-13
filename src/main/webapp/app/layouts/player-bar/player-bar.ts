import { Component, inject, signal } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { LyricsService } from 'app/core/service/lyrics.service';
import { FormatDurationPipe } from './FormatDuration';
import { PlayerService } from './player.service';

@Component({
  selector: 'jhi-player-bar',
  templateUrl: './player-bar.html',
  styleUrl: './player-bar.scss',
  imports: [FaIconComponent, FormatDurationPipe],
})
export default class PlayerBar {
  readonly player = inject(PlayerService);
  private readonly lyricsService = inject(LyricsService);

  readonly showLyrics = signal(false);
  readonly letras = signal('');
  readonly cargandoLetras = signal(false);

  private lastLyricsKey = '';

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

    const song = this.player.currentSong();
    const title = song?.title?.trim() ?? '';
    const artist = song?.artist?.name?.trim() ?? '';

    if (!title || !artist) {
      this.letras.set('Selecciona una canción');
      this.cargandoLetras.set(false);
      this.lastLyricsKey = '';
      return;
    }

    const lyricsKey = `${artist}::${title}`;
    if (this.letras() && this.lastLyricsKey === lyricsKey) return;

    this.cargandoLetras.set(true);
    this.letras.set('');
    this.lastLyricsKey = lyricsKey;
    this.lyricsService.getLyrics(artist, title).subscribe(texto => {
      this.letras.set(texto);
      this.cargandoLetras.set(false);
    });
  }
}
