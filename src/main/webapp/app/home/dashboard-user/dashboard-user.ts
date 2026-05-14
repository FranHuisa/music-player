import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { AccountService } from 'app/core/auth/account.service';
import { PlayService } from 'app/entities/play/service/play.service';
import { PlaylistService } from 'app/entities/playlist/service/playlist.service';
import { IPlay } from 'app/entities/play/play.model';
import { IPlaylist } from 'app/entities/playlist/playlist.model';

@Component({
  standalone: true,
  selector: 'jhi-dashboard-user',
  imports: [RouterLink, FaIconComponent],
  templateUrl: './dashboard-user.html',
  styleUrls: ['./dashboard-user.scss'],
})
export default class DashboardUserComponent implements OnInit {
  readonly account = inject(AccountService).account;
  private readonly playService = inject(PlayService);
  private readonly playlistService = inject(PlaylistService);

  readonly recentPlays = signal<IPlay[]>([]);
  readonly recentPlaylists = signal<IPlaylist[]>([]);

  ngOnInit(): void {
    this.playService.findRecent().subscribe(plays => this.recentPlays.set(plays));

    this.playlistService.query({ size: 4, sort: 'createdAt,desc' }).subscribe(res => {
      this.recentPlaylists.set(res.body ?? []);
    });
  }

  getCoverUrl(url?: string | null): string {
    if (!url) return '';
    return url.startsWith('http') ? url : 'http://localhost:8080' + url;
  }

  get greeting(): string {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Buenos días';
    if (hour >= 12 && hour < 20) return 'Buenas tardes';
    return 'Buenas noches';
  }
}
