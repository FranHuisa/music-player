import { AfterViewInit, Component, ElementRef, OnInit, inject, signal, viewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

import { AccountService } from 'app/core/auth/account.service';
import { LoginService } from 'app/login/login.service';
import { TranslateDirective } from 'app/shared/language';
import { catchError } from 'rxjs/internal/operators/catchError';
import { SongService } from 'app/entities/song/service/song.service';
import { PlayService } from 'app/entities/play/service/play.service';
import { PlayerService } from 'app/layouts/player-bar/player.service';
import { EMPTY } from 'rxjs/internal/observable/empty';
import { switchMap } from 'rxjs/internal/operators/switchMap';

@Component({
  selector: 'jhi-login',
  imports: [TranslateDirective, TranslateModule, ReactiveFormsModule, RouterLink, FaIconComponent],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export default class Login implements OnInit, AfterViewInit {
  username = viewChild.required<ElementRef>('username');

  readonly authenticationError = signal(false);
  private readonly playerService = inject(PlayerService);
  private readonly playService = inject(PlayService);
  private readonly songService = inject(SongService);

  loginForm = new FormGroup({
    username: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    rememberMe: new FormControl(false, { nonNullable: true, validators: [Validators.required] }),
  });

  private readonly accountService = inject(AccountService);
  private readonly loginService = inject(LoginService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.accountService.identity().subscribe(() => {
      if (this.accountService.isAuthenticated()) {
        this.router.navigate(['']);
      }
    });
  }
  ngAfterViewInit(): void {
    this.username().nativeElement.focus();
  }
  login(): void {
    this.loginService.login(this.loginForm.getRawValue()).subscribe({
      next: () => {
        this.authenticationError.set(false);
        this.accountService.identity().subscribe(account => {
          this.restoreLastSong();
          const roles = account?.authorities ?? [];
          if (roles.includes('ROLE_ADMIN')) {
            this.router.navigate(['/dashboard-admin']);
          } else if (roles.includes('ROLE_EDITOR')) {
            this.router.navigate(['/dashboard-editor']);
          } else {
            this.router.navigate(['/dashboard-user']);
          }
        });
      },
      error: () => this.authenticationError.set(true),
    });
  }
  private restoreLastSong(): void {
    this.playService
      .findLast()
      .pipe(
        switchMap(play => {
          if (!play?.song?.id) return EMPTY;
          return this.songService.find(play.song.id);
        }),
        catchError(() => EMPTY),
      )
      .subscribe(song => {
        if (song) {
          this.playerService.loadOnly(song);
        }
      });
  }
}
