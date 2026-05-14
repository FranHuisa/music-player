import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { ISong } from 'app/entities/song/song.model';
import { PlayService } from 'app/entities/play/service/play.service';
import { AccountService } from 'app/core/auth/account.service';
import dayjs from 'dayjs/esm';

@Injectable({ providedIn: 'root' })
export class PlayerService {
  private audio = new Audio();
  private readonly playService = inject(PlayService);
  private readonly accountService = inject(AccountService);

  readonly currentSong = signal<ISong | null>(null);
  readonly isPlaying = signal(false);
  readonly isShuffle = signal(false);
  readonly isRepeat = signal(false);
  readonly volume = signal(70);
  readonly isMuted = signal(false);
  readonly progress = signal(0);
  readonly currentTime = signal(0);
  readonly duration = signal(0);

  readonly volumeIcon = computed(() => {
    if (this.isMuted() || this.volume() === 0) return 'volume-mute';
    if (this.volume() < 40) return 'volume-down';
    return 'volume-up';
  });

  private queue: ISong[] = [];
  private queueIndex = 0;

  private activePlayId: number | null = null;
  private songStartTime: number | null = null;

  constructor() {
    effect(() => {
      this.audio.volume = this.isMuted() ? 0 : this.volume() / 100;
    });

    this.audio.addEventListener('timeupdate', () => {
      if (this.audio.duration) {
        this.progress.set((this.audio.currentTime / this.audio.duration) * 100);
        this.currentTime.set(Math.floor(this.audio.currentTime));
      }
    });

    this.audio.addEventListener('loadedmetadata', () => {
      this.duration.set(Math.floor(this.audio.duration));
    });

    this.audio.addEventListener('ended', () => {
      if (this.isRepeat()) {
        this.audio.currentTime = 0;
        this.audio.play();
      } else {
        this.next();
      }
    });

    this.audio.addEventListener('play', () => this.isPlaying.set(true));
    this.audio.addEventListener('pause', () => this.isPlaying.set(false));
  }

  playSong(song: ISong, queue: ISong[] = []): void {
    this.queue = queue.length ? queue : [song];
    this.queueIndex = this.queue.findIndex(s => s.id === song.id);
    if (this.queueIndex < 0) this.queueIndex = 0;
    this.loadAndPlay(song);
  }

  toggle(): void {
    this.isPlaying() ? this.audio.pause() : this.audio.play();
  }

  next(): void {
    if (!this.queue.length) return;
    if (this.isShuffle()) {
      this.queueIndex = Math.floor(Math.random() * this.queue.length);
    } else {
      this.queueIndex = (this.queueIndex + 1) % this.queue.length;
    }
    this.loadAndPlay(this.queue[this.queueIndex]);
  }

  prev(): void {
    if (!this.queue.length) return;
    if (this.audio.currentTime > 3) {
      this.audio.currentTime = 0;
      return;
    }
    this.queueIndex = (this.queueIndex - 1 + this.queue.length) % this.queue.length;
    this.loadAndPlay(this.queue[this.queueIndex]);
  }

  seek(percent: number): void {
    if (this.audio.duration) {
      this.audio.currentTime = (percent / 100) * this.audio.duration;
    }
  }

  setVolume(value: number): void {
    this.volume.set(value);
    if (value > 0) this.isMuted.set(false);
  }

  toggleMute(): void {
    this.isMuted.update(v => !v);
  }
  toggleShuffle(): void {
    this.isShuffle.update(v => !v);
  }
  toggleRepeat(): void {
    this.isRepeat.update(v => !v);
  }

  reset(): void {
    this.saveCurrentPlay();
    this.audio.pause();
    this.audio.src = '';
    this.currentSong.set(null);
    this.isPlaying.set(false);
    this.progress.set(0);
    this.currentTime.set(0);
    this.duration.set(0);
    this.queue = [];
    this.queueIndex = 0;
  }

  private loadAndPlay(song: ISong): void {
    this.saveCurrentPlay();

    this.currentSong.set(song);
    this.audio.src = (song.fileUrl ?? '').startsWith('/') ? song.fileUrl! : `/api/upload/stream/${encodeURIComponent(song.fileUrl ?? '')}`;
    this.audio.load();
    this.audio.play().catch(console.error);

    this.registerNewPlay(song);
  }

  private registerNewPlay(song: ISong): void {
    if (!this.accountService.account()) return;

    this.songStartTime = Date.now();

    this.playService
      .create({
        id: null,
        playedAt: dayjs(),
        durationListened: 0,
        song: { id: song.id },
      })
      .subscribe({
        next: play => {
          this.activePlayId = play.id;
        },
        error: err => console.error('Error registrando play:', err),
      });
  }
  loadOnly(song: ISong): void {
    this.currentSong.set(song);
    this.audio.src = (song.fileUrl ?? '').startsWith('/') ? song.fileUrl! : `/api/upload/stream/${encodeURIComponent(song.fileUrl ?? '')}`;
    this.audio.load();
  }
  private saveCurrentPlay(): void {
    if (!this.activePlayId || !this.songStartTime) return;

    const seconds = Math.floor((Date.now() - this.songStartTime) / 1000);

    this.playService
      .partialUpdate({
        id: this.activePlayId,
        durationListened: seconds,
      })
      .subscribe({
        error: err => console.error('Error guardando duración:', err),
      });

    this.activePlayId = null;
    this.songStartTime = null;
  }
  pause(): void {
    this.audio.pause();
  }
}
