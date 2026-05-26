import { Component, inject } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { PlayerService } from './player.service';
import { FormatDurationPipe } from './FormatDuration';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'jhi-player-bar',
  templateUrl: './player-bar.html',
  styleUrl: './player-bar.scss',
  imports: [FaIconComponent, FormatDurationPipe, JsonPipe],
})
export default class PlayerBar {
  readonly player = inject(PlayerService);

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
}
