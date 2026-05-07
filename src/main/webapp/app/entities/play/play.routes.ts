import { Routes } from '@angular/router';

import { ASC } from 'app/config/navigation.constants';
import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { Authority } from 'app/shared/jhipster/constants';

import PlayResolve from './route/play-routing-resolve.service';

const playRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/play').then(m => m.Play),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/play-detail').then(m => m.PlayDetail),
    resolve: {
      play: PlayResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/play-update').then(m => m.PlayUpdate),
    resolve: {
      play: PlayResolve,
    },
    data: {
      authorities: [Authority.ADMIN],
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/play-update').then(m => m.PlayUpdate),
    resolve: {
      play: PlayResolve,
    },
    data: {
      authorities: [Authority.ADMIN],
    },
    canActivate: [UserRouteAccessService],
  },
];

export default playRoute;
