import { Component, OnInit, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Data, ParamMap, Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';

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
import { LikeDeleteDialog } from '../delete/like-delete-dialog';
import { ILike } from '../like.model';
import { LikeService } from '../service/like.service';
import { PlayerService } from 'app/layouts/player-bar/player.service';
import { ISong } from 'app/entities/song/song.model';
import { AddToPlaylistService } from 'app/entities/playlist/service/add-to-playlists.service';
import { ApplicationConfigService } from 'app/core/config/application-config.service';

@Component({
  selector: 'jhi-like',
  templateUrl: './like.html',
  styleUrls: ['./like.scss'],
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
    DatePipe,
  ],
})
export class Like implements OnInit {
  subscription: Subscription | null = null;
  readonly likes = signal<ILike[]>([]);

  sortState = sortStateSignal({});

  readonly router = inject(Router);
  protected readonly likeService = inject(LikeService);
  // eslint-disable-next-line @typescript-eslint/member-ordering
  readonly isLoading = this.likeService.likesResource.isLoading;
  protected readonly activatedRoute = inject(ActivatedRoute);
  protected readonly appConfig = inject(ApplicationConfigService);

  protected readonly sortService = inject(SortService);
  protected modalService = inject(NgbModal);
  protected readonly player = inject(PlayerService);
  protected readonly addToPlaylistService = inject(AddToPlaylistService);
  constructor() {
    effect(() => {
      this.likes.set(this.fillComponentAttributesFromResponseBody([...this.likeService.likes()]));
    });
  }

  trackId = (item: ILike): number => this.likeService.getLikeIdentifier(item);
  playSong(like: ILike): void {
    if (!like.song) return;
    this.player.playSong(like.song as ISong, this.likes() as ISong[]);
  }
  ngOnInit(): void {
    this.subscription = combineLatest([this.activatedRoute.queryParamMap, this.activatedRoute.data])
      .pipe(
        tap(([params, data]) => this.fillComponentAttributeFromRoute(params, data)),
        tap(() => {
          if (this.likes().length === 0) {
            this.load();
          }
        }),
      )
      .subscribe();
  }

  delete(like: ILike): void {
    const modalRef = this.modalService.open(LikeDeleteDialog, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.like = like;
    // unsubscribe not needed because closed completes on modal close
    modalRef.closed
      .pipe(
        filter(reason => reason === ITEM_DELETED_EVENT),
        tap(() => this.load()),
      )
      .subscribe();
  }
  getCoverUrl(song: ISong | null | undefined): string {
    if (!song?.coverImage) return '';
    if (song.coverImage.startsWith('http')) return song.coverImage;
    const path = song.coverImage.replace(/^\/uploads\//, '');
    const base = window.location.port === '4200' ? 'http://localhost:8080' : window.location.origin;
    return `${base}/uploads/${path}`;
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
  openAddToPlaylist(like: ILike): void {
    if (!like.song) return;
    this.addToPlaylistService.openDialog(like.song.id);
  }
  protected refineData(data: ILike[]): ILike[] {
    const { predicate, order } = this.sortState();
    return predicate && order ? data.sort(this.sortService.startSort({ predicate, order })) : data;
  }

  protected fillComponentAttributesFromResponseBody(data: ILike[]): ILike[] {
    return this.refineData(data);
  }

  protected queryBackend(): void {
    const queryObject: any = {
      sort: this.sortService.buildSortParam(this.sortState()),
    };
    this.likeService.likesParams.set(queryObject);
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
