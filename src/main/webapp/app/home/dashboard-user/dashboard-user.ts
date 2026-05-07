import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

import { AccountService } from 'app/core/auth/account.service';

@Component({
  standalone: true,
  selector: 'jhi-dashboard-user',
  imports: [RouterLink, FaIconComponent],
  templateUrl: './dashboard-user.html',
  styleUrls: ['./dashboard-user.scss'],
})
export default class DashboardUserComponent {
  readonly account = inject(AccountService).account;

  readonly featuredMixes = [
    {
      title: 'Mix del día',
      subtitle: 'Una selección que se ajusta a lo que escuchas',
      eyebrow: 'Diario',
      gradient: 'linear-gradient(135deg, #450af5 0%, #1db954 100%)',
      route: ['/playlist'],
    },
    {
      title: 'Descubrimiento semanal',
      subtitle: 'Canciones nuevas elegidas para ti cada semana',
      eyebrow: 'Cada lunes',
      gradient: 'linear-gradient(135deg, #e8115b 0%, #f59b23 100%)',
      route: ['/song'],
    },
    {
      title: 'Lanzamientos de la semana',
      subtitle: 'Lo más reciente de los artistas de Streamify',
      eyebrow: 'Nuevo',
      gradient: 'linear-gradient(135deg, #0d4ea6 0%, #5179c8 100%)',
      route: ['/album'],
    },
    {
      title: 'Tus favoritas',
      subtitle: 'Las canciones a las que diste me gusta',
      eyebrow: 'Tu biblioteca',
      gradient: 'linear-gradient(135deg, #8d67ab 0%, #6c4a8a 100%)',
      route: ['/like'],
    },
  ];

  readonly styles: { label: string; icon: string }[] = [
    { label: 'Pop', icon: 'music' },
    { label: 'Rock', icon: 'guitar' },
    { label: 'Electrónica', icon: 'fire' },
    { label: 'Indie', icon: 'compact-disc' },
    { label: 'Latina', icon: 'fire' },
    { label: 'Hip-Hop', icon: 'music' },
  ];

  get greeting(): string {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Buenos días';
    if (hour >= 12 && hour < 20) return 'Buenas tardes';
    return 'Buenas noches';
  }
}
