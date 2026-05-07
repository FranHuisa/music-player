import { HttpHeaders } from '@angular/common/http';
import { Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Data, ParamMap, Router, RouterLink } from '@angular/router';

import dayjs from 'dayjs/esm';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbDropdown, NgbDropdownMenu, NgbDropdownToggle } from '@ng-bootstrap/ng-bootstrap/dropdown';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap/modal';
import { NgbPagination } from '@ng-bootstrap/ng-bootstrap/pagination';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription, combineLatest, filter, tap } from 'rxjs';

import { DEFAULT_SORT_DATA, ITEM_DELETED_EVENT, SORT } from 'app/config/navigation.constants';
import { ITEMS_PER_PAGE, PAGE_HEADER, TOTAL_COUNT_RESPONSE_HEADER } from 'app/config/pagination.constants';
import { Alert } from 'app/shared/alert/alert';
import { AlertError } from 'app/shared/alert/alert-error';
import HasAnyAuthorityDirective from 'app/shared/auth/has-any-authority.directive';
import { FormatMediumDatePipe } from 'app/shared/date';
import { TranslateDirective } from 'app/shared/language';
import { ItemCount } from 'app/shared/pagination';
import { SortByDirective, SortDirective, SortService, type SortState, sortStateSignal } from 'app/shared/sort';
import { IAlbum } from '../album.model';
import { AlbumDeleteDialog } from '../delete/album-delete-dialog';
import { AlbumService } from '../service/album.service';

@Component({
  selector: 'jhi-album',
  templateUrl: './album.html',
  styleUrls: ['./album.scss'],
  imports: [
    RouterLink,
    FormsModule,
    FontAwesomeModule,
    NgbDropdown,
    NgbDropdownMenu,
    NgbDropdownToggle,
    AlertError,
    Alert,
    HasAnyAuthorityDirective,
    SortDirective,
    SortByDirective,
    TranslateDirective,
    TranslateModule,
    FormatMediumDatePipe,
    NgbPagination,
    ItemCount,
  ],
})
export class Album implements OnInit {
  subscription: Subscription | null = null;
  readonly albums = signal<IAlbum[]>([]);

  sortState = sortStateSignal({});

  readonly itemsPerPage = signal(ITEMS_PER_PAGE);
  readonly totalItems = signal(0);
  readonly page = signal(1);
  readonly upcomingOnly = signal(false);
  readonly visibleAlbums = computed(() => {
    const albums = this.albums();
    if (!this.upcomingOnly()) {
      return albums;
    }
    const today = dayjs().startOf('day');
    return albums.filter(album => album.releaseDate && album.releaseDate.isAfter(today));
  });

  readonly router = inject(Router);
  protected readonly albumService = inject(AlbumService);
  // eslint-disable-next-line @typescript-eslint/member-ordering
  readonly isLoading = this.albumService.albumsResource.isLoading;
  protected readonly activatedRoute = inject(ActivatedRoute);
  protected readonly sortService = inject(SortService);
  protected modalService = inject(NgbModal);

  constructor() {
    effect(() => {
      const headers = this.albumService.albumsResource.headers();
      if (headers) {
        this.fillComponentAttributesFromResponseHeader(headers);
      }
    });
    effect(() => {
      this.albums.set(this.fillComponentAttributesFromResponseBody([...this.albumService.albums()]));
    });
  }

  trackId = (item: IAlbum): number => this.albumService.getAlbumIdentifier(item);

  ngOnInit(): void {
    this.subscription = combineLatest([this.activatedRoute.queryParamMap, this.activatedRoute.data])
      .pipe(
        tap(([params, data]) => this.fillComponentAttributeFromRoute(params, data)),
        tap(() => this.load()),
      )
      .subscribe();
  }

  delete(album: IAlbum): void {
    const modalRef = this.modalService.open(AlbumDeleteDialog, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.album = album;
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
    this.handleNavigation(this.page(), event);
  }

  navigateToPage(page: number): void {
    this.handleNavigation(page, this.sortState());
  }

  protected fillComponentAttributeFromRoute(params: ParamMap, data: Data): void {
    const page = params.get(PAGE_HEADER);
    const upcoming = params.get('upcoming') === 'true';
    this.page.set(+(page ?? 1));
    this.sortState.set(this.sortService.parseSortParam(params.get(SORT) ?? data[DEFAULT_SORT_DATA]));
    this.upcomingOnly.set(upcoming);
    if (upcoming) {
      this.page.set(1);
    }
  }

  protected fillComponentAttributesFromResponseBody(data: IAlbum[]): IAlbum[] {
    return data;
  }

  protected fillComponentAttributesFromResponseHeader(headers: HttpHeaders): void {
    this.totalItems.set(Number(headers.get(TOTAL_COUNT_RESPONSE_HEADER)));
  }

  protected queryBackend(): void {
    const pageToLoad: number = this.page();
    const upcomingOnly = this.upcomingOnly();
    const queryObject: any = {
      page: upcomingOnly ? 0 : pageToLoad - 1,
      size: upcomingOnly ? 200 : this.itemsPerPage(),
      sort: this.sortService.buildSortParam(this.sortState()),
    };
    this.albumService.albumsParams.set(queryObject);
  }

  protected handleNavigation(page: number, sortState: SortState): void {
    const queryParamsObj = {
      page,
      size: this.itemsPerPage(),
      sort: this.sortService.buildSortParam(sortState),
    };

    this.router.navigate(['./'], {
      relativeTo: this.activatedRoute,
      queryParams: queryParamsObj,
    });
  }

  playAlbum(album: IAlbum): void {
    this.router.navigate(['/album', album.id, 'view']);
  }
}
