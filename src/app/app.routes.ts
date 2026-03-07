import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'about',
    loadComponent: () => import('./pages/about/about.component').then(m => m.AboutComponent)
  },
  {
    path: 'auth/login',
    loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'auth/register',
    loadComponent: () => import('./pages/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'for-donor',
    loadComponent: () => import('./pages/for-donor/for-donor.component').then(m => m.ForDonorComponent),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/for-donor/pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'my-donations',
        loadComponent: () => import('./pages/for-donor/pages/my-donations/my-donations.component').then(m => m.MyDonationsComponent)
      },
      {
        path: 'urgent-needs',
        loadComponent: () => import('./pages/for-donor/pages/urgent-needs/urgent-needs.component').then(m => m.UrgentNeedsComponent)
      },
      {
        path: 'notifications',
        loadComponent: () => import('./pages/for-donor/pages/notifications/notifications.component').then(m => m.NotificationsComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
