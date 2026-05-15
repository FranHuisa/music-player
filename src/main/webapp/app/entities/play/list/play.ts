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
import HasAnyAuthorityDirective from 'app/shared/auth/has-any-authority.directive';
import { FormatMediumDatetimePipe } from 'app/shared/date';
import { TranslateDirective } from 'app/shared/language';
import { SortByDirective, SortDirective, SortService, type SortState, sortStateSignal } from 'app/shared/sort';
import { PlayDeleteDialog } from '../delete/play-delete-dialog';
import { IPlay } from '../play.model';
import { PlayService } from '../service/play.service';

@Component({
  selector: 'jhi-play',
  templateUrl: './play.html',
  styleUrl: './play.scss',
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
  ],
})
export class Play implements OnInit {
  subscription: Subscription | null = null;
  readonly plays = signal<IPlay[]>([]);

  sortState = sortStateSignal({});

  readonly router = inject(Router);
  protected readonly playService = inject(PlayService);
  // eslint-disable-next-line @typescript-eslint/member-ordering
  readonly isLoading = this.playService.playsResource.isLoading;
  protected readonly activatedRoute = inject(ActivatedRoute);
  protected readonly sortService = inject(SortService);
  protected modalService = inject(NgbModal);

  constructor() {
    effect(() => {
      this.plays.set(this.fillComponentAttributesFromResponseBody([...this.playService.plays()]));
    });
  }

  trackId = (item: IPlay): number => this.playService.getPlayIdentifier(item);

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
        tap(() => {
          if (this.plays().length === 0) {
            this.load();
          }
        }),
      )
      .subscribe();
  }

  delete(play: IPlay): void {
    const modalRef = this.modalService.open(PlayDeleteDialog, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.play = play;
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

  protected refineData(data: IPlay[]): IPlay[] {
    const { predicate, order } = this.sortState();
    return predicate && order ? data.sort(this.sortService.startSort({ predicate, order })) : data;
  }

  protected fillComponentAttributesFromResponseBody(data: IPlay[]): IPlay[] {
    return this.refineData(data);
  }

  protected queryBackend(): void {
    const queryObject: any = {
      sort: this.sortService.buildSortParam(this.sortState()),
    };
    this.playService.playsParams.set(queryObject);
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
