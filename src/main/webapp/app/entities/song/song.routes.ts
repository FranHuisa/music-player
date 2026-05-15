import { Routes } from '@angular/router';

import { ASC } from 'app/config/navigation.constants';
import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { Authority } from 'app/shared/jhipster/constants';

import SongResolve from './route/song-routing-resolve.service';

const songRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/song').then(m => m.Song),
    data: {
      authorities: [Authority.ADMIN, Authority.EDITOR],
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/song-detail').then(m => m.SongDetail),
    resolve: {
      song: SongResolve,
    },
    data: {
      authorities: [Authority.ADMIN, Authority.EDITOR],
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/song-update').then(m => m.SongUpdate),
    resolve: {
      song: SongResolve,
    },
    data: {
      authorities: [Authority.ADMIN, Authority.EDITOR],
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/song-update').then(m => m.SongUpdate),
    resolve: {
      song: SongResolve,
    },
    data: {
      authorities: [Authority.ADMIN, Authority.EDITOR],
    },
    canActivate: [UserRouteAccessService],
  },
];

export default songRoute;
