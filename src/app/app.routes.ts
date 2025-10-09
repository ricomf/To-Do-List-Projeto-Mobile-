import { Routes } from '@angular/router';
import { authGuard, noAuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/tabs',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    canActivate: [noAuthGuard],
    children: [
      {
        path: 'login',
        loadComponent: () => import('./pages/auth/login/login.page').then(m => m.LoginPage)
      },
      {
        path: 'register',
        loadComponent: () => import('./pages/auth/register/register.page').then(m => m.RegisterPage)
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'tabs',
    canActivate: [authGuard],
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
  },
  {
    path: 'task-form',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/task-form/task-form.page').then(m => m.TaskFormPage)
  },
  {
    path: 'task-form/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/task-form/task-form.page').then(m => m.TaskFormPage)
  },
  {
    path: '**',
    redirectTo: '/tabs'
  }
];
