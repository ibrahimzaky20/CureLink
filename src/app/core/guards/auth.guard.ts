import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthServiceService } from '../services/auth/auth-service.service';
import { map, catchError, of } from 'rxjs';

export const donorGuard: CanActivateFn = () => {
  const auth   = inject(AuthServiceService);
  const router = inject(Router);

  const cached = auth.currentUser();
  if (cached) {
    if (cached.role === 'donor') return true;
    router.navigate(['/auth/login']);
    return false;
  }

  return auth.me().pipe(
    map(res => {
      const user = res?.data?.user;
      if (user?.role === 'donor') return true;
      router.navigate(['/auth/login']);
      return false;
    }),
    catchError(() => {
      router.navigate(['/auth/login']);
      return of(false);
    })
  );
};

export const institutionGuard: CanActivateFn = () => {
  const auth   = inject(AuthServiceService);
  const router = inject(Router);

  const cached = auth.currentUser();
  if (cached) {
    if (cached.role === 'institution') return true;
    router.navigate(['/auth/login']);
    return false;
  }

  return auth.me().pipe(
    map(res => {
      const user = res?.data?.user;
      if (user?.role === 'institution') return true;
      router.navigate(['/auth/login']);
      return false;
    }),
    catchError(() => {
      router.navigate(['/auth/login']);
      return of(false);
    })
  );
};
