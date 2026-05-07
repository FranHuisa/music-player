import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { AccountService } from 'app/core/auth/account.service';
import SidebarService from './sidebar.service';

@Component({
  selector: 'jhi-sidebar',
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
  imports: [RouterLink, RouterLinkActive, FaIconComponent],
})
export default class Sidebar {
  protected readonly sidebarService = inject(SidebarService);
  protected readonly account = inject(AccountService).account;
}
