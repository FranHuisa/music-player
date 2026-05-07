import { Component, OnInit, Renderer2, RendererFactory2, inject, computed } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import dayjs from 'dayjs/esm';
import { AppPageTitleStrategy } from 'app/app-page-title-strategy';
import { AccountService } from 'app/core/auth/account.service';
import { Authority } from 'app/shared/jhipster/constants';
import Footer from '../footer/footer';
import PageRibbon from '../profiles/page-ribbon';
import PlayerBar from '../player-bar/player-bar';
import Sidebar from '../sidebar/sidebar';
import SidebarService from '../sidebar/sidebar.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'jhi-main',
  templateUrl: './main.html',
  providers: [AppPageTitleStrategy],
  standalone: true,
  imports: [RouterOutlet, Footer, PageRibbon, Sidebar, PlayerBar],
})
export default class Main implements OnInit {
  public readonly sidebarService = inject(SidebarService);
  private readonly router = inject(Router);
  private readonly appPageTitleStrategy = inject(AppPageTitleStrategy);
  private readonly accountService = inject(AccountService);
  private readonly translateService = inject(TranslateService);
  private readonly rootRenderer = inject(RendererFactory2);
  private readonly renderer: Renderer2;

  protected readonly account = inject(AccountService).account;

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map((event: any) => event.urlAfterRedirects),
    ),
  );

  public readonly canShowSidebar = computed(() => {
    const userAccount = this.account();
    const url = this.currentUrl() || '';
    const isPublicPage = url === '/' || url === '/login' || url.includes('/home');

    if (!userAccount || isPublicPage) {
      return false;
    }
    return userAccount.authorities.includes(Authority.USER);
  });

  public readonly canShowPlayerBar = computed(() => {
    const userAccount = this.account();
    const url = this.currentUrl() || '';
    const isPublicPage = url === '/' || url === '/login' || url.includes('/home');

    if (!userAccount || isPublicPage) {
      return false;
    }

    return userAccount.authorities.includes(Authority.USER);
  });

  constructor() {
    this.renderer = this.rootRenderer.createRenderer(document.querySelector('html'), null);
  }

  ngOnInit(): void {
    this.accountService.identity().subscribe();

    this.translateService.onLangChange.subscribe((langChangeEvent: LangChangeEvent) => {
      this.appPageTitleStrategy.updateTitle(this.router.routerState.snapshot);
      dayjs.locale(langChangeEvent.lang);
      this.renderer.setAttribute(document.querySelector('html'), 'lang', langChangeEvent.lang);
    });
  }
}
