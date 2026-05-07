import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { AccountService } from 'app/core/auth/account.service';

@Component({
  selector: 'jhi-dashboard-admin',
  templateUrl: './dashboard-admin.html',
  styleUrl: './dashboard-admin.scss',
  imports: [RouterLink, FaIconComponent],
})
export default class DashboardAdmin {
  readonly account = inject(AccountService).account;
}
