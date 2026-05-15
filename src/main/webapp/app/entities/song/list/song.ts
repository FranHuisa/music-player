import { HttpHeaders } from '@angular/common/http';
import { Component, OnInit, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Data, ParamMap, Router, RouterLink } from '@angular/router';
import { PlayerService } from 'app/layouts/player-bar/player.service';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbDropdown, NgbDropdownMenu, NgbDropdownToggle } from '@ng-bootstrap/ng-bootstrap/dropdown';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap/modal';
import { NgbPagination } from '@ng-bootstrap/ng-bootstrap/pagination';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription, combineLatest, filter, tap } from 'rxjs';

import { DEFAULT_SORT_DATA, ITEM_DELETED_EVENT, SORT } from 'app/config/navigation.constants';
import { ITEMS_PER_PAGE, PAGE_HEADER, TOTAL_COUNT_RESPONSE_HEADER } from 'app/config/pagination.constants';
import { DataUtils } from 'app/core/util/data-util.service';
import { Alert } from 'app/shared/alert/alert';
import { AlertError } from 'app/shared/alert/alert-error';
import HasAnyAuthorityDirective from 'app/shared/auth/has-any-authority.directive';
import { FormatMediumDatePipe, FormatMediumDatetimePipe } from 'app/shared/date';
import { TranslateDirective } from 'app/shared/language';
import { ItemCount } from 'app/shared/pagination';
import { SortByDirective, SortDirective, SortService, type SortState, sortStateSignal } from 'app/shared/sort';
import { SongDeleteDialog } from '../delete/song-delete-dialog';
import { SongService } from '../service/song.service';
import { ISong } from '../song.model';
import { AccountService } from 'app/core/auth/account.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'jhi-song',
  templateUrl: './song.html',
  styleUrl: './song.scss',
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
    FormatMediumDatetimePipe,
    FormatMediumDatePipe,
    NgbPagination,
    ItemCount,
  ],
})
export class Song implements OnInit {
  subscription: Subscription | null = null;

  readonly songs = signal<ISong[]>([]);
  readonly searchTerm = signal('');

  sortState = sortStateSignal({});

  readonly itemsPerPage = signal(ITEMS_PER_PAGE);
  readonly totalItems = signal(0);
  readonly page = signal(1);

  protected readonly player = inject(PlayerService);
  readonly router = inject(Router);
  protected readonly songService = inject(SongService);
  readonly isLoading = this.songService.isLoading;
  protected readonly activatedRoute = inject(ActivatedRoute);
  protected readonly sortService = inject(SortService);
  protected dataUtils = inject(DataUtils);
  protected modalService = inject(NgbModal);
  protected readonly accountService = inject(AccountService);

  constructor() {
    effect(() => {
      const songs = this.songService.songs();
      if (songs.length > 0) console.log('PRIMERA SONG coverImage:', songs[0].coverImage);
      this.songs.set(this.fillComponentAttributesFromResponseBody([...songs]));
    });

    effect(() => {
      const headers = this.songService.lastHeaders();
      if (headers) {
        this.fillComponentAttributesFromResponseHeader(headers);
      }
    });
  }

  trackId = (item: ISong): number => this.songService.getSongIdentifier(item);

  formatDuration(seconds: number | null | undefined): string {
    if (!seconds) return '—';
    const s = Math.abs(Math.round(seconds));
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }

  ngOnInit(): void {
    this.subscription = combineLatest([this.activatedRoute.queryParamMap, this.activatedRoute.data])
      .pipe(
        tap(([params, data]) => this.fillComponentAttributeFromRoute(params, data)),
        tap(() => this.load()),
      )
      .subscribe();
  }

  byteSize(base64String: string): string {
    return this.dataUtils.byteSize(base64String);
  }

  openFile(base64String: string, contentType: string | null | undefined): void {
    return this.dataUtils.openFile(base64String, contentType);
  }

  delete(song: ISong): void {
    Swal.fire({
      title: '¿Eliminar canción?',
      text: `Se eliminará "${song.title}"`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      confirmButtonColor: '#d33',
    }).then(result => {
      if (result.isConfirmed && song.id) {
        this.songService.delete(song.id).subscribe({
          next: () => {
            Swal.fire({
              title: 'Eliminada',
              text: 'La canción fue eliminada correctamente',
              icon: 'success',
              timer: 1500,
              showConfirmButton: false,
              color: '#ffffff',
              background: '#0f172a',
            });

            this.load();
          },
          error: () => {
            Swal.fire({
              title: 'Error',
              text: 'No se pudo eliminar la canción',
              icon: 'error',
              color: '#ffffff',
              background: '#0f172a',
            });
          },
        });
      }
    });
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
    this.page.set(+(page ?? 1));
    this.sortState.set(this.sortService.parseSortParam(params.get(SORT) ?? data[DEFAULT_SORT_DATA]));
  }

  protected fillComponentAttributesFromResponseBody(data: ISong[]): ISong[] {
    return data;
  }

  protected fillComponentAttributesFromResponseHeader(headers: HttpHeaders): void {
    this.totalItems.set(Number(headers.get(TOTAL_COUNT_RESPONSE_HEADER)));
  }

  protected queryBackend(): void {
    this.accountService.identity().subscribe(account => {
      if (!account) return;

      const isAdmin = account.authorities?.includes('ROLE_ADMIN') ?? false;
      const isEditor = account.authorities?.includes('ROLE_EDITOR') ?? false;

      this.songService.loadSongs(
        {
          page: this.page() - 1,
          size: this.itemsPerPage(),
          eagerload: true,
          sort: this.sortService.buildSortParam(this.sortState()),
        },
        isAdmin,
        isEditor,
      );
    });
  }

  playSong(song: ISong): void {
    this.player.playSong(song, this.songs());
  }

  toggleActive(song: ISong): void {
    this.songService.toggleActive(song.id).subscribe({
      next: updated => {
        this.songs.update(list => list.map(s => (s.id === updated.id ? updated : s)));
      },
    });
  }

  filteredSongs(): ISong[] {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.songs();
    return this.songs().filter(s => (s.title ?? '').toLowerCase().includes(term));
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
}
