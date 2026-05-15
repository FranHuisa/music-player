import { Routes } from '@angular/router';

import { ASC } from 'app/config/navigation.constants';
import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { Authority } from 'app/shared/jhipster/constants';

import GenreResolve from './route/genre-routing-resolve.service';

const genreRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/genre').then(m => m.Genre),
    data: {
      authorities: [Authority.ADMIN],
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/genre-detail').then(m => m.GenreDetail),
    resolve: {
      genre: GenreResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/genre-update').then(m => m.GenreUpdate),
    resolve: {
      genre: GenreResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/genre-update').then(m => m.GenreUpdate),
    resolve: {
      genre: GenreResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default genreRoute;
