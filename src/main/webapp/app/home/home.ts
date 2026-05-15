import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

import { AccountService } from 'app/core/auth/account.service';

@Component({
  selector: 'jhi-home',
  templateUrl: './home.html',
  styleUrl: './home.scss',
  imports: [RouterLink, FaIconComponent],
})
export default class Home {
  public readonly account = inject(AccountService).account;
  private readonly router = inject(Router);

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
