import { Routes } from '@angular/router';

import { ASC } from 'app/config/navigation.constants';
import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';

import PlaylistResolve from './route/playlist-routing-resolve.service';

const playlistRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/playlist').then(m => m.Playlist),
    data: {
      authorities: ['ROLE_USER'],
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/playlist-detail').then(m => m.PlaylistDetail),
    resolve: {
      playlist: PlaylistResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/playlist-update').then(m => m.PlaylistUpdate),
    resolve: {
      playlist: PlaylistResolve,
    },
    data: {
      authorities: ['ROLE_USER'],
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/playlist-update').then(m => m.PlaylistUpdate),
    resolve: {
      playlist: PlaylistResolve,
    },
    data: {
      authorities: ['ROLE_USER'],
    },
    canActivate: [UserRouteAccessService],
  },
];

export default playlistRoute;
