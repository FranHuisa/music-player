import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslateModule } from '@ngx-translate/core';

import { Alert } from 'app/shared/alert/alert';
import { AlertError } from 'app/shared/alert/alert-error';
import { FormatMediumDatetimePipe } from 'app/shared/date';
import { TranslateDirective } from 'app/shared/language';
import { IPlaylist } from '../playlist.model';

@Component({
  selector: 'jhi-playlist-detail',
  templateUrl: './playlist-detail.html',
  styleUrls: ['./playlist-detail.scss'],
  imports: [FontAwesomeModule, Alert, AlertError, TranslateDirective, TranslateModule, RouterLink, FormatMediumDatetimePipe],
})
export class PlaylistDetail {
  private route = inject(ActivatedRoute);

  playlist: IPlaylist | null = null;

  constructor() {
    this.route.data.subscribe(({ playlist }) => {
      this.playlist = playlist;
    });
  }

  previousState(): void {
    globalThis.history.back();
  }
}
