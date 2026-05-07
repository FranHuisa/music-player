import { Routes } from '@angular/router';

import { ASC } from 'app/config/navigation.constants';
import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { Authority } from 'app/shared/jhipster/constants';

import AlbumResolve from './route/album-routing-resolve.service';

const albumRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/album').then(m => m.Album),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/album-detail').then(m => m.AlbumDetail),
    resolve: {
      album: AlbumResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/album-update').then(m => m.AlbumUpdate),
    resolve: {
      album: AlbumResolve,
    },
    data: {
      authorities: [Authority.ADMIN, Authority.EDITOR, Authority.ARTIST],
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/album-update').then(m => m.AlbumUpdate),
    resolve: {
      album: AlbumResolve,
    },
    data: {
      authorities: [Authority.ADMIN, Authority.EDITOR, Authority.ARTIST],
    },
    canActivate: [UserRouteAccessService],
  },
];

export default albumRoute;
