import { Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslateModule } from '@ngx-translate/core';

import { DataUtils } from 'app/core/util/data-util.service';
import { Alert } from 'app/shared/alert/alert';
import { AlertError } from 'app/shared/alert/alert-error';
import { FormatMediumDatetimePipe } from 'app/shared/date';
import { TranslateDirective } from 'app/shared/language';
import { IArtist } from '../artist.model';
import { FormatDurationPipe } from 'app/layouts/player-bar/FormatDuration';
import { UpperCasePipe } from '@angular/common';
import { ISong } from 'app/entities/song/song.model';

@Component({
  selector: 'jhi-artist-detail',
  templateUrl: './artist-detail.html',
  styleUrl: './artist-detail.scss',
  imports: [
    FontAwesomeModule,
    Alert,
    AlertError,
    TranslateDirective,
    TranslateModule,
    RouterLink,
    FormatMediumDatetimePipe,
    FormatDurationPipe,
    UpperCasePipe,
  ],
})
export class ArtistDetail {
  readonly artist = input<IArtist | null>(null);

  protected dataUtils = inject(DataUtils);

  byteSize(base64String: string): string {
    return this.dataUtils.byteSize(base64String);
  }

  openFile(base64String: string, contentType: string | null | undefined): void {
    this.dataUtils.openFile(base64String, contentType);
  }

  previousState(): void {
    globalThis.history.back();
  }

  formatDuration(seconds: number): string {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }
  getSongAlbumTitle(song: any): string | null {
    return song?.album?.title ?? null;
  }
}
