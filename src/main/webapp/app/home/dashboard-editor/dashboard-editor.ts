import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

import dayjs from 'dayjs/esm';
import { AccountService } from 'app/core/auth/account.service';
import { AlbumService } from 'app/entities/album/service/album.service';
import { IAlbum } from 'app/entities/album/album.model';
import { ISong } from 'app/entities/song/song.model';
import { SongService } from 'app/entities/song/service/song.service';
import { FormatMediumDatePipe } from 'app/shared/date';

@Component({
  standalone: true,
  selector: 'jhi-dashboard-editor',
  imports: [RouterLink, FaIconComponent, FormatMediumDatePipe],
  templateUrl: './dashboard-editor.html',
  styleUrls: ['./dashboard-editor.scss'],
})
export default class DashboardEditorComponent implements OnInit {
  readonly account = inject(AccountService).account;
  readonly albumsCount = signal<number | null>(null);
  readonly songsCount = signal<number | null>(null);
  readonly upcomingAlbums = signal<IAlbum[]>([]);
  readonly upcomingCount = signal<number>(0);
  readonly recentSongs = signal<ISong[]>([]);
  readonly isLoading = signal(true);

  private readonly albumService = inject(AlbumService);
  private readonly songService = inject(SongService);

  ngOnInit(): void {
    this.loadOverview();
  }

  private loadOverview(): void {
    this.isLoading.set(true);
    this.albumService.query({ sort: 'releaseDate,asc', size: 200 }).subscribe({
      next: res => {
        const albums = res.body ?? [];
        const today = dayjs().startOf('day');
        const upcoming = albums.filter(album => album.releaseDate && album.releaseDate.isAfter(today));
        this.albumsCount.set(albums.length);
        this.upcomingCount.set(upcoming.length);
        this.upcomingAlbums.set(upcoming.slice(0, 5));
      },
      error: () => {
        this.albumsCount.set(0);
        this.upcomingCount.set(0);
        this.upcomingAlbums.set([]);
      },
    });

    this.songService.query({ sort: 'createdAt,desc', size: 200 }).subscribe({
      next: res => {
        const songs = res.body ?? [];
        this.songsCount.set(songs.length);
        this.recentSongs.set(songs.slice(0, 5));
        this.isLoading.set(false);
      },
      error: () => {
        this.songsCount.set(0);
        this.recentSongs.set([]);
        this.isLoading.set(false);
      },
    });
  }
}
