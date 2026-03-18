import { Routes } from '@angular/router';
import { donorGuard, institutionGuard } from './core/guards/auth.guard';

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
    path: 'auth/register-institution',
    loadComponent: () => import('./pages/auth/register-institution/register-institution.component').then(m => m.RegisterInstitutionComponent)
  },
  {
    path: 'auth/verify-email',
    loadComponent: () => import('./pages/auth/verify-email/verify-email.component').then(m => m.VerifyEmailComponent)
  },
  {
    path: 'for-donor',
    canActivate: [donorGuard],
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
        path: 'new-donation',
        loadComponent: () => import('./pages/for-donor/pages/new-donation/new-donation.component').then(m => m.NewDonationComponent)
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
    path: 'for-institution',
    canActivate: [institutionGuard],
    loadComponent: () => import('./pages/for-institution/for-institution.component').then(m => m.ForInstitutionComponent),
    children: [
      {
        path: '',
        redirectTo: 'browse',
        pathMatch: 'full'
      },
      {
        path: 'browse',
        loadComponent: () => import('./pages/for-institution/pages/browse/browse.component').then(m => m.BrowseComponent)
      },
      {
        path: 'my-requests',
        loadComponent: () => import('./pages/for-institution/pages/my-requests/my-requests.component').then(m => m.MyRequestsComponent)
      },
      {
        path: 'institution-profile',
        loadComponent: () => import('./pages/for-institution/pages/institution-profile/institution-profile.component').then(m => m.InstitutionProfileComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
