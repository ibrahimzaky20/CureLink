import { CanActivateFn, Router } from '@angular/router';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AuthServiceService } from '../services/auth/auth-service.service';

export const donorGuard: CanActivateFn = () => {
  if (!isPlatformBrowser(inject(PLATFORM_ID))) return true;

  const auth   = inject(AuthServiceService);
  const router = inject(Router);

  const user = auth.currentUser();
  if (user?.role === 'donor') return true;

  router.navigate(['/auth/login']);
  return false;
};

export const institutionGuard: CanActivateFn = () => {
  if (!isPlatformBrowser(inject(PLATFORM_ID))) return true;

  const auth   = inject(AuthServiceService);
  const router = inject(Router);

  const user = auth.currentUser();
  if (user?.role === 'institution') return true;

  router.navigate(['/auth/login']);
  return false;
};

export const superadminGuard: CanActivateFn = () => {
  if (!isPlatformBrowser(inject(PLATFORM_ID))) return true;

  const auth   = inject(AuthServiceService);
  const router = inject(Router);

  const user = auth.currentUser();
  if (user?.role === 'admin' || user?.role === 'superadmin') return true;

  router.navigate(['/auth/login']);
  return false;
};

export const superadminOnlyGuard: CanActivateFn = () => {
  if (!isPlatformBrowser(inject(PLATFORM_ID))) return true;

  const auth   = inject(AuthServiceService);
  const router = inject(Router);

  const user = auth.currentUser();
  if (user?.role === 'superadmin') return true;

  router.navigate(['/for-admin']);
  return false;
};
