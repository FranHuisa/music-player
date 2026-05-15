import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from 'app/core/auth/account.service';

import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { Authority } from 'app/shared/jhipster/constants';

import { TranslateDirective } from 'app/shared/language';

@Component({
  selector: 'jhi-error',
  imports: [TranslateDirective, TranslateModule],
  templateUrl: './error.html',
})
export default class Error implements OnInit, OnDestroy {
  readonly errorMessage = signal<string | undefined>(undefined);
  errorKey?: string;
  langChangeSubscription?: Subscription;
  private readonly accountService = inject(AccountService);
  private readonly router = inject(Router);
  private readonly translateService = inject(TranslateService);
  private readonly route = inject(ActivatedRoute);

  ngOnInit(): void {
    this.route.data.subscribe(routeData => {
      if (routeData.errorMessage) {
        this.errorKey = routeData.errorMessage;
        this.getErrorMessageTranslation();
        this.langChangeSubscription = this.translateService.onLangChange.subscribe(() => this.getErrorMessageTranslation());
      }
    });
  }

  ngOnDestroy(): void {
    if (this.langChangeSubscription) {
      this.langChangeSubscription.unsubscribe();
    }
  }
  goDashboard(): void {
    this.accountService.identity().subscribe(acc => {
      if (!acc) {
        this.router.navigate(['/login']);
        return;
      }

      const authorities = acc.authorities ?? [];

      if (authorities.includes(Authority.ADMIN)) {
        this.router.navigate(['/dashboard-admin']);
        return;
      }

      if (authorities.includes(Authority.EDITOR)) {
        this.router.navigate(['/dashboard-editor']);
        return;
      }

      if (authorities.includes(Authority.USER)) {
        this.router.navigate(['/dashboard-user']);
        return;
      }

      this.router.navigate(['/']);
    });
  }
  private getErrorMessageTranslation(): void {
    this.errorMessage.set('');
    if (this.errorKey) {
      this.translateService.get(this.errorKey).subscribe(translatedErrorMessage => {
        this.errorMessage.set(translatedErrorMessage);
      });
    }
  }
}
