import { Component, signal, computed } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'jhi-player-bar',
  templateUrl: './player-bar.html',
  styleUrl: './player-bar.scss',
  imports: [FaIconComponent, RouterLink],
})
export default class PlayerBar {
  readonly isPlaying = signal(false);
  readonly isShuffle = signal(false);
  readonly isRepeat = signal(false);
  readonly volume = signal(70);
  readonly progress = signal(0);
  readonly isMuted = signal(false);

  readonly volumeIcon = computed(() => {
    if (this.isMuted() || this.volume() === 0) return 'volume-mute';
    if (this.volume() < 40) return 'volume-down';
    return 'volume-up';
  });

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

  setVolume(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.volume.set(Number(input.value));
    if (Number(input.value) > 0) {
      this.isMuted.set(false);
    }
  }

  setProgress(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.progress.set(Number(input.value));
  }
}
