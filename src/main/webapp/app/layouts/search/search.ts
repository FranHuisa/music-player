import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { SongService } from 'app/entities/song/service/song.service';
import { ArtistService } from 'app/entities/artist/service/artist.service';
import { AlbumService } from 'app/entities/album/service/album.service';
import { ISong } from 'app/entities/song/song.model';
import { IArtist } from 'app/entities/artist/artist.model';
import { IAlbum } from 'app/entities/album/album.model';
import { PlayerService } from '../player-bar/player.service';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'jhi-search',
  standalone: true,
  imports: [FaIconComponent, RouterLink],
  templateUrl: './search.html',
  styleUrl: './search.scss',
})
export default class SearchComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly songService = inject(SongService);
  private readonly artistService = inject(ArtistService);
  private readonly albumService = inject(AlbumService);
  readonly player = inject(PlayerService);
  private readonly http = inject(HttpClient);

  readonly query = signal('');
  readonly songs = signal<ISong[]>([]);
  readonly artists = signal<IArtist[]>([]);
  readonly albums = signal<IAlbum[]>([]);
  readonly isLoading = signal(false);
  readonly likedSongs = signal<number[]>([]);

  constructor() {
    this.loadLikes();
    this.route.queryParamMap.subscribe(params => {
      const q = params.get('q') ?? '';
      this.query.set(q);
      if (q.trim()) this.search(q.trim());
      else {
        this.songs.set([]);
        this.artists.set([]);
        this.albums.set([]);
      }
    });
  }

  private loadLikes(): void {
    this.http.get<any[]>('/api/likes/my').subscribe({
      next: res => this.likedSongs.set(res.map(l => l.song.id)),
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
    });
  }

  hasResults(): boolean {
    return this.songs().length > 0 || this.artists().length > 0 || this.albums().length > 0;
  }

  private search(q: string): void {
    this.isLoading.set(true);
    let completed = 0;
    const checkDone = () => {
      if (++completed === 3) this.isLoading.set(false);
    };

    // Canciones
    this.songService.query({ 'title.contains': q, 'active.equals': true, size: 20 }).subscribe({
      next: res => {
        this.songs.set(res.body ?? []);
        checkDone();
      },
      error: () => {
        this.songs.set([]);
        checkDone();
      },
    });

    // Artistas
    this.artistService.query({ 'name.contains': q, size: 10 }).subscribe({
      next: res => {
        this.artists.set(res.body ?? []);
        checkDone();
      },
      error: () => {
        this.artists.set([]);
        checkDone();
      },
    });

    this.http.get<any[]>(`/api/albums/search?title=${encodeURIComponent(q)}&size=100`).subscribe({
      next: res => {
        this.albums.set(res);
        checkDone();
      },
      error: () => {
        this.albums.set([]);
        checkDone();
      },
    });
  }
}
