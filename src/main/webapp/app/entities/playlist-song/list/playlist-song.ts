import { Component, OnInit, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Data, ParamMap, Router, RouterLink } from '@angular/router';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbDropdown, NgbDropdownMenu, NgbDropdownToggle } from '@ng-bootstrap/ng-bootstrap/dropdown';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap/modal';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription, combineLatest, filter, tap } from 'rxjs';

import { DEFAULT_SORT_DATA, ITEM_DELETED_EVENT, SORT } from 'app/config/navigation.constants';
import { Alert } from 'app/shared/alert/alert';
import { AlertError } from 'app/shared/alert/alert-error';
import { FormatMediumDatetimePipe } from 'app/shared/date';
import { TranslateDirective } from 'app/shared/language';
import { SortByDirective, SortDirective, SortService, type SortState, sortStateSignal } from 'app/shared/sort';
import { PlaylistSongDeleteDialog } from '../delete/playlist-song-delete-dialog';
import { IPlaylistSong } from '../playlist-song.model';
import { PlaylistSongService } from '../service/playlist-song.service';

@Component({
  selector: 'jhi-playlist-song',
  templateUrl: './playlist-song.html',
  styleUrls: ['./playlist-song.scss'],
  imports: [
    RouterLink,
    FormsModule,
    FontAwesomeModule,
    NgbDropdown,
    NgbDropdownMenu,
    NgbDropdownToggle,
    AlertError,
    Alert,
    SortDirective,
    SortByDirective,
    TranslateDirective,
    TranslateModule,
    FormatMediumDatetimePipe,
  ],
})
export class PlaylistSong implements OnInit {
  subscription: Subscription | null = null;
  readonly playlistSongs = signal<IPlaylistSong[]>([]);

  sortState = sortStateSignal({});

  readonly router = inject(Router);
  protected readonly playlistSongService = inject(PlaylistSongService);
  // eslint-disable-next-line @typescript-eslint/member-ordering
  readonly isLoading = this.playlistSongService.playlistSongsResource.isLoading;
  protected readonly activatedRoute = inject(ActivatedRoute);
  protected readonly sortService = inject(SortService);
  protected modalService = inject(NgbModal);

  constructor() {
    effect(() => {
      this.playlistSongs.set(this.fillComponentAttributesFromResponseBody([...this.playlistSongService.playlistSongs()]));
    });
  }

  trackId = (item: IPlaylistSong): number => this.playlistSongService.getPlaylistSongIdentifier(item);

  ngOnInit(): void {
    this.subscription = combineLatest([this.activatedRoute.queryParamMap, this.activatedRoute.data])
      .pipe(
        tap(([params, data]) => this.fillComponentAttributeFromRoute(params, data)),
        tap(() => {
          if (this.playlistSongs().length === 0) {
            this.load();
          }
        }),
      )
      .subscribe();
  }

  delete(playlistSong: IPlaylistSong): void {
    const modalRef = this.modalService.open(PlaylistSongDeleteDialog, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.playlistSong = playlistSong;
    // unsubscribe not needed because closed completes on modal close
    modalRef.closed
      .pipe(
        filter(reason => reason === ITEM_DELETED_EVENT),
        tap(() => this.load()),
      )
      .subscribe();
  }

  load(): void {
    this.queryBackend();
  }

  navigateToWithComponentValues(event: SortState): void {
    this.handleNavigation(event);
  }

  protected fillComponentAttributeFromRoute(params: ParamMap, data: Data): void {
    this.sortState.set(this.sortService.parseSortParam(params.get(SORT) ?? data[DEFAULT_SORT_DATA]));
  }

  protected refineData(data: IPlaylistSong[]): IPlaylistSong[] {
    const { predicate, order } = this.sortState();
    return predicate && order ? data.sort(this.sortService.startSort({ predicate, order })) : data;
  }

  protected fillComponentAttributesFromResponseBody(data: IPlaylistSong[]): IPlaylistSong[] {
    return this.refineData(data);
  }

  protected queryBackend(): void {
    const queryObject: any = {
      sort: this.sortService.buildSortParam(this.sortState()),
    };
    this.playlistSongService.playlistSongsParams.set(queryObject);
  }

  protected handleNavigation(sortState: SortState): void {
    const queryParamsObj = {
      sort: this.sortService.buildSortParam(sortState),
    };

    this.router.navigate(['./'], {
      relativeTo: this.activatedRoute,
      queryParams: queryParamsObj,
    });
  }
}
