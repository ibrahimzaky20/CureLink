import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthServiceService } from '../services/auth/auth-service.service';

export const donorGuard: CanActivateFn = () => {
  const auth   = inject(AuthServiceService);
  const router = inject(Router);

  const user = auth.currentUser();
  if (user?.role === 'donor') return true;

  router.navigate(['/auth/login']);
  return false;
};

export const institutionGuard: CanActivateFn = () => {
  const auth   = inject(AuthServiceService);
  const router = inject(Router);

  const user = auth.currentUser();
  if (user?.role === 'institution') return true;

  router.navigate(['/auth/login']);
  return false;
};

export const superadminGuard: CanActivateFn = () => {
  const auth   = inject(AuthServiceService);
  const router = inject(Router);

  const user = auth.currentUser();
  if (user?.role === 'superadmin') return true;

  router.navigate(['/auth/login']);
  return false;
};
