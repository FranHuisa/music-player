import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export default class SidebarService {
  readonly isCollapsed = signal(false);

  toggle(): void {
    this.isCollapsed.update(v => !v);
  }
}
