import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

import { AccountService } from 'app/core/auth/account.service';

@Component({
  selector: 'jhi-home',
  templateUrl: './home.html',
  styleUrl: './home.scss',
  imports: [RouterLink, FaIconComponent],
})
export default class Home implements OnInit {
  public readonly account = inject(AccountService).account;
  private readonly router = inject(Router);
  private readonly accountService = inject(AccountService);

  ngOnInit(): void {
    this.accountService.identity().subscribe(account => {
      if (account) {
        const roles = account.authorities ?? [];
        if (roles.includes('ROLE_ADMIN')) {
          this.router.navigate(['/dashboard-admin']);
        } else if (roles.includes('ROLE_EDITOR') || roles.includes('ROLE_ARTIST')) {
          this.router.navigate(['/dashboard-editor']);
        } else {
          this.router.navigate(['/dashboard-user']);
        }
      }
    });
  }

  get greeting(): string {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Buenos días';
    if (hour >= 12 && hour < 20) return 'Buenas tardes';
    return 'Buenas noches';
  }

  login(): void {
    this.router.navigate(['/login']);
  }
}
