import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

console.log('[Routes] Loading app routes...');

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/auth/login',
    pathMatch: 'full'
  },
  {
    path: 'auth',
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
    path: 'help',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/help/help.page').then(m => m.HelpPage)
  },
  {
    path: 'privacy',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/privacy/privacy.page').then(m => m.PrivacyPage)
  },
  {
    path: 'terms',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/terms/terms.page').then(m => m.TermsPage)
  },
  {
    path: '**',
    redirectTo: '/auth/login'
  }
];
