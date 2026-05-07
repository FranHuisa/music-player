import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { Authority } from 'app/shared/jhipster/constants';

import { errorRoute } from './layouts/error/error.route';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home/home').then(m => m.default),
    pathMatch: 'full',
  },

  {
    path: 'login',
    loadComponent: () => import('./login/login').then(m => m.default),
    title: 'login.title',
  },

  {
    path: 'dashboard-user',
    loadComponent: () => import('./home/dashboard-user/dashboard-user').then(m => m.default),
    canActivate: [UserRouteAccessService],
    data: {
      authorities: [Authority.USER],
    },
  },

  {
    path: 'dashboard-editor',
    loadComponent: () => import('./home/dashboard-editor/dashboard-editor').then(m => m.default),
    canActivate: [UserRouteAccessService],
    data: {
      authorities: [Authority.ADMIN, Authority.EDITOR, Authority.ARTIST],
    },
  },

  {
    path: 'dashboard-admin',
    loadComponent: () => import('./home/dashboard-admin/dashboard-admin').then(m => m.default),
    canActivate: [UserRouteAccessService],
    data: {
      authorities: [Authority.ADMIN],
    },
    title: 'Panel Administrador',
  },

  {
    path: 'admin',
    data: {
      authorities: [Authority.ADMIN],
    },
    canActivate: [UserRouteAccessService],
    loadChildren: () => import('./admin/admin.routes'),
  },

  {
    path: 'account',
    loadChildren: () => import('./account/account.route'),
  },

  {
    path: '',
    loadChildren: () => import('./entities/entity.routes'),
  },

  {
    path: '',
    loadComponent: () => import('./layouts/navbar/navbar').then(m => m.Navbar),
    outlet: 'navbar',
  },

  ...errorRoute,
];

export default routes;
