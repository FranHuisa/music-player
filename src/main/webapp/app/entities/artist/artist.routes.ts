import { Routes } from '@angular/router';

import { ASC } from 'app/config/navigation.constants';
import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { Authority } from 'app/shared/jhipster/constants';

import ArtistResolve from './route/artist-routing-resolve.service';

const artistRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/artist').then(m => m.Artist),
    data: {
      defaultSort: `id,${ASC}`,
      authorities: [Authority.ADMIN, Authority.EDITOR],
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/artist-detail').then(m => m.ArtistDetail),
    resolve: {
      artist: ArtistResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/artist-update').then(m => m.ArtistUpdate),
    resolve: {
      artist: ArtistResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/artist-update').then(m => m.ArtistUpdate),
    resolve: {
      artist: ArtistResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default artistRoute;
