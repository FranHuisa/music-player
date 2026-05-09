import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { SongService } from 'app/entities/song/service/song.service';
import { ISong } from 'app/entities/song/song.model';
import { PlayerService } from '../player-bar/player.service';
import { HttpClient } from '@angular/common/http';
import { ILike } from 'app/entities/like/like.model';
import { CoverImageUrlPipe } from 'app/shared/media';

@Component({
  selector: 'jhi-search',
  standalone: true,
  imports: [FaIconComponent, RouterLink, CoverImageUrlPipe],
  templateUrl: './search.html',
  styleUrl: './search.scss',
})
export default class SearchComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly songService = inject(SongService);
  readonly player = inject(PlayerService);
  private readonly http = inject(HttpClient);
  readonly query = signal('');
  readonly songs = signal<ISong[]>([]);
  readonly isLoading = signal(false);
  likedSongs = signal<number[]>([]);

  constructor() {
    this.loadLikes();
    this.route.queryParamMap.subscribe(params => {
      const q = params.get('q') ?? '';
      this.query.set(q);
      if (q.trim()) this.search(q.trim());
      else this.songs.set([]);
    });
  }
  private loadLikes(): void {
    this.http.get<any[]>('/api/likes/my').subscribe({
      next: res => {
        this.likedSongs.set(res.map(l => l.song.id));
      },
    });
  }
  playSong(song: ISong): void {
    this.player.playSong(song, this.songs());
  }
  toggleLike(song: ISong): void {
    this.http.post(`/api/likes/toggle/${song.id}`, {}).subscribe({
      next: () => {
        this.likedSongs.update(list => (list.includes(song.id) ? list.filter(id => id !== song.id) : [...list, song.id]));
      },
      error: err => console.error('Error like', err),
    });
  }
  private search(q: string): void {
    this.isLoading.set(true);
    this.songService.query({ 'title.contains': q, size: 50 }).subscribe({
      next: res => {
        this.songs.set(res.body ?? []);
        this.isLoading.set(false);
      },
      error: () => {
        this.songs.set([]);
        this.isLoading.set(false);
      },
    });
  }
}
